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
const routePath = path
  .resolve(testDir, "../src/routes/inscricao.$slug.tsx")
  .replaceAll("\\", "/");
const catalogPath = path
  .resolve(testDir, "../src/lib/famtours.ts")
  .replaceAll("\\", "/");

async function renderPages() {
  const buildDir = await mkdtemp(path.join(tmpdir(), "registration-page-"));
  const outfile = path.join(buildDir, "page.cjs");

  await build({
    stdin: {
      contents: `
        import React from "react";
        import { renderToStaticMarkup } from "react-dom/server";
        import { InscricaoPage, EditionNotFound } from "${routePath}";
        import { FAMTOUR_EDITIONS } from "${catalogPath}";

        export const pageHtml = renderToStaticMarkup(
          React.createElement(InscricaoPage, {
            edition: FAMTOUR_EDITIONS[1],
          }),
        );
        export const notFoundHtml = renderToStaticMarkup(
          React.createElement(EditionNotFound),
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
    return projectRequire(outfile);
  } finally {
    await rm(buildDir, { recursive: true, force: true });
  }
}

test("renders a complete 2027 registration experience from the slug edition", async () => {
  const { pageHtml } = await renderPages();
  const normalized = pageHtml.replaceAll("\u00a0", " ");

  assert.match(normalized, /FAMTOUR NEW WED 2027/);
  assert.match(normalized, /Rio Grande do Norte/);
  assert.match(normalized, /4 a 8 de abril de 2027/);
  assert.match(normalized, /18 VAGAS/);
  assert.match(normalized, /AÉREO INCLUSO/);
  assert.match(normalized, /12x de R\$ 583,08/);
  assert.match(normalized, /Dados pessoais/);
  assert.match(normalized, /Endereço de cobrança/);
  assert.match(normalized, /INSCRIÇÃO ONLINE EM BREVE/);
  assert.doesNotMatch(normalized, /2026|PAGAR|CHECKOUT|COMPRAR/i);
});

test("renders a safe state for an unknown edition", async () => {
  const { notFoundHtml } = await renderPages();

  assert.match(notFoundHtml, /EDIÇÃO NÃO ENCONTRADA/);
  assert.match(notFoundHtml, /VOLTAR PARA EDIÇÕES ABERTAS/);
  assert.doesNotMatch(notFoundHtml, /Fernando de Noronha|Alagoas|Ceará/);
});
