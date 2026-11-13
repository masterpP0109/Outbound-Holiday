/**
 * Export existing published-content.json into an idempotent WordPress Migration Bundle
 * ready for upload into Outbound Holidays -> Content Migration or WP-CLI `wp outbound migrate`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'src', 'runtime', 'published-content.json');
const outDir = path.join(rootDir, 'docs', 'wp-conversion');
const outBundlePath = path.join(outDir, 'outbound-migration-bundle.json');

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

function resolveAccommodationCategoryId(acc: Record<string, unknown>): string {
  const explicit = String(acc.accommodationCategory ?? acc.categoryId ?? '').toLowerCase().trim();
  if (['hotels', 'lodges', 'guest-houses', 'apartments'].includes(explicit)) return explicit;
  const raw = String(acc.category ?? '').toLowerCase().trim();
  if (['boutique hotel', 'hotel', 'resort', 'hotels'].includes(raw)) return 'hotels';
  if (['luxury lodge', 'safari lodge', 'lodge', 'lodges'].includes(raw)) return 'lodges';
  if (['guest lodge', 'guest house', 'guest houses', 'b&b'].includes(raw)) return 'guest-houses';
  if (['self-catering', 'apartment', 'apartments', 'villa'].includes(raw)) return 'apartments';
  return 'guest-houses';
}

const bundle = {
  schemaVersion: '1.0.0',
  exportedAt: new Date().toISOString(),
  sourceFile: 'src/runtime/published-content.json',
  site: raw.site || {},
  stayTiers: raw.stayTiers || [],
  builderActivities: raw.builderActivities || [],
  accommodations: (raw.accommodations || []).map((a: Record<string, unknown>) => ({
    ...a,
    categoryId: resolveAccommodationCategoryId(a),
  })),
  experiences: raw.experiences || [],
  packages: raw.packages || [],
  guides: raw.guides || [],
  clientGalleries: raw.albums || raw.clientGalleries || [],
  metadata: {
    counts: {
      accommodations: (raw.accommodations || []).length,
      experiences: (raw.experiences || []).length,
      packages: (raw.packages || []).length,
      guides: (raw.guides || []).length,
      clientGalleries: (raw.albums || raw.clientGalleries || []).length,
      builderActivities: (raw.builderActivities || []).length,
      stayTiers: (raw.stayTiers || []).length,
    },
  },
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outBundlePath, JSON.stringify(bundle, null, 2), 'utf8');

console.log('Exported WordPress migration bundle:', outBundlePath);
console.log('Counts:', bundle.metadata.counts);
