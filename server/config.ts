export function assertDatabaseConfiguration(){
 for(const name of ['DATABASE_URL','DIRECT_URL']){const value=process.env[name];if(!value)throw new Error('Missing '+name);const url=new URL(value);if(!['postgres:','postgresql:'].includes(url.protocol))throw new Error('Expected PostgreSQL URL for '+name);if(!['localhost','127.0.0.1','::1'].includes(url.hostname)&&url.searchParams.get('sslmode')!=='require')throw new Error('Hosted PostgreSQL requires sslmode=require for '+name);}
 if(process.env.NODE_ENV==='production'&&!process.env.APP_URL)throw new Error('APP_URL must identify the production frontend origin.');
}
