// One-time migration helper; fixtures are committed. Never run this against edited content.
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
const strings = {};
const structures = {};
const inventory = [];
async function walk(dir) { const result=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await walk(p));else if(p.endsWith('.tsx'))result.push(p);}return result; }
for(const filename of await walk('src/components')) {
  if(filename.includes('art'+path.sep))continue;
  let source=await fs.readFile(filename,'utf8');
  const sf=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const keyPrefix=filename.replaceAll(path.sep,'/').replace('src/components/','').replace('.tsx','');
  const edits=[];const imports=new Map();const staticValues=new Map();const staticDeclarations=[];let used=false;let count=0;
  for(const n of sf.statements)if(ts.isImportDeclaration(n)&&n.moduleSpecifier.text==='lucide-react')for(const el of n.importClause?.namedBindings?.elements??[])imports.set(el.name.text,el.name.text);
  function value(n) {
    if(ts.isStringLiteral(n)||ts.isNumericLiteral(n))return ts.isStringLiteral(n)?n.text:Number(n.text);
    if(n.kind===ts.SyntaxKind.TrueKeyword)return true;if(n.kind===ts.SyntaxKind.FalseKeyword)return false;
    if(ts.isArrayLiteralExpression(n))return n.elements.map(value);
    if(ts.isObjectLiteralExpression(n))return Object.fromEntries(n.properties.map(p=>{if(!ts.isPropertyAssignment(p))throw Error('dynamic');return [p.name.text,value(p.initializer)];}));
    if(ts.isIdentifier(n)){if(staticValues.has(n.text))return staticValues.get(n.text);if(imports.has(n.text))return {$icon:n.text};}
    if(ts.isAsExpression(n))return value(n.expression);
    throw Error('dynamic');
  }
  for(const n of sf.statements)if(ts.isVariableStatement(n))for(const d of n.declarationList.declarations){if(!d.initializer)continue;try{const v=value(d.initializer);staticValues.set(d.name.text,v);if(!['ACTIVITIES_DATA','STAY_TIERS','DEFAULT_ANSWERS'].includes(d.name.text))staticDeclarations.push({n,d,v});}catch{/* Dynamic content stays in the component. */}}
  // Static arrays and image constants become structured database sections, including order.
  for(const {n,d,v} of staticDeclarations){
    const key=keyPrefix+'.'+d.name.text;structures[key]=v;
    const iconNames=Array.from(imports.keys()).filter(name=>JSON.stringify(v).includes('"$icon":"'+name+'"'));
    const ty=d.type?d.type.getText(sf):'any';
    const declaration='let '+d.name.text+': '+ty+';\nregisterContent(() => { '+d.name.text+' = editorialValue('+JSON.stringify(key)+', {'+iconNames.join(',')+'}); });';
    edits.push({start:n.getStart(sf),end:n.end,text:declaration});used=true;
  }
  function visit(n){
    if(edits.some(e=>n.getStart(sf)>=e.start&&n.end<=e.end))return;
    let text=null;let wrap=false;
    if(ts.isJsxText(n)&&/[A-Za-z]/.test(n.text)){text=n.text;wrap=true;}
    else if(ts.isStringLiteral(n)){
      const p=n.parent;
      if(ts.isJsxAttribute(p)&&['src','alt','title','placeholder'].includes(p.name.getText(sf))){text=n.text;wrap=true;}
      else if(ts.isPropertyAssignment(p)&&['title','name','description','copy','text','quote','author','role','tagline','desc','label','question','answer','q','a','image','imageUrl','heroImage','shortDesc','whyRecommend','duration','time','caption','alt','content'].includes(p.name.getText(sf)))text=n.text;
      else if(ts.isArrayLiteralExpression(p)&&n.text.length>25&&/s/.test(n.text))text=n.text;
      else if(ts.isReturnStatement(p)&&n.text.length>40)text=n.text;
    }
    if(text!==null){const key=keyPrefix+'.text'+(++count);strings[key]=text;edits.push({start:n.getStart(sf),end:n.end,text:(wrap?'{':'')+'editorial('+JSON.stringify(key)+')'+(wrap?'}':'')});used=true;return;}
    ts.forEachChild(n,visit);
  }
  visit(sf);
  if(used){edits.sort((a,b)=>b.start-a.start);for(const e of edits)source=source.slice(0,e.start)+e.text+source.slice(e.end);let rel=path.relative(path.dirname(filename),'src/runtime/catalog').replaceAll(path.sep,'/');if(!rel.startsWith('.'))rel='./'+rel;source='import { editorial, editorialValue, registerContent } from '+JSON.stringify(rel)+';\n'+source;await fs.writeFile(filename,source);inventory.push({component:filename,strings:count,sections:staticDeclarations.map(e=>e.d.name.text)});}
}
await fs.mkdir('prisma/fixtures',{recursive:true});await fs.writeFile('prisma/fixtures/editorial.json',JSON.stringify({strings,structures},null,2));await fs.mkdir('docs',{recursive:true});await fs.writeFile('docs/editorial-inventory.json',JSON.stringify(inventory,null,2));console.log('Extracted',Object.keys(strings).length,'strings and',Object.keys(structures).length,'ordered editorial sections.');
