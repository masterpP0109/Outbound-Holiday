import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
import type { Notification } from '@prisma/client';
import { db } from './db';
export const escapeHtml=(value:unknown)=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const required=(key:string)=>{const v=process.env[key];if(!v)throw new Error('Missing server configuration: '+key);return v;};
function recipient(email:string){const mode=process.env.EMAIL_DELIVERY_MODE??'disabled';if(mode==='test')return required('EMAIL_TEST_TO');if(mode==='live')return email;throw new Error('Email delivery is disabled. Configure a designated test destination before enabling.');}
export async function brevo(path:string,method='GET',body?:unknown){const response=await fetch('https://api.brevo.com/v3/'+path,{method,headers:{'api-key':required('BREVO_API_KEY'),'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(10000)});if(!response.ok){if(response.status===404)return null;throw new Error('Brevo request failed ('+response.status+').');}return response.status===204?{}:response.json();}
export async function deliverNotification(job:Notification){
 const p=job.payload as any;
 if(job.kind==='newsletter-doi'){
  const current=job.subscriptionId?await db.subscription.findUnique({where:{id:job.subscriptionId}}):null;if(!current||current.status!=='pending'||current.tokenHash!==createHash('sha256').update(p.token).digest('hex'))return 'cancelled';
  if((process.env.NEWSLETTER_PROVIDER??'disabled')==='self-hosted'){
   const base=required('API_PUBLIC_BASE_URL').replace(/\/$/,'');
   const confirm=base+'/newsletter/confirm?token='+p.token,unsub=base+'/newsletter/unsubscribe?token='+p.token;
   return sendMail(job,p.email,'Confirm your Outbound Holidays travel updates','Confirm your subscription: '+confirm+'\nUnsubscribe: '+unsub,'<p>Please confirm your request for travel updates.</p><p><a href="'+escapeHtml(confirm)+'">Confirm subscription</a></p><p><a href="'+escapeHtml(unsub)+'">Unsubscribe</a></p>');
  }
  if(process.env.NEWSLETTER_PROVIDER!=='brevo')throw new Error('Newsletter delivery awaits an approved email configuration.');
  const listId=Number(required('BREVO_LIST_ID')),templateId=Number(required('BREVO_DOI_TEMPLATE_ID'));if(!Number.isInteger(listId)||listId<=0||!Number.isInteger(templateId)||templateId<=0)throw new Error('Invalid Brevo list or template ID.');
  await brevo('contacts/doubleOptinConfirmation','POST',{email:recipient(p.email),includeListIds:[listId],templateId,redirectionUrl:p.redirectUrl,attributes:{OUTBOUND_UNSUBSCRIBE_URL:(process.env.APP_URL??'http://localhost:3000')+'/api/newsletter/unsubscribe?token='+p.token}});return 'brevo-doi';
 }
 if(job.kind==='newsletter-unsubscribe'){const current=job.subscriptionId?await db.subscription.findUnique({where:{id:job.subscriptionId}}):null;if(!current||current.status!=='unsubscribed')return 'cancelled';if(process.env.NEWSLETTER_PROVIDER!=='brevo')return 'local-preference-saved';await brevo('contacts/'+encodeURIComponent(recipient(p.email)),'PUT',{emailBlacklisted:true});return 'brevo-unsubscribed';}
 const team=job.kind==='team-enquiry';
 const details=team?JSON.stringify({name:p.name,email:p.email,phone:p.phone,message:p.message,trip:p.trip,selectionSnapshot:p.selectionSnapshot,marketingConsent:p.marketingConsent},null,2):'Thank you, '+p.name+'. Your enquiry has been saved. Our team will review your trip preferences and contact you. Displayed prices are estimates; no booking or availability is confirmed.';
 const subject=(team?'New holiday enquiry ':'Your Outbound Holidays enquiry ')+p.reference;
 const html='<h1>'+escapeHtml(subject)+'</h1><p>Reference: '+escapeHtml(p.reference)+'</p><pre style="white-space:pre-wrap">'+escapeHtml(details)+'</pre>';
 return sendMail(job,team?required('TEAM_ENQUIRY_TO'):p.email,subject,subject+'\n\n'+details,html,team?p.email:required('TEAM_ENQUIRY_TO'));
}
export async function syncSubscriber(email:string){
 if(process.env.NEWSLETTER_PROVIDER!=='brevo')return;
 const sub=await db.subscription.findUnique({where:{email:email.toLowerCase()}});if(!sub)return;
 // Provider events are hints. Verify actual provider state before confirming consent.
 const contact=await brevo('contacts/'+encodeURIComponent(recipient(sub.email)));if(!contact)return;
 const unsubscribed=contact.emailBlacklisted===true;const confirmed=contact.listIds?.includes(Number(required('BREVO_LIST_ID')))&&!unsubscribed;
 if(!unsubscribed&&!confirmed)return;
 if(sub.status==='unsubscribed'&&!unsubscribed)return;
 await db.subscription.update({where:{id:sub.id},data:{status:unsubscribed?'unsubscribed':'subscribed',confirmedAt:confirmed?sub.confirmedAt??new Date():sub.confirmedAt,unsubscribedAt:unsubscribed?sub.unsubscribedAt??new Date():null,providerId:String(contact.id),providerUpdatedAt:new Date()}});
}

export async function syncEmailDeliveries(limit=5){
 if(process.env.EMAIL_PROVIDER!=='resend'||!process.env.RESEND_API_KEY)return;
 const jobs=await db.notification.findMany({where:{status:'sent',kind:{in:['team-enquiry','customer-acknowledgement']},providerId:{not:null}},orderBy:{updatedAt:'asc'},take:limit});
 for(const job of jobs){try{
  const response=await fetch('https://api.resend.com/emails/'+encodeURIComponent(job.providerId!),{headers:{authorization:'Bearer '+process.env.RESEND_API_KEY},signal:AbortSignal.timeout(8000)});
  if(!response.ok)continue;const info=await response.json();const event=String(info.last_event??'sent');
  const failure=['bounced','failed','suppressed','complained','canceled'].includes(event);
  await db.notification.update({where:{id:job.id},data:{status:failure?'delivery-failed':['delivered','opened','clicked'].includes(event)?'delivered':'sent',lastError:failure?'Provider reported '+event:null,updatedAt:new Date()}});
 }catch{/* Next authenticated worker polls again. */}}
}

async function sendMail(job:Notification,to:string,subject:string,text:string,html:string,replyTo?:string){
 const target=recipient(to),provider=process.env.EMAIL_PROVIDER??'disabled';
 if(provider==='smtp'){
  const port=Number(required('SMTP_PORT'));if(![465,587].includes(port))throw new Error('SMTP must use TLS port 465 or STARTTLS port 587.');
  const transport=nodemailer.createTransport({host:required('SMTP_HOST'),port,secure:port===465,requireTLS:port===587,auth:{user:required('SMTP_USER'),pass:required('SMTP_PASSWORD')},tls:{rejectUnauthorized:true},connectionTimeout:10000,socketTimeout:20000});
  try{const info=await transport.sendMail({from:required('EMAIL_FROM'),to:target,replyTo,subject,text,html,messageId:'<'+createHash('sha256').update(job.dedupeKey).digest('hex')+'@'+required('EMAIL_MESSAGE_ID_DOMAIN')+'>'});if(!info.accepted?.length)throw new Error('SMTP did not accept the recipient.');return 'smtp:'+String(info.messageId);}finally{transport.close();}
 }
 if(provider!=='resend')throw new Error('Email delivery awaits an approved provider configuration.');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+required('RESEND_API_KEY'),'content-type':'application/json','Idempotency-Key':job.dedupeKey},body:JSON.stringify({from:required('EMAIL_FROM'),to:[target],subject,html,text,reply_to:replyTo}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Email provider request failed ('+response.status+').');const result=await response.json();if(!result.id)throw new Error('Email provider returned no delivery ID.');return String(result.id);
}
