import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRequire = createRequire(path.join(process.cwd(), "package.json"));
const { build } = projectRequire("esbuild");
const testDir = path.dirname(fileURLToPath(import.meta.url));
const componentPath = path
  .resolve(testDir, "../src/components/newwed/FamTourCard.tsx")
  .replaceAll("\\", "/");
const catalogPath = path
  .resolve(testDir, "../src/lib/famtours.ts")
  .replaceAll("\\", "/");

async function renderCard() {
  const buildDir = await mkdtemp(path.join(tmpdir(), "famtour-card-"));
  const outfile = path.join(buildDir, "card.cjs");

  await build({
    stdin: {
      contents: `
        import React from "react";
        import { renderToStaticMarkup } from "react-dom/server";
        import { FamTourCard } from "${componentPath}";
        import { FAMTOUR_EDITIONS } from "${catalogPath}";

        export const html = renderToStaticMarkup(
          React.createElement(FamTourCard, {
            famtour: FAMTOUR_EDITIONS[1],
            onLearnMore: () => {},
            onRegister: () => {},
          }),
        );
      `,
      loader: "tsx",
      resolveDir: process.cwd(),
    },
    bundle: true,
    format: "cjs",
    jsx: "automatic",
    loader: { ".jpg": "dataurl", ".webp": "dataurl" },
    nodePaths: [path.join(process.cwd(), "node_modules")],
    platform: "node",
    outfile,
  });

  try {
    return projectRequire(outfile).html;
  } finally {
    await rm(buildDir, { recursive: true, force: true });
  }
}

test("renders airfare, vacancies and the approved price hierarchy", async () => {
  const html = await renderCard();
  const normalized = html.replaceAll("\u00a0", " ");

  assert.match(normalized, /AÉREO INCLUSO/);
  assert.match(normalized, /18 VAGAS/);
  assert.match(normalized, /12x de R\$ 583,08/);
  assert.match(normalized, /R\$ 6\.997,00 à vista/);
  assert.doesNotMatch(normalized, /10X|CONSULTE TAXAS|PRÉ-INSCRIÇÃO/);
});

test("renders separate learn-more and registration actions", async () => {
  const html = await renderCard();

  assert.match(html, />SABER MAIS</);
  assert.match(html, />FAZER INSCRIÇÃO</);
  assert.equal((html.match(/<button/g) ?? []).length, 2);
});
