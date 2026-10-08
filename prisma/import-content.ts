import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import type { ContentKind } from '@prisma/client';
import { ALL_ACCOMMODATIONS,FEATURED_HOMEPAGE_ACCOMMODATIONS } from './fixtures/accommodationsData';
import { ALL_EXPERIENCES,getFeaturedExperiences } from './fixtures/experiencesData';
import { ALL_PACKAGES,getHomepageFeaturedPackages } from './fixtures/packagesData';
import { ALL_GUIDE_ARTICLES,GUIDE_HUB_CATEGORIES } from './fixtures/allGuideArticles';
import { clientGalleryImages } from './fixtures/clientGalleryImages';
import { ACTIVITIES_DATA,STAY_TIERS } from './fixtures/builder';
import * as travel from './fixtures/travelData';
import { validatePayload,validateGuideBlocks } from '../shared/content-schema';
const canonical=(v:any):any=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
export async function fixtureRecords(){
  const editorial=JSON.parse(await readFile('prisma/fixtures/editorial.json','utf8'));
  const routeSeo=JSON.parse(await readFile('prisma/fixtures/route-seo.json','utf8'));
  const site={routeSeo,editorial,contact:{whatsappNumber:'263714701721',displayNumber:'+263 714 701 721',email:'travel@outboundholidays.co.zw',address:'Suite 4, Mosi-oa-Tunya Commercial Centre, Victoria Falls, Zimbabwe',hours:'Mon - Sun: 7:30 AM - 7:00 PM (CAT)'},currencyRates:travel.CURRENCY_RATES,guideCategories:GUIDE_HUB_CATEGORIES,featured:{accommodationIds:FEATURED_HOMEPAGE_ACCOMMODATIONS.map(x=>x.id),experienceIds:getFeaturedExperiences().map(x=>x.id),packageIds:getHomepageFeaturedPackages().map(x=>x.id)},legacy:{TRUST_BUILDERS:travel.TRUST_BUILDERS,FEATURED_PACKAGES:travel.FEATURED_PACKAGES,VIC_FALLS_SPOTS:travel.VIC_FALLS_SPOTS,ACCOMMODATIONS:travel.ACCOMMODATIONS,TRAVEL_REVIEWS:travel.TRAVEL_REVIEWS}};
  const album={id:'client-memories',slug:'client-memories',title:'Outbound Holidays Client Memories',featured:true,images:clientGalleryImages.map((url,i)=>({id:'client-image-'+i,url,alt:'Outbound Holidays client travel memory '+(i+1),caption:null,displayOrder:i,role:'gallery'}))};
  const groups:[ContentKind,any[]][]=[['accommodation',ALL_ACCOMMODATIONS],['experience',ALL_EXPERIENCES],['package',ALL_PACKAGES],['packageStay',ALL_PACKAGES.flatMap(pkg=>pkg.recommendedHotels.map(h=>({...h,id:pkg.id+'--'+h.id,originalId:h.id,packageId:pkg.id})))],['guide',Object.values(ALL_GUIDE_ARTICLES)],['album',[album]],['site',[{...site}]],['builderActivity',ACTIVITIES_DATA],['stayTier',STAY_TIERS]];
  const records=groups.flatMap(([kind,items])=>items.map((payload,displayOrder)=>{
    validatePayload(kind,payload);if(kind==='guide')validateGuideBlocks(payload);
    const originalId=payload.id??'shared';const id=kind+':'+originalId;
    const metaTitle=payload.seo?.metaTitle??(kind==='accommodation'?payload.name+' | Victoria Falls Accommodation | Outbound Holidays':['experience','package'].includes(kind)?payload.title+' | Outbound Holidays':null);
    const metaDescription=payload.seo?.metaDescription??payload.shortDescription??payload.description??null;
    return {metaTitle,metaDescription,id,kind,slug:payload.slug??originalId,title:payload.name??payload.title??'Shared site content',category:payload.category??null,location:payload.location??null,duration:payload.duration??null,startingPrice:payload.priceFromUSD??payload.priceAmount??payload.priceUSD??payload.pricePerNightUSD??null,currency:'USD',priceBasis:payload.pricingDetails?.basis??(kind==='accommodation'?'per room per night':kind==='experience'||kind==='builderActivity'?'per person':kind==='stayTier'?'per room per night':null),featured:kind==='accommodation'?site.featured.accommodationIds.includes(originalId):kind==='experience'?site.featured.experienceIds.includes(originalId):kind==='package'?site.featured.packageIds.includes(originalId):typeof payload.featured==='boolean'?payload.featured:false,status:'published' as const,displayOrder,payload,sourceHash:hash(payload)};
  }));
  const links:{fromId:string;toId:string;type:string;displayOrder:number}[]=[];const unresolved:any[]=[];
  const aliases:Record<string,string>={'pioneer-lodge':'pioneers-victoria-falls','shearwater-explorers':'shearwater-explorers-village','shearwater-explorers-adventure':'shearwater-explorers-village','vic-falls-safari-lodge-classic':'victoria-falls-safari-lodge','victoria-falls-hotel-suite':'victoria-falls-hotel','victoria-falls-weather-guide':'weather-guide','chobe-day-trip':'chobe-day-safari'};
  const resolve=(kind:ContentKind,key:string)=>records.find(r=>r.kind===kind&&(r.payload.id===key||r.slug===key||r.payload.id===aliases[key]||r.slug===aliases[key]));
  const add=(fromId:string,kind:ContentKind,keys:string[],type:string)=>keys.forEach((key,displayOrder)=>{const to=resolve(kind,key);if(to)links.push({fromId,toId:to.id,type,displayOrder});else unresolved.push({fromId,kind,key,type});});
  const activityLinks={'act-guided-falls':'guided-tour-falls','act-sunset-cruise':'upper-zambezi-sunset-cruise','act-boma-dinner':'boma-dinner-show','act-helicopter':'flight-of-angels','act-chobe-safari':'chobe-day-trip','act-gorge-swing':'gorge-swing'};
  for(const r of records){const p=r.payload;
    if(r.kind==='accommodation'){add(r.id,'experience',p.nearbyExperienceIds,'nearby');add(r.id,'accommodation',p.relatedPropertyIds,'related');}
    if(r.kind==='experience')add(r.id,'experience',p.relatedIds,'related');
    if(r.kind==='package'){add(r.id,'experience',p.includedExperienceIds,'included');add(r.id,'packageStay',p.recommendedHotels.map(h=>p.id+'--'+h.id),'recommended');add(r.id,'package',p.relatedPackageIds,'related');}
    if(r.kind==='packageStay'){const canonical=resolve('accommodation',p.originalId)??records.find(a=>a.kind==='accommodation'&&a.title.toLowerCase().replace(/^the /,'')===p.name.toLowerCase().replace(/^the /,''));if(canonical)links.push({fromId:r.id,toId:canonical.id,type:'property',displayOrder:0});}
    if(r.kind==='guide')add(r.id,'guide',p.relatedGuides.map(g=>g.slug),'related');
    if(r.kind==='builderActivity'&&activityLinks[p.id])add(r.id,'experience',[activityLinks[p.id]],'catalogue');
  }
  add('site:shared','accommodation',site.featured.accommodationIds,'featured');add('site:shared','experience',site.featured.experienceIds,'featured');add('site:shared','package',site.featured.packageIds,'featured');
  const media=records.flatMap(r=>{const p=r.payload;const urls=p.images??[p.heroImage??p.featuredImage??p.heroImageUrl??p.imageUrl,...(p.galleryImages??[])].filter(Boolean).map((url,i)=>({url,alt:p.heroImageAlt??r.title,caption:null,displayOrder:i,role:i===0?'hero':'gallery'}));return urls.map((m,i)=>({id:r.id+':image:'+i,contentId:r.id,url:m.url,alt:m.alt,caption:m.caption,displayOrder:i,role:m.role}));});
  return {records,links,unresolved,media};
}
