import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import handler from './handler';
import { db } from './db';
export function createApp(){
 const app=express();app.disable('x-powered-by');
 // Render's own reverse proxy is one trusted hop; never trust arbitrary forwarded addresses.
 app.set('trust proxy',Number(process.env.TRUST_PROXY_HOPS??1));
 const origins=[process.env.APP_URL,...(process.env.ALLOWED_ORIGINS??'').split(',')].filter(Boolean) as string[];
 if(process.env.NODE_ENV!=='production')origins.push('http://localhost:3000','http://127.0.0.1:3000','http://localhost:3100');
 app.use(helmet({contentSecurityPolicy:false}));
 app.use(cors({origin(origin,callback){if(!origin||origins.includes(origin))callback(null,true);else callback(Object.assign(new Error('Origin is not allowed.'),{status:403}));},methods:['GET','POST','OPTIONS'],allowedHeaders:['Content-Type','Idempotency-Key','Authorization','If-None-Match'],exposedHeaders:['ETag','Retry-After'],maxAge:600}));
 app.use(express.json({limit:'32kb',strict:true}));app.use('/api/v1/newsletter',express.urlencoded({limit:'8kb',extended:false}));
 app.get('/health',(_req,res)=>res.json({status:'ok',service:'outbound-api'}));
 app.get('/ready',async(_req,res)=>{try{await db.$queryRawUnsafe('SELECT 1');res.json({status:'ready'});}catch{res.status(503).json({error:'Database is unavailable.'});}});
 app.use('/api/v1',async(req,res)=>{await handler(req,res);});
 app.use((_req,res)=>res.status(404).json({error:'Endpoint not found.'}));
 app.use((error:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{const status=error.type==='entity.too.large'?413:error instanceof SyntaxError?400:error.status??500;res.status(status).json({error:status===413?'Request is too large.':status===400?'Malformed JSON request.':status===403?'Origin is not allowed.':'Service temporarily unavailable.'});});
 return app;
}
