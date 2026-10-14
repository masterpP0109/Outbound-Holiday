import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
const directory = '.local/neon-api';
await mkdir(directory, { recursive: true });
await build({ entryPoints: ['server/neon.ts'], bundle: true, platform: 'node', target: 'node24', format: 'esm', outfile: directory + '/index.mjs', banner: { js: "import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url'; import { dirname } from 'node:path'; const require = createRequire(import.meta.url); const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename); process.env.PRISMA_QUERY_ENGINE_LIBRARY = fileURLToPath(new URL('./libquery_engine-linux-arm64-openssl-3.0.x.so.node', import.meta.url)); process.env.DIRECT_URL ??= process.env.DATABASE_URL_UNPOOLED;" } });
await copyFile('node_modules/.prisma/client/libquery_engine-linux-arm64-openssl-3.0.x.so.node', directory + '/libquery_engine-linux-arm64-openssl-3.0.x.so.node');
await copyFile('prisma/schema.prisma', directory + '/schema.prisma');
