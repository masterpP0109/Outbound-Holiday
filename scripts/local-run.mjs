import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';
import { createServer, createConnection } from 'node:net';
const root=fileURLToPath(new URL('../',import.meta.url));
const nodeFile=relative=>fileURLToPath(new URL('../'+relative,import.meta.url));
const database='postgresql://outbound:local-development-only@127.0.0.1:55432/outbound_utf8?schema=public';
const mode=process.argv[2]??'dev';
async function listening(port){return new Promise(resolve=>{const socket=createConnection({port,host:'127.0.0.1'});let done=false;const finish=result=>{if(done)return;done=true;socket.destroy();resolve(result);};socket.once('connect',()=>finish(true));socket.once('error',()=>finish(false));socket.setTimeout(500,()=>finish(false));});}
async function available(port){if(await listening(port))return false;return new Promise(resolve=>{const server=createServer();server.once('error',()=>resolve(false));server.listen(port,'0.0.0.0',()=>server.close(()=>resolve(true)));});}
async function choosePort(start,skip=[]){for(let port=start;port<start+50;port++){if(!skip.includes(port)&&await available(port))return port;}throw new Error('No free development port found.');}
const isDev=['dev','network'].includes(mode);
const apiPort=isDev?await choosePort(3002):3002;
const webPort=mode==='network'?await choosePort(3000,[apiPort]):3100;
const hosts=new Set(['localhost','127.0.0.1',...Object.values(networkInterfaces()).flat().filter(address=>address?.family==='IPv4').map(address=>address.address)]);
const origins=[...hosts].flatMap(host=>[webPort,3000,3100].map(port=>'http://'+host+':'+port));
const env={...process.env,DATABASE_URL:database,DIRECT_URL:database,NODE_ENV:'development',PORT:String(apiPort),LOCAL_API_PORT:String(apiPort),APP_URL:'http://localhost:'+webPort,ALLOWED_ORIGINS:[...new Set(origins)].join(','),VITE_API_BASE_URL:'/api/v1',PRERENDER_API_BASE_URL:'http://localhost:'+apiPort+'/api/v1',EMAIL_PROVIDER:'disabled',EMAIL_DELIVERY_MODE:'disabled',NEWSLETTER_PROVIDER:'disabled',TURNSTILE_SECRET_KEY:'',VITE_TURNSTILE_SITE_KEY:'',ALLOW_REMOTE_BACKEND_TESTS:'false'};
const tsx=nodeFile('node_modules/tsx/dist/cli.mjs');
const commands={api:[tsx,'watch','server/index.ts'],web:[nodeFile('node_modules/vite/bin/vite.js'),'--port',String(webPort),'--strictPort','--host','0.0.0.0'],db:[tsx,'scripts/local-postgres.ts'],migrate:[nodeFile('node_modules/prisma/build/index.js'),'migrate','deploy'],seed:[tsx,'prisma/seed.ts'],test:[tsx,'--test','tests/backend.test.ts','tests/http.test.ts','tests/import-preservation.test.ts','tests/upload-images.test.ts'],browser:['scripts/browser-smoke.mjs'],build:[nodeFile('node_modules/vite/bin/vite.js'),'build']};
if(!isDev&&!commands[mode])throw new Error('Unknown local command');
const children=[];let stopping=false;
function stop(){if(stopping)return;stopping=true;for(const child of children)child.kill('SIGTERM');}
function run(command){const child=spawn(process.execPath,command,{cwd:root,env,stdio:'inherit',windowsHide:true});children.push(child);child.on('error',error=>{console.error(error.message);process.exitCode=1;stop();});child.on('exit',code=>{if(code&&!stopping){process.exitCode=code;stop();}});return child;}
async function once(command){await new Promise((resolve,reject)=>{const child=run(command);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('Local setup command failed')));});}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
if(isDev){
 if(!await listening(55432)){run(commands.db);let ready=false;for(let attempt=0;attempt<60;attempt++){if(await listening(55432)){ready=true;break;}await new Promise(resolve=>setTimeout(resolve,500));}if(!ready)throw new Error('Local PostgreSQL did not start.');}
 await once(commands.migrate);await once(commands.seed);
 console.log('Local website: http://localhost:'+webPort+'; API: http://localhost:'+apiPort+'; database: 127.0.0.1:55432');
 run(commands.api);run(commands.web);
}else run(commands[mode]);
