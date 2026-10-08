import { createHash,timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { db } from './db';
export class HttpError extends Error { constructor(public status:number,message:string,public fields?:Record<string,string>){super(message);} }
export function authenticated(actual:string|undefined,expected:string|undefined){if(!actual||!expected)return false;const a=Buffer.from(actual),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b);}
export function assertOrigin(req:Request){
 const origin=req.headers.origin;if(!origin)throw new HttpError(403,'A same-site request is required.');
 const allowed=[process.env.APP_URL,...(process.env.ALLOWED_ORIGINS??'').split(',')].filter(Boolean);
 if(process.env.NODE_ENV!=='production')allowed.push('http://localhost:3000','http://127.0.0.1:3000','http://localhost:3100');
 if(!allowed.includes(origin))throw new HttpError(403,'Origin is not allowed.');
 if(!String(req.headers['content-type']??'').toLowerCase().startsWith('application/json'))throw new HttpError(415,'Use application/json.');
}
export async function rateLimit(req:Request,scope:string,limit=8){
 const ip=req.ip??req.socket.remoteAddress??'local';
 const bucket=Math.floor(Date.now()/600000);const key=createHash('sha256').update(scope+':'+ip+':'+bucket).digest('hex');
 const result=await db.rateLimit.upsert({where:{key},create:{key,count:1,expiresAt:new Date((bucket+1)*600000)},update:{count:{increment:1}}});
 if(result.count>limit)throw new HttpError(429,'Too many requests. Please try again in ten minutes.');
}
export async function spamCheck(input:{website:string;startedAt:number;turnstileToken?:string}){
 if(input.website||Date.now()-input.startedAt<1500||Date.now()-input.startedAt>86400000)throw new HttpError(422,'Please reload the form and try again.');
 if(process.env.TURNSTILE_SECRET_KEY){
  if(!input.turnstileToken)throw new HttpError(422,'Please complete the spam check.');
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:input.turnstileToken}),signal:AbortSignal.timeout(8000)});
  const result=await response.json();if(!response.ok||!result.success||result.action!=='submission')throw new HttpError(422,'Spam check failed. Please try again.');
  const expected=new URL(process.env.APP_URL??'http://localhost:3000').hostname;if(result.hostname!==expected&&!(process.env.ALLOWED_ORIGINS??'').split(',').some(o=>{try{return new URL(o).hostname===result.hostname;}catch{return false;}}))throw new HttpError(422,'Spam check hostname failed.');
 }
}
