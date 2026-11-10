import { db } from '../db';
import type { CampaignRecord } from './types';
import type {
  CreateCampaignInput,
  UpdateCampaignInput
} from '../../shared/newsletter-schema';
import { HttpError } from '../security';
import { renderEmail, htmlToPlainText, getTemplate } from './templates';
import { sendSmtpEmail, getPublicBaseUrl } from './delivery';

export async function listCampaigns(query: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{
  campaigns: CampaignRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.status && query.status !== 'all') {
    where.status = query.status;
  }

  const [total, items] = await Promise.all([
    db.campaign.count({ where }),
    db.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    campaigns: items as CampaignRecord[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1
  };
}

export async function getCampaign(id: string): Promise<CampaignRecord & { deliveryBreakdown?: any }> {
  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      notifications: {
        select: {
          id: true,
          status: true,
          attempts: true,
          lastError: true,
          sentAt: true,
          createdAt: true
        },
        take: 50,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!campaign) {
    throw new HttpError(404, 'Campaign not found.');
  }

  return campaign as any;
}

export async function createCampaign(input: CreateCampaignInput): Promise<CampaignRecord> {
  const contentText = input.contentText?.trim() || htmlToPlainText(input.contentHtml);
  const template = getTemplate(input.templateId);

  const campaign = await db.campaign.create({
    data: {
      title: input.title,
      subject: input.subject,
      previewText: input.previewText || template.defaultPreviewText,
      templateId: input.templateId,
      contentHtml: input.contentHtml,
      contentText,
      status: 'draft'
    }
  });

  return campaign as CampaignRecord;
}

export async function updateCampaign(id: string, input: UpdateCampaignInput): Promise<CampaignRecord> {
  const existing = await db.campaign.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'Campaign not found.');
  }

  if (['sending', 'sent'].includes(existing.status)) {
    throw new HttpError(409, `Cannot edit campaign that is already in '${existing.status}' status.`);
  }

  const data: any = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.subject !== undefined) data.subject = input.subject;
  if (input.previewText !== undefined) data.previewText = input.previewText;
  if (input.templateId !== undefined) data.templateId = input.templateId;
  if (input.contentHtml !== undefined) {
    data.contentHtml = input.contentHtml;
    data.contentText = input.contentText?.trim() || htmlToPlainText(input.contentHtml);
  }
  if (input.status !== undefined) data.status = input.status;

  const updated = await db.campaign.update({
    where: { id },
    data
  });

  return updated as CampaignRecord;
}

export async function deleteCampaign(id: string): Promise<{ deleted: boolean }> {
  const existing = await db.campaign.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'Campaign not found.');
  }

  if (existing.status === 'sending') {
    throw new HttpError(409, 'Cannot delete a campaign that is currently sending.');
  }

  // Delete queued notifications for this campaign
  await db.notification.deleteMany({ where: { campaignId: id } });
  await db.campaign.delete({ where: { id } });

  return { deleted: true };
}

export async function scheduleCampaign(id: string, scheduledAt: Date): Promise<CampaignRecord> {
  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign) {
    throw new HttpError(404, 'Campaign not found.');
  }

  if (['sending', 'sent'].includes(campaign.status)) {
    throw new HttpError(409, `Cannot schedule campaign in '${campaign.status}' status.`);
  }

  if (scheduledAt.getTime() <= Date.now()) {
    throw new HttpError(422, 'Scheduled time must be in the future.');
  }

  const updated = await db.campaign.update({
    where: { id },
    data: {
      status: 'scheduled',
      scheduledAt
    }
  });

  return updated as CampaignRecord;
}

export async function dispatchCampaign(id: string): Promise<{
  campaign: CampaignRecord;
  recipientsQueued: number;
}> {
  return db.$transaction(async tx => {
    // Advisory lock for campaign dispatch
    await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))', 'campaign-dispatch:' + id);

    const campaign = await tx.campaign.findUnique({ where: { id } });
    if (!campaign) {
      throw new HttpError(404, 'Campaign not found.');
    }

    if (['sending', 'sent'].includes(campaign.status)) {
      throw new HttpError(409, `Campaign has already been dispatched (status: ${campaign.status}).`);
    }

    // 1. Find all active, confirmed subscribers
    const subscribers = await tx.subscription.findMany({
      where: { status: 'subscribed' },
      select: { id: true, email: true, tokenHash: true }
    });

    if (subscribers.length === 0) {
      const updated = await tx.campaign.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          totalRecipients: 0,
          sentCount: 0,
          failedCount: 0
        }
      });
      return { campaign: updated as CampaignRecord, recipientsQueued: 0 };
    }

    // 2. Queue delivery jobs in outbox
    const notifications = subscribers.map(sub => ({
      dedupeKey: `campaign:${campaign.id}:${sub.id}`,
      campaignId: campaign.id,
      subscriptionId: sub.id,
      kind: 'newsletter-campaign',
      payload: {
        campaignId: campaign.id,
        email: sub.email,
        subject: campaign.subject,
        previewText: campaign.previewText,
        html: campaign.contentHtml,
        text: campaign.contentText,
        templateId: campaign.templateId,
        title: campaign.title
      }
    }));

    await tx.notification.createMany({
      data: notifications,
      skipDuplicates: true
    });

    // 3. Mark campaign sending
    const updated = await tx.campaign.update({
      where: { id },
      data: {
        status: 'sending',
        totalRecipients: subscribers.length,
        sentCount: 0,
        failedCount: 0
      }
    });

    return {
      campaign: updated as CampaignRecord,
      recipientsQueued: subscribers.length
    };
  });
}

export async function cancelCampaign(id: string): Promise<CampaignRecord> {
  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign) {
    throw new HttpError(404, 'Campaign not found.');
  }

  // Cancel any pending notifications in outbox
  await db.notification.updateMany({
    where: {
      campaignId: id,
      status: { in: ['pending', 'failed'] }
    },
    data: { status: 'cancelled' }
  });

  const updated = await db.campaign.update({
    where: { id },
    data: { status: 'cancelled' }
  });

  return updated as CampaignRecord;
}

export async function sendTestEmail(campaignId: string, testRecipient: string): Promise<{
  success: boolean;
  recipient: string;
  providerResult: string;
}> {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    throw new HttpError(404, 'Campaign not found.');
  }

  const base = getPublicBaseUrl();
  const rendered = renderEmail({
    templateId: campaign.templateId,
    title: campaign.title,
    subject: '[TEST PREVIEW] ' + campaign.subject,
    previewText: campaign.previewText,
    contentHtml: campaign.contentHtml,
    contentText: campaign.contentText,
    variables: {
      email: testRecipient,
      unsubscribe_url: `${base}/newsletter-preview-sample-unsubscribe`
    }
  });

  const providerResult = await sendSmtpEmail({
    to: testRecipient,
    subject: '[TEST PREVIEW] ' + campaign.subject,
    html: rendered.html,
    text: rendered.text,
    dedupeKey: `test:${campaign.id}:${testRecipient}:${Date.now()}`
  });

  return {
    success: true,
    recipient: testRecipient,
    providerResult
  };
}

/**
 * Checks for scheduled campaigns that have reached their scheduledAt time
 * and automatically dispatches them. Called by outbox cron.
 */
export async function processScheduledCampaigns(): Promise<number> {
  const now = new Date();
  const dueCampaigns = await db.campaign.findMany({
    where: {
      status: 'scheduled',
      scheduledAt: { lte: now }
    },
    take: 5
  });

  let dispatchedCount = 0;
  for (const campaign of dueCampaigns) {
    try {
      await dispatchCampaign(campaign.id);
      dispatchedCount++;
    } catch (err) {
      console.error(`Failed to auto-dispatch scheduled campaign ${campaign.id}:`, err);
    }
  }

  return dispatchedCount;
}
