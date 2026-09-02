import { Experience, ALL_EXPERIENCES } from './experiencesData';

// Public image paths for experiences
const fallsTour1 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
const fallsTour7 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-falls-7-scaled.jpg';
const fallsTour11 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-falls-11-scaled.jpg';
const cruise1 = '/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
const cruise2 = '/Experiences/Standard Cruise_/Standard-2-scaled.jpg';
const cruise5 = '/Experiences/Standard Cruise_/Standard-5-scaled.jpg';
const cruise7 = '/Experiences/Standard Cruise_/Standard-7.jpg';
const heli1 = '/Experiences/Flight of Angels/Heli-1-1-scaled.jpg';
const heli8 = '/Experiences/Flight of Angels/Heli-8-scaled.jpg';
const heliShoot1 = '/Experiences/Flight of Angels/Heli-Shoot-7102511.jpg';
const elecrew5 = '/Experiences/Elephant Interaction_/elecrew-5.jpg';
const elecrew02 = '/Experiences/Elephant Interaction_/Elecrew-02.jpg';
const gameDrive10 = '/Experiences/Game Drive/Game-drive-10-1-scaled.jpg';
const gameDrive2 = '/Experiences/Game Drive/Game-Drive-2-scaled.jpg';
const gameDrive4 = '/Experiences/Game Drive/Game-Drive-4-scaled.jpg';
const chobe1 = '/Experiences/Chobe Day Trip_/Chobe-1-1-scaled.jpg';
const chobe2 = '/Experiences/Chobe Day Trip_/Chobe-2.jpg';
const chobe4 = '/Experiences/Chobe Day Trip_/Chobe-4-scaled.jpg';
const chobe8 = '/Experiences/Chobe Day Trip_/Chobe-8-scaled.jpg';
const bungee1 = '/Experiences/Bungee Jump_/Bungee-1-scaled.jpg';
const bungee8 = '/Experiences/Bungee Jump_/Bungee-8.jpg';
const gorgeSwing3 = '/Experiences/Gorge Swing_/Bridge-Swing-3-scaled.jpg';
const gorgeSwing5 = '/Experiences/Gorge Swing_/Bridge-Swing-5-scaled.jpg';
const bomaImg1 = '/Experiences/Boma Dinner_/IMG_0364.JPG';
const bomaImg2 = '/Experiences/Boma Dinner_/IMG_0365.PNG';
const rafting2 = '/Experiences/White Water Rafting_/whitewater-rafting-images-2.jpg';
const rafting8 = '/Experiences/White Water Rafting_/whitewater-rafting-images-8.jpg';
const zipLine1 = '/Experiences/Zip Line_/Bridge-Slide-1-scaled.jpg';
const zipLine8 = '/Experiences/Zip Line_/Bridge-slide-8.jpg';
const simunye1 = '/Experiences/Simunye_/Simunye-refresh-29.jpg';
const simunye2 = '/Experiences/Simunye_/Simunye-Spirit-Of-Africa-31.jpg';
const spa1 = '/Experiences/Spa Treatments/IMG_0375.PNG';
const spa2 = '/Experiences/Spa Treatments/IMG_0376.PNG';
const jetBoat1 = '/Experiences/Jet Boat Adventure_/IMG_0021-2.jpg';

export interface DetailedItineraryDay {
  day: string;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  included: string[];
  optionalUpgrade?: string;
  travelNotes?: string;
  image?: string;
}

export interface DetailedPackage {
  id: string;
  slug: string;
  title: string;
  badge: 'Best Value' | 'Luxury' | 'Family Favourites' | 'Adventure' | 'Signature' | 'Popular';
  category: 'value' | 'luxury' | 'family' | 'adventure' | 'safari' | 'first-visit' | 'couples';
  categories: Array<'first-visit' | 'couples' | 'families' | 'luxury' | 'adventure' | 'safari' | 'value'>;
  tagline: string;
  description: string;
  priceUSD: number;
  duration: string;
  travellerType: string;
  imageUrl: string;
  galleryImages: string[];
  
  // Editorial additions
  storyIntroduction: string;
  whyWeRecommend: string;
  
  whoIsThisFor: {
    perfectIf: string[];
    considerOthersIf: string[];
    alternativeSlug?: string;
    alternativeTitle?: string;
  };
  
  highlightsMeta: {
    accommodation: string;
    transfers: string;
    meals: string;
    countries: string;
    bestFor: string;
    difficulty: string;
    season: string;
  };
  
  highlights: string[];
  included: string[];
  notIncluded: string[];
  
  itinerary: {
    day: string;
    title: string;
    description: string;
    highlights?: string[];
  }[];
  
  detailedItinerary?: DetailedItineraryDay[];
  
  recommendedHotels: {
    id: string;
    name: string;
    type: string;
    rating: number;
    description: string;
    imageUrl: string;
    location?: string;
    facilities?: string[];
    upgradeOptions?: string;
  }[];
  
  whyWeChoseStay: string;
  
  includedExperienceIds: string[];
  
  routeMap: {
    step: number;
    title: string;
    location: string;
    description: string;
  }[];
  
  pricingDetails: {
    basis: string;
    assumptions: string[];
    factorsAffecting: string[];
  };
  
  faqs: {
    question: string;
    answer: string;
  }[];
  
  relatedPackageIds: string[];
  rating: number;
  reviewCount: number;
}

export const ALL_PACKAGES: DetailedPackage[] = [
  // 1. Victoria Falls Essentials
  {
    id: 'pkg-essentials',
    slug: 'victoria-falls-essentials',
    title: 'Victoria Falls Essentials',
    badge: 'Best Value',
    category: 'value',
    categories: ['first-visit', 'value'],
    tagline: 'The ideal gateway package for first-time visitors seeking the iconic wonders of Mosi-oa-Tunya.',
    description: 'Perfect for first-time visitors wanting to experience the absolute best of Victoria Falls without stress or overspending. Includes guided rainforest walks, a serene sunset cruise on the upper Zambezi, traditional cultural dining and seamless airport transfers.',
    priceUSD: 650,
    duration: '3 Days / 2 Nights',
    travellerType: 'First-Time Visitors, Couples & Value Seekers',
    imageUrl: fallsTour1,
    galleryImages: [
      fallsTour1,
      cruise1,
      bomaImg1,
    ],
    storyIntroduction: 'Imagine arriving in Victoria Falls in the late afternoon, checking into your hotel and ending your first day on the Zambezi River as the sun sets over the water. The following morning, step into the rainforest to experience Mosi-oa-Tunya before enjoying a relaxed afternoon or adding a helicopter flight over the Falls.',
    whyWeRecommend: 'Victoria Falls can feel overwhelming for first-time visitors because there are so many hotels, activities and day-trip options. We designed this itinerary to include the destination’s most important experiences while preserving enough free time to relax or personalise the holiday.',
    whoIsThisFor: {
      perfectIf: [
        'Visiting Victoria Falls for the very first time',
        'Wanting the key iconic highlights without feeling rushed',
        'Preferring a clean, well-balanced itinerary with zero logisitical stress',
        'Travelling as a couple, family or small group',
        'Seeking high-quality local guidance and seamless private transfers'
      ],
      considerOthersIf: [
        'You are seeking a high-adrenaline extreme adventure itinerary',
        'You want a multi-day wildlife safari deep into Chobe or Hwange',
        'You prefer ultra-luxury 5-star private villa accommodations'
      ],
      alternativeSlug: 'victoria-falls-chobe-explorer',
      alternativeTitle: 'Victoria Falls & Chobe Explorer'
    },
    highlightsMeta: {
      accommodation: '3★ or 4★ Boutique Hotel / Safari Lodge',
      transfers: 'Private AC Airport & Activity Transfers Included',
      meals: 'Daily Breakfast + BOMA Feast Dinner',
      countries: 'Zimbabwe (Victoria Falls)',
      bestFor: 'First-Time Visitors & Value Travellers',
      difficulty: 'Relaxed / Easy Pace',
      season: 'Year-Round (High water March–July)',
    },
    highlights: [
      'Guided Rainforest Walk across all 16 Mosi-oa-Tunya viewpoints',
      'Upper Zambezi Sunset Cruise with complimentary drinks & tapas',
      'Traditional BOMA Dinner & Drum Show cultural experience',
      'Seamless airport transfers in air-conditioned vehicles',
    ],
    included: [
      '2 Nights Accommodation in selected boutique hotel or lodge',
      'Daily delicious breakfast spread',
      'Private guided rainforest walking excursion',
      'Upper Zambezi luxury sunset boat cruise with drinks & tapas',
      'Full BOMA Dinner & Drum Show cultural feast',
      'Return Victoria Falls Airport (VFA) private transfers',
      'All national park conservation fees & river levies',
      '24/7 Dedicated Victoria Falls Concierge Support',
    ],
    notIncluded: [
      'International and regional flight tickets',
      'Zimbabwe entry visa fees (payable at border/airport)',
      'Travel and medical insurance',
      'Personal laundry, telephone calls and gratuities',
      'Optional activity upgrades (Helicopter Flight, Bungee Jump)',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Arrival & Upper Zambezi Sunset Cruise',
        description: 'Warm welcome upon arrival at Victoria Falls Airport (VFA) by your Outbound Holidays driver guide. Private transfer to your hotel for check-in. In the late afternoon, board a river vessel for a sunset cruise along the upper Zambezi, watching hippos, crocodiles and elephants along the riverbank while enjoying cold drinks and tapas.',
        highlights: ['Private VFA Airport Transfer', 'Zambezi River Sunset Cruise', 'Open Bar & Snacks'],
      },
      {
        day: 'Day 2',
        title: 'Guided Rainforest Walk & BOMA Cultural Feast',
        description: 'After breakfast, embark on a comprehensive guided walking tour of the Victoria Falls Rainforest. Your guide will lead you through all 16 viewpoints, explaining the geology, folklore and mist-fed flora. Afternoon at leisure for souvenir shopping. In the evening, head to The BOMA for a feast of local cuisine, face painting, and an interactive djembe drumming show.',
        highlights: ['16 Rainforest Viewpoints', 'Expert Local Guide', 'BOMA Dinner & Drumming Show'],
      },
      {
        day: 'Day 3',
        title: 'Craft Market & Departure',
        description: 'Relaxed morning breakfast overlooking the garden or bush. Optional coffee stop at Lookout Café or final handicraft shopping at Elephant’s Walk Village before your private return transfer to Victoria Falls Airport.',
        highlights: ['Breakfast', 'Elephant Walk Craft Village Visit', 'Return VFA Transfer'],
      },
    ],
    detailedItinerary: [
      {
        day: 'Day 1',
        title: 'Welcome to Victoria Falls & Sunset Cruise',
        morning: 'Airport arrival at Victoria Falls International Airport (VFA). Meet-and-greet with your private Outbound guide holding personalized signage.',
        afternoon: 'Private air-conditioned transfer to your boutique hotel or safari lodge. Check-in, refresh by the pool, and relax after your journey.',
        evening: 'Transfer to the Zambezi jetty for your Upper Zambezi Sunset Cruise. Sip chilled gin & tonic or local beverages while watching hippos, crocs and birdlife as the sun sets over Zambia.',
        included: ['Private VFA Airport Transfer', 'Zambezi Sunset Cruise', 'Complimentary Beverages & Snacks'],
        optionalUpgrade: 'Luxury Pontoon Cruise or Private Captained River Launch',
        travelNotes: 'Keep your camera handy on the riverbank as wild elephants frequently cross the river at dusk.',
        image: cruise1
      },
      {
        day: 'Day 2',
        title: 'Mosi-oa-Tunya Rainforest & BOMA Cultural Feast',
        morning: 'Guided walking tour through the lush Victoria Falls Rainforest. Your licensed expert guide leads you to all 16 spectacular viewpoints including Cataract Island, Main Falls, and Danger Point.',
        afternoon: 'Leisure time to explore Victoria Falls town, enjoy lunch at Lookout Café suspended over the gorge, or take an optional scenic helicopter flight over the falls.',
        evening: 'Immerse yourself in Zimbabwean culture at The BOMA – Dinner & Drum Show. Enjoy a four-course feast including traditional braai meats, face painting, and an energetic interactive drumming session.',
        included: ['Guided Rainforest Walk', 'National Park Entrance Fees', 'Full BOMA Feast & Drum Show'],
        optionalUpgrade: '13-Minute "Flight of Angels" Helicopter Scenic Flight',
        travelNotes: 'Raincoats are provided during high-water months (Feb–June), but light waterproof phone bags are recommended.',
        image: fallsTour1
      },
      {
        day: 'Day 3',
        title: 'Curio Artisans & Farewell',
        morning: 'Enjoy a leisurely breakfast on the lodge terrace. Browse local woodcarvings and stone sculptures at Elephant’s Walk Shopping & Artist Village.',
        afternoon: 'Final check-out and private transfer to Victoria Falls Airport for your outbound flight.',
        evening: 'Departure and onward journey with unforgettable memories of the Smoke that Thunders.',
        included: ['Breakfast', 'Private Departure Transfer'],
        optionalUpgrade: 'Late Departure Airport Lounge Pass',
        travelNotes: 'Allow 2 hours before international flight departures at VFA Airport.',
        image: bomaImg1
      }
    ],
    recommendedHotels: [
      {
        id: 'pioneer-lodge',
        name: 'Pioneer Lodge & Camp',
        type: 'Boutique Safari Stay',
        rating: 4.8,
        description: 'Tranquil boutique stay nestled in natural woodland, offering spacious garden rooms, pool and warm Zimbabwean hospitality.',
        imageUrl: fallsTour7,
        location: 'Victoria Falls Suburbs (5 mins from Falls)',
        facilities: ['Swimming Pool', 'Bush Restaurant', 'Free Wi-Fi', 'Garden Lounge'],
        upgradeOptions: 'Upgrade to Victoria Falls Safari Lodge or Shearwater Explorers Village'
      },
      {
        id: 'shearwater-explorers',
        name: 'Shearwater Explorers Village',
        type: 'Modern Central Village Lodge',
        rating: 4.7,
        description: 'Vibrant modern village setup located right in the heart of town, walking distance to curio markets and cafes.',
        imageUrl: cruise5,
        location: 'Victoria Falls Central',
        facilities: ['Plunge Pool', 'Open-Air Bar & Grill', 'Tour Desk', 'Air-Conditioned Rooms']
      }
    ],
    whyWeChoseStay: 'We chose Pioneer Lodge and Shearwater Explorers Village for this package because they offer immaculate cleanliness, tranquil garden surroundings, exceptional security, and unbeatable proximity to Mosi-oa-Tunya while keeping your total trip cost very accessible.',
    includedExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'boma-dinner-show'],
    routeMap: [
      { step: 1, title: 'Arrival at VFA Airport', location: 'Victoria Falls Airport', description: 'Meet & greet with private transfer.' },
      { step: 2, title: 'Check-in & Sunset Cruise', location: 'Upper Zambezi River', description: 'Settle into your hotel & board riverboat.' },
      { step: 3, title: 'Rainforest Tour & BOMA', location: 'Victoria Falls Rainforest', description: 'Explore Mosi-oa-Tunya & evening drum show.' },
      { step: 4, title: 'Departure', location: 'Victoria Falls Airport', description: 'Private transfer for outbound flight.' },
    ],
    pricingDetails: {
      basis: 'Per person based on two adults sharing a twin/double room.',
      assumptions: [
        'Two guests travelling together sharing accommodation',
        '3-Star or 4-Star boutique safari lodge option',
        'Standard shared sunset cruise and small-group guided rainforest walk',
        'Private air-conditioned airport transfers'
      ],
      factorsAffecting: [
        'Travel dates (Peak dry season July–Oct vs Green season Nov–March)',
        'Choice of accommodation upgrade (e.g., Victoria Falls Hotel or Safari Lodge)',
        'Single supplement for solo travellers',
        'Optional activity add-ons (Helicopter flights, Chobe safari extension)'
      ]
    },
    faqs: [
      {
        question: 'Can I customise or add extra days to this package?',
        answer: 'Yes! Every Outbound package is a flexible starting framework. We can add nights, upgrade your hotel, or include additional activities such as a helicopter flight or Chobe day trip.',
      },
      {
        question: 'Is entry to Victoria Falls Rainforest included?',
        answer: 'Yes, all national park conservation entrance fees and river levies are included in your final package price.',
      },
      {
        question: 'What is the recommended hotel option for value travellers?',
        answer: 'Pioneer Lodge or Shearwater Explorers Village offer exceptional comfort, clean modern amenities, and prime location at a great value.',
      },
      {
        question: 'Are children allowed on this package?',
        answer: 'Yes! Children of all ages are welcome. We adjust room layouts to family suites and select child-friendly boats for the sunset cruise.',
      }
    ],
    relatedPackageIds: ['pkg-family', 'pkg-romantic', 'pkg-chobe-explorer'],
    rating: 4.9,
    reviewCount: 128,
  },

  // 2. Classic Victoria Falls Experience
  {
    id: 'pkg-classic',
    slug: 'classic-victoria-falls',
    title: 'Classic Victoria Falls Experience',
    badge: 'Popular',
    category: 'first-visit',
    categories: ['first-visit', 'couples', 'value'],
    tagline: 'The quintessential 4-day Victoria Falls holiday with iconic views, wildlife and dining.',
    description: 'Immerse yourself in the classic Victoria Falls journey. Four days of unhurried exploration combining the majestic rainforest walk, a scenic sunset river cruise, a game drive in Zambezi National Park, and the famous BOMA cultural feast.',
    priceUSD: 890,
    duration: '4 Days / 3 Nights',
    travellerType: 'First-time visitors, couples & leisure travellers',
    imageUrl: gameDrive10,
    galleryImages: [
      gameDrive10,
      fallsTour7,
      cruise2,
    ],
    storyIntroduction: 'Step into the realm of Mosi-oa-Tunya where thunder meets tranquil river waters. Four unhurried days allow you to experience Victoria Falls at a relaxed pace—soaking in morning rainforest rainbows, afternoon safari game drives, and evenings spent under starlit African skies.',
    whyWeRecommend: 'The Classic 4-Day itinerary provides the ideal duration for most travellers. It eliminates any feeling of rushing between activities while allowing ample time for optional high-adrenaline add-ons like helicopter flights or gorge swings.',
    whoIsThisFor: {
      perfectIf: [
        'You want a complete, well-paced 4-day Victoria Falls vacation',
        'You want both rainforest scenery and authentic wildlife game drives',
        'You appreciate having free afternoons for coffee or craft markets',
        'You want premium 4-star lodge comfort'
      ],
      considerOthersIf: [
        'You only have 2 nights available (see Victoria Falls Essentials)',
        'You want an international 2-country safari into Botswana (see Chobe Explorer)'
      ],
      alternativeSlug: 'victoria-falls-chobe-explorer',
      alternativeTitle: 'Victoria Falls & Chobe Explorer'
    },
    highlightsMeta: {
      accommodation: '4★ Victoria Falls Safari Lodge or Riverfront Hotel',
      transfers: 'Private Air-Conditioned Vehicle Transfers',
      meals: 'Daily Breakfast + BOMA Cultural Feast',
      countries: 'Zimbabwe',
      bestFor: 'Couples & Classic Travel Enthusiasts',
      difficulty: 'Easy / Relaxed',
      season: 'Year-Round',
    },
    highlights: [
      'Complete guided walk across all 16 rainforest viewpoints',
      'Upper Zambezi Sunset River Cruise with drinks & tapas',
      'Game Drive tracking elephants and wildlife in Zambezi National Park',
      'BOMA Dinner & Interactive Drumming Show',
    ],
    included: [
      '3 Nights 4★ Hotel Accommodation',
      'Daily breakfast spread',
      'Guided Rainforest Walk with entry fees',
      'Sunset River Cruise with open bar & snacks',
      '4x4 Game Drive in Zambezi National Park',
      'BOMA Dinner & Drum Show',
      'Private return VFA Airport transfers',
    ],
    notIncluded: [
      'International airfares',
      'Entry visa fees',
      'Travel insurance',
      'Optional activity add-ons',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Arrival & Sunset River Cruise',
        description: 'Airport welcome transfer to your lodge. Unwind before embarking on a classic Zambezi sunset cruise.',
        highlights: ['VFA Airport Pick-up', 'Sunset River Cruise'],
      },
      {
        day: 'Day 2',
        title: 'Rainforest Tour & BOMA Feast',
        description: 'Morning guided walk through the rainforest. Free afternoon followed by the famous BOMA cultural feast.',
        highlights: ['Rainforest Walk', 'BOMA Drumming Night'],
      },
      {
        day: 'Day 3',
        title: 'Zambezi Game Drive & High Tea',
        description: 'Morning 4x4 wildlife safari in Zambezi National Park. Afternoon optional high tea at Victoria Falls Hotel.',
        highlights: ['4x4 Game Drive', 'High Tea Option'],
      },
      {
        day: 'Day 4',
        title: 'Farewell Victoria Falls',
        description: 'Breakfast and relaxing morning before your private airport transfer.',
        highlights: ['Breakfast', 'Private Departure Transfer'],
      },
    ],
    detailedItinerary: [
      {
        day: 'Day 1',
        title: 'Arrival & Sunset River Cruise',
        morning: 'Airport pick-up at Victoria Falls Airport by your private guide.',
        afternoon: 'Check into your 4-star lodge overlooking natural bush. Time to relax by the swimming pool.',
        evening: 'Board an Upper Zambezi sunset boat cruise. Watch hippos and elephants along the riverbank while enjoying cold drinks.',
        included: ['Private Airport Transfer', 'Sunset Cruise & Drinks'],
        optionalUpgrade: 'Luxury Pontoon Deck Upgrade',
        travelNotes: 'Sunset on the Zambezi is around 17:30 - 18:00 depending on the season.',
        image: cruise1
      },
      {
        day: 'Day 2',
        title: 'Rainforest Tour & BOMA Cultural Feast',
        morning: 'Comprehensive guided walk through the Victoria Falls rainforest mist to see the Main Falls and Cataract Island.',
        afternoon: 'Free time to visit local art markets or take an optional helicopter flight.',
        evening: 'Dine at The BOMA for a four-course feast of local game meats and interactive djembe drumming.',
        included: ['Guided Rainforest Walk', 'BOMA Dinner & Drum Show'],
        optionalUpgrade: 'Flight of Angels Helicopter Flight',
        travelNotes: 'Bring comfortable walking shoes.',
        image: fallsTour7
      },
      {
        day: 'Day 3',
        title: 'Zambezi National Park Safari',
        morning: 'Open 4x4 vehicle game drive into Zambezi National Park tracking herds of elephants, buffalo, giraffe, and sable antelope.',
        afternoon: 'Enjoy lunch at Lookout Café overlooking the Batoka Gorge.',
        evening: 'Relaxing evening at your lodge deck watching wildlife at the waterhole.',
        included: ['Zambezi 4x4 Game Drive', 'National Park Fees'],
        optionalUpgrade: 'Private Night Game Drive Extension',
        travelNotes: 'Mornings in the open 4x4 can be crisp in winter (June–Aug), warm jackets provided.',
        image: gameDrive10
      },
      {
        day: 'Day 4',
        title: 'Souvenirs & Departure',
        morning: 'Enjoy breakfast and time to collect handcrafted woodcarvings.',
        afternoon: 'Private airport transfer for your outbound flight home.',
        evening: 'Onward departure.',
        included: ['Breakfast', 'Departure Transfer'],
        image: bomaImg2
      }
    ],
    recommendedHotels: [
      {
        id: 'vic-falls-safari-lodge-classic',
        name: 'Victoria Falls Safari Lodge',
        type: '4★ Waterhole Safari Lodge',
        rating: 4.9,
        description: 'Iconic timber lodge built on a high plateau overlooking a busy wildlife waterhole in the African bush.',
        imageUrl: gameDrive2,
        location: 'Zambezi National Park border',
        facilities: ['Waterhole Viewing Deck', 'Two-Tier Pool', 'MaKuwa-Kuwa Restaurant', 'Free Shuttle']
      }
    ],
    whyWeChoseStay: 'Victoria Falls Safari Lodge offers an authentic African safari atmosphere with wildlife grazing right in front of your balcony, combined with renowned hospitality and eco-friendly practices.',
    includedExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'boma-dinner-show'],
    routeMap: [
      { step: 1, title: 'Arrival VFA', location: 'Victoria Falls Airport', description: 'Airport transfer & river cruise.' },
      { step: 2, title: 'Rainforest & BOMA', location: 'Victoria Falls', description: 'Mosi-oa-Tunya walk & drum show.' },
      { step: 3, title: 'Zambezi Safari', location: 'Zambezi National Park', description: '4x4 Game drive.' },
      { step: 4, title: 'Departure', location: 'Victoria Falls Airport', description: 'Private transfer.' },
    ],
    pricingDetails: {
      basis: 'Per person based on double occupancy sharing a standard room.',
      assumptions: [
        'Two guests travelling together',
        '4-Star safari lodge accommodation',
        'All transfers and activities included as specified'
      ],
      factorsAffecting: [
        'High season rates (July-October)',
        'Upgrading to waterhole-facing suites',
        'Adding private helicopter or Chobe day trip'
      ]
    },
    faqs: [
      {
        question: 'Is this itinerary customizable?',
        answer: 'Yes, we can extend your stay or add extra activities according to your preferences.',
      },
      {
        question: 'Are meals included?',
        answer: 'Breakfast is included daily, along with the full BOMA dinner and sunset cruise beverages/tapas.',
      }
    ],
    relatedPackageIds: ['pkg-essentials', 'pkg-family', 'pkg-romantic'],
    rating: 4.9,
    reviewCount: 96,
  },

  // 3. Family Adventure
  {
    id: 'pkg-family',
    slug: 'family-adventure',
    title: 'Family Adventure',
    badge: 'Family Favourites',
    category: 'family',
    categories: ['families', 'first-visit', 'adventure'],
    tagline: 'Unforgettable, safe, and exhilarating experiences tailored for all ages.',
    description: 'Kid-friendly activities, spacious family accommodation, and unforgettable Zambezi wildlife encounters. Includes lion sanctuary interactions, crocodile park, game drives, and gentle canopy zip tours.',
    priceUSD: 1200,
    duration: '4 Days / 3 Nights',
    travellerType: 'Families with Children & Multi-Generational Groups',
    imageUrl: elecrew5,
    galleryImages: [
      elecrew5,
      fallsTour1,
      bomaImg1,
    ],
    storyIntroduction: 'Watch your children’s eyes light up as they feel the spray of Victoria Falls on their faces and spot wild elephants drinking along the Zambezi River. Designed around safety, child-friendly pacing, and fun family memories that will last a lifetime.',
    whyWeRecommend: 'Travelling with family requires the right balance of exciting activities, reliable logistics, child-safe transport, and resorts with swimming pools and spacious family suites. We took care of every detail so parents can relax completely.',
    whoIsThisFor: {
      perfectIf: [
        'Travelling with children or teenagers',
        'Multi-generational family groups seeking shared adventure',
        'Wanting safe, structured activities tailored for kids',
        'Preferring resorts with pools and spacious interconnecting rooms'
      ],
      considerOthersIf: [
        'Seeking an adult-only romantic retreat (see Romantic Escape)',
        'Wanting extreme adrenaline jumps or long multi-day wilderness treks'
      ],
      alternativeSlug: 'romantic-escape',
      alternativeTitle: 'Romantic Escape'
    },
    highlightsMeta: {
      accommodation: 'Family Resort Suite with Pools & Gardens',
      transfers: 'Private Family Air-Conditioned Van',
      meals: 'Daily Breakfast + Family BOMA Dinner',
      countries: 'Zimbabwe',
      bestFor: 'Families with Children & Groups',
      difficulty: 'Easy / Moderate Active Options',
      season: 'Year-Round (Best wildlife May–Oct)',
    },
    highlights: [
      'Family Safari Game Drive in Zambezi National Park',
      'Interactive Wildlife & Conservation Sanctuary visit',
      'Gentle Victoria Falls Canopy Zipline Tour (kid-safe)',
      'Spacious interconnected family suite at a resort with pool',
    ],
    included: [
      '3 Nights Bed & Breakfast in Family Resort Suite',
      'All private family airport and excursion transfers',
      'Guided Falls tour with kid-friendly local ranger',
      'Zambezi River family sunset cruise with snacks & beverages',
      'Interactive Big Five open 4x4 game drive in Zambezi National Park',
      'Full BOMA Dinner & Drumming experience for the whole family',
      'All park conservation fees and levies',
    ],
    notIncluded: [
      'International flights to/from Victoria Falls',
      'Visa fees upon entry into Zimbabwe',
      'Travel and medical insurance',
      'Optional adult adrenaline activities (Bungee / Gorge Swing)',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Resort Welcome & Family Sunset River Cruise',
        description: 'Arrive at Victoria Falls Airport. Your family is greeted by your dedicated driver guide and transferred to your resort. Unwind by the pool before boarding a spacious family pontoon for a sunset cruise where kids can spot hippos and elephants along the banks.',
        highlights: ['Airport Pick-up', 'Resort Check-In', 'Family Sunset Cruise'],
      },
      {
        day: 'Day 2',
        title: 'Rainforest Spray Walk & Canopy Zipline',
        description: 'Morning walk through the Victoria Falls rainforest with raincoats for the kids to jump in the mist! In the afternoon, take on a gentle gorge canopy zip-line tour suitable for children and adults.',
        highlights: ['Rainforest Mist Walk', 'Canopy Zipline Experience', 'Afternoon Pool Relaxation'],
      },
      {
        day: 'Day 3',
        title: 'Wildlife Safari Drive & BOMA Drumming Night',
        description: 'Open 4x4 vehicle safari tracking giraffe, zebra, buffalo, and elephants in Zambezi National Park. In the evening, experience a night of African face painting, dancing, and drumming at The BOMA.',
        highlights: ['Zambezi Game Drive', 'Face Painting & Drumming', 'BOMA Feast'],
      },
      {
        day: 'Day 4',
        title: 'Elephant Sanctuary & Farewell',
        description: 'Morning interactive visit to a local wildlife conservation sanctuary before your private return transfer to Victoria Falls Airport.',
        highlights: ['Sanctuary Visit', 'Souvenir Shopping', 'Airport Departure'],
      },
    ],
    detailedItinerary: [
      {
        day: 'Day 1',
        title: 'Resort Welcome & Family Sunset Cruise',
        morning: 'Airport arrival at Victoria Falls. Meet your friendly family guide and transfer in a private air-conditioned van.',
        afternoon: 'Check into your spacious family suite at a riverfront resort. Kids can splash in the swimming pool.',
        evening: 'Embark on a family-friendly Zambezi sunset cruise. Fruit juices and sodas for kids, wine/beer for parents, plus tasty snacks.',
        included: ['Private Van Transfer', 'Family Sunset Cruise'],
        optionalUpgrade: 'Private Boat Charter for the Family',
        travelNotes: 'Life jackets suitable for children are provided on board.',
        image: cruise1
      },
      {
        day: 'Day 2',
        title: 'Rainforest Spray Walk & Canopy Zipline',
        morning: 'Guided rainforest walk with fun facts about wildlife and geology. Raincoats provided for mist fun!',
        afternoon: 'Gorge Canopy Zipline Tour—a safe, gentle zipline network through the forest canopy suitable for ages 6+.',
        evening: 'Dinner at leisure at the resort restaurant.',
        included: ['Guided Rainforest Tour', 'Canopy Zipline Tour'],
        optionalUpgrade: 'Family Helicopter Flight',
        travelNotes: 'Closed shoes are required for the zipline.',
        image: fallsTour1
      },
      {
        day: 'Day 3',
        title: 'Zambezi Game Drive & BOMA Drum Show',
        morning: 'Open 4x4 game drive searching for elephants, giraffe, zebra, and warthogs.',
        afternoon: 'Relaxing pool time and craft shopping.',
        evening: 'The BOMA Dinner & Drumming experience with traditional face painting and interactive djembe drums for every child.',
        included: ['4x4 Game Drive', 'BOMA Feast & Drum Show'],
        travelNotes: 'An unforgettable cultural highlight for children.',
        image: elecrew5
      },
      {
        day: 'Day 4',
        title: 'Wildlife Sanctuary & Airport Farewell',
        morning: 'Visit a wildlife conservation sanctuary to learn about conservation.',
        afternoon: 'Private transfer to Victoria Falls Airport.',
        evening: 'Onward departure.',
        included: ['Breakfast', 'Sanctuary Entry', 'Airport Transfer'],
        image: gameDrive4
      }
    ],
    recommendedHotels: [
      {
        id: 'a-zambezi-river-lodge',
        name: 'A’Zambezi River Lodge',
        type: 'Family Riverfront Resort',
        rating: 4.8,
        description: 'The only hotel situated directly on the banks of the Zambezi River within Victoria Falls, featuring expansive lawns, pool and family rooms.',
        imageUrl: elecrew02,
        location: 'Direct Zambezi Riverfront',
        facilities: ['Large Swimming Pool', 'Riverfront Lawn', 'Family Interconnecting Rooms', 'Kids Menu']
      }
    ],
    whyWeChoseStay: 'A’Zambezi River Lodge provides wide green lawns where children can play safely under shade trees, wild warthogs occasionally grazing nearby, and a large resort pool that kids love after morning activities.',
    includedExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'boma-dinner-show'],
    routeMap: [
      { step: 1, title: 'Arrival at VFA', location: 'Victoria Falls Airport', description: 'Family transfer to river resort.' },
      { step: 2, title: 'Rainforest & Canopy Zip', location: 'Victoria Falls Gorge', description: 'Guided rainforest walk & canopy zipline.' },
      { step: 3, title: 'Wildlife Safari & BOMA', location: 'Zambezi National Park', description: 'Game drive & interactive drumming night.' },
      { step: 4, title: 'Departure', location: 'Victoria Falls Airport', description: 'Return transfer.' },
    ],
    pricingDetails: {
      basis: 'Per person based on family room sharing (2 adults + 2 children under 12).',
      assumptions: [
        'Family of 4 sharing interconnecting or family suite',
        'Child discount applied for under 12 years',
        'Private family van transfers'
      ],
      factorsAffecting: [
        'Ages of children (teenagers vs young children)',
        'Peak holiday school vacation periods',
        'Adding optional helicopter flight'
      ]
    },
    faqs: [
      {
        question: 'Are activities safe for young children?',
        answer: 'Yes! All family activities are carefully vetted for safety, with child-appropriate gear, patient guides, and flexible schedules.',
      },
      {
        question: 'Can we book interconnecting rooms?',
        answer: 'Absolutely. We arrange interconnecting or multi-bedroom family suites at our recommended partner lodges.',
      }
    ],
    relatedPackageIds: ['pkg-essentials', 'pkg-chobe-explorer', 'pkg-hwange-combo'],
    rating: 4.8,
    reviewCount: 82,
  },

  // 4. Romantic Escape
  {
    id: 'pkg-romantic',
    slug: 'romantic-escape',
    title: 'Romantic Escape',
    badge: 'Luxury',
    category: 'luxury',
    categories: ['couples', 'luxury', 'first-visit'],
    tagline: 'An intimate, ultra-luxurious retreat crafted to celebrate life’s most memorable moments.',
    description: 'A carefully crafted luxury escape designed for honeymoons, anniversaries, or romantic celebrations. Private riverfront villa accommodations, helicopter flight over the mist, private sunset cruises and intimate candlelit dining.',
    priceUSD: 1850,
    duration: '4 Days / 3 Nights',
    travellerType: 'Honeymooners, Couples & Anniversary Celebrations',
    imageUrl: cruise1,
    galleryImages: [
      cruise1,
      heli1,
      spa1,
    ],
    storyIntroduction: 'Picture waking up to the gentle sounds of the Zambezi River flowing past your private riverfront villa. Soar hand in hand over the mighty Victoria Falls on a scenic helicopter flight, then celebrate the evening with a private candlelit 5-course dinner under the starry African sky.',
    whyWeRecommend: 'Victoria Falls is one of the most romantic destinations on earth. We created this package specifically to elevate romance—including luxury 5-star river suites, private transfers, champagne sunset cruises, and couples wellness treatments.',
    whoIsThisFor: {
      perfectIf: [
        'Celebrating a honeymoon, anniversary or milestone romantic getaway',
        'Wanting 5-star luxury riverfront villa accommodations with private plunge pools',
        'Seeking intimate private dining and scenic helicopter flights',
        'Appreciating VIP concierge attention and seamless transfers'
      ],
      considerOthersIf: [
        'Travelling on a tighter budget (see Victoria Falls Essentials)',
        'Travelling with active young children (see Family Adventure)'
      ],
      alternativeSlug: 'victoria-falls-essentials',
      alternativeTitle: 'Victoria Falls Essentials'
    },
    highlightsMeta: {
      accommodation: '5★ Luxury Riverfront Lodge Suite with Plunge Pool',
      transfers: 'VIP Private Chauffeur Transfers',
      meals: 'All Fine Dining Meals, Premium Wines & Spirits',
      countries: 'Zimbabwe',
      bestFor: 'Couples, Honeymooners & Anniversaries',
      difficulty: 'Leisurely / Luxurious',
      season: 'Year-Round (Romantic sunsets year-round)',
    },
    highlights: [
      '13-minute "Flight of Angels" helicopter experience over Victoria Falls',
      'Private riverfront suite with plunge pool at a 5-star river lodge',
      'Private candlelit dinner on a pontoon overlooking the Zambezi',
      'Couples spa massage treatment with river views',
    ],
    included: [
      '3 Nights Luxury Accommodation in Private Riverfront Suite',
      'All fine dining meals, high teas, premium wines and spirits',
      '13-minute Flight of Angels scenic helicopter flight',
      'Private guided Victoria Falls rainforest tour',
      'Private luxury Zambezi sunset river cruise',
      'Couples spa wellness treatment overlooking the gorge',
      'VIP Airport meet-and-assist & chauffeur transfers',
      'All park entrance fees and conservation levies',
    ],
    notIncluded: [
      'International airfares',
      'Visa fees upon arrival',
      'Travel insurance',
      'Gratuities for private lodge staff and guides',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'VIP Arrival & Sunset Champagne Cruise',
        description: 'VIP meet and assist at Victoria Falls Airport. Escorted transfer to your luxury river lodge. Check into your riverfront villa with private plunge pool. Late afternoon sunset champagne cruise on the Zambezi.',
        highlights: ['VIP Airport Meet', 'Luxury River Suite', 'Sunset Champagne Cruise'],
      },
      {
        day: 'Day 2',
        title: 'Flight of Angels & Private Falls Tour',
        description: 'Breathtaking 13-minute helicopter flight capturing the grandeur of Victoria Falls from above. Afternoon private guided rainforest tour followed by a relaxing couples spa massage.',
        highlights: ['Helicopter Scenic Flight', 'Private Rainforest Walk', 'Couples Spa Massage'],
      },
      {
        day: 'Day 3',
        title: 'Private Wildlife Safari & Candlelit Deck Dining',
        description: 'Early morning game drive in Zambezi National Park with a private ranger. Afternoon relaxing on your deck. Evening candlelit 5-course gourmet dinner under the stars on a private river pontoon.',
        highlights: ['Private Morning Safari', '5-Course Pontoon Dinner', 'Stargazing on Zambezi'],
      },
      {
        day: 'Day 4',
        title: 'Lazy Morning & VIP Departure',
        description: 'Gourmet champagne breakfast on your private deck and leisure time before your luxury vehicle airport transfer.',
        highlights: ['Champagne Deck Breakfast', 'VIP Departure Transfer'],
      },
    ],
    detailedItinerary: [
      {
        day: 'Day 1',
        title: 'VIP Arrival & Sunset Champagne Cruise',
        morning: 'VIP meet-and-assist upon arrival at VFA Airport. Private executive transfer to your 5-star river lodge.',
        afternoon: 'Check into your ultra-private river villa featuring an outdoor deep soaking tub and private plunge pool.',
        evening: 'Private sunset cruise on the Zambezi River served with chilled champagne and artisanal canapés.',
        included: ['VIP Chauffeur Transfer', 'Private River Suite', 'Sunset Champagne Cruise'],
        optionalUpgrade: 'Private Helicopter Airport Arrival Transfer',
        travelNotes: 'Honeymoon amenities and flower turn-down service prepared upon arrival.',
        image: cruise2
      },
      {
        day: 'Day 2',
        title: 'Flight of Angels & Couples Spa',
        morning: 'Soar above Mosi-oa-Tunya on a 13-minute Flight of Angels scenic helicopter flight.',
        afternoon: 'Private guided rainforest walk, followed by a soothing 60-minute couples massage overlooking the Zambezi riverbanks.',
        evening: 'Gourmet dinner served under romantic lighting at the lodge main deck.',
        included: ['Helicopter Scenic Flight', 'Private Guided Falls Tour', 'Couples Spa Treatment'],
        travelNotes: 'Helicopter departure time optimized for morning golden light.',
        image: heli1
      },
      {
        day: 'Day 3',
        title: 'Private Game Drive & Candlelit Pontoon Dinner',
        morning: 'Private morning game drive with your dedicated ranger tracking lions, leopards, and elephant herds.',
        afternoon: 'High tea served on your private villa deck.',
        evening: 'Exclusive 5-course candlelit dinner setup on a private river pontoon floating beneath the African stars.',
        included: ['Private Game Drive', '5-Course Pontoon Dinner', 'All Premium Drinks'],
        image: spa1
      },
      {
        day: 'Day 4',
        title: 'Lazy Breakfast & VIP Departure',
        morning: 'Gourmet champagne breakfast served on your deck.',
        afternoon: 'Private executive transfer to Victoria Falls Airport.',
        evening: 'Outbound departure.',
        included: ['Champagne Breakfast', 'VIP Transfer'],
        image: fallsTour11
      }
    ],
    recommendedHotels: [
      {
        id: 'old-drift-lodge',
        name: 'Old Drift Lodge',
        type: '5-Star Luxury River Lodge',
        rating: 5.0,
        description: 'Nestled on the banks of the Zambezi River within Zambezi National Park, offering opulent canvas suites with outdoor plunge pools and free-roaming wildlife.',
        imageUrl: spa2,
        location: 'Zambezi National Park (Riverfront)',
        facilities: ['Private Plunge Pools', 'Outdoor Bath Tubs', 'All-Inclusive Fine Dining', 'Private Butler']
      }
    ],
    whyWeChoseStay: 'Old Drift Lodge provides unmatched privacy, luxury tented suites with private plunge pools directly facing the Zambezi River, and world-class culinary experiences tailored for couples.',
    includedExperienceIds: ['flight-of-angels', 'upper-zambezi-sunset-cruise', 'guided-tour-falls'],
    routeMap: [
      { step: 1, title: 'VIP VFA Welcome', location: 'Victoria Falls Airport', description: 'Chauffeur transfer to luxury river lodge.' },
      { step: 2, title: 'Helicopter & Spa', location: 'Victoria Falls Gorge', description: 'Flight of Angels & private spa treatment.' },
      { step: 3, title: 'Private Safari & Pontoon', location: 'Zambezi River', description: 'Game drive & candlelit pontoon dinner.' },
      { step: 4, title: 'Departure', location: 'Victoria Falls Airport', description: 'VIP return transfer.' },
    ],
    pricingDetails: {
      basis: 'Per person based on double occupancy in a private river suite.',
      assumptions: [
        'Two adults sharing private luxury suite',
        'All fine dining meals and premium spirits included',
        'Private transfers and helicopter flight included'
      ],
      factorsAffecting: [
        'Honeymoon high season demand',
        'Upgrading to 25-minute extended helicopter flight',
        'Adding private charter flights'
      ]
    },
    faqs: [
      {
        question: 'Can we add champagne or special honeymoon surprises?',
        answer: 'Yes! We coordinate with the lodge for complimentary champagne, flower turndowns, and romantic private dining setup.',
      },
      {
        question: 'Is the helicopter flight private?',
        answer: 'Standard helicopter flights are shared with up to 6 guests; private charter upgrades are readily available upon request.',
      }
    ],
    relatedPackageIds: ['pkg-grand-luxury', 'pkg-essentials', 'pkg-hwange-combo'],
    rating: 5.0,
    reviewCount: 94,
  },

  // 5. Victoria Falls & Chobe Explorer
  {
    id: 'pkg-chobe-explorer',
    slug: 'victoria-falls-chobe-explorer',
    title: 'Victoria Falls & Chobe Explorer',
    badge: 'Popular',
    category: 'safari',
    categories: ['safari', 'adventure', 'first-visit'],
    tagline: 'Combine the majesty of Victoria Falls with Botswana’s world-famous Chobe elephant kingdom.',
    description: 'The ultimate two-country adventure combining the thunderous wonder of Victoria Falls with a full-day wildlife safari into Chobe National Park, Botswana—home to the highest concentration of elephants in Africa.',
    priceUSD: 1450,
    duration: '4 Days / 3 Nights',
    travellerType: 'Wildlife Lovers, Safari Enthusiasts & Photographers',
    imageUrl: chobe1,
    galleryImages: [
      chobe1,
      chobe4,
      fallsTour1,
    ],
    storyIntroduction: 'Cross the border from Zimbabwe into Botswana and witness hundreds of wild elephants drinking, swimming, and playing along the banks of the Chobe River. Combine world-class big game viewing with the thunder of Victoria Falls in one seamless 4-day itinerary.',
    whyWeRecommend: 'Chobe National Park is located just 70 km from Victoria Falls, making it one of Africa’s greatest value multi-country safari combinations. Our seamless cross-border transfers make visiting Botswana effortless.',
    whoIsThisFor: {
      perfectIf: [
        'Wanting to combine Victoria Falls with an authentic Big Five safari in Botswana',
        'Fascinated by wild elephants, lions, buffalo, and river wildlife',
        'Seeking a 2-country African experience in a single 4-day trip',
        'Desiring expert guided border assistance'
      ],
      considerOthersIf: [
        'Preferring to remain solely within Zimbabwe without border crossings',
        'Wanting an extended 3+ night deep bush stay inside Hwange National Park'
      ],
      alternativeSlug: 'vic-falls-hwange-safari',
      alternativeTitle: 'Vic Falls & Hwange Big Game Safari'
    },
    highlightsMeta: {
      accommodation: '4★ Victoria Falls Lodge / Boutique Stay',
      transfers: 'Cross-Border Guided Transfers (Zim to Botswana)',
      meals: 'Daily Breakfast + Chobe Safari Buffet Lunch',
      countries: 'Zimbabwe & Botswana',
      bestFor: 'Wildlife Enthusiasts & Photographers',
      difficulty: 'Active / Moderate Travel',
      season: 'Year-Round (Best Chobe wildlife May–Nov)',
    },
    highlights: [
      'Full Day Chobe National Park Safari (Boat Cruise + 4x4 Game Drive)',
      'Guided Rainforest Walk across Victoria Falls viewpoints',
      'Upper Zambezi Sunset Cruise with drinks and snacks',
      'Seamless border crossing assistance between Zimbabwe and Botswana',
    ],
    included: [
      '3 Nights Bed & Breakfast at selected boutique lodge',
      'Full-day Chobe Day Trip (River boat safari + 4x4 open vehicle safari)',
      'Buffet lunch at a luxury riverside lodge in Chobe, Botswana',
      'Guided walking tour of Victoria Falls Rainforest',
      'Sunset cruise on the Zambezi River',
      'All airport and cross-border transfers with guide assistance',
      'All national park fees and Botswana conservation levies',
    ],
    notIncluded: [
      'International flights to/from Victoria Falls',
      'Visa fees (KAZA Univisa recommended for Zim/Botswana combo)',
      'Travel insurance',
      'Personal items and optional activities',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Arrival in Victoria Falls & Sunset Cruise',
        description: 'Arrive at Victoria Falls Airport. Escorted transfer to your hotel. Late afternoon sunset cruise on the Zambezi River with open bar beverages and light bites.',
        highlights: ['Airport Pick-up', 'Hotel Check-In', 'Zambezi River Cruise'],
      },
      {
        day: 'Day 2',
        title: 'Full Day Chobe National Park Safari (Botswana)',
        description: 'Early morning pickup for a scenic drive to Kazungula border. Smooth border crossing into Botswana. Begin with a morning Chobe River boat safari watching hundreds of elephants bathing and swimming. After a delicious hotel buffet lunch, embark on an afternoon 4x4 open vehicle game drive tracking lions, leopards, and herds of buffalo.',
        highlights: ['Chobe River Boat Safari', 'Riverside Buffet Lunch', '4x4 Open Vehicle Game Drive'],
      },
      {
        day: 'Day 3',
        title: 'Victoria Falls Guided Rainforest Tour',
        description: 'Morning guided walk through the Victoria Falls rainforest, observing the curtain of water from 16 viewpoints. Free afternoon for craft markets or optional helicopter flight over the gorge.',
        highlights: ['Guided Rainforest Walk', 'Craft Market Visit', 'Optional Helicopter Flight'],
      },
      {
        day: 'Day 4',
        title: 'Souvenir Shopping & Airport Departure',
        description: 'Enjoy breakfast and leisure time before your private return transfer to Victoria Falls Airport.',
        highlights: ['Breakfast', 'Private Departure Transfer'],
      },
    ],
    detailedItinerary: [
      {
        day: 'Day 1',
        title: 'Arrival in Victoria Falls & Sunset Cruise',
        morning: 'Meet & greet at Victoria Falls Airport. Transfer to your boutique safari lodge.',
        afternoon: 'Relax at the lodge before your late afternoon Zambezi River sunset cruise.',
        evening: 'Sunset cruise along the Zambezi River with open bar drinks and tapas snacks.',
        included: ['Airport Pick-up', 'Sunset River Cruise'],
        travelNotes: 'Keep passports handy for check-in documentation.',
        image: cruise1
      },
      {
        day: 'Day 2',
        title: 'Full Day Chobe National Park Safari (Botswana)',
        morning: 'Early morning pickup and transfer to Kazungula border. Guided border crossing into Botswana. Board a river safari boat on the Chobe River watching elephant herds swimming and hippos wallowing.',
        afternoon: 'Enjoy a sumptuous buffet lunch at Chobe Safari Lodge. Afterwards, jump into an open 4x4 game drive vehicle for an afternoon tracking lions, leopards, giraffes, and sable antelopes.',
        evening: 'Return transfer across the border back to your Victoria Falls lodge for a relaxed evening.',
        included: ['Cross-border Transfers', 'Chobe River Boat Safari', 'Riverside Buffet Lunch', '4x4 Chobe Game Drive'],
        optionalUpgrade: 'Overnight Stay in Chobe Lodge',
        travelNotes: 'Passport required with at least 6 months validity.',
        image: chobe1
      },
      {
        day: 'Day 3',
        title: 'Victoria Falls Guided Rainforest Tour',
        morning: 'Guided walking tour through Victoria Falls Rainforest to view Cataract Island, Main Falls, and Danger Point.',
        afternoon: 'Free afternoon for craft shopping at Elephant’s Walk market or optional helicopter flight.',
        evening: 'BOMA dinner option or dining at your leisure.',
        included: ['Guided Rainforest Walk', 'Park Entrance Fees'],
        optionalUpgrade: '13-Minute Helicopter Flight',
        image: fallsTour1
      },
      {
        day: 'Day 4',
        title: 'Farewell Victoria Falls',
        morning: 'Breakfast and check-out.',
        afternoon: 'Private transfer to Victoria Falls Airport.',
        evening: 'Outbound departure.',
        included: ['Breakfast', 'Airport Transfer'],
        image: chobe8
      }
    ],
    recommendedHotels: [
      {
        id: 'victoria-falls-safari-club',
        name: 'Victoria Falls Safari Club',
        type: '4★ Luxury Safari Hotel',
        rating: 4.9,
        description: 'Exclusive club atmosphere with butler service, private lounge and deck overlooking a waterhole.',
        imageUrl: chobe2,
        location: 'Victoria Falls Plateau',
        facilities: ['Private Lounge', 'Butler Service', 'Waterhole Deck', 'Complimentary Cocktails']
      }
    ],
    whyWeChoseStay: 'Victoria Falls Safari Club provides private butler service, exclusive lounge access with complimentary afternoon teas and sundowner cocktails, and sweeping views over the game-rich bushveld.',
    includedExperienceIds: ['chobe-day-safari', 'guided-tour-falls', 'upper-zambezi-sunset-cruise'],
    routeMap: [
      { step: 1, title: 'Arrival at VFA', location: 'Victoria Falls', description: 'Transfer to lodge & sunset cruise.' },
      { step: 2, title: 'Chobe Day Trip', location: 'Chobe, Botswana', description: 'River cruise + 4x4 game drive in Botswana.' },
      { step: 3, title: 'Victoria Falls Tour', location: 'Rainforest Park', description: 'Guided rainforest walk & viewpoints.' },
      { step: 4, title: 'Departure', location: 'Victoria Falls Airport', description: 'Return transfer.' },
    ],
    pricingDetails: {
      basis: 'Per person sharing double room.',
      assumptions: [
        'Two adults travelling together',
        '4-Star lodge accommodation',
        'Includes full-day Chobe safari with buffet lunch and all border transfers'
      ],
      factorsAffecting: [
        'Seasonality in Botswana',
        'KAZA Univisa requirements ($50 USD)',
        'Private Chobe vehicle upgrades'
      ]
    },
    faqs: [
      {
        question: 'Do I need a special visa for Botswana?',
        answer: 'Most nationalities can obtain a KAZA Univisa upon arrival at Victoria Falls Airport for $50, which covers multiple entries between Zimbabwe and Zambia, plus day trips into Botswana.',
      },
      {
        question: 'How long is the drive to Chobe?',
        answer: 'It takes approximately 1 hour to reach Kazungula border, with guided border assistance making crossing fast and easy.',
      }
    ],
    relatedPackageIds: ['pkg-hwange-combo', 'pkg-essentials', 'pkg-family'],
    rating: 4.95,
    reviewCount: 110,
  },

  // 6. Victoria Falls Extreme Adventure
  {
    id: 'pkg-adventure',
    slug: 'adventure-itinerary',
    title: 'Victoria Falls Extreme Adventure',
    badge: 'Adventure',
    category: 'adventure',
    categories: ['adventure', 'value'],
    tagline: 'Adrenaline-fueled 4 days of whitewater rafting, bungee jumping, gorge swinging and helicopter flights.',
    description: 'Designed for thrill-seekers and active travellers. Experience world-class grade 5 whitewater rafting down the Batoka Gorge, 111m bungee jump off the historic bridge, gorge swing, and helicopter flight over the mist.',
    priceUSD: 1150,
    duration: '4 Days / 3 Nights',
    travellerType: 'Thrill-seekers, Active Travellers & Solo Adventurers',
    imageUrl: rafting2,
    galleryImages: [
      rafting2,
      rafting8,
      gorgeSwing3,
    ],
    storyIntroduction: 'Feel your heart leap into your throat as you leap off the historic Victoria Falls Bridge or navigate the violent white crests of Rapid #9 on the Zambezi River. Four action-packed days engineered for pure adrenaline and unforgettable stories.',
    whyWeRecommend: 'Victoria Falls is the adventure capital of Africa. We bundled the region’s premier extreme sports into one seamless itinerary with top-rated safety teams and professional video footage inclusions.',
    whoIsThisFor: {
      perfectIf: [
        'Seeking high-adrenaline thrill activities in Africa',
        'Eager to try whitewater rafting, bungee jump, or gorge swing',
        'Physical fitness for hiking in and out of Batoka Gorge',
        'Travelling solo or with adventurous friends'
      ],
      considerOthersIf: [
        'Preferring a relaxed, low-impact holiday (see Victoria Falls Essentials)',
        'Travelling with toddlers or elderly relatives'
      ],
      alternativeSlug: 'victoria-falls-essentials',
      alternativeTitle: 'Victoria Falls Essentials'
    },
    highlightsMeta: {
      accommodation: 'Central Adventure Lodge / Explorers Village',
      transfers: 'Adventure Shuttle Transfers',
      meals: 'Daily Breakfast + Rafting Riverside Lunch',
      countries: 'Zimbabwe & Zambia Border Bridge',
      bestFor: 'Thrill-Seekers & Active Travellers',
      difficulty: 'High Energy / Active',
      season: 'Rafting Low-Water (Aug–Dec peak rapids)',
    },
    highlights: [
      'Full Day Batoka Gorge Grade 5 Whitewater Rafting',
      '111m Victoria Falls Bridge Bungee Jump or Gorge Swing',
      '13-minute Flight of Angels Helicopter Scenic Flight',
      'Guided Victoria Falls Rainforest Tour',
    ],
    included: [
      '3 Nights Adventure Lodge Accommodation',
      'Daily breakfast spread',
      'Full-day whitewater rafting with river guide and lunch',
      '111m Bungee Jump or Gorge Swing voucher',
      '13-minute Helicopter Flight of Angels',
      'Guided Rainforest Tour',
      'All activity gear and safety equipment',
    ],
    notIncluded: [
      'International flights',
      'Visa fees',
      'Travel insurance covering high-risk sports',
      'Personal items',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Arrival & Lookout Gorge Briefing',
        description: 'Airport welcome transfer to your lodge. Afternoon visit to Lookout Café perched over Batoka Gorge.',
        highlights: ['Airport Transfer', 'Lookout Café Visit'],
      },
      {
        day: 'Day 2',
        title: 'Batoka Gorge Grade 5 Whitewater Rafting',
        description: 'Tackle the world-famous Zambezi rapids under the guidance of expert river guides. Includes riverside lunch.',
        highlights: ['Grade 5 Rafting', 'Riverside Lunch'],
      },
      {
        day: 'Day 3',
        title: 'Bungee Jump & Helicopter Flight',
        description: 'Leap 111 meters off the Victoria Falls Bridge, followed by an afternoon helicopter flight over the falls.',
        highlights: ['111m Bungee Jump', 'Helicopter Flight'],
      },
      {
        day: 'Day 4',
        title: 'Rainforest Tour & Departure',
        description: 'Morning guided walk through Victoria Falls rainforest before your return airport transfer.',
        highlights: ['Rainforest Tour', 'Airport Departure'],
      },
    ],
    detailedItinerary: [
      {
        day: 'Day 1',
        title: 'Arrival & Lookout Gorge View',
        morning: 'Airport pick-up and check-in at Shearwater Explorers Village.',
        afternoon: 'Relax and enjoy lunch at Lookout Café overlooking the Batoka Gorge 120m below.',
        evening: 'Sunset drinks at the lodge pool bar.',
        included: ['Airport Transfer', 'Lodge Accommodation'],
        image: gorgeSwing5
      },
      {
        day: 'Day 2',
        title: 'Full Day Batoka Grade 5 Whitewater Rafting',
        morning: 'Transfer to Batoka Gorge for safety briefing. Hike down the gorge to the Zambezi riverbed. Raft through famous rapids like "The Devil’s Toilet Bowl" and "The Overland Truck".',
        afternoon: 'Riverside BBQ lunch at the gorge exit. Hike up the canyon and return transfer to lodge.',
        evening: 'Relaxing evening after a thrilling physical day on the water.',
        included: ['Full Day Rafting', 'Gear & Safety Helmets', 'Riverside Lunch'],
        travelNotes: 'Moderate physical fitness required to climb in/out of the canyon.',
        image: rafting2
      },
      {
        day: 'Day 3',
        title: 'Victoria Falls Bridge Bungee & Helicopter Flight',
        morning: 'Head to the historic 1905 Victoria Falls Bridge for a 111m solo or tandem Bungee Jump into no-man’s-land.',
        afternoon: 'Afternoon 13-minute scenic helicopter flight over Victoria Falls.',
        evening: 'BOMA dinner option or casual evening in town.',
        included: ['Bridge Bungee Jump', '13-min Helicopter Flight'],
        optionalUpgrade: 'Video & Photo Package',
        image: heli1
      },
      {
        day: 'Day 4',
        title: 'Rainforest Walk & Departure',
        morning: 'Guided walking tour through Victoria Falls Rainforest.',
        afternoon: 'Private transfer to Victoria Falls Airport.',
        evening: 'Departure.',
        included: ['Rainforest Tour', 'Departure Transfer'],
        image: fallsTour1
      }
    ],
    recommendedHotels: [
      {
        id: 'shearwater-explorers-adventure',
        name: 'Shearwater Explorers Village',
        type: 'Vibrant Adventure Village',
        rating: 4.8,
        description: 'Vibrant lodge located centrally in Victoria Falls town with swimming pool, bar, and activity booking center.',
        imageUrl: bungee1,
        location: 'Victoria Falls Central',
        facilities: ['Pool', 'Bar & Grill', 'Activity Desk', 'Air Conditioning']
      }
    ],
    whyWeChoseStay: 'Shearwater Explorers Village is the ultimate hub for adventure travelers—located right in town with quick access to raft briefings, bridge transfers, and lively social areas.',
    includedExperienceIds: ['guided-tour-falls', 'bungee-jump', 'flight-of-angels'],
    routeMap: [
      { step: 1, title: 'Arrival VFA', location: 'Victoria Falls Airport', description: 'Transfer to lodge.' },
      { step: 2, title: 'Whitewater Rafting', location: 'Batoka Gorge', description: 'Grade 5 rafting down the Zambezi.' },
      { step: 3, title: 'Bungee & Helicopter', location: 'Bridge & Sky', description: '111m jump & helicopter flight.' },
      { step: 4, title: 'Departure', location: 'VFA Airport', description: 'Return transfer.' },
    ],
    pricingDetails: {
      basis: 'Per person sharing double or twin room.',
      assumptions: [
        'Two travellers sharing twin room',
        'Includes full day rafting gear and bungee jump voucher'
      ],
      factorsAffecting: [
        'High water vs low water seasonal rafting schedules',
        'Adding gorge swing or zipline add-ons'
      ]
    },
    faqs: [
      {
        question: 'What is the age limit for whitewater rafting?',
        answer: 'Minimum age for Grade 5 rafting is 15 years old. Younger kids can participate in calmer Grade 2-3 family float trips.',
      },
      {
        question: 'Are high-risk sports insurance covered?',
        answer: 'You must ensure your travel insurance policy covers extreme adventure sports including whitewater rafting and bungee jumping.',
      }
    ],
    relatedPackageIds: ['pkg-essentials', 'pkg-family', 'pkg-chobe-explorer'],
    rating: 4.85,
    reviewCount: 74,
  },

  // 7. Vic Falls & Hwange Big Game Safari
  {
    id: 'pkg-hwange-combo',
    slug: 'vic-falls-hwange-safari',
    title: 'Vic Falls & Hwange Big Game Safari',
    badge: 'Signature',
    category: 'safari',
    categories: ['safari', 'adventure'],
    tagline: 'Combine the thunderous majesty of Victoria Falls with Zimbabwe’s premier elephant kingdom.',
    description: 'The ultimate Zimbabwean double-bill. Experience 2 nights at Victoria Falls followed by 2 nights inside Hwange National Park, home to over 40,000 free-roaming elephants, lions, wild dogs, and rhinos.',
    priceUSD: 2150,
    duration: '5 Days / 4 Nights',
    travellerType: 'Wildlife Enthusiasts & Safari Connoisseurs',
    imageUrl: gameDrive2,
    galleryImages: [
      gameDrive2,
      chobe4,
    ],
    storyIntroduction: 'Journey from the roaring thunder of Victoria Falls into the ancient wilderness of Hwange National Park. Here, giant herds of 100+ elephants gather around natural waterholes at sunset while lions roar in the distance.',
    whyWeRecommend: 'Hwange is Zimbabwe’s largest and most famous wildlife reserve. Combining 2 nights at Victoria Falls with 2 nights in Hwange creates the classic African safari combination.',
    whoIsThisFor: {
      perfectIf: [
        'Wanting an authentic deep-bush safari experience in Zimbabwe',
        'Fascinated by big cats, elephant herds, wild dogs, and birdlife',
        'Appreciating professional licensed safari guides',
        'Seeking open 4x4 game drives and bush walking safaris'
      ],
      considerOthersIf: [
        'Only wanting a quick 2-day visit to Victoria Falls'
      ],
      alternativeSlug: 'victoria-falls-essentials',
      alternativeTitle: 'Victoria Falls Essentials'
    },
    highlightsMeta: {
      accommodation: '2 Nights Vic Falls Hotel + 2 Nights Hwange Safari Lodge',
      transfers: 'Scenic Road or Air Transfers between Vic Falls & Hwange',
      meals: 'All Meals on Safari in Hwange + Daily Vic Falls Breakfast',
      countries: 'Zimbabwe (Victoria Falls & Hwange National Park)',
      bestFor: 'Wildlife Enthusiasts, Safari Lovers',
      difficulty: 'Active Safari',
      season: 'Dry Season (June–October peak wildlife)',
    },
    highlights: [
      'Full Victoria Falls rainforest tour & Zambezi sunset cruise',
      '2 Nights at Hwange luxury safari lodge with waterhole viewing deck',
      'Day and night 4x4 game drives led by licensed professional rangers',
      'Guided walking safari tracking big game in Hwange National Park',
    ],
    included: [
      '2 Nights Victoria Falls Lodge + 2 Nights Hwange Safari Lodge',
      'All meals, safari teas and selected beverages in Hwange',
      'Return transfers between Victoria Falls and Hwange National Park',
      'Daily morning, afternoon and night safari drives in 4x4 vehicles',
      'Guided rainforest walk in Victoria Falls',
      'Upper Zambezi sunset river cruise',
      'All national park conservation fees',
    ],
    notIncluded: [
      'International flights',
      'Visa fees',
      'Travel insurance',
      'Gratuities',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Arrive Victoria Falls & River Cruise',
        description: 'Airport welcome transfer to Victoria Falls. Relax before an afternoon Zambezi River sunset cruise.',
        highlights: ['Airport Pick-up', 'Sunset River Cruise'],
      },
      {
        day: 'Day 2',
        title: 'Victoria Falls Tour & Cultural BOMA',
        description: 'Morning guided rainforest walk. Afternoon craft market visit and evening BOMA dinner show.',
        highlights: ['Rainforest Walk', 'BOMA Dinner'],
      },
      {
        day: 'Day 3',
        title: 'Transfer to Hwange National Park & Evening Safari',
        description: 'Scenic road transfer to Hwange National Park. Afternoon game drive tracking elephant herds and lions.',
        highlights: ['Hwange Transfer', '4x4 Game Drive'],
      },
      {
        day: 'Day 4',
        title: 'Full Day Hwange Big Game Tracking',
        description: 'Morning bush walk with armed ranger and afternoon game drive into remote waterholes.',
        highlights: ['Bush Walk', 'Full-Day Big Game Safari'],
      },
      {
        day: 'Day 5',
        title: 'Sunrise Safari & Departure',
        description: 'Final morning safari before return transfer to Victoria Falls Airport.',
        highlights: ['Sunrise Safari', 'Departure Transfer'],
      },
    ],
    detailedItinerary: [
      {
        day: 'Day 1',
        title: 'Arrive Victoria Falls & Sunset Cruise',
        morning: 'Airport pick-up at VFA Airport and check-in at Victoria Falls lodge.',
        afternoon: 'Leisure time at the lodge.',
        evening: 'Zambezi River sunset cruise with drinks and snacks.',
        included: ['Airport Pick-up', 'Sunset River Cruise'],
        image: cruise2
      },
      {
        day: 'Day 2',
        title: 'Rainforest Tour & BOMA Feast',
        morning: 'Guided walking tour through Victoria Falls Rainforest.',
        afternoon: 'Craft market visit in Victoria Falls.',
        evening: 'BOMA Dinner & Drum Show.',
        included: ['Rainforest Tour', 'BOMA Dinner'],
        image: bomaImg1
      },
      {
        day: 'Day 3',
        title: 'Transfer to Hwange & Afternoon Safari',
        morning: 'Scenic road transfer (2 hours) from Victoria Falls to Hwange National Park.',
        afternoon: 'Check into safari lodge and embark on an afternoon 4x4 game drive.',
        evening: 'Dinner at safari lodge overlooking illuminated waterhole.',
        included: ['Hwange Transfer', 'All Safari Meals', '4x4 Game Drive'],
        image: gameDrive10
      },
      {
        day: 'Day 4',
        title: 'Full Day Hwange Big Game Safari',
        morning: 'Early morning game drive and bush walk led by licensed professional ranger.',
        afternoon: 'Relax on the waterhole viewing deck watching elephant herds.',
        evening: 'Night game drive searching for nocturnal predators.',
        included: ['All Safari Meals', 'Morning & Night Safaris'],
        image: gameDrive4
      },
      {
        day: 'Day 5',
        title: 'Sunrise Safari & Airport Farewell',
        morning: 'Final morning sunrise game drive.',
        afternoon: 'Return road transfer directly to Victoria Falls Airport for outbound flight.',
        evening: 'Departure.',
        included: ['Breakfast', 'Return Airport Transfer'],
        image: chobe8
      }
    ],
    recommendedHotels: [
      {
        id: 'hwange-safari-lodge',
        name: 'Hwange Safari Lodge',
        type: 'Safari Lodge with Waterhole Deck',
        rating: 4.8,
        description: 'Overlooking a natural waterhole frequented day and night by large herds of elephants, buffalo, and predators.',
        imageUrl: gameDrive2,
        location: 'Hwange National Park Border',
        facilities: ['Waterhole Deck', 'Pool', 'Restaurant', 'Safari Lounge']
      }
    ],
    whyWeChoseStay: 'Hwange Safari Lodge is famous for its open deck directly facing an active waterhole—you can sit with a cold drink and watch wild elephants drinking just meters away.',
    includedExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'boma-dinner-show'],
    routeMap: [
      { step: 1, title: 'Vic Falls Arrival', location: 'Victoria Falls', description: 'Check-in & sunset cruise.' },
      { step: 2, title: 'Falls Tour', location: 'Victoria Falls Rainforest', description: 'Mosi-oa-Tunya guided walk.' },
      { step: 3, title: 'Hwange National Park', location: 'Hwange Safari Lodge', description: 'Scenic drive & big game drives.' },
      { step: 4, title: 'Departure', location: 'VFA Airport', description: 'Return transfer.' },
    ],
    pricingDetails: {
      basis: 'Per person sharing double room.',
      assumptions: [
        '2 Nights Victoria Falls Hotel + 2 Nights Hwange Lodge',
        'All meals included on safari in Hwange',
        'Road transfers included'
      ],
      factorsAffecting: [
        'Fly-in light aircraft transfer upgrade vs road transfer',
        'Peak dry season safari rates (July-October)'
      ]
    },
    faqs: [
      {
        question: 'How far is Hwange from Victoria Falls?',
        answer: 'Hwange National Park is approximately 180 km (a comfortable 2-hour air-conditioned road transfer or 25-minute flight).',
      },
    ],
    relatedPackageIds: ['pkg-chobe-explorer', 'pkg-grand-luxury', 'pkg-essentials'],
    rating: 4.95,
    reviewCount: 67,
  },

  // 8. Grand Zambezi Luxury Safari & Falls Retreat
  {
    id: 'pkg-grand-luxury',
    slug: 'luxury-escape',
    title: 'Grand Zambezi Luxury Safari & Retreat',
    badge: 'Luxury',
    category: 'luxury',
    categories: ['luxury', 'couples', 'safari'],
    tagline: 'The pinnacle of African elegance, private fly-in safaris and exclusive Zambezi riverfront luxury.',
    description: 'An unforgettable 6-day ultra-luxury retreat combining 5-star riverfront suites in Victoria Falls with a day safari into Chobe and exclusive helicopter transfers.',
    priceUSD: 3400,
    duration: '6 Days / 5 Nights',
    travellerType: 'VIPs, Luxury Connoisseurs & Milestone Celebrations',
    imageUrl: heli1,
    galleryImages: [
      heli1,
      spa1,
    ],
    storyIntroduction: 'Indulge in 6 days of pure African opulence. From private helicopter transfers directly to your riverfront villa to gourmet fine dining prepared by private chefs and exclusive river cruises, experience Victoria Falls at the highest standard.',
    whyWeRecommend: 'Designed for discerning travelers who expect uncompromising luxury, private butler service, exclusive safari vehicles, and top-tier fine dining.',
    whoIsThisFor: {
      perfectIf: [
        'Seeking an exclusive 5-star ultra-luxury safari & falls holiday',
        'Expecting private butler service, fine cellar wines, and plunge pools',
        'Desiring private helicopter transfers and private safari vehicles',
        'Celebrating a major milestone or luxury anniversary'
      ],
      considerOthersIf: [
        'Seeking standard 3-star or 4-star lodging options'
      ],
      alternativeSlug: 'romantic-escape',
      alternativeTitle: 'Romantic Escape'
    },
    highlightsMeta: {
      accommodation: '5★ Ultra-Luxury Riverfront Villa',
      transfers: 'Helicopter & Private Executive Chauffeur',
      meals: 'All Inclusive Fine Dining & Cellar Wines',
      countries: 'Zimbabwe & Botswana',
      bestFor: 'Luxury Travelers, VIPs, Special Celebrations',
      difficulty: 'Relaxed Luxury',
      season: 'Year-Round',
    },
    highlights: [
      'Private helicopter transfers & scenic Flight of Angels flight',
      '5 Nights in a 5-Star River Villa with private pool & butler service',
      'Exclusive private Chobe day safari in Botswana',
      'Gourmet private dining & high-end wellness treatments',
    ],
    included: [
      '5 Nights Ultra-Luxury River Villa Accommodation',
      'All inclusive gourmet meals, fine wines and premium spirits',
      'Helicopter flight over Victoria Falls',
      'Private Chobe safari excursion with dedicated ranger',
      'Private guided falls walk & private sunset cruises',
      'VIP butler service & spa sessions',
    ],
    notIncluded: [
      'International flights',
      'Visas',
      'Travel insurance',
    ],
    itinerary: [
      {
        day: 'Day 1-2',
        title: 'VIP Arrival & Luxury River Suite Indulgence',
        description: 'Private helicopter transfer to your luxury villa. Sunset champagne cruise and private fine dining.',
        highlights: ['Helicopter Transfer', 'Private River Suite', 'Sunset Champagne Cruise'],
      },
      {
        day: 'Day 3-4',
        title: 'Helicopter Flight of Angels & Chobe Day Safari',
        description: 'Flight over Victoria Falls followed by a private day safari into Chobe National Park, Botswana.',
        highlights: ['Flight of Angels', 'Private Chobe Safari'],
      },
      {
        day: 'Day 5-6',
        title: 'Spa Relaxation & VIP Farewell',
        description: 'Relaxing spa treatments, high tea, and private helicopter return airport transfer.',
        highlights: ['Spa Treatments', 'VIP Helicopter Departure'],
      },
    ],
    detailedItinerary: [
      {
        day: 'Day 1',
        title: 'VIP Arrival & Villa Check-In',
        morning: 'VIP executive welcome at VFA Airport with private helicopter transfer to villa.',
        afternoon: 'Settle into your river villa with private plunge pool and dedicated butler.',
        evening: 'Private sunset champagne cruise on the Zambezi River.',
        included: ['Helicopter Transfer', 'All-Inclusive Villa Stay', 'Sunset Cruise'],
        image: cruise2
      },
      {
        day: 'Day 2',
        title: 'Private Falls Tour & Fine Dining',
        morning: 'Private guided tour of Victoria Falls Rainforest.',
        afternoon: 'High tea on the terrace.',
        evening: 'Gourmet 6-course wine-pairing dinner.',
        included: ['Private Falls Tour', 'Wine Pairing Dinner'],
        image: fallsTour1
      },
      {
        day: 'Day 3',
        title: 'Private Chobe Safari (Botswana)',
        morning: 'Private chauffeur transfer to Chobe National Park for an exclusive river cruise.',
        afternoon: 'Private open 4x4 game drive in Chobe.',
        evening: 'Return to villa for candlelit dinner.',
        included: ['Private Chobe Safari', 'Gourmet Lunch'],
        image: chobe1
      },
      {
        day: 'Day 4',
        title: 'Helicopter Flight & Spa',
        morning: 'Scenic helicopter flight over Victoria Falls.',
        afternoon: 'Full spa treatment day overlooking the Zambezi.',
        evening: 'Private pontoon deck dinner.',
        included: ['Helicopter Flight', 'Full Spa Treatments'],
        image: spa1
      },
      {
        day: 'Day 5',
        title: 'Zambezi Private Safari & Sundowners',
        morning: 'Private morning game drive in Zambezi National Park.',
        afternoon: 'Leisurely afternoon at the pool.',
        evening: 'Sundowner cocktails on the riverbank.',
        included: ['Private Safari Drive', 'Sundowners'],
        image: gameDrive10
      },
      {
        day: 'Day 6',
        title: 'VIP Departure',
        morning: 'Gourmet breakfast and check-out.',
        afternoon: 'Private helicopter transfer to Victoria Falls Airport.',
        evening: 'Departure.',
        included: ['Gourmet Breakfast', 'VIP Helicopter Departure'],
        image: heli1
      }
    ],
    recommendedHotels: [
      {
        id: 'victoria-falls-hotel-suite',
        name: 'The Victoria Falls Hotel (Presidential Suite)',
        type: '5-Star Grand Heritage Hotel',
        rating: 5.0,
        description: 'The iconic "Grand Dame of Victoria Falls" built in 1904, offering views of the Victoria Falls bridge and historic gorge.',
        imageUrl: fallsTour7,
        location: 'Victoria Falls Historic Precinct',
        facilities: ['Private Butler', 'Gourmet Dining', 'High Tea Terrace', 'Private Pool']
      }
    ],
    whyWeChoseStay: 'The Presidential Suite at Victoria Falls Hotel offers unmatched historic prestige, private butler service, and private gardens overlooking the historic Victoria Falls Bridge.',
    includedExperienceIds: ['flight-of-angels', 'chobe-day-safari', 'upper-zambezi-sunset-cruise', 'guided-tour-falls'],
    routeMap: [
      { step: 1, title: 'Helicopter VFA Arrival', location: 'Victoria Falls', description: 'Private flight to river lodge.' },
      { step: 2, title: 'Falls & Chobe Safari', location: 'Zim & Botswana', description: 'Private river safari & helicopter tours.' },
      { step: 3, title: 'VIP Departure', location: 'Victoria Falls Airport', description: 'Helicopter return.' },
    ],
    pricingDetails: {
      basis: 'Per person sharing 5-Star Ultra-Luxury Suite.',
      assumptions: [
        'All-inclusive ultra-luxury stay with fine dining and cellared beverages',
        'Private helicopter transfers included',
        'Private safari vehicles and guides throughout'
      ],
      factorsAffecting: [
        'Peak luxury season availability',
        'Private charter plane additions'
      ]
    },
    faqs: [
      {
        question: 'Is butler service included?',
        answer: 'Yes, full 24-hour dedicated butler service is provided at our top-tier 5-star partner villas.',
      },
    ],
    relatedPackageIds: ['pkg-romantic', 'pkg-chobe-explorer', 'pkg-hwange-combo'],
    rating: 5.0,
    reviewCount: 42,
  },
];

// Helper to get the 4 exact featured packages requested for the Homepage
export const getHomepageFeaturedPackages = (): DetailedPackage[] => {
  const homepageIds = ['pkg-essentials', 'pkg-family', 'pkg-romantic', 'pkg-chobe-explorer'];
  return homepageIds
    .map((id) => ALL_PACKAGES.find((p) => p.id === id))
    .filter((p): p is DetailedPackage => p !== undefined);
};

export const getPackageById = (idOrSlug: string): DetailedPackage | undefined => {
  return ALL_PACKAGES.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
};
