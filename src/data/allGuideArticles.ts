import { GuideArticle } from '../types/guide';
import { MASTER_FIRST_TIME_VISITOR_GUIDE } from './masterGuideData';

// Public image paths for experiences
const vicFallsIconicImg = '/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
const gorgeHelicopterImg = '/Experiences/Flight of Angels/Heli-1-1-scaled.jpg';
const familyResortImg = '/Experiences/Guided Tour of the Falls_/Tour-of-the-falls-7-scaled.jpg';
const founderGuideImg = '/Experiences/Elephant Interaction_/elecrew-5.jpg';
const bomaDinnerImg = '/Experiences/Boma Dinner_/IMG_0364.JPG';
const romanticDinnerImg = '/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
const familySafariImg = '/Experiences/Game Drive/Game-drive-10-1-scaled.jpg';
const coupleHoneymoonImg = '/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
const bestValueImg = '/Experiences/Chobe Day Trip_/Chobe-1-1-scaled.jpg';

// Standard Author Object
const LOCAL_SPECIALISTS_AUTHOR = {
  name: 'Outbound Holidays Local Specialists',
  role: 'Victoria Falls Travel & Safari Specialists',
  avatarUrl: founderGuideImg,
  bio: 'Based in Victoria Falls, Zimbabwe. We spend every day helping travellers from around the world plan memorable, seamless holidays.'
};

// 1. FIRST TIME VISITOR OVERVIEW ARTICLE (FLAGSHIP)
export const FIRST_TIME_VISITOR_ARTICLE: GuideArticle = MASTER_FIRST_TIME_VISITOR_GUIDE;

// 2. BEST TIME TO VISIT VICTORIA FALLS
export const BEST_TIME_TO_VISIT_ARTICLE: GuideArticle = {
  id: 'article-best-time-to-visit',
  slug: 'best-time-to-visit',
  category: 'Plan Your Visit',
  title: 'Best Time to Visit Victoria Falls: A Local Guide',
  subtitle: 'Understand the three distinct travel seasons of Mosi-oa-Tunya to choose the perfect months for your waterfall, safari, or adventure holiday.',
  heroImageUrl: vicFallsIconicImg,
  heroImageAlt: 'Victoria Falls flowing at peak power with rainbow spray in Zimbabwe',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '8 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Best Time to Visit Victoria Falls: A Local Guide | Outbound Holidays',
    metaDescription: 'Expert local guide on the best time to visit Victoria Falls, Zimbabwe. Learn about High Water, Dry Season, and Low Water months for safari and rafting.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/best-time-to-visit',
    ogImage: vicFallsIconicImg,
    keywords: ['best time to visit Victoria Falls', 'High Water Victoria Falls', 'Victoria Falls dry season', 'Batoka gorge rafting season']
  },
  quickFacts: [
    { label: 'High Water Peak', value: 'March to May', subtext: 'Thunderous flow & dramatic spray', iconName: 'Sun' },
    { label: 'Best All-Rounder', value: 'May to August', subtext: 'Clear views, pleasant weather & safari', iconName: 'Sparkles' },
    { label: 'Rafting & Gorge Views', value: 'August to December', subtext: 'Low water & clear basalt cliffs', iconName: 'Clock' },
    { label: 'Peak Safari Season', value: 'June to October', subtext: 'Animals congregate at waterholes', iconName: 'CheckCircle2' }
  ],
  sections: [
    {
      id: 'best-time-intro',
      tocTitle: 'Seasonal Overview',
      heading: 'When Is the Best Time to Visit Victoria Falls?',
      blocks: [
        {
          type: 'text',
          content: 'Wondering when to visit Victoria Falls? The answer depends on what you want to experience. Whether you’re hoping to see the Falls at their most powerful, enjoy a sunset cruise on the Zambezi, spot wildlife on safari, or plan a romantic honeymoon, this guide will help you choose the best time for your trip.'
        },
        {
          type: 'text',
          content: 'One of the first questions we’re asked is: "When is the best time to visit Victoria Falls?" Our answer is always the same: It depends on what kind of holiday you want.'
        },
        {
          type: 'text',
          content: 'Unlike many destinations, Victoria Falls changes dramatically throughout the year. The volume of water flowing over the Falls rises and falls with the seasons, transforming not only the appearance of the waterfall but also the experiences available to visitors.'
        },
        {
          type: 'text',
          content: 'During some months, you’ll witness immense walls of water crashing into the gorge, sending mist hundreds of metres into the air. At other times, the spray clears to reveal the full basalt cliff face, making it easier to appreciate the incredible scale of the Falls and opening up seasonal adventures like white-water rafting.'
        }
      ]
    },
    {
      id: 'three-seasons',
      tocTitle: 'The 3 Travel Seasons',
      heading: 'Understanding the Three Travel Seasons',
      blocks: [
        {
          type: 'heading',
          subheading: '1. High Water Season (February to May)'
        },
        {
          type: 'text',
          content: 'This is when the Zambezi River is at its fullest, creating the dramatic spectacle that many people imagine when they think of Victoria Falls. The roar of the water can be heard from kilometres away, and towering clouds of spray give the Falls their local name, Mosi-oa-Tunya—“The Smoke That Thunders.”'
        },
        {
          type: 'text',
          content: 'Walking through the rainforest during these months is an unforgettable experience. The air is cool with mist, lush vegetation surrounds the pathways, and rainbows often appear throughout the day. However, there is a trade-off: the sheer volume of water and spray can make it difficult to see the entire waterfall from some viewpoints. On windy days, you’ll almost certainly get wet, so a lightweight rain jacket or poncho is highly recommended.'
        },
        {
          type: 'bullet_list',
          items: [
            'Best for first-time visitors wanting maximum flow spectacle',
            'Photographers looking for towering mist and vivid rainbows',
            'Nature lovers appreciating the lush rainforest environment',
            'Scenic Flight of Angels helicopter flights'
          ]
        },
        {
          type: 'heading',
          subheading: '2. Dry Season (June to August)'
        },
        {
          type: 'text',
          content: 'For many travellers, this is the sweet spot. The weather is pleasantly warm during the day, mornings are cool, and rainfall is very unlikely. The spray begins to reduce, revealing more of the cliff face while still showcasing an impressive volume of water. These months are also ideal for combining Victoria Falls with a safari, as wildlife viewing improves in nearby national parks.'
        },
        {
          type: 'callout',
          callout: {
            type: 'recommendation',
            title: '⭐ Outbound Recommendation: May Through August',
            content: 'If you’re visiting Victoria Falls for the first time and your travel dates are flexible, May through August provides one of the best overall combinations of spectacular waterfall views, pleasant temperatures, and outstanding safari opportunities.'
          }
        },
        {
          type: 'heading',
          subheading: '3. Low Water Season (September to January)'
        },
        {
          type: 'text',
          content: 'By late winter and into summer, the Zambezi River reaches its lowest levels. Although the waterfall is less dramatic than during peak flow, visitors gain a completely different perspective. The reduced spray allows you to appreciate the immense basalt cliffs and geological formations carved by the river over thousands of years.'
        },
        {
          type: 'text',
          content: 'This season is also when many of Victoria Falls’ adventure activities are at their best. White-water rafting typically operates under the most favourable river conditions, and visibility throughout the gorge is exceptional. It’s also a fantastic time for wildlife enthusiasts, as animals congregate around remaining water sources in surrounding parks.'
        }
      ]
    },
    {
      id: 'which-season-choice',
      tocTitle: 'Which Season to Choose',
      heading: 'Which Season Do We Recommend?',
      blocks: [
        {
          type: 'bullet_list',
          items: [
            'Choose March to May if... You want to experience the Falls at their most powerful and don’t mind getting a little wet. This is the most dramatic time of year, with thunderous water, lush rainforest, and spectacular rainbows.',
            'Choose May to August if... You want the best all-round holiday. Comfortable temperatures, impressive waterfall views, excellent safari conditions, and a full range of activities make this our favourite period for first-time visitors.',
            'Choose September to October if... Adventure activities and wildlife are your priority. The Falls are easier to view, rafting conditions are excellent, and animals are easier to spot in nearby national parks.',
            'Choose November to January if... You’re looking for fewer visitors, greener landscapes, and don’t mind occasional afternoon showers. The rainy season begins to transform the landscape, creating a fresh and vibrant environment.'
          ]
        },
        {
          type: 'callout',
          callout: {
            type: 'insight',
            title: '📍 Local Insight: Have You Missed the Best Season?',
            content: 'Travellers often ask us whether they’ve "missed the best season." The answer is almost always no. Every month offers a different perspective on Victoria Falls. Some visitors are captivated by the thunderous power of high water, while others fall in love with crystal-clear views and dramatic gorge scenery during low water. Rather than asking "What’s the best month?", we encourage travellers to ask "What kind of experience do I want?" That’s the question that leads to the right answer.'
          }
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'month-by-month-guide', title: 'Victoria Falls Month-by-Month Guide', category: 'Plan Your Visit', readTime: '7 min read', summary: 'Detailed monthly weather, flow levels, and activity schedules.', imageUrl: familyResortImg, badge: 'Monthly Breakdown' },
    { slug: 'weather-guide', title: 'Victoria Falls Weather & Packing Guide', category: 'Plan Your Visit', readTime: '6 min read', summary: 'Temperatures, rainfall charts, and what to pack for each season.', imageUrl: bestValueImg, badge: 'Packing Tips' }
  ]
};

// 3. MONTH BY MONTH GUIDE
export const MONTH_BY_MONTH_ARTICLE: GuideArticle = {
  id: 'article-month-by-month',
  slug: 'month-by-month-guide',
  category: 'Plan Your Visit',
  title: 'Victoria Falls Month-by-Month Guide',
  subtitle: 'A comprehensive local breakdown of every month in Victoria Falls, covering river levels, wildlife, weather, and recommended activities.',
  heroImageUrl: familyResortImg,
  heroImageAlt: 'Victoria Falls rainbow over green rainforest landscape in Zimbabwe',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '10 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Victoria Falls Month-by-Month Guide | Outbound Holidays',
    metaDescription: 'Detailed month-by-month breakdown of Victoria Falls weather, waterfall levels, wildlife viewing, and travel recommendations from local specialists.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/month-by-month-guide',
    ogImage: familyResortImg,
    keywords: ['Victoria Falls monthly weather', 'Victoria Falls water levels by month', 'Victoria Falls in May', 'Victoria Falls in July']
  },
  quickFacts: [
    { label: 'Highest Flow', value: 'April & May', subtext: 'Maximum spray & roaring thunder', iconName: 'Sun' },
    { label: 'Best Safari', value: 'July to October', subtext: 'Dry bush & animal concentrations', iconName: 'CheckCircle2' },
    { label: 'White-Water Rafting', value: 'Aug to Dec', subtext: 'Optimal river level & rapids', iconName: 'Clock' },
    { label: 'Quietest Months', value: 'Jan, Feb & Nov', subtext: 'Lush greenery & fewer visitors', iconName: 'Sparkles' }
  ],
  sections: [
    {
      id: 'month-matrix',
      tocTitle: 'Month-by-Month Table',
      heading: 'Victoria Falls Month-by-Month Comparison Table',
      blocks: [
        {
          type: 'text',
          content: 'Every month offers something different in Victoria Falls. Whether you’re looking for dramatic waterfall views, incredible wildlife encounters, adventure activities or quieter travel periods, understanding how the destination changes throughout the year will help you plan the holiday that’s right for you.'
        },
        {
          type: 'table',
          table: {
            title: 'Complete 12-Month Travel Breakdown',
            headers: ['Month', 'Atmosphere & Waterfall State', 'Key Highlights & Best For', 'Outbound Local Tip'],
            rows: [
              ['January', 'Warm, Green & Refreshingly Quiet', 'Short afternoon storms, lush green rainforest, lower visitor numbers.', 'Pack lightweight clothing & rain jacket; do morning activities.'],
              ['February', 'The Falls Begin to Come Alive', 'River flow rising, towering mist clouds, vibrant rainbows.', 'Wonderful time for photography before peak busy season.'],
              ['March', 'Nature at Full Power', 'Thundering water, echoing roar, peak lushness in the rainforest.', 'Bring waterproof camera protection or a poncho.'],
              ['April', 'One of Our Favourite Months ⭐', 'Maximum waterfall flow, comfortable walking temperatures.', 'Unbeatable spectacle of power and beauty.'],
              ['May', 'The Perfect Balance ⭐', 'Spectacular water, clearing spray, warm days & cool evenings.', 'Best overall all-round month for first-timers.'],
              ['June', 'Comfortable Days & Safari Peak', 'Crisp winter mornings, warm afternoons, outstanding wildlife viewing.', 'Bring a light fleece for early morning game drives.'],
              ['July', 'Peak Travel Season', 'Perfect weather, excellent safari conditions, all tours operating.', 'Book accommodation several months in advance.'],
              ['August', 'Adventure Season Begins', 'Clear gorge visibility, white-water rafting resumes, great safari.', 'Ideal balance between sightseeing, adventure & safari.'],
              ['September', 'Wildlife at Its Best', 'Animals concentrate at waterholes, dramatic geological cliff views.', 'Outstanding for Big 5 safaris & rafting.'],
              ['October', 'Hot Days & Incredible Wildlife', 'Peak wildlife concentration, clear blue skies, warm weather.', 'Schedule outdoor activities early in the morning.'],
              ['November', 'The First Rains Arrive', 'Trees regain leaves, quiet atmosphere, birdwatching paradise.', 'Attractive option for travellers seeking quieter stays.'],
              ['December', 'Festive Season Atmosphere', 'Lively holiday vibe, rising river levels, green scenery.', 'Book Christmas & New Year dates well in advance.']
            ]
          }
        },
        {
          type: 'callout',
          callout: {
            type: 'recommendation',
            title: '⭐ Our Local Recommendation Summary',
            content: '• For first-time visitors: May to August offers the best all-round experience.\n• For the most powerful waterfall: March to May is unbeatable.\n• For wildlife and safaris: June to October is ideal.\n• For adventure activities: August to October is hard to beat.\n• For fewer crowds and lush scenery: January, February and November are excellent choices.'
          }
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'best-time-to-visit', title: 'Best Time to Visit Victoria Falls: A Local Guide', category: 'Plan Your Visit', readTime: '8 min read', summary: 'Seasonal breakdown of High Water, Dry, and Low Water periods.', imageUrl: vicFallsIconicImg, badge: 'Overview' },
    { slug: 'weather-guide', title: 'Victoria Falls Weather & Packing Guide', category: 'Plan Your Visit', readTime: '6 min read', summary: 'Temperatures, rainfall, and local packing advice.', imageUrl: bestValueImg, badge: 'Weather' }
  ]
};

// 4. WEATHER GUIDE
export const WEATHER_GUIDE_ARTICLE: GuideArticle = {
  id: 'article-weather-guide',
  slug: 'weather-guide',
  category: 'Plan Your Visit',
  title: 'Victoria Falls Weather Guide: What to Expect Throughout the Year',
  subtitle: 'Temperatures, rainfall patterns, packing lists, and practical local advice for every season in Victoria Falls.',
  heroImageUrl: bestValueImg,
  heroImageAlt: 'Sunny day at Victoria Falls, Zimbabwe',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '7 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Victoria Falls Weather Guide: What to Expect Throughout the Year | Outbound Holidays',
    metaDescription: 'Complete Victoria Falls weather and packing guide. Temperature averages, rainfall breakdown, winter morning tips, and seasonal gear lists.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/weather-guide',
    ogImage: bestValueImg,
    keywords: ['Victoria Falls weather', 'Victoria Falls temperature by month', 'what to pack for Victoria Falls', 'Victoria Falls rainy season']
  },
  quickFacts: [
    { label: 'Climate Type', value: 'Subtropical Warm', subtext: 'Year-round comfortable destination', iconName: 'Sun' },
    { label: 'Hottest Month', value: 'October (30–36°C)', subtext: 'Hot afternoons & clear blue skies', iconName: 'Clock' },
    { label: 'Coolest Months', value: 'June & July (22–27°C)', subtext: 'Crisp mornings & warm afternoons', iconName: 'CheckCircle2' },
    { label: 'Rainy Period', value: 'Nov to Apr', subtext: 'Short afternoon thunderstorms', iconName: 'Sparkles' }
  ],
  sections: [
    {
      id: 'weather-climate-intro',
      tocTitle: 'Climate Breakdown',
      heading: 'What’s the Weather Like in Victoria Falls?',
      blocks: [
        {
          type: 'text',
          content: 'Victoria Falls enjoys a warm subtropical climate, making it a year-round destination. Unlike places that experience harsh winters or extreme seasonal changes, Victoria Falls offers pleasant weather throughout most of the year.'
        },
        {
          type: 'text',
          content: 'That said, the climate changes noticeably between the rainy and dry seasons. These changes influence not only the temperature but also the appearance of the Falls, wildlife viewing, and the types of experiences available.'
        },
        {
          type: 'table',
          table: {
            title: 'Average Temperature & Rainfall Throughout the Year',
            headers: ['Season', 'Months', 'Daytime Temp', 'Night-time Temp', 'Rainfall Level'],
            rows: [
              ['Summer', 'Nov – Feb', '28 – 34°C (82-93°F)', '18 – 22°C (64-72°F)', 'High (Afternoon Storms)'],
              ['Autumn', 'Mar – May', '24 – 30°C (75-86°F)', '14 – 18°C (57-64°F)', 'Moderate'],
              ['Winter', 'Jun – Aug', '22 – 27°C (72-81°F)', '6 – 12°C (43-54°F)', 'Very Low (Dry)'],
              ['Spring', 'Sep – Oct', '30 – 36°C (86-97°F)', '15 – 20°C (59-68°F)', 'Very Low (Hot & Dry)']
            ]
          }
        },
        {
          type: 'heading',
          subheading: 'Does It Rain All Day?'
        },
        {
          type: 'text',
          content: 'One of the biggest misconceptions about Victoria Falls is that the rainy season means constant rain. Fortunately, that’s rarely the case. Most rainfall arrives in the form of short afternoon thunderstorms. These storms can be dramatic, but they’re often short-lived and usually followed by sunshine.'
        },
        {
          type: 'text',
          content: 'Morning activities generally continue as planned, and many visitors find the storms add to the atmosphere rather than detract from it. The rain also brings cooler temperatures and transforms the surrounding landscape into a lush, green paradise.'
        }
      ]
    },
    {
      id: 'packing-guide',
      tocTitle: 'What to Pack',
      heading: 'What Should You Pack?',
      blocks: [
        {
          type: 'practical_info',
          practicalPanel: {
            title: 'Seasonal Packing Lists',
            subtitle: 'Essential items recommended by local specialists',
            items: [
              { heading: 'Year-Round Essentials', detail: 'Comfortable walking shoes, wide-brimmed hat, UV sunglasses, sunscreen, insect repellent, reusable water bottle.', iconName: 'CheckCircle2' },
              { heading: 'Rainy Season (Nov–Apr)', detail: 'Lightweight waterproof jacket or poncho, waterproof dry bag for cameras and phones, quick-drying clothing.', iconName: 'Sun' },
              { heading: 'Winter Months (Jun–Aug)', detail: 'Light fleece or jacket, long trousers for cool early morning game drives and sunset river cruises.', iconName: 'Clock' },
              { heading: 'Spring Months (Sep–Oct)', detail: 'Light breathable clothing, high-SPF sunscreen, wide-brimmed hat, electrolyte hydration tablets.', iconName: 'Sparkles' }
            ]
          }
        },
        {
          type: 'callout',
          callout: {
            type: 'insight',
            title: '📍 Local Insight: Winter Mornings & Rainforest Spray',
            content: 'One of the things that surprises many visitors is just how cool winter mornings can feel on early game drives or sunrise cruises. Even if the afternoon reaches a comfortable 25°C, mornings can drop to 6–10°C. A lightweight jacket takes up very little space in your luggage but makes early starts much more enjoyable. Another surprise is the spray from the Falls themselves—during high water, you will get wetter in the rainforest than during afternoon rain showers!'
          }
        },
        {
          type: 'callout',
          callout: {
            type: 'recommendation',
            title: '⭐ Outbound Weather Recommendation',
            content: 'If you’re looking for the most comfortable weather overall, we generally recommend travelling between May and August. These months offer sunny days, cool mornings, comfortable temperatures, and excellent conditions for sightseeing, safaris, and river cruises.'
          }
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'best-time-to-visit', title: 'Best Time to Visit Victoria Falls: A Local Guide', category: 'Plan Your Visit', readTime: '8 min read', summary: 'Understanding the 3 distinct travel seasons.', imageUrl: vicFallsIconicImg, badge: 'Seasons' },
    { slug: 'where-to-stay-victoria-falls', title: 'Where Should You Stay in Victoria Falls?', category: 'Accommodation', readTime: '9 min read', summary: 'Choosing the right lodge or hotel for your trip.', imageUrl: gorgeHelicopterImg, badge: 'Lodging' }
  ]
};

// 5. WHERE SHOULD YOU STAY IN VICTORIA FALLS?
export const WHERE_TO_STAY_ARTICLE: GuideArticle = {
  id: 'article-where-to-stay',
  slug: 'where-to-stay-victoria-falls',
  category: 'Choose Your Stay',
  title: 'Where Should You Stay in Victoria Falls? A Local Accommodation Guide',
  subtitle: 'A detailed breakdown of luxury hotels, boutique lodges, comfortable hotels, guesthouses, and safari lodges to help you select the ideal stay.',
  heroImageUrl: gorgeHelicopterImg,
  heroImageAlt: 'Boutique lodge balcony overlooking Batoka Gorge in Victoria Falls',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '9 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Where Should You Stay in Victoria Falls? | Outbound Holidays',
    metaDescription: 'Local guide to Victoria Falls hotels, boutique lodges, and safari retreats. Compare town convenience vs. river luxury vs. game reserves.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/where-to-stay-victoria-falls',
    ogImage: gorgeHelicopterImg,
    keywords: ['Victoria Falls hotels', 'Victoria Falls luxury lodges', 'where to stay Victoria Falls', 'Victoria Falls boutique accommodation']
  },
  quickFacts: [
    { label: 'Town Hotels', value: 'Walking distance to Falls', subtext: 'Ideal for first-time visitors', iconName: 'Sun' },
    { label: 'Riverside Lodges', value: 'Luxury & Tranquility', subtext: 'Ideal for couples & honeymoons', iconName: 'Sparkles' },
    { label: 'Safari Lodges', value: 'Game Reserves Outside Town', subtext: 'Ideal for wildlife immersion', iconName: 'CheckCircle2' },
    { label: 'Boutique Lodges', value: 'US$180 – $300 / night', subtext: 'Our top recommendation', iconName: 'Clock' }
  ],
  sections: [
    {
      id: 'where-stay-intro',
      tocTitle: 'Choosing Accommodation',
      heading: 'Finding the Right Place to Stay',
      blocks: [
        {
          type: 'text',
          content: 'Choosing where to stay in Victoria Falls is one of the most important decisions you’ll make when planning your holiday. The right accommodation doesn’t just give you somewhere to sleep—it shapes your entire experience. Whether you’re travelling as a couple, with your family, celebrating a honeymoon or looking for an affordable getaway, this guide will help you choose the accommodation that’s right for you.'
        },
        {
          type: 'text',
          content: 'One of the first questions travellers ask us is: "Which hotel should I book?" Our answer usually surprises them. Instead of immediately recommending a hotel, we ask a few questions first: Is this your first visit to Victoria Falls? Who are you travelling with? What kind of holiday are you hoping to have? How much time will you spend at your accommodation? What’s your budget?'
        },
        {
          type: 'text',
          content: 'The reason is simple: The best accommodation isn’t necessarily the most expensive. It’s the one that best matches your travel style.'
        }
      ]
    },
    {
      id: 'accommodation-pricing-cards',
      tocTitle: 'Accommodation Styles & Rates',
      heading: 'Victoria Falls Accommodation Styles & Rates',
      blocks: [
        {
          type: 'pricing_cards',
          pricingCards: [
            {
              title: 'Luxury Hotels',
              price: 'US$300 – 600+',
              period: 'per night',
              idealFor: 'Special occasions & luxury travellers',
              description: 'Elegant, full-service properties with premium facilities, fine dining, concierge services, and classic colonial or luxury riverfront locations.',
              features: [
                'Full-service luxury & concierge',
                'Fine dining & gourmet restaurants',
                'Prime river or gorge locations',
                'Spa and wellness centers'
              ]
            },
            {
              title: 'Boutique Lodges',
              price: 'US$180 – 300',
              period: 'per night',
              idealFor: 'Couples & intimate getaways',
              description: 'Smaller, more intimate properties known for personalized service, beautiful lush gardens, quiet atmosphere, and authentic local hospitality.',
              features: [
                'Personalized local service',
                'Peaceful garden grounds',
                'Bespoke room design',
                'Ideal for couples & honeymoons'
              ],
              highlight: true
            },
            {
              title: 'Comfortable Hotels',
              price: 'US$90 – 150',
              period: 'per night',
              idealFor: 'First-timers & families',
              description: 'Reliable, well-equipped hotels offering excellent value, comfortable air-conditioned rooms, swimming pools, and convenient town locations.',
              features: [
                'Great value & comfort',
                'Central town access',
                'Family rooms & pools',
                'On-site dining options'
              ]
            },
            {
              title: 'Exclusive Safari Lodges',
              price: 'US$600+',
              period: 'per night',
              idealFor: 'Wildlife & safari immersion',
              description: 'Located outside town inside private game reserves, combining high-end luxury suites with game drives and wildlife sightings.',
              features: [
                'All-inclusive safari activities',
                'Private game reserve access',
                'Gourmet bush dining',
                'Immersive nature location'
              ]
            }
          ]
        },
        {
          type: 'heading',
          subheading: 'Which Accommodation Is Right for You?'
        },
        {
          type: 'bullet_list',
          items: [
            'First-Time Visitors: Stay close to Victoria Falls town for easy access to restaurants, cafés, activity departure points, and the entrance to the Falls.',
            'Couples: Look for boutique lodges offering beautiful gardens, private terraces, sunset views, quiet surroundings, and fine dining.',
            'Families: Prioritize family rooms, swimming pools, large gardens, and easy transport near activity departure points.',
            'Honeymooners: Choose luxury riverside lodges, spa facilities, private dining experiences, and premium suites.',
            'Adventure Travellers: Choose comfortable, well-located hotels so you can spend your budget on rafting, helicopter flights, and safaris.'
          ]
        },
        {
          type: 'callout',
          callout: {
            type: 'insight',
            title: '📍 Local Insight: Don’t Book Solely on Star Ratings',
            content: 'One mistake we often see is travellers booking accommodation based solely on star ratings. A five-star hotel isn’t automatically the best choice for every traveller. Some of the most memorable stays in Victoria Falls are found in boutique lodges with outstanding hospitality, peaceful gardens, and a genuinely personal atmosphere.'
          }
        },
        {
          type: 'callout',
          callout: {
            type: 'recommendation',
            title: '⭐ Outbound Accommodation Recommendation',
            content: 'If you’re visiting Victoria Falls for the first time, we generally recommend choosing a well-located boutique lodge or comfortable hotel close to town. It gives you easy access to the Falls, restaurants, and activity departure points while still providing a relaxing place to unwind after a day of exploring.'
          }
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'victoria-falls-budget-guide', title: 'Victoria Falls Budget Guide', category: 'Build Your Holiday', readTime: '8 min read', summary: 'Comprehensive breakdown of daily spend, activities, and dining.', imageUrl: bestValueImg, badge: 'Budgeting' },
    { slug: 'victoria-falls-itineraries', title: 'Victoria Falls Itineraries', category: 'Build Your Holiday', readTime: '12 min read', summary: 'Sample itineraries combining accommodation and top activities.', imageUrl: vicFallsIconicImg, badge: 'Itineraries' }
  ]
};

// 6. EXPERIENCE VICTORIA FALLS
export const EXPERIENCE_VICTORIA_FALLS_ARTICLE: GuideArticle = {
  id: 'article-experience-vic-falls',
  slug: 'experience-victoria-falls',
  category: 'Explore Victoria Falls',
  title: 'Experience Victoria Falls: Our Favourite Experiences',
  subtitle: 'A local specialist guide to guided tours, Zambezi sunset cruises, helicopter flights, Chobe safaris, rafting, and cultural shows.',
  heroImageUrl: bomaDinnerImg,
  heroImageAlt: 'Sunset cruise on the Zambezi River near Victoria Falls',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '11 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Experience Victoria Falls: Activities & Excursions | Outbound Holidays',
    metaDescription: 'Carefully curated Victoria Falls experiences from local specialists. Guided Falls tours, Zambezi cruises, Chobe day trips, helicopter flights, and Boma shows.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/experience-victoria-falls',
    ogImage: bomaDinnerImg,
    keywords: ['things to do in Victoria Falls', 'Victoria Falls helicopter flight', 'Zambezi sunset cruise', 'Chobe day trip from Victoria Falls', 'The Boma dinner show']
  },
  quickFacts: [
    { label: 'Must-Do Tour', value: 'Guided Falls Walk', subtext: '2–3 hours rainforest walk', iconName: 'Sun' },
    { label: 'Sunset Highlight', value: 'Zambezi River Cruise', subtext: '2 hours with hippos & drinks', iconName: 'Sparkles' },
    { label: 'Safari Excursion', value: 'Chobe Day Trip', subtext: 'Full day land & boat safari in Botswana', iconName: 'CheckCircle2' },
    { label: 'Bucket-List Flight', value: 'Helicopter Flight', subtext: '12–15 minute Flight of Angels', iconName: 'Clock' }
  ],
  sections: [
    {
      id: 'activities-intro',
      tocTitle: 'Curated Experiences',
      heading: 'Our Recommended Experiences, Carefully Chosen by Local Specialists',
      blocks: [
        {
          type: 'text',
          content: 'Victoria Falls is one of Africa’s most diverse travel destinations. From witnessing one of the world’s greatest natural wonders to cruising along the Zambezi River at sunset, soaring above the Falls in a helicopter or exploring nearby national parks, there are experiences here for every type of traveller.'
        },
        {
          type: 'text',
          content: 'The challenge isn’t finding things to do—it’s deciding which experiences are right for you. At Outbound Holidays, we don’t believe in recommending every activity available. Instead, we’ve carefully selected the experiences we believe offer the greatest value, the most memorable moments, and the best introduction to Victoria Falls.'
        }
      ]
    },
    {
      id: 'activity-categories',
      tocTitle: 'Activity Categories',
      heading: 'Top Experiences by Category',
      blocks: [
        {
          type: 'heading',
          subheading: '1. First-Time Essentials ⭐'
        },
        {
          type: 'bullet_list',
          items: [
            'Guided Tour of the Falls (2–3 Hours): Walking through the rainforest with an experienced guide transforms the Falls from something you simply see into something you truly understand. Perfect for everyone.',
            'Sunset Cruise on the Zambezi River (2 Hours): Drift past islands and riverbanks where elephants, hippos, crocodiles, and birdlife gather. Perfect for couples, families, and first-timers.'
          ]
        },
        {
          type: 'heading',
          subheading: '2. Wildlife Experiences 🐘'
        },
        {
          type: 'bullet_list',
          items: [
            'Chobe National Park Day Trip (Full Day): Just across the border in Botswana, famous for enormous elephant herds, land game drives, and river safaris.',
            'Game Drive in Victoria Falls Area (3 Hours): Great introduction to local African wildlife, rhino tracking, and buffalo sightings.'
          ]
        },
        {
          type: 'heading',
          subheading: '3. Scenic & Adventure Experiences 🚁'
        },
        {
          type: 'bullet_list',
          items: [
            'Flight of Angels Helicopter Flight (12–15 Mins): Unforgettable aerial view of the full waterfall width and Batoka Gorge.',
            'White Water Rafting: World-class Grade 5 rafting through Batoka Gorge rapids.',
            'Gorge Swing, Zipline & Bungee Jumping: Adrenaline-packed leaps high above the Zambezi River.'
          ]
        },
        {
          type: 'heading',
          subheading: '4. Culture & Food Experiences 🥁'
        },
        {
          type: 'bullet_list',
          items: [
            'The Boma – Dinner & Drum Show: Traditional Zimbabwean cuisine, game meats, cultural dancing, and live interactive drumming.',
            'Gorge & Riverside Dining: Lookout Café, Baines Restaurant, Three Monkeys, and Palm River Restaurant.'
          ]
        },
        {
          type: 'callout',
          callout: {
            type: 'insight',
            title: '📍 Local Insight: The 3-Day Priority Formula',
            content: 'If you only have three days, our local specialists recommend prioritizing: 1) Guided Tour of the Falls, 2) Sunset Cruise, 3) One wildlife experience (Game Drive or Chobe Day Trip), and 4) One special experience (Helicopter Flight or Boma Dinner). These four experiences provide a wonderful introduction without making your itinerary feel rushed.'
          }
        },
        {
          type: 'callout',
          callout: {
            type: 'recommendation',
            title: '⭐ Outbound Activity Recommendation',
            content: 'You don’t need to experience everything Victoria Falls has to offer to have an unforgettable holiday. The best trips aren’t the ones packed with the most activities—they’re the ones where each experience feels meaningful and well-paced.'
          }
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'victoria-falls-itineraries', title: 'Victoria Falls Itineraries', category: 'Build Your Holiday', readTime: '12 min read', summary: 'Day-by-day itineraries linking these experiences.', imageUrl: vicFallsIconicImg, badge: 'Itineraries' },
    { slug: 'where-to-stay-victoria-falls', title: 'Where Should You Stay in Victoria Falls?', category: 'Choose Your Stay', readTime: '9 min read', summary: 'Find the best lodge to return to after your activities.', imageUrl: gorgeHelicopterImg, badge: 'Lodging' }
  ]
};

// 7. VICTORIA FALLS ITINERARIES
export const ITINERARIES_ARTICLE: GuideArticle = {
  id: 'article-itineraries',
  slug: 'victoria-falls-itineraries',
  category: 'Build Your Holiday',
  title: 'Victoria Falls Itineraries: Carefully Crafted Holidays',
  subtitle: 'Inspiring day-by-day travel plans for 2-night stopovers, 3-night classic stays, 4-night complete holidays, family safaris, and 6-night Hwange extensions.',
  heroImageUrl: vicFallsIconicImg,
  heroImageAlt: 'Scenic view of Victoria Falls and Zambezi gorge',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '12 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Victoria Falls Itineraries: 2, 3, 4 & 6-Night Plans | Outbound Holidays',
    metaDescription: 'Carefully crafted Victoria Falls itineraries for first-time visitors, couples, families, and safari lovers. Day-by-day schedules with realistic pace.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/victoria-falls-itineraries',
    ogImage: vicFallsIconicImg,
    keywords: ['Victoria Falls itinerary', '3 day Victoria Falls plan', '4 day Victoria Falls itinerary', 'Victoria Falls family itinerary']
  },
  quickFacts: [
    { label: 'Most Popular Plan', value: '3-Night Classic', subtext: 'Falls, Sunset Cruise, Safari & Boma', iconName: 'Sun' },
    { label: 'Shortest Stopover', value: '2-Night Highlights', subtext: 'Signature Falls & Sunset Cruise', iconName: 'Clock' },
    { label: 'Family Favorite', value: '4-Night Complete', subtext: 'Balanced activities with pool time', iconName: 'CheckCircle2' },
    { label: 'Ultimate Safari', value: '6-Night Vic Falls + Hwange', subtext: 'Falls wonder + Big 5 safari', iconName: 'Sparkles' }
  ],
  sections: [
    {
      id: 'itineraries-intro',
      tocTitle: 'Itinerary Overview',
      heading: 'Carefully Crafted Holidays for Every Type of Traveller',
      blocks: [
        {
          type: 'text',
          content: 'Every traveller experiences Victoria Falls differently. Some come to witness one of the world’s greatest natural wonders. Others dream of unforgettable safari adventures, romantic sunsets on the Zambezi River or adrenaline-filled days exploring the Batoka Gorge.'
        },
        {
          type: 'text',
          content: 'At Outbound Holidays, we believe the best itineraries aren’t about fitting in as many activities as possible—they’re about creating the right balance of adventure, relaxation and memorable experiences. The itineraries below are designed to inspire your planning. Every holiday we create is personalized.'
        }
      ]
    },
    {
      id: 'sample-itinerary-timelines',
      tocTitle: 'Day-by-Day Timelines',
      heading: 'Day-by-Day Sample Itineraries',
      blocks: [
        {
          type: 'timeline',
          timeline: {
            title: 'The Highlights Escape',
            duration: '2 Nights / 3 Days',
            idealFor: 'First-time visitors, weekend travellers & short stopovers',
            investment: 'US$700 – $950 per person',
            style: 'Comfort Hotel or Boutique Lodge',
            bestTime: 'May – August',
            pace: 'Relaxed Short Stay',
            items: [
              { day: 'Day 1', title: 'Welcome & Sunset Cruise', activities: ['Airport transfer to hotel', 'Check-in and relax', 'Sunset Cruise on the Zambezi River'] },
              { day: 'Day 2', title: 'Experience the Falls', activities: ['Guided Tour of Victoria Falls', 'Lunch at a local gorge café', 'Optional helicopter flight', 'Dinner in town'] },
              { day: 'Day 3', title: 'Departure', activities: ['Breakfast at hotel', 'Last-minute local craft shopping', 'Airport transfer'] }
            ],
            whyRecommend: 'Even with just two nights, you’ll experience the destination’s two signature highlights while still having time to relax.'
          }
        },
        {
          type: 'timeline',
          timeline: {
            title: 'The Classic Victoria Falls Experience ⭐ (Most Recommended)',
            duration: '3 Nights / 4 Days',
            idealFor: 'First-time visitors, Couples & Families',
            investment: 'US$1,200 – $1,600 per couple',
            style: 'Comfort+ Boutique Lodge',
            bestTime: 'May – August',
            pace: 'Balanced & Unrushed',
            items: [
              { day: 'Day 1', title: 'Arrival & Sunset Cruise', activities: ['Private airport transfer', 'Check-in and poolside refresh', 'Sunset Zambezi Cruise with drinks'] },
              { day: 'Day 2', title: 'Discover the Falls & Boma Dinner', activities: ['Guided Tour of Victoria Falls', 'Lunch at Lookout Café', 'Optional Helicopter Flight', 'The Boma Dinner & Drum Show'] },
              { day: 'Day 3', title: 'Safari & Relaxed Afternoon', activities: ['Morning Game Drive or Chobe Day Trip', 'Free afternoon at leisure', 'Dinner at recommended local restaurant'] },
              { day: 'Day 4', title: 'Departure', activities: ['Breakfast at lodge', 'Airport transfer'] }
            ],
            whyRecommend: 'Our most recommended itinerary because it combines signature highlights while leaving enough flexibility for your own pace.'
          }
        },
        {
          type: 'timeline',
          timeline: {
            title: 'The Complete Victoria Falls Holiday',
            duration: '4 Nights / 5 Days',
            idealFor: 'Families, Couples & Luxury Travellers',
            investment: 'US$1,800 – $2,500 per couple',
            style: 'Comfort+ Lodge & Safari',
            bestTime: 'May – September',
            pace: 'Relaxed & Complete',
            items: [
              { day: 'Day 1', title: 'Arrival', activities: ['Airport transfer & check-in', 'Pool relaxation', 'Sunset Zambezi Cruise'] },
              { day: 'Day 2', title: 'Falls Tour & Helicopter Flight', activities: ['Guided Tour of Victoria Falls', 'Lunch in town', 'Helicopter Flight', 'Evening at leisure'] },
              { day: 'Day 3', title: 'Safari Adventure', activities: ['Chobe National Park Day Trip or Morning Game Drive', 'Evening relaxation and dinner'] },
              { day: 'Day 4', title: 'Local Culture', activities: ['Free morning', 'Local craft markets', 'Village Visit', 'The Boma Dinner & Drum Show'] },
              { day: 'Day 5', title: 'Departure', activities: ['Breakfast and airport transfer'] }
            ],
            whyRecommend: 'Four nights gives you enough time to experience Victoria Falls without feeling rushed, leaving room to appreciate your surroundings.'
          }
        },
        {
          type: 'timeline',
          timeline: {
            title: 'Victoria Falls & Safari — The Best of Zimbabwe',
            duration: '6 Nights / 7 Days',
            idealFor: 'Wildlife lovers & Bucket-list travellers',
            investment: 'US$4,000 – $6,500 per couple',
            style: 'Boutique Lodge + Hwange Luxury Safari Lodge',
            bestTime: 'June – October',
            pace: 'Balanced Safari & Wonder',
            items: [
              { day: 'Day 1', title: 'Arrive in Victoria Falls', activities: ['Airport transfer', 'Sunset Zambezi Cruise'] },
              { day: 'Day 2', title: 'Victoria Falls Highlights', activities: ['Guided Falls Tour', 'Helicopter Flight', 'Dinner in town'] },
              { day: 'Day 3', title: 'Transfer to Hwange National Park', activities: ['Scenic transfer to Hwange', 'Afternoon Game Drive', 'Bush lodge dinner'] },
              { day: 'Day 4', title: 'Full Safari Experience', activities: ['Sunrise Game Drive', 'Bush lunch', 'Afternoon Safari & sundowners'] },
              { day: 'Day 5', title: 'Walking Safari & Wildlife', activities: ['Morning guided walking safari', 'Relax at lodge waterhole', 'Evening Game Drive'] },
              { day: 'Day 6', title: 'Return to Victoria Falls', activities: ['Breakfast in Hwange', 'Return transfer to Victoria Falls', 'Farewell dinner overlooking the Zambezi'] },
              { day: 'Day 7', title: 'Departure', activities: ['Breakfast and airport transfer'] }
            ],
            whyRecommend: 'Combines two of Zimbabwe’s greatest attractions—awe-inspiring Victoria Falls and exceptional Big 5 wildlife in Hwange National Park.'
          }
        },
        {
          type: 'callout',
          callout: {
            type: 'insight',
            title: '📍 Local Insight: The Value of Slowing Down',
            content: 'One of the biggest misconceptions about Victoria Falls is that every day needs to be filled with back-to-back activities. Some of our favourite moments happen in between—watching elephants from your hotel deck, enjoying morning coffee, swimming after a day at the Falls, and watching another African sunset.'
          }
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'experience-victoria-falls', title: 'Experience Victoria Falls', category: 'Explore Victoria Falls', readTime: '11 min read', summary: 'Detailed catalog of tours, cruises, flights, and culture.', imageUrl: bomaDinnerImg, badge: 'Activities' },
    { slug: 'victoria-falls-budget-guide', title: 'Victoria Falls Budget Guide', category: 'Build Your Holiday', readTime: '8 min read', summary: 'Pricing details for accommodation and excursions.', imageUrl: bestValueImg, badge: 'Budget' }
  ]
};

// 8. VICTORIA FALLS BUDGET GUIDE
export const BUDGET_GUIDE_ARTICLE: GuideArticle = {
  id: 'article-budget-guide',
  slug: 'victoria-falls-budget-guide',
  category: 'Build Your Holiday',
  title: 'Victoria Falls Budget Guide: How Much Does it Really Cost?',
  subtitle: 'Realistic pricing benchmarks for accommodation, activities, food, transport, and money-saving tips from local specialists.',
  heroImageUrl: bestValueImg,
  heroImageAlt: 'Victoria Falls travel budgeting guide',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '8 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Victoria Falls Budget Guide: Realistic Travel Costs | Outbound Holidays',
    metaDescription: 'Detailed Victoria Falls travel cost guide. Daily spend benchmarks for budget, comfort, and luxury, plus activity prices, dining costs, and local tips.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/victoria-falls-budget-guide',
    ogImage: bestValueImg,
    keywords: ['Victoria Falls travel cost', 'how much to budget for Victoria Falls', 'Victoria Falls activity prices', 'Victoria Falls currency']
  },
  quickFacts: [
    { label: 'Budget Spend', value: 'US$120 – $180 / day', subtext: 'Guesthouses & key activities', iconName: 'DollarSign' },
    { label: 'Comfort Spend', value: 'US$220 – $350 / day', subtext: 'Boutique lodges & tours', iconName: 'Sun' },
    { label: 'Luxury Spend', value: 'US$450+ / day', subtext: 'Luxury lodges & private tours', iconName: 'Sparkles' },
    { label: 'Currency Used', value: 'US Dollar (USD)', subtext: 'Cards accepted; carry small cash', iconName: 'Clock' }
  ],
  sections: [
    {
      id: 'budget-intro',
      tocTitle: 'Budgeting Overview',
      heading: 'How Much Does a Victoria Falls Holiday Really Cost?',
      blocks: [
        {
          type: 'text',
          content: 'Planning your holiday should be exciting—not stressful. One of the biggest questions travellers ask before booking is: "How much money will I need?" It’s a sensible question, but it’s surprisingly difficult to find a clear answer online. Accommodation prices vary, activities differ, and restaurant costs aren’t always obvious.'
        },
        {
          type: 'text',
          content: 'At Outbound Holidays, we believe planning is easier when you know what to expect. This guide provides realistic estimates to help you budget with confidence.'
        },
        {
          type: 'table',
          table: {
            title: 'Victoria Falls Daily Spend Benchmarks',
            headers: ['Traveller Style', 'Estimated Daily Spend (per person)', 'Typical Inclusions / Setup'],
            rows: [
              ['Budget Traveller', 'US$120 – $180', 'Guesthouses or budget hotels, self-catering/café meals, key main activities.'],
              ['Comfort Traveller', 'US$220 – $350', 'Boutique lodges or comfortable hotels, several activities, restaurant dining.'],
              ['Luxury Traveller', 'US$450+', 'Luxury lodges, premium private cruises, private transfers, exclusive experiences.']
            ]
          }
        }
      ]
    },
    {
      id: 'activity-and-dining-costs',
      tocTitle: 'Activity & Dining Costs',
      heading: 'Activity, Accommodation & Dining Price Breakdown',
      blocks: [
        {
          type: 'table',
          table: {
            title: 'Typical Accommodation Rates (per night)',
            headers: ['Category', 'Price Range (USD)', 'Best For'],
            rows: [
              ['Guesthouses', 'US$60 – $120', 'Independent & budget travellers'],
              ['Budget Hotels', 'US$90 – $150', 'Families & budget-conscious stopovers'],
              ['Boutique Lodges ⭐', 'US$180 – $300', 'Couples, honeymoons & comfortable stays'],
              ['Luxury Hotels', 'US$300 – $600+', 'Special occasions & full-service luxury'],
              ['Exclusive Safari Lodges', 'US$600+', 'All-inclusive wildlife immersion']
            ]
          }
        },
        {
          type: 'table',
          table: {
            title: 'Signature Activity Prices (USD)',
            headers: ['Activity Experience', 'Price from (USD)', 'Duration'],
            rows: [
              ['Guided Tour of the Falls', 'From US$55', '2 – 3 Hours'],
              ['Zambezi Sunset Cruise', 'From US$55 – $90', '2 Hours (Includes drinks/snacks)'],
              ['Flight of Angels Helicopter Flight', 'From US$175', '12 – 15 Minutes'],
              ['The Boma – Dinner & Drum Show', 'From US$55', '3 Hours'],
              ['Chobe National Park Day Trip (Botswana)', 'From US$170', 'Full Day (Includes safari & lunch)'],
              ['White Water Rafting', 'From US$150', 'Full Day'],
              ['Morning / Afternoon Game Drive', 'From US$120', '3 Hours']
            ]
          }
        },
        {
          type: 'bullet_list',
          items: [
            'Breakfast: US$8 – $20 per person',
            'Lunch: US$15 – $30 per person',
            'Dinner: US$20 – $60 per person',
            'Fine Dining: US$60 – $120+ per person',
            'Coffee: US$3 – $5 | Cocktails: US$6 – $12',
            'Airport Transfers: US$15 – $30 per person | Taxi in town: US$5 – $10'
          ]
        },
        {
          type: 'callout',
          callout: {
            type: 'insight',
            title: '📍 Local Money-Saving Tips',
            content: 'One of the easiest ways to save money isn’t choosing cheaper activities—it’s choosing the right itinerary. Booking activities geographically reduces transfer costs, combining experiences into one day saves transport, and choosing accommodation close to town eliminates long taxi fares.'
          }
        },
        {
          type: 'callout',
          callout: {
            type: 'recommendation',
            title: '⭐ Outbound Recommendation',
            content: 'Don’t start by asking "What’s the cheapest holiday?" Instead ask "What kind of experience do I want?" Once you know that, it’s much easier to build a holiday that matches both your expectations and your budget.'
          }
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'where-to-stay-victoria-falls', title: 'Where Should You Stay in Victoria Falls?', category: 'Choose Your Stay', readTime: '9 min read', summary: 'Find the right lodge or hotel for your budget.', imageUrl: gorgeHelicopterImg, badge: 'Lodging' },
    { slug: 'victoria-falls-itineraries', title: 'Victoria Falls Itineraries', category: 'Build Your Holiday', readTime: '12 min read', summary: 'Calculated sample holiday packages.', imageUrl: vicFallsIconicImg, badge: 'Itineraries' }
  ]
};

// 9. GETTING TO VICTORIA FALLS
export const GETTING_THERE_ARTICLE: GuideArticle = {
  id: 'article-getting-there',
  slug: 'getting-to-victoria-falls',
  category: 'Plan Your Visit',
  title: 'Getting to Victoria Falls',
  subtitle: 'Flight routes into VFA airport, transfers, self-drive tips, and regional combinations across Southern Africa.',
  heroImageUrl: vicFallsIconicImg,
  heroImageAlt: 'Aerial view of Victoria Falls International Airport and Zambezi river',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '6 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Getting to Victoria Falls: Flights & Transfers | Outbound Holidays',
    metaDescription: 'Complete guide on getting to Victoria Falls, Zimbabwe. VFA airport details, direct flight connections, airport transfers, self-drive advice, and border crossings.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/getting-to-victoria-falls',
    ogImage: vicFallsIconicImg,
    keywords: ['how to get to Victoria Falls', 'Victoria Falls International Airport VFA', 'flights to Victoria Falls', 'Victoria Falls airport transfer']
  },
  quickFacts: [
    { label: 'Main Airport', value: 'Victoria Falls Airport (VFA)', subtext: 'Modern international terminal', iconName: 'Sun' },
    { label: 'Distance to Town', value: '20 km (12 miles)', subtext: '20–25 minutes by road transfer', iconName: 'Clock' },
    { label: 'Transfer Cost', value: 'US$15 – $30 per person', subtext: 'Pre-booked driver meeting', iconName: 'DollarSign' },
    { label: 'Direct Flight Hubs', value: 'Jo’burg, Cape Town, Harare', subtext: 'Plus Nairobi & Addis Ababa', iconName: 'Sparkles' }
  ],
  sections: [
    {
      id: 'getting-there-intro',
      tocTitle: 'Location & Airport',
      heading: 'Where is Victoria Falls & How Do You Fly In?',
      blocks: [
        {
          type: 'text',
          content: 'Getting to Victoria Falls is easier than many first-time visitors expect. With an international airport, excellent road connections, and convenient regional flights from major Southern African cities, the destination is well connected for travellers from around the world.'
        },
        {
          type: 'text',
          content: 'Victoria Falls is located in north-western Zimbabwe, on the banks of the mighty Zambezi River, where Zimbabwe meets Zambia. The town is home to Victoria Falls International Airport (VFA) and sits just a few minutes from the entrance to Victoria Falls National Park.'
        },
        {
          type: 'heading',
          subheading: 'Flying to Victoria Falls (VFA)'
        },
        {
          type: 'bullet_list',
          items: [
            'Johannesburg (JNB): Multiple daily direct flights (1.5 hours)',
            'Cape Town (CPT): Direct scheduled flights (2.5 hours)',
            'Harare (HRE): Daily domestic flights (1 hour)',
            'Nairobi (NBO) & Addis Ababa (ADD): Regional direct connections'
          ]
        },
        {
          type: 'callout',
          callout: {
            type: 'recommendation',
            title: '⭐ Outbound Flight Recommendation',
            content: 'When planning your flights, try to arrive before mid-afternoon if possible. This gives you enough time to settle into your accommodation and enjoy a sunset cruise on your first evening—one of our favourite ways to begin a Victoria Falls holiday.'
          }
        }
      ]
    },
    {
      id: 'transfers-and-combinations',
      tocTitle: 'Transfers & Combinations',
      heading: 'Airport Transfers & Regional Combinations',
      blocks: [
        {
          type: 'text',
          content: 'Victoria Falls International Airport is located approximately 20 kilometres (12 miles) from the town centre. The journey to most hotels takes around 20–25 minutes by road. Pre-booking an airport transfer ensures a driver is waiting upon arrival, removing stress after a long flight.'
        },
        {
          type: 'heading',
          subheading: 'Combining Victoria Falls with Other Destinations'
        },
        {
          type: 'bullet_list',
          items: [
            'Victoria Falls + Hwange National Park (Zimbabwe): Classic waterfall & Big 5 safari combo.',
            'Victoria Falls + Chobe National Park (Botswana): Famous elephant herds and river safaris.',
            'Victoria Falls + Cape Town (South Africa): Natural wonder meets vibrant coastal city life.',
            'Victoria Falls + Okavango Delta (Botswana): Ultimate luxury African safari combination.'
          ]
        },
        {
          type: 'callout',
          callout: {
            type: 'insight',
            title: '📍 Local Insight: Zimbabwe vs. Zambia Side Selection',
            content: 'One question we’re often asked is whether it’s worth staying on the Zimbabwean or Zambian side. For most first-time visitors, we generally recommend staying in Victoria Falls, Zimbabwe. The Zimbabwean side offers 75% of the panoramic viewpoints overlooking the Falls, excellent accommodation options, a lively town centre, and easy access to top experiences.'
          }
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'visa-entry-requirements', title: 'Visa & Entry Requirements', category: 'Plan Your Visit', readTime: '5 min read', summary: 'KAZA Univisa details and entry requirements.', imageUrl: familySafariImg, badge: 'Visas' },
    { slug: 'where-to-stay-victoria-falls', title: 'Where Should You Stay in Victoria Falls?', category: 'Choose Your Stay', readTime: '9 min read', summary: 'Lodges, hotels, and location advice.', imageUrl: gorgeHelicopterImg, badge: 'Hotels' }
  ]
};

// 10. VISA & ENTRY REQUIREMENTS
export const VISA_REQUIREMENTS_ARTICLE: GuideArticle = {
  id: 'article-visa-requirements',
  slug: 'visa-entry-requirements',
  category: 'Plan Your Visit',
  title: 'Visa & Entry Requirements',
  subtitle: 'Passport rules, visa categories, online immigration forms, visa fees, and the KAZA Univisa for visiting Zimbabwe and Zambia.',
  heroImageUrl: familySafariImg,
  heroImageAlt: 'Immigration and entry guidelines for Victoria Falls, Zimbabwe',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '5 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Victoria Falls Visa & Entry Requirements | Outbound Holidays',
    metaDescription: 'Essential visa and entry information for visiting Victoria Falls, Zimbabwe. KAZA Univisa details, visa fees by nationality, and online form tips.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/visa-entry-requirements',
    ogImage: familySafariImg,
    keywords: ['Zimbabwe visa requirements', 'KAZA Univisa Victoria Falls', 'Victoria Falls visa on arrival', 'Zimbabwe entry rules']
  },
  quickFacts: [
    { label: 'KAZA Univisa Fee', value: 'US$50 USD', subtext: 'Covers 30 days in Zim & Zambia', iconName: 'DollarSign' },
    { label: 'Passport Validity', value: '6 Months Minimum', subtext: 'At least 2 blank pages required', iconName: 'CheckCircle2' },
    { label: 'Visa on Arrival', value: 'Category B Countries', subtext: 'UK, US, Canada, EU, Australia, etc.', iconName: 'Sun' },
    { label: 'Online Declaration', value: 'Complete before flight', subtext: 'Speed up immigration processing', iconName: 'Clock' }
  ],
  sections: [
    {
      id: 'visa-intro',
      tocTitle: 'Passport & Categories',
      heading: 'Passport Requirements & Visa Categories',
      blocks: [
        {
          type: 'text',
          content: 'One of the most common questions we receive is whether you’ll need a visa to visit Zimbabwe. The good news is that the process is straightforward for most international travellers, especially when you know what to expect before you leave home.'
        },
        {
          type: 'bullet_list',
          items: [
            'Passport Validity: Valid for at least 6 months beyond date of arrival.',
            'Blank Pages: At least two blank pages for immigration stamps.',
            'Physical Condition: In good condition without significant damage.'
          ]
        },
        {
          type: 'heading',
          subheading: 'Zimbabwe Visa Categories'
        },
        {
          type: 'bullet_list',
          items: [
            'Category A (Visa-Free Entry): Eligible nationalities proceed directly through immigration.',
            'Category B (Visa on Arrival): UK, US, Australia, Germany, France, Netherlands, Italy, Japan, Canada, and many others obtain visas at airport immigration.',
            'Category C (Visa Required Before Travel): Requires advance application prior to departure.'
          ]
        },
        {
          type: 'table',
          table: {
            title: 'Sample Visa Schedule & Fees (USD)',
            headers: ['Nationality', 'Single Entry', 'Double Entry', 'KAZA Univisa Option'],
            rows: [
              ['United Kingdom & Ireland', 'US$55', 'US$70', 'US$50 (Recommended)'],
              ['United States & Australia', 'US$30', 'US$45', 'US$50 (Recommended)'],
              ['Canada', 'US$75', 'N/A', 'US$50 (Recommended)'],
              ['China', 'US$60', 'US$90', 'US$50 (Recommended)'],
              ['Most Category B Countries', 'US$30', 'US$45', 'US$50 (Recommended)']
            ]
          }
        },
        {
          type: 'heading',
          subheading: 'KAZA Univisa Advantage'
        },
        {
          type: 'text',
          content: 'If you’re planning to visit both Zimbabwe and Zambia, you may be eligible for the KAZA Univisa ($50 USD), which allows travel between both countries without purchasing separate visas. This is an excellent option if your itinerary includes viewing the Falls from both sides, Devil’s Pool, or day trips into Livingstone.'
        },
        {
          type: 'callout',
          callout: {
            type: 'insight',
            title: '📍 Local Tip: Online Declaration Form',
            content: 'Complete your online Zimbabwe Immigration Declaration before leaving home rather than relying on airport Wi-Fi after landing. It makes your arrival much quicker and less stressful.'
          }
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'getting-to-victoria-falls', title: 'Getting to Victoria Falls', category: 'Plan Your Visit', readTime: '6 min read', summary: 'Flight routes, VFA airport info, and transfers.', imageUrl: vicFallsIconicImg, badge: 'Getting Here' },
    { slug: 'victoria-falls-faqs', title: 'Frequently Asked Questions', category: 'Build Your Holiday', readTime: '10 min read', summary: 'View all entry and planning questions.', imageUrl: founderGuideImg, badge: 'FAQs' }
  ]
};

// 11. FREQUENTLY ASKED QUESTIONS
export const FAQS_ARTICLE: GuideArticle = {
  id: 'article-faqs',
  slug: 'victoria-falls-faqs',
  category: 'Build Your Holiday',
  title: 'Frequently Asked Questions',
  subtitle: 'Answers to the questions we hear most often from travellers around the world planning a trip to Victoria Falls.',
  heroImageUrl: founderGuideImg,
  heroImageAlt: 'Victoria Falls travel specialist answering questions',
  heroImageCredit: 'Outbound Holidays Local Concierge',
  author: LOCAL_SPECIALISTS_AUTHOR,
  publishedDate: 'January 15, 2026',
  lastUpdatedDate: 'August 4, 2026',
  readingTime: '10 min read',
  location: 'Victoria Falls, Zimbabwe',
  seo: {
    metaTitle: 'Victoria Falls Frequently Asked Questions | Outbound Holidays',
    metaDescription: 'Answers to all common Victoria Falls travel questions. Health, safety, currency, best time to visit, family suitability, malaria, and activities.',
    canonicalUrl: 'https://outboundholidays.co.zw/victoria-falls-guide/victoria-falls-faqs',
    ogImage: founderGuideImg,
    keywords: ['Victoria Falls FAQs', 'is Victoria Falls safe', 'Victoria Falls currency', 'Victoria Falls malaria']
  },
  quickFacts: [
    { label: 'Safety', value: 'One of Africa’s Safest', subtext: 'Compact, welcoming town', iconName: 'CheckCircle2' },
    { label: 'Currency', value: 'US Dollar (USD)', subtext: 'Cards & cash accepted', iconName: 'DollarSign' },
    { label: 'Malaria Risk', value: 'Low-Risk Zone', subtext: 'Consult travel clinic', iconName: 'Sun' },
    { label: 'Recommended Stay', value: '3 to 4 Nights', subtext: 'Ideal highlights duration', iconName: 'Clock' }
  ],
  sections: [
    {
      id: 'faqs-section-main',
      tocTitle: 'Complete FAQ Directory',
      heading: 'Everything You Need to Know Before Visiting Victoria Falls',
      blocks: [
        {
          type: 'text',
          content: 'Planning your first trip to Victoria Falls? We’ve answered the questions we hear most often from travellers around the world. If you can’t find what you’re looking for, our team is always happy to help.'
        }
      ]
    }
  ],
  relatedGuides: [
    { slug: 'first-time-visitor-guide', title: 'The Ultimate First-Time Visitor Guide to Victoria Falls', category: 'Start Here', readTime: '25 min complete guide', summary: 'The master overview guide to planning your holiday.', imageUrl: vicFallsIconicImg, badge: 'Overview' },
    { slug: 'victoria-falls-budget-guide', title: 'Victoria Falls Budget Guide', category: 'Build Your Holiday', readTime: '8 min read', summary: 'Daily spend and activity pricing details.', imageUrl: bestValueImg, badge: 'Budget' }
  ]
};

// EXPORT MAP OF ALL GUIDE ARTICLES
export const ALL_GUIDE_ARTICLES: Record<string, GuideArticle> = {
  'first-time-visitor-guide': FIRST_TIME_VISITOR_ARTICLE,
  'best-time-to-visit': BEST_TIME_TO_VISIT_ARTICLE,
  'month-by-month-guide': MONTH_BY_MONTH_ARTICLE,
  'weather-guide': WEATHER_GUIDE_ARTICLE,
  'where-to-stay-victoria-falls': WHERE_TO_STAY_ARTICLE,
  'experience-victoria-falls': EXPERIENCE_VICTORIA_FALLS_ARTICLE,
  'victoria-falls-itineraries': ITINERARIES_ARTICLE,
  'victoria-falls-budget-guide': BUDGET_GUIDE_ARTICLE,
  'getting-to-victoria-falls': GETTING_THERE_ARTICLE,
  'visa-entry-requirements': VISA_REQUIREMENTS_ARTICLE,
  'victoria-falls-faqs': FAQS_ARTICLE
};

// GUIDE HUB CATEGORIES DATA STRUCTURE
export interface GuideHubCategory {
  title: string;
  subtitle: string;
  articles: Array<{
    slug: string;
    title: string;
    category: string;
    readTime: string;
    summary: string;
    imageUrl: string;
    featured?: boolean;
  }>;
}

export const GUIDE_HUB_CATEGORIES: GuideHubCategory[] = [
  {
    title: 'Start Here',
    subtitle: 'The essential master overview for every first-time visitor',
    articles: [
      {
        slug: 'first-time-visitor-guide',
        title: 'The Ultimate First-Time Visitor Guide to Victoria Falls',
        category: 'Featured Overview',
        readTime: '25 min guide',
        summary: 'Your comprehensive starting point. Overview of timing, accommodation, activities, budgets, visas, and itineraries.',
        imageUrl: vicFallsIconicImg,
        featured: true
      }
    ]
  },
  {
    title: 'Plan Your Visit',
    subtitle: 'Seasons, weather, flights, and entry requirements',
    articles: [
      {
        slug: 'best-time-to-visit',
        title: 'Best Time to Visit Victoria Falls: A Local Guide',
        category: 'Plan Your Visit',
        readTime: '8 min read',
        summary: 'Understand High Water, Dry Season, and Low Water months to time your trip perfectly.',
        imageUrl: vicFallsIconicImg
      },
      {
        slug: 'month-by-month-guide',
        title: 'Victoria Falls Month-by-Month Guide',
        category: 'Plan Your Visit',
        readTime: '10 min read',
        summary: 'A detailed 12-month breakdown covering river flow, wildlife, and recommended activities.',
        imageUrl: familyResortImg
      },
      {
        slug: 'weather-guide',
        title: 'Victoria Falls Weather Guide: What to Expect Throughout the Year',
        category: 'Plan Your Visit',
        readTime: '7 min read',
        summary: 'Temperature averages, rainfall patterns, winter morning tips, and packing lists.',
        imageUrl: bestValueImg
      },
      {
        slug: 'getting-to-victoria-falls',
        title: 'Getting to Victoria Falls',
        category: 'Plan Your Visit',
        readTime: '6 min read',
        summary: 'VFA airport routes, direct flight connections, airport transfers, and border crossings.',
        imageUrl: vicFallsIconicImg
      },
      {
        slug: 'visa-entry-requirements',
        title: 'Visa & Entry Requirements',
        category: 'Plan Your Visit',
        readTime: '5 min read',
        summary: 'KAZA Univisa details, online forms, passport rules, and visa fees by nationality.',
        imageUrl: familySafariImg
      }
    ]
  },
  {
    title: 'Choose Your Stay',
    subtitle: 'Hotels, boutique lodges, and safari retreats',
    articles: [
      {
        slug: 'where-to-stay-victoria-falls',
        title: 'Where Should You Stay in Victoria Falls?',
        category: 'Accommodation',
        readTime: '9 min read',
        summary: 'Compare town hotels vs boutique lodges vs luxury riverfront retreats and safari lodges.',
        imageUrl: gorgeHelicopterImg
      }
    ]
  },
  {
    title: 'Explore Victoria Falls',
    subtitle: 'Tours, cruises, flights, and local culture',
    articles: [
      {
        slug: 'experience-victoria-falls',
        title: 'Experience Victoria Falls',
        category: 'Experiences',
        readTime: '11 min read',
        summary: 'Guided Falls tours, Zambezi sunset cruises, helicopter flights, Chobe safaris, and Boma dinners.',
        imageUrl: bomaDinnerImg
      }
    ]
  },
  {
    title: 'Build Your Holiday',
    subtitle: 'Curated itineraries, budget guide, and FAQs',
    articles: [
      {
        slug: 'victoria-falls-itineraries',
        title: 'Victoria Falls Itineraries',
        category: 'Build Your Holiday',
        readTime: '12 min read',
        summary: 'Day-by-day sample plans for 2-night stopovers, 3-night classic stays, and 6-night safari extensions.',
        imageUrl: vicFallsIconicImg
      },
      {
        slug: 'victoria-falls-budget-guide',
        title: 'Victoria Falls Budget Guide',
        category: 'Build Your Holiday',
        readTime: '8 min read',
        summary: 'Realistic daily spend benchmarks for budget, comfort, and luxury, plus money-saving tips.',
        imageUrl: bestValueImg
      },
      {
        slug: 'victoria-falls-faqs',
        title: 'Frequently Asked Questions',
        category: 'Build Your Holiday',
        readTime: '10 min read',
        summary: 'Answers to the questions we hear most often about health, safety, currency, and activities.',
        imageUrl: founderGuideImg
      }
    ]
  }
];
