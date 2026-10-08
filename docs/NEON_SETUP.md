# Neon setup and deployment

Linked project: outbound-holidays (little-cherry-82979985).
Branch: production (br-icy-darkness-b4agzqde).
Region: aws-us-east-2.

Installed the latest global Neon CLI, project-level Neon agent skills, and the requested MCP configuration. Existing valid CLI authentication was used for linking and deployment. Config initialization installed @neon/config and @neon/env.

neon.ts and hello.ts implement the supplied configuration. Neon accepts preview.functions and preview.buckets, while warning that both features are now GA and can be declared at the top level. The requested preview structure is preserved. AI Gateway stays disabled.

Neon Auth is enabled. All five requested buckets exist with public_read access: experiences-imgs, gallery-imgs, where-to-stay, hero-img and am-fungai.

The production api function deployed successfully:
https://br-icy-darkness-b4agzqde-api.compute.c-6.us-east-2.aws.neon.tech/

Live verification returned HTTP 200 and exactly: Hello from Neon Functions.

.env contains server-only Neon connection, Auth and Storage variables pulled by the CLI. DIRECT_URL is synchronized with DATABASE_URL_UNPOOLED for the installed Prisma schema. .env, .neon and the previous local environment backup under .local/env-before-neon-setup are ignored by Git. Never expose DATABASE_URL or AWS_SECRET_ACCESS_KEY via VITE variables. Tests refuse this production database by default; use an isolated local/preview database for automated submission tests.

To inspect or redeploy: neon config plan, then neon deploy. The deployed function is the requested hello endpoint. The full holiday Express API and Vercel frontend use their existing separate deployment configuration; this setup alone does not deploy them, migrate the holiday schema, upload the site images, or wire a frontend login flow.
