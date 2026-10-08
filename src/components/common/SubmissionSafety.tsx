import React,{useEffect,useRef,useState} from 'react';
import { submitForm } from '../../runtime/api';
export function useSubmission(path:'enquiries'|'newsletter'){
 const [pending,setPending]=useState(false);const [error,setError]=useState('');const [fields,setFields]=useState<Record<string,string>>({});const [result,setResult]=useState<{reference?:string;status?:string;confirmationDelivery?:string}|null>(null);
 const [website,setWebsite]=useState('');const [token,setToken]=useState('');const started=useRef(Date.now());const retry=useRef<{payload:string;key:string}>();const locked=useRef(false);
 const save=async(payload:Record<string,unknown>)=>{
  if(locked.current)return null;locked.current=true;setPending(true);setError('');setFields({});
  const signature=JSON.stringify(payload);if(retry.current?.payload!==signature)retry.current={payload:signature,key:crypto.randomUUID()};
  try{const saved=await submitForm(path,{...payload,website,startedAt:started.current,turnstileToken:token||undefined},retry.current.key);setResult(saved);return saved;}catch(e){setError(e instanceof Error?e.message:'Could not save. Your inputs have been kept; please retry.');setFields((e as any)?.fields??{});return null;}finally{locked.current=false;setPending(false);}
 };
 return {pending,error,fields,result,website,setWebsite,token,setToken,save};
}
export function SubmissionSafety({submission,marketingConsent,onConsent,requireConsent=false}:{submission:ReturnType<typeof useSubmission>;marketingConsent:boolean;onConsent:(value:boolean)=>void;requireConsent?:boolean}){
 const widget=useRef<HTMLDivElement>(null);
 const key=import.meta.env?.VITE_TURNSTILE_SITE_KEY;
 const setToken=submission.setToken;
 useEffect(()=>{
  if(!key)return;let id:string|undefined;let cancelled=false;
  const render=()=>{if(cancelled||!widget.current)return;const turnstile=(window as any).turnstile;if(turnstile)id=turnstile.render(widget.current,{sitekey:key,action:'submission',callback:setToken,'expired-callback':()=>setToken('')});};
  let script=document.querySelector<HTMLScriptElement>('script[data-outbound-turnstile]');if(!script){script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.dataset.outboundTurnstile='true';script.async=true;document.head.append(script);}if((window as any).turnstile)render();else script.addEventListener('load',render);
  return()=>{cancelled=true;script?.removeEventListener('load',render);if(id)(window as any).turnstile?.remove(id);};
 },[key,setToken]);
 useEffect(()=>{if(submission.error&&widget.current)(window as any).turnstile?.reset(widget.current);},[submission.error]);
 return <div className="space-y-3 text-xs">
  <div aria-hidden="true" className="absolute -left-[10000px]"><label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={submission.website} onChange={e=>submission.setWebsite(e.target.value)}/></label></div>
  <label className="flex items-start gap-2"><input type="checkbox" required={requireConsent} checked={marketingConsent} onChange={e=>onConsent(e.target.checked)}/><span>I agree to receive Outbound Holidays travel updates by email. I can unsubscribe at any time. {requireConsent?'':'This is optional and separate from my enquiry.'}</span></label>
  {key&&<div ref={widget}/>}
  {submission.pending&&<p role="status">Saving securely…</p>}
  {submission.error&&<div role="alert"><p>{submission.error}</p>{Object.entries(submission.fields).map(([field,message])=><p key={field}>{field}: {message}</p>)}<p>Your inputs have been kept. Retry when ready.</p></div>}
 </div>;
}
