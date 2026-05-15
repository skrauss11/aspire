import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const footerLine = "Outputs are educational measurements at your current assumptions, not investment advice. Past rates are not guarantees of future results.";
const shippedPages = [
  "index.html",
  "join.html",
  "manifesto.html",
  "score/index.html",
  "simulator/index.html",
  "account/index.html",
  "privacy/index.html",
  "terms/index.html"
];
const noTrackingPages = [
  "index.html",
  "simulator/index.html"
];

let failures = 0;

for (const file of shippedPages) {
  const html = read(file);
  if (!html.includes(footerLine)) fail(`${file}: missing canonical footer compliance line`);
}

for (const file of noTrackingPages) {
  const html = read(file);
  if (/googletagmanager|google-analytics|gtag\(|fbq\(|snaptr\(|ttq\(|analytics\.js/i.test(html)) {
    fail(`${file}: third-party tracking pixel/script found`);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`Compliance checks passed for ${shippedPages.length} shipped surfaces.`);
}

function read(file) {
  return readFileSync(resolve(root, file), "utf8");
}

function fail(message) {
  failures += 1;
  console.error(message);
}
