import { test } from 'node:test';import assert from 'node:assert/strict';import { createApp } from '../server/app';import { db } from '../server/db';
test('Express health, versioned routes, CORS and JSON limits',async()=>{
 const server=createApp().listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const address=server.address() as {port:number},base='http://127.0.0.1:'+address.port;
 try{
  assert.equal((await fetch(base+'/health')).status,200);assert.equal((await fetch(base+'/ready')).status,200);
  const content=await fetch(base+'/api/v1/content',{headers:{origin:'http://localhost:3100'}});assert.equal(content.status,200);assert.equal(content.headers.get('access-control-allow-origin'),'http://localhost:3100');assert.ok((await content.json()).accommodations.length);
  assert.equal((await fetch(base+'/api/v1/content',{headers:{origin:'https://invalid.example'}})).status,403);
  assert.equal((await fetch(base+'/api/content')).status,404);
  const post=(body:string)=>fetch(base+'/api/v1/enquiries',{method:'POST',headers:{origin:'http://localhost:3100','content-type':'application/json'},body});assert.equal((await post('{bad')).status,400);assert.equal((await post(JSON.stringify({message:'x'.repeat(40000)}))).status,413);
  assert.equal((await fetch(base+'/api/v1/enquiries',{method:'OPTIONS',headers:{origin:'http://localhost:3100','access-control-request-method':'POST','access-control-request-headers':'idempotency-key,content-type'}})).status,204);
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await db.$disconnect();}
});
