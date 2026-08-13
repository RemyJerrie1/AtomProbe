import { copyFile, mkdir } from "node:fs/promises";

const source = new URL("../node_modules/@ffmpeg/core/dist/umd/", import.meta.url);
const destination = new URL("../public/vendor/", import.meta.url);

await mkdir(destination, { recursive: true });
await Promise.all(
  ["ffmpeg-core.js", "ffmpeg-core.wasm"].map((file) =>
    copyFile(new URL(file, source), new URL(file, destination))
  )
);
console.log("Synced pinned @ffmpeg/core assets to public/vendor.");
