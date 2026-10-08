export const API_BASE_URL=(import.meta.env?.VITE_API_BASE_URL??'/api/v1').replace(/\/$/,'');
import { SnapshotSchema } from '../../shared/content-schema';
import type { ContentSnapshot } from '../../shared/content-schema';
let cached:ContentSnapshot|undefined;let cachedAt=0;let inFlight:Promise<ContentSnapshot>|undefined;let etag:string|undefined;
export async function fetchContent(force=false):Promise<ContentSnapshot>{
 if(!force&&cached&&Date.now()-cachedAt<60000)return cached;if(inFlight)return inFlight;
 inFlight=(async()=>{const response=await fetch(API_BASE_URL+'/content',{headers:etag?{'If-None-Match':etag}:{},signal:AbortSignal.timeout(75000)});if(response.status===304&&cached){cachedAt=Date.now();return cached;}if(!response.ok)throw new Error('Holiday content is temporarily unavailable. Please retry.');cached=SnapshotSchema.parse(await response.json());cachedAt=Date.now();etag=response.headers.get('ETag')??undefined;return cached;})();
 try{return await inFlight;}finally{inFlight=undefined;}
}
export function readInitialContent():ContentSnapshot|undefined{const element=document.getElementById('outbound-content');if(!element)return;return SnapshotSchema.parse(JSON.parse(element.textContent??'null'));}
export async function submitForm(path:'enquiries'|'newsletter',payload:unknown,key:string){
 const response=await fetch(API_BASE_URL+'/'+path,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(payload),signal:AbortSignal.timeout(75000)});
 const result=await response.json();if(!response.ok){const error=new Error(result.error??'Unable to save. Please retry.') as Error & {fields?:Record<string,string>};error.fields=result.fields;throw error;}if(!result.saved)throw new Error('Saving was not confirmed. Please retry.');return result as {saved:boolean;reference?:string;status?:string;confirmationDelivery?:string};
}
