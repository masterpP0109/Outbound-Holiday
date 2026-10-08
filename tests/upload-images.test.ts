import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const script = resolve('scripts/upload-webp.ts');
const tsx = resolve('node_modules/tsx/dist/cli.mjs');
function fixture() {
 const cwd = mkdtempSync(join(tmpdir(), 'outbound-images-'));
 mkdirSync(join(cwd, 'images'));
 const data = Buffer.alloc(24); data.write('RIFF'); data.writeUInt32LE(16,4); data.write('WEBP',8); data.write('VP8 ',12);
 writeFileSync(join(cwd, 'images', 'tour.webp'), data);
 writeFileSync(join(cwd, 'images', 'original.jpg'), 'ignored');
 return cwd;
}
function run(cwd: string, extra: string[] = []) {
 return spawnSync(process.execPath, [tsx, script, '--bucket', 'experiences-imgs', '--dir', 'images', ...extra], { cwd, encoding: 'utf8', env: { ...process.env, AWS_ENDPOINT_URL_S3: 'https://storage-test.neon.tech', AWS_REGION: 'us-east-2', AWS_ACCESS_KEY_ID: '', AWS_SECRET_ACCESS_KEY: '' } });
}
test('WebP dry run creates stable immutable URLs and performs no authenticated upload', () => {
 const cwd=fixture();
 try {
  const first=run(cwd,['--prefix','tours']); assert.equal(first.status,0,first.stderr);
  const manifest=JSON.parse(readFileSync(join(cwd,'.local/webp-uploads-experiences-imgs.json'),'utf8'));
  assert.equal(manifest.applied,false); assert.equal(manifest.files.length,1);
  assert.match(manifest.files[0].url,/\/experiences-imgs\/tours\/tour-[a-f0-9]{16}\.webp$/);
  assert.equal(run(cwd,['--prefix','tours']).status,0);
  assert.equal(JSON.parse(readFileSync(join(cwd,'.local/webp-uploads-experiences-imgs.json'),'utf8')).files[0].key,manifest.files[0].key);
  assert.notEqual(run(cwd,['--apply']).status,0);
 } finally { rmSync(cwd,{recursive:true,force:true}); }
});
test('Uploader rejects corrupted WebP and traversal prefixes before writing objects', () => {
 const cwd=fixture();
 try {
  assert.notEqual(run(cwd,['--prefix','../other']).status,0);
  writeFileSync(join(cwd,'images/tour.webp'),'not a WebP');
  assert.notEqual(run(cwd).status,0);
 } finally { rmSync(cwd,{recursive:true,force:true}); }
});

test('Apply uploads verify metadata and skip matching objects using a mocked S3 transport', () => {
 const cwd=fixture();
 try {
  const awsUrl=pathToFileURL(createRequire(import.meta.url).resolve('@aws-sdk/client-s3')).href;
  const scriptUrl=pathToFileURL(script).href;
  const wrapper=join(cwd,'mock-upload.mjs');
  const source=[
   "import { S3Client } from " + JSON.stringify(awsUrl) + ";",
   "import assert from 'node:assert/strict';",
   "import { writeFileSync } from 'node:fs';",
   "const objects=new Map(); let puts=0;",
   "S3Client.prototype.send=async function(command) { const input=command.input; if(command.constructor.name==='PutObjectCommand') { assert.equal(input.ContentType,'image/webp'); assert.match(input.CacheControl,/immutable/); puts++;objects.set(input.Key,{Metadata:input.Metadata,ContentLength:input.Body.length});return {}; } const existing=objects.get(input.Key);if(existing)return existing;throw Object.assign(new Error('Missing'),{$metadata:{httpStatusCode:404}}); };",
   "process.argv=['node','upload','--bucket','experiences-imgs','--dir','images','--apply'];",
   "await import("+JSON.stringify(scriptUrl + '?first')+");",
   "await import("+JSON.stringify(scriptUrl + '?second')+");",
   "assert.equal(puts,1);writeFileSync('mock-result.json',JSON.stringify({puts}));"
  ].join('\n');
  writeFileSync(wrapper,source);
  const result=spawnSync(process.execPath,[tsx,wrapper],{cwd,encoding:'utf8',env:{...process.env,AWS_ENDPOINT_URL_S3:'https://storage-test.neon.tech',AWS_REGION:'us-east-2',AWS_ACCESS_KEY_ID:'mock',AWS_SECRET_ACCESS_KEY:'mock'}});
  assert.equal(result.status,0,result.stderr);
  assert.equal(JSON.parse(readFileSync(join(cwd,'mock-result.json'),'utf8')).puts,1);
  assert.equal(JSON.parse(readFileSync(join(cwd,'.local/webp-uploads-experiences-imgs.json'),'utf8')).files[0].status,'already-uploaded');
 } finally { rmSync(cwd,{recursive:true,force:true}); }
});
