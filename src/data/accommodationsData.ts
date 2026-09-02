// Public image paths for experiences
const fallsTour1 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
const fallsTour7 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-falls-7-scaled.jpg';
const fallsTour11 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-falls-11-scaled.jpg';
const fallsTour6 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-falls-6-scaled.jpg';

const cruise1 = '/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
const cruise2 = '/Experiences/Standard Cruise_/Standard-2-scaled.jpg';
const cruise5 = '/Experiences/Standard Cruise_/Standard-5-scaled.jpg';
const cruise6 = '/Experiences/Standard Cruise_/Standard-6-scaled.jpg';
const cruise7 = '/Experiences/Standard Cruise_/Standard-7.jpg';

const gameDrive10 = '/Experiences/Game Drive/Game-drive-10-1-scaled.jpg';
const gameDrive2 = '/Experiences/Game Drive/Game-Drive-2-scaled.jpg';
const gameDrive4 = '/Experiences/Game Drive/Game-Drive-4-scaled.jpg';
const gameDrive5 = '/Experiences/Game Drive/Game-Drive-5-scaled.jpg';

const elecrew5 = '/Experiences/Elephant Interaction_/elecrew-5.jpg';
const elecrew2 = '/Experiences/Elephant Interaction_/Elecrew-02.jpg';

const bomaImg1 = '/Experiences/Boma Dinner_/IMG_0364.JPG';
const bomaImg2 = '/Experiences/Boma Dinner_/IMG_0365.PNG';

const heli1 = '/Experiences/Flight of Angels/Heli-1-1-scaled.jpg';

const spa1 = '/Experiences/Spa Treatments/IMG_0375.PNG';
const spa2 = '/Experiences/Spa Treatments/IMG_0376.PNG';
const spa3 = '/Experiences/Spa Treatments/IMG_0377.PNG';
const spa4 = '/Experiences/Spa Treatments/IMG_0378.PNG';

const bungee1 = '/Experiences/Bungee Jump_/Bungee-1-scaled.jpg';
const rafting2 = '/Experiences/White Water Rafting_/whitewater-rafting-images-2.jpg';
const zipLine1 = '/Experiences/Zip Line_/Bridge-Slide-1-scaled.jpg';

export interface RoomType {
  name: string;
  occupancy: string;
  description: string;
  imageUrl: string;
  features: string[];
}

export interface DetailedAccommodation {
  id: string;
  slug: string;
  name: string;
  category: 'Luxury Lodge' | 'Boutique Hotel' | 'Guest Lodge' | 'Safari Lodge' | 'Resort' | 'Self-Catering';
  badge?: 'Luxury' | 'Family Favourite' | 'Romantic' | 'Best Value' | 'Walking Distance' | 'Boutique';
  rating: number;
  reviewCount: number;
  location: string;
  distanceFromFalls: string;
  airportDistance: string;
  priceFromUSD: number;
  heroImage: string;
  galleryImages: string[];
  tagline: string;
  shortDescription: string;
  editorialOverview: string;
  whyWeRecommend: string;
  filterTags: ('luxury-lodges' | 'boutique-hotels' | 'family-friendly' | 'romantic-escapes' | 'best-value' | 'safari-lodges' | 'self-catering' | 'walking-distance')[];
  
  atAGlance: {
    type: string;
    starRating: string;
    bestFor: string;
    distanceFromFalls: string;
    pool: string;
    restaurant: string;
    wifi: string;
    familyFriendly: string;
    transfers: string;
    roomTypesSummary: string;
  };

  roomTypes: RoomType[];

  facilities: {
    name: string;
    category: string;
  }[];

  locationInfo: {
    address: string;
    distanceToFalls: string;
    distanceToAirport: string;
    nearbyAttractions: string[];
    nearbyRestaurants: string[];
    departurePoints: string;
  };

  nearbyExperienceIds: string[];
  relatedPropertyIds: string[];
}

export const ALL_ACCOMMODATIONS: DetailedAccommodation[] = [
  {
    id: 'victoria-falls-safari-lodge',
    slug: 'victoria-falls-safari-lodge',
    name: 'Victoria Falls Safari Lodge',
    category: 'Safari Lodge',
    badge: 'Best Value',
    rating: 4.9,
    reviewCount: 210,
    location: 'Victoria Falls National Park border, Zimbabwe',
    distanceFromFalls: '4.5 km (10-minute shuttle)',
    airportDistance: '20 km (20-minute transfer)',
    priceFromUSD: 280,
    heroImage: gameDrive10,
    galleryImages: [
      gameDrive10,
      gameDrive2,
      gameDrive4,
      gameDrive5,
      elecrew5,
      elecrew2
    ],
    tagline: 'Perched high on a natural plateau overlooking an active wildlife waterhole.',
    shortDescription: 'Unrivalled sunset views over the African bushveld, where elephants, kudu and marabou storks gather below your balcony at the on-site waterhole.',
    editorialOverview: 'Victoria Falls Safari Lodge built its legendary reputation on one unforgettable vantage point: an elevated wooden deck looking out across pristine Zambezi National Park wilderness. Rooms face directly westward toward the setting sun and an active waterhole frequented daily by elephants, buffalo, warthogs and birds of prey. The atmosphere is warm, lodge-style luxury with thatch roofs, hand-carved timber beams, and two outstanding dining venues: the open-air MaKuwa-Kuwa Restaurant and the vibrant Boma - Dinner & Drum Show.',
    whyWeRecommend: 'We recommend Victoria Falls Safari Lodge because it offers an authentic safari lodge feel without leaving town. Sitting on your private balcony with a cold drink watching wild elephants at the waterhole is one of the definitive Victoria Falls experiences. It is exceptional value for wildlife lovers and couples alike.',
    filterTags: ['safari-lodges', 'family-friendly', 'best-value', 'romantic-escapes'],
    
    atAGlance: {
      type: 'Iconic Safari Lodge',
      starRating: '4-Star Lodge',
      bestFor: 'Sunset Views, Wildlife Watching & Couples',
      distanceFromFalls: '4.5 km (Free hourly shuttle)',
      pool: 'Two-tiered rim-flow swimming pool',
      restaurant: 'MaKuwa-Kuwa Restaurant & The Boma',
      wifi: 'Complimentary high-speed Wi-Fi',
      familyFriendly: 'Yes, welcoming families & teens',
      transfers: 'Private airport & town shuttles',
      roomTypesSummary: 'Lodge Rooms, Waterhole View Suites'
    },

    roomTypes: [
      {
        name: 'Waterhole View Room',
        occupancy: '2 Adults (King or Twin)',
        description: 'Spacious air-conditioned room featuring a private glass-fronted balcony facing directly over the wildlife waterhole and Zambezi National Park bush.',
        imageUrl: gameDrive2,
        features: ['Waterhole View Balcony', 'Air Conditioning', 'En-suite Bathroom with Rain Shower', 'Mosquito Netting', 'Mini Bar & Safe']
      },
      {
        name: 'Waterhole View Suite',
        occupancy: '2 Adults + 2 Children',
        description: 'Duplex suite offering a lower lounge area, guest cloakroom, upper bedroom and expansive balcony with panoramic views over the waterhole and sunset Horizon.',
        imageUrl: gameDrive4,
        features: ['Two-Level Duplex Layout', 'Private Lounge Area', 'Nespresso Coffee Machine', 'Complimentary Mini Bar', 'Sunset View Deck']
      }
    ],

    facilities: [
      { name: 'Waterhole Viewing Deck', category: 'Wildlife' },
      { name: 'MaKuwa-Kuwa Fine Dining', category: 'Dining' },
      { name: 'The Boma Drum Show', category: 'Dining' },
      { name: 'Two Tiered Pool', category: 'Leisure' },
      { name: 'Buffalo Bar', category: 'Bar' },
      { name: 'Free Hourly Town Shuttle', category: 'Transport' },
      { name: 'Vulture Culture Feeding', category: 'Conservation' },
      { name: 'Free Wi-Fi', category: 'Amenities' },
      { name: 'Air Conditioning', category: 'Comfort' },
      { name: '24-Hour Security', category: 'Safety' }
    ],

    locationInfo: {
      address: 'Stand 471 Squire Cummings Avenue, Victoria Falls, Zimbabwe',
      distanceToFalls: '4.5 km (10 mins by shuttle)',
      distanceToAirport: '20 km (20 mins by road)',
      nearbyAttractions: [
        'Victoria Falls Rainforest (4.5 km)',
        'Zambezi National Park Gate (2.0 km)',
        'The Lookout Café (4.0 km)'
      ],
      nearbyRestaurants: [
        'MaKuwa-Kuwa Restaurant (On-Site)',
        'The Boma - Dinner & Drum Show (On-Site)',
        'The Lookout Café (10 mins)'
      ],
      departurePoints: 'Direct lobby pick-up for all guided tours & helicopter flights.'
    },

    nearbyExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'boma-dinner-show', 'flight-of-angels'],
    relatedPropertyIds: ['ilala-lodge-hotel', 'pioneers-victoria-falls', 'palm-river-hotel']
  },
  {
    id: 'ilala-lodge-hotel',
    slug: 'ilala-lodge-hotel',
    name: 'Ilala Lodge Hotel',
    category: 'Boutique Hotel',
    badge: 'Walking Distance',
    rating: 4.9,
    reviewCount: 184,
    location: 'Victoria Falls Town, Zimbabwe',
    distanceFromFalls: '800 metres (8-minute walk)',
    airportDistance: '21 km (20-minute transfer)',
    priceFromUSD: 295,
    heroImage: fallsTour1,
    galleryImages: [
      fallsTour1,
      fallsTour7,
      fallsTour11,
      fallsTour6,
      cruise2
    ],
    tagline: 'The closest hotel to Victoria Falls, where mist rises over lush manicured lawns.',
    shortDescription: 'A refined boutique hotel located right on the edge of Victoria Falls National Park. Walk to the rainforest in minutes while warthogs graze peacefully outside your room.',
    editorialOverview: 'Ilala Lodge Hotel holds the enviable distinction of being the closest hotel to Mosi-oa-Tunya itself. You can actually see the rising spray column and hear the distant roar of the waterfall from the palm-shaded garden lawns. The property features teak wood finishes, French doors opening onto private verandas, and the award-winning Palm Restaurant where gourmet cuisine is served under the stars. Wild elephants and warthogs frequently amble across the manicured grounds.',
    whyWeRecommend: 'We love Ilala Lodge Hotel for travellers who prioritize convenience, walkability, and refined dining. You can easily walk to the entry gate of Victoria Falls, local markets, and cafes without needing taxis. The combination of boutique hospitality and prime proximity is unmatched.',
    filterTags: ['walking-distance', 'boutique-hotels', 'romantic-escapes', 'best-value'],
    
    atAGlance: {
      type: 'Boutique Hotel',
      starRating: '4-Star Boutique',
      bestFor: 'Walkability, Fine Dining & Couples',
      distanceFromFalls: '800 metres (Easy 8-minute walk)',
      pool: 'Sparkling outdoor pool with poolside bar',
      restaurant: 'The Palm Restaurant (Award-winning)',
      wifi: 'High-speed fiber Wi-Fi throughout',
      familyFriendly: 'Yes, family suites & pool',
      transfers: 'Private airport transfers',
      roomTypesSummary: 'Standard, Deluxe & Executive Suites'
    },

    roomTypes: [
      {
        name: 'Deluxe Garden Room',
        occupancy: '2 Adults',
        description: 'Elegantly appointed ground-floor or first-floor room with private patio or balcony overlooking manicured lawns bordering the national park.',
        imageUrl: fallsTour7,
        features: ['Private Patio/Balcony', 'Teak Furniture', 'Air Conditioning', 'Satellite TV', 'Espresso Machine']
      },
      {
        name: 'Executive Suite',
        occupancy: '2 Adults',
        description: 'Luxurious suite with separate lounge, king bed, spa bathtub, and private veranda offering glimpses of the spray rising over Victoria Falls.',
        imageUrl: fallsTour11,
        features: ['Separate Living Lounge', 'Spa Bathtub & Shower', 'Private Veranda', 'Nespresso Coffee Bar', 'Park Views']
      }
    ],

    facilities: [
      { name: 'The Palm Restaurant', category: 'Dining' },
      { name: 'Poolside Cocktail Bar', category: 'Bar' },
      { name: 'Swimming Pool', category: 'Leisure' },
      { name: 'Lush Gardens & Lawns', category: 'Outdoors' },
      { name: 'Ra-Ikane River Cruise Jetty', category: 'Excursions' },
      { name: 'Free Wi-Fi', category: 'Amenities' },
      { name: 'Air Conditioning', category: 'Comfort' },
      { name: 'Room Service', category: 'Service' }
    ],

    locationInfo: {
      address: '471 Livingstone Way, Victoria Falls, Zimbabwe',
      distanceToFalls: '800m (8 mins walk)',
      distanceToAirport: '21 km (20 mins drive)',
      nearbyAttractions: [
        'Victoria Falls Rainforest Entrance (800m)',
        'Victoria Falls Bridge (1.2 km)',
        'Curio Craft Market (500m)'
      ],
      nearbyRestaurants: [
        'The Palm Restaurant (On-Site)',
        'Three Monkeys Restaurant (400m)',
        'The River Brewery (500m)'
      ],
      departurePoints: 'Walk to Falls entrance or lobby pick-up for excursions.'
    },

    nearbyExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'bungee-jump', 'flight-of-angels'],
    relatedPropertyIds: ['victoria-falls-safari-lodge', 'batonka-guest-lodge', 'pioneers-victoria-falls']
  },
  {
    id: 'pioneers-victoria-falls',
    slug: 'pioneers-victoria-falls',
    name: 'Pioneers Victoria Falls',
    category: 'Guest Lodge',
    badge: 'Boutique',
    rating: 4.8,
    reviewCount: 142,
    location: 'Quiet Residential Suburbs, Victoria Falls, Zimbabwe',
    distanceFromFalls: '3.0 km (5-minute drive)',
    airportDistance: '19 km (18-minute transfer)',
    priceFromUSD: 190,
    heroImage: spa1,
    galleryImages: [
      spa1,
      spa2,
      spa3,
      gameDrive5
    ],
    tagline: 'A stylish, eco-conscious sanctuary nestled in tranquil landscaped gardens.',
    shortDescription: 'Modern safari elegance meets classic hospitality. 50 spacious rooms surrounded by native flora, two sparkling swimming pools, and a serene day spa.',
    editorialOverview: 'Pioneers Victoria Falls is a modern, eco-friendly lodge thoughtfully designed around lush, bird-rich gardens. Located in a quiet residential area away from main traffic, it offers 50 spacious air-conditioned rooms styled with classic safari nostalgia, crisp linens, and local timber crafts. The central pavilion features a breezy open-air dining terrace, bar, and lounge overlooking two distinct swimming pools. Solar energy, plastic-free initiatives, and warm local Zimbabwean service make Pioneers an absolute favorite for discerning travellers.',
    whyWeRecommend: 'Pioneers is one of our top recommendations for travellers seeking high-end comfort and peace at an accessible price point. The gardens are impeccably maintained, the food is fresh and delicious, and the quiet setting ensures a restful night after action-packed safari days.',
    filterTags: ['boutique-hotels', 'best-value', 'family-friendly', 'romantic-escapes'],
    
    atAGlance: {
      type: 'Eco-Boutique Lodge',
      starRating: '4-Star Boutique Lodge',
      bestFor: 'Relaxed Serenity, Couples & Families',
      distanceFromFalls: '3.0 km (5 mins by vehicle)',
      pool: '2 outdoor swimming pools in gardens',
      restaurant: 'Pioneers Restaurant & Lounge Bar',
      wifi: 'High-speed complimentary Wi-Fi',
      familyFriendly: 'Yes, interconnecting family rooms',
      transfers: 'Lodge shuttle & private taxis',
      roomTypesSummary: 'Standard Rooms, Family Interconnecting'
    },

    roomTypes: [
      {
        name: 'Deluxe Garden Room',
        occupancy: '2 Adults',
        description: 'Air-conditioned room styled with tasteful vintage safari aesthetic, private veranda opening directly onto flower gardens and bird-watching paths.',
        imageUrl: spa2,
        features: ['Private Garden Veranda', 'Air Conditioning & Ceiling Fan', 'En-suite Walk-in Shower', 'Tea & Coffee Bar', 'Solar Heated Water']
      },
      {
        name: 'Family Interconnecting Suite',
        occupancy: '2 Adults + 2 Children',
        description: 'Two spacious bedrooms joined by an inner door, allowing privacy for parents and safety for kids with two en-suite bathrooms.',
        imageUrl: spa3,
        features: ['Interconnecting Bedrooms', 'Two En-suite Bathrooms', 'Spacious Patio', 'Solar Powered', 'Garden Views']
      }
    ],

    facilities: [
      { name: 'Pioneers Garden Restaurant', category: 'Dining' },
      { name: 'Two Swimming Pools', category: 'Leisure' },
      { name: 'Eco Day Spa', category: 'Wellness' },
      { name: 'Lounge Bar', category: 'Bar' },
      { name: 'Solar Power System', category: 'Sustainability' },
      { name: 'Free High-Speed Wi-Fi', category: 'Amenities' },
      { name: 'Air Conditioning', category: 'Comfort' },
      { name: 'Tour Desk & Concierge', category: 'Service' }
    ],

    locationInfo: {
      address: '1 Quail Close, Victoria Falls, Zimbabwe',
      distanceToFalls: '3.0 km (5 mins drive)',
      distanceToAirport: '19 km (18 mins drive)',
      nearbyAttractions: [
        'Victoria Falls Town Centre (2.0 km)',
        'Victoria Falls Rainforest Park (3.0 km)',
        'Elephant Walk Shopping Village (2.2 km)'
      ],
      nearbyRestaurants: [
        'Pioneers Restaurant (On-Site)',
        'Wild Horizons Lookout Cafe (3.5 km)',
        'Dusty Road Township Experience (1.5 km)'
      ],
      departurePoints: 'Complimentary lobby transfers organized for activities.'
    },

    nearbyExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'boma-dinner-show'],
    relatedPropertyIds: ['batonka-guest-lodge', 'victoria-falls-safari-lodge', 'ilala-lodge-hotel']
  },
  {
    id: 'batonka-guest-lodge',
    slug: 'batonka-guest-lodge',
    name: 'Batonka Guest Lodge',
    category: 'Guest Lodge',
    badge: 'Romantic',
    rating: 4.9,
    reviewCount: 165,
    location: 'Residential Suburbs, Victoria Falls, Zimbabwe',
    distanceFromFalls: '2.5 km (5-minute drive)',
    airportDistance: '20 km (20-minute transfer)',
    priceFromUSD: 210,
    heroImage: spa4,
    galleryImages: [
      spa4,
      cruise5,
      cruise7,
      spa1
    ],
    tagline: 'A tranquil haven of contemporary African elegance and personalized service.',
    shortDescription: 'Set in quiet, leafy surroundings just minutes from town. Features 27 air-conditioned rooms with private verandas overlooking a serene swimming pool and gardens.',
    editorialOverview: 'Batonka Guest Lodge is revered for its quiet charm, meticulous cleanliness, and intimate hospitality. The property is designed around an open-plan central pavilion that flows onto wide teak verandas, lush green lawns, and a sparkling pool. Each room is tastefully styled in contemporary neutral tones with subtle African craft touches, comfortable beds, and sleek en-suite bathrooms. Dining at Batonka feels like being hosted by close friends, with home-style multi-course meals prepared from fresh local ingredients.',
    whyWeRecommend: 'Batonka Guest Lodge is ideal for travellers wanting personalized, attentive service without the high-volume crowds of large resorts. The quiet residential location guarantees uninterrupted rest, while the lodge staff excel at arranging seamless daily excursions.',
    filterTags: ['boutique-hotels', 'romantic-escapes', 'best-value', 'family-friendly'],
    
    atAGlance: {
      type: 'Intimate Boutique Lodge',
      starRating: '4-Star Guest Lodge',
      bestFor: 'Couples, Honeymooners & Quiet Relaxation',
      distanceFromFalls: '2.5 km (5 mins by taxi)',
      pool: 'Sparkling garden swimming pool',
      restaurant: 'Batonka Dining Terrace',
      wifi: 'Complimentary high-speed Wi-Fi',
      familyFriendly: 'Yes, welcoming families',
      transfers: 'Town & airport transfer service',
      roomTypesSummary: 'Garden Rooms, Executive Poolside Rooms'
    },

    roomTypes: [
      {
        name: 'Deluxe Garden Room',
        occupancy: '2 Adults',
        description: 'Quiet room opening onto a covered veranda with table and chairs facing peaceful tropical gardens and native bird feeders.',
        imageUrl: cruise5,
        features: ['Covered Private Veranda', 'Air Conditioning & Ceiling Fan', 'Walk-in Shower', 'Safe & Tea/Coffee Station', 'Garden View']
      }
    ],

    facilities: [
      { name: 'Batonka Terrace Dining', category: 'Dining' },
      { name: 'Garden Pool & Loungers', category: 'Leisure' },
      { name: 'Lounge & Bar', category: 'Bar' },
      { name: 'Quiet Reading Curio Corner', category: 'Relaxation' },
      { name: 'Free High-Speed Wi-Fi', category: 'Amenities' },
      { name: 'Air Conditioning', category: 'Comfort' },
      { name: 'Concierge Desk', category: 'Service' }
    ],

    locationInfo: {
      address: '1 Pratt Lane, Victoria Falls, Zimbabwe',
      distanceToFalls: '2.5 km (5 mins drive)',
      distanceToAirport: '20 km (20 mins drive)',
      nearbyAttractions: [
        'Victoria Falls Rainforest Park (2.5 km)',
        'Town Craft Market (1.8 km)',
        'Zambezi River Launch Site (3.0 km)'
      ],
      nearbyRestaurants: [
        'Batonka Dining Room (On-Site)',
        'Dusty Road Township Experience (1.0 km)',
        'The Three Monkeys (2.0 km)'
      ],
      departurePoints: 'Doorstep pickup for all river cruises and safari activities.'
    },

    nearbyExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'boma-dinner-show'],
    relatedPropertyIds: ['pioneers-victoria-falls', 'ilala-lodge-hotel', 'victoria-falls-safari-lodge']
  },
  {
    id: 'victoria-falls-hotel',
    slug: 'victoria-falls-hotel',
    name: 'The Victoria Falls Hotel',
    category: 'Boutique Hotel',
    badge: 'Luxury',
    rating: 4.95,
    reviewCount: 320,
    location: 'Livingstone Way, Victoria Falls, Zimbabwe',
    distanceFromFalls: '500 metres (Private path to Falls)',
    airportDistance: '21 km (20-minute transfer)',
    priceFromUSD: 450,
    heroImage: fallsTour7,
    galleryImages: [
      fallsTour7,
      fallsTour1,
      heli1
    ],
    tagline: 'The iconic 5-star "Grand Dame" established in 1904 with private access to the Falls.',
    shortDescription: 'Colonial grandeur overlooking the Victoria Falls Bridge and Batoka Gorge. Enjoy high tea on the Stanley Terrace and walk directly to the rainforest entry.',
    editorialOverview: 'Established in 1904, The Victoria Falls Hotel is a member of Leading Hotels of the World. Combining Edwardian elegance with modern luxury, the hotel offers direct views of the historic Victoria Falls Bridge and the rising mist of Mosi-oa-Tunya. Highlights include high tea served daily on the Stanley Terrace, fine dining at The Livingstone Room, and a private pathway directly to the rainforest park entry.',
    whyWeRecommend: 'Unmatched history, world-class service, and iconic views make The Victoria Falls Hotel a bucket-list stay for luxury travellers and heritage enthusiasts.',
    filterTags: ['luxury-lodges', 'boutique-hotels', 'walking-distance', 'romantic-escapes'],
    
    atAGlance: {
      type: 'Historic 5-Star Hotel',
      starRating: '5-Star Luxury',
      bestFor: 'Heritage, Luxury & Private Falls Access',
      distanceFromFalls: '500m (Private pedestrian path)',
      pool: 'Large courtyard pool with bar',
      restaurant: 'The Livingstone Room & Stanley Terrace',
      wifi: 'High-speed Wi-Fi',
      familyFriendly: 'Yes, family suites available',
      transfers: 'VIP chauffeured transfers',
      roomTypesSummary: 'Classic Rooms, Deluxe Bridge View & Suites'
    },

    roomTypes: [
      {
        name: 'Deluxe Bridge View Room',
        occupancy: '2 Adults',
        description: 'Elegantly furnished room featuring Edwardian furniture and views across lily ponds toward the Victoria Falls Bridge.',
        imageUrl: fallsTour1,
        features: ['Bridge & Gorge View', 'Edwardian Decor', 'Air Conditioning', 'Marble Bathroom', 'High Tea Service']
      }
    ],

    facilities: [
      { name: 'The Livingstone Room (Fine Dining)', category: 'Dining' },
      { name: 'Stanley Terrace High Tea', category: 'Dining' },
      { name: 'Private Pathway to Vic Falls', category: 'Access' },
      { name: 'Large Swimming Pool', category: 'Leisure' },
      { name: 'Beauty Spa & Hair Salon', category: 'Wellness' },
      { name: 'Bulawayo Railway Museum Bar', category: 'Bar' }
    ],

    locationInfo: {
      address: '1 Mallet Drive, Victoria Falls, Zimbabwe',
      distanceToFalls: '500m (5 mins walk on private trail)',
      distanceToAirport: '21 km (20 mins drive)',
      nearbyAttractions: ['Victoria Falls Rainforest (500m)', 'Victoria Falls Bridge (1.0 km)'],
      nearbyRestaurants: ['The Livingstone Room (On-Site)', 'Stanley Terrace (On-Site)', 'The Palm Restaurant (300m)'],
      departurePoints: 'Concierge desk arranges all local excursions.'
    },

    nearbyExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'bungee-jump', 'flight-of-angels'],
    relatedPropertyIds: ['ilala-lodge-hotel', 'palm-river-hotel', 'victoria-falls-safari-lodge']
  },
  {
    id: 'palm-river-hotel',
    slug: 'palm-river-hotel',
    name: 'The Palm River Hotel',
    category: 'Luxury Lodge',
    badge: 'Luxury',
    rating: 5.0,
    reviewCount: 156,
    location: 'Upper Zambezi Riverbank, Victoria Falls, Zimbabwe',
    distanceFromFalls: '5.0 km (7-minute drive)',
    airportDistance: '22 km (22-minute transfer)',
    priceFromUSD: 520,
    heroImage: cruise1,
    galleryImages: [
      cruise1,
      cruise2,
      cruise6
    ],
    tagline: '5-star riverside luxury along the tranquil banks of the Upper Zambezi River.',
    shortDescription: 'Queensland-inspired architecture set under giant indigenous trees. Experience private river cruises from the hotel jetty and elephant sightings from your suite.',
    editorialOverview: 'The Palm River Hotel brings grand Australian Queenslander architecture to the banks of the Zambezi River. Shaded by ancient acacia and palm trees, every suite offers high ceilings, wide verandas, and river views. Guests enjoy a riverfront infinity pool, fine dining at the Palm River Restaurant, and private sunset cruises aboard the hotel’s luxury riverboat.',
    whyWeRecommend: 'An exquisite choice for luxury travellers who want a tranquil riverfront setting combined with contemporary 5-star elegance.',
    filterTags: ['luxury-lodges', 'romantic-escapes', 'family-friendly'],
    
    atAGlance: {
      type: '5-Star River Lodge',
      starRating: '5-Star Luxury',
      bestFor: 'River Views, Luxury & Quiet Elegance',
      distanceFromFalls: '5.0 km (7 mins drive)',
      pool: 'Riverfront infinity pool',
      restaurant: 'Palm River Restaurant',
      wifi: 'High-speed fiber Wi-Fi',
      familyFriendly: 'Yes, family suites & villa',
      transfers: 'Private luxury shuttles',
      roomTypesSummary: 'Deluxe Rooms, Executive Suites & Private Villa'
    },

    roomTypes: [
      {
        name: 'Deluxe River Room',
        occupancy: '2 Adults',
        description: 'Light-filled room with private balcony overlooking the Zambezi River, featuring luxurious crisp linens and freestanding bath.',
        imageUrl: cruise2,
        features: ['Riverfront Balcony', 'Freestanding Soaking Tub', 'Air Conditioning', 'Nespresso Machine', 'Private Jetty Access']
      }
    ],

    facilities: [
      { name: 'Palm River Restaurant', category: 'Dining' },
      { name: 'Riverfront Infinity Pool', category: 'Leisure' },
      { name: 'Private Cruise Boat Jetty', category: 'Excursions' },
      { name: 'Riverside Lounge Bar', category: 'Bar' },
      { name: 'Free Wi-Fi', category: 'Amenities' }
    ],

    locationInfo: {
      address: '4288 Park Way, Victoria Falls, Zimbabwe',
      distanceToFalls: '5.0 km (7 mins drive)',
      distanceToAirport: '22 km (22 mins drive)',
      nearbyAttractions: ['Zambezi National Park (Direct access)', 'Victoria Falls Rainforest (5.0 km)'],
      nearbyRestaurants: ['Palm River Restaurant (On-Site)'],
      departurePoints: 'Private river jetty for cruises and lobby pickup for land tours.'
    },

    nearbyExperienceIds: ['guided-tour-falls', 'upper-zambezi-sunset-cruise', 'flight-of-angels'],
    relatedPropertyIds: ['victoria-falls-hotel', 'victoria-falls-safari-lodge', 'ilala-lodge-hotel']
  },
  {
    id: 'lokuthula-lodges',
    slug: 'lokuthula-lodges',
    name: 'Lokuthula Lodges',
    category: 'Self-Catering',
    badge: 'Family Favourite',
    rating: 4.7,
    reviewCount: 198,
    location: 'Victoria Falls Safari Resort grounds, Zimbabwe',
    distanceFromFalls: '4.5 km (10-minute shuttle)',
    airportDistance: '20 km (20-minute transfer)',
    priceFromUSD: 180,
    heroImage: bomaImg1,
    galleryImages: [
      bomaImg1,
      bomaImg2
    ],
    tagline: 'Self-catering rustic thatched lodges set amidst indigenous bush where wildlife roams.',
    shortDescription: 'Ideal for families and groups. Fully equipped 2 and 3-bedroom thatched lodges with access to resort pools, Boma restaurant, and shuttle services.',
    editorialOverview: 'Lokuthula means "Place of Peace". Located on the grounds of the Victoria Falls Safari Resort, these 2 and 3-bedroom self-catering thatched lodges offer a home-away-from-home setup. Enjoy fully equipped kitchens, outdoor braai (barbecue) areas, and access to the resort pool and Boma restaurant.',
    whyWeRecommend: 'The best option in Victoria Falls for families or long-stay groups wanting self-catering flexibility without compromising on resort amenities.',
    filterTags: ['self-catering', 'family-friendly', 'best-value'],
    
    atAGlance: {
      type: 'Self-Catering Lodges',
      starRating: '3-Star Resort',
      bestFor: 'Families, Groups & Budget-Conscious Travelers',
      distanceFromFalls: '4.5 km (Free shuttle)',
      pool: 'Resort swimming pool & paddling pool',
      restaurant: 'Access to MaKuwa-Kuwa & The Boma',
      wifi: 'Complimentary Wi-Fi',
      familyFriendly: 'Yes, 2 & 3 bedroom configurations',
      transfers: 'Resort shuttle available',
      roomTypesSummary: '2-Bedroom & 3-Bedroom Thatched Lodges'
    },

    roomTypes: [
      {
        name: '2-Bedroom Thatched Lodge',
        occupancy: '4-6 Guests',
        description: 'Spacious self-catering lodge with master en-suite, twin room, loft area, fully equipped kitchen and outdoor private braai patio.',
        imageUrl: bomaImg2,
        features: ['Full Kitchen', 'Private Braai/BBQ Area', 'Air Conditioned Bedrooms', 'Lounge & Dining Area', 'Daily Housekeeping']
      }
    ],

    facilities: [
      { name: 'Private Braai Patio', category: 'Outdoor' },
      { name: 'Resort Pool & Bar', category: 'Leisure' },
      { name: 'Children Playground', category: 'Family' },
      { name: 'Free Town Shuttle', category: 'Transport' }
    ],

    locationInfo: {
      address: 'Squire Cummings Avenue, Victoria Falls, Zimbabwe',
      distanceToFalls: '4.5 km (10 mins drive)',
      distanceToAirport: '20 km (20 mins drive)',
      nearbyAttractions: ['Victoria Falls Rainforest (4.5 km)'],
      nearbyRestaurants: ['The Boma - Dinner & Drum Show (On Grounds)', 'MaKuwa-Kuwa Restaurant (On Grounds)'],
      departurePoints: 'Lobby pickup for all tours.'
    },

    nearbyExperienceIds: ['guided-tour-falls', 'boma-dinner-show', 'upper-zambezi-sunset-cruise'],
    relatedPropertyIds: ['victoria-falls-safari-lodge', 'pioneers-victoria-falls', 'batonka-guest-lodge']
  },
  {
    id: 'shearwater-explorers-village',
    slug: 'shearwater-explorers-village',
    name: 'Shearwater Explorers Village',
    category: 'Guest Lodge',
    badge: 'Best Value',
    rating: 4.6,
    reviewCount: 175,
    location: 'Victoria Falls Town Centre, Zimbabwe',
    distanceFromFalls: '800 metres (8-minute walk)',
    airportDistance: '20 km (20-minute transfer)',
    priceFromUSD: 110,
    heroImage: bungee1,
    galleryImages: [
      bungee1,
      rafting2
    ],
    tagline: 'Vibrant, centrally located lodge offering modern chalet accommodation steps from the Falls.',
    shortDescription: 'Ideal for budget-conscious travellers and adventure seekers. Clean air-conditioned chalets, lively central restaurant & bar, swimming pool, and unbeatable central location.',
    editorialOverview: 'Located right in the heart of Victoria Falls town, Shearwater Explorers Village offers stylish chalets and safari tents set around manicured garden courtyards. It features a lively central restaurant, bar, swimming pool, and an adventure booking desk for immediate thrill-seeking activities.',
    whyWeRecommend: 'The top choice for budget-conscious travellers, backpackers, and solo adventurers looking for central convenience and clean, stylish comfort.',
    filterTags: ['best-value', 'walking-distance'],
    
    atAGlance: {
      type: 'Adventure Village & Lodge',
      starRating: '3-Star Lodge',
      bestFor: 'Solo Travellers, Adventure Seekers & Budget-Conscious',
      distanceFromFalls: '800m (8 mins walk)',
      pool: 'Large garden pool',
      restaurant: 'Explorers Village Bistro & Bar',
      wifi: 'Free Wi-Fi',
      familyFriendly: 'Yes, family chalets',
      transfers: 'Town & airport shuttles',
      roomTypesSummary: 'Standard Air-Conditioned Chalets & Glamping Tents'
    },

    roomTypes: [
      {
        name: 'Standard Air-Con Chalet',
        occupancy: '2 Adults',
        description: 'Modern air-conditioned chalet with en-suite shower bathroom, comfortable beds, and garden patio.',
        imageUrl: zipLine1,
        features: ['Air Conditioning', 'En-suite Shower', 'Garden View Patio', 'Free Wi-Fi', 'Central Location']
      }
    ],

    facilities: [
      { name: 'Explorers Bistro & Bar', category: 'Dining' },
      { name: 'Garden Swimming Pool', category: 'Leisure' },
      { name: 'Adventure Desk', category: 'Excursions' },
      { name: 'Free Wi-Fi', category: 'Amenities' }
    ],

    locationInfo: {
      address: 'Adam Stander Drive, Victoria Falls, Zimbabwe',
      distanceToFalls: '800m (8 mins walk)',
      distanceToAirport: '20 km (20 mins drive)',
      nearbyAttractions: ['Victoria Falls Rainforest (800m)', 'Victoria Falls Craft Market (200m)'],
      nearbyRestaurants: ['Explorers Bistro (On-Site)', 'Three Monkeys (300m)'],
      departurePoints: 'On-site adventure desk for instant departure.'
    },

    nearbyExperienceIds: ['guided-tour-falls', 'bungee-jump', 'upper-zambezi-sunset-cruise'],
    relatedPropertyIds: ['ilala-lodge-hotel', 'pioneers-victoria-falls', 'batonka-guest-lodge']
  }
];

export const FEATURED_HOMEPAGE_ACCOMMODATIONS = [
  ALL_ACCOMMODATIONS.find(a => a.slug === 'victoria-falls-safari-lodge')!,
  ALL_ACCOMMODATIONS.find(a => a.slug === 'ilala-lodge-hotel')!,
  ALL_ACCOMMODATIONS.find(a => a.slug === 'pioneers-victoria-falls')!,
  ALL_ACCOMMODATIONS.find(a => a.slug === 'batonka-guest-lodge')!
];

export function getAccommodationBySlug(slug: string): DetailedAccommodation | undefined {
  return ALL_ACCOMMODATIONS.find((acc) => acc.slug === slug || acc.id === slug);
}
