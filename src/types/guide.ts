export interface QuickFact {
  label: string;
  value: string;
  subtext?: string;
  iconName: string;
}

export interface Author {
  name: string;
  role: string;
  avatarUrl: string;
  bio?: string;
}

export type CalloutType = 'advice' | 'insight' | 'recommendation';

export interface CalloutBlock {
  type: CalloutType;
  title: string;
  content: string;
}

export interface PullQuote {
  quote: string;
  author: string;
  title?: string;
  avatarUrl?: string;
}

export interface PracticalInfoItem {
  heading: string;
  detail: string;
  iconName?: string;
}

export interface PracticalInfoPanel {
  title: string;
  subtitle?: string;
  items: PracticalInfoItem[];
}

export interface TravellerTypeCard {
  id: string;
  title: string;
  tagline: string;
  idealFor: string;
  topTip: string;
  recommendedDuration: string;
  imageUrl: string;
}

export interface RelatedGuideCard {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  imageUrl: string;
  badge?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export type BlockType = 
  | 'text'
  | 'heading'
  | 'image'
  | 'callout'
  | 'pullquote'
  | 'practical_info'
  | 'traveller_cards'
  | 'bullet_list';

export interface ArticleBlock {
  type: BlockType;
  content?: string;
  subheading?: string;
  headingLevel?: 'h2' | 'h3';
  items?: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  imageCredit?: string;
  callout?: CalloutBlock;
  pullQuote?: PullQuote;
  practicalPanel?: PracticalInfoPanel;
}

export interface GuideSection {
  id: string;
  tocTitle: string;
  heading: string;
  blocks: ArticleBlock[];
}

export interface SEOConfig {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  keywords: string[];
}

export interface GuideArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  heroImageCredit?: string;
  author: Author;
  publishedDate: string;
  lastUpdatedDate: string;
  readingTime: string;
  location: string;
  seo: SEOConfig;
  quickFacts: QuickFact[];
  sections: GuideSection[];
  travellerTypes: TravellerTypeCard[];
  faqs: FaqItem[];
  relatedGuides: RelatedGuideCard[];
}
