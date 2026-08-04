import { GuideArticle } from '../types/guide';

import vicFallsIconicImg from '../assets/images/intent_vic_falls_iconic_1785490034846.jpg';
import gorgeHelicopterImg from '../assets/images/intent_gorge_helicopter_zim_1785489759987.jpg';
import familyResortImg from '../assets/images/intent_family_resort_zim_1785489699263.jpg';
import advisorGuideImg from '../assets/images/planning_step2_advisor_1785494096633.jpg';
import founderGuideImg from '../assets/images/furqal_founder_guide_1785494119753.jpg';
import rhinoTrackingImg from '../assets/images/rhino_tracking_drive_1785497819922.jpg';
import bomaDinnerImg from '../assets/images/intent_boma_celebration_zim_1785489746202.jpg';
import romanticDinnerImg from '../assets/images/intent_romantic_dinner_zim_1785489715667.jpg';
import familySafariImg from '../assets/images/family_wildlife_safari_1785488525464.jpg';
import coupleHoneymoonImg from '../assets/images/zimbabwean_couple_honeymoon_1785488512769.jpg';
import bestValueImg from '../assets/images/intent_best_value_zim_1785489229297.jpg';

// ============================================================================
// CMS INTEGRATION POINT:
// In production with a Headless CMS (e.g. Sanity, Strapi, Contentful), replace
// this static dictionary export with an async fetcher function `getGuideArticleBySlug(slug: string)`.
// ============================================================================

export const FIRST_TIME_VISITOR_ARTICLE: GuideArticle = {
  id: 'article-vic-falls-first-time',
  slug: 'first-time-visitor-guide',
  category: 'First-Time Visitor Guide',
  title: 'The Ultimate First-Time Visitor Guide to Victoria Falls',
  subtitle: 'Everything you need to plan a seamless, unforgettable journey to Mosi-oa-Tunya — from side selection and seasonal timing to local insider tips and curated itineraries.',
  heroImageUrl: vicFallsIconicImg,
  heroImageAlt: 'Victoria Falls Mosi-oa-Tunya curtain of falling water with double rainbow in Zimbabwe',
  heroImageCredit: 'Outbound Holidays Editorial Team',
  author: {
    name: 'Farai Moyo',
    role: 'Lead Victoria Falls Travel Specialist',
    avatarUrl: founderGuideImg,
    bio: 'Born in Victoria Falls, Farai has guided over 1,200 travellers through Mosi-oa-Tunya and the Zambezi region over 14 years.'
  },
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 1, 2026',
  readingTime: '14 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'The Ultimate First-Time Visitor Guide to Victoria Falls (2026 Edition)',
    metaDescription: 'Plan your dream trip to Victoria Falls, Zimbabwe. Expert advice on Zimbabwe vs Zambia, best months to visit, visas, luxury lodges, budget tips, and sample itineraries.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/first-time-visitor-guide',
    ogImage: vicFallsIconicImg,
    keywords: ['Victoria Falls travel guide', 'Mosi-oa-Tunya', 'Zimbabwe travel tips', 'Victoria Falls itinerary', 'best time to visit Victoria Falls', 'KAZA Univisa']
  },
  quickFacts: [
    {
      label: 'Best Months to Visit',
      value: 'May to August',
      subtext: 'High water & perfect safari weather',
      iconName: 'Sun'
    },
    {
      label: 'Recommended Stay',
      value: '3 to 4 Days',
      subtext: 'Full experience & easy pace',
      iconName: 'Clock'
    },
    {
      label: 'Visa Requirement',
      value: 'KAZA Univisa ($50)',
      subtext: 'Covers Zimbabwe & Zambia',
      iconName: 'FileText'
    },
    {
      label: 'Primary Currency',
      value: 'USD Cash & Cards',
      subtext: 'USD widely accepted everywhere',
      iconName: 'DollarSign'
    }
  ],
  sections: [
    {
      id: 'understanding-the-falls',
      tocTitle: '1. Understanding Mosi-oa-Tunya',
      heading: 'Understanding Mosi-oa-Tunya: The World’s Greatest Sheet of Falling Water',
      blocks: [
        {
          type: 'text',
          content: 'Straddling the international border between Zimbabwe and Zambia, Victoria Falls is known locally as Mosi-oa-Tunya — "The Smoke That Thunders". At 1,708 metres wide and 108 metres high, it is classified as the largest curtain of falling water in the world based on its combined width and height.'
        },
        {
          type: 'text',
          content: 'Unlike Niagara or Iguazu, Victoria Falls plummets into a narrow, 100-metre deep basalt gorge carved over millions of years by the mighty Zambezi River. The resulting spray can rise over 400 metres into the air and is visible from up to 50 kilometres away during peak water flow.'
        },
        {
          type: 'callout',
          callout: {
            type: 'insight',
            title: 'Local Insight: Why Mosi-oa-Tunya is Unique',
            content: 'The Tonga people named this natural wonder Mosi-oa-Tunya centuries before Scottish explorer David Livingstone first laid eyes on it in 1855. Standing at Danger Point, listening to the roar echo through the gorge, you quickly realise why the name has endured for generations.'
          }
        },
        {
          type: 'pullquote',
          pullQuote: {
            quote: 'Scenes so lovely must have been gazed upon by angels in their flight.',
            author: 'David Livingstone',
            title: 'Scottish Explorer, 1855'
          }
        }
      ]
    },
    {
      id: 'zimbabwe-vs-zambia',
      tocTitle: '2. Zimbabwe vs Zambia Side',
      heading: 'Zimbabwe vs Zambia: Which Side Should First-Timers Choose?',
      blocks: [
        {
          type: 'text',
          content: 'This is the single most common question first-time visitors ask. While both sides offer extraordinary beauty, 75% of the waterfall lies on the Zimbabwean side, offering 16 designated viewing points along a continuous paved rainforest path.'
        },
        {
          type: 'text',
          content: 'Crucially, the Zimbabwean side flows year-round — even during the driest months of October and November when the Zambian side (Eastern Cataract) frequently dries up to bare rock face.'
        },
        {
          type: 'practical_info',
          practicalPanel: {
            title: 'Comparison at a Glance: Zimbabwe vs Zambia',
            subtitle: 'Key factors for deciding your primary accommodation base',
            items: [
              {
                heading: 'Waterfall Views & Access',
                detail: 'Zimbabwe: 16 viewpoints, 75% of waterfall length, year-round water flow. Zambia: 10 viewpoints, dramatic gorge bridge view, Eastern Cataract dries in late dry season.',
                iconName: 'MapPin'
              },
              {
                heading: 'Town Infrastructure & Vibe',
                detail: 'Victoria Falls Town (Zimbabwe) is compact, safe, and walk-friendly with hotels, cafes, and markets within 5-15 mins of the park gates. Livingstone (Zambia) is a larger spread-out city 10km from the Falls.',
                iconName: 'Bed'
              },
              {
                heading: 'Devil’s Pool & Livingstone Island',
                detail: 'Located exclusively on the Zambian side. Easily accessible from Zimbabwe during low-water season (August-January) using the KAZA Univisa day-trip.',
                iconName: 'Sparkles'
              },
              {
                heading: 'Our Local Recommendation',
                detail: 'Base yourself in Victoria Falls, Zimbabwe for superior views, pedestrian charm, and year-round water flow. Cross over to Zambia for a half-day Devil’s Pool excursion.',
                iconName: 'CheckCircle2'
              }
            ]
          }
        },
        {
          type: 'callout',
          callout: {
            type: 'advice',
            title: 'Outbound Advice: The KAZA Univisa Advantage',
            content: 'Do not stress about picking only one country! The KAZA Univisa ($50 USD) grants unlimited travel between Zimbabwe and Zambia for 30 days, plus day trips into Botswana’s Chobe National Park.'
          }
        }
      ]
    },
    {
      id: 'best-time-to-visit',
      tocTitle: '3. Best Time to Visit & Seasons',
      heading: 'Best Time to Visit: Understanding Seasonal Water Levels',
      blocks: [
        {
          type: 'text',
          content: 'The experience of Victoria Falls varies dramatically depending on the month you travel. Rather than spring, summer, autumn, and winter, Victoria Falls operates on three river water seasons.'
        },
        {
          type: 'heading',
          subheading: 'High Water Season (March to May)',
          headingLevel: 'h3'
        },
        {
          type: 'text',
          content: 'Following heavy summer rainfall upstream in Angola and Zambia, the Zambezi River surges over the precipice at immense capacity. Expect thunderous noise, colossal spray mist rising 400 metres, and getting completely soaked in the rainforest park!'
        },
        {
          type: 'heading',
          subheading: 'Medium to Low Water Season (June to August)',
          headingLevel: 'h3'
        },
        {
          type: 'text',
          content: 'The local sweet spot! Spray subsides enough for crystal-clear photography of the geological drop, while water volume remains impressive. Mild, sunny winter weather and superb wildlife safari conditions in Hwange and Chobe.'
        },
        {
          type: 'heading',
          subheading: 'Low Water & Devil’s Pool Season (September to December)',
          headingLevel: 'h3'
        },
        {
          type: 'text',
          content: 'The basalt rock formations become exposed, highlighting the raw geology of the Batoka Gorge. This is the only window when Devil’s Pool swim tours and world-class Class V white-water rafting run safely.'
        },
        {
          type: 'image',
          imageUrl: vicFallsIconicImg,
          imageAlt: 'High water season at Victoria Falls with mist and rainbows',
          imageCaption: 'High water season (April/May) produces thunderous spray mist and dramatic double rainbows over the Batoka Gorge.',
          imageCredit: 'Outbound Holidays Archive'
        }
      ]
    },
    {
      id: 'ideal-length-and-itineraries',
      tocTitle: '4. How Long to Stay & Itineraries',
      heading: 'How Long to Stay & Recommended Itineraries',
      blocks: [
        {
          type: 'text',
          content: 'Many travel agents treat Victoria Falls as a quick 1-night stopover on an African safari itinerary. In our experience, 3 nights / 4 days is the golden standard for a balanced, unhurried holiday.'
        },
        {
          type: 'heading',
          subheading: 'The Perfect 4-Day / 3-Night First-Timer Sample Itinerary',
          headingLevel: 'h3'
        },
        {
          type: 'bullet_list',
          items: [
            'Day 1: Arrival at VFA Airport -> Private Transfer -> Afternoon Luxury Zambezi Sunset Cruise with tapas & gin bar.',
            'Day 2: Morning Guided Rainforest Walk (16 Viewpoints) -> High Tea at Victoria Falls Hotel -> Evening BOMA Dinner & Drum Show.',
            'Day 3: Full-Day Chobe National Park Safari (Botswana) — River boat game drive + land 4x4 game drive with lions & elephant herds.',
            'Day 4: Morning "Flight of Angels" 13-min Helicopter Flight over the Gorge -> Artisan souvenir shopping -> Airport Transfer.'
          ]
        },
        {
          type: 'callout',
          callout: {
            type: 'recommendation',
            title: 'Our Recommendation: Don’t Rush Day 2',
            content: 'Take a relaxed 2.5 hours for the guided rainforest walk. Having a private local guide makes all the difference in explaining geology, flora, bird species, and hidden photography spots.'
          }
        }
      ]
    },
    {
      id: 'must-do-experiences',
      tocTitle: '5. Must-Do Experiences',
      heading: 'Top 5 Essential Victoria Falls Experiences',
      blocks: [
        {
          type: 'text',
          content: 'While Victoria Falls offers over 35 distinct activities — from peaceful wildlife river cruises to adrenaline bungee jumping — these five experiences should form the backbone of any first-timer’s trip:'
        },
        {
          type: 'practical_info',
          practicalPanel: {
            title: 'The Big 5 Experiences in Victoria Falls',
            subtitle: 'Ranked by customer feedback & local specialist recommendation',
            items: [
              {
                heading: '1. Guided Victoria Falls Rainforest Tour',
                detail: 'Walk along the cliff edge accompanied by a certified local specialist. Learn about Mosi-oa-Tunya National Park flora, rainforest ecology, and historic vantage points.',
                iconName: 'Compass'
              },
              {
                heading: '2. Zambezi Sunset River Cruise',
                detail: 'Glide along the calm upper Zambezi river above the Falls. Enjoy complimentary champagne, local snacks, and elephant sightings along the riverbanks as the sun sets.',
                iconName: 'Sun'
              },
              {
                heading: '3. "Flight of Angels" Helicopter Tour',
                detail: 'A 13-minute or 25-minute scenic helicopter flight over Victoria Falls, Batoka Gorge, and Zambezi National Park. Offers breathtaking perspective of the entire geological structure.',
                iconName: 'Plane'
              },
              {
                heading: '4. Full-Day Chobe Safari Day Trip',
                detail: 'Cross into Botswana for a morning game boat cruise on Chobe River and afternoon 4x4 game drive in Chobe National Park, home to over 50,000 African elephants.',
                iconName: 'ShieldCheck'
              },
              {
                heading: '5. The BOMA Dinner & Drum Show',
                detail: 'An authentic feast celebrating Zimbabwean culture, local delicacies (including Mopane worms for the brave!), traditional dancers, and interactive djembe drumming.',
                iconName: 'Sparkles'
              }
            ]
          }
        },
        {
          type: 'image',
          imageUrl: gorgeHelicopterImg,
          imageAlt: 'Helicopter flight over Batoka Gorge Victoria Falls',
          imageCaption: 'The "Flight of Angels" helicopter experience provides an unforgettable aerial view of the 1.7km waterfall curtain and gorge system.',
          imageCredit: 'Outbound Helicopters'
        }
      ]
    },
    {
      id: 'where-to-stay',
      tocTitle: '6. Where to Stay Guide',
      heading: 'Where to Stay: Selecting Your Ideal Accommodation Base',
      blocks: [
        {
          type: 'text',
          content: 'Victoria Falls offers a diverse accommodation spectrum — ranging from historic grand hotels and luxury riverfront lodges to family safari resorts and charming boutique guest houses.'
        },
        {
          type: 'text',
          content: 'When choosing where to stay, consider whether you prefer walking access to town and restaurants, or an exclusive wilderness retreat tucked along the Zambezi Riverbank.'
        },
        {
          type: 'bullet_list',
          items: [
            'Luxury River Lodges (e.g. Palm River Hotel, Matetsi Victoria Falls, Old Drift Lodge): Private riverfront setting, game viewing, fine dining, inclusive activities.',
            'Grand Historic Hotels (e.g. The Victoria Falls Hotel): Colonial elegance, direct private path to the Falls, famous view of the Victoria Falls Bridge.',
            'Boutique Hotels & Lodges (e.g. Pioneers Lodge, Ilala Lodge, Batonka Guest Lodge): Intimate atmosphere, walking distance to town, superb value and personalized hospitality.',
            'Family Resorts (e.g. Victoria Falls Safari Lodge, Kingdom Hotel): On-site waterholes with vultures and wildlife, pool decks, children’s programs.'
          ]
        },
        {
          type: 'image',
          imageUrl: familyResortImg,
          imageAlt: 'Luxury resort terrace overlooking Zambezi bushveld',
          imageCaption: 'Enjoying afternoon tea on a resort terrace overlooking natural waterholes where wild elephants and buffalo gather.',
          imageCredit: 'Outbound Accommodation Collection'
        }
      ]
    },
    {
      id: 'visas-money-health',
      tocTitle: '7. Visas, Money & Health',
      heading: 'Practical Information: Visas, Currency, Health & Safety',
      blocks: [
        {
          type: 'text',
          content: 'Smooth logistics make all the difference. Here is what every traveler needs to know before boarding their flight to Victoria Falls International Airport (VFA):'
        },
        {
          type: 'practical_info',
          practicalPanel: {
            title: 'Essential Travel Prep Checklist',
            subtitle: 'Key logistics verified as of August 2026',
            items: [
              {
                heading: 'Visas & Immigration',
                detail: 'Most passport holders (UK, USA, EU, Canada, Australia) qualify for a KAZA Univisa ($50 USD cash at VFA arrival or online e-Visa). Passports must have at least 6 months validity and 3 blank pages.',
                iconName: 'FileText'
              },
              {
                heading: 'Currency & Cash Handling',
                detail: 'US Dollars (USD) are the official transaction currency in Victoria Falls. Bring crisp USD bills printed in 2013 or later ($1, $5, $10, $20 notes are essential for tipping and local markets). Major credit cards accepted at hotels.',
                iconName: 'DollarSign'
              },
              {
                heading: 'Malaria & Medical Prep',
                detail: 'Victoria Falls is located in a low-to-moderate malaria zone. Consult your travel doctor about prophylactic medications (e.g. Atovaquone/Proguanil). Pack insect repellent containing DEET.',
                iconName: 'ShieldCheck'
              },
              {
                heading: 'Safety & Wildlife in Town',
                detail: 'Victoria Falls Town is safe and welcoming. However, remember wild warthogs, baboons, and occasionally elephants roam near town boundaries. Keep a respectful distance and avoid carrying exposed food.',
                iconName: 'Heart'
              }
            ]
          }
        }
      ]
    }
  ],
  travellerTypes: [
    {
      id: 'couples-honeymooners',
      title: 'Couples & Honeymooners',
      tagline: 'Romantic riverfront dinners, private helicopter flights, and serene sunset cruises.',
      idealFor: 'Romance, anniversary celebrations, luxury escapes',
      topTip: 'Book a luxury river lodge with a private plunge pool and arrange a private candlelit Zambezi deck dinner.',
      recommendedDuration: '4 Nights / 5 Days',
      imageUrl: coupleHoneymoonImg
    },
    {
      id: 'families-kids',
      title: 'Families with Children',
      tagline: 'Safe, engaging wildlife encounters, cultural drum shows, and swimming pools.',
      idealFor: 'Multi-generational trips, nature education, active families',
      topTip: 'Choose a resort with interconnected rooms and waterhole views where kids can spot wildlife safely from the pool.',
      recommendedDuration: '3 Nights / 4 Days',
      imageUrl: familySafariImg
    },
    {
      id: 'solo-explorers',
      title: 'Solo Travelers',
      tagline: 'Welcoming local guides, social small-group excursions, and walking tours.',
      idealFor: 'Independent adventurers, culture seekers, photographers',
      topTip: 'Stay at a central boutique lodge like Pioneers or Batonka and join small-group guided tours for camaraderie.',
      recommendedDuration: '3 Nights',
      imageUrl: bestValueImg
    },
    {
      id: 'thrill-seekers',
      title: 'Thrill Seekers & Adventurers',
      tagline: 'Class V white-water rafting, gorge swings, bungee jumping, and Devil’s Pool.',
      idealFor: 'Adrenaline junkies, group friends, active outdoors',
      topTip: 'Visit between August and December to combine white-water rafting on the Zambezi with Devil’s Pool.',
      recommendedDuration: '4 Nights',
      imageUrl: gorgeHelicopterImg
    }
  ],
  faqs: [
    {
      question: 'Which airport should I fly into for Victoria Falls?',
      answer: 'Fly directly into Victoria Falls International Airport (VFA) in Zimbabwe. It is a modern, international airport situated just 20 minutes drive from Victoria Falls town center. Direct flights are available daily from Johannesburg (JNB), Cape Town (CPT), and Windhoek (WDH).',
      category: 'Arrival'
    },
    {
      question: 'Is Victoria Falls safe for tourists?',
      answer: 'Yes, Victoria Falls is one of the safest tourist destinations in Africa. The town relies heavily on tourism, and local police and community watch keep the area extremely secure. Locals are renowned for their warm hospitality.',
      category: 'Safety'
    },
    {
      question: 'Do I need cash in US Dollars or can I use cards?',
      answer: 'While hotels and upscale restaurants accept international Visa and Mastercard, USD cash is essential for park entry fees, local craft markets, tips, and small cafes. Bring crisp USD bills in small denominations ($1, $5, $10, $20) printed in 2013 or later.',
      category: 'Money'
    },
    {
      question: 'What should I pack for the Victoria Falls Rainforest tour?',
      answer: 'During high and medium water seasons (March–July), expect heavy mist. Bring a light waterproof rain poncho, quick-dry shorts/t-shirt, sturdy non-slip sandals or waterproof shoes, and a dry bag or waterproof case for your phone and camera.',
      category: 'Packing'
    },
    {
      question: 'Can I visit both Zimbabwe and Zambia in one trip?',
      answer: 'Absolutely! The Victoria Falls Bridge connects the two border posts. With the $50 KAZA Univisa, you can cross between Zimbabwe and Zambia as many times as you like during a 30-day period.',
      category: 'Visas'
    }
  ],
  relatedGuides: [
    {
      slug: 'best-time-to-visit',
      title: 'Best Time to Visit Victoria Falls: Water Levels & Seasons',
      category: 'Seasonal Guide',
      readTime: '8 min read',
      summary: 'Detailed month-by-month breakdown of water levels, weather temperatures, wildlife activity, and optimal travel windows.',
      imageUrl: vicFallsIconicImg,
      badge: 'Popular'
    },
    {
      slug: 'where-to-stay',
      title: 'Where to Stay: Victoria Falls Hotel & Lodge Comparison',
      category: 'Accommodation Guide',
      readTime: '10 min read',
      summary: 'In-depth review of luxury riverfront lodges, historic heritage hotels, and budget-friendly boutique guest houses.',
      imageUrl: familyResortImg,
      badge: 'Updated'
    },
    {
      slug: 'budget-guide',
      title: 'Victoria Falls Budget Guide: Realistic Costs & Saving Tips',
      category: 'Planning & Costs',
      readTime: '7 min read',
      summary: 'Breakdown of daily meal costs, park fees, accommodation tiers, activity pricing, and how to maximize your trip value.',
      imageUrl: bestValueImg
    },
    {
      slug: 'visa-guide',
      title: 'Victoria Falls Visa & Entry Requirements Guide',
      category: 'Logistics',
      readTime: '6 min read',
      summary: 'Step-by-step instructions for obtaining the $50 KAZA Univisa, border crossing rules, and airport entry procedures.',
      imageUrl: advisorGuideImg
    }
  ]
};

// Secondary guide articles for full template reusability support
export const BEST_TIME_ARTICLE: GuideArticle = {
  ...FIRST_TIME_VISITOR_ARTICLE,
  id: 'article-best-time-to-visit',
  slug: 'best-time-to-visit',
  category: 'Seasonal Guide',
  title: 'Best Time to Visit Victoria Falls: Seasons & Water Flow',
  subtitle: 'A complete month-by-month insider breakdown of waterfall volume, safari conditions, weather, and seasonal highlights.',
  seo: {
    metaTitle: 'Best Time to Visit Victoria Falls | Month-by-Month Guide (2026)',
    metaDescription: 'Find out the best month to visit Victoria Falls. Compare high water season, low water rafting, and safari months with local expert insights.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/best-time-to-visit',
    ogImage: vicFallsIconicImg,
    keywords: ['best time to visit victoria falls', 'victoria falls high water', 'devils pool timing']
  }
};

export const WHERE_TO_STAY_ARTICLE: GuideArticle = {
  ...FIRST_TIME_VISITOR_ARTICLE,
  id: 'article-where-to-stay',
  slug: 'where-to-stay',
  category: 'Accommodation Guide',
  title: 'Where to Stay in Victoria Falls: Lodges, Hotels & Resorts',
  subtitle: 'Compare riverfront luxury retreats, central boutique hotels, and family safari resorts with honest local reviews.',
  seo: {
    metaTitle: 'Where to Stay in Victoria Falls | Lodges & Hotels Guide',
    metaDescription: 'Explore the best places to stay in Victoria Falls, Zimbabwe. Expert lodge reviews, pricing tiers, and neighborhood recommendations.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/where-to-stay',
    ogImage: familyResortImg,
    keywords: ['where to stay victoria falls', 'victoria falls lodges', 'victoria falls hotel']
  }
};

export const BUDGET_GUIDE_ARTICLE: GuideArticle = {
  ...FIRST_TIME_VISITOR_ARTICLE,
  id: 'article-budget-guide',
  slug: 'budget-guide',
  category: 'Planning & Costs',
  title: 'Victoria Falls Trip Cost & Budgeting Guide',
  subtitle: 'How much does a trip to Victoria Falls cost? Realistic price breakdowns for accommodation, park fees, dining, and activities.',
  seo: {
    metaTitle: 'Victoria Falls Trip Cost & Budget Guide (2026)',
    metaDescription: 'Comprehensive budget planning for Victoria Falls. Detailed costs for luxury, mid-range, and value travellers.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/budget-guide',
    ogImage: bestValueImg,
    keywords: ['victoria falls trip cost', 'victoria falls budget', 'how much is victoria falls']
  }
};

export const VISA_GUIDE_ARTICLE: GuideArticle = {
  ...FIRST_TIME_VISITOR_ARTICLE,
  id: 'article-visa-guide',
  slug: 'visa-guide',
  category: 'Logistics',
  title: 'Victoria Falls Visa & Entry Requirements Guide',
  subtitle: 'Everything about the $50 KAZA Univisa, passport rules, border crossings between Zimbabwe and Zambia, and customs tips.',
  seo: {
    metaTitle: 'Victoria Falls Visa Requirements & KAZA Univisa Guide',
    metaDescription: 'Official guidance on Victoria Falls visas. Learn how to get the KAZA Univisa on arrival at Victoria Falls Airport.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/visa-guide',
    ogImage: advisorGuideImg,
    keywords: ['victoria falls visa', 'kaza univisa', 'zimbabwe visa on arrival']
  }
};

export const PACKING_GUIDE_ARTICLE: GuideArticle = {
  ...FIRST_TIME_VISITOR_ARTICLE,
  id: 'article-packing-guide',
  slug: 'packing-guide',
  category: 'Packing Checklist',
  title: 'What to Pack for Victoria Falls: Complete Essentials List',
  subtitle: 'The definitive seasonal packing list — from waterproof gear for the rainforest mist to safari attire and health items.',
  seo: {
    metaTitle: 'What to Pack for Victoria Falls | Essential Packing List',
    metaDescription: 'Complete Victoria Falls packing checklist. Rainforest rain gear, safari clothing, camera gear protection, and doctor tips.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/packing-guide',
    ogImage: vicFallsIconicImg,
    keywords: ['what to pack for victoria falls', 'victoria falls packing list']
  }
};

export const ALL_GUIDE_ARTICLES: Record<string, GuideArticle> = {
  'first-time-visitor-guide': FIRST_TIME_VISITOR_ARTICLE,
  'best-time-to-visit': BEST_TIME_ARTICLE,
  'where-to-stay': WHERE_TO_STAY_ARTICLE,
  'budget-guide': BUDGET_GUIDE_ARTICLE,
  'visa-guide': VISA_GUIDE_ARTICLE,
  'packing-guide': PACKING_GUIDE_ARTICLE,
};
