# Outbound CMS — WordPress Administration Guide

Once the `outbound-holidays` theme is activated, administrators can edit website copy, imagery, listings, Holiday Builder rates, brand tokens, and SEO settings from **Outbound CMS** inside `/wp-admin/` with zero third-party page builders or custom-field plugins required.

---

## 1. Accessing Outbound CMS

1. Sign in to WordPress Admin (`/wp-admin/`).
2. Click **Outbound CMS** in the left WordPress navigation menu.
3. Use the left CMS sidebar to move between the **14 numbered sections**, plus operational consoles (**Customer Enquiries**, **Newsletter Subscribers**, **Content Migration**, **Setup & Email Health**).

Only one active section is loaded and rendered per request to keep WordPress Admin responsive and lightweight.

---

## 2. Draft -> Private Preview -> Publish Workflow

Every editable form section (`2` through `14`) displays a sticky bottom action bar with three controls:

1. **Save Draft** — Stages your changes into `outbound_cms_draft_state` without changing what public website visitors see.
2. **Preview Draft** — Opens `/?outbound_preview=1` in a new tab with the **CMS Draft Preview Mode** bar visible at the top of the page. This view bypasses transient caches (`Cache-Control: no-store, private`) and requires administrator capability (`manage_options`), so unauthenticated visitors can never view unpublished drafts.
3. **Publish Changes** — Promotes all staged draft changes (including any current form edits) to live `wp_options`, clears staged draft state, and invalidates the snapshot cache so visitors immediately see the updates.
4. **Discard Draft** — Drops unpublished draft edits while leaving the live site untouched.

---

## 3. Summary of the 14 Outbound CMS Sections

1. **1. Website Overview** — KPI counts (Accommodations, Experiences, Packages, Guides, Blog Posts, Client Albums, Enquiries, Confirmed Subscribers), Draft vs Published status card, and quick directory links.
2. **2. Homepage & Hero** — Hero eyebrow, custom headline lines / rotating persona slides, subtitle, CTA labels, WordPress Media Library background picker with live Hero mockup preview, Quick Planning Bar cards, homepage section visibility toggles, Why Plan with Outbound card repeater, Final CTA copy, and Featured homepage property/experience/package checkboxes.
3. **3. Experiences** — Experiences section copy + searchable, paginated native `experience` CPT list with links to add/edit experiences and `experience_category` terms.
4. **4. Accommodation** — Where to Stay headings + searchable, paginated native `accommodation` CPT list and `accommodation_category` terms.
5. **5. Holiday Packages** — Package section copy, pricing disclaimer + searchable, paginated `package` CPT list.
6. **6. Guides & Articles** — Travel Guide headings + paginated `guide_article` CPT list and native WordPress `post` Blog articles.
7. **7. Galleries & Media** — Photo count overview, direct WordPress Media Library link, and `client_album` CPT list.
8. **8. Testimonials & Reviews** — Traveller Stories headings, Google review rating/URL, and sortable guest review repeater with avatar Media Library pickers.
9. **9. About & Contact** — WhatsApp concierge digits, display phone, enquiries email, Victoria Falls office address, hours, Contact page headings, and founder story paragraphs.
10. **10. Header & Navigation** — Header Media Library logo picker, top announcement badge/tagline, WhatsApp strip prefix, navigation labels, search placeholder, and header CTA button.
11. **11. Footer & Global Content** — Footer logo, brand summary, Tourism Authority license text, copyright, Google Reviews badge/link, payment badges, social URLs, Travel Club newsletter banner copy, and Currency conversion multipliers (`USD`, `GBP`, `EUR`, `ZAR`, `ZWL`).
12. **12. Holiday Builder Settings** — Repeaters for Accommodation Stay Tiers (`stayTiers`) and Builder Activity add-ons (`builderActivities`) including nightly/activity USD pricing and thumbnails.
13. **13. Design & Layout** — Color pickers for primary (`#0B5E8E`), secondary (`#C9A66B`), accent (`#E67E22`), nature (`#3F6B3C`), and dark (`#2F3A44`) tokens, plus one-click **Reset to Original React Colors**.
14. **14. SEO & Publishing** — Searchable, paginated table of per-route SEO titles & descriptions (`site.routeSeo`) alongside Draft/Publish status controls.

---

## 4. Theme Installation & Upgrades

1. Build or locate `wordpress-theme/outbound-holidays.zip` (`< 2 MB`).
2. In WordPress Admin go to **Appearance → Themes → Add New → Upload Theme**, select `outbound-holidays.zip`, and replace/activate cleanly.
3. Navigate to **Outbound CMS → Setup & Email Health** if initial migration or rewrite flush is required.
