import { defineConfig } from "astro/config";
import { astroImageTools } from "astro-imagetools";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [astroImageTools, react()]
});