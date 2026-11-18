import { getPublishedBlogPosts } from '../data/blogData';
import type { PromotionOffer } from '../types/promotion';
import { getWpConfig, resolveAssetUrl } from '../runtime/api';
import { ALL_GUIDE_ARTICLES, getSnapshot } from '../runtime/catalog';
import type { DetailedAccommodation } from '../types/content';
import {
  getPublishedPropertyOffers,
  getPublishedRoomTypes,
  getRoomStartingPriceUSD,
} from './roomPricing';

export const GOOGLE_CSE_ID = '04ba449966f8744d2';

export type GlobalSearchType =
  | 'all'
  | 'accommodation'
  | 'experiences'
  | 'packages'
  | 'blogs'
  | 'offers'
  | 'pages';

export interface GlobalSearchResult {
  id: string;
  title: string;
  type: Exclude<GlobalSearchType, 'all'>;
  typeLabel: string;
  subtype?: 'property' | 'unit';
  propertyName?: string;
  unitName?: string;
  unitId?: string;
  wing?: string;
  category?: string;
  location?: string;
  description: string;
  image?: string;
  url: string;
  priceLabel?: string;
  highlights?: string[];
  score: number;
}

export type GlobalSearchTypeCounts = Record<GlobalSearchType, number>;

export interface GlobalSearchResponse {
  query: string;
  type: GlobalSearchType;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  typeCounts: GlobalSearchTypeCounts;
  results: GlobalSearchResult[];
  source: 'wordpress-cms' | 'local-catalog';
}

export const SEARCH_FILTER_TABS: { id: GlobalSearchType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'experiences', label: 'Experiences' },
  { id: 'packages', label: 'Packages' },
  { id: 'blogs', label: 'Blogs' },
  { id: 'offers', label: 'Offers' },
  { id: 'pages', label: 'Pages' },
];

export function normalizeSearchText(text: string): string {
  return String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase()
    .replace(/[-–—_/]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitHighlightSegments(
  text: string,
  query: string
): { text: string; match: boolean }[] {
  const source = String(text || '');
  const tokens = Array.from(
    new Set(
      normalizeSearchText(query)
        .split(' ')
        .filter((t) => t.length >= 2)
    )
  ).sort((a, b) => b.length - a.length);

  if (!source || tokens.length === 0) {
    return [{ text: source, match: false }];
  }

  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = source.split(regex);

  return parts
    .filter((p) => p !== '')
    .map((part) => {
      const lower = part.toLowerCase();
      const isMatch = tokens.some((t) => lower === t);
      return { text: part, match: isMatch };
    });
}

interface IndexedEntry extends GlobalSearchResult {
  _normTitle: string;
  _normKeywords: string;
  _normBody: string;
}

const INTENT_TYPE_ALIASES: Record<Exclude<GlobalSearchType, 'all'>, Set<string>> = {
  accommodation: new Set([
    'accommodation',
    'stay',
    'stays',
    'room',
    'rooms',
    'hotel',
    'lodge',
    'guesthouse',
    'apartment',
    'villa',
    'chalet',
    'tent',
  ]),
  experiences: new Set([
    'activity',
    'activities',
    'experience',
    'experiences',
    'tour',
    'tours',
    'cruise',
    'helicopter',
    'safari',
  ]),
  packages: new Set(['package', 'packages', 'itinerary', 'holiday', 'holidays']),
  blogs: new Set(['blog', 'article', 'articles', 'guide', 'guides', 'tip', 'tips']),
  offers: new Set(['offer', 'offers', 'promo', 'promotion', 'deal', 'special', 'discount']),
  pages: new Set(['page', 'about', 'contact', 'gallery']),
};

function buildLocalSearchIndex(promotions: PromotionOffer[] = []): IndexedEntry[] {
  const snapshot = getSnapshot();
  const seenIds = new Set<string>();
  const entries: IndexedEntry[] = [];

  const pushEntry = (
    item: Omit<GlobalSearchResult, 'score'>,
    keywords: string[],
    extraText = ''
  ) => {
    if (!item.id || seenIds.has(item.id) || !item.title.trim()) return;
    seenIds.add(item.id);
    entries.push({
      ...item,
      score: 0,
      _normTitle: normalizeSearchText(
        `${item.title} ${item.unitName || ''} ${item.propertyName || ''}`
      ),
      _normKeywords: normalizeSearchText(
        `${item.category || ''} ${item.typeLabel} ${item.location || ''} ${item.wing || ''} ${keywords.join(' ')}`
      ),
      _normBody: normalizeSearchText(`${item.description} ${extraText}`),
    });
  };

  // 1. Accommodations + Published Room Units + Published Property Offers
  for (const rawAcc of (snapshot.accommodations || []) as DetailedAccommodation[]) {
    if (rawAcc.publicationStatus === 'draft' || rawAcc.publicationStatus === 'archived') {
      continue;
    }
    const propSlug = rawAcc.slug || rawAcc.id;
    const propUrl = `/accommodation/${propSlug}`;
    const propHero = resolveAssetUrl(rawAcc.heroImage || '');
    const propTags = (rawAcc.filterTags || []).map((t) => t.replace(/-/g, ' '));
    const propFacilities = (rawAcc.facilities || []).map((f) => f.name);
    const propAmenities = (rawAcc.amenities || []).map((a) => a.replace(/-/g, ' '));

    const publishedRooms = getPublishedRoomTypes(rawAcc);
    for (let ridx = 0; ridx < publishedRooms.length; ridx++) {
      const rm = publishedRooms[ridx];
      const unitId = rm.id || `unit_${ridx + 1}`;
      const startUsd = getRoomStartingPriceUSD(rm, rawAcc);
      const roomImg = resolveAssetUrl(
        rm.imageUrl || rm.gallery?.[0]?.url || rm.galleryImages?.[0] || propHero
      );

      pushEntry(
        {
          id: `unit:${propSlug}:${unitId}`,
          title: `${rm.name} — ${rawAcc.name}`,
          type: 'accommodation',
          typeLabel: rm.unitCategory || 'Room & Unit',
          subtype: 'unit',
          propertyName: rawAcc.name,
          unitName: rm.name,
          unitId,
          ...(rm.wing ? { wing: rm.wing } : {}),
          category: rawAcc.category,
          location: rawAcc.location,
          description: rm.shortDescription || rm.description || rawAcc.shortDescription,
          image: roomImg,
          url: `${propUrl}?unit=${encodeURIComponent(unitId)}#accommodation-units`,
          priceLabel: startUsd ? `From $${Math.round(startUsd)} / night` : 'Price on enquiry',
          highlights: (rm.features || []).slice(0, 3),
        },
        [
          ...(rm.features || []),
          ...(rm.amenities || []),
          ...(rm.customAmenities || []),
          ...(rm.inclusions || []),
          ...(rm.accessibilityFeatures || []),
          ...propTags,
          rm.unitCategory || '',
          rm.occupancy || '',
          rm.wing || '',
          'accommodation',
          'room',
          'stay',
        ],
        `${rm.description} ${rawAcc.shortDescription}`
      );
    }

    pushEntry(
      {
        id: `acc:${propSlug}`,
        title: rawAcc.name,
        type: 'accommodation',
        typeLabel: `Where to Stay · ${rawAcc.category}`,
        subtype: 'property',
        propertyName: rawAcc.name,
        category: rawAcc.category,
        location: rawAcc.location,
        description: rawAcc.shortDescription || rawAcc.tagline || '',
        image: propHero,
        url: propUrl,
        priceLabel:
          rawAcc.priceFromUSD > 0 ? `From $${Math.round(rawAcc.priceFromUSD)}` : 'Price on enquiry',
        highlights: [...propFacilities, ...propAmenities].slice(0, 3),
      },
      [
        ...propFacilities,
        ...propAmenities,
        ...propTags,
        ...publishedRooms.map((r) => r.name),
        'accommodation',
        'where to stay',
        'stay',
        rawAcc.accommodationCategory || '',
        rawAcc.distanceFromFalls || '',
        rawAcc.badge || '',
      ],
      `${rawAcc.editorialOverview} ${rawAcc.whyWeRecommend} ${rawAcc.atAGlance?.bestFor || ''}`
    );

    for (const off of getPublishedPropertyOffers(rawAcc)) {
      pushEntry(
        {
          id: `prop-offer:${propSlug}:${off.id}`,
          title: `${off.title} — ${rawAcc.name}`,
          type: 'offers',
          typeLabel: 'Property Offer',
          category: rawAcc.name,
          location: rawAcc.location,
          description: off.description || `Special offer at ${rawAcc.name}`,
          image: resolveAssetUrl(off.galleryImages?.[0] || propHero),
          url: `${propUrl}?offer=${encodeURIComponent(off.id)}`,
          highlights: (off.includedServices || []).slice(0, 3),
        },
        ['offer', 'special', 'package', 'deal', rawAcc.name, ...(off.includedServices || [])],
        `${off.conditions || ''} ${off.guestRequirements || ''}`
      );
    }
  }

  // 2. Things to Do / Experiences
  for (const exp of snapshot.experiences || []) {
    const expPath =
      exp.id === 'boma-dinner-show'
        ? '/things-to-do/boma-dinner'
        : `/things-to-do/${exp.slug}`;
    const cats = (exp.categories || []).map((c) => c.replace(/-/g, ' '));

    pushEntry(
      {
        id: `exp:${exp.slug || exp.id}`,
        title: exp.title,
        type: 'experiences',
        typeLabel: 'Things to Do',
        category: cats[0] ? cats[0].replace(/\b\w/g, (ch) => ch.toUpperCase()) : 'Activity',
        location: exp.location || 'Victoria Falls',
        description: exp.shortDescription,
        image: resolveAssetUrl(exp.featuredImage || ''),
        url: expPath,
        priceLabel: exp.fromPrice ? `From ${exp.fromPrice}` : '',
        highlights: (exp.highlights || []).slice(0, 3),
      },
      [
        ...cats,
        ...(exp.highlights || []),
        ...(exp.whatsIncluded || []),
        'things to do',
        'activity',
        'activities',
        'experience',
        'tour',
        exp.duration || '',
        exp.subtitle || '',
        exp.badge || '',
      ],
      `${exp.fullOverview || ''} ${exp.whyWeRecommend || ''} ${exp.localExpertTip || ''}`
    );
  }

  // 3. Holiday Packages
  for (const pkg of snapshot.packages || []) {
    const routeLocs = (pkg.routeMap || []).map((r) => `${r.location} ${r.title}`);
    const cats = (pkg.categories || []).map((c) => c.replace(/-/g, ' '));

    pushEntry(
      {
        id: `pkg:${pkg.slug}`,
        title: pkg.title,
        type: 'packages',
        typeLabel: 'Holiday Package',
        category: pkg.duration || 'Holiday Package',
        location: Array.from(new Set((pkg.routeMap || []).map((r) => r.location))).join(', ') || 'Victoria Falls',
        description: pkg.tagline || pkg.description,
        image: resolveAssetUrl(pkg.imageUrl || ''),
        url: `/packages/${pkg.slug}`,
        priceLabel: pkg.priceUSD > 0 ? `From $${Math.round(pkg.priceUSD)} pp` : 'Price on enquiry',
        highlights: (pkg.highlights || []).slice(0, 3),
      },
      [
        ...cats,
        ...routeLocs,
        ...(pkg.highlights || []),
        ...(pkg.included || []),
        'package',
        'holiday',
        'itinerary',
        pkg.travellerType || '',
        pkg.badge || '',
      ],
      `${pkg.description || ''} ${pkg.whyWeRecommend || ''}`
    );
  }

  // 4. Published Blog Posts & Planning Guides
  const seenBlogSlugs = new Set<string>();
  for (const post of getPublishedBlogPosts()) {
    seenBlogSlugs.add(post.slug);
    pushEntry(
      {
        id: `blog:${post.slug}`,
        title: post.title,
        type: 'blogs',
        typeLabel: 'Blog Article',
        category: post.categories?.[0]?.name || 'Travel Blog',
        location: 'Victoria Falls',
        description: post.excerpt || post.subtitle || '',
        image: resolveAssetUrl(post.featuredImage?.url || ''),
        url: `/blog/${post.slug}`,
      },
      [
        ...(post.categories || []).map((c) => c.name),
        ...(post.tags || []).map((t) => t.name),
        'blog',
        'article',
        'guide',
        post.subtitle || '',
      ],
      [
        post.seo?.metaDescription || '',
        post.contentHtml || '',
        ...(post.sections || []).flatMap((s) => [
          s.heading || '',
          ...(s.blocks || []).flatMap((b) => [
            b.content || '',
            b.subheading || '',
            ...(b.items || []),
            b.callout?.title || '',
            b.callout?.content || '',
          ]),
        ]),
      ].join(' ')
    );
  }

  for (const guide of Object.values(ALL_GUIDE_ARTICLES || {})) {
    if (!guide || !guide.title || seenBlogSlugs.has(guide.slug)) continue;
    const url =
      guide.slug === 'first-time-visitor-guide'
        ? '/victoria-falls-guide'
        : `/victoria-falls-guide/${guide.slug}`;
    pushEntry(
      {
        id: `guide:${guide.slug}`,
        title: guide.title,
        type: 'blogs',
        typeLabel: 'Planning Guide',
        category: guide.category || 'Planning Guide',
        location: guide.location || 'Victoria Falls',
        description: guide.subtitle || guide.seo?.metaDescription || '',
        image: resolveAssetUrl(guide.heroImageUrl || ''),
        url,
      },
      [
        ...(guide.quickFacts || []).map((q) => `${q.label} ${q.value}`),
        ...(guide.sections || []).map((s) => s.heading),
        ...(guide.seo?.keywords || []),
        'guide',
        'blog',
        'planning',
      ],
      guide.seo?.metaDescription || ''
    );
  }

  // 5. Active Marketing Promotions
  for (const promo of promotions) {
    if (!promo || !promo.headline) continue;
    const promoHighlights = [
      promo.subtitle || '',
      promo.badgeText || '',
      promo.discountBadgeOverride || '',
    ].filter(Boolean);

    pushEntry(
      {
        id: `promo:${promo.slug || promo.id}`,
        title: promo.headline || promo.name,
        type: 'offers',
        typeLabel: 'Special Offer',
        category: promo.category || 'Promotion',
        location: promo.destinationOrActivity || 'Victoria Falls',
        description: promo.shortDescription || '',
        image: resolveAssetUrl(promo.imageUrl || ''),
        url: promo.offerPageUrl || `/offers/${promo.slug}`,
        priceLabel:
          typeof promo.promotionalPriceUSD === 'number' && promo.promotionalPriceUSD > 0
            ? `Offer $${Math.round(promo.promotionalPriceUSD)}`
            : '',
        highlights: promoHighlights.slice(0, 3),
      },
      [
        'promotion',
        'offer',
        'special',
        'discount',
        promo.name || '',
        promo.subtitle || '',
        promo.badgeText || '',
        promo.campaignCode || '',
        promo.destinationOrActivity || '',
      ],
      `${promo.fullContent || ''} ${promo.termsAndConditions || ''}`
    );
  }

  // 6. Core Public Website Pages
  const fallbackImg = resolveAssetUrl('/Experiences/Guided Tour of the Falls_/5-4.jpg');
  const pages: { id: string; title: string; url: string; desc: string; kw: string[] }[] = [
    {
      id: 'page:home',
      title: 'Outbound Holidays — Victoria Falls Travel Specialists',
      url: '/',
      desc: 'Local Victoria Falls specialists crafting personalized stays, safaris, Chobe day trips, helicopter flights, and river cruises.',
      kw: ['victoria falls', 'holiday', 'planner', 'specialists', 'zimbabwe'],
    },
    {
      id: 'page:accommodation',
      title: 'Where to Stay in Victoria Falls — Hotels, Lodges & Apartments',
      url: '/victoria-falls-accommodation',
      desc: 'Compare luxury river lodges, boutique hotels, guest houses, and self-catering family villas across Victoria Falls.',
      kw: ['accommodation', 'where to stay', 'hotels', 'lodges', 'guesthouses', 'apartments'],
    },
    {
      id: 'page:experiences',
      title: 'Things to Do in Victoria Falls — Cruises, Safaris & Adventure',
      url: '/things-to-do-in-victoria-falls',
      desc: 'Explore Zambezi sunset cruises, Flight of Angels helicopter tours, rainforest walks, game drives, and Chobe safaris.',
      kw: ['things to do', 'experiences', 'tours', 'sunset cruise', 'helicopter', 'chobe', 'safari'],
    },
    {
      id: 'page:packages',
      title: 'Victoria Falls Holiday Packages',
      url: '/victoria-falls-packages',
      desc: 'Tailored holiday packages for couples, families, honeymoons, safari enthusiasts, and first-time visitors.',
      kw: ['holiday packages', 'family', 'romantic', 'honeymoon', 'safari', 'chobe'],
    },
    {
      id: 'page:guide',
      title: 'Victoria Falls Planning Guide',
      url: '/victoria-falls-guide',
      desc: 'Best time to visit, visa requirements, river water levels, flight access, and practical planning tips.',
      kw: ['planning guide', 'visas', 'weather', 'water levels', 'chobe', 'zambia', 'botswana'],
    },
    {
      id: 'page:blog',
      title: 'Victoria Falls Travel Blog & Insider Guides',
      url: '/blog',
      desc: 'Travel tips, accommodation advice, and seasonal Victoria Falls updates from our local team.',
      kw: ['blog', 'articles', 'guides', 'tips', 'stories'],
    },
    {
      id: 'page:gallery',
      title: 'Client Holiday Memories Gallery',
      url: '/client-gallery',
      desc: 'Real guest photographs from Victoria Falls safaris, sunset cruises, helicopter flights, and stays.',
      kw: ['client gallery', 'photos', 'memories', 'albums'],
    },
    {
      id: 'page:about',
      title: 'About Fungai Mtetwa & Outbound Holidays',
      url: '/about',
      desc: 'Meet Victoria Falls travel specialist Fungai Mtetwa and discover our concierge approach.',
      kw: ['about us', 'fungai mtetwa', 'story', 'local concierge', 'victoria falls'],
    },
    {
      id: 'page:contact',
      title: 'Contact Outbound Holidays Victoria Falls',
      url: '/contact',
      desc: 'Speak directly via WhatsApp or email with our Victoria Falls office for tailored stay and tour recommendations.',
      kw: ['contact', 'whatsapp', 'email', 'office', 'victoria falls', 'enquire'],
    },
  ];
  for (const p of pages) {
    pushEntry(
      {
        id: p.id,
        title: p.title,
        type: 'pages',
        typeLabel: 'Website Page',
        category: 'Information',
        description: p.desc,
        image: fallbackImg,
        url: p.url,
      },
      p.kw,
      p.desc
    );
  }

  return entries;
}

export function executeLocalCatalogSearch(params: {
  q: string;
  type?: GlobalSearchType;
  page?: number;
  perPage?: number;
  promotions?: PromotionOffer[];
}): GlobalSearchResponse {
  const cleanQ = String(params.q || '').trim().slice(0, 120);
  const type: GlobalSearchType = params.type || 'all';
  const page = Math.max(1, Math.min(100, params.page ?? 1));
  const perPage = Math.max(1, Math.min(50, params.perPage ?? 12));

  const emptyCounts: GlobalSearchTypeCounts = {
    all: 0,
    accommodation: 0,
    experiences: 0,
    packages: 0,
    blogs: 0,
    offers: 0,
    pages: 0,
  };

  const normQ = normalizeSearchText(cleanQ);
  if (!normQ) {
    return {
      query: cleanQ,
      type,
      page,
      perPage,
      total: 0,
      totalPages: 0,
      typeCounts: emptyCounts,
      results: [],
      source: 'local-catalog',
    };
  }

  const rawTokens = normQ.split(' ').filter((t) => t.length >= 2 || /^\d+$/.test(t));
  const tokens = rawTokens.length > 0 ? rawTokens : [normQ];

  const entries = buildLocalSearchIndex(params.promotions || []);
  const matched: GlobalSearchResult[] = [];

  for (const entry of entries) {
    let score = 0;
    if (entry._normTitle.includes(normQ)) score += 140;
    else if (entry._normKeywords.includes(normQ)) score += 80;
    else if (entry._normBody.includes(normQ)) score += 40;

    let matchedTokens = 0;
    let hasStrongToken = false;

    for (const tok of tokens) {
      let tokHit = false;
      const isIntentAlias = INTENT_TYPE_ALIASES[entry.type]?.has(tok) ?? false;
      const wordRe = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

      if (wordRe.test(entry._normTitle)) {
        score += 70;
        tokHit = true;
        hasStrongToken = true;
      } else if (entry._normTitle.includes(tok)) {
        score += 48;
        tokHit = true;
        hasStrongToken = true;
      }

      if (wordRe.test(entry._normKeywords)) {
        score += 40;
        tokHit = true;
        hasStrongToken = true;
      } else if (entry._normKeywords.includes(tok)) {
        score += 28;
        tokHit = true;
        hasStrongToken = true;
      }

      if (entry._normBody.includes(tok)) {
        score += 18;
        tokHit = true;
      }

      if (isIntentAlias) {
        score += 24;
        tokHit = true;
      }

      if (tokHit) matchedTokens++;
    }

    const tokenCount = tokens.length;
    if (matchedTokens === 0 || (tokenCount > 1 && matchedTokens < tokenCount && !hasStrongToken)) {
      continue;
    }
    if (tokenCount >= 2 && matchedTokens < Math.max(1, Math.ceil(tokenCount * 0.6))) {
      continue;
    }
    if (matchedTokens === tokenCount) score += 65;
    if (entry.subtype === 'unit') score += 6;

    emptyCounts.all++;
    emptyCounts[entry.type]++;

    if (type === 'all' || entry.type === type) {
      const clean = { ...entry } as Partial<IndexedEntry>;
      delete clean._normTitle;
      delete clean._normKeywords;
      delete clean._normBody;
      matched.push({ ...(clean as Omit<GlobalSearchResult, 'score'>), score });
    }
  }

  matched.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const total = matched.length;
  const totalPages = total > 0 ? Math.ceil(total / perPage) : 0;
  const offset = (page - 1) * perPage;

  return {
    query: cleanQ,
    type,
    page,
    perPage,
    total,
    totalPages,
    typeCounts: emptyCounts,
    results: matched.slice(offset, offset + perPage),
    source: 'local-catalog',
  };
}

export function buildSearchRequestUrl(
  endpointBase: string,
  params: { q: string; type?: GlobalSearchType; page?: number; perPage?: number }
): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://outboundholiday.com';
  const cleanBase = String(endpointBase || '').trim();
  // Repair any legacy double-'?' query strings such as /search?ver=123?q=...
  const firstQ = cleanBase.indexOf('?');
  const normalizedBase =
    firstQ === -1
      ? cleanBase
      : cleanBase.slice(0, firstQ + 1) + cleanBase.slice(firstQ + 1).replace(/\?/g, '&');

  const url = /^https?:\/\//i.test(normalizedBase)
    ? new URL(normalizedBase)
    : new URL(normalizedBase.startsWith('/') ? normalizedBase : `/${normalizedBase}`, origin);

  url.searchParams.set('q', params.q);
  url.searchParams.set('type', params.type || 'all');
  url.searchParams.set('page', String(params.page ?? 1));
  url.searchParams.set('per_page', String(params.perPage ?? 12));

  return /^https?:\/\//i.test(normalizedBase)
    ? url.toString()
    : `${url.pathname}${url.search}`;
}

export async function executeGlobalSearch(params: {
  q: string;
  type?: GlobalSearchType;
  page?: number;
  perPage?: number;
  promotions?: PromotionOffer[];
  signal?: AbortSignal;
}): Promise<GlobalSearchResponse> {
  const cleanQ = String(params.q || '').trim().slice(0, 120);
  if (!cleanQ) {
    return executeLocalCatalogSearch({ ...params, q: '' });
  }

  const wpCfg = getWpConfig();
  const endpointBase = wpCfg?.searchUrl || (wpCfg?.restUrl ? `${wpCfg.restUrl.replace(/\/$/, '')}/search` : '');

  if (endpointBase) {
    try {
      const requestUrl = buildSearchRequestUrl(endpointBase, {
        q: cleanQ,
        ...(params.type !== undefined ? { type: params.type } : {}),
        ...(params.page !== undefined ? { page: params.page } : {}),
        ...(params.perPage !== undefined ? { perPage: params.perPage } : {}),
      });
      const resp = await fetch(requestUrl, {
        headers: { Accept: 'application/json' },
        cache: 'no-cache',
        ...(params.signal ? { signal: params.signal } : {}),
      });
      if (resp.ok) {
        const data = (await resp.json()) as GlobalSearchResponse;
        if (data && Array.isArray(data.results)) {
          return data;
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      // Fall back cleanly to local synchronized snapshot index if endpoint is temporarily unreachable.
    }
  }

  return executeLocalCatalogSearch(params);
}
