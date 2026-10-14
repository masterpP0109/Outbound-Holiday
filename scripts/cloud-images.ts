import { db } from '../server/db';
import { mkdir, writeFile } from 'node:fs/promises';
import mapping from '../prisma/fixtures/cloud-images.json';
import { replaceImageUrls } from '../shared/cloud-images';
import { validatePayload, validateGuideBlocks } from '../shared/content-schema';
const apply = process.argv.includes('--apply');
try {
  // Verify anonymous public reads before publishing any URLs.
  const pending = [...new Set(Object.values(mapping))];
  await Promise.all(Array.from({length: 6}, async () => {
    while (pending.length) {
      const url = pending.pop()!;
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
      if (!response.ok || !response.headers.get('content-type')?.includes('image/webp')) throw new Error('Missing verified WebP: ' + url);
    }
  }));
  const records = await db.content.findMany({ include: { images: true } });
  const changes = records.map(record => {
    const payload = replaceImageUrls(record.payload, mapping);
    const validated = validatePayload(record.kind, payload);
    if (record.kind === 'guide') validateGuideBlocks(validated as Parameters<typeof validateGuideBlocks>[0]);
    return { record, payload, changed: JSON.stringify(payload) !== JSON.stringify(record.payload) || record.images.some(image => image.url in mapping) };
  }).filter(item => item.changed);
  await mkdir('.local',{recursive:true});
  if (apply) {
    await writeFile('.local/content-before-cloud-images.json', JSON.stringify(records,null,2));
    await db.$transaction(async tx => {
      const proposed = changes.map(({record,payload}) => ({id:record.id,payload,updatedAt:record.updatedAt.toISOString()}));
      const count = await tx.$executeRaw`WITH proposed AS (SELECT * FROM jsonb_to_recordset(${JSON.stringify(proposed)}::jsonb) AS p(id text, payload jsonb, "updatedAt" timestamp)) UPDATE "Content" AS c SET payload=p.payload, "updatedAt"=CURRENT_TIMESTAMP FROM proposed p WHERE c.id=p.id AND c."updatedAt"=p."updatedAt"`;
      if (count !== changes.length) throw new Error('Content was edited during migration. Nothing was committed.');
      await tx.$executeRaw`UPDATE "Media" AS m SET url=p.value FROM jsonb_each_text(${JSON.stringify(mapping)}::jsonb) AS p WHERE m.url=p.key`;
    }, { timeout: 60000 });
  }
  const report = { applied: apply, mappedPaths: Object.keys(mapping).length, uniqueCloudImages: new Set(Object.values(mapping)).size, updatedRecords: changes.map(item => item.record.id) };
  await writeFile('docs/cloud-image-migration.json', JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} finally { await db.$disconnect(); }
