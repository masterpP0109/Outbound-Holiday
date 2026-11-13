import { enquiryDateLabel } from '../shared/enquiry-confirmation';
export const escapeHtml = (value: unknown) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const readable = (value: unknown) => String(value ?? '').replaceAll('-', ' ');

export function enquiryEmail(p: Record<string, any>, team: boolean) {
  const title = team ? 'New holiday enquiry' : 'Your Holiday Enquiry Is Confirmed';
  const subject = team
    ? `New Holiday Enquiry | ${p.reference} | ${p.name}`
    : `Your Holiday Enquiry Is Confirmed | ${p.reference}`;
  if (!team) return customerEmail(p, subject);
  const sections: [string, string][] = [['Enquiry Reference', String(p.reference)]];
  const submittedDate = enquiryDateLabel(p.submittedAt, p.reference);
  if (submittedDate) sections.push(['Date submitted', submittedDate]);
  if (team) {
    sections.push(['Customer Name', p.name], ['Customer Email', p.email]);
    if (p.phone) sections.push(['Telephone / WhatsApp', p.phone]);
    const trip = p.trip ?? {};
    const fields = { travelDates: 'Requested Travel Dates', adults: 'Adults', children: 'Children', nights: 'Nights', partyType: 'Travelling as', intent: 'Holiday interests', preferredContact: 'Preferred contact', transportType: 'Transport' };
    for (const [key, label] of Object.entries(fields)) {
      if (trip[key] !== undefined && trip[key] !== '') sections.push([label, readable(trip[key])]);
    }
    if (trip.stayPreferences?.length) sections.push(['Stay preferences', trip.stayPreferences.join(', ')]);
    const items = p.selectionSnapshot?.items ?? [];
    if (items.length) sections.push(['Selected Holiday Experiences', items.map((item: any) => item.title ?? item.id).join('\n')]);
    const estimate = p.selectionSnapshot?.estimate;
    if (items.length && estimate?.maximumUSD > 0) {
      sections.push(['Estimated Budget', `US$${Number(estimate.minimumUSD).toLocaleString('en-US')}–${Number(estimate.maximumUSD).toLocaleString('en-US')}. Subject to supplier confirmation.`]);
      if (estimate.assumptions) sections.push(['Estimate assumptions', estimate.assumptions]);
    }
    if (trip.displayedEstimate && !items.length && trip.displayedEstimate.maximumUSD > 0) {
      sections.push(['Estimated Budget', `US$${Number(trip.displayedEstimate.minimumUSD).toLocaleString('en-US')}–${Number(trip.displayedEstimate.maximumUSD).toLocaleString('en-US')}`]);
    }
    if (trip.itineraryDraft?.length) sections.push(['Requested itinerary (draft)', trip.itineraryDraft.map((day: any) => `${day.day}: ${day.title}\n${day.description}`).join('\n\n')]);
    if (p.message) sections.push(['Additional Customer Requests', p.message]);
    sections.push(['Travel updates consent', p.marketingConsent ? 'Yes — subscription confirmation is required.' : 'No']);
  }
  const intro = 'A traveller has sent an enquiry. Review their details below.';
  const closing = 'Reply to this email to contact the traveller.';
  const html = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f3f4f6;-webkit-text-size-adjust:100%"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden"><tr><td style="padding:20px 24px;background:#0d2833;border-bottom:3px solid #c9a66b;color:#ffffff;font-family:Arial,Helvetica,sans-serif"><p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:1.2px;color:#c9a66b">OUTBOUND HOLIDAYS</p><h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;color:#ffffff">${escapeHtml(p.reference)} &mdash; ${escapeHtml(p.name)}</h1></td></tr><tr><td style="padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;overflow-wrap:anywhere;word-break:break-word"><p style="margin:0 0 18px">${escapeHtml(intro)}</p>${sections.map(([label, value]) => `<p style="margin:0 0 14px"><strong style="font-size:13px;color:#4b5563">${escapeHtml(label)}</strong><br>${escapeHtml(value).replace(/\r?\n/g, '<br>')}</p>`).join('')}<p style="margin:22px 0 0;font-size:14px;color:#59645e">${escapeHtml(closing)}</p></td></tr></table></td></tr></table></body></html>`;
  const text = ['Outbound Holidays', title, intro, ...sections.map(([label, value]) => `${label}: ${value}`), closing].join('\n\n');
  return { subject, html, text };
}

function customerEmail(p: Record<string, any>, subject: string) {
  const submittedDate = enquiryDateLabel(p.submittedAt, p.reference);
  const confirmation: [string, string][] = [['Reference', String(p.reference)], ['Customer', p.name]];
  if (submittedDate) confirmation.push(['Date submitted', submittedDate]);
  const trip = p.trip ?? {};
  const details: [string, string][] = [];
  if (trip.intent) details.push(['Trip vision', readable(trip.intent)]);
  if (trip.travelDates) details.push(['Travel dates', readable(trip.travelDates)]);
  if (trip.adults) details.push(['Travellers', `${trip.adults} adult${trip.adults === 1 ? '' : 's'}${trip.children ? `, ${trip.children} child${trip.children === 1 ? '' : 'ren'}` : ''}${trip.partyType ? ` (${readable(trip.partyType)})` : ''}`]);
  if (trip.nights) details.push(['Length of stay', `${trip.nights} night${trip.nights === 1 ? '' : 's'}`]);
  if (trip.stayTierName) details.push(['Accommodation style', String(trip.stayTierName)]);
  if (trip.stayPreferences?.length) details.push(['Stay preferences', trip.stayPreferences.join(', ')]);
  if (trip.accommodationName) details.push(['Preferred property', String(trip.accommodationName)]);
  if (trip.packageTitle) details.push(['Selected package', String(trip.packageTitle)]);
  if (trip.transportType) details.push(['Transfers & logistics', readable(trip.transportType)]);
  const selections = p.selectionSnapshot?.items ?? [];
  if (selections.length) details.push(['Your selected experiences', selections.map((item: any) => item.title ?? item.id).join('\n')]);
  if (trip.itineraryDraft?.length) details.push(['Draft itinerary', trip.itineraryDraft.map((day: any) => `${day.day}: ${day.title}`).join('\n')]);
  if (p.message) details.push(['Your message', p.message]);
  const estimate = p.selectionSnapshot?.estimate;
  const hasBudget = Boolean(estimate?.maximumUSD > 0);
  const budgetText = hasBudget ? `US$${Number(estimate.minimumUSD).toLocaleString('en-US')}–${Number(estimate.maximumUSD).toLocaleString('en-US')}` : '';
  const intro = `Thank you, ${p.name}, for contacting Outbound Holidays. We have successfully received your holiday enquiry.`;
  const next = 'Please keep this reference for future communication with our team. Our Victoria Falls travel specialists will review your request and respond within 24 hours.';
  const whatsapp = '+263 714 701 721';
  const closing = 'Want to add something? Simply reply to this email and our team will help.';
  const note = 'This confirms receipt of your enquiry. Prices and availability are subject to confirmation; no booking has been made.';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#f5f2ea;-webkit-text-size-adjust:100%"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e0d4;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1f2937;overflow-wrap:anywhere;word-break:break-word"><tr><td style="padding:28px 24px;background:#0d2833;border-bottom:4px solid #c9a66b;color:#ffffff;text-align:center"><p style="margin:0;font-size:18px;font-weight:bold;letter-spacing:1.6px;color:#c9a66b">OUTBOUND HOLIDAYS</p><p style="margin:4px 0 0;font-size:13px;color:#e5e7eb">Victoria Falls</p></td></tr><tr><td style="padding:28px 24px"><h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#0d2833">Your Holiday Enquiry Is Confirmed</h1><p style="margin:0 0 20px">${escapeHtml(intro)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d2833;border:2px solid #c9a66b;border-radius:10px;text-align:center"><tr><td style="padding:18px 20px"><p style="margin:0 0 6px;font-size:11px;font-weight:bold;letter-spacing:1.4px;color:#c9a66b">YOUR ENQUIRY REFERENCE</p><p style="margin:0;font-size:24px;font-weight:bold;letter-spacing:1px;color:#ffffff">${escapeHtml(p.reference)}</p></td></tr></table>${hasBudget ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#f9f6ee;border:1px solid #e5d6b3;border-radius:8px"><tr><td style="padding:14px 18px"><p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#8a6d3b">Estimated Holiday Budget:</p><p style="margin:0;font-size:18px;font-weight:bold;color:#0d2833">${escapeHtml(budgetText)}</p></td></tr></table>` : ''}<h2 style="margin:24px 0 10px;font-size:18px;line-height:1.4;color:#0d2833">What happens next</h2><p style="margin:0 0 20px">${escapeHtml(next)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-left:4px solid #c9a66b"><tr><td style="padding:14px 16px"><p style="margin:0 0 4px;font-size:13px;color:#4b5563">For immediate assistance, contact us on WhatsApp:</p><p style="margin:0;font-size:16px;font-weight:bold;color:#0d2833">${whatsapp}</p></td></tr></table>${details.length ? `<h2 style="margin:24px 0 14px;font-size:18px;line-height:1.4;color:#0d2833">A copy of your request</h2>${details.map(([label, value]) => `<p style="margin:0 0 14px"><strong style="font-size:14px;color:#4b5563">${escapeHtml(label)}</strong><br>${escapeHtml(value).replace(/\r?\n/g, '<br>')}</p>`).join('')}` : ''}<p style="margin:24px 0 16px;padding-top:18px;border-top:1px solid #e5e8e1">${escapeHtml(closing)}</p><p style="margin:0">Warm regards,<br><strong>The Outbound Holidays team</strong></p></td></tr><tr><td style="padding:18px 24px;background:#f9fafb;font-size:12px;line-height:1.6;color:#6b7280">${escapeHtml(note)}</td></tr></table></td></tr></table></body></html>`;
  const text = ['Outbound Holidays', 'Your Holiday Enquiry Is Confirmed', intro, `YOUR ENQUIRY REFERENCE: ${p.reference}`, ...(hasBudget ? [`Estimated Holiday Budget: ${budgetText}`] : []), ...confirmation.map(([label, value]) => `${label}: ${value}`), 'What happens next', next, `For immediate assistance, contact us on WhatsApp: ${whatsapp}`, ...(details.length ? ['A copy of your request', ...details.map(([label, value]) => `${label}: ${value}`)] : []), closing, 'Warm regards,\nThe Outbound Holidays team', note].join('\n\n');
  return { subject, html, text };
}
