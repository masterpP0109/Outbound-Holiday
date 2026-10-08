// One-time migration. Never rerun extraction against published database edits.
import fs from 'node:fs/promises';import path from 'node:path';import ts from 'typescript';
const file='prisma/fixtures/editorial.json',editorial=JSON.parse(await fs.readFile(file,'utf8'));let total=0;
async function walk(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()&&e.name!=='art')out.push(...await walk(p));else if(p.endsWith('.tsx'))out.push(p);}return out;}
for(const filename of await walk('src/components/travel')){
 const source=await fs.readFile(filename,'utf8'),sf=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[];let count=0;
 const prefix=filename.replaceAll('\\','/').replace('src/components/','').replace('.tsx','');
 function human(s){return s.length>30&&/[a-z] [a-z]/i.test(s)&&!/(?:https?:|\/|className|bg-|text-|rounded-|grid-|flex-|padding:)/.test(s);}
 function visit(n){
  if(ts.isImportDeclaration(n))return;
  if(ts.isJsxAttribute(n)&&n.name.getText(sf)==='className')return;
  if(ts.isCallExpression(n)&&/^(editorial|editorialValue|registerContent|editorialFormat)$/.test(n.expression.getText(sf)))return;
  if(ts.isStringLiteral(n)&&human(n.text)){const key=prefix+'.copy'+(++count);editorial.strings[key]=n.text;edits.push({start:n.getStart(sf),end:n.end,text:'editorialFormat('+JSON.stringify(key)+')'});return;}
  if(ts.isTemplateExpression(n)){
   const chunks=[n.head.text,...n.templateSpans.map(s=>s.literal.text)];
   if(chunks.some(human)){
    const key=prefix+'.copy'+(++count);editorial.strings[key]=chunks.map((s,i)=>s+(i<chunks.length-1?'{{'+i+'}}':'')).join('');
    edits.push({start:n.getStart(sf),end:n.end,text:'editorialFormat('+JSON.stringify(key)+', ['+n.templateSpans.map(s=>s.expression.getText(sf)).join(',')+'])'});return;
   }
  }
  ts.forEachChild(n,visit);
 }visit(sf);
 if(edits.length){let result=source;for(const e of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,e.start)+e.text+result.slice(e.end);let rel=path.relative(path.dirname(filename),'src/runtime/catalog').replaceAll('\\','/');if(!rel.startsWith('.'))rel='./'+rel;result='import { editorialFormat } from '+JSON.stringify(rel)+';\n'+result;await fs.writeFile(filename,result);total+=count;}
}
await fs.writeFile(file,JSON.stringify(editorial,null,2)+'\n');console.log('Moved '+total+' additional editorial sentences and templates.');
