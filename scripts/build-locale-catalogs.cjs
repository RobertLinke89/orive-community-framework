#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SOURCES = JSON.parse(fs.readFileSync(path.join(ROOT, "src/i18n/en-sources.json"), "utf8"));
const OUT_DIR = path.join(ROOT, "src/i18n/catalogs");
fs.mkdirSync(OUT_DIR, { recursive: true });

const TARGETS = [
  "bg","cs","da","el","es","et","fi","fr","ga","hr","hu","is",
  "it","lt","lv","mt","nl","no","pl","pt","ro","sk","sl","sv","uk",
];

async function translateOne(text, to) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" +
    encodeURIComponent(to) +
    "&dt=t&q=" +
    encodeURIComponent(text);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 ORIVE-i18n" } });
  if (!res.ok) return text;
  const data = await res.json();
  return Array.isArray(data?.[0]) ? data[0].map((row) => row?.[0] || "").join("") || text : text;
}

async function mapPool(items, concurrency, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return out;
}

async function buildLocale(code) {
  const outPath = path.join(OUT_DIR, `${code}.json`);
  let catalog = {};
  if (fs.existsSync(outPath)) {
    try { catalog = JSON.parse(fs.readFileSync(outPath, "utf8")); } catch { catalog = {}; }
  }
  const missing = SOURCES.filter((en) => !catalog[en]);
  console.log(`${code}: ${SOURCES.length - missing.length} done, ${missing.length} left`);
  if (!missing.length) return;

  const translated = await mapPool(missing, 8, async (en) => {
    if (/^[\d\s.:%/€$£+\-–—]+$/.test(en) || en.length < 2) return en;
    try { return await translateOne(en, code); } catch { return en; }
  });
  missing.forEach((en, idx) => { catalog[en] = translated[idx] || en; });
  fs.writeFileSync(outPath, JSON.stringify(catalog));
  console.log(`✓ ${code} (${Object.keys(catalog).length})`);
}

async function main() {
  const only = process.argv.slice(2);
  const list = only.length ? only : TARGETS;
  // Run 3 locales in parallel
  for (let i = 0; i < list.length; i += 3) {
    await Promise.all(list.slice(i, i + 3).map(buildLocale));
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
