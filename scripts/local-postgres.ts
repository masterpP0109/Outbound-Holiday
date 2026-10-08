import { spawn } from 'node:child_process';
import EmbeddedPostgres from 'embedded-postgres';
import { access,mkdir,writeFile } from 'node:fs/promises';
const pg=new EmbeddedPostgres({databaseDir:'.local/postgres',user:'outbound',password:'local-development-only',port:55432,persistent:true,postgresFlags:['-h','127.0.0.1'],onLog:console.log,onError:console.error});
let initialized=true;try{await access('.local/postgres/PG_VERSION');}catch{initialized=false;}
if(!initialized)await pg.initialise();
let stop=()=>pg.stop();
if(process.platform==='win32'){
 const {pg_ctl}=await import('@embedded-postgres/windows-x64');const run=(file:string,args:string[],_options?:unknown)=>new Promise<void>((resolve,reject)=>{const child=spawn(file,args,{windowsHide:true,stdio:'ignore'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('PostgreSQL controller exited with '+code)));});
 try{await run(pg_ctl,['-D','.local/postgres','status']);}catch{await run(pg_ctl,['-D','.local/postgres','-l','.local/postgres/server.log','-o','-p 55432 -h 127.0.0.1','-w','start']);}
 stop=async()=>{await run(pg_ctl,['-D','.local/postgres','-m','fast','-w','stop'],{windowsHide:true});};
}else await pg.start();
const client=pg.getPgClient('postgres','127.0.0.1');await client.connect();const databases=await client.query("SELECT datname FROM pg_database WHERE datname='outbound_utf8'");await client.end();if(!databases.rows.length){const create=pg.getPgClient('postgres','127.0.0.1');await create.connect();await create.query("CREATE DATABASE outbound_utf8 WITH ENCODING 'UTF8' TEMPLATE template0 LC_COLLATE 'C' LC_CTYPE 'C'");await create.end();}
await mkdir('.local',{recursive:true});await writeFile('.local/postgres-ready','ready');console.log('Local PostgreSQL ready on 127.0.0.1:55432. Keep this terminal running.');
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{void stop().then(()=>process.exit(0));});
setInterval(()=>{},60000);
