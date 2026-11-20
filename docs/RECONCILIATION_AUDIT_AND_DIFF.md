# Outbound Holidays — Master CMS Audit, Reconciliation & Rollback Plan

**Audit Date:** 20 November 2026  
**Live WordPress Snapshot Source:** `https://outboundholiday.com/wp-json/outbound/v1/content`  
**Theme & Frontend Codebase:** `wordpress-theme/outbound-holidays/` + `src/` + `shared/`

---

## 1. Existing System Architecture Audit

1. **Primary Live CMS:** WordPress Custom Post Types (`accommodation`, `experience`, `package`, `guide_article`, `client_album`) and post meta (`_outbound_*`), managed in `wordpress-theme/outbound-holidays/inc/item-editors.php`, `inc/accommodation-crud.php`, and `inc/cms-hub.php`.
2. **Public Snapshot Pipeline:** `wordpress-theme/outbound-holidays/inc/snapshot.php` (`outbound_build_live_snapshot()`) merges live WordPress CPT posts with the theme baseline `inc/default-snapshot.json` (synced from `src/runtime/published-content.json` via `scripts/build-wp-theme.mjs`).
3. **Frontend Rendering:** React/TypeScript SPA (`wordpress-theme/app-src/wp-main.tsx` -> `assets/app/outbound-app.js`) hydrates from `#outbound-content` or `/wp-json/outbound/v1/content`.
   - **Critical Finding:** `BungeeExperiencePage.tsx` and `BomaExperiencePage.tsx` use `site.editorial.strings` keys rather than `Experience` CPT fields for some copy — including the outdated **140 kg** bungee weight limit, **2 Hours Duration**, **free border pass**, and **$15/$50** hardcoded extras. Both `src/runtime/published-content.json` and the TSX components have been updated.
4. **Live WordPress vs GitHub Fixture Differences Observed:**
   - **Experiences:** Live WordPress has **26** experiences (the 25 source-catalogue items PLUS a manually added `quad-bikes` / "Quad Bikes | $65 | 3 Hours" record). `quad-bikes` is **preserved untouched**.
   - **Accommodations:** Live WordPress has **8** properties (the 4 new properties — Victoria Falls Rainbow Hotel, N1 Hotel & Campsite, Cresta Sprayview, Elephant Hills Resort — do **not** exist in live WP yet). Several existing properties already have manual WordPress admin edits and prices:
     - `victoria-falls-safari-lodge`: `Waterhole View Room` (`$120`)
     - `ilala-lodge-hotel`: `Classic` (`$271`), `Classic Suite` (`$421`), plus manually added `Executive-Suite` (`unit_mwl7albk_l7h2z`)
     - `batonka-guest-lodge`: manually added `Pool View Rooms` (`unit_mwmujusg_8qdgk`)
     - `victoria-falls-hotel`: `Deluxe Room` (`unit_deluxe-bridge-view-room_1`), plus manually added `Premium Rooms` (`unit_mwmwdiyi_ct354`) and `Stables Signature Wing Rooms` (`unit_mwndtgg9_e45j0`)
     - `palm-river-hotel`: `Deluxe Suite` (`unit_deluxe-river-room_1`), plus manually added `Romantic Suite` (`unit_mwnvra0f_r7c7c`) and `Executive Suite` (`unit_mwnw9ftc_8j7pb`)

---

## 2. Experiences Reconciliation Table (25 Researched + 1 Live Custom)

| # | Slug / ID | Live WP Name | Action | Confidence | Live Price Preserved | Key Corrections / Notes |
|---:|---|---|---|---|---:|---|
| 1 | `guided-tour-falls` | Guided Tour of Victoria Falls | Update editorial + private meta | A | US$55 | Guided Tour of the Falls |
| 2 | `upper-zambezi-sunset-cruise` | Upper Zambezi Luxury Sunset Cruise | Update editorial + private meta | B | US$85 | Unconfirmed specific vessel — potential overlap with Zambezi Royal Luxury Pontoon Cruise |
| 3 | `chobe-day-safari` | Chobe National Park Day Safari (Botswana) | Update editorial + private meta | A | US$185 | Classic Chobe Day Trip (distinct from Day Trip with Lunch Cruise) |
| 4 | `flight-of-angels` | Flight of Angels Helicopter Flight | Update editorial + private meta | A | US$150 | 12–13 Min Flight of Angels vs ~22–25 Min Extended Flight |
| 5 | `boma-dinner-show` | The Boma – Dinner & Drum Show | Update editorial + private meta | A | US$55 | Dinner & Drum Show (19:00–22:00) |
| 6 | `lookout-cafe` | Lookout Café & Batoka Gorge Dining | Update editorial + private meta | A | US$25 | Restaurant reservation / optional meal package |
| 7 | `rhino-tracking-safari` | Walking Rhino Tracking Safari | Update editorial + private meta | C | US$110 | Walking vs 4x4 conservation drive unconfirmed |
| 8 | `game-drive-zambezi` | Zambezi National Park Game Drive | Update editorial + private meta | A | US$75 | Morning Game Drive (3–3.5 hours) |
| 9 | `elephant-interaction` | Elephant Sanctuary & Cultural Experience | Update editorial + private meta | B | US$120 | Pick one supplier: Wild Horizons Elephant Encounter vs Shearwater eleCREW |
| 10 | `white-water-rafting` | White Water Rafting on the Zambezi | Update editorial + private meta | A | US$130 | One-Day White Water Rafting (07:30–15:00) |
| 11 | `gorge-swing` | Batoka Gorge Swing & Tandem Jump | Update editorial + private meta | B | US$95 | Solo & Tandem Gorge Swing (distinct from Bridge Swing) |
| 12 | `bungee-jump` | Victoria Falls Bridge Bungee Jump | Update editorial + private meta | A | US$160 | 111m Bridge Bungee Jump (40–120 kg) |
| 13 | `zip-line` | High-Wire Batoka Zip Line | Update editorial + private meta | A | US$75 | High-Wire Batoka Zipline (Solo vs Tandem) |
| 14 | `flying-fox` | Batoka Flying Fox Cable Slide | Update editorial + private meta | B | US$55 | Flying Fox |
| 15 | `jet-boat-gorge` | Extreme Jet Boat Batoka Rapids | Update editorial + private meta | A | US$120 | Batoka Gorge Jetboat |
| 16 | `canopy-tour` | Victoria Falls Rainforest Canopy Tour | Update editorial + private meta | A | US$65 | Victoria Falls Canopy Tour (9 slides + 1 bridge) |
| 17 | `luxury-pontoon-cruise` | Zambezi Royal Luxury Pontoon Cruise | Update editorial + private meta | A | US$110 | Zambezi Royal Sunset Cruise (max 28 guests) |
| 18 | `breakfast-cruise` | Zambezi River Sunrise & Breakfast Cruise | Update editorial + private meta | B | US$75 | Light breakfast (drinks & muffins) vs cooked breakfast vessel |
| 19 | `fishing-trips` | Zambezi Tiger Fishing Excursion | Update editorial + private meta | B | US$140 | Half-day guided tiger fishing |
| 20 | `canoeing-zambezi` | Upper Zambezi Guided Canoe Safari | Update editorial + private meta | B | US$115 | Half Day vs Full Day Guided Canoe Safari |
| 21 | `local-village-tour` | Authentic Zimbabwean Cultural Village Tour | Update editorial + private meta | C | US$45 | Community cultural visit |
| 22 | `art-galleries-markets` | Victoria Falls Craft Markets & Art Galleries | Update editorial + private meta | B | US$35 | Independent browse vs optional guided shopping tour |
| 23 | `hwange-day-safari` | Hwange National Park Full Day Safari | Update editorial + private meta | B | US$210 | Full Day Excursion from Victoria Falls |
| 24 | `livingstone-zambia-tour` | Livingstone Town & Zambian Falls Day Trip | Update editorial + private meta | B | US$95 | 2h Falls-only vs 5h combined town + Falls |
| 25 | `simunye-theatre-show` | Simunye – Spirit of Africa Theatre Show | Update editorial + private meta | A | US$50 | Standard evening performance (Tue–Sun 20:00–21:00) |
| 26 | `quad-bikes` | Quad Bikes | **Preserve untouched** | Live-only | US$65 | Manually added in WP Admin; not in 25-item research |

*Note on Optional Extras (not auto-imported):* `Victoria Falls Bridge Historical Tour` (Shearwater) and `Victoria Falls Crocodile Park` are excluded from auto-import pending commercial decision.

---

## 3. Accommodation Properties Reconciliation Table (12 Properties)

| # | Slug | Property Name | Live WP Status | Action | Live Price Preserved | Notes |
|---:|---|---|---|---|---:|---|
| 1 | `victoria-falls-rainbow-hotel` | Victoria Falls Rainbow Hotel | Not in live WP | Create as **Draft** | Blank (Draft) | 88 rooms total (13 family-bunk & 13 interleading sets are configurations within stock) |
| 2 | `n1-hotel-campsite-victoria-falls` | N1 Hotel & Campsite Victoria Falls | Not in live WP | Create as **Draft** | Blank (Draft) | Hotel Rooms + Dormitory + Campsite (distinct price bases) |
| 3 | `cresta-sprayview` | Cresta Sprayview | Not in live WP | Create as **Draft** | Blank (Draft) | Suite vs Executive Queen naming & Family Room confirmation |
| 4 | `elephant-hills-resort` | Elephant Hills Resort | Not in live WP | Create as **Draft** | Blank (Draft) | 261 Standard + 11 Executive + 1 Presidential (Deluxe Suite conflict) |
| 5 | `victoria-falls-safari-lodge` | Victoria Falls Safari Lodge | Published (2 rooms) | Update property + reconcile rooms | US$280 | Victoria Falls Safari Lodge (72 rooms — distinct from Safari Club / Safari Suites) |
| 6 | `ilala-lodge-hotel` | Ilala Lodge Hotel | Published (3 rooms) | Update property + reconcile rooms | US$271 | 73 rooms across 5 official categories |
| 7 | `pioneers-victoria-falls` | Pioneers Victoria Falls | Published (2 rooms) | Update property + reconcile rooms | US$190 | 50 rooms overall (4 Family Rooms with Annex; remaining standard count inferred, leave blank) |
| 8 | `batonka-guest-lodge` | Batonka Guest Lodge | Published (2 rooms) | Update property + reconcile rooms | US$210 | 11 Garden View + 16 Pool View (5 in Flame Lily Wing included in 16) |
| 9 | `palm-river-hotel` | The Palm River Hotel | Published (3 rooms) | Update property + reconcile rooms | US$520 | 6 official classes (Villa is assembled from Executive Suite + Honeymoon Suite + Twin Deluxe Room) |
| 10 | `lokuthula-lodges` | Lokuthula Lodges | Published (1 rooms) | Update property + reconcile rooms | US$180 | Self-catering (per lodge) vs B&B (per person) |
| 11 | `shearwater-explorers-village` | Shearwater Explorers Village | Published (1 rooms) | Update property + reconcile rooms | US$110 | 2026 live site: 42 Standard + 80 Deluxe + 27 Tents + 5 Stations (2025 PDF listed 54 Deluxe) |
| 12 | `victoria-falls-hotel` | The Victoria Falls Hotel | Published (3 rooms) | Update property + reconcile rooms | US$450 | 8 official categories (149 total: 11 Premium / 4 Deluxe Suites on current site vs 13 / 2 in older PDF) |

---

## 4. Room & Unit Profiles Reconciliation (52 Researched Profiles)

| Property | Researched Unit Name | Type | Size (m²) | Physical Units | Live WP Match | Final Action | Price Basis |
|---|---|---|---:|---:|---|---|---|
| Victoria Falls Rainbow Hotel | Standard Twin Room | Room | Blank | 54 | None | Create as `draft` | `per_room` |
| Victoria Falls Rainbow Hotel | Standard Double Room | Room | Blank | 30 | None | Create as `draft` | `per_room` |
| Victoria Falls Rainbow Hotel | Family Suite | Suite | Blank | 2 | None | Create as `draft` | `per_room` |
| Victoria Falls Rainbow Hotel | Deluxe Suite | Suite | Blank | 2 | None | Create as `draft` | `per_room` |
| N1 Hotel & Campsite Victoria Falls | Standard Double Room | Room | Blank | Blank | None | Create as `draft` | `per_room` |
| N1 Hotel & Campsite Victoria Falls | Standard Twin Room | Room | Blank | Blank | None | Create as `draft` | `per_room` |
| N1 Hotel & Campsite Victoria Falls | Deluxe Double Room | Room | Blank | Blank | None | Create as `draft` | `per_room` |
| N1 Hotel & Campsite Victoria Falls | Superior Double Room | Room | Blank | Blank | None | Create as `draft` | `per_room` |
| N1 Hotel & Campsite Victoria Falls | Family Room | Room | Blank | Blank | None | Create as `draft` | `per_room` |
| N1 Hotel & Campsite Victoria Falls | Dormitory | Dormitory | Blank | Blank | None | Create as `draft` | `per_bed` |
| N1 Hotel & Campsite Victoria Falls | Campsite | Campsite | Blank | Blank | None | Create as `draft` | `per_campsite` |
| Cresta Sprayview | Standard Double Room | Room | Blank | Blank | None | Create as `draft` | `per_room` |
| Cresta Sprayview | Standard Twin Room | Room | Blank | Blank | None | Create as `draft` | `per_room` |
| Cresta Sprayview | Suite / Executive Queen (confirm category label) | Suite | Blank | Blank | None | Create as `draft` | `per_room` |
| Cresta Sprayview | Family Room — pending confirmation | Room | Blank | Blank | None | Create as `draft` | `per_room` |
| Elephant Hills Resort | Standard Room | Room | Blank | 261 | None | Create as `draft` | `per_room` |
| Elephant Hills Resort | Executive Suite | Suite | Blank | 11 | None | Create as `draft` | `per_room` |
| Elephant Hills Resort | Deluxe Suite — supplier confirmation | Suite | Blank | Blank | None | Create as `draft` | `per_room` |
| Elephant Hills Resort | Presidential Suite | Suite | Blank | 1 | None | Create as `draft` | `per_room` |
| Victoria Falls Safari Lodge | Lodge Standard Room | Room | Blank | 24 | None | Create as `draft` | `per_person_sharing` |
| Victoria Falls Safari Lodge | Lodge Waterhole Facing Room | Room | Blank | 42 | `unit_waterhole-view-room_1` (Waterhole View Room) | Update & preserve (`published`) | `per_person_sharing` |
| Victoria Falls Safari Lodge | Lodge Waterhole Facing Suite | Suite | Blank | 6 | `unit_waterhole-view-suite_2` (Waterhole View Suite) | Update & preserve (`published`) | `per_person_sharing` |
| Ilala Lodge Hotel | Classic Rooms | Room | 36 | Blank | `unit_deluxe-garden-room_1` (Classic) | Update & preserve (`published`) | `per_room` |
| Ilala Lodge Hotel | Deluxe Rooms | Room | 44 | Blank | None | Create as `draft` | `per_room` |
| Ilala Lodge Hotel | Classic Suites | Suite | 75 | Blank | `unit_executive-suite_2` (Classic Suite) | Update & preserve (`published`) | `per_room` |
| Ilala Lodge Hotel | Executive Suites | Suite | 104 | Blank | `unit_mwl7albk_l7h2z` (Executive-Suite) | Update & preserve (`published`) | `per_room` |
| Ilala Lodge Hotel | Strathearn Suite | Suite | 128 | 1 | None | Create as `draft` | `per_room` |
| Pioneers Victoria Falls | Standard / King or Twin Room | Room | Blank | Blank | `unit_family-interconnecting-suite_2` (King Rooms) | Update & preserve (`published`) | `per_room` |
| Pioneers Victoria Falls | Family Room with Annex | Room | Blank | 4 | `unit_deluxe-garden-room_1` (Family Rooms) | Update & preserve (`published`) | `per_room` |
| Batonka Guest Lodge | Garden View Room | Room | Blank | 11 | `unit_deluxe-garden-room_1` (Garden View Rooms) | Update & preserve (`published`) | `per_room` |
| Batonka Guest Lodge | Pool View Room | Room | Blank | 16 | `unit_mwmujusg_8qdgk` (Pool View Rooms) | Update & preserve (`published`) | `per_room` |
| The Palm River Hotel | Deluxe Room | Room | Blank | Blank | None | Create as `draft` | `per_room` |
| The Palm River Hotel | Deluxe Suite | Suite | Blank | Blank | `unit_deluxe-river-room_1` (Deluxe Suite) | Update & preserve (`published`) | `per_room` |
| The Palm River Hotel | Executive Suite | Suite | Blank | Blank | `unit_mwnw9ftc_8j7pb` (Executive Suite) | Update & preserve (`published`) | `per_room` |
| The Palm River Hotel | Honeymoon Suite | Suite | Blank | Blank | `unit_mwnvra0f_r7c7c` (Romantic Suite) | Update & preserve (`published`) | `per_room` |
| The Palm River Hotel | Presidential Suite | Suite | Blank | Blank | None | Create as `draft` | `per_room` |
| The Palm River Hotel | Palm River Villa | Villa | Blank | 1 | None | Create as `draft` | `per_villa` |
| Lokuthula Lodges | Two-Bedroom Self-Catering Lodge | Chalet | Blank | Blank | `unit_2-bedroom-thatched-lodge_1` (2-Bedroom Thatched Lodge) | Update & preserve (`published`) | `per_lodge` |
| Lokuthula Lodges | Three-Bedroom Self-Catering Lodge | Chalet | Blank | Blank | None | Create as `draft` | `per_lodge` |
| Lokuthula Lodges | One-Bedroom B&B Lodge Configuration | Chalet | Blank | Blank | None | Create as `draft` | `per_person` |
| Shearwater Explorers Village | Standard Room / Chalet | Chalet | Blank | 42 | `unit_standard-air-con-chalet_1` (Standard Air-Con Chalet) | Update & preserve (`published`) | `per_person_sharing` |
| Shearwater Explorers Village | Deluxe Room / Chalet | Chalet | Blank | 80 | None | Create as `draft` | `per_person_sharing` |
| Shearwater Explorers Village | Serviced Camping Tent | Safari Tent | Blank | 27 | None | Create as `draft` | `per_person` |
| Shearwater Explorers Village | Self-Sufficient Camping Station | Campsite | Blank | 5 | None | Create as `draft` | `per_campsite` |
| The Victoria Falls Hotel | Standard Rooms | Room | Blank | 55 | None | Create as `draft` | `per_room` |
| The Victoria Falls Hotel | Classic Rooms | Room | 30 | 30 | None | Create as `draft` | `per_room` |
| The Victoria Falls Hotel | Stables Signature Wing Rooms | Room | Blank | 44 | `unit_mwndtgg9_e45j0` (Stables Signature Wing Rooms) | Update & preserve (`published`) | `per_room` |
| The Victoria Falls Hotel | Premium Rooms | Room | 55 | 11 | `unit_mwmwdiyi_ct354` (Premium Rooms) | Update & preserve (`published`) | `per_room` |
| The Victoria Falls Hotel | Deluxe Suites | Suite | 70 | 4 | None | Create as `draft` | `per_room` |
| The Victoria Falls Hotel | Executive Suites | Suite | 70 | 3 | None | Create as `draft` | `per_room` |
| The Victoria Falls Hotel | Royal Batoka Suite | Suite | 121 | 1 | None | Create as `draft` | `per_room` |
| The Victoria Falls Hotel | Presidential Suite | Suite | 205 | 1 | None | Create as `draft` | `per_room` |

*Note on Victoria Falls Hotel existing `Deluxe Room` (`unit_deluxe-bridge-view-room_1`):* Preserved non-destructively during automated reconciliation and flagged for manual review/archival once rates and photos are reassigned to the 8 official categories.

---

## 5. Staging Preview & Rollback Procedure

1. **Before Applying on Staging/Production:**
   - Open WordPress Admin → **Outbound CMS → 2026 Reconciliation** (`admin.php?page=outbound-reconciliation-2026`).
   - Click **1. Download Full CMS JSON Backup** to save a local timestamped copy of all CPT posts, meta, and options.
   - Click **2. Run Dry-Run Audit (No Changes)** to verify the exact ID mapping and preserved prices.
2. **Apply Idempotently:**
   - Click **3. Apply Idempotent Reconciliation** (or run `wp outbound reconcile-2026 --apply`).
   - An automatic backup is also stored in `wp_options` under `outbound_reconciliation_2026_backup`.
3. **Rollback Procedure:**
   - If any issue occurs, restore the downloaded JSON backup / database dump, or revert the WordPress theme ZIP to the previous release and clear any WordPress object/page cache (`outbound_invalidate_snapshot_cache()`).
