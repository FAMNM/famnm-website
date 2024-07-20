import { defineConfig, squooshImageService } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  image: {
    service: squooshImageService(),
  }
});