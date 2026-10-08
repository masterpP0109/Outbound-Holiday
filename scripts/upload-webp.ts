import 'dotenv/config';
import { readdir, readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve, relative, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
const buckets = ['experiences-imgs', 'gallery-imgs', 'where-to-stay', 'hero-img', 'am-fungai'];
const args = process.argv.slice(2);
const value = (name: string) => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
const bucket = value('--bucket');
const directory = value('--dir');
const prefix = value('--prefix') ?? '';
const apply = args.includes('--apply');
for (let i = 0; i < args.length; i++) {
  if (!['--bucket', '--dir', '--prefix', '--apply'].includes(args[i])) throw new Error('Unknown argument: ' + args[i]);
  if (args[i] !== '--apply') { if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Missing argument value'); i++; }
}
if (!bucket || !buckets.includes(bucket) || !directory) throw new Error('Usage: npm run images:upload -- --bucket <bucket> --dir <folder> [--prefix <path>] [--apply]');
if (prefix && !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(prefix)) throw new Error('Prefix must contain safe directory names.');
const base = resolve(directory);
const files: string[] = [];
async function scan(dir: string) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Symbolic links are not allowed: ' + path);
    if (entry.isDirectory()) await scan(path);
    else if (entry.isFile() && extname(entry.name).toLowerCase() === '.webp') files.push(path);
  }
}
await scan(base);
files.sort();
if (!files.length) throw new Error('No WebP files found.');
const endpointValue = process.env.AWS_ENDPOINT_URL_S3;
if (!endpointValue) throw new Error('AWS_ENDPOINT_URL_S3 is missing. Run neon env pull first.');
const endpoint = new URL(endpointValue);
if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.neon.tech') || endpoint.username || endpoint.password || endpoint.search) throw new Error('Expected a secure Neon S3 endpoint.');
const plan: { source: string; key: string; url: string; sha256: string; bytes: number; status: string }[] = [];
for (const file of files) {
  if ((await stat(file)).size > 20 * 1024 * 1024) throw new Error('Image larger than 20 MiB: ' + file);
  const data = await readFile(file);
  if (data.length < 12 || data.length > 20 * 1024 * 1024 || data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WEBP' || data.readUInt32LE(4) + 8 !== data.length) throw new Error('Invalid WebP or larger than 20 MiB: ' + file);
  const hash = createHash('sha256').update(data).digest('hex');
  const source = relative(base, file).replaceAll('\\', '/');
  const segments = source.split('/');
  if (segments.some(segment => segment === '..' || segment === '.' || [...segment].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127))) throw new Error('Invalid image filename: ' + file);
  const name = basename(source, extname(source));
  const key = [prefix, ...segments.slice(0, -1), name + '-' + hash.slice(0, 16) + '.webp'].filter(Boolean).join('/');
  const url = new URL(endpoint.href);
  url.pathname = url.pathname.replace(/\/$/, '') + '/' + bucket + '/' + key.split('/').map(encodeURIComponent).join('/');
  plan.push({ source, key, url: url.href, sha256: hash, bytes: data.length, status: 'planned' });
}
await mkdir('.local', { recursive: true });
const manifest = '.local/webp-uploads-' + bucket + '.json';
const save = () => writeFile(manifest, JSON.stringify({ bucket, directory: base, applied: apply, files: plan }, null, 2) + '\n');
await save();
console.log(plan.length + ' WebP files; manifest: ' + manifest);
if (!apply) { console.log('Dry run complete. Add --apply to upload this folder.'); process.exit(0); }
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) throw new Error('Neon storage credentials are missing. Run neon env pull first.');
const client = new S3Client({ endpoint: endpoint.href, region: process.env.AWS_REGION, forcePathStyle: true, maxAttempts: 3, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY } });
try {
  for (const item of plan) {
    let existing;
    try { existing = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: item.key })); }
    catch (error) { if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode !== 404) throw error; }
    if (existing && (existing.Metadata?.sha256 !== item.sha256 || existing.ContentLength !== item.bytes)) throw new Error('Existing object differs; refusing to overwrite: ' + item.key);
    if (!existing) {
      const body = await readFile(resolve(base, item.source));
      if (createHash('sha256').update(body).digest('hex') !== item.sha256) throw new Error('File changed after planning: ' + item.source);
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: item.key, Body: body, ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable', Metadata: { sha256: item.sha256 } }));
      const check = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: item.key }));
      if (check.ContentLength !== item.bytes || check.Metadata?.sha256 !== item.sha256) throw new Error('Upload verification failed: ' + item.key);
    }
    item.status = existing ? 'already-uploaded' : 'uploaded';
    await save();
    console.log(item.status + ': ' + item.key);
  }
} catch (error) {
  console.error('Upload stopped. Completed objects are recorded in ' + manifest + '. Re-run to resume. Error: ' + (error instanceof Error ? error.name : 'UnknownError'));
  process.exitCode = 1;
} finally { client.destroy(); }
