import { defineConfig } from "astro/config";
import { astroImageTools } from "astro-imagetools";
import react from "@astrojs/react";
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  integrations: [image({
    serviceEntryPoint: "@astrojs/image/sharp"
  }), astroImageTools, react()]
});