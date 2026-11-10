import type { TemplateDefinition } from './types';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'victoria-falls-editorial',
    name: 'Victoria Falls Editorial Digest',
    description: 'In-depth destination stories, water level updates, and curated Victoria Falls holiday advice.',
    defaultSubject: 'Stories from Victoria Falls | Outbound Holidays Travel Journal',
    defaultPreviewText: 'Your monthly insider guide to Victoria Falls, Zambezi river journeys and safari experiences.',
    sampleContentHtml: `
      <h2>The Zambezi in Season: Insider Perspective</h2>
      <p>Victoria Falls changes character dramatically with the seasons. Whether you are witnessing the high-water roar and rainbows from the rainforest trail or experiencing the thrilling low-water Devil's Pool excursions, timing makes all the difference.</p>
      <div style="background-color: #F0F7FB; border-left: 4px solid #0B5E8E; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #0B5E8E;">Specialist Tip of the Month</h4>
        <p style="margin: 0; font-size: 14px; color: #2F3A44;">Early morning helicopter flights over the Batoka Gorge capture the cleanest sunlight and mist illumination before the afternoon thermals rise.</p>
      </div>
      <p>Our Victoria Falls specialists are currently curating bespoke 2026 and 2027 safari itineraries, pairing the falls with Hwange National Park and Chobe riverfront lodges.</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="https://outboundholiday.com/things-to-do-in-victoria-falls" style="background-color: #E67E22; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Explore Experiences</a>
      </p>
    `
  },
  {
    id: 'safari-spotlight',
    name: 'Lodge & Safari Spotlight',
    description: 'Spotlight on luxury Zambezi river lodges, safari camps, and handpicked boutique accommodations.',
    defaultSubject: 'Where to Stay in Victoria Falls | Handpicked Lodges & Stays',
    defaultPreviewText: 'Discover private riverfront decks, elephant corridors and boutique stays along the Zambezi.',
    sampleContentHtml: `
      <h2>Riverfront Lodges & Wilderness Escapes</h2>
      <p>Staying directly on the banks of the upper Zambezi transforms a holiday into an immersive wildlife retreat. Wake up to the calls of fish eagles and spot hippos grazing at dusk right from your private veranda.</p>
      <div style="background-color: #FAF6ED; border: 1px solid #E6D8BA; padding: 18px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #8A6421;">Featured Stay: Victoria Falls River Lodge</h3>
        <p style="margin-bottom: 12px; font-size: 14px;">The first private game lodge built within Zambezi National Park, offering luxury tented suites and island treehouses with personal plunge pools.</p>
        <span style="font-size: 13px; font-weight: bold; color: #0B5E8E;">Complimentary river transfers & private game drives included.</span>
      </div>
      <p style="text-align: center; margin: 28px 0;">
        <a href="https://outboundholiday.com/victoria-falls-accommodation" style="background-color: #0B5E8E; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Browse All Stays</a>
      </p>
    `
  },
  {
    id: 'seasonal-offers',
    name: 'Special Offers & Itineraries',
    description: 'Curated holiday packages, combination discounts, and seasonal safari journeys.',
    defaultSubject: 'Exclusive Victoria Falls Packages & Seasonal Escapes',
    defaultPreviewText: 'Save on 3, 4, and 5-night curated packages including flights, accommodation, and guided activities.',
    sampleContentHtml: `
      <h2>Tailored Holiday Packages for 2026 & 2027</h2>
      <p>Plan your complete Victoria Falls getaway with our all-inclusive curated packages. Every itinerary includes airport transfers, guided rainforest tours, luxury sunset cruises, and dinners at the Boma.</p>
      <ul style="padding-left: 20px; line-height: 1.8;">
        <li><strong>4-Day Classic Explorer:</strong> Includes 3 nights stay, guided Falls tour, helicopter flight & dinner cruise.</li>
        <li><strong>6-Day Falls & Chobe Safari Combo:</strong> Full-day Chobe safari in Botswana paired with Zambezi luxury.</li>
        <li><strong>Family Adventure Special:</strong> Children stay and cruise at discounted rates with flexible pacing.</li>
      </ul>
      <p style="text-align: center; margin: 28px 0;">
        <a href="https://outboundholiday.com/victoria-falls-packages" style="background-color: #E67E22; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Packages</a>
      </p>
    `
  },
  {
    id: 'announcement',
    name: 'Minimalist Branded Announcement',
    description: 'Direct personal letter or travel advisory from Fungai Mtetwa and the local team.',
    defaultSubject: 'An Update from Outbound Holidays Victoria Falls',
    defaultPreviewText: 'A personal note on holiday planning, local travel tips, and upcoming seasonal changes.',
    sampleContentHtml: `
      <h2>A Warm Note from Victoria Falls</h2>
      <p>Warm greetings from our home on the edge of the Zambezi.</p>
      <p>As local destination planners, our goal has always been simple: give you honest, on-the-ground guidance so you experience the true beauty and heart of Victoria Falls.</p>
      <p>If you are considering visiting during the upcoming dry or high-water seasons, our team is always on hand to discuss dates, room availability, and custom safari combinations.</p>
      <p style="margin-top: 24px;">Warm regards,<br><strong>Fungai Mtetwa</strong><br><em>Founder & Head of Travel, Outbound Holidays</em></p>
    `
  }
];

export function getTemplate(templateId: string): TemplateDefinition {
  return TEMPLATES.find(t => t.id === templateId) ?? TEMPLATES[0];
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n$1\n' + '='.repeat(30) + '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n• $1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export interface RenderOptions {
  templateId?: string;
  title?: string;
  subject: string;
  previewText?: string | null;
  contentHtml: string;
  contentText?: string;
  variables?: Record<string, string>;
}

export function renderEmail(options: RenderOptions): { html: string; text: string } {
  const preview = options.previewText || 'Outbound Holidays Victoria Falls travel updates';
  const year = new Date().getFullYear().toString();
  const title = options.title || options.subject;

  const vars: Record<string, string> = {
    title,
    preview_text: preview,
    year,
    unsubscribe_url: 'https://outboundholiday.com/api/v1/newsletter/unsubscribe',
    confirm_url: 'https://outboundholiday.com/api/v1/newsletter/confirm',
    email: 'traveler@example.com',
    ...(options.variables ?? {})
  };

  // Interpolate body content first
  let bodyHtml = options.contentHtml;
  for (const [k, v] of Object.entries(vars)) {
    bodyHtml = bodyHtml.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), v);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2F3A44; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text (invisible in body, visible in inbox preview) -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #ffffff;">
    ${escapeHtml(preview)}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F6F8; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container (max 620px) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0B5E8E; padding: 32px 30px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #C9A66B; margin-bottom: 8px;">
                      ✦ VICTORIA FALLS SPECIALISTS ✦
                    </div>
                    <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                      OUTBOUND HOLIDAYS
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.85);">
                      Honest holiday planning crafted by local specialists
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold Accent Bar -->
          <tr>
            <td style="background-color: #C9A66B; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 36px 32px; font-size: 15px; line-height: 1.65; color: #2F3A44;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Support & Founder Contact Strip -->
          <tr>
            <td style="background-color: #FAFBFB; border-top: 1px solid #E2E8F0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0B5E8E;">
                Planning a trip to Victoria Falls or the Zambezi?
              </p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748B;">
                Speak directly with local travel planner Fungai Mtetwa.
              </p>
              <a href="https://outboundholiday.com/contact" style="display: inline-block; background-color: #0B5E8E; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 10px 22px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px;">
                Contact Local Specialist
              </a>
            </td>
          </tr>

          <!-- Compliance & Unsubscribe Footer -->
          <tr>
            <td style="background-color: #1A2E35; padding: 28px 30px; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 10px 0; font-weight: 600; color: #E2E8F0;">
                Outbound Holidays (Pvt) Ltd
              </p>
              <p style="margin: 0 0 12px 0;">
                Victoria Falls, Zimbabwe &bull; <a href="https://outboundholiday.com" style="color: #C9A66B; text-decoration: none;">outboundholiday.com</a>
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748B;">
                You are receiving this travel newsletter because you subscribed to Outbound Holidays travel updates at ${escapeHtml(vars.email)}.
              </p>
              <p style="margin: 0; font-size: 12px;">
                <a href="${escapeHtml(vars.unsubscribe_url)}" style="color: #E67E22; text-decoration: underline; font-weight: 600;">Unsubscribe instantly</a>
                &nbsp;&bull;&nbsp;
                <a href="https://outboundholiday.com/contact" style="color: #94A3B8; text-decoration: none;">Help &amp; Inquiries</a>
                &nbsp;&bull;&nbsp;
                <a href="https://outboundholiday.com/victoria-falls-guide" style="color: #94A3B8; text-decoration: none;">Victoria Falls Guide</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Text version
  let text = options.contentText || htmlToPlainText(options.contentHtml);
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), v);
  }

  const fullText = `OUTBOUND HOLIDAYS | VICTORIA FALLS
Honest holiday planning crafted by local specialists
============================================================

${text}

------------------------------------------------------------
Need personalised holiday advice?
Contact local travel specialist Fungai Mtetwa:
https://outboundholiday.com/contact

Outbound Holidays (Pvt) Ltd, Victoria Falls, Zimbabwe
You received this email because you subscribed with ${vars.email}.
Unsubscribe at any time: ${vars.unsubscribe_url}
`;

  return { html, text: fullText };
}
