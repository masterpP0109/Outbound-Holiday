import { randomUUID } from 'node:crypto';
import type { Notification } from '@prisma/client';
import { db } from './db';
import { deliverNotification,syncSubscriber } from './providers';
export async function runOutbox(limit=10,deliver=deliverNotification,eligibleIds?:string[]){
 await db.notification.updateMany({where:{status:"processing",attempts:{gte:8},leaseUntil:{lt:new Date()}},data:{status:"dead",leaseToken:null,leaseUntil:null,lastError:"Worker lease expired on final attempt; operator review required."}});
 const token=randomUUID();const jobs=await db.$queryRawUnsafe<Notification[]>(
  "UPDATE \"Notification\" SET \"status\"='processing',\"attempts\"=\"attempts\"+1,\"leaseUntil\"=NOW()+INTERVAL '3 minutes',\"leaseToken\"=$1 WHERE \"id\" IN (SELECT \"id\" FROM \"Notification\" WHERE ((\"status\" IN ('pending','failed') AND \"nextAttemptAt\"<=NOW()) OR (\"status\"='processing' AND \"leaseUntil\"<NOW())) AND \"attempts\"<8 AND ($3::jsonb IS NULL OR \"id\" IN (SELECT jsonb_array_elements_text($3::jsonb))) ORDER BY \"createdAt\" LIMIT $2 FOR UPDATE SKIP LOCKED) RETURNING *",token,limit,eligibleIds?JSON.stringify(eligibleIds):null);
 const result={claimed:jobs.length,sent:0,failed:0};
 for(const job of jobs){try{const providerId=await deliver(job);await db.notification.updateMany({where:{id:job.id,leaseToken:token},data:{status:providerId==='cancelled'?'cancelled':'sent',providerId,sentAt:new Date(),leaseUntil:null,leaseToken:null,lastError:null}});result.sent++;}catch(error){await db.notification.updateMany({where:{id:job.id,leaseToken:token},data:{status:job.attempts>=8?'dead':'failed',nextAttemptAt:new Date(Date.now()+Math.min(3600000,60000*2**job.attempts)),leaseUntil:null,leaseToken:null,lastError:error instanceof Error?error.message.slice(0,500):'Delivery failed'}});result.failed++;}}
 return result;
}
export async function syncPendingSubscribers(limit=5){if(!process.env.BREVO_API_KEY)return;const pending=await db.subscription.findMany({where:{status:'pending'},orderBy:{updatedAt:'asc'},take:limit});for(const sub of pending){try{await syncSubscriber(sub.email);await db.subscription.update({where:{id:sub.id},data:{updatedAt:new Date()}});}catch{ /* Next authenticated cron retries provider reads. */ }}}
