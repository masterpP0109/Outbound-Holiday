import assert from 'node:assert/strict';
import { SnapshotSchema } from '../shared/content-schema';
import { writeFile } from 'node:fs/promises';
const base = 'https://br-icy-darkness-b4agzqde-api.compute.c-6.us-east-2.aws.neon.tech';
const response = await fetch(base + '/api/v1/content', { headers: { origin: 'https://outbound-holiday.vercel.app' } });
assert.equal(response.status, 200);
assert.equal(response.headers.get('access-control-allow-origin'), 'https://outbound-holiday.vercel.app');
const snapshot = SnapshotSchema.parse(await response.json());
const localImages: string[] = [];
const cloudImages = new Set<string>();
function scan(value: unknown) {
  if (typeof value === 'string') {
    if (/^\/(Experiences|galleryImg|heroImg|AmFungai|convertedImages|logo|images)\//.test(value)) localImages.push(value);
    if (value.includes('.storage.') && value.endsWith('.webp')) cloudImages.add(value);
  } else if (value && typeof value === 'object') Object.values(value).forEach(scan);
}
scan(snapshot);
assert.deepEqual(localImages, []);
for (const path of ['/ready','/api/v1/accommodation','/api/v1/experiences','/api/v1/packages','/api/v1/guides','/api/v1/gallery','/api/v1/site']) assert.equal((await fetch(base + path)).status,200,path);
assert.equal((await fetch(base + '/api/v1/content', { headers: { 'If-None-Match': response.headers.get('etag')! } })).status,304);
assert.equal((await fetch(base + '/api/v1/content', { headers: { origin: 'https://invalid.example' } })).status,403);
assert.equal((await fetch(base + '/api/v1/enquiries', { method:'POST', headers:{origin:'https://outbound-holiday.vercel.app','content-type':'application/json'},body:'{}' })).status,422);
const report = { verifiedAt: new Date().toISOString(), api: base + '/api/v1', counts: { accommodations:snapshot.accommodations.length,experiences:snapshot.experiences.length,packages:snapshot.packages.length,guides:snapshot.guides.length,galleryImages:snapshot.albums.flatMap(a=>a.images).length }, uniqueCloudImages:cloudImages.size, localImageReferences:localImages.length, checks:['Published schema validation','All catalogue endpoints','Database readiness','Allowed/rejected CORS origins','ETag revalidation','Invalid enquiry rejected without saving'] };
await writeFile('docs/cloud-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
