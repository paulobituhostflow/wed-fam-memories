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
    alt: tag.match(/\balt="([^"]*)"/)?.[1],
    src: tag.match(/\bsrc="([^"]+)"/)?.[1],
  }));
}

test("renders the four official partner logos in the approved order", async () => {
  const html = await renderPartners();

  assert.deepEqual(imageAttributes(html).filter(({ alt }) => alt), [
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
  assert.match(html, /style="[^"]*padding:20px clamp\(16px, 4vw, 48px\)/);
  assert.match(html, /style="[^"]*display:flex[^"]*flex-wrap:nowrap/);
  assert.match(html, /partners-marquee-track/);
  assert.match(html, /@keyframes partners-marquee/);
  assert.match(html, /prefers-reduced-motion: reduce/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /animation-play-state: paused/);
  assert.match(html, /font-size:0\.62rem/);
  assert.match(html, /height:40px/);
  assert.doesNotMatch(html, /marcas-parceiros-composicao-compacta\.png/);
});

test("keeps four accessible logos while duplicating only the visual ticker", async () => {
  const html = await renderPartners();
  const images = imageAttributes(html);

  assert.equal(images.filter(({ alt }) => alt).length, 4);
  assert.equal(images.filter(({ alt }) => alt === "").length, 4);
  assert.match(html, /aria-hidden="true"/);
});

test("uses a smooth burgundy gradient without texture or outer frame", async () => {
  const html = await renderPartners();

  assert.match(html, /linear-gradient\([^)]*#8A2638[^)]*#5A1020[^)]*\)/);
  assert.doesNotMatch(html, /background-image/);
  assert.doesNotMatch(html, /border:[^;]*#E7C88A/i);
  assert.match(html, /height:32px;max-height:32px/);
  assert.match(html, /height:34px;max-height:34px/);
  assert.match(html, /height:48px;max-height:48px/);
  assert.match(html, /height:42px;max-height:42px/);
});
