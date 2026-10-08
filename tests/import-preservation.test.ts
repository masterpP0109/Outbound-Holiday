import { test } from 'node:test';import assert from 'node:assert/strict';import { spawn } from 'node:child_process';import { db } from '../server/db';
test('routine import preserves an existing editorial edit',async()=>{
 if(!['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL!).hostname))throw new Error('Isolated local database required.');
 const record=await db.content.findFirstOrThrow({where:{kind:'accommodation'}}),edited=record.title+' (reviewed edit)';
 try{await db.content.update({where:{id:record.id},data:{title:edited}});
  await new Promise<void>((resolve,reject)=>{const child=spawn(process.execPath,['node_modules/tsx/dist/cli.mjs','prisma/seed.ts'],{stdio:'ignore'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('Insert-only import failed.')));});
  assert.equal((await db.content.findUniqueOrThrow({where:{id:record.id}})).title,edited);
 }finally{await db.content.update({where:{id:record.id},data:{title:record.title}});await db.$disconnect();}
});
