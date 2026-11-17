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
  postsUrl?: string;
  searchUrl?: string;
  googleCseId?: string;
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

let cached:ContentSnapshot|undefined;let cachedAt=0;let inFlight:Promise<ContentSnapshot>|undefined;let etag:string|undefined;let lastSnapshotError:string|null=null;
export function getLastSnapshotError():string|null{return lastSnapshotError;}
export function seedInitialContentCache(snapshot:ContentSnapshot, fromServer:boolean):void{
 if(!fromServer)return;
 cached=snapshot;
 cachedAt=Date.now();
}
export async function fetchContent(force=false):Promise<ContentSnapshot>{
 const wpCfg = getWpConfig();
 const isPreview = Boolean(wpCfg?.isPreview);
 if(!force&&!isPreview&&cached&&Date.now()-cachedAt<60000)return cached;if(inFlight)return inFlight;
 const endpoint = wpCfg?.snapshotUrl || (API_BASE_URL + '/content');
 const reqHeaders: Record<string, string> = {};
 if (!isPreview && etag) reqHeaders['If-None-Match'] = etag;
 if (isPreview && wpCfg?.nonce) reqHeaders['X-WP-Nonce'] = wpCfg.nonce;
 inFlight=(async()=>{const response=await fetch(endpoint,{headers:reqHeaders,cache:isPreview?'no-store':'no-cache',signal:AbortSignal.timeout(75000)});if(!isPreview&&response.status===304&&cached){cachedAt=Date.now();return cached;}if(!response.ok)throw new Error(`Holiday content request failed (${response.status}).`);const raw=await response.json();const parsed=SnapshotSchema.safeParse(raw);if(!parsed.success){const msg='Live CMS snapshot validation failed: '+parsed.error.issues.slice(0,3).map(i=>`${i.path.join('.')}: ${i.message}`).join('; ');lastSnapshotError=msg;console.error('[Outbound CMS]',msg,parsed.error);throw new Error(msg);}lastSnapshotError=null;cached=parsed.data;cachedAt=Date.now();if(!isPreview)etag=response.headers.get('ETag')??undefined;return cached;})();
 try{return await inFlight;}finally{inFlight=undefined;}
}
let initialFromServer = false;
export function hasServerInitialContent(): boolean {
 return initialFromServer;
}
export function readInitialContent():ContentSnapshot{
 const element=document.getElementById('outbound-content');
 if(element){try{const parsed=SnapshotSchema.safeParse(JSON.parse(element.textContent??'null'));if(parsed.success){lastSnapshotError=null;initialFromServer=true;return parsed.data;}const msg='Initial WordPress snapshot validation failed: '+parsed.error.issues.slice(0,3).map(i=>`${i.path.join('.')}: ${i.message}`).join('; ');lastSnapshotError=msg;console.error('[Outbound CMS]',msg,parsed.error);}catch(err){const msg='Failed to parse #outbound-content JSON payload.';lastSnapshotError=msg;console.error('[Outbound CMS]',msg,err);}}
 initialFromServer=false;
 return SnapshotSchema.parse(publishedContent);
}
export async function fetchCurrencyRates(): Promise<{
 rates: Record<string, { symbol: string; rate: number }>;
 meta: { mode: 'automatic' | 'manual'; status: 'live' | 'cached' | 'manual' | 'unavailable'; provider: string; effectiveDate?: string | null; fetchedAt?: string | null };
} | null> {
 const wpCfg = getWpConfig();
 const endpoint = wpCfg?.restUrl
  ? `${wpCfg.restUrl.replace(/\/$/, '')}/currency-rates`
  : `${API_BASE_URL}/currency-rates`;
 try {
  const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, cache: 'no-cache', signal: AbortSignal.timeout(10000) });
  if (!response.ok) return null;
  const raw = await response.json();
  if (!raw || typeof raw !== 'object' || !raw.rates || typeof raw.rates !== 'object') return null;
  const rates: Record<string, { symbol: string; rate: number }> = {};
  for (const [code, info] of Object.entries(raw.rates as Record<string, any>)) {
   const upper = code.toUpperCase();
   if (upper === 'ZWL') continue;
   if (info && typeof info.rate === 'number' && Number.isFinite(info.rate) && info.rate > 0) {
    rates[upper] = { symbol: String(info.symbol || upper), rate: upper === 'USD' ? 1 : info.rate };
   }
  }
  if (!rates.USD) rates.USD = { symbol: '$', rate: 1 };
  const status = raw.status === 'live' || raw.status === 'cached' || raw.status === 'manual' ? raw.status : 'unavailable';
  const mode = raw.mode === 'manual' ? 'manual' : 'automatic';
  return {
   rates,
   meta: {
    mode,
    status,
    provider: String(raw.provider || 'Frankfurter API v2'),
    effectiveDate: raw.effectiveDate ? String(raw.effectiveDate) : null,
    fetchedAt: raw.fetchedAt ? String(raw.fetchedAt) : null,
   },
  };
 } catch {
  return null;
 }
}
export async function submitForm(path:'enquiries'|'newsletter',payload:unknown,key:string){
 const wpCfg = getWpConfig();
 const endpoint = wpCfg?.restUrl ? `${wpCfg.restUrl.replace(/\/$/, '')}/${path}` : `${API_BASE_URL}/${path}`;
 const headers: Record<string, string> = {'Content-Type':'application/json','Idempotency-Key':key};
 // Public REST endpoints (/enquiries, /newsletter) use permission_callback=__return_true;
 // omitting X-WP-Nonce prevents 403 rest_cookie_invalid_nonce on cached pages.
 let response:Response;
 try{response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify(payload),signal:AbortSignal.timeout(75000)});}catch{throw new Error('We could not connect right now. Please check your internet connection and try again.');}
 let result:any;
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
