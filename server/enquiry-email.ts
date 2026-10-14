import { enquiryDateLabel } from '../shared/enquiry-confirmation';
export const escapeHtml = (value: unknown) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const readable = (value: unknown) => String(value ?? '').replaceAll('-', ' ');

export function enquiryEmail(p: Record<string, any>, team: boolean) {
  const title = team ? 'New holiday enquiry' : 'Your enquiry has been received';
  const subject = (team ? 'New holiday enquiry ' : 'Your Outbound Holidays enquiry ') + p.reference;
  if (!team) return customerEmail(p, subject);
  const sections: [string, string][] = [['Reference', String(p.reference)]];
  const submittedDate = enquiryDateLabel(p.submittedAt, p.reference);
  if (submittedDate) sections.push(['Date submitted', submittedDate]);
  if (team) {
    sections.push(['Name', p.name], ['Email', p.email]);
    if (p.phone) sections.push(['Phone', p.phone]);
    if (p.message) sections.push(['Message', p.message]);
    const trip = p.trip ?? {};
    const fields = { travelDates: 'Travel dates', adults: 'Adults', children: 'Children', nights: 'Nights', partyType: 'Travelling as', intent: 'Holiday interests', preferredContact: 'Preferred contact', transportType: 'Transport' };
    for (const [key, label] of Object.entries(fields)) {
      if (trip[key] !== undefined && trip[key] !== '') sections.push([label, readable(trip[key])]);
    }
    if (trip.stayPreferences?.length) sections.push(['Stay preferences', trip.stayPreferences.join(', ')]);
    const items = p.selectionSnapshot?.items ?? [];
    if (items.length) sections.push(['Requested selections', items.map((item: any) => item.title ?? item.id).join('\n')]);
    const estimate = p.selectionSnapshot?.estimate;
    if (items.length && estimate?.maximumUSD > 0) {
      sections.push(['Estimated price', `USD ${estimate.minimumUSD}–${estimate.maximumUSD}. Subject to supplier confirmation.`]);
      if (estimate.assumptions) sections.push(['Estimate assumptions', estimate.assumptions]);
    }
    if (trip.displayedEstimate) sections.push(['Website estimate (unverified)', `USD ${trip.displayedEstimate.minimumUSD}–${trip.displayedEstimate.maximumUSD}`]);
    if (trip.itineraryDraft?.length) sections.push(['Requested itinerary (draft)', trip.itineraryDraft.map((day: any) => `${day.day}: ${day.title}\n${day.description}`).join('\n\n')]);
    sections.push(['Travel updates consent', p.marketingConsent ? 'Yes — subscription confirmation is required.' : 'No']);
  }
  const intro = team ? 'A traveller has sent an enquiry. Review their details below.' : `Thank you, ${p.name}. Your enquiry has been saved. One of our Victoria Falls travel specialists will review your enquiry and get back to you shortly.`;
  const closing = team ? 'Reply to this email to contact the traveller.' : 'You can reply to this email if you would like to add anything. Displayed prices are estimates; no booking or availability is confirmed.';
  const html = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f5f5f2;-webkit-text-size-adjust:100%"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff"><tr><td style="padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#24342e;overflow-wrap:anywhere;word-break:break-word"><p style="margin:0 0 18px;font-size:14px;font-weight:bold;color:#58734c">OUTBOUND HOLIDAYS</p><h1 style="margin:0 0 16px;font-size:24px;line-height:1.3">${title}</h1><p style="margin:0 0 20px">${escapeHtml(intro)}</p>${sections.map(([label, value]) => `<p style="margin:0 0 16px"><strong style="font-size:14px;color:#58734c">${escapeHtml(label)}</strong><br>${escapeHtml(value).replace(/\r?\n/g, '<br>')}</p>`).join('')}<p style="margin:24px 0 0;font-size:14px;color:#59645e">${escapeHtml(closing)}</p></td></tr></table></td></tr></table></body></html>`;
  const text = ['Outbound Holidays', title, intro, ...sections.map(([label, value]) => `${label}: ${value}`), closing].join('\n\n');
  return { subject, html, text };
}

function customerEmail(p: Record<string, any>, subject: string) {
  const submittedDate = enquiryDateLabel(p.submittedAt, p.reference);
  const confirmation: [string, string][] = [['Reference', String(p.reference)], ['Customer', p.name]];
  if (submittedDate) confirmation.push(['Date submitted', submittedDate]);
  const trip = p.trip ?? {};
  const details: [string, string][] = [];
  if (trip.travelDates) details.push(['Travel dates', trip.travelDates]);
  if (trip.adults) details.push(['Travellers', `${trip.adults} adult${trip.adults === 1 ? '' : 's'}${trip.children ? `, ${trip.children} child${trip.children === 1 ? '' : 'ren'}` : ''}`]);
  if (trip.nights) details.push(['Length of stay', `${trip.nights} night${trip.nights === 1 ? '' : 's'}`]);
  const selections = p.selectionSnapshot?.items ?? [];
  if (selections.length) details.push(['Your interests', selections.map((item: any) => item.title ?? item.id).join('\n')]);
  if (p.message) details.push(['Your message', p.message]);
  const intro = `Thank you, ${p.name}. We have received your enquiry and look forward to helping you plan your Victoria Falls holiday.`;
  const next = 'One of our Victoria Falls travel specialists will review your request, check the options with our suppliers, and contact you with the next steps.';
  const closing = 'Want to add something? Simply reply to this email and our team will help.';
  const note = 'This confirms receipt of your enquiry. Prices and availability are subject to confirmation; no booking has been made.';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#f3f1eb;-webkit-text-size-adjust:100%"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#263b33;overflow-wrap:anywhere;word-break:break-word"><tr><td style="padding:28px 24px;background:#183e32;border-bottom:4px solid #d6b572;color:#ffffff"><p style="margin:0;font-size:18px;font-weight:bold;letter-spacing:1px">OUTBOUND HOLIDAYS</p><p style="margin:5px 0 0;font-size:13px;color:#e4dcc5">Your Victoria Falls journey starts here</p></td></tr><tr><td style="padding:28px 24px"><p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:1px;color:#56735b">ENQUIRY CONFIRMATION</p><h1 style="margin:0 0 18px;font-size:24px;line-height:1.3">Your enquiry has been received</h1><p style="margin:0 0 24px">${escapeHtml(intro)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5ef;border:1px solid #dce4d7"><tr><td style="padding:16px">${confirmation.map(([label, value]) => `<p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#56735b">${escapeHtml(label)}</p><p style="margin:0 0 12px;font-size:16px;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(value)}</p>`).join('')}</td></tr></table><h2 style="margin:26px 0 10px;font-size:18px;line-height:1.4">What happens next</h2><p style="margin:0 0 22px">${next}</p>${details.length ? `<h2 style="margin:24px 0 14px;font-size:18px;line-height:1.4">A copy of your request</h2>${details.map(([label, value]) => `<p style="margin:0 0 16px"><strong style="font-size:14px;color:#56735b">${escapeHtml(label)}</strong><br>${escapeHtml(value).replace(/\r?\n/g, '<br>')}</p>`).join('')}` : ''}<p style="margin:26px 0 16px;padding-top:20px;border-top:1px solid #e5e8e1">${closing}</p><p style="margin:0">Warm regards,<br><strong>The Outbound Holidays team</strong></p></td></tr><tr><td style="padding:20px 24px;background:#f7f7f3;font-size:12px;line-height:1.6;color:#606b63">${note}</td></tr></table></td></tr></table></body></html>`;
  const text = ['Outbound Holidays', 'Your enquiry has been received', intro, ...confirmation.map(([label, value]) => `${label}: ${value}`), 'What happens next', next, ...(details.length ? ['A copy of your request', ...details.map(([label, value]) => `${label}: ${value}`)] : []), closing, 'Warm regards,\nThe Outbound Holidays team', note].join('\n\n');
  return { subject, html, text };
}
