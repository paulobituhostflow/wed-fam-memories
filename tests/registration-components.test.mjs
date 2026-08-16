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

const formPath = path
  .resolve(
    testDir,
    "../src/components/newwed/inscricao/RegistrationFormPreview.tsx",
  )
  .replaceAll("\\", "/");
const summaryPath = path
  .resolve(
    testDir,
    "../src/components/newwed/inscricao/RegistrationSummary.tsx",
  )
  .replaceAll("\\", "/");
const catalogPath = path
  .resolve(testDir, "../src/lib/famtours.ts")
  .replaceAll("\\", "/");

async function renderRegistrationComponents() {
  const buildDir = await mkdtemp(path.join(tmpdir(), "registration-ui-"));
  const outfile = path.join(buildDir, "registration.cjs");

  await build({
    stdin: {
      contents: `
        import React from "react";
        import { renderToStaticMarkup } from "react-dom/server";
        import { RegistrationFormPreview } from "${formPath}";
        import { RegistrationSummary } from "${summaryPath}";
        import { FAMTOUR_EDITIONS } from "${catalogPath}";

        export const formHtml = renderToStaticMarkup(
          React.createElement(RegistrationFormPreview),
        );
        export const summaryHtml = renderToStaticMarkup(
          React.createElement(RegistrationSummary, {
            edition: FAMTOUR_EDITIONS[1],
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
    return projectRequire(outfile);
  } finally {
    await rm(buildDir, { recursive: true, force: true });
  }
}

test("renders the New Wed personal and billing fields without submission", async () => {
  const { formHtml } = await renderRegistrationComponents();

  for (const label of [
    "Nome completo",
    "E-mail",
    "WhatsApp",
    "CPF",
    "CEP",
    "Rua",
    "Número",
    "Complemento",
    "Bairro",
    "Cidade",
    "UF",
  ]) {
    assert.match(formHtml, new RegExp(label));
  }

  assert.match(formHtml, /INSCRIÇÃO ONLINE EM BREVE/);
  assert.match(formHtml, /seus dados não serão enviados/i);
  assert.match(formHtml, /nenhuma cobrança será realizada/i);
  assert.doesNotMatch(
    formHtml,
    /type="submit"|PAGAR|COMPRAR|FINALIZAR PAGAMENTO/i,
  );
});

test("renders the edition summary only from the selected catalog record", async () => {
  const { summaryHtml } = await renderRegistrationComponents();
  const normalized = summaryHtml.replaceAll("\u00a0", " ");

  assert.match(normalized, /Rio Grande do Norte/);
  assert.match(normalized, /4 a 8 de abril de 2027/);
  assert.match(normalized, /18 VAGAS/);
  assert.match(normalized, /AÉREO INCLUSO/);
  assert.match(normalized, /12x de R\$ 583,08/);
  assert.match(normalized, /R\$ 6\.997,00 à vista/);
  assert.match(normalized, /Hospedagem em pousada selecionada/);
  assert.doesNotMatch(normalized, /2026/);
});
