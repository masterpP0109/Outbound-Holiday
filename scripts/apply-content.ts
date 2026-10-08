import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { ContentKind,PublicationStatus,Prisma } from '@prisma/client';
import { db } from '../server/db';
import { validatePayload } from '../shared/content-schema';
const schema=z.object({id:z.string().min(1),expectedUpdatedAt:z.string().datetime(),title:z.string().min(1),metaTitle:z.string().min(1).nullable().optional(),metaDescription:z.string().min(1).nullable().optional(),status:z.nativeEnum(PublicationStatus),payload:z.unknown(),images:z.array(z.object({id:z.string(),url:z.string().min(1),alt:z.string().min(1),caption:z.string().nullable(),displayOrder:z.number().int(),role:z.string()})),relations:z.array(z.object({toId:z.string(),type:z.string(),displayOrder:z.number().int()}))}).strict();
try{
 const input=schema.parse(JSON.parse(await readFile(process.argv[2],'utf8')));
 await db.$transaction(async tx=>{
  await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))',input.id);
  const prior=await tx.content.findUniqueOrThrow({where:{id:input.id}});
  if(prior.updatedAt.toISOString()!==input.expectedUpdatedAt)throw new Error('Content changed since export. Export again before editing.');
  const payload:any=validatePayload(prior.kind as ContentKind,input.payload);
  if(payload.id&&input.id!==prior.kind+':'+payload.id)throw new Error('Stable identity cannot be changed.');
  const startingPrice=payload.priceFromUSD??payload.priceAmount??payload.priceUSD??payload.pricePerNightUSD??prior.startingPrice;
  await tx.content.update({where:{id:input.id},data:{title:input.title,metaTitle:input.metaTitle,metaDescription:input.metaDescription,status:input.status,startingPrice,payload:payload as Prisma.InputJsonValue}});
  await tx.media.deleteMany({where:{contentId:input.id}});await tx.media.createMany({data:input.images.map(i=>({...i,contentId:input.id}))});
  await tx.contentRelation.deleteMany({where:{fromId:input.id}});await tx.contentRelation.createMany({data:input.relations.map(r=>({...r,fromId:input.id}))});
 });console.log('Validated content change committed. Rebuild the frontend to refresh search-engine pages.');
}finally{await db.$disconnect();}
