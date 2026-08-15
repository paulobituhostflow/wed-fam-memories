import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRequire = createRequire(path.join(process.cwd(), "package.json"));
const { build } = projectRequire("esbuild");
const testDir = path.dirname(fileURLToPath(import.meta.url));
const componentPath = path
  .resolve(testDir, "../src/components/newwed/Parceiros.tsx")
  .replaceAll("\\", "/");

async function renderPartners() {
  const buildDir = await mkdtemp(path.join(tmpdir(), "partners-section-"));
  const outfile = path.join(buildDir, "partners-render.cjs");

  await build({
    stdin: {
      contents: `
        import React from "react";
        import { renderToStaticMarkup } from "react-dom/server";
        import { ParceirosLogos } from "${componentPath}";

        export const html = renderToStaticMarkup(
          React.createElement(ParceirosLogos),
        );
      `,
      loader: "tsx",
      resolveDir: process.cwd(),
    },
    bundle: true,
    format: "cjs",
    jsx: "automatic",
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

function imageAttributes(html) {
  return [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => ({
    alt: tag.match(/\balt="([^"]+)"/)?.[1],
    src: tag.match(/\bsrc="([^"]+)"/)?.[1],
  }));
}

async function pngDimensions(filePath) {
  const buffer = await readFile(filePath);

  assert.equal(buffer.toString("ascii", 1, 4), "PNG");

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test("renders the four official partner logos in the approved order", async () => {
  const html = await renderPartners();

  assert.deepEqual(imageAttributes(html), [
    { alt: "Azul", src: "/azul- branca.webp" },
    { alt: "Casar.com", src: "/casar-logo-white.svg" },
    { alt: "Assessoria VIP", src: "/assessoria-vip-white.png" },
    { alt: "Empetur", src: "/empetur - Branca.webp" },
  ]);
});

test("renders a compact single-row logo ticker", async () => {
  const html = await renderPartners();

  assert.match(html, /<section[^>]+aria-label="Marcas e Parceiros"/);
  assert.match(html, />MARCAS E PARCEIROS</);
  assert.match(html, /role="list"/);
  assert.equal((html.match(/role="listitem"/g) ?? []).length, 4);
  assert.match(html, /style="[^"]*padding:28px 24px/);
  assert.match(html, /style="[^"]*display:flex[^"]*flex-wrap:nowrap/);
  assert.match(html, /style="[^"]*overflow-x:auto/);
  assert.doesNotMatch(html, /marcas-parceiros-composicao-compacta\.png/);
});

test("uses a clean strip of the approved background texture", async () => {
  const html = await renderPartners();

  assert.match(
    html,
    /background-image:url\(\/marcas-parceiros-fundo-faixa\.png\)/,
  );

  const dimensions = await pngDimensions(
    path.resolve(testDir, "../public/marcas-parceiros-fundo-faixa.png"),
  );

  assert.deepEqual(dimensions, { width: 1740, height: 200 });
});
