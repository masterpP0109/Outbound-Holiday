export interface ExperienceStep {
  stepNumber: number;
  time?: string;
  title: string;
  description: string;
  highlight?: string;
  image?: string;
}

export interface Experience {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  badge?: string;
  categories: Array<'featured' | 'first-visit' | 'wildlife' | 'adventure' | 'river' | 'culture' | 'day-trips'>;
  shortDescription: string;
  fullOverview: string;
  whyWeRecommend: string;
  duration: string;
  location?: string;
  fromPrice: string;
  priceAmount: number;
  featuredImage: string;
  galleryImages: string[];
  highlights: string[];
  whatsIncluded: string[];
  whatsExcluded?: string[];
  goodToKnow: string[];
  steps?: ExperienceStep[];
  localExpertTip?: string;
  faqs: { q: string; a: string }[];
  relatedIds: string[];
}

import intentVicFallsIconicImg from '../assets/images/intent_vic_falls_iconic_1785490034846.jpg';
import footerZambeziDuskImg from '../assets/images/footer_zambezi_dusk_1785494130616.jpg';
import rhinoTrackingImg from '../assets/images/rhino_tracking_drive_1785497819922.jpg';
import familySafariImg from '../assets/images/family_wildlife_safari_1785488525464.jpg';
import craftMarketImg from '../assets/images/intent_craft_market_zim_1785489731195.jpg';
import gameDriveImg from '../assets/Experiences/Game Drive/Game-drive-10-1-scaled.jpg';
import bungeeImg from '../assets/Experiences/Bungee Jump_/Bungee-1-scaled.jpg';
import bungeeImg2 from '../assets/Experiences/Bungee Jump_/Bungee-8.jpg';
import bungeeImg3 from '../assets/Experiences/Bungee Jump_/Bungee-9-scaled.jpg';
import bungeeImg4 from '../assets/Experiences/Bungee Jump_/1-1.jpg';
import bungeeImg5 from '../assets/Experiences/Bungee Jump_/2-8.jpg';
import bungeeImg6 from '../assets/Experiences/Bungee Jump_/3 (1).jpg';
import bungeeImg7 from '../assets/Experiences/Bungee Jump_/Bungee-Fact-Sheet-2024_page-0001.jpg';
import chobeImg from '../assets/Experiences/Chobe Day Trip_/Chobe-1-1-scaled.jpg';
import elephantImg from '../assets/Experiences/Elephant Interaction_/elecrew-5.jpg';
import jetBoatImg from '../assets/Experiences/Jet Boat Adventure_/IMG_0021-2.jpg';
import simunyeImg from '../assets/Experiences/Simunye_/Simunye-refresh-29.jpg';
import spaImg from '../assets/Experiences/Spa Treatments/IMG_0375.PNG';
import standardCruiseImg from '../assets/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
import standardCruiseImg2 from '../assets/Experiences/Standard Cruise_/Standard-2-scaled.jpg';
import standardCruiseImg3 from '../assets/Experiences/Standard Cruise_/3.jpg';
import standardCruiseImg4 from '../assets/Experiences/Standard Cruise_/Standard-5-scaled.jpg';
import standardCruiseImg5 from '../assets/Experiences/Standard Cruise_/Standard-6-scaled.jpg';
import standardCruiseImg6 from '../assets/Experiences/Standard Cruise_/Standard-7.jpg';
import standardCruiseImg7 from '../assets/Experiences/Standard Cruise_/River-Cruise-Fact-Sheet-2024_page-0006.jpg';
import chobeImg2 from '../assets/Experiences/Chobe Day Trip_/Chobe-2.jpg';
import chobeImg3 from '../assets/Experiences/Chobe Day Trip_/Chobe-4-scaled.jpg';
import chobeImg4 from '../assets/Experiences/Chobe Day Trip_/Chobe-8-scaled.jpg';
import chobeImg5 from '../assets/Experiences/Chobe Day Trip_/Chobe-9.jpg';
import chobeImg6 from '../assets/Experiences/Chobe Day Trip_/8-1.jpg';
import chobeImg7 from '../assets/Experiences/Chobe Day Trip_/Small-chobezi-boat-1.jpg';
import chobeImg8 from '../assets/Experiences/Chobe Day Trip_/Chobe-Day-Trip-Fact-Sheet-2024_page-0012.jpg';
import elephantImg2 from '../assets/Experiences/Elephant Interaction_/4-6.jpg';
import elephantImg3 from '../assets/Experiences/Elephant Interaction_/6-5.jpg';
import elephantImg4 from '../assets/Experiences/Elephant Interaction_/7-7.jpg';
import elephantImg5 from '../assets/Experiences/Elephant Interaction_/8-5 (1).jpg';
import elephantImg6 from '../assets/Experiences/Elephant Interaction_/8-5.jpg';
import elephantImg7 from '../assets/Experiences/Elephant Interaction_/Elecrew-02.jpg';
import elephantImg8 from '../assets/Experiences/Elephant Interaction_/Untitled-design.jpg';
import elephantImg9 from '../assets/Experiences/Elephant Interaction_/eleCrew-TTEOE-Factsheet (1).pdf';
import gameDriveImg2 from '../assets/Experiences/Game Drive/Game-Drive-2-scaled.jpg';
import gameDriveImg3 from '../assets/Experiences/Game Drive/Game-Drive-4-scaled.jpg';
import gameDriveImg4 from '../assets/Experiences/Game Drive/Game-Drive-5-scaled.jpg';
import gameDriveImg5 from '../assets/Experiences/Game Drive/10.jpg';
import gameDriveImg6 from '../assets/Experiences/Game Drive/6-4.jpg';
import gameDriveImg7 from '../assets/Experiences/Game Drive/7.jpg';
import gameDriveImg8 from '../assets/Experiences/Game Drive/Game-Drive-Fact-Sheet-2024_page-0013.jpg';
import gorgeSwingImg2 from '../assets/Experiences/Gorge Swing_/Bridge-Swing-2-1-scaled.jpg';
import gorgeSwingImg3 from '../assets/Experiences/Gorge Swing_/Bridge-Swing-5-scaled.jpg';
import gorgeSwingImg4 from '../assets/Experiences/Gorge Swing_/Bridge-Swing-9-scaled.jpg';
import gorgeSwingImg5 from '../assets/Experiences/Gorge Swing_/2.jpg';
import gorgeSwingImg6 from '../assets/Experiences/Gorge Swing_/4.jpg';
import gorgeSwingImg7 from '../assets/Experiences/Gorge Swing_/6.jpg';
import gorgeSwingImg8 from '../assets/Experiences/Gorge Swing_/Bungee-11.jpg';
import gorgeSwingImg9 from '../assets/Experiences/Gorge Swing_/Bridge-Swing-Fact-Sheet-2024_page-0002.jpg';
import jetBoatImg2 from '../assets/Experiences/Jet Boat Adventure_/DSC01087.jpg';
import jetBoatImg3 from '../assets/Experiences/Jet Boat Adventure_/DSC01147.jpg';
import jetBoatImg4 from '../assets/Experiences/Jet Boat Adventure_/DSC01202.jpg';
import jetBoatImg5 from '../assets/Experiences/Jet Boat Adventure_/DSC01211.jpg';
import jetBoatImg6 from '../assets/Experiences/Jet Boat Adventure_/IMG_0048.jpg';
import jetBoatImg7 from '../assets/Experiences/Jet Boat Adventure_/JetBoat-Fact-Sheet-2024_page-0004.jpg';
import raftingImg2 from '../assets/Experiences/White Water Rafting_/whitewater-rafting-images-3.jpg';
import raftingImg3 from '../assets/Experiences/White Water Rafting_/whitewater-rafting-images-4.jpg';
import raftingImg4 from '../assets/Experiences/White Water Rafting_/whitewater-rafting-images-5.jpg';
import raftingImg5 from '../assets/Experiences/White Water Rafting_/whitewater-rafting-images-6.jpg';
import raftingImg6 from '../assets/Experiences/White Water Rafting_/whitewater-rafting-images-8.jpg';
import raftingImg7 from '../assets/Experiences/White Water Rafting_/whitewater-rafting-images-9.jpg';
import raftingImg8 from '../assets/Experiences/White Water Rafting_/whitewater-rafting-images-10.jpg';
import raftingImg9 from '../assets/Experiences/White Water Rafting_/White-Water-Rafting-Fact-Sheet-2024_page-0014.jpg';
import simunyeImg2 from '../assets/Experiences/Simunye_/Simunye-refresh-42.jpg';
import simunyeImg3 from '../assets/Experiences/Simunye_/Simunye-Spirit-Of-Africa-31.jpg';
import simunyeImg4 from '../assets/Experiences/Simunye_/3-3.jpg';
import simunyeImg5 from '../assets/Experiences/Simunye_/4-3.jpg';
import simunyeImg6 from '../assets/Experiences/Simunye_/5-3.jpg';
import simunyeImg7 from '../assets/Experiences/Simunye_/7-2.jpg';
import simunyeImg8 from '../assets/Experiences/Simunye_/8-1.jpg';
import simunyeImg9 from '../assets/Experiences/Simunye_/Theatre10.jpg';
import simunyeImg10 from '../assets/Experiences/Simunye_/Simunye-Spirit-Of-Africa-Fact-Sheet-2024_page-0007.jpg';
import spaImg2 from '../assets/Experiences/Spa Treatments/IMG_0376.PNG';
import spaImg3 from '../assets/Experiences/Spa Treatments/IMG_0377.PNG';
import spaImg4 from '../assets/Experiences/Spa Treatments/IMG_0378.PNG';
import spaImg5 from '../assets/Experiences/Spa Treatments/IMG_0379.PNG';
import spaImg6 from '../assets/Experiences/Spa Treatments/IMG_0380.PNG';
import spaImg7 from '../assets/Experiences/Spa Treatments/IMG_0381.PNG';
import zipLineImg2 from '../assets/Experiences/Zip Line_/Bridge-Slide-1-scaled.jpg';
import zipLineImg3 from '../assets/Experiences/Zip Line_/Bridge-slide-8.jpg';
import zipLineImg4 from '../assets/Experiences/Zip Line_/Bridge-Slide-9-scaled.jpg';
import zipLineImg5 from '../assets/Experiences/Zip Line_/3-2.jpg';
import zipLineImg6 from '../assets/Experiences/Zip Line_/5-1.jpg';
import zipLineImg7 from '../assets/Experiences/Zip Line_/5.jpg';
import zipLineImg8 from '../assets/Experiences/Zip Line_/8.jpg';
import zipLineImg9 from '../assets/Experiences/Zip Line_/Bridge-Slide-Fact-Sheet-2024_page-0003.jpg';
import gorgeSwingImg from '../assets/Experiences/Gorge Swing_/Bridge-Swing-3-scaled.jpg';
import zipLineImg from '../assets/Experiences/Zip Line_/Bridge-Slide-1-scaled.jpg';
import raftingImg from '../assets/Experiences/White Water Rafting_/whitewater-rafting-images-2.jpg';
import bomaDinnerImg from '../assets/Experiences/Boma Dinner_/IMG_0364.JPG';
import bomaDinnerImg2 from '../assets/Experiences/Boma Dinner_/IMG_0365.PNG';
import bomaDinnerImg3 from '../assets/Experiences/Boma Dinner_/IMG_0366.PNG';
import bomaDinnerImg4 from '../assets/Experiences/Boma Dinner_/Boma prepping on the fire.webp';
import bomaDinnerImg5 from '../assets/Experiences/Boma Dinner_/IMG_0368.PNG';
import bomaDinnerImg6 from '../assets/Experiences/Boma Dinner_/IMG_0369.PNG';
import bomaDinnerImg7 from '../assets/Experiences/Boma Dinner_/IMG_0370.PNG';
import guidedTourImg from '../assets/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
import guidedTourImg2 from '../assets/Experiences/Guided Tour of the Falls_/Tour-of-the-falls-7-scaled.jpg';
import guidedTourImg3 from '../assets/Experiences/Guided Tour of the Falls_/Tour-of-the-falls-11-scaled.jpg';
import guidedTourImg4 from '../assets/Experiences/Guided Tour of the Falls_/Tour-of-the-falls-6-scaled.jpg';
import guidedTourImg5 from '../assets/Experiences/Guided Tour of the Falls_/5-4.jpg';
import guidedTourImg6 from '../assets/Experiences/Guided Tour of the Falls_/7-3.jpg';
import guidedTourImg7 from '../assets/Experiences/Guided Tour of the Falls_/8-2.jpg';
import guidedTourImg8 from '../assets/Experiences/Guided Tour of the Falls_/Guided-Tour-Of-The-Falls-Fact-Sheet-2024_page-0005.jpg';

import heli1Img from '../assets/Experiences/Flight of Angels/Heli-1-1-scaled.jpg';
import heli2Img from '../assets/Experiences/Flight of Angels/Heli-8-scaled.jpg';
import heli3Img from '../assets/Experiences/Flight of Angels/Heli-Shoot-7102511.jpg';
import heli4Img from '../assets/Experiences/Flight of Angels/Heli-Shoot-7102512.jpg';
import heli5Img from '../assets/Experiences/Flight of Angels/3-8.jpg';
import heli6Img from '../assets/Experiences/Flight of Angels/9-4.jpg';
import heli7Img from '../assets/Experiences/Flight of Angels/Helicopter-Flights-Fact-Sheet-2024_page-0011.jpg';

export const ALL_EXPERIENCES: Experience[] = [
  {
    id: 'guided-tour-falls',
    slug: 'guided-tour-falls',
    title: 'Guided Tour of Victoria Falls',
    categories: ['featured', 'first-visit'],
    shortDescription: 'Explore all 16 spectacular viewpoints along the Victoria Falls rainforest opposite Mosi-oa-Tunya.',
    fullOverview: 'Experience the thunderous majesty of Victoria Falls (Mosi-oa-Tunya—The Smoke That Thunders) with a private or small-group local guide. Walk along the lush rainforest trail opposite the 1,700-meter-wide curtain of falling water, taking in all 16 viewpoints from Devil’s Cataract to Eastern Cataract.',
    whyWeRecommend: 'The definitive Victoria Falls experience. Local guides share geological history, tribal folklore, and local wildlife knowledge that elevates a simple walk into an unforgettable immersion.',
    duration: '2.5 Hours',
    fromPrice: 'From US$55',
    priceAmount: 55,
    featuredImage: guidedTourImg,
    galleryImages: [guidedTourImg, guidedTourImg2, guidedTourImg3, guidedTourImg4, guidedTourImg5, guidedTourImg6, guidedTourImg7],
    highlights: [
      'Visit all 16 rainforest viewpoints opposite the Falls',
      'Expert local guide with deep geological & historical knowledge',
      'Raincoats provided during high spray season (Feb–May)',
      'Opportunities to photograph lunar rainbows & vibrant mist'
    ],
    whatsIncluded: [
      'Guided walking tour with professional local guide',
      'Return hotel transfers in Victoria Falls town',
      'Raincoat & poncho loan (seasonal)',
      'Bottled mineral water'
    ],
    goodToKnow: [
      'Rainforest national park entry fee ($50 for international visitors) is payable at park entrance.',
      'Wear comfortable walking shoes with good grip; walkways can be wet.',
      'Protect electronic cameras and phones in waterproof bags during high water season.'
    ],
    faqs: [
      {
        q: 'What is the best time of day to do the Guided Falls Tour?',
        a: 'Morning tours offer fresh temperatures and glorious light for photographs of Devil’s Cataract, while late afternoon tours often reveal brilliant rainbows over the gorge.'
      },
      {
        q: 'How much walking is involved?',
        a: 'The flat rainforest trail covers approximately 2.5 kilometers. It is gently paved and suitable for all fitness levels.'
      }
    ],
    relatedIds: ['upper-zambezi-sunset-cruise', 'flight-of-angels', 'boma-dinner-show']
  },
  {
    id: 'upper-zambezi-sunset-cruise',
    slug: 'upper-zambezi-sunset-cruise',
    title: 'Upper Zambezi Luxury Sunset Cruise',
    categories: ['featured', 'first-visit', 'river'],
    shortDescription: 'Glide past hippo pods and elephant herds with complimentary premium drinks and gourmet canapés as the sun dips.',
    fullOverview: 'Embark on a tranquil 2-hour voyage along the boundary of Zambezi National Park. Watch African fish eagles soar overhead, hippo pods submerge in the gold-lit currents, and elephant herds cross river channels as you enjoy open-bar beverages and freshly prepared snacks.',
    whyWeRecommend: 'Unmatched African sunset elegance. Nothing beats watching the sky turn burning copper and violet while floating down the ancient Zambezi River.',
    duration: '2 Hours',
    fromPrice: 'From US$85',
    priceAmount: 85,
    featuredImage: standardCruiseImg3,
    galleryImages: [standardCruiseImg, standardCruiseImg2, standardCruiseImg3, standardCruiseImg4, standardCruiseImg5, standardCruiseImg6],
    highlights: [
      'Complimentary top-shelf drinks, wines, local beers & gin bar',
      'Freshly prepared chef’s gourmet snack platters',
      'Spot hippos, crocodiles, river birds, and riverbank wildlife',
      'Unrivalled photographic opportunities of golden African sunsets'
    ],
    whatsIncluded: [
      '2-hour river cruise on a luxury double-deck pontoon',
      'Open bar with local spirits, wines, beers & soft drinks',
      'Gourmet canapés and savory platter',
      'Return hotel transfers'
    ],
    goodToKnow: [
      'National river usage fee ($10) payable at jetty.',
      'Bring a warm jersey for after sunset when river breezes cool down.'
    ],
    faqs: [
      {
        q: 'What wildlife will we see on the river cruise?',
        a: 'You will regularly spot hippos, Nile crocodiles, waterbuck, baboons, and diverse birdlife. Elephants frequently come down to drink or swim across channels.'
      }
    ],
    relatedIds: ['guided-tour-falls', 'chobe-day-safari', 'flight-of-angels']
  },
  {
    id: 'chobe-day-safari',
    slug: 'chobe-day-safari',
    title: 'Chobe National Park Day Safari (Botswana)',
    categories: ['featured', 'wildlife', 'day-trips'],
    shortDescription: 'Full-day Botswana safari combining a Chobe River game cruise with a 4x4 open safari vehicle game drive in elephant country.',
    fullOverview: 'Cross the Kazungula border into Botswana for an iconic safari day in Chobe National Park—home to the world’s largest concentration of African elephants. Your day includes a morning river game cruise, a buffet lunch at a safari lodge, and an afternoon 4x4 open vehicle safari.',
    whyWeRecommend: 'The ultimate single-day wildlife experience in Southern Africa. Combining land and river safari modes doubles your chance of seeing lions, elephants, buffalo, and hippos.',
    duration: 'Full Day (approx 9.5 Hours)',
    fromPrice: 'From US$185',
    priceAmount: 185,
    featuredImage: chobeImg6,
    galleryImages: [chobeImg, chobeImg2, chobeImg3, chobeImg4, chobeImg5, chobeImg6, chobeImg7],
    highlights: [
      'Morning boat cruise along the Chobe Riverfront',
      'Substantial lodge lunch buffet included',
      'Afternoon 4x4 open game drive in Chobe National Park',
      'Unbeatable sightings of massive elephant herds, lions & buffalo'
    ],
    whatsIncluded: [
      'Return cross-border transfer from Victoria Falls',
      'Guided river game boat cruise & 4x4 safari drive',
      'Buffet lunch & park fees',
      'Professional Botswana safari guide'
    ],
    goodToKnow: [
      'Passport required! Check visa requirements for Botswana prior to departure.',
      'Pickups start early around 6:15 AM from your Victoria Falls hotel.'
    ],
    faqs: [
      {
        q: 'Do I need a double-entry visa for Zimbabwe?',
        a: 'Yes, if you hold a single entry visa, ensure you get a KAZA Univisa ($50) upon arrival in Zimbabwe to allow seamless border entry into Botswana and back.'
      }
    ],
    relatedIds: ['rhino-tracking-safari', 'upper-zambezi-sunset-cruise', 'guided-tour-falls']
  },
  {
    id: 'flight-of-angels',
    slug: 'flight-of-angels',
    title: 'Flight of Angels Helicopter Flight',
    categories: ['featured', 'adventure', 'first-visit'],
    shortDescription: 'Soar above the 1,700m wide sheet of falling water and Batoka Gorge for an unforgettable aerial panorama.',
    fullOverview: 'David Livingstone famously wrote that scenes so lovely must have been gazed upon by angels in their flight. Experience that exact perspective on a 15-minute or 22-minute helicopter flight banking gently over Victoria Falls, the Zambezi River islands, and the dramatic Batoka Gorge.',
    whyWeRecommend: 'The only way to comprehend the sheer scale and geological structure of Victoria Falls and the zigzagging gorges carved over millions of years.',
    duration: '15 Mins / 22 Mins',
    fromPrice: 'From US$150',
    priceAmount: 150,
    featuredImage: heli1Img,
    galleryImages: [heli1Img, heli2Img, heli3Img, heli4Img, heli5Img, heli6Img],
    highlights: [
      '360-degree aerial views of Victoria Falls & spray column',
      'Bank over the zigzagging basalt Batoka Gorge',
      'Spot wildlife in Zambezi National Park from the air',
      'Pilots provide live narration on flight headsets'
    ],
    whatsIncluded: [
      'Helicopter flight with experienced commercial pilot',
      'Return hotel transfers to helipad',
      'Safety briefing'
    ],
    goodToKnow: [
      'Helicopter park fee ($15) is payable in cash at helipad.',
      'All seats offer great window visibility.'
    ],
    faqs: [
      {
        q: 'What is the difference between 15-min and 22-min flights?',
        a: 'The 15-minute flight focuses on the Falls and upper river. The 22-minute flight extends down Batoka Gorge and over Zambezi National Park for game spotting.'
      }
    ],
    relatedIds: ['guided-tour-falls', 'white-water-rafting', 'upper-zambezi-sunset-cruise']
  },
  {
    id: 'boma-dinner-show',
    slug: 'boma-dinner-show',
    title: 'The Boma – Dinner & Drum Show',
    categories: ['first-visit', 'culture'],
    shortDescription: 'Interactive evening of traditional Zimbabwean cuisine, open-fire game meats, cultural dancing, and live Djembe drumming.',
    fullOverview: 'An legendary cultural feast! Enjoy a 4-course buffet including grilled game meats, potjie stews, and traditional sadza, accompanied by traditional dancers and an interactive drumming show where every guest receives their own drum.',
    whyWeRecommend: 'High-energy celebration of Zimbabwean hospitality. Unforgettable for families, couples, and group gatherings.',
    duration: '3 Hours',
    fromPrice: 'From US$55',
    priceAmount: 55,
    featuredImage: bomaDinnerImg,
    galleryImages: [bomaDinnerImg, bomaDinnerImg2, bomaDinnerImg3, bomaDinnerImg4, bomaDinnerImg5, bomaDinnerImg6, bomaDinnerImg7],
    highlights: [
      'Traditional chitenge wrap & village beer welcome',
      '4-course buffet with open-fire braai and game meats',
      'Interactive Djembe drum show for every guest',
      'Face painting & mopane worm tasting challenge'
    ],
    whatsIncluded: ['4-course dinner feast', 'Cultural dance show & drum session', 'Tea & coffee'],
    goodToKnow: ['Hotel transfers can be added for $10 pp.'],
    faqs: [{ q: 'Is it suitable for vegetarians?', a: 'Yes! Generous vegetarian stir-fries, pastas, and fresh salads are provided.' }],
    relatedIds: ['lookout-cafe', 'local-village-tour', 'guided-tour-falls']
  },
  {
    id: 'lookout-cafe',
    slug: 'lookout-cafe',
    title: 'Lookout Café & Batoka Gorge Dining',
    categories: ['first-visit', 'culture'],
    shortDescription: 'Perched 110 meters directly above the churning rapids of Batoka Gorge and Victoria Falls bridge.',
    fullOverview: 'Enjoy fine dining, cold local craft beer, or artisanal cocktails with the world’s most dramatic ravine backdrop overlooking the historic Victoria Falls Railway Bridge.',
    whyWeRecommend: 'The best lunch view in Southern Africa. Watch high-wire thrill seekers swing across the gorge while enjoying gourmet dishes.',
    duration: '1.5 - 2 Hours',
    fromPrice: 'From US$25',
    priceAmount: 25,
    featuredImage: gorgeSwingImg,
    galleryImages: [gorgeSwingImg, gorgeSwingImg2, gorgeSwingImg3, gorgeSwingImg4, gorgeSwingImg5, gorgeSwingImg6, gorgeSwingImg7, gorgeSwingImg8],
    highlights: ['Breathtaking 110m gorge overlook', 'A la carte lunch and dinner menu', 'Direct view of the Vic Falls Bridge'],
    whatsIncluded: ['Table reservation', 'Panoramic views'],
    goodToKnow: ['Advance reservations strongly advised during peak lunch hours.'],
    faqs: [{ q: 'Do I need to book ahead?', a: 'Yes, table reservations fill up rapidly.' }],
    relatedIds: ['guided-tour-falls', 'gorge-swing', 'flight-of-angels']
  },
  {
    id: 'rhino-tracking-safari',
    slug: 'rhino-tracking-safari',
    title: 'Walking Rhino Tracking Safari',
    categories: ['wildlife'],
    shortDescription: 'Track endangered black and white rhinoceros on foot accompanied by armed national park rangers.',
    fullOverview: 'An intimate, humbling wildlife adventure in Zambezi National Park. Step out of the safari vehicle and walk silently through the bush under ranger protection to observe white rhinos grazing up close.',
    whyWeRecommend: 'Walking on foot with white rhinos is one of Africa’s rarest and most exhilarating safari privileges.',
    duration: '3.5 Hours',
    fromPrice: 'From US$110',
    priceAmount: 110,
    featuredImage: rhinoTrackingImg,
    galleryImages: [rhinoTrackingImg, rhinoTrackingImg, rhinoTrackingImg],
    highlights: ['Track rhinos on foot with armed rangers', 'Open 4x4 game drive through Zambezi park', 'Learn animal tracking and medicinal plants'],
    whatsIncluded: ['Professional ranger guide', '4x4 game drive', 'Bush refreshments'],
    goodToKnow: ['Minimum age 12 years for walking safari segment.'],
    faqs: [{ q: 'Is walking with rhinos safe?', a: 'Yes, conducted by highly experienced armed national park rangers.' }],
    relatedIds: ['chobe-day-safari', 'game-drive-zambezi', 'elephant-interaction']
  },
  {
    id: 'game-drive-zambezi',
    slug: 'game-drive-zambezi',
    title: 'Zambezi National Park Game Drive',
    categories: ['wildlife'],
    shortDescription: 'Morning or afternoon 4x4 safari drive along the Zambezi River tracking lions, leopards, buffalo, and plains game.',
    fullOverview: 'Explore 56,000 hectares of pristine Zambezi National Park wilderness just minutes from Victoria Falls town. Search for herds of sable antelope, giraffes, lions, and bush elephants.',
    whyWeRecommend: 'Close proximity to town makes this an easy morning or afternoon safari fix without long transfer times.',
    duration: '3 Hours',
    fromPrice: 'From US$75',
    priceAmount: 75,
    featuredImage: gameDriveImg,
    galleryImages: [gameDriveImg, gameDriveImg2, gameDriveImg3, gameDriveImg4, gameDriveImg5, gameDriveImg6, gameDriveImg7],
    highlights: ['Open-sided 4x4 safari vehicle', 'Search for Big Four wildlife', 'Morning coffee or afternoon sundowner in the bush'],
    whatsIncluded: ['Professional safari guide', 'Hotel transfers', 'Snacks & drinks'],
    goodToKnow: ['National park entry fee ($20) is extra.'],
    faqs: [{ q: 'Which is better, morning or afternoon?', a: 'Morning offers active predator tracking, while afternoon ends with sunset drinks by the river.' }],
    relatedIds: ['rhino-tracking-safari', 'chobe-day-safari', 'upper-zambezi-sunset-cruise']
  },
  {
    id: 'elephant-interaction',
    slug: 'elephant-interaction',
    title: 'Elephant Sanctuary & Cultural Experience',
    categories: ['wildlife'],
    shortDescription: 'Educational ethical encounter with rescued African elephants and their dedicated caretakers.',
    fullOverview: 'Learn about elephant behavior, conservation efforts, and individual rescue stories from expert handlers while feeding and observing these gentle giants in a peaceful reserve.',
    whyWeRecommend: 'Profound educational experience that directly supports elephant sanctuary rehabilitation.',
    duration: '2.5 Hours',
    fromPrice: 'From US$120',
    priceAmount: 120,
    featuredImage: elephantImg,
    galleryImages: [elephantImg, elephantImg2, elephantImg3, elephantImg4, elephantImg5, elephantImg6, elephantImg7, elephantImg8],
    highlights: ['Hands-on feeding session', 'Educational talk by senior wildlife caretakers', 'Photography opportunity with elephants'],
    whatsIncluded: ['Sanctuary entry', 'Guided interaction', 'Refreshments'],
    goodToKnow: ['Strict ethical sanctuary guidelines strictly enforced.'],
    faqs: [{ q: 'Is riding permitted?', a: 'No, this is a 100% walk-and-observe sanctuary.' }],
    relatedIds: ['rhino-tracking-safari', 'chobe-day-safari']
  },
  {
    id: 'white-water-rafting',
    slug: 'white-water-rafting',
    title: 'White Water Rafting on the Zambezi',
    categories: ['adventure'],
    shortDescription: 'Conquer the world-famous Grade 5 rapids of Batoka Gorge on one of the river rafting trips on earth.',
    fullOverview: 'Tackle legendary rapids like "The Overland Truck-Eater", "The Mother", and "Oblivion". Guided by river masters, experience heart-pounding swells amidst 200m vertical basalt canyon walls.',
    whyWeRecommend: 'Consistently ranked among the top 3 white-water rafting runs on planet earth.',
    duration: 'Full Day (8 Hours)',
    fromPrice: 'From US$130',
    priceAmount: 130,
    featuredImage: raftingImg,
    galleryImages: [raftingImg, raftingImg2, raftingImg3, raftingImg4, raftingImg5, raftingImg6, raftingImg7, raftingImg8],
    highlights: ['Grade 3 to Grade 5 rapid navigation', 'Hike out of Batoka Gorge', 'Cold beers and riverside lunch included'],
    whatsIncluded: ['Full equipment hire & lifejackets', 'Professional river guides', 'Lunch & beverages', 'Hike out assistance'],
    goodToKnow: ['Requires reasonable fitness for the steep gorge hike out.'],
    faqs: [{ q: 'What season is best?', a: 'Low water season (Aug–Dec) offers the most thrilling full-day rapid run.' }],
    relatedIds: ['gorge-swing', 'flight-of-angels', 'jet-boat-gorge']
  },
  {
    id: 'gorge-swing',
    slug: 'gorge-swing',
    title: 'Batoka Gorge Swing & Tandem Jump',
    categories: ['adventure'],
    shortDescription: 'Freefall 70 meters straight down into Batoka Gorge before swinging in a massive 95m pendulum arc.',
    fullOverview: 'Step off the wooden platform over a 120-meter drop into the gorge. Accelerate to 120 km/h in zero gravity before turning into a smooth giant swing above the Zambezi river rapids.',
    whyWeRecommend: 'Pure adrenaline Rush! Available as single or tandem for couples.',
    duration: '2 Hours',
    fromPrice: 'From US$95',
    priceAmount: 95,
    featuredImage: gorgeSwingImg,
    galleryImages: [gorgeSwingImg, gorgeSwingImg2, gorgeSwingImg3, gorgeSwingImg4, gorgeSwingImg5, gorgeSwingImg6, gorgeSwingImg7, gorgeSwingImg8],
    highlights: ['70m sheer vertical freefall', 'Speeds up to 120 km/h', 'Tandem jumps available for couples'],
    whatsIncluded: ['Safety harness & equipment', 'Certified riggers', 'Hotel transfers'],
    goodToKnow: ['Video and photo packages available for purchase on site.'],
    faqs: [{ q: 'Can two people jump together?', a: 'Yes, tandem gorge swings are extremely popular!' }],
    relatedIds: ['bungee-jump', 'white-water-rafting', 'zip-line']
  },
  {
    id: 'bungee-jump',
    slug: 'bungee-jump',
    title: 'Victoria Falls Bridge Bungee Jump',
    badge: "One of the World's Great Bucket List Jumps",
    subtitle: 'Plunge 111 meters into the dramatic Batoka Gorge with the thunderous spray of Victoria Falls framing the horizon behind you.',
    categories: ['adventure', 'featured'],
    shortDescription: 'Plunge 111 meters from the historic Victoria Falls Bridge toward the roaring Zambezi rapids below.',
    fullOverview: 'The Victoria Falls Bridge bungee jump is consistently ranked among the world’s ultimate bucket-list adrenaline experiences. Suspended 111 meters above the churning rapids of Batoka Gorge, you leap from the historic 1905 steel railway bridge positioned in the neutral "No-Man’s Land" between Zimbabwe and Zambia.',
    whyWeRecommend: 'The Victoria Falls Bridge bungee isn’t just a jump; it’s a plunge into the natural border between Zimbabwe and Zambia with one of the Seven Natural Wonders of the World roaring right beside you. The sheer drop, the wind, and the mist create an adrenaline rush unmatched anywhere in Africa.',
    duration: '2 Hours',
    location: "Victoria Falls Bridge (No-Man's Land)",
    fromPrice: 'From US$160',
    priceAmount: 160,
    featuredImage: bungeeImg,
    galleryImages: [bungeeImg, bungeeImg2, bungeeImg3, bungeeImg4, bungeeImg5, bungeeImg6],
    highlights: [
      '111m sheer vertical plunge over the Zambezi River rapids',
      'Positioned in the historic "No-Man\'s Land" on the 1905 Victoria Falls Bridge',
      'Unrivalled view of Mosi-oa-Tunya spray column and Batoka Gorge',
      'Operated by master riggers with 100% safety record since 1994',
      'Dual ankle harness & body harness backup system',
      'HD Video & Photo memory packages recorded on-site'
    ],
    whatsIncluded: [
      'Professional jump safety briefing by master riggers',
      'Dual padded ankle harness & body backup harness fitting',
      'Complimentary Victoria Falls Bridge border pass',
      'Personalized Certificate of Bravery upon completion'
    ],
    whatsExcluded: [
      'National park / bridge access fee ($10 cash on site)',
      'Return hotel transfers ($15 pp optional bundle)',
      'HD Video & Photo souvenir package ($55 optional)'
    ],
    goodToKnow: [
      'Minimum age 14 years (parental consent required for under 18s).',
      'Minimum weight 40 kg (88 lbs); maximum weight 140 kg (308 lbs).',
      'Bring physical passport for free bridge pass issuance at border control.',
      'Wear closed-toe athletic shoes with good laces.'
    ],
    localExpertTip: 'Book your jump for late afternoon when the sun hits the spray of Victoria Falls, creating vibrant double rainbows directly inside the gorge as you dive!',
    steps: [
      {
        stepNumber: 1,
        time: "Phase 1",
        title: "The Historic Bridge Approach",
        description: "Walk out onto the famous 1905 steel Victoria Falls Railway Bridge spanning the Batoka Gorge. Positioned in the neutral 'No-Man's Land' between Zimbabwe and Zambia, you'll feel the rush of wind and catch your first glimpse of the roaring river 111 meters below.",
        highlight: "Free bridge pass provided at border control—no visa needed!",
        image: bungeeImg
      },
      {
        stepNumber: 2,
        time: "Phase 2",
        title: "Safety Briefing & Precision Harnessing",
        description: "Meet your team of certified master riggers at the bridge jump station. You will be weighed, fitted with specialized padded ankle harnesses, and backed up with a heavy-duty climbing body harness for dual-redundant safety.",
        highlight: "Operated with a 100% safety record over 500,000+ jumps.",
        image: bungeeImg2
      },
      {
        stepNumber: 3,
        time: "Phase 3",
        title: "The Edge Walk & Gantry Launchpad",
        description: "Step onto the wooden jump gantry suspended directly over the abyss. With the spray of Mosi-oa-Tunya drifting past and the Zambezi rapids surging under your feet, the jump master guides you to the threshold.",
        highlight: "Breathtaking 360° panoramic view of Batoka Canyon.",
        image: bungeeImg3
      },
      {
        stepNumber: 4,
        time: "Phase 4",
        title: "5... 4... 3... 2... 1... BUNGEE!",
        description: "Leap forward into pure weightlessness! Experience 4 seconds of exhilarating freefall reaching terminal speeds over 120 km/h before the custom rubber bungee cord smoothly catches you in a series of gentle, soaring bounces.",
        highlight: "4 seconds of sheer vertical zero-gravity freefall.",
        image: bungeeImg4
      },
      {
        stepNumber: 5,
        time: "Phase 5",
        title: "Winch Recovery & Certificate of Bravery",
        description: "After the rebounds settle, a winch operator gently lowers a recovery line to hoist you smoothly back up to the bridge deck. Celebrate with fellow jumpers, receive your official Certificate of Bravery, and view your HD video footage.",
        highlight: "Official Certificate of Bravery & HD video memories.",
        image: bungeeImg5
      }
    ],
    faqs: [
      {
        q: 'Is a visa required to go onto the Victoria Falls Bridge?',
        a: 'No! Immigration issues a free Bridge Pass at both the Zimbabwean and Zambian border posts so you can walk onto the bridge without using up a visa entry.'
      },
      {
        q: 'Can family and friends watch from the bridge?',
        a: 'Yes! Spectating from the bridge deck or the Bridge Cafe is free and offers incredible photographic viewpoints of the jump.'
      },
      {
        q: 'How safe is the Victoria Falls Bungee Jump?',
        a: 'Over 500,000 jumps have been conducted with strict international safety protocols, dual harness systems, and daily equipment inspections.'
      }
    ],
    relatedIds: ['gorge-swing', 'white-water-rafting', 'flight-of-angels', 'upper-zambezi-sunset-cruise']
  },
  {
    id: 'zip-line',
    slug: 'zip-line',
    title: 'High-Wire Batoka Zip Line',
    categories: ['adventure'],
    shortDescription: 'Fly 425 meters across Batoka Gorge at speeds of up to 106 km/h suspended 120m above the river.',
    fullOverview: 'Harness into the world’s longest zip line cable over a canyon. Launch from the cliff face and slide smoothly across the gorge enjoying bird’s-eye views of the river below.',
    whyWeRecommend: 'Exhilarating yet accessible for all family members without vertical freefall anxiety.',
    duration: '1.5 Hours',
    fromPrice: 'From US$75',
    priceAmount: 75,
    featuredImage: zipLineImg,
    galleryImages: [zipLineImg, zipLineImg2, zipLineImg3, zipLineImg4, zipLineImg5, zipLineImg6, zipLineImg7, zipLineImg8],
    highlights: ['425m cable length', 'Speeds over 100 km/h', 'Panoramic canyon views'],
    whatsIncluded: ['Full safety harness', 'Instruction', 'Hotel transfer'],
    goodToKnow: ['Suitable for ages 6 and up.'],
    faqs: [{ q: 'Is it safe for children?', a: 'Yes, kids can zip tandem with an instructor.' }],
    relatedIds: ['gorge-swing', 'canopy-tour']
  },
  {
    id: 'flying-fox',
    slug: 'flying-fox',
    title: 'Batoka Flying Fox Cable Slide',
    categories: ['adventure'],
    shortDescription: 'Take a graceful running leap off the canyon edge and glide face-forward over Batoka Gorge.',
    fullOverview: 'Fly like a superhero! Strapped face-down in a horizontal harness, take off from the cliff and glide across the gorge as if soaring on wings.',
    whyWeRecommend: 'Incredible feeling of unassisted flight over one of Africa’s deepest river canyons.',
    duration: '1.5 Hours',
    fromPrice: 'From US$55',
    priceAmount: 55,
    featuredImage: zipLineImg,
    galleryImages: [zipLineImg, zipLineImg2, zipLineImg3, zipLineImg4, zipLineImg5, zipLineImg6, zipLineImg7, zipLineImg8],
    highlights: ['Horizontal flight position', 'Breathtaking gorge drop views', 'Gentle landing'],
    whatsIncluded: ['Harness & safety brief', 'Hotel transfers'],
    goodToKnow: ['Great warm-up activity before the Gorge Swing.'],
    faqs: [{ q: 'Is there a weight limit?', a: 'Max weight limit is 140 kg.' }],
    relatedIds: ['zip-line', 'gorge-swing']
  },
  {
    id: 'jet-boat-gorge',
    slug: 'jet-boat-gorge',
    title: 'Extreme Jet Boat Batoka Rapids',
    categories: ['adventure'],
    shortDescription: 'High-speed jet boat thrill ride power-sliding past churning Zambezi rapids deep inside Batoka Gorge.',
    fullOverview: 'Powered by twin V8 engines, this custom jet boat spins 360-degree turns and cuts through standing waves below the boiling pot of Victoria Falls.',
    whyWeRecommend: 'The ultimate high-octane water adventure without having to paddle!',
    duration: '2.5 Hours',
    fromPrice: 'From US$120',
    priceAmount: 120,
    featuredImage: jetBoatImg,
    galleryImages: [jetBoatImg, jetBoatImg2, jetBoatImg3, jetBoatImg4, jetBoatImg5, jetBoatImg6],
    highlights: ['Twin V8 jet propulsion', '360 degree water spins', 'Navigate rapids at 80 km/h'],
    whatsIncluded: ['Jet boat ride', 'Lifejacket & helmet', 'Lift transfer into gorge'],
    goodToKnow: ['You WILL get completely soaked—wear swimwear.'],
    faqs: [{ q: 'Are dry bags provided?', a: 'Yes, for small valuables at the jetty.' }],
    relatedIds: ['white-water-rafting', 'gorge-swing']
  },
  {
    id: 'canopy-tour',
    slug: 'canopy-tour',
    title: 'Victoria Falls Rainforest Canopy Tour',
    categories: ['adventure'],
    shortDescription: 'Nine ziplines and rope bridges woven through the lush canopy of Batoka Gorge forest.',
    fullOverview: 'Glide through hardwood forest treetops on nine cable slides ranging from 40 to 85 meters. Enjoy close-up views of gorge birdlife, monkeys, and mist vegetation.',
    whyWeRecommend: 'Perfect family zipline experience with scenic wooden walkways and friendly guides.',
    duration: '2.5 Hours',
    fromPrice: 'From US$65',
    priceAmount: 65,
    featuredImage: zipLineImg,
    galleryImages: [zipLineImg, zipLineImg2, zipLineImg3, zipLineImg4, zipLineImg5, zipLineImg6, zipLineImg7, zipLineImg8],
    highlights: ['9 zipline rope slides', 'Skywalk rope bridges', 'Ecological nature commentary'],
    whatsIncluded: ['Safety gear & helmet', '2 guide escorts', 'Hotel transfers'],
    goodToKnow: ['Suitable for all fitness levels from age 6 upwards.'],
    faqs: [{ q: 'Is it scary?', a: 'It is very gentle and family-friendly compared to the Gorge Swing.' }],
    relatedIds: ['zip-line', 'guided-tour-falls']
  },
  {
    id: 'luxury-pontoon-cruise',
    slug: 'luxury-pontoon-cruise',
    title: 'Zambezi Royal Luxury Pontoon Cruise',
    categories: ['river'],
    shortDescription: 'Ultra-exclusive 28-seat luxury catamaran cruise with chef-crafted tapas and top-shelf cellar wines.',
    fullOverview: 'Step aboard the Zambezi Royal for an elevated river safari experience. Plush leather seating, dedicated waiters, imported vintage wines, and artisanal tapas accompany your river journey.',
    whyWeRecommend: 'The gold standard of Zambezi river cruises for discerning travel lovers.',
    duration: '2 Hours',
    fromPrice: 'From US$110',
    priceAmount: 110,
    featuredImage: standardCruiseImg,
    galleryImages: [standardCruiseImg, standardCruiseImg2, standardCruiseImg3, standardCruiseImg4, standardCruiseImg5, standardCruiseImg6],
    highlights: ['Maximum 28 guests for intimate luxury', 'Chef tapas menu', 'Premium international cellar bar'],
    whatsIncluded: ['Tapas & drinks', 'Luxury pontoon cruise', 'Transfers'],
    goodToKnow: ['Departs daily at 4:00 PM.'],
    faqs: [{ q: 'Are spirits included?', a: 'Yes, top-shelf single malts, gins, and vintage wines.' }],
    relatedIds: ['upper-zambezi-sunset-cruise', 'breakfast-cruise']
  },
  {
    id: 'breakfast-cruise',
    slug: 'breakfast-cruise',
    title: 'Zambezi River Sunrise & Breakfast Cruise',
    categories: ['river'],
    shortDescription: 'Watch the river awaken with early morning mist, wildlife bird calls, and a warm cooked breakfast on the water.',
    fullOverview: 'Glide down the Zambezi as dawn light breaks through river foliage. Enjoy freshly brewed Zimbabwean coffee, tropical fruits, and a hot cooked breakfast while hippos yawn in morning mist.',
    whyWeRecommend: 'Peaceful, crisp morning air and active morning birdlife before the heat of the day.',
    duration: '2 Hours',
    fromPrice: 'From US$75',
    priceAmount: 75,
    featuredImage: footerZambeziDuskImg,
    galleryImages: [footerZambeziDuskImg, standardCruiseImg, standardCruiseImg2],
    highlights: ['Early morning river tranquility', 'Cooked plated breakfast', 'Freshly brewed Tanganda coffee & juices'],
    whatsIncluded: ['Full breakfast', 'Bar & hot drinks', 'Transfers'],
    goodToKnow: ['Departs jetty at 6:30 AM.'],
    faqs: [{ q: 'Is birdwatching good in the morning?', a: 'Outstanding! Herons, kingfishers, and fish eagles are most active.' }],
    relatedIds: ['upper-zambezi-sunset-cruise', 'canoeing-zambezi']
  },
  {
    id: 'fishing-trips',
    slug: 'fishing-trips',
    title: 'Zambezi Tiger Fishing Excursion',
    categories: ['river'],
    shortDescription: 'Battle the fierce Hydrocynus vittatus (African Tigerfish) with professional river fishing captains.',
    fullOverview: 'Test your skill against Africa’s ultimate freshwater gamefish! Target tigerfish and bream along river structure using top-quality lures, flies, or live bait.',
    whyWeRecommend: 'Tigerfish strike with unbelievable speed and leap clear out of the water.',
    duration: 'Half Day (3.5 Hours)',
    fromPrice: 'From US$140',
    priceAmount: 140,
    featuredImage: chobeImg,
    galleryImages: [chobeImg, chobeImg2, chobeImg3],
    highlights: ['Tackle tigerfish up to 10kg', 'Pro river captain & fast boat', 'Catch & release practice'],
    whatsIncluded: ['Fishing tackle & bait', 'Cold drinks & beers', 'Boat captain'],
    goodToKnow: ['Best season is Sept through March during warmer water temperatures.'],
    faqs: [{ q: 'Is equipment provided?', a: 'Yes, rods, reels, wire leaders, and lures included.' }],
    relatedIds: ['upper-zambezi-sunset-cruise', 'canoeing-zambezi']
  },
  {
    id: 'canoeing-zambezi',
    slug: 'canoeing-zambezi',
    title: 'Upper Zambezi Guided Canoe Safari',
    categories: ['river', 'adventure'],
    shortDescription: 'Silently paddle Canadian-style canoes through peaceful river channels past elephant islands and hippo pools.',
    fullOverview: 'Experience the raw Zambezi at water level. Guided by river professionals, paddle down narrow reed channels observing wildlife quietly without engine noise.',
    whyWeRecommend: 'The quietest, most immersive way to feel the heartbeat of the Zambezi River.',
    duration: 'Half Day / Full Day',
    fromPrice: 'From US$115',
    priceAmount: 115,
    featuredImage: chobeImg,
    galleryImages: [chobeImg, chobeImg2, chobeImg3],
    highlights: ['Silent paddling in stable two-person canoes', 'Riverside picnic lunch', 'Unobstructed wildlife photos'],
    whatsIncluded: ['Canoe equipment', 'River guide', 'Picnic lunch & drinks'],
    goodToKnow: ['No previous canoeing experience required.'],
    faqs: [{ q: 'Are hippos a danger?', a: 'Guides keep strict safe distances from all river channels.' }],
    relatedIds: ['upper-zambezi-sunset-cruise', 'breakfast-cruise']
  },
  {
    id: 'local-village-tour',
    slug: 'local-village-tour',
    title: 'Authentic Zimbabwean Cultural Village Tour',
    categories: ['culture'],
    shortDescription: 'Visit a rural homestead to meet local elders, learn traditional customs, farming, and daily village life.',
    fullOverview: 'Step into a real rural village outside Victoria Falls. Meet village headmen, tour family compounds, learn how maize is ground, and see traditional thatch architecture.',
    whyWeRecommend: 'Warm, humbling cross-cultural connection that directly benefits village development funds.',
    duration: '2.5 Hours',
    fromPrice: 'From US$45',
    priceAmount: 45,
    featuredImage: craftMarketImg,
    galleryImages: [craftMarketImg, craftMarketImg, craftMarketImg],
    highlights: ['Meet village elders and families', 'Learn traditional cooking and homesteading', 'Community contribution included'],
    whatsIncluded: ['Cultural guide', 'Village donation', 'Hotel transfers'],
    goodToKnow: ['Photography welcomed with respectful permission.'],
    faqs: [{ q: 'Is this authentic?', a: 'Yes, visits take place at working rural family homesteads.' }],
    relatedIds: ['boma-dinner-show', 'art-galleries-markets']
  },
  {
    id: 'art-galleries-markets',
    slug: 'art-galleries-markets',
    title: 'Victoria Falls Craft Markets & Art Galleries',
    categories: ['culture'],
    shortDescription: 'Guided shopping tour of master Shona stone sculptors, wood carvers, and local artisanal art galleries.',
    fullOverview: 'Explore Zimbabwe’s renowned artistic heritage! Visit local curio markets and premier fine art galleries displaying Shona serpentine stone sculptures and contemporary African paintings.',
    whyWeRecommend: 'Zimbabwe is world-famous for stone carving; take home authentic handcrafted treasures.',
    duration: '2 Hours',
    fromPrice: 'From US$35',
    priceAmount: 35,
    featuredImage: craftMarketImg,
    galleryImages: [craftMarketImg, craftMarketImg, craftMarketImg],
    highlights: ['Shona stone sculpture demonstrations', 'Local woodcraft markets', 'Packaging assistance for international flights'],
    whatsIncluded: ['Guided market walk', 'Transfers'],
    goodToKnow: ['Market vendors accept USD cash.'],
    faqs: [{ q: 'Can heavy stone sculptures be shipped home?', a: 'Yes, gallery staff arrange international freight packaging.' }],
    relatedIds: ['local-village-tour', 'boma-dinner-show']
  },
  {
    id: 'hwange-day-safari',
    slug: 'hwange-day-safari',
    title: 'Hwange National Park Full Day Safari',
    categories: ['day-trips', 'wildlife'],
    shortDescription: 'Journey to Zimbabwe’s largest wildlife reserve famous for massive elephant herds and lion pride tracking.',
    fullOverview: 'Travel 100km south to Hwange National Park, spanning 14,600 sq km of teak forests and savannah waterholes. Spend the day tracking Big Five wildlife in open safari vehicles.',
    whyWeRecommend: 'Hwange hosts over 40,000 elephants and offers unmatched wilderness authenticity.',
    duration: 'Full Day (11 Hours)',
    fromPrice: 'From US$210',
    priceAmount: 210,
    featuredImage: familySafariImg,
    galleryImages: [familySafariImg, familySafariImg, familySafariImg],
    highlights: ['Explore Hwange Main Camp & waterholes', 'Buffet lunch at safari lodge', 'Sightings of wild dogs, lions, cheetahs & elephants'],
    whatsIncluded: ['Return road transfers', 'Full day 4x4 safari', 'Lodge lunch & park fees'],
    goodToKnow: ['Departs at 6:00 AM from Victoria Falls hotels.'],
    faqs: [{ q: 'How long is the drive to Hwange?', a: 'Approximately 1.5 hours on paved tar roads.' }],
    relatedIds: ['chobe-day-safari', 'game-drive-zambezi']
  },
  {
    id: 'livingstone-zambia-tour',
    slug: 'livingstone-zambia-tour',
    title: 'Livingstone Town & Zambian Falls Day Trip',
    categories: ['day-trips', 'culture'],
    shortDescription: 'Cross the historic bridge into Zambia to view Eastern Cataract and explore Livingstone town history.',
    fullOverview: 'Experience Victoria Falls from the Zambian side! Visit Mosi-oa-Tunya National Park in Zambia, walk down to the Boiling Pot, and explore Livingstone Museum.',
    whyWeRecommend: 'Provides a complete two-country perspective on Victoria Falls.',
    duration: '5 Hours',
    fromPrice: 'From US$95',
    priceAmount: 95,
    featuredImage: intentVicFallsIconicImg,
    galleryImages: [intentVicFallsIconicImg, intentVicFallsIconicImg],
    highlights: ['View Eastern Cataract & Knife-Edge Bridge', 'Livingstone Museum tour', 'Cross historic 1905 Victoria Falls Bridge'],
    whatsIncluded: ['Cross-border transport', 'Guide', 'Town tour'],
    goodToKnow: ['Check Zambia visa requirements before departure.'],
    faqs: [{ q: 'Is the KAZA Univisa accepted?', a: 'Yes, covers both Zimbabwe and Zambia.' }],
    relatedIds: ['guided-tour-falls', 'chobe-day-safari']
  },
  {
    id: 'simunye-theatre-show',
    slug: 'simunye-theatre-show',
    title: 'Simunye – Spirit of Africa Theatre Show',
    categories: ['featured', 'first-visit', 'culture'],
    shortDescription: 'High-energy 1-hour theatrical celebration of African culture featuring traditional performers, drummers, and dancers.',
    fullOverview: 'Experience the vibrant Spirit of Africa at Simunye Theatre located at Elephant Walk shopping center. A mesmerizing 60-minute show featuring accomplished traditional performers, live djembe drumming, energetic dance performances, and powerful storytelling that showcases the rich cultural heritage of Africa.',
    whyWeRecommend: 'Spectacular professional theatrical production perfect for all ages. Immersive, entertaining, and a genuine celebration of African artistry and tradition.',
    duration: '1 Hour (Check-in 19:30, Show 20:00-21:00)',
    location: 'Simunye Theatre @ Elephant Walk Shopping Centre',
    fromPrice: 'From US$50',
    priceAmount: 50,
    featuredImage: simunyeImg,
    galleryImages: [simunyeImg, simunyeImg2, simunyeImg3, simunyeImg4, simunyeImg5, simunyeImg6, simunyeImg7, simunyeImg8, simunyeImg9],
    highlights: [
      'Professional theatrical production with live performers',
      'Traditional African dancers in authentic cultural costumes',
      'Live djembe drumming & rhythmic performances',
      'Intimate 195-seat theatre in round setting for 360° viewing',
      'Engaging storytelling celebrating African heritage'
    ],
    whatsIncluded: [
      'Theatre admission & reserved seating',
      'Professional theatrical performance',
      'Evening cultural entertainment'
    ],
    whatsExcluded: [
      'Hotel transfers (can be arranged for additional fee)',
      'Beverages & refreshments (available for purchase at venue)'
    ],
    goodToKnow: [
      'All ages welcome; children 16 and under receive 50% discount on admission',
      'Arrive 15-20 minutes early for check-in and venue orientation',
      'Comfortable shoes recommended as seating may vary',
      'Photography allowed with performer permission',
      'Evening performance in air-conditioned theatre'
    ],
    localExpertTip: "Book your tickets in advance during peak season (June-August). The theatre fills quickly as it's a favorite with families and tour groups seeking authentic cultural entertainment.",
    faqs: [
      {
        q: 'How long is the show?',
        a: 'The theatrical performance runs approximately 60 minutes without intermission, with check-in beginning at 19:30 and the show starting at 20:00.'
      },
      {
        q: 'Is the show suitable for children?',
        a: 'Yes! Simunye is family-friendly and all ages are welcome. Children find the vibrant performances, music, and dancing particularly engaging.'
      },
      {
        q: 'Can I get dinner before the show?',
        a: 'The Elephant Walk shopping centre has several dining options available. We recommend arriving early to enjoy a meal before the 20:00 performance start time.'
      },
      {
        q: 'Do I need to book in advance?',
        a: 'We strongly recommend advance booking, especially during peak tourist seasons. Walk-up tickets are subject to availability.'
      }
    ],
    relatedIds: ['boma-dinner-show', 'local-village-tour', 'art-galleries-markets']
  }
];

export function getExperienceById(id: string): Experience | undefined {
  return ALL_EXPERIENCES.find(exp => exp.id === id || exp.slug === id);
}

export function getFeaturedExperiences(): Experience[] {
  return ALL_EXPERIENCES.filter(exp => exp.categories.includes('featured')).slice(0, 4);
}
