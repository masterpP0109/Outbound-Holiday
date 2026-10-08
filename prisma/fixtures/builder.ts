// Public image paths for experiences
const fallsTour1 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
const cruise1 = '/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
const bomaImg1 = '/Experiences/Boma Dinner_/IMG_0364.JPG';
const heli1 = '/Experiences/Flight of Angels/Heli-1-1-scaled.jpg';
const chobe1 = '/Experiences/Chobe Day Trip_/Chobe-1-1-scaled.jpg';
const gorgeSwing3 = '/Experiences/Gorge Swing_/Bridge-Swing-3-scaled.jpg';
const bungee1 = '/Experiences/Bungee Jump_/Bungee-1-scaled.jpg';
const gameDrive10 = '/Experiences/Game Drive/Game-drive-10-1-scaled.jpg';


interface ActivityItem {
  id: string;
  title: string;
  duration: string;
  priceUSD: number;
  imageUrl: string;
  badge: string;
  shortDesc: string;
  whyRecommend: string;
  idealFor: string[];
}

export const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: 'act-guided-falls',
    title: 'Guided Rainforest Walk of Victoria Falls',
    duration: '2.5 Hours',
    priceUSD: 40,
    imageUrl: fallsTour1,
    badge: 'First-Time Essential',
    shortDesc: 'Walk along the precipice of Mosi-oa-Tunya across 16 spectacular viewpoints with an expert guide.',
    whyRecommend: 'Essential for first-time visitors — local guides reveal secret rainbow spots and geological history.',
    idealFor: ['first-time', 'family', 'romantic', 'value'],
  },
  {
    id: 'act-sunset-cruise',
    title: 'Zambezi Sunset River Cruise',
    duration: '2.5 Hours',
    priceUSD: 75,
    imageUrl: cruise1,
    badge: 'Most Popular',
    shortDesc: 'Cruise the upper Zambezi while watching hippos, elephants, and golden sunset reflections with drinks & snacks.',
    whyRecommend: 'The quintessential Victoria Falls evening ritual — serene, photogenic, and incredibly relaxing.',
    idealFor: ['first-time', 'family', 'romantic', 'inspire'],
  },
  {
    id: 'act-boma-dinner',
    title: 'The BOMA - Dinner & Drum Show',
    duration: '3.0 Hours',
    priceUSD: 55,
    imageUrl: bomaImg1,
    badge: 'Cultural Feast',
    shortDesc: 'Traditional Zimbabwean feast, face painting, local game meats, and energetic interactive drumming.',
    whyRecommend: 'High energy night for families and groups — every guest gets their own djembe drum!',
    idealFor: ['family', 'first-time', 'celebration'],
  },
  {
    id: 'act-helicopter',
    title: '13-Min "Flight of Angels" Helicopter',
    duration: '15 Mins',
    priceUSD: 150,
    imageUrl: heli1,
    badge: 'Bucket-List View',
    shortDesc: 'Soar directly over the roaring curtain of mist, Batoka Gorge, and Zambezi National Park from above.',
    whyRecommend: 'Offers the only vantage point to comprehend the full width and immense scale of Victoria Falls.',
    idealFor: ['romantic', 'celebration', 'adventure', 'first-time'],
  },
  {
    id: 'act-chobe-safari',
    title: 'Full-Day Chobe National Park Safari (Botswana)',
    duration: 'Full Day',
    priceUSD: 170,
    imageUrl: chobe1,
    badge: 'Wildlife Spectacular',
    shortDesc: 'Cross into Botswana for a morning Chobe River safari cruise and an afternoon 4x4 big game drive.',
    whyRecommend: 'Home to over 50,000 elephants — virtually guarantees up-close wild elephant and lion encounters.',
    idealFor: ['wildlife', 'family', 'adventure'],
  },
  {
    id: 'act-gorge-swing',
    title: 'Batoka Gorge Swing & Zipline',
    duration: '2.0 Hours',
    priceUSD: 95,
    imageUrl: gorgeSwing3,
    badge: 'Thrill Seekers',
    shortDesc: 'Freefall 70 meters into the Batoka Gorge or slide across the canopy above the Zambezi rapids.',
    whyRecommend: 'Top rated adrenaline activity in Africa — tandem leaps available for brave couples & teenagers!',
    idealFor: ['adventure', 'celebration'],
  },
  {
    id: 'act-devils-pool',
    title: 'Devil’s Pool & Livingstone Island (Seasonal)',
    duration: '3.5 Hours',
    priceUSD: 160,
    imageUrl: bungee1,
    badge: 'Extreme Bucket-List',
    shortDesc: 'Swim in a natural rock pool right on the precipice of Victoria Falls during dry low-water season.',
    whyRecommend: 'Available August to January. Safe guided experience offering the ultimate edge-of-the-world photo.',
    idealFor: ['adventure', 'celebration', 'romantic'],
  },
  {
    id: 'act-hwange-extension',
    title: 'Hwange National Park 2-Night Safari Extension',
    duration: '2 Days / 2 Nights',
    priceUSD: 480,
    imageUrl: gameDrive10,
    badge: 'Safari Kingdom',
    shortDesc: 'Extend your stay into Zimbabwe’s premier game reserve with open 4x4 night drives and walking safaris.',
    whyRecommend: 'Combine Victoria Falls with classic African wilderness — famous for massive elephant waterhole herds.',
    idealFor: ['wildlife', 'romantic', 'family'],
  },
];

export const STAY_TIERS = [
  {
    id: 'smart-value',
    name: 'Smart Value',
    tagline: 'Clean, comfortable & well-reviewed lodges',
    pricePerNightUSD: 220,
    imageUrl: gameDrive10,
    desc: 'Clean, charming boutique lodges that leave more of your budget available for bucket-list experiences.',
    highlights: ['Includes hot breakfast', 'Swimming pool & gardens', '10-min shuttle to Falls'],
  },
  {
    id: 'comfort-plus',
    name: 'Comfort Plus',
    tagline: 'Upgraded resort facilities & prime location',
    pricePerNightUSD: 380,
    imageUrl: fallsTour1,
    desc: 'Spacious resort rooms or riverfront chalets with lush gardens, wildlife on property, and dining options.',
    highlights: ['River view or garden rooms', 'Spacious family suites', 'On-site spa & pool bar'],
  },
  {
    id: 'premium-escape',
    name: 'Premium Escape',
    tagline: '5-Star luxury riverfront suites',
    pricePerNightUSD: 750,
    imageUrl: cruise1,
    desc: 'Luxury river lodges with private plunge pools, gourmet fine dining, and direct Zambezi River frontage.',
    highlights: ['All-inclusive dining & drinks', 'Private plunge pool', 'Personal lodge concierge'],
  },
  {
    id: 'private-exclusive',
    name: 'Private & Exclusive',
    tagline: 'VIP river villas & private guides',
    pricePerNightUSD: 1250,
    imageUrl: heli1,
    desc: 'Private luxury villa, dedicated butler service, private 4x4 safari vehicle, and bespoke pontoon dining.',
    highlights: ['Private villa & pool', 'Private guide & safari 4x4', 'VIP airport helicopter transfers'],
  },
];
