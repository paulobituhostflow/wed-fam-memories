import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const projectRequire = createRequire(path.join(process.cwd(), "package.json"));
const { build } = projectRequire("esbuild");

async function renderHero() {
  const buildDir = await mkdtemp(path.join(tmpdir(), "hero-branding-"));
  const outfile = path.join(buildDir, "hero-render.cjs");

  await build({
    stdin: {
      contents: `
        import React from "react";
        import { renderToStaticMarkup } from "react-dom/server";
        import { HeroSplit } from "${path
          .resolve("src/components/newwed/HeroSplit.tsx")
          .replaceAll("\\", "/")}";

        export const html = renderToStaticMarkup(
          React.createElement(HeroSplit, { onCta() {} }),
        );
      `,
      loader: "tsx",
      resolveDir: process.cwd(),
    },
    bundle: true,
    format: "cjs",
    platform: "node",
    outfile,
  });

  try {
    return projectRequire(outfile).html;
  } finally {
    await rm(buildDir, { recursive: true, force: true });
  }
}

test("hero renders the approved Newed Destinos logo from a transparent PNG", async () => {
  const html = await renderHero();

  assert.match(
    html,
    /<img[^>]+src="\/logo-newed-destinos-transparent\.png"[^>]+alt="Newed Destinos"/,
  );
});

test("hero renders the complete approved destination list", async () => {
  const html = await renderHero();

  assert.match(
    html,
    /RIO GRANDE DO NORTE • ALAGOAS • FERNANDO DE NORONHA • CEARÁ/,
  );
});

test("hero renders the standardized limited-vacancies message", async () => {
  const html = await renderHero();

  assert.match(html, />4 EDIÇÕES • VAGAS LIMITADAS</);
});
