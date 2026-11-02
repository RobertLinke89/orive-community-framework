#!/usr/bin/env node
/**
 * Codemod: isDe ? "de" : "en"  →  copy("de", "en")
 * Also ensures `copy` is destructured from useLanguage().
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");
const SKIP = new Set(["hooks/useLanguage.tsx"]);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function transform(source) {
  let next = source;
  const pairRe =
    /isDe\s*\?\s*(`(?:\\`|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*:\s*(`(?:\\`|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  next = next.replace(pairRe, "copy($1, $2)");

  if (next === source) return source;

  // Ensure copy is available from useLanguage()
  if (!/\bcopy\b/.test(next.match(/useLanguage\(\)/)?.[0] || "") && /useLanguage\(\)/.test(next)) {
    next = next.replace(
      /const\s*\{\s*([^}]*)\s*\}\s*=\s*useLanguage\(\)/g,
      (full, inner) => {
        if (/\bcopy\b/.test(inner)) return full;
        const parts = inner
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (!parts.includes("copy")) parts.push("copy");
        return `const { ${parts.join(", ")} } = useLanguage()`;
      }
    );
  }

  // If file uses copy() but only has `const isDe = language === 'de'` without useLanguage destructuring copy
  if (/\bcopy\(/.test(next) && /useLanguage\(\)/.test(next) && !/const\s*\{[^}]*\bcopy\b/.test(next)) {
    next = next.replace(
      /const\s*\{\s*([^}]*)\s*\}\s*=\s*useLanguage\(\)/,
      (full, inner) => {
        if (/\bcopy\b/.test(inner)) return full;
        const parts = inner
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        parts.push("copy");
        return `const { ${parts.join(", ")} } = useLanguage()`;
      }
    );
  }

  return next;
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  const rel = path.relative(ROOT, file);
  if (SKIP.has(rel)) continue;
  const src = fs.readFileSync(file, "utf8");
  if (!/\bisDe\s*\?/.test(src)) continue;
  const out = transform(src);
  if (out !== src) {
    fs.writeFileSync(file, out);
    changed++;
    console.log("updated", rel);
  }
}
console.log("files changed:", changed);
