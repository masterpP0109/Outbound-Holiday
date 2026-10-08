import { createHash,randomBytes,randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { db } from './db';
import { EnquirySchema,NewsletterSchema,IdempotencySchema } from '../shared/submission-schema';
import { validatePayload } from '../shared/content-schema';
import { HttpError } from './security';
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export const consentVersion='travel-club-2026-10';
export async function selectTrip(tx:Prisma.TransactionClient,trip:Prisma.JsonObject){
 const wanted:[string,string][]=[];
 if(trip.accommodationId)wanted.push(['accommodation',String(trip.accommodationId)]);
 if(trip.packageId)wanted.push(['package',String(trip.packageId)]);
 if(trip.stayTierId)wanted.push(['stayTier',String(trip.stayTierId)]);
 for(const id of (trip.activityIds??[]) as string[])wanted.push(['builderActivity',id]);
 for(const id of (trip.experienceIds??[]) as string[])wanted.push(['experience',id]);
 const selected:{id:string;kind:string;title:string;startingPrice:number|null;currency:string;priceBasis:string|null;payload:Prisma.JsonValue}[]=[];
 for(const [kind,id] of wanted){const record=await tx.content.findFirst({where:{kind:kind as any,status:'published',OR:[{id:kind+':'+id},{slug:id}]}});if(!record)throw new HttpError(422,'A selected item is no longer available. Please refresh your selections.');validatePayload(kind,record.payload);selected.push({id,kind,title:record.title,startingPrice:record.startingPrice?.toNumber()??null,currency:record.currency,priceBasis:record.priceBasis,payload:record.payload});}
 const tier=selected.find(s=>s.kind==='stayTier');const stay=selected.find(s=>s.kind==='accommodation');const adults=Number(trip.adults??1),children=Number(trip.children??0),nights=Number(trip.nights??1);
 const minimum=Math.round((stay?.startingPrice??tier?.startingPrice??0)*nights*Math.ceil((adults+children)/2)+selected.filter(s=>s.kind==='builderActivity').reduce((sum,s)=>sum+(s.startingPrice??0)*(adults+children*0.8),0)+(trip.transportType==='private-transfers'?120:trip.transportType==='shared-shuttle'?60:0));
 return {items:selected,estimate:{minimumUSD:minimum,maximumUSD:Math.round(minimum*1.18),estimated:true,assumptions:'Two guests per room; child activities estimated at 80% of adult rates; supplier rates, room allocation, age restrictions and availability require confirmation. Extra requested catalogue experiences are quoted separately from builder selections.'}};
}
async function subscription(tx:Prisma.TransactionClient,email:string){
 await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))','subscription:'+email);
 const prior=await tx.subscription.findUnique({where:{email}});if(prior&&prior.status!=='unsubscribed')return prior;
 const token=randomBytes(32).toString('hex');const tokenHash=createHash('sha256').update(token).digest('hex');
 const data={status:'pending',consentAt:new Date(),consentVersion,tokenHash,confirmedAt:null,unsubscribedAt:null};
 const saved=await tx.subscription.upsert({where:{email},create:{email,...data},update:data});
 await tx.notification.create({data:{dedupeKey:'doi:'+saved.id+':'+tokenHash,subscriptionId:saved.id,kind:'newsletter-doi',payload:{email,token,redirectUrl:(process.env.APP_URL??'http://localhost:3000')+'/newsletter-confirmed'}}});
 return saved;
}
export async function saveEnquiry(raw:unknown,key:unknown){
 const input=EnquirySchema.parse(raw);const idempotencyKey=IdempotencySchema.parse(key);
 const data={name:input.name,email:input.email,phone:input.phone,message:input.message,source:input.source,trip:input.trip,marketingConsent:input.marketingConsent};
 const requestHash=hash(data);const fingerprint=requestHash;
 return db.$transaction(async tx=>{
  await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))','submission-key:'+idempotencyKey);
  await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))',fingerprint);
  const used=await tx.submissionKey.findUnique({where:{key:idempotencyKey}});
  if(used){if(used.hash!==requestHash)throw new HttpError(409,'This retry key was used for different details. Please start a new submission.');return used.result;}
  const recent=await tx.enquiry.findFirst({where:{fingerprint,createdAt:{gte:new Date(Date.now()-600000)}}});
  if(recent){const result={reference:recent.reference,saved:true,notificationStatus:'queued'};await tx.submissionKey.create({data:{key:idempotencyKey,hash:requestHash,result}});return result;}
  const selectionSnapshot=await selectTrip(tx,input.trip as Prisma.JsonObject);
  const reference='OH-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+randomUUID().slice(0,8).toUpperCase();
  const saved=await tx.enquiry.create({data:{reference,idempotencyKey,requestHash,fingerprint,...data,selectionSnapshot:selectionSnapshot as Prisma.InputJsonValue}});
  const payload={...data,reference,selectionSnapshot,phone:input.phone??''};
  await tx.notification.createMany({data:['team-enquiry','customer-acknowledgement'].map(kind=>({dedupeKey:kind+':'+saved.id,enquiryId:saved.id,kind,payload:payload as Prisma.InputJsonValue}))});
  if(input.marketingConsent)await subscription(tx,input.email);
  const result={reference,saved:true,notificationStatus:'queued'};await tx.submissionKey.create({data:{key:idempotencyKey,hash:requestHash,result}});return result;
 },{timeout:15000});
}
export async function saveNewsletter(raw:unknown,key:unknown){
 const input=NewsletterSchema.parse(raw);const requestHash=hash({email:input.email,marketingConsent:true});const idempotencyKey=IdempotencySchema.parse(key);
 return db.$transaction(async tx=>{
  await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))',input.email);
  const used=await tx.submissionKey.findUnique({where:{key:idempotencyKey}});if(used){if(used.hash!==requestHash)throw new HttpError(409,'Retry key conflicts with another submission.');return used.result;}
  const sub=await subscription(tx,input.email);const result={saved:true,status:sub.status==='subscribed'?'subscribed':'pending-confirmation',confirmationDelivery:process.env.NEWSLETTER_PROVIDER==='disabled'||!process.env.NEWSLETTER_PROVIDER?'awaiting-configuration':'queued'};await tx.submissionKey.create({data:{key:idempotencyKey,hash:requestHash,result}});return result;
 });
}
export async function unsubscribe(token:string){
 if(!/^[a-f0-9]{64}$/.test(token))throw new HttpError(400,'Invalid unsubscribe link.');
 const tokenHash=createHash('sha256').update(token).digest('hex');
 return db.$transaction(async tx=>{const sub=await tx.subscription.findUnique({where:{tokenHash}});if(!sub)throw new HttpError(404,'Unsubscribe link was not found.');if(sub.status==='unsubscribed')return {unsubscribed:true};
 await tx.subscription.update({where:{id:sub.id},data:{status:'unsubscribed',unsubscribedAt:new Date()}});
 await tx.notification.updateMany({where:{subscriptionId:sub.id,kind:'newsletter-doi',status:{in:['pending','failed']}},data:{status:'cancelled'}});
 await tx.notification.create({data:{dedupeKey:'unsubscribe:'+sub.id+':'+sub.tokenHash,subscriptionId:sub.id,kind:'newsletter-unsubscribe',payload:{email:sub.email}}});return {unsubscribed:true};});
}

export async function confirmSubscription(token:string){
 if(!/^[a-f0-9]{64}$/.test(token))throw new HttpError(400,'Invalid confirmation link.');
 const tokenHash=createHash('sha256').update(token).digest('hex');
 const sub=await db.subscription.findUnique({where:{tokenHash}});if(!sub)throw new HttpError(404,'Confirmation link was not found.');
 if(sub.status==='unsubscribed')throw new HttpError(409,'This request has been unsubscribed. Submit a new request to join again.');
 await db.subscription.updateMany({where:{id:sub.id,status:'pending',tokenHash},data:{status:'subscribed',confirmedAt:new Date()}});return {confirmed:true};
}
