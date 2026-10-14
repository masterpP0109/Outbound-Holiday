import { db } from '../server/db';
import { runOutbox } from '../server/outbox';
import { deliverNotification } from '../server/providers';
import { randomUUID } from 'node:crypto';

const reference = process.argv[2];
if (!/^OH-\d{8}-[A-F0-9]{8}$/.test(reference ?? '')) throw new Error('Supply a saved enquiry reference.');
try {
  const enquiry = await db.enquiry.findUnique({
    where: { reference }, select: { id: true, reference: true },
  });
  if (!enquiry) throw new Error('Enquiry not found in the configured database.');
  const where = { enquiryId: enquiry.id, kind: { in: ['team-enquiry', 'customer-acknowledgement'] } };
  const select = { id: true, kind: true, status: true, attempts: true, sentAt: true, lastError: true };
  const before = await db.notification.findMany({ where, select });
  console.log('Enquiry:', reference, 'email jobs:', JSON.stringify(before));
  if (process.argv.includes('--send-customer-correction')) {
    if (process.env.EMAIL_DELIVERY_MODE !== 'live') throw new Error('Customer correction requires live delivery mode.');
    const original = await db.notification.findFirstOrThrow({ where: { enquiryId: enquiry.id, kind: 'customer-acknowledgement' } });
    if (original.payload === null) throw new Error('Customer acknowledgement payload is missing.');
    const dedupeKey = 'customer-template-correction-v2:' + enquiry.id;
    const correction = await db.notification.upsert({
      where: { dedupeKey }, update: {},
      create: { dedupeKey, enquiryId: enquiry.id, kind: 'customer-acknowledgement', payload: original.payload },
    });
    if (correction.status !== 'sent') console.log('Customer correction:', await runOutbox(1, undefined, [correction.id]));
    const result = await db.notification.findUniqueOrThrow({ where: { id: correction.id }, select: { status: true, lastError: true } });
    console.log('Customer acknowledgement to submitted address:', JSON.stringify(result));
    if (result.status !== 'sent') process.exitCode = 1;
  }
  if (process.argv.includes('--preview-send')) {
    if (process.env.EMAIL_DELIVERY_MODE !== 'test' || !process.env.EMAIL_TEST_TO) throw new Error('Preview requires test mode and EMAIL_TEST_TO.');
    const jobs = await db.notification.findMany({ where });
    for (const job of jobs) {
      await deliverNotification({ ...job, dedupeKey: 'template-preview:' + randomUUID() }, { testPreview: true });
      console.log('Corrected template preview accepted by SMTP:', job.kind, 'to', process.env.EMAIL_TEST_TO);
    }
  }
  if (process.argv.includes('--send-live')) {
    if (process.env.EMAIL_DELIVERY_MODE !== 'live') throw new Error('Sending enquiry notifications requires live mode.');
    console.log('Live delivery: team notification to TEAM_ENQUIRY_TO; customer acknowledgement to the submitted email.');
    const ids = before.filter(job => ['pending', 'failed'].includes(job.status)).map(job => job.id);
    if (ids.length) console.log('Delivery result:', await runOutbox(ids.length, undefined, ids));
    else console.log('No pending or failed enquiry emails; previously sent jobs will not be resent.');
    const after = await db.notification.findMany({ where, select });
    console.log('Final email jobs:', JSON.stringify(after));
    if (after.length !== 2 || after.some(job => job.status !== 'sent')) process.exitCode = 1;
  }
} finally {
  await db.$disconnect();
}
