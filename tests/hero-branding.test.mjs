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
        import { WhatsAppFloat } from "${path
          .resolve("src/components/newwed/WhatsAppFloat.tsx")
          .replaceAll("\\", "/")}";

        export const html = renderToStaticMarkup(
          React.createElement(HeroSplit, { onCta() {} }),
        );
        export const whatsappHtml = renderToStaticMarkup(
          React.createElement(WhatsAppFloat),
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
    return projectRequire(outfile);
  } finally {
    await rm(buildDir, { recursive: true, force: true });
  }
}

test("hero renders the approved Newed Destinos logo from a transparent PNG", async () => {
  const { html } = await renderHero();

  assert.match(
    html,
    /<img[^>]+src="\/logo-newed-destinos-transparent\.png"[^>]+alt="Newed Destinos"/,
  );
});

test("hero renders the complete approved destination list", async () => {
  const { html } = await renderHero();

  assert.match(
    html,
    /RIO GRANDE DO NORTE • ALAGOAS • FERNANDO DE NORONHA • CEARÁ/,
  );
});

test("hero renders the standardized limited-vacancies message", async () => {
  const { html } = await renderHero();

  assert.match(html, />4 EDIÇÕES • VAGAS LIMITADAS</);
});

test("hero keeps the offer and CTA inside one mobile-first visual panel", async () => {
  const { html } = await renderHero();

  assert.match(html, /min-h-\[calc\(100svh-4rem\)\]/);
  assert.match(html, /absolute inset-x-0 top-0[^\"]*md:relative/);
  assert.match(html, /min-h-\[calc\(100svh-4rem\)\][^\"]*md:min-h-\[90vh\]/);
});

test("hero carousel omits the rejected party photo and keeps four approved slides", async () => {
  const { html } = await renderHero();

  assert.doesNotMatch(html, /LE049274\.webp/);
  assert.equal((html.match(/aria-label="Slide \d+"/g) ?? []).length, 4);
});

test("WhatsApp control uses a smaller safe mobile footprint", async () => {
  const { whatsappHtml } = await renderHero();

  assert.match(whatsappHtml, /w-11 h-11/);
  assert.match(
    whatsappHtml,
    /bottom-\[max\(1rem,env\(safe-area-inset-bottom\)\)\]/,
  );
});
