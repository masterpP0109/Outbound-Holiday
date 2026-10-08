import type { Request,Response } from 'express';
import { createHash } from 'node:crypto';
import { z,ZodError } from 'zod';
import { readSnapshot } from './content';
import { EnquirySchema,NewsletterSchema } from '../shared/submission-schema';
import { saveEnquiry,saveNewsletter,unsubscribe,confirmSubscription } from './submissions';
import { assertOrigin,authenticated,HttpError,rateLimit,spamCheck } from './security';
import { runOutbox,syncPendingSubscribers } from './outbox';
import { syncSubscriber,syncEmailDeliveries } from './providers';
import { db } from './db';
const querySchema=z.object({q:z.string().max(200).optional(),category:z.string().max(100).optional(),tag:z.string().max(100).optional(),sort:z.enum(['recommended','price-asc','price-desc','name']).default('recommended'),page:z.coerce.number().int().min(1).max(10000).default(1),limit:z.coerce.number().int().min(1).max(100).default(24),featured:z.enum(['true','false']).optional(),minPrice:z.coerce.number().nonnegative().optional(),maxPrice:z.coerce.number().nonnegative().optional()}).strict();
export default async function handler(req:Request,res:Response){
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
 try{
  const requestUrl=new URL(req.url??'/','http://local');let path=requestUrl.pathname.replace(/^\/api\/v1\/?/,'');path=path.replace(/^\/+|\/+$/g,'');
  const method=req.method??'GET';
  if(['enquiries','newsletter'].includes(path)){
   if(method!=='POST')throw new HttpError(405,'Method not allowed.');assertOrigin(req);
   if(Buffer.byteLength(JSON.stringify(req.body??{}))>32768)throw new HttpError(413,'Request is too large.');
   const input=path==='enquiries'?EnquirySchema.parse(req.body):NewsletterSchema.parse(req.body);
   await rateLimit(req,'submission');await spamCheck(input);
   const result=path==='enquiries'?await saveEnquiry(input,req.headers['idempotency-key']):await saveNewsletter(input,req.headers['idempotency-key']);return res.status(201).json(result);
  }
  if(['newsletter/unsubscribe','newsletter/confirm'].includes(path)){
   const confirming=path==='newsletter/confirm';
   const token=z.string().regex(/^[a-f0-9]{64}$/).parse(requestUrl.searchParams.get('token')??req.body?.token??req.query?.token);
   if(method==='GET'){res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'");res.setHeader('Referrer-Policy','no-referrer');return res.status(200).send('<!doctype html><html lang="en"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width"><title>'+(confirming?'Confirm subscription':'Unsubscribe')+' | Outbound Holidays</title><body style="font-family:sans-serif;max-width:600px;margin:80px auto;padding:24px"><h1>'+(confirming?'Confirm travel updates':'Unsubscribe from travel updates')+'</h1><p>'+(confirming?'Confirm below to receive travel updates.':'Confirm below to stop marketing emails.')+'</p><form method="post"><input type="hidden" name="token" value="'+token+'"><button type="submit">'+(confirming?'Confirm subscription':'Unsubscribe')+'</button></form></body></html>');}
   if(method!=='POST')throw new HttpError(405,'Method not allowed.');await rateLimit(req,'unsubscribe',20);if(confirming)await confirmSubscription(token);else await unsubscribe(token);return res.status(200).send('<!doctype html><html lang="en"><meta name="robots" content="noindex"><title>Unsubscribed</title><h1>'+(confirming?'Your subscription is confirmed.':'You have been unsubscribed.')+'</h1><p>Your preference has been saved.</p></html>');
  }
  if(path==='webhooks/newsletter'){
   if(method!=='POST')throw new HttpError(405,'Method not allowed.');if(!authenticated(req.headers.authorization,'Bearer '+(process.env.NEWSLETTER_WEBHOOK_SECRET??''))||!process.env.NEWSLETTER_WEBHOOK_SECRET)throw new HttpError(401,'Unauthorized');
   const event=z.object({email:z.string().email()}).passthrough().parse(req.body);await syncSubscriber(event.email);return res.status(200).json({received:true});
  }
  if(path==='cron/outbox'){
   if(!['GET','POST'].includes(method))throw new HttpError(405,'Method not allowed.');if(!process.env.CRON_SECRET||!authenticated(req.headers.authorization,'Bearer '+process.env.CRON_SECRET))throw new HttpError(401,'Unauthorized');
   const result=await runOutbox(5);await syncPendingSubscribers(2);await syncEmailDeliveries(2);await db.rateLimit.deleteMany({where:{expiresAt:{lt:new Date()}}});return res.status(200).json(result);
  }
  const kinds={accommodation:'accommodations',experiences:'experiences',packages:'packages',guides:'guides',gallery:'albums'};
  const [section,slug,extra]=path.split('/');
  if(!['content','site','homepage','categories',...Object.keys(kinds)].includes(section)||extra)throw new HttpError(404,'Endpoint not found.');
  if(method!=='GET')throw new HttpError(405,'Method not allowed.');
  const snapshot=await readSnapshot().catch(()=>{throw new HttpError(503,'Published holiday content is temporarily unavailable. Please retry.');});res.setHeader('Cache-Control','public, max-age=0, s-maxage=60, stale-while-revalidate=60');
  const etag='"'+createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')+'"';res.setHeader('ETag',etag);if(req.headers['if-none-match']===etag)return res.status(304).end();
  if(section==='content')return res.status(200).json(snapshot);
  if(section==='site')return res.status(200).json(snapshot.site);
  if(section==='homepage')return res.status(200).json(snapshot.site.featured);
  if(section==='categories')return res.status(200).json([...new Set(snapshot.experiences.flatMap(e=>e.categories))]);
  let items:any[]=snapshot[kinds[section]];
  if(slug){const item=items.find(i=>i.slug===slug||i.id===slug||(slug==='boma-dinner'&&i.id==='boma-dinner-show'));if(!item)throw new HttpError(404,'Content not found.');return res.status(200).json(item);}
  const params=Object.fromEntries(requestUrl.searchParams);const query=querySchema.parse(params);
  const price=(i:any)=>i.priceFromUSD??i.priceAmount??i.priceUSD??0;
  const featured=section==='accommodation'?snapshot.site.featured.accommodationIds:section==='experiences'?snapshot.site.featured.experienceIds:section==='packages'?snapshot.site.featured.packageIds:[];
  items=items.filter(i=>(!query.q||JSON.stringify([i.name,i.title,i.shortDescription,i.description,i.location]).toLowerCase().includes(query.q.toLowerCase()))&&(!query.category||i.category===query.category||i.categories?.includes(query.category))&&(!query.tag||i.filterTags?.includes(query.tag))&&(!query.featured||(query.featured==='true')===(featured.includes(i.id)||i.featured===true))&&(query.minPrice===undefined||price(i)>=query.minPrice)&&(query.maxPrice===undefined||price(i)<=query.maxPrice));
  if(query.sort==='price-asc')items.sort((a,b)=>price(a)-price(b));if(query.sort==='price-desc')items.sort((a,b)=>price(b)-price(a));if(query.sort==='name')items.sort((a,b)=>(a.name??a.title).localeCompare(b.name??b.title));
  return res.status(200).json({items:items.slice((query.page-1)*query.limit,query.page*query.limit),total:items.length,page:query.page,limit:query.limit});
 }catch(error){
  if(error instanceof ZodError)return res.status(422).json({error:'Please check the supplied fields.',fields:Object.fromEntries(error.issues.map(i=>[i.path.join('.'),i.message]))});
  if(error instanceof HttpError)return res.status(error.status).json({error:error.message,fields:error.fields});
  console.error('Backend request failed',error instanceof Error?error.name:'unknown');return res.status(503).json({error:'Our service is temporarily unavailable. Your inputs have been kept. Please retry.'});
 }
}
