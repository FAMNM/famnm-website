import type { ImageMetadata } from "astro";

const importCache = import.meta.glob("./**/*.{jpg,jpeg,png,webp,svg}");

export function importImage(
  imageUrl: string,
): Promise<{ default: ImageMetadata }> {
  const func = importCache['./' + imageUrl];
  if (func === undefined) {
    console.info(Object.keys(importCache));
    throw new Error(`Can't find an image with URL ${imageUrl}`);
  }
  return func() as Promise<{ default: ImageMetadata }>;
}
