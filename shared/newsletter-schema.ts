import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);

export const CampaignStatusEnum = z.enum([
  'draft',
  'scheduled',
  'sending',
  'sent',
  'archived',
  'cancelled'
]);

export const CreateCampaignSchema = z.object({
  title: text(200).min(2, 'Title must be at least 2 characters'),
  subject: text(200).min(2, 'Subject must be at least 2 characters'),
  previewText: text(250).optional(),
  templateId: text(100).default('victoria-falls-editorial'),
  contentHtml: z.string().min(5, 'Content HTML must be at least 5 characters'),
  contentText: z.string().optional()
}).strict();

export const UpdateCampaignSchema = z.object({
  title: text(200).min(2).optional(),
  subject: text(200).min(2).optional(),
  previewText: text(250).optional().nullable(),
  templateId: text(100).optional(),
  contentHtml: z.string().min(5).optional(),
  contentText: z.string().optional(),
  status: z.enum(['draft', 'archived', 'cancelled']).optional()
}).strict();

export const ScheduleCampaignSchema = z.object({
  scheduledAt: z.string().datetime({ message: 'Must be a valid ISO datetime string' })
}).strict();

export const SendTestEmailSchema = z.object({
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase())
}).strict();

export const SubscriberQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(25),
  status: z.enum(['all', 'subscribed', 'pending', 'unsubscribed']).default('all'),
  search: z.string().max(200).optional()
}).strict();

export const SubscriberStatusUpdateSchema = z.object({
  status: z.enum(['subscribed', 'pending', 'unsubscribed'])
}).strict();

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type ScheduleCampaignInput = z.infer<typeof ScheduleCampaignSchema>;
export type SendTestEmailInput = z.infer<typeof SendTestEmailSchema>;
export type SubscriberQueryInput = z.infer<typeof SubscriberQuerySchema>;
