export type SubscriberStatus = 'pending' | 'subscribed' | 'unsubscribed';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'archived' | 'cancelled';

export interface SubscriberRecord {
  id: string;
  email: string;
  status: string;
  consentVersion: string;
  consentAt: Date;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriberStats {
  total: number;
  subscribed: number;
  pending: number;
  unsubscribed: number;
}

export interface CampaignRecord {
  id: string;
  title: string;
  subject: string;
  previewText: string | null;
  templateId: string;
  contentHtml: string;
  contentText: string;
  status: string;
  scheduledAt: Date | null;
  sentAt: Date | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  defaultSubject: string;
  defaultPreviewText: string;
  sampleContentHtml: string;
}
