export const API_BASE_URL=(import.meta.env?.VITE_API_BASE_URL??'/api/v1').replace(/\/$/,'');
import { SnapshotSchema } from '../../shared/content-schema';
import type { ContentSnapshot } from '../../shared/content-schema';
import publishedContent from './published-content.json';

interface OutboundWpConfig {
  isWordPress?: boolean;
  siteUrl?: string;
  themeUri?: string;
  restUrl?: string;
  snapshotUrl?: string;
  nonce?: string;
  heroFallbackUrl?: string;
  turnstileSiteKey?: string;
  initialRoutePath?: string;
  isPreview?: boolean;
  cmsAdminUrl?: string;
  newsletterResult?: {
    ok?: boolean;
    status?: string;
    message?: string;
  };
}

export function getWpConfig(): OutboundWpConfig | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { __OUTBOUND_WP_CONFIG__?: OutboundWpConfig }).__OUTBOUND_WP_CONFIG__;
}

export function resolveAssetUrl(url: string): string {
  const cfg = getWpConfig();
  if (!cfg || !url || /^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  if (url.startsWith('/') && /5-4\.jpg|hero/i.test(url) && cfg.heroFallbackUrl) {
    return cfg.heroFallbackUrl;
  }
  if (url.startsWith('/') && cfg.themeUri) {
    if (/logo-bronze/i.test(url)) return `${cfg.themeUri.replace(/\/$/, '')}/assets/media/outbound-holidays-logo-bronze.webp`;
    if (/logo-light/i.test(url)) return `${cfg.themeUri.replace(/\/$/, '')}/assets/media/outbound-holidays-logo-light.webp`;
    if (/logo-dark/i.test(url)) return `${cfg.themeUri.replace(/\/$/, '')}/assets/media/outbound-holidays-logo-dark.webp`;
    if (/logo/i.test(url)) return `${cfg.themeUri.replace(/\/$/, '')}/assets/media/outbound-holidays-logo.webp`;
    if (/safari|chobe|elephant/i.test(url)) return `${cfg.themeUri.replace(/\/$/, '')}/assets/media/safari-fallback.webp`;
    if (/family|boma/i.test(url)) return `${cfg.themeUri.replace(/\/$/, '')}/assets/media/family-fallback.webp`;
    if (/honeymoon/i.test(url)) return `${cfg.themeUri.replace(/\/$/, '')}/assets/media/honeymoon-fallback.webp`;
    if (/falls|tour/i.test(url)) return `${cfg.themeUri.replace(/\/$/, '')}/assets/media/falls-fallback.webp`;
    return cfg.heroFallbackUrl || url;
  }
  return url;
}

let cached:ContentSnapshot|undefined;let cachedAt=0;let inFlight:Promise<ContentSnapshot>|undefined;let etag:string|undefined;
export async function fetchContent(force=false):Promise<ContentSnapshot>{
 const wpCfg = getWpConfig();
 const isPreview = Boolean(wpCfg?.isPreview);
 if(!force&&!isPreview&&cached&&Date.now()-cachedAt<60000)return cached;if(inFlight)return inFlight;
 const endpoint = wpCfg?.snapshotUrl || (API_BASE_URL + '/content');
 const reqHeaders: Record<string, string> = {};
 if (!isPreview && etag) reqHeaders['If-None-Match'] = etag;
 if (isPreview && wpCfg?.nonce) reqHeaders['X-WP-Nonce'] = wpCfg.nonce;
 inFlight=(async()=>{const response=await fetch(endpoint,{headers:reqHeaders,signal:AbortSignal.timeout(75000)});if(!isPreview&&response.status===304&&cached){cachedAt=Date.now();return cached;}if(!response.ok)throw new Error('Holiday content is temporarily unavailable. Please retry.');cached=SnapshotSchema.parse(await response.json());cachedAt=Date.now();if(!isPreview)etag=response.headers.get('ETag')??undefined;return cached;})();
 try{return await inFlight;}finally{inFlight=undefined;}
}
export function readInitialContent():ContentSnapshot{
 const element=document.getElementById('outbound-content');
 if(element){try{return SnapshotSchema.parse(JSON.parse(element.textContent??'null'));}catch{ /* Recover using the bundled published snapshot. */ }}
 return SnapshotSchema.parse(publishedContent);
}
export async function submitForm(path:'enquiries'|'newsletter',payload:unknown,key:string){
 const wpCfg = getWpConfig();
 const endpoint = wpCfg?.restUrl ? `${wpCfg.restUrl.replace(/\/$/, '')}/${path}` : `${API_BASE_URL}/${path}`;
 const headers: Record<string, string> = {'Content-Type':'application/json','Idempotency-Key':key};
 // Public REST endpoints (/enquiries, /newsletter) use permission_callback=__return_true;
 // omitting X-WP-Nonce prevents 403 rest_cookie_invalid_nonce on cached pages.
 let response:Response;
 try{response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify(payload),signal:AbortSignal.timeout(75000)});}catch{throw new Error('We could not connect right now. Please check your internet connection and try again.');}
 let result:any=null;
 try{result=await response.json();}catch{result=null;}
 if(!response.ok){
  const isTechnicalCode=typeof result?.code==='string'&&result.code.startsWith('rest_');
  const friendlyFallback='We could not complete your request right now. Please try again in a moment, or message us on WhatsApp.';
  const message=(!isTechnicalCode&&typeof result?.error==='string'&&result.error.trim())
   ?result.error
   :(response.status>=500||response.status===404||isTechnicalCode?friendlyFallback:(typeof result?.message==='string'&&result.message.trim()?result.message:friendlyFallback));
  const error=new Error(message) as Error & {fields?:Record<string,string>};
  error.fields=result?.fields;
  throw error;
 }
 if(!result?.saved)throw new Error('We could not confirm your request was saved. Please try again.');
 return result as {saved:boolean;reference?:string;customerName?:string;submittedAt?:string;status?:string;confirmationDelivery?:string};
}
