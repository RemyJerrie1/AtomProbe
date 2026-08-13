import { readFile } from "node:fs/promises";

const files = {
  app: await readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
  main: await readFile(new URL("../src/main.tsx", import.meta.url), "utf8"),
  tokens: await readFile(new URL("../src/design-system/tokens.css", import.meta.url), "utf8"),
};

const checks = [
  [
    "tokens load before component styles",
    files.main.indexOf("tokens.css") < files.main.indexOf("primitives.css"),
  ],
  [
    "semantic color tokens exist",
    ["--color-canvas", "--color-surface", "--color-accent", "--color-success-surface"].every(
      (token) => files.tokens.includes(token)
    ),
  ],
  [
    "shared primitives are used",
    ["ActionButton", "StatusBadge", "Surface"].every((name) => files.app.includes(name)),
  ],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failed.length) process.exitCode = 1;
