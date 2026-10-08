import 'dotenv/config';
import { createApp } from './app';
import { db } from './db';
import { assertDatabaseConfiguration } from './config';
assertDatabaseConfiguration();
const port=Number(process.env.PORT??3002);
const server=createApp().listen(port,'0.0.0.0',()=>console.log('Outbound API listening on port '+port));
let stopping=false;
async function shutdown(){if(stopping)return;stopping=true;server.close(async()=>{await db.$disconnect();process.exit(0);});const deadline=setTimeout(()=>{process.exit(1);},25000);deadline.unref();}
process.on('SIGTERM',()=>{void shutdown();});process.on('SIGINT',()=>{void shutdown();});
