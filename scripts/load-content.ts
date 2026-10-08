import 'dotenv/config';
import { SnapshotSchema } from '../shared/content-schema';
export async function loadPublishedContent(){
 const base=process.env.PRERENDER_API_BASE_URL??process.env.VITE_API_BASE_URL;
 if(!base)throw new Error('Set PRERENDER_API_BASE_URL or VITE_API_BASE_URL to the Render /api/v1 address.');
 const url=new URL(base);if(!['localhost','127.0.0.1'].includes(url.hostname)&&url.protocol!=='https:')throw new Error('The hosted content API must use HTTPS.');
 const response=await fetch(base.replace(/\/$/,'')+'/content',{signal:AbortSignal.timeout(120000),headers:{'Cache-Control':'no-cache'}});
 if(!response.ok)throw new Error('Content API returned '+response.status+'. Build stopped; existing published deployment stays in place.');
 return SnapshotSchema.parse(await response.json());
}
