# Docker on Render and WebP uploads

## Render API

The Dockerfile builds a Linux Node 22 API image with Prisma, runs as the unprivileged node user, and excludes local secrets and image folders. The startup script validates configuration, runs migrations and an insert-only content import, then starts Express. Existing edited content is preserved. Set MIGRATE_ON_START=false only when migrations/import are handled separately.

Build locally:

```powershell
npm run docker:build
npm run docker:run
# Or use a separate ignored environment file:
npm run docker:run -- .local/docker-test.env
```

The image is outbound-holidays-api:local, built for linux/amd64. The launcher parses dotenv quoting and passes secrets through environment variables, not command arguments. Port is http://localhost:10000. Running with your default .env connects to the linked Neon production database and applies migrations/imports at startup; use an isolated database for testing.

On Render, create a Blueprint from this repository using render.yaml, or select a Web Service with Language Docker, Dockerfile ./Dockerfile, context ., and health check /ready. Leave Docker Command empty to use the image's startup script. Render can build and privately store the image directly from the repository; Docker Hub is optional. See https://render.com/docs/docker.

Configure server-only Render variables:

- DATABASE_URL: Neon production pooled URL, with sslmode=require.
- DIRECT_URL: Neon production direct/unpooled URL, with sslmode=require.
- APP_URL and ALLOWED_ORIGINS: your exact Vercel frontend origin(s).
- API_PUBLIC_BASE_URL: https://YOUR-SERVICE.onrender.com/api/v1.
- NODE_ENV=production and MIGRATE_ON_START=true (already in the Blueprint).

The linked Neon project is little-cherry-82979985, branch production. Copy database URLs from its connection settings or the ignored local environment; keep them out of source and VITE variables. The API needs no storage credentials for public image reads. Email stays disabled until configured. The existing Neon hello function is separate from the full Express API.

After Render deploys, verify /ready and /api/v1/content. Set VITE_API_BASE_URL and PRERENDER_API_BASE_URL on Vercel to the Render /api/v1 URL, then rebuild the frontend. No Render service has been created by this setup; repository connection and Render deployment remain required.

## Upload converted images

Uploads go to the five existing Neon public-read buckets, so files persist independently of Render container replacements. Writes use authenticated local maintenance credentials. No public upload endpoint is exposed.

If storage credentials are missing, run neon env pull for the linked production branch. Keep AWS_ENDPOINT_URL_S3, AWS_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in ignored .env. Never put them in browser variables.

Preview a folder first (no upload):

```powershell
npm run images:upload -- --bucket experiences-imgs --dir "public/convertedImages/Experiences" --prefix experiences
```

After reviewing .local/webp-uploads-experiences-imgs.json, upload:

```powershell
npm run images:upload -- --bucket experiences-imgs --dir "public/convertedImages/Experiences" --prefix experiences --apply
```

Select the folder containing only the intended category. Other valid bucket names are gallery-imgs, where-to-stay, hero-img and am-fungai. The uploader scans nested folders, skips non-WebP files, rejects symlinks and invalid WebP headers/sizes, and caps each image at 20 MiB. Original filenames, including spaces and parentheses, are preserved and safely URL-encoded. Control characters and traversal names are rejected. A content hash gives each version a distinct immutable key. Existing matching objects are skipped; different objects at the same key are refused. Each completed upload is verified and recorded in the ignored manifest; re-running resumes safely. No images were uploaded during setup.

The manifest contains public URLs. Uploading alone does not change website content. Export the relevant record with npm run content:export, update its payload image URLs and corresponding Media entries together, then use npm run content:apply with its expectedUpdatedAt timestamp. Review the API result and rebuild Vercel so prerendered pages use the new images. See BACKEND.md for the complete content editing format.

Uploaded objects have long-lived immutable Cache-Control headers. For heavily used public images, configure a CDN with the production Neon storage endpoint as its origin before publishing at scale. CDN/domain setup is not included here. See https://neon.com/docs/storage/overview.

## Verification on 8 October 2026

Built the linux/amd64 image locally. A fresh disposable PostgreSQL 18 container accepted all four migrations and the 75-record/217-relation/271-media seed. Health, readiness and content returned HTTP 200. Restart preserved all 75 records; image runs as UID 1000 and contains neither .env nor public images. Authenticated storage HEAD succeeded with expected 404 for a planned object. The Experiences folder dry run planned 13 WebP files. Upload writes are tested with a mocked S3 transport; no live files were uploaded.
