import { spawn } from 'node:child_process';
const base = 'https://br-icy-darkness-b4agzqde-api.compute.c-6.us-east-2.aws.neon.tech/api/v1';
const isReview = process.env.VERCEL_ENV === 'preview'
  || process.env.VERCEL_GIT_COMMIT_REF === 'staging'
  || process.argv.includes('--review');
const env = isReview
  ? { ...process.env, VITE_REVIEW_BUILD: 'true', VITE_API_BASE_URL: '/api/v1', PRERENDER_API_BASE_URL: '' }
  : { ...process.env, VITE_REVIEW_BUILD: 'false', VITE_API_BASE_URL: base, PRERENDER_API_BASE_URL: base };
async function run(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env, stdio: 'inherit', windowsHide: true });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error('Cloud frontend build failed: ' + code)));
  });
}
await run(['node_modules/vite/bin/vite.js','build']);
await run(['--import','tsx','scripts/prerender.tsx']);
