import { TravelPackage, TravelSpot, Accommodation, Review } from '../types';

// Public image paths for experiences
const fallsTour1 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
const cruise1 = '/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
const cruise2 = '/Experiences/Standard Cruise_/Standard-2-scaled.jpg';
const bomaImg1 = '/Experiences/Boma Dinner_/IMG_0364.JPG';
const heli1 = '/Experiences/Flight of Angels/Heli-1-1-scaled.jpg';
const chobe1 = '/Experiences/Chobe Day Trip_/Chobe-1-1-scaled.jpg';
const gorgeSwing3 = '/Experiences/Gorge Swing_/Bridge-Swing-3-scaled.jpg';
const bungee1 = '/Experiences/Bungee Jump_/Bungee-1-scaled.jpg';
const gameDrive10 = '/Experiences/Game Drive/Game-drive-10-1-scaled.jpg';
const gameDrive4 = '/Experiences/Game Drive/Game-Drive-4-scaled.jpg';
const zipLine1 = '/Experiences/Zip Line_/Bridge-Slide-1-scaled.jpg';
const elecrew5 = '/Experiences/Elephant Interaction_/elecrew-5.jpg';

export const CURRENCY_RATES: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1.0 },
  ZWL: { symbol: 'ZWL$', rate: 25.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 },
  ZAR: { symbol: 'R', rate: 18.5 },
};

export const TRUST_BUILDERS = [
  {
    title: 'Trusted Advice',
    description: 'Honest recommendations tailored to your exact travel dreams and expectations.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Local Expertise',
    description: 'Unmatched first-hand knowledge of Victoria Falls, Zambezi River & Hwange.',
    icon: 'MapPin',
  },
  {
    title: 'Carefully Selected',
    description: 'We only partner with lodges and tour guides we personally know and trust.',
    icon: 'Award',
  },
  {
    title: 'Personal Service',
    description: 'Dedicated travel concierges offering guided support from booking to departure.',
    icon: 'HeartHandshake',
  },
];

export const FEATURED_PACKAGES: TravelPackage[] = [
  {
    id: 'pkg-essentials',
    title: 'Victoria Falls Essentials',
    badge: 'Best Value',
    category: 'value',
    tagline: 'The ideal gateway package for first-time visitors seeking the iconic wonders of Mosi-oa-Tunya.',
    description: 'Perfect for first-time visitors wanting to experience the absolute best of the Falls without the stress. Includes guided rainforest walks, a serene sunset cruise on the upper Zambezi, and seamless transfers.',
    priceUSD: 650,
    duration: '3 Days / 2 Nights',
    imageUrl: fallsTour1,
    highlights: [
      'Guided Rainforest Walk at Mosi-oa-Tunya National Park',
      'Luxury Zambezi Sunset Cruise with complimentary drinks & tapas',
      'Traditional BOMA Dinner & Drum Show experience',
      'Private airport transfers in air-conditioned vehicles',
    ],
    included: [
      '2 Nights Bed & Breakfast at selected boutique hotel',
      'All park conservation fees & river levies',
      'Private guided rainforest excursion',
      'Sunset cruise on the Zambezi River',
      '24/7 Dedicated On-Ground Concierge Support',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Arrival & Sundowner River Cruise',
        description: 'Warm welcome at Victoria Falls Airport (VFA). Private transfer to your boutique lodge. In the late afternoon, board a riverboat for a romantic sunset cruise along the Zambezi River, watching hippos and elephants along the banks.',
      },
      {
        day: 'Day 2',
        title: 'Iconic Falls Tour & BOMA Feast',
        description: 'Morning guided walking tour through the Victoria Falls Rainforest, learning about flora, geology, and local lore. Free afternoon to visit local craft markets. In the evening, enjoy a feast of local Zimbabwean cuisine and drum show at The BOMA.',
      },
      {
        day: 'Day 3',
        title: 'Souvenir Shopping & Departure',
        description: 'Relaxed breakfast overlooking the bush. Optional morning craft shopping or lookout cafe coffee before your private return airport transfer.',
      },
    ],
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: 'pkg-romantic',
    title: 'Romantic Escape',
    badge: 'Luxury',
    category: 'luxury',
    tagline: 'An intimate, ultra-luxurious retreat crafted to celebrate life’s most memorable moments.',
    description: 'A carefully crafted luxury weekend designed to celebrate life’s most memorable and significant moments. Private riverfront villa accommodations, helicopter flight over the mist, and private candlelit dining.',
    priceUSD: 1850,
    duration: '4 Days / 3 Nights',
    imageUrl: heli1,
    highlights: [
      '13-minute "Flight of Angels" helicopter experience over Victoria Falls',
      'Private riverfront suite with plunge pool at a luxury river lodge',
      'Private candlelit dinner on a floating Zambezi deck',
      'Couples spa massage treatment overlooking the gorge',
    ],
    included: [
      '3 Nights Luxury All-Inclusive at 5-Star River Lodge',
      'Helicopter flight over Victoria Falls',
      'Private guided tours with personal vehicle',
      'All fine dining meals, premium wines & spirits',
      'Couple massage & wellness treatment',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'VIP Arrival & Sunset Champagne',
        description: 'VIP meet and assist at Victoria Falls Airport. Escorted transfer to luxury river lodge. Sunset champagne on your private deck over the Zambezi.',
      },
      {
        day: 'Day 2',
        title: 'Flight of Angels & Private Falls Tour',
        description: 'Breathtaking helicopter flight capturing the grandeur of Victoria Falls from above. Afternoon private guided rainforest tour followed by a private couples massage.',
      },
      {
        day: 'Day 3',
        title: 'Private Safari & Candlelit Deck Dining',
        description: 'Early morning game drive in Zambezi National Park with private ranger. Evening candlelit 5-course dinner under the stars on a private pontoon.',
      },
      {
        day: 'Day 4',
        title: 'Lazy Morning & VIP Departure',
        description: 'Gourmet champagne breakfast and leisure time before private helicopter or luxury vehicle airport transfer.',
      },
    ],
    rating: 5.0,
    reviewCount: 94,
  },
  {
    id: 'pkg-family',
    title: 'Family Adventure',
    badge: 'Family Favourites',
    category: 'family',
    tagline: 'Unforgettable, safe, and exhilarating experiences tailored for all ages.',
    description: 'Kid-friendly activities, spacious family accommodation, and unforgettable Zambezi wildlife encounters. Includes lion sanctuary interactions, crocodile park, game drives, and gentle canopy tours.',
    priceUSD: 1200,
    duration: '4 Days / 3 Nights',
    imageUrl: elecrew5,
    highlights: [
      'Family Safari Game Drive in Zambezi National Park',
      'Interactive Wildlife Conservation & Elephant Experience',
      'Victoria Falls Canopy Zipline Tour (kid safe)',
      'Spacious interconnected family suite at a resort with kids club',
    ],
    included: [
      '3 Nights Bed & Breakfast in Family Resort Suite',
      'All transfers & guided excursions',
      'Zambezi National Park safari & snacks',
      'Guided Falls tour with kid-friendly ranger',
      'Full BOMA dinner experience',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Resort Welcome & Family Sunset Cruise',
        description: 'Arrive at Victoria Falls resort with swimming pools and lush gardens. Board a spacious family pontoon for a sunset cruise with elephant sightings.',
      },
      {
        day: 'Day 2',
        title: 'Rainforest Walk & Canopy Zipline',
        description: 'Morning walk through Victoria Falls spray with raincoats for kids! Afternoon gentle canopy zip-line tour through the gorge trees.',
      },
      {
        day: 'Day 3',
        title: 'Wildlife Safari & BOMA Drumming',
        description: 'Open 4x4 vehicle safari tracking giraffe, zebra, and buffalo. Night full of energetic African drumming, face painting, and dancing at The BOMA.',
      },
      {
        day: 'Day 4',
        title: 'Elephant & Craft Workshop & Farewell',
        description: 'Morning interactive visit to conservation sanctuary and craft carving demo before departure.',
      },
    ],
    rating: 4.8,
    reviewCount: 82,
  },
  {
    id: 'pkg-hwange-combo',
    title: 'Vic Falls & Hwange Safari Combo',
    badge: 'Signature',
    category: 'adventure',
    tagline: 'Combine the thunderous majesty of Victoria Falls with Zimbabwe’s premier elephant kingdom.',
    description: 'The ultimate Zimbabwean double-bill. Experience 2 nights at Victoria Falls followed by 2 nights inside Hwange National Park, home to over 40,000 free-roaming elephants.',
    priceUSD: 2150,
    duration: '5 Days / 4 Nights',
    imageUrl: gameDrive10,
    highlights: [
      'Full Victoria Falls tour & Zambezi sunset cruise',
      '2 Nights at Hwange Safari Lodge with waterhole viewing deck',
      'Day & Night 4x4 game drives led by licensed professional guides',
      'Walking safari tracking big game with armed ranger',
    ],
    included: [
      '2 Nights Vic Falls + 2 Nights Hwange Luxury Safari Lodge',
      'All transfers between Vic Falls and Hwange National Park',
      'All meals on safari in Hwange',
      'Game drives and park conservation fees',
    ],
    itinerary: [
      {
        day: 'Day 1-2',
        title: 'Victoria Falls Wonder & River Cruise',
        description: 'Explore the majestic Falls, indulge in local cuisine, and cruise the Zambezi.',
      },
      {
        day: 'Day 3-4',
        title: 'Hwange Elephant Kingdom Safari',
        description: 'Scenic transfer to Hwange. Daily morning and afternoon safari drives seeing huge herds of elephants, lions, sable antelope, and wild dogs.',
      },
      {
        day: 'Day 5',
        title: 'Sunrise Game Drive & Departure',
        description: 'Final morning safari and breakfast before return transfer to Victoria Falls Airport.',
      },
    ],
    rating: 4.95,
    reviewCount: 67,
  },
];

export const VIC_FALLS_SPOTS: TravelSpot[] = [
  {
    id: 'spot-rainforest',
    name: 'Victoria Falls Rainforest Park',
    category: 'Rainforest & Falls',
    shortDesc: 'Walk along the precipice of Mosi-oa-Tunya with 16 panoramic viewpoints.',
    fullDesc: 'A lush micro-rainforest nourished perpetually by the spray of the Falls. Walk along paved paths to legendary viewpoints including Danger Point, Cataract Island, and the Main Falls.',
    imageUrl: fallsTour1,
    location: 'Victoria Falls Town, Zimbabwe',
    idealFor: 'Everyone / Nature Lovers',
    insiderTip: 'Visit between 8:00 AM and 10:00 AM to see brilliant double rainbows arches across the gorge!',
  },
  {
    id: 'spot-cruise',
    name: 'Zambezi River Sunset Cruise',
    category: 'River & Wildlife',
    shortDesc: 'Glide along calm river waters while elephants cross and hippos wallow.',
    fullDesc: 'Cruising the upper Zambezi River above the Falls is an iconic Zimbabwean ritual. Watch hippos emerge, fish eagles soar, and elephants swim between islands as the sunset paints the sky in deep amber.',
    imageUrl: cruise1,
    location: 'Upper Zambezi River',
    idealFor: 'Couples, Photographers, Families',
    insiderTip: 'Ask for a seat on the top deck for unobstructed 360-degree photography views.',
  },
  {
    id: 'spot-lookout',
    name: 'The Lookout Café',
    category: 'Dining & Culture',
    shortDesc: 'Cliffside dining perched 120m directly above the Batoka Gorge rapids.',
    fullDesc: 'Enjoy artisan cocktails, grilled impala, and craft coffee while sitting right over the edge of Batoka Gorge, watching thrill-seekers gorge swing and zipline in front of your eyes.',
    imageUrl: zipLine1,
    location: 'Batoka Gorge Rim',
    idealFor: 'Foodies, Sunset Views',
    insiderTip: 'Book a table for 4:30 PM to secure prime cliffside sunset seating.',
  },
  {
    id: 'spot-gorge-swing',
    name: 'Batoka Gorge Swing & Zipline',
    category: 'Adrenaline',
    shortDesc: 'A heart-pounding 70m freefall into the spectacular gorge.',
    fullDesc: 'For adrenaline seekers, leap off the edge into a breathtaking freefall before swinging high across the river gorge with views of the historic Victoria Falls Bridge.',
    imageUrl: gorgeSwing3,
    location: 'Lookout Point, Batoka Gorge',
    idealFor: 'Thrill Seekers',
    insiderTip: 'Tandem swings are available for couples or parents jumping with teens!',
  },
];

const advisorImg = fallsTour1;
const guideImg = elecrew5;

export const ACCOMMODATIONS: Accommodation[] = [
  {
    id: 'acc-victoria-falls-hotel',
    name: 'The Victoria Falls Hotel',
    type: 'Boutique Hotel',
    priceRangeUSD: '$420 - $850 / night',
    rating: 4.9,
    imageUrl: fallsTour1,
    features: ['Views of Vic Falls Bridge', 'Historic Grand Tea Terrace', 'Private Path to Falls', 'Luxury Pool'],
    description: 'The historic "Grand Dame" of Victoria Falls established in 1904. Colonial elegance paired with modern luxury and private walkway access to the rainforest.',
  },
  {
    id: 'acc-palm-river-hotel',
    name: 'The Palm River Hotel',
    type: 'Luxury River Lodge',
    priceRangeUSD: '$550 - $1100 / night',
    rating: 5.0,
    imageUrl: cruise1,
    features: ['Direct Zambezi River Frontage', 'Private Infinity Pools', 'Queensland Architecture', 'Private Jetty'],
    description: 'Nestled under indigenous trees on the banks of the Zambezi River. Peaceful, elegant suites with frequent elephant visitors along the riverbank.',
  },
  {
    id: 'acc-lokuthula-lodges',
    name: 'Lokuthula Lodges',
    type: 'Resort',
    priceRangeUSD: '$220 - $480 / night',
    rating: 4.7,
    imageUrl: bomaImg1,
    features: ['Self-catering or B&B', 'Kid Friendly Pools', 'Wildlife on Property', 'BOMA Restaurant On-Site'],
    description: 'Thatch-roofed lodges surrounded by indigenous bush where warthogs and bushbuck roam freely across the manicured gardens.',
  },
];

export const TRAVEL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Tinashe & Ruvarashe M.',
    roleOrCity: 'Harare, Zimbabwe',
    avatar: guideImg,
    rating: 5,
    date: 'July 2026',
    title: 'Flawless romantic getaway!',
    comment: 'Outbound Holidays made our wedding anniversary in Victoria Falls completely magical. The helicopter flight and sunset river cruise were seamlessly coordinated.',
    verifiedBuyer: true,
    type: 'travel',
  },
  {
    id: 'rev-2',
    author: 'David & Sarah K.',
    roleOrCity: 'London, UK',
    avatar: advisorImg,
    rating: 5,
    date: 'June 2026',
    title: 'True local Zimbabwean expertise',
    comment: 'Having local Zimbabwean travel advisors made all the difference. We avoided the tourist crowds, stayed at the best lodge, and saw huge herds of elephants in Hwange.',
    verifiedBuyer: true,
    type: 'travel',
  },
];
