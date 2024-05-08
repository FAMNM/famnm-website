import { defineConfig } from "astro/config";
import { astroImageTools } from "astro-imagetools";
import react from "@astrojs/react";
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [astroImageTools, react()],
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
});