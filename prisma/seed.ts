import { db } from '../server/db';
import { fixtureRecords,hash } from './import-content';
import { writeFile } from 'node:fs/promises';
import { Prisma } from '@prisma/client';
const update=process.argv.includes('--update');const check=process.argv.includes('--check');
try{
 const fixture=await fixtureRecords();const existing=await db.content.findMany();const byId=new Map(existing.map(r=>[r.id,r]));
 const report={mode:check?'check':update?'explicit update':'insert missing only',counts:Object.fromEntries([...new Set(fixture.records.map(r=>r.kind))].map(k=>[k,fixture.records.filter(r=>r.kind===k).length])),created:[] as string[],skipped:[] as string[],changed:[] as string[],missing:[] as string[],unresolved:fixture.unresolved,relations:fixture.links.length,images:fixture.media.length};
 for(const r of fixture.records){const prior=byId.get(r.id);if(!prior)report.missing.push(r.id);else if(hash(prior.payload)!==r.sourceHash)report.changed.push(r.id);}
 if(!check)await db.$transaction(async tx=>{
  await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))','outbound-content-import');
  const current=await tx.content.findMany();byId.clear();for(const record of current)byId.set(record.id,record);
  for(const r of fixture.records){const prior=byId.get(r.id);if(prior&&!update){report.skipped.push(r.id);continue;}
   const data={...r,payload:r.payload as Prisma.InputJsonValue};await tx.content.upsert({where:{id:r.id},create:data,update:data});await tx.media.deleteMany({where:{contentId:r.id}});await tx.media.createMany({data:fixture.media.filter(m=>m.contentId===r.id)});report.created.push(r.id);
  }
  for(const r of fixture.records){if(byId.has(r.id)&&!update)continue;await tx.contentRelation.deleteMany({where:{fromId:r.id}});await tx.contentRelation.createMany({data:fixture.links.filter(l=>l.fromId===r.id),skipDuplicates:true});}
  await tx.importRun.create({data:{updateExisting:update,report:report as Prisma.InputJsonValue}});
 },{timeout:60000});
 await writeFile('docs/import-reconciliation.json',JSON.stringify(report,null,2));console.log(JSON.stringify({mode:report.mode,counts:report.counts,insertedOrUpdated:report.created.length,preserved:report.skipped.length,changed:report.changed.length,missing:report.missing.length,unresolved:report.unresolved.length,relations:report.relations,images:report.images},null,2));
 if(check&&report.missing.length)process.exitCode=1;
}catch(error){console.error('Content import failed:',error instanceof Error?error.name:'unknown','See the database and validation configuration. No partial content transaction is committed.');process.exitCode=1;}finally{await db.$disconnect();}
