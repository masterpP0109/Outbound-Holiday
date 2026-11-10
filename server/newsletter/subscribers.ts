import { db } from '../db';
import type { SubscriberRecord, SubscriberStats } from './types';
import type { SubscriberQueryInput } from '../../shared/newsletter-schema';
import { HttpError } from '../security';

export async function listSubscribers(query: SubscriberQueryInput): Promise<{
  subscribers: SubscriberRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = Math.max(1, query.page);
  const limit = Math.min(200, Math.max(1, query.limit));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.status && query.status !== 'all') {
    where.status = query.status;
  }
  if (query.search && query.search.trim()) {
    where.email = { contains: query.search.trim().toLowerCase(), mode: 'insensitive' };
  }

  const [total, items] = await Promise.all([
    db.subscription.count({ where }),
    db.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    subscribers: items as SubscriberRecord[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1
  };
}

export async function getSubscriberStats(): Promise<SubscriberStats> {
  const [total, subscribed, pending, unsubscribed] = await Promise.all([
    db.subscription.count(),
    db.subscription.count({ where: { status: 'subscribed' } }),
    db.subscription.count({ where: { status: 'pending' } }),
    db.subscription.count({ where: { status: 'unsubscribed' } })
  ]);

  return { total, subscribed, pending, unsubscribed };
}

export async function updateSubscriberStatus(id: string, status: 'subscribed' | 'pending' | 'unsubscribed'): Promise<SubscriberRecord> {
  const sub = await db.subscription.findUnique({ where: { id } });
  if (!sub) {
    throw new HttpError(404, 'Subscriber not found.');
  }

  const data: any = { status };
  if (status === 'subscribed' && !sub.confirmedAt) {
    data.confirmedAt = new Date();
  }
  if (status === 'unsubscribed') {
    data.unsubscribedAt = new Date();
  }

  const updated = await db.subscription.update({
    where: { id },
    data
  });

  return updated as SubscriberRecord;
}

export async function deleteSubscriber(id: string): Promise<{ deleted: boolean }> {
  const sub = await db.subscription.findUnique({ where: { id } });
  if (!sub) {
    throw new HttpError(404, 'Subscriber not found.');
  }

  // Delete associated notifications or nullify
  await db.notification.deleteMany({ where: { subscriptionId: id } });
  await db.subscription.delete({ where: { id } });

  return { deleted: true };
}

export async function exportSubscribers(format: 'csv' | 'json' = 'csv', statusFilter?: string): Promise<{
  data: string;
  contentType: string;
  filename: string;
}> {
  const where: any = {};
  if (statusFilter && statusFilter !== 'all') {
    where.status = statusFilter;
  }

  const subscribers = await db.subscription.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  if (format === 'json') {
    return {
      data: JSON.stringify(subscribers, null, 2),
      contentType: 'application/json',
      filename: `outbound-subscribers-${timestamp}.json`
    };
  }

  // CSV generation with RFC-4180 escaping
  const headers = [
    'id',
    'email',
    'status',
    'consent_version',
    'consent_at',
    'confirmed_at',
    'unsubscribed_at',
    'created_at'
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = val instanceof Date ? val.toISOString() : String(val);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = subscribers.map(s => [
    escapeCsv(s.id),
    escapeCsv(s.email),
    escapeCsv(s.status),
    escapeCsv(s.consentVersion),
    escapeCsv(s.consentAt),
    escapeCsv(s.confirmedAt),
    escapeCsv(s.unsubscribedAt),
    escapeCsv(s.createdAt)
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\r\n');

  return {
    data: csv,
    contentType: 'text/csv; charset=utf-8',
    filename: `outbound-subscribers-${timestamp}.csv`
  };
}
