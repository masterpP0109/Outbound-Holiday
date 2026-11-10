import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { db } from '../server/db';
import {
  renderEmail,
  htmlToPlainText
} from '../server/newsletter/templates';
import {
  CreateCampaignSchema,
  ScheduleCampaignSchema,
  SendTestEmailSchema
} from '../shared/newsletter-schema';
import {
  listSubscribers,
  getSubscriberStats,
  exportSubscribers,
  updateSubscriberStatus
} from '../server/newsletter/subscribers';
import {
  createCampaign,
  getCampaign,
  updateCampaign,
  scheduleCampaign,
  dispatchCampaign,
  sendTestEmail
} from '../server/newsletter/campaigns';
import { deliverNotification } from '../server/providers';
import handler from '../server/handler';

const adminSecret = process.env.ADMIN_API_KEY || process.env.CRON_SECRET || 'outbound-admin-dev-secret';
const testRunId = randomUUID().slice(0, 8);
const testEmail1 = `news-${testRunId}-1@example.test`;
const testEmail2 = `news-${testRunId}-2@example.test`;
const createdCampaignIds: string[] = [];

async function adminRequest(path: string, method = 'GET', body?: unknown) {
  let status = 200;
  let value: any;
  const headers: Record<string, string> = {
    authorization: 'Bearer ' + adminSecret,
    origin: 'http://localhost:3000',
    'content-type': 'application/json'
  };
  const response = {
    setHeader() {},
    status(code: number) { status = code; return this; },
    json(v: unknown) { value = v; return this; },
    send(v: unknown) { value = v; return this; },
    end() { return this; }
  };
  await handler({
    url: '/api/v1/admin/newsletter/' + path,
    method,
    body,
    headers,
    query: {},
    socket: { remoteAddress: 'test-admin' }
  } as any, response as any);
  return { status, value };
}

after(async () => {
  // Clean up any test records
  const subs = await db.subscription.findMany({
    where: { email: { in: [testEmail1, testEmail2] } }
  });
  if (subs.length > 0) {
    const subIds = subs.map(s => s.id);
    await db.notification.deleteMany({
      where: {
        OR: [
          { subscriptionId: { in: subIds } },
          { campaignId: { in: createdCampaignIds } }
        ]
      }
    });
    await db.subscription.deleteMany({
      where: { id: { in: subIds } }
    });
  }
  if (createdCampaignIds.length > 0) {
    await db.notification.deleteMany({
      where: { campaignId: { in: createdCampaignIds } }
    });
    await db.campaign.deleteMany({
      where: { id: { in: createdCampaignIds } }
    });
  }
  await db.$disconnect();
});

test('email template rendering generates responsive branded HTML and clean text with variables', () => {
  const rendered = renderEmail({
    templateId: 'victoria-falls-editorial',
    title: 'Editorial Test Title',
    subject: 'Victoria Falls Secrets',
    previewText: 'Exclusive updates on the Zambezi river',
    contentHtml: '<h2>Welcome</h2><p>Here is a test paragraph with a <a href="https://example.com">link</a>.</p>',
    variables: {
      email: 'traveler@example.test',
      unsubscribe_url: 'https://example.com/unsub?t=123'
    }
  });

  assert.ok(rendered.html.includes('OUTBOUND HOLIDAYS'));
  assert.ok(rendered.html.includes('VICTORIA FALLS SPECIALISTS'));
  assert.ok(rendered.html.includes('Exclusive updates on the Zambezi river'));
  assert.ok(rendered.html.includes('https://example.com/unsub?t=123'));
  assert.ok(rendered.html.includes('traveler@example.test'));
  assert.ok(rendered.text.includes('OUTBOUND HOLIDAYS | VICTORIA FALLS'));
  assert.ok(rendered.text.includes('https://example.com/unsub?t=123'));

  // Test plain-text converter
  const plain = htmlToPlainText('<h3>Heading</h3><p>Line 1<br>Line 2</p><ul><li>Item A</li></ul>');
  assert.ok(plain.includes('Heading'));
  assert.ok(plain.includes('Line 1\nLine 2'));
  assert.ok(plain.includes('• Item A'));
});

test('newsletter schemas validate input strictly', () => {
  assert.throws(() => CreateCampaignSchema.parse({ title: 'a' }));
  const validCampaign = CreateCampaignSchema.parse({
    title: 'Spring Safari Update',
    subject: 'New Victoria Falls Itineraries',
    contentHtml: '<p>Complete story content goes here.</p>'
  });
  assert.equal(validCampaign.templateId, 'victoria-falls-editorial');

  assert.throws(() => ScheduleCampaignSchema.parse({ scheduledAt: 'not-a-date' }));
  const validSchedule = ScheduleCampaignSchema.parse({
    scheduledAt: new Date(Date.now() + 86400000).toISOString()
  });
  assert.ok(validSchedule.scheduledAt);

  assert.throws(() => SendTestEmailSchema.parse({ email: 'bad-email' }));
  const validTestEmail = SendTestEmailSchema.parse({ email: 'ADMIN@EXAMPLE.COM' });
  assert.equal(validTestEmail.email, 'admin@example.com');
});

test('newsletter admin endpoints require valid bearer authorization', async () => {
  let unauthorizedStatus = 200;
  const mockRes = {
    setHeader() {},
    status(c: number) { unauthorizedStatus = c; return this; },
    json() { return this; }
  };
  await handler({
    url: '/api/v1/admin/newsletter/subscribers',
    method: 'GET',
    headers: { origin: 'http://localhost:3000' }
  } as any, mockRes as any);
  assert.equal(unauthorizedStatus, 401);

  const authorized = await adminRequest('settings');
  assert.equal(authorized.status, 200);
  assert.equal(authorized.value.wordpressMigrationReady, true);
});

test('subscriber management supports listing, stats, status transitions and CSV/JSON export', async () => {
  // Create two test subscriptions
  await db.subscription.create({
    data: {
      email: testEmail1,
      status: 'subscribed',
      consentVersion: 'travel-club-2026-10',
      consentAt: new Date(),
      confirmedAt: new Date(),
      tokenHash: randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '')
    }
  });

  const sub2 = await db.subscription.create({
    data: {
      email: testEmail2,
      status: 'pending',
      consentVersion: 'travel-club-2026-10',
      consentAt: new Date(),
      tokenHash: randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '')
    }
  });

  // Test stats
  const stats = await getSubscriberStats();
  assert.ok(stats.total >= 2);
  assert.ok(stats.subscribed >= 1);
  assert.ok(stats.pending >= 1);

  // Test list with search
  const searchResult = await listSubscribers({ page: 1, limit: 10, status: 'all', search: testRunId });
  assert.equal(searchResult.total, 2);

  // Test status update
  const updatedSub2 = await updateSubscriberStatus(sub2.id, 'subscribed');
  assert.equal(updatedSub2.status, 'subscribed');
  assert.ok(updatedSub2.confirmedAt);

  // Test CSV export
  const csvExport = await exportSubscribers('csv');
  assert.ok(csvExport.data.includes('email,status,consent_version'));
  assert.ok(csvExport.data.includes(testEmail1));

  // Test JSON export
  const jsonExport = await exportSubscribers('json');
  assert.ok(jsonExport.data.includes(testEmail1));
  const parsedJson = JSON.parse(jsonExport.data);
  assert.ok(Array.isArray(parsedJson));
  assert.ok(parsedJson.some((s: any) => s.email === testEmail1));
});

test('campaign lifecycle: draft, preview, schedule, dispatch, outbox delivery and suppression', async () => {
  // 1. Create draft campaign
  const campaign = await createCampaign({
    title: 'Test Spring Campaign ' + testRunId,
    subject: 'Victoria Falls Spring Highlights',
    previewText: 'Exclusive safari updates',
    templateId: 'victoria-falls-editorial',
    contentHtml: '<h2>Seasonal Changes at the Falls</h2><p>Here is what travellers should expect this season.</p>'
  });
  createdCampaignIds.push(campaign.id);
  assert.equal(campaign.status, 'draft');

  // 2. Update campaign
  const updated = await updateCampaign(campaign.id, {
    title: 'Updated Spring Campaign ' + testRunId,
    subject: 'Updated Victoria Falls Spring Highlights'
  });
  assert.equal(updated.title, 'Updated Spring Campaign ' + testRunId);

  // 3. Send test preview (mock/disabled provider)
  const testSend = await sendTestEmail(campaign.id, 'admin-preview@example.test');
  assert.equal(testSend.success, true);
  assert.equal(testSend.recipient, 'admin-preview@example.test');

  // 4. Schedule campaign
  const futureDate = new Date(Date.now() + 3600000);
  const scheduled = await scheduleCampaign(campaign.id, futureDate);
  assert.equal(scheduled.status, 'scheduled');
  assert.ok(scheduled.scheduledAt);

  // 5. Dispatch campaign (queues jobs in Notification outbox)
  const dispatchResult = await dispatchCampaign(campaign.id);
  assert.equal(dispatchResult.campaign.status, 'sending');
  assert.ok(dispatchResult.recipientsQueued >= 2);

  // Verify notifications were created
  const notifications = await db.notification.findMany({
    where: { campaignId: campaign.id }
  });
  assert.ok(notifications.length >= 2);
  assert.equal(notifications[0].kind, 'newsletter-campaign');

  // 6. Test outbox delivery with active subscription
  const firstJob = notifications[0];
  const deliveryResult = await deliverNotification(firstJob);
  assert.ok(['smtp:', 'mock-delivery:', 'simulated-safe-mode'].some(prefix => deliveryResult.startsWith(prefix)));

  // 7. Test suppression: if a subscriber is unsubscribed, job is cancelled without sending
  const sub = await db.subscription.findUniqueOrThrow({ where: { id: notifications[1].subscriptionId! } });
  await db.subscription.update({
    where: { id: sub.id },
    data: { status: 'unsubscribed', unsubscribedAt: new Date() }
  });
  const suppressedResult = await deliverNotification(notifications[1]);
  assert.equal(suppressedResult, 'cancelled-unsubscribed');

  // 8. Verify campaign counters
  const finalCampaign = await getCampaign(campaign.id);
  assert.ok(finalCampaign.sentCount >= 1);
});
