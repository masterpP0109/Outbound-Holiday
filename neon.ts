import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
  preview: {
    // Upgrade to a paid plan to enable AI Gateway for your project.
    // aiGateway: true,
    buckets: {
      "experiences-imgs": { access: "public_read" },
      "gallery-imgs": { access: "public_read" },
      "where-to-stay": { access: "public_read" },
      "hero-img": { access: "public_read" },
      "am-fungai": { access: "public_read" },
    },
    functions: {
      api: {
        name: "api",
        source: "./.local/neon-api",
        bundler: "none",
        env: {
          NODE_ENV: "production",
          APP_URL: "https://outbound-holiday.vercel.app",
          ALLOWED_ORIGINS: "https://outbound-holiday.vercel.app,http://localhost:3000,http://localhost:3100,http://127.0.0.1:3000",
          API_PUBLIC_BASE_URL: "https://br-icy-darkness-b4agzqde-api.compute.c-6.us-east-2.aws.neon.tech/api/v1",
          EMAIL_PROVIDER: "disabled",
          EMAIL_DELIVERY_MODE: "disabled",
          NEWSLETTER_PROVIDER: "disabled",
          TRUST_PROXY_HOPS: "0",
          CRON_SECRET: process.env.CRON_SECRET!,
        },
      },
    },
  },
});
