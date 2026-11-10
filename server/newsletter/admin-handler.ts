import type { Request, Response } from 'express';
import { z } from 'zod';
import { authenticated, HttpError } from '../security';
import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
  ScheduleCampaignSchema,
  SendTestEmailSchema,
  SubscriberQuerySchema,
  SubscriberStatusUpdateSchema
} from '../../shared/newsletter-schema';
import {
  listSubscribers,
  getSubscriberStats,
  exportSubscribers,
  updateSubscriberStatus,
  deleteSubscriber
} from './subscribers';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  scheduleCampaign,
  dispatchCampaign,
  cancelCampaign,
  sendTestEmail
} from './campaigns';
import { TEMPLATES, renderEmail, getTemplate } from './templates';
import { isLiveSendingEnabled } from './delivery';

export function verifyAdminAuth(req: Request) {
  const secret = process.env.ADMIN_API_KEY || process.env.CRON_SECRET || 'outbound-admin-dev-secret';
  const authHeader = req.headers.authorization;
  if (!authHeader || !authenticated(authHeader, 'Bearer ' + secret)) {
    throw new HttpError(401, 'Unauthorized administrative access.');
  }
}

export async function handleNewsletterAdmin(req: Request, res: Response, subpath: string): Promise<any> {
  verifyAdminAuth(req);

  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', 'http://local');
  const segments = subpath.split('/').filter(Boolean);

  // 1. Templates
  if (segments[0] === 'templates') {
    if (segments[1] === 'preview' && method === 'POST') {
      const body = req.body || {};
      const template = getTemplate(body.templateId || 'victoria-falls-editorial');
      const rendered = renderEmail({
        templateId: body.templateId,
        title: body.title || template.name,
        subject: body.subject || template.defaultSubject,
        previewText: body.previewText || template.defaultPreviewText,
        contentHtml: body.contentHtml || template.sampleContentHtml,
        contentText: body.contentText,
        variables: body.variables
      });
      return res.status(200).json(rendered);
    }
    if (!segments[1] && method === 'GET') {
      return res.status(200).json({ templates: TEMPLATES });
    }
  }

  // 2. Settings & System Readiness
  if (segments[0] === 'settings' && method === 'GET') {
    return res.status(200).json({
      smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      smtpHost: process.env.SMTP_HOST || 'not-configured',
      smtpPort: process.env.SMTP_PORT || '587',
      smtpUser: process.env.SMTP_USER || 'not-configured',
      emailProvider: process.env.EMAIL_PROVIDER || 'disabled',
      emailDeliveryMode: process.env.EMAIL_DELIVERY_MODE || 'disabled',
      newsletterProvider: process.env.NEWSLETTER_PROVIDER || 'self-hosted',
      newsletterSendingEnabled: process.env.NEWSLETTER_SENDING_ENABLED === 'true',
      isLiveSendingActive: isLiveSendingEnabled(),
      emailFrom: process.env.EMAIL_FROM || 'Outbound Holidays <travel@outboundholiday.com>',
      testRecipient: process.env.EMAIL_TEST_TO || 'not-configured',
      wordpressMigrationReady: true
    });
  }

  // 3. Subscribers
  if (segments[0] === 'subscribers') {
    // Stats
    if (segments[1] === 'stats' && method === 'GET') {
      const stats = await getSubscriberStats();
      return res.status(200).json(stats);
    }

    // Export
    if (segments[1] === 'export' && method === 'GET') {
      const format = (url.searchParams.get('format') ?? 'csv') as 'csv' | 'json';
      const status = url.searchParams.get('status') ?? undefined;
      const exported = await exportSubscribers(format, status);
      res.setHeader('Content-Type', exported.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
      return res.status(200).send(exported.data);
    }

    // Single Subscriber Actions: /subscribers/:id/...
    if (segments[1]) {
      const id = segments[1];
      if (segments[2] === 'status' && method === 'POST') {
        const input = SubscriberStatusUpdateSchema.parse(req.body);
        const updated = await updateSubscriberStatus(id, input.status);
        return res.status(200).json(updated);
      }
      if (!segments[2] && method === 'DELETE') {
        const result = await deleteSubscriber(id);
        return res.status(200).json(result);
      }
    }

    // List Subscribers
    if (!segments[1] && method === 'GET') {
      const params = Object.fromEntries(url.searchParams);
      const query = SubscriberQuerySchema.parse(params);
      const result = await listSubscribers(query);
      return res.status(200).json(result);
    }
  }

  // 4. Campaigns
  if (segments[0] === 'campaigns') {
    // List Campaigns
    if (!segments[1] && method === 'GET') {
      const page = Number(url.searchParams.get('page')) || 1;
      const limit = Number(url.searchParams.get('limit')) || 20;
      const status = url.searchParams.get('status') ?? undefined;
      const result = await listCampaigns({ page, limit, status });
      return res.status(200).json(result);
    }

    // Create Campaign
    if (!segments[1] && method === 'POST') {
      const input = CreateCampaignSchema.parse(req.body);
      const campaign = await createCampaign(input);
      return res.status(201).json(campaign);
    }

    // Single Campaign Operations: /campaigns/:id/...
    if (segments[1]) {
      const id = segments[1];

      // Test send
      if (segments[2] === 'test' && method === 'POST') {
        const input = SendTestEmailSchema.parse(req.body);
        const result = await sendTestEmail(id, input.email);
        return res.status(200).json(result);
      }

      // Schedule
      if (segments[2] === 'schedule' && method === 'POST') {
        const input = ScheduleCampaignSchema.parse(req.body);
        const scheduledAt = new Date(input.scheduledAt);
        const result = await scheduleCampaign(id, scheduledAt);
        return res.status(200).json(result);
      }

      // Dispatch
      if (segments[2] === 'dispatch' && method === 'POST') {
        const result = await dispatchCampaign(id);
        return res.status(200).json(result);
      }

      // Cancel
      if (segments[2] === 'cancel' && method === 'POST') {
        const result = await cancelCampaign(id);
        return res.status(200).json(result);
      }

      // Get single campaign
      if (!segments[2] && method === 'GET') {
        const campaign = await getCampaign(id);
        return res.status(200).json(campaign);
      }

      // Update campaign
      if (!segments[2] && (method === 'PUT' || method === 'PATCH')) {
        const input = UpdateCampaignSchema.parse(req.body);
        const updated = await updateCampaign(id, input);
        return res.status(200).json(updated);
      }

      // Delete campaign
      if (!segments[2] && method === 'DELETE') {
        const result = await deleteCampaign(id);
        return res.status(200).json(result);
      }
    }
  }

  throw new HttpError(404, `Newsletter administration endpoint not found: ${subpath}`);
}
