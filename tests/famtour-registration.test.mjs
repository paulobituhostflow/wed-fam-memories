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

function sourcePath(relativePath) {
  return path.resolve(testDir, relativePath).replaceAll("\\", "/");
}

let fixturePromise;

async function loadFeatureFixture() {
  if (fixturePromise) return fixturePromise;

  fixturePromise = (async () => {
    const buildDir = await mkdtemp(path.join(tmpdir(), "famtour-feature-"));
    const outfile = path.join(buildDir, "feature.cjs");

    await build({
      stdin: {
        contents: `
          import React from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
          import { FamTourCard } from "${sourcePath("../src/components/newwed/FamTourCard.tsx")}";
          import { InterestFormHeading, OpenEditionsHeading } from "${sourcePath("../src/components/newwed/FamtourLandingCopy.tsx")}";
          import { PreInscricaoForm } from "${sourcePath("../src/components/newwed/PreInscricaoForm.tsx")}";
          import { RegistrationFormPreview } from "${sourcePath("../src/components/newwed/inscricao/RegistrationFormPreview.tsx")}";
          import { RegistrationSummary } from "${sourcePath("../src/components/newwed/inscricao/RegistrationSummary.tsx")}";
          import { InscricaoPage, EditionNotFound } from "${sourcePath("../src/routes/inscricao.$slug.tsx")}";
          import { buildSuccessWhatsAppMessage, FAMTOUR_EDITIONS, getFamtourBySlug, toLegacyFamTour } from "${sourcePath("../src/lib/famtours.ts")}";

          const edition = FAMTOUR_EDITIONS[1];
          const cearaEdition = FAMTOUR_EDITIONS[3];
          const queryClient = new QueryClient();

          export const catalog = FAMTOUR_EDITIONS.map((item) => ({
            slug: item.slug,
            destino: item.destino,
            dataInicio: item.dataInicio,
            dataFim: item.dataFim,
            vagas: item.vagas,
            parcelaCentavos: item.parcelaCentavos,
            valorAVistaCentavos: item.valorAVistaCentavos,
            aereoIncluso: item.aereoIncluso,
            hasImage: Boolean(item.imagem),
          }));
          export const unknownEdition = getFamtourBySlug("inexistente");
          export const cardHtml = renderToStaticMarkup(
            React.createElement(FamTourCard, {
              famtour: edition,
              onLearnMore: () => {},
              onRegister: () => {},
            }),
          );
          export const cearaCardHtml = renderToStaticMarkup(
            React.createElement(FamTourCard, {
              famtour: cearaEdition,
              onLearnMore: () => {},
              onRegister: () => {},
            }),
          );
          export const landingCopyHtml = renderToStaticMarkup(
            React.createElement(
              React.Fragment,
              null,
              React.createElement(OpenEditionsHeading),
              React.createElement(InterestFormHeading),
            ),
          );
          export const interestFormHtml = renderToStaticMarkup(
            React.createElement(
              QueryClientProvider,
              { client: queryClient },
              React.createElement(PreInscricaoForm, {
                famtours: FAMTOUR_EDITIONS.map(toLegacyFamTour),
                preSelectedSlug: edition.slug,
                onSuccess: () => {},
              }),
            ),
          );
          export const successMessage = buildSuccessWhatsAppMessage(
            "Maria",
            edition.nome,
          );
          export const formHtml = renderToStaticMarkup(
            React.createElement(RegistrationFormPreview),
          );
          export const summaryHtml = renderToStaticMarkup(
            React.createElement(RegistrationSummary, { edition }),
          );
          export const pageHtml = renderToStaticMarkup(
            React.createElement(InscricaoPage, { edition }),
          );
          export const cearaPageHtml = renderToStaticMarkup(
            React.createElement(InscricaoPage, { edition: cearaEdition }),
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
      define: { "import.meta.env": "{}" },
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
  })();

  return fixturePromise;
}

function normalizeCurrency(html) {
  return html.replaceAll("\u00a0", " ");
}

test("uses one catalog for the four approved 2027 editions", async () => {
  const { catalog, unknownEdition } = await loadFeatureFixture();

  assert.deepEqual(catalog, [
    {
      slug: "famtour-alagoas-fevereiro-2027",
      destino: "Alagoas",
      dataInicio: "2027-02-21",
      dataFim: "2027-02-25",
      vagas: 18,
      parcelaCentavos: 64142,
      valorAVistaCentavos: 769700,
      aereoIncluso: true,
      hasImage: true,
    },
    {
      slug: "famtour-rn-abril-2027",
      destino: "Rio Grande do Norte",
      dataInicio: "2027-04-04",
      dataFim: "2027-04-08",
      vagas: 18,
      parcelaCentavos: 58308,
      valorAVistaCentavos: 699700,
      aereoIncluso: true,
      hasImage: true,
    },
    {
      slug: "famtour-noronha-maio-2027",
      destino: "Fernando de Noronha",
      dataInicio: "2027-05-02",
      dataFim: "2027-05-06",
      vagas: 15,
      parcelaCentavos: 66642,
      valorAVistaCentavos: 799700,
      aereoIncluso: true,
      hasImage: true,
    },
    {
      slug: "famtour-ceara-agosto-2027",
      destino: "Ceará",
      dataInicio: "2027-08-15",
      dataFim: "2027-08-19",
      vagas: 18,
      parcelaCentavos: 58308,
      valorAVistaCentavos: 699700,
      aereoIncluso: true,
      hasImage: false,
    },
  ]);
  assert.equal(unknownEdition, undefined);
});

test("renders the approved landing copy and Famtour spelling", async () => {
  const { landingCopyHtml, interestFormHtml, successMessage } =
    await loadFeatureFixture();
  const html = `${landingCopyHtml}${interestFormHtml}`;

  assert.match(html, /FAMTOUR 2027/);
  assert.match(html, />Edições abertas</);
  assert.match(html, /Pronto para viver essa experiência\?/);
  assert.match(
    html,
    /Selecione a edição que mais combina com você e conte um pouco sobre seu perfil\./,
  );
  assert.doesNotMatch(html, /Escolha a sua imersão|Boas-vindas/);
  assert.doesNotMatch(`${html}${successMessage}`, /FamTour/);
  assert.match(successMessage, /Famtour Newed Destinos/);
});

test("uses a neutral fallback when the Ceará edition has no official image", async () => {
  const { cearaCardHtml, cearaPageHtml } = await loadFeatureFixture();
  const html = `${cearaCardHtml}${cearaPageHtml}`;

  assert.match(html, /Imagem da edição em atualização/);
  assert.doesNotMatch(html, /dest-pernambuco/);
});

test("renders both card actions and the approved commercial hierarchy", async () => {
  const { cardHtml } = await loadFeatureFixture();
  const html = normalizeCurrency(cardHtml);

  assert.match(html, /AÉREO INCLUSO/);
  assert.match(html, /18 VAGAS/);
  assert.match(html, /12x de R\$ 583,08/);
  assert.match(html, /R\$ 6\.997,00 à vista/);
  assert.match(html, />SABER MAIS</);
  assert.match(html, />FAZER INSCRIÇÃO</);
  assert.doesNotMatch(html, /10X|CONSULTE TAXAS|PRÉ-INSCRIÇÃO/);
});

test("keeps the registration experience visual-only and charge-free", async () => {
  const { formHtml, summaryHtml, pageHtml } = await loadFeatureFixture();
  const html = normalizeCurrency(`${formHtml}${summaryHtml}${pageHtml}`);
  const pageSummaryCount = (
    pageHtml.match(/aria-label="Resumo da inscri[^\"]+"/g) ?? []
  ).length;

  assert.match(html, /Nome completo/);
  assert.match(html, /Endereço de cobrança/);
  assert.match(html, /INSCRIÇÃO ONLINE EM BREVE/);
  assert.match(html, /seus dados não serão enviados/i);
  assert.match(html, /nenhuma cobrança será realizada/i);
  assert.match(html, /FAMTOUR NEW WED 2027/);
  assert.equal(pageSummaryCount, 1);
  assert.doesNotMatch(html, /type="submit"|PAGAR|CHECKOUT|COMPRAR/i);
});

test("shows a safe state for an unknown registration slug", async () => {
  const { notFoundHtml } = await loadFeatureFixture();

  assert.match(notFoundHtml, /EDIÇÃO NÃO ENCONTRADA/);
  assert.match(notFoundHtml, /VOLTAR PARA EDIÇÕES ABERTAS/);
});
