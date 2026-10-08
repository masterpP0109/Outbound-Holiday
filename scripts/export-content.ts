import { writeFile } from 'node:fs/promises';
import { db } from '../server/db';
try{const content=await db.content.findMany({include:{images:true,outgoing:true}});await writeFile(process.argv[2]??'.local/content-export.json',JSON.stringify(content,null,2));console.log('Exported public content only.');}finally{await db.$disconnect();}
