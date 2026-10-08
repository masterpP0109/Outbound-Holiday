import { createElement,Fragment } from 'react';
import type { DetailedAccommodation, Experience, DetailedPackage, ActivityItem } from '../types/content';
import type { GuideArticle } from '../types/guide';
import type { ContentSnapshot } from '../../shared/content-schema';
import type { TravelPackage, TravelSpot, Accommodation, Review } from '../types';
export type { DetailedAccommodation,Experience,DetailedPackage } from '../types/content';
export let ALL_ACCOMMODATIONS: DetailedAccommodation[] = [];
export let ALL_EXPERIENCES: Experience[] = [];
export let ALL_PACKAGES: DetailedPackage[] = [];
export let ALL_GUIDE_ARTICLES: Record<string,GuideArticle> = {};
export let FIRST_TIME_VISITOR_ARTICLE: GuideArticle;
export let GUIDE_HUB_CATEGORIES: any[] = [];
export let FEATURED_HOMEPAGE_ACCOMMODATIONS: DetailedAccommodation[] = [];
export let clientGalleryImages: string[] = [];
export let ACTIVITIES_DATA: ActivityItem[] = [];
export let STAY_TIERS: ContentSnapshot['stayTiers'] = [];
export let CURRENCY_RATES: Record<string,{symbol:string;rate:number}> = {};
export let TRUST_BUILDERS: any[] = [];
export let FEATURED_PACKAGES: TravelPackage[] = [];
export let VIC_FALLS_SPOTS: TravelSpot[] = [];
export let ACCOMMODATIONS: Accommodation[] = [];
export let TRAVEL_REVIEWS: Review[] = [];
let snapshot: ContentSnapshot;
const installers: (()=>void)[] = [];
export function registerContent(install:()=>void){ installers.push(install);if(snapshot)install(); }
export function installContent(next:ContentSnapshot){
  snapshot=next;
  ALL_ACCOMMODATIONS=next.accommodations;ALL_EXPERIENCES=next.experiences;ALL_PACKAGES=next.packages;
  ALL_GUIDE_ARTICLES=Object.fromEntries(next.guides.map(g=>[g.slug,g]));
  FIRST_TIME_VISITOR_ARTICLE=next.guides.find(g=>g.slug==='first-time-visitor-guide')!;
  GUIDE_HUB_CATEGORIES=next.site.guideCategories;
  FEATURED_HOMEPAGE_ACCOMMODATIONS=next.site.featured.accommodationIds.map(id=>getAccommodationBySlug(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  clientGalleryImages=next.albums.flatMap(a=>a.images.map(i=>i.url));
  ACTIVITIES_DATA=next.builderActivities;STAY_TIERS=next.stayTiers;CURRENCY_RATES=next.site.currencyRates;
  TRUST_BUILDERS=next.site.legacy.TRUST_BUILDERS as any[];FEATURED_PACKAGES=next.site.legacy.FEATURED_PACKAGES as unknown as TravelPackage[];
  VIC_FALLS_SPOTS=next.site.legacy.VIC_FALLS_SPOTS as unknown as TravelSpot[];ACCOMMODATIONS=next.site.legacy.ACCOMMODATIONS as unknown as Accommodation[];TRAVEL_REVIEWS=next.site.legacy.TRAVEL_REVIEWS as unknown as Review[];
  for(const install of installers)install();
}
export function getSnapshot(){if(!snapshot)throw new Error('Content has not been loaded');return snapshot;}
export function editorial(key:string):string { const value=getSnapshot().site.editorial.strings[key];if(value===undefined)throw new Error('Missing editorial content: '+key);return value; }
export function editorialValue<T=any>(key:string,icons:Record<string,unknown>={}):T {
  const value=getSnapshot().site.editorial.structures[key];if(value===undefined)throw new Error('Missing editorial section: '+key);
  const hydrate=(v:any):any=>Array.isArray(v)?v.map(hydrate):v&&typeof v==='object'?v.$element?createElement(v.$element.name==='#fragment'?Fragment:v.$element.name==='br'?'br':icons[v.$element.name] as any,v.$element.props,...v.$element.children.map(hydrate)):v.$icon?(icons[v.$icon]??(()=>{throw new Error('Unsupported editorial icon: '+v.$icon);})):Object.fromEntries(Object.entries(v).map(([k,x])=>[k,hydrate(x)])):v;
  return hydrate(value);
}
export const getExperienceById=(id:string)=>ALL_EXPERIENCES.find(e=>e.id===id||e.slug===id);
export const getAccommodationBySlug=(id:string)=>ALL_ACCOMMODATIONS.find(e=>e.id===id||e.slug===id);
export const getPackageById=(id:string)=>ALL_PACKAGES.find(e=>e.id===id||e.slug===id);
export const getFeaturedExperiences=()=>getSnapshot().site.featured.experienceIds.map(getExperienceById).filter((item): item is NonNullable<typeof item> => Boolean(item));
export const getHomepageFeaturedPackages=()=>getSnapshot().site.featured.packageIds.map(getPackageById).filter((item): item is NonNullable<typeof item> => Boolean(item));

export function getClientImage(url:string){return getSnapshot().albums.flatMap(a=>a.images).find(image=>image.url===url);}

export function editorialFormat(key:string,values:unknown[]=[]){return editorial(key).replace(/\{\{(\d+)\}\}/g,(_match,index)=>String(values[Number(index)]??''));}
