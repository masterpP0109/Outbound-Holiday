import { Prisma, ContentKind } from '@prisma/client';
import { db } from './db';
import { SnapshotSchema,validatePayload,validateGuideBlocks } from '../shared/content-schema';
export async function readSnapshot(){
  // One repeatable-read transaction gives browser and prerenderer the same coherent catalogue.
  const records=await db.$transaction(tx=>tx.content.findMany({where:{status:'published'},orderBy:[{displayOrder:'asc'},{id:'asc'}],include:{images:{orderBy:{displayOrder:'asc'}},outgoing:{where:{to:{status:'published'}},orderBy:{displayOrder:'asc'},include:{to:true}}}}),{isolationLevel:Prisma.TransactionIsolationLevel.RepeatableRead});
  const values=(kind:ContentKind)=>records.filter(r=>r.kind===kind).map(r=>{
    const p:any=validatePayload(kind,r.payload);
    const links=(type:string)=>r.outgoing.filter(l=>l.type===type).map(l=>(l.to.payload as any).id??l.to.slug);
    if(kind==='accommodation'){p.nearbyExperienceIds=links('nearby');p.relatedPropertyIds=links('related');}
    if(kind==='experience')p.relatedIds=links('related');
    if(kind==='package'){p.includedExperienceIds=links('included');p.relatedPackageIds=links('related');p.recommendedHotels=r.outgoing.filter(l=>l.type==='recommended').map(l=>{const hotel=validatePayload('packageStay',l.to.payload) as any;const result={...hotel,id:hotel.originalId};delete result.originalId;delete result.packageId;return result;});}
    if(kind==='guide'){validateGuideBlocks(p);p.relatedGuides=p.relatedGuides.filter(g=>r.outgoing.some(l=>l.type==='related'&&(l.to.slug===g.slug||(g.slug==='victoria-falls-weather-guide'&&l.to.slug==='weather-guide'))));}
    if(kind==='album')p.images=r.images.map(({id,url,alt,caption,displayOrder,role})=>({id,url,alt,caption,displayOrder,role}));
    return p;
  });
  const site=values('site')[0];if(!site)throw new Error('Published shared site content is missing. Run the content import.');
  for(const r of records){if(!r.metaTitle||!r.metaDescription)continue;const path=r.kind==='accommodation'?'/accommodation/'+r.slug:r.kind==='experience'?'/things-to-do/'+((r.payload as any).id==='boma-dinner-show'?'boma-dinner':r.slug):r.kind==='package'?'/packages/'+r.slug:r.kind==='guide'?(r.slug==='first-time-visitor-guide'?'/victoria-falls-guide':'/victoria-falls-guide/'+r.slug):null;if(path)site.routeSeo[path]={title:r.metaTitle,description:r.metaDescription};}
  const siteRecord=records.find(r=>r.kind==='site')!;
  for(const [key,kind] of [['accommodationIds','accommodation'],['experienceIds','experience'],['packageIds','package']] as const)site.featured[key]=siteRecord.outgoing.filter(l=>l.type==='featured'&&l.to.kind===kind).map(l=>(l.to.payload as any).id);
  const guides=values('guide');site.guideCategories=site.guideCategories.map(c=>({...c,articles:c.articles.filter(a=>guides.some(g=>g.slug===a.slug))}));
  return SnapshotSchema.parse({version:records.map(r=>r.updatedAt.toISOString()).sort().at(-1)??'empty',accommodations:values('accommodation'),experiences:values('experience'),packages:values('package'),guides,albums:values('album'),builderActivities:values('builderActivity'),stayTiers:values('stayTier'),site});
}
