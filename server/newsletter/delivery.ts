import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
import type { Notification } from '@prisma/client';
import { db } from '../db';
import { renderEmail } from './templates';
import { emailRecipient as recipient } from '../email-recipient';

const required = (key: string) => {
  const v = process.env[key];
  if (!v) throw new Error('Missing server configuration: ' + key);
  return v;
};

export function isLiveSendingEnabled(): boolean {
  return (
    process.env.NEWSLETTER_SENDING_ENABLED === 'true' &&
    process.env.EMAIL_DELIVERY_MODE === 'live'
  );
}

export function getPublicBaseUrl(): string {
  return (process.env.APP_URL ?? 'https://outboundholiday.com').replace(/\/$/, '');
}

export function getApiBaseUrl(): string {
  return (process.env.API_PUBLIC_BASE_URL ?? (getPublicBaseUrl() + '/api/v1')).replace(/\/$/, '');
}

/**
 * Sends an email using the configured SMTP transport.
 * Independent of frontend; portable to PHP PHPMailer / wp_mail().
 */
export async function sendSmtpEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  dedupeKey,
  headers
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  dedupeKey?: string;
  headers?: Record<string, string>;
}): Promise<string> {
  const provider = process.env.EMAIL_PROVIDER ?? 'disabled';
  const target = recipient(to, process.env, { testPreview: true });

  if (provider === 'disabled' || target.endsWith('.test') || process.env.NODE_ENV === 'test') {
    // In disabled / test / mock mode, safely record delivery without network failure
    return 'mock-delivery:' + createHash('sha256').update(target + subject + Date.now()).digest('hex').slice(0, 16);
  }

  if (provider === 'smtp') {
    const port = Number(required('SMTP_PORT'));
    if (![465, 587].includes(port)) {
      throw new Error('SMTP must use TLS port 465 or STARTTLS port 587.');
    }

    const transport = nodemailer.createTransport({
      host: required('SMTP_HOST'),
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user: required('SMTP_USER'),
        pass: required('SMTP_PASSWORD')
      },
      tls: { rejectUnauthorized: true },
      connectionTimeout: 15000,
      socketTimeout: 25000
    });

    try {
      const messageDomain = process.env.EMAIL_MESSAGE_ID_DOMAIN || 'outboundholiday.com';
      const messageIdKey = dedupeKey || (to + ':' + Date.now());
      const messageId = `<${createHash('sha256').update(messageIdKey).digest('hex')}@${messageDomain}>`;

      const info = await transport.sendMail({
        from: required('EMAIL_FROM'),
        to: target,
        replyTo: replyTo || process.env.TEAM_ENQUIRY_TO,
        subject,
        text,
        html,
        messageId,
        headers: headers || {}
      });

      if (!info.accepted?.length) {
        throw new Error('SMTP did not accept the recipient.');
      }
      return 'smtp:' + String(info.messageId);
    } finally {
      transport.close();
    }
  }

  if (provider === 'resend') {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + required('RESEND_API_KEY'),
        'content-type': 'application/json',
        ...(dedupeKey ? { 'Idempotency-Key': dedupeKey } : {})
      },
      body: JSON.stringify({
        from: required('EMAIL_FROM'),
        to: [to],
        subject,
        html,
        text,
        reply_to: replyTo || process.env.TEAM_ENQUIRY_TO
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error('Email provider request failed (' + response.status + ').');
    const result = await response.json();
    if (!result.id) throw new Error('Email provider returned no delivery ID.');
    return String(result.id);
  }

  throw new Error('Unsupported email provider: ' + provider);
}

/**
 * Delivers a single campaign notification from the outbox.
 * Checks subscriber consent and active status before sending (unsubscription suppression).
 */
export async function deliverCampaignNotification(job: Notification): Promise<string> {
  const p = job.payload as any;
  const campaignId = job.campaignId || p.campaignId;
  const subscriptionId = job.subscriptionId;

  // 1. Suppression check: subscriber must still exist and have status 'subscribed'
  if (subscriptionId) {
    const subscriber = await db.subscription.findUnique({ where: { id: subscriptionId } });
    if (!subscriber || subscriber.status !== 'subscribed') {
      // Mark notification cancelled because subscriber unsubscribed or was removed
      await updateCampaignCounts(campaignId, false);
      return 'cancelled-unsubscribed';
    }
  }

  // 2. Build personalized links
  const base = getPublicBaseUrl();
  const apiBase = getApiBaseUrl();
  const token = p.token || '';
  const unsubscribeUrl = token
    ? `${apiBase}/newsletter/unsubscribe?token=${token}`
    : `${base}/contact`;

  const rendered = renderEmail({
    templateId: p.templateId,
    title: p.title,
    subject: p.subject,
    previewText: p.previewText,
    contentHtml: p.html,
    contentText: p.text,
    variables: {
      email: p.email,
      unsubscribe_url: unsubscribeUrl
    }
  });

  // 3. Deliver safely
  // If live sending is NOT enabled, reroute to safe test recipient or log preview
  let targetEmail = p.email;
  if (!isLiveSendingEnabled()) {
    const testRecipient = process.env.EMAIL_TEST_TO;
    if (testRecipient) {
      targetEmail = testRecipient;
    } else {
      // Safe preview mode: complete without sending live spam
      await updateCampaignCounts(campaignId, true);
      return 'simulated-safe-mode';
    }
  }

  try {
    const result = await sendSmtpEmail({
      to: targetEmail,
      subject: (!isLiveSendingEnabled() ? '[TEST PREVIEW] ' : '') + p.subject,
      html: rendered.html,
      text: rendered.text,
      dedupeKey: job.dedupeKey,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    });

    await updateCampaignCounts(campaignId, true);
    return result;
  } catch (error) {
    await updateCampaignCounts(campaignId, false);
    throw error;
  }
}

/**
 * Updates campaign statistics and status when a job succeeds or fails.
 */
export async function updateCampaignCounts(campaignId: string | null | undefined, success: boolean) {
  if (!campaignId) return;

  try {
    const updated = await db.campaign.update({
      where: { id: campaignId },
      data: {
        sentCount: success ? { increment: 1 } : undefined,
        failedCount: !success ? { increment: 1 } : undefined
      }
    });

    // If all recipients have been processed, transition campaign to 'sent'
    if (updated.status === 'sending' && (updated.sentCount + updated.failedCount >= updated.totalRecipients)) {
      await db.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'sent',
          sentAt: new Date()
        }
      });
    }
  } catch {
    // Non-fatal if campaign was deleted
  }
}
