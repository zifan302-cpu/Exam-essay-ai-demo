import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const demoDir = join(root, "demo");
const docsDir = join(root, "docs");
const distDir = join(root, "dist");
const distDocsDir = join(distDir, "docs");
const includeDocs = process.env.INCLUDE_DOCS === "1";

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}

mkdirSync(distDir, { recursive: true });

for (const entry of readdirSync(demoDir, { withFileTypes: true })) {
  cpSync(join(demoDir, entry.name), join(distDir, entry.name), {
    recursive: true,
  });
}

if (includeDocs) {
  mkdirSync(distDocsDir, { recursive: true });

  for (const filename of ["business-plan.pdf", "business-plan.md", "product-scope.md"]) {
    const source = join(docsDir, filename);
    if (existsSync(source)) {
      cpSync(source, join(distDocsDir, filename));
    }
  }
}

console.log("Built static Vercel output in dist/");
