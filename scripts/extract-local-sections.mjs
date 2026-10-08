import fs from 'node:fs/promises';import path from 'node:path';import ts from 'typescript';
const fixture=JSON.parse(await fs.readFile('prisma/fixtures/editorial.json','utf8'));let count=0;
async function walk(d){let out=[];for(const e of await fs.readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()&&e.name!=='art')out.push(...await walk(p));else if(p.endsWith('.tsx'))out.push(p);}return out;}
for(const file of await walk('src/components')){
 let source=await fs.readFile(file,'utf8');const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const prefix=file.replaceAll(path.sep,'/').replace('src/components/','').replace('.tsx','');const iconNames=new Set();const bindings=new Map();const edits=[];let index=0;
 for(const stmt of sf.statements)if(ts.isImportDeclaration(stmt)&&stmt.moduleSpecifier.text==='lucide-react')for(const e of stmt.importClause?.namedBindings?.elements??[])iconNames.add(e.name.text);
 for(const [key,v]of Object.entries(fixture.structures))if(key.startsWith(prefix+'.'))bindings.set(key.slice(prefix.length+1),v);
 function val(n){
 if(ts.isStringLiteral(n))return n.text;if(ts.isNumericLiteral(n))return Number(n.text);if(n.kind===ts.SyntaxKind.TrueKeyword)return true;if(n.kind===ts.SyntaxKind.FalseKeyword)return false;
 if(ts.isArrayLiteralExpression(n))return n.elements.map(val);
 if(ts.isObjectLiteralExpression(n))return Object.fromEntries(n.properties.map(p=>{if(!ts.isPropertyAssignment(p))throw Error();return [p.name.text,val(p.initializer)];}));
 if(ts.isIdentifier(n)){if(bindings.has(n.text))return bindings.get(n.text);if(iconNames.has(n.text))return {$icon:n.text};}
 if(ts.isAsExpression(n))return val(n.expression);
 if(ts.isCallExpression(n)&&n.expression.getText(sf)==='editorial')return fixture.strings[n.arguments[0].text];
 if(ts.isCallExpression(n)&&n.expression.getText(sf)==='editorialValue')return fixture.structures[n.arguments[0].text];
 throw Error();
 }
 function visit(n){
 if(ts.isArrayLiteralExpression(n)&&n.elements.length&&!(ts.isCallExpression(n.parent)&&n.parent.expression.getText(sf).startsWith('use'))){
 try{const v=val(n);if(JSON.stringify(v).length<30)throw Error();const key=prefix+'.section'+(++index);fixture.structures[key]=v;const icons=[...iconNames].filter(x=>JSON.stringify(v).includes('"$icon":"'+x+'"'));edits.push({start:n.getStart(sf),end:n.end,text:'editorialValue('+JSON.stringify(key)+', {'+icons.join(',')+'})'});count++;return;}catch{/* Dynamic arrays are not migration fixtures. */}}
 ts.forEachChild(n,visit);
 }visit(sf);
 if(edits.length){for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);if(!source.includes('import { editorial')){let rel=path.relative(path.dirname(file),'src/runtime/catalog').replaceAll(path.sep,'/');if(!rel.startsWith('.'))rel='./'+rel;source='import { editorialValue } from '+JSON.stringify(rel)+';\n'+source;}else{source=source.replace(/import { ([^}]+) } from (['"][^'"]+runtime\/catalog['"]);/,(_m,n,p)=>'import { '+[...new Set(n.split(',').map(x=>x.trim()).concat('editorialValue'))].join(', ')+' } from '+p+';');}await fs.writeFile(file,source);}
}
await fs.writeFile('prisma/fixtures/editorial.json',JSON.stringify(fixture,null,2));console.log('Extracted '+count+' remaining inline ordered sections.');
