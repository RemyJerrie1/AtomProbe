// 量測 dist/ 的資產大小(raw + gzip),仿 react-vocal 的 metrics:size。
// 先 `npm run build`,再 `npm run metrics:size`。
import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const DIR = "dist";
const kb = (n) => (n / 1024).toFixed(1).padStart(8) + " KB";

function walk(d) {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]
  );
}

let raw = 0;
let gz = 0;
const rows = [];
for (const f of walk(DIR)) {
  const buf = readFileSync(f);
  const g = gzipSync(buf).length;
  raw += buf.length;
  gz += g;
  rows.push([buf.length, g, f]);
}
rows.sort((a, b) => b[1] - a[1]);
for (const [r, g, f] of rows) console.log(kb(r), kb(g), f);
console.log("—".repeat(40));
console.log(
  `TOTAL raw ${(raw / 1024 / 1024).toFixed(2)} MB · gzip ${(gz / 1024 / 1024).toFixed(2)} MB`
);
