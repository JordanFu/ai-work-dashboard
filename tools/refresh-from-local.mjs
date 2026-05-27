import fs from "node:fs";
import path from "node:path";

const publicRoot = path.resolve(process.cwd());
const sourceRoot = path.resolve(publicRoot, "../ai-work-dashboard");

const today = new Date().toISOString().slice(0, 10);

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function sanitizeHtml(html) {
  return html
    .replace(/path:"\/Users\/[^"]*"/g, 'path:"内部路径已隐藏"')
    .replace(/数据来源：([^。]+)。更新：\d{4}-\d{2}-\d{2}。/, `数据来源：$1。更新：${today}。`);
}

function assertPublicSafe(file, text) {
  const forbidden = [
    /\/Users\//,
    /ANYSEARCH_API_KEY/i,
    /api[_-]?key/i,
    /password/i,
    /token/i,
    /secret/i,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(text)) {
      throw new Error(`Public safety check failed for ${file}: ${pattern}`);
    }
  }
}

const files = [
  {
    source: path.join(sourceRoot, "index.html"),
    target: path.join(publicRoot, "index.html"),
    transform: sanitizeHtml,
  },
  {
    source: path.join(sourceRoot, "intelligence/org-levels/2026-05-12.html"),
    target: path.join(publicRoot, "intelligence/org-levels/2026-05-12.html"),
    transform: (text) => text,
  },
];

for (const file of files) {
  const text = file.transform(read(file.source));
  assertPublicSafe(path.relative(publicRoot, file.target), text);
  write(file.target, text);
}

console.log(`Refreshed public dashboard at ${today}`);

