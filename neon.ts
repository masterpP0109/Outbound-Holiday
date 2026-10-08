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
      api: { name: "api", source: "./hello.ts" },
    },
  },
});
