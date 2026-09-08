/**
 * Generates PWA icons (192, 512, apple-touch) from a simple SVG lightning mark.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../public/icons");

// On-brand: dark shell (#16121f) + primary violet bolt (matches theme primary).
const svg = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#16121f"/>
  <path fill="#c084fc" d="M280 96 152 288h104l-32 128 176-224H296l16-96z"/>
</svg>`;

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

await mkdir(iconsDir, { recursive: true });

for (const { name, size } of sizes) {
  const png = await sharp(Buffer.from(svg(size))).png().toBuffer();
  await writeFile(join(iconsDir, name), png);
  console.log(`Wrote public/icons/${name}`);
}
