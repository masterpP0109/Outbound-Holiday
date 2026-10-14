# Cloud backend and images — 9 October 2026

The existing Neon production project little-cherry-82979985, branch br-icy-darkness-b4agzqde, hosts the holiday database and API.

API: https://br-icy-darkness-b4agzqde-api.compute.c-6.us-east-2.aws.neon.tech/api/v1

The api function now runs the existing Express application through server/neon.ts. It serves published catalogue content from Postgres, with descriptions, prices, relationships, media URLs, alt text and captions. Prisma's Linux ARM64 engine is included by scripts/build-neon.mjs. The hello endpoint is superseded.

Uploaded all 161 converted WebP images plus the WebP logo into the existing public-read buckets. 145 distinct published image URLs replace 146 old path variants (the two logo paths share one URL). Existing record information is preserved. Every mapped object passed an anonymous HEAD check for image/webp before publishing. Payload and Media changes committed in one transaction, with optimistic timestamp checks. The original records are backed up in ignored .local/content-before-cloud-images.json.

prisma/fixtures/cloud-images.json stores public URLs only. New content imports apply this mapping so future seeds retain cloud image references. Credentials stay in ignored .env and server-side Neon variables.

npm run dev starts the frontend against the cloud API configured in .env. npm run dev:local retains isolated local development. npm run build:cloud fetches published content from the live API for prerendering. vercel.json uses that build command, so Vercel does not require copying server secrets. The live Vercel frontend still needs a repository redeployment; no Vercel login/project link is available here.

Maintenance:

- npm run build:neon, then neon config plan --env .env, then neon deploy --env .env.
- npm run images:cloud previews an image migration; add -- --apply to commit.
- node --import tsx scripts/verify-cloud.ts verifies the deployed catalogue and public API behavior.

Validation: docs/cloud-verification.json and docs/cloud-image-migration.json record live checks. TypeScript and ESLint pass; focused image tests pass. No real enquiry or subscription was submitted during cloud verification. Email delivery remains disabled as previously configured.

The Neon bridge strips untrusted forwarded headers and retains the existing form rate limits. Because Express receives a loopback request, its IP-based submission quota is shared across callers on this deployment; a trusted edge identity is needed before per-client limits can be enabled. The rejected proposal to change rate-limit identity was reverted. Public catalogue reads are unaffected.
