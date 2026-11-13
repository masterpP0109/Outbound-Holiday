import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enquiryEmail } from '../server/enquiry-email';
import { emailRecipient } from '../server/email-recipient';
import { enquiryDateLabel, formatEnquiryReference } from '../shared/enquiry-confirmation';
const payload = { reference: 'OH-261112-001', name: 'Traveller <script>', email: 'traveller@example.test', message: 'First line\nSecond line & more', trip: { adults: 2, children: 0, itineraryDraft: [{ day: 'Day 1', title: 'Arrival', description: 'Transfer' }] }, selectionSnapshot: { items: [], estimate: { minimumUSD: 0, maximumUSD: 0 } }, marketingConsent: false };
test('formatEnquiryReference formats daily sequence 001..999 and 1000+', () => {
  assert.equal(formatEnquiryReference('261112', 1), 'OH-261112-001');
  assert.equal(formatEnquiryReference('261112', 2), 'OH-261112-002');
  assert.equal(formatEnquiryReference('261112', 999), 'OH-261112-999');
  assert.equal(formatEnquiryReference('261112', 1000), 'OH-261112-1000');
});
test('team email escapes content, preserves paragraphs and omits empty estimates and raw JSON', () => {
  const email = enquiryEmail(payload, true);
  assert.equal(email.subject, 'New Holiday Enquiry | OH-261112-001 | Traveller <script>');
  assert.ok(email.html.includes('Traveller &lt;script&gt;'));
  assert.ok(email.html.includes('First line<br>Second line &amp; more'));
  assert.ok(email.text.includes('Children: 0'));
  assert.ok(email.text.includes('Day 1: Arrival'));
  assert.ok(!email.html.includes('<pre'));
  assert.ok(!email.text.includes('selectionSnapshot'));
  assert.ok(!email.text.includes('Estimated Budget'));
});
test('customer email shows prominent reference, navy/gold branding and hides internal trip details', () => {
  const email = enquiryEmail(payload, false);
  assert.ok(email.html.includes('font-size:24px'));
  assert.ok(email.html.includes('>Your Holiday Enquiry Is Confirmed</h1>'));
  assert.ok(email.html.includes('YOUR ENQUIRY REFERENCE'));
  assert.ok(email.text.includes(payload.reference));
  assert.ok(!email.text.includes('Travel updates consent'));
  assert.ok(email.html.includes('What happens next'));
  assert.ok(email.html.includes('First line<br>Second line &amp; more'));
  assert.ok(email.text.includes('The Outbound Holidays team'));
});
test('submission date is separate from travel date and supports both new and historical references', () => {
  const p = { ...payload, submittedAt: '2026-10-14T23:30:00Z', trip: { travelDates: 'December 2027' } };
  for (const team of [false, true]) {
    const email = enquiryEmail(p, team);
    assert.ok(email.text.includes('Date submitted: 15 October 2026'));
    assert.ok(email.text.includes(payload.reference));
    assert.ok(email.html.includes('Traveller &lt;script&gt;'));
  }
  assert.equal(enquiryDateLabel(undefined, 'OH-20261014-6E83D2BB'), '14 October 2026');
  assert.equal(enquiryDateLabel(undefined, 'OH-261112-001'), '12 November 2026');
  assert.equal(enquiryDateLabel('invalid', payload.reference), undefined);
});
test('live delivery keeps customer and team recipients separate even with a test mailbox configured', () => {
  const env = { EMAIL_DELIVERY_MODE: 'live', EMAIL_TEST_TO: 'fungai@outboundholiday.com' };
  assert.equal(emailRecipient('customer@example.test', env), 'customer@example.test');
  assert.equal(emailRecipient('fungai@outboundholiday.com', env), 'fungai@outboundholiday.com');
  assert.equal(emailRecipient('customer@example.test', { ...env, EMAIL_DELIVERY_MODE: 'test' }), 'fungai@outboundholiday.com');
  assert.throws(() => emailRecipient('customer@example.test', {}), /disabled/);
});
test('test mode cannot silently redirect customer acknowledgements', () => {
  const env = { EMAIL_DELIVERY_MODE: 'test', EMAIL_TEST_TO: 'fungai@outboundholiday.com' };
  assert.throws(() => emailRecipient('customer@example.test', env, { customerAcknowledgement: true }), /cannot redirect/);
  assert.equal(emailRecipient('customer@example.test', env, { customerAcknowledgement: true, testPreview: true }), env.EMAIL_TEST_TO);
});
