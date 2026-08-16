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
const catalogPath = path
  .resolve(testDir, "../src/lib/famtours.ts")
  .replaceAll("\\", "/");

async function loadCatalog() {
  const buildDir = await mkdtemp(path.join(tmpdir(), "famtour-catalog-"));
  const outfile = path.join(buildDir, "catalog.cjs");

  await build({
    entryPoints: [catalogPath],
    bundle: true,
    format: "cjs",
    loader: { ".jpg": "dataurl", ".webp": "dataurl" },
    platform: "node",
    outfile,
  });

  try {
    return projectRequire(outfile);
  } finally {
    await rm(buildDir, { recursive: true, force: true });
  }
}

test("centralizes the four approved Famtour editions for 2027", async () => {
  const { FAMTOUR_EDITIONS } = await loadCatalog();

  assert.equal(FAMTOUR_EDITIONS.length, 4);
  assert.deepEqual(
    FAMTOUR_EDITIONS.map((edition) => edition.slug),
    [
      "famtour-alagoas-fevereiro-2027",
      "famtour-rn-abril-2027",
      "famtour-noronha-maio-2027",
      "famtour-ceara-agosto-2027",
    ],
  );

  assert.deepEqual(
    FAMTOUR_EDITIONS.map(
      ({ destino, dataInicio, dataFim, vagas, parcelaCentavos, valorAVistaCentavos }) => ({
        destino,
        dataInicio,
        dataFim,
        vagas,
        parcelaCentavos,
        valorAVistaCentavos,
      }),
    ),
    [
      {
        destino: "Alagoas",
        dataInicio: "2027-02-21",
        dataFim: "2027-02-25",
        vagas: 18,
        parcelaCentavos: 64142,
        valorAVistaCentavos: 769700,
      },
      {
        destino: "Rio Grande do Norte",
        dataInicio: "2027-04-04",
        dataFim: "2027-04-08",
        vagas: 18,
        parcelaCentavos: 58308,
        valorAVistaCentavos: 699700,
      },
      {
        destino: "Fernando de Noronha",
        dataInicio: "2027-05-02",
        dataFim: "2027-05-06",
        vagas: 15,
        parcelaCentavos: 66642,
        valorAVistaCentavos: 799700,
      },
      {
        destino: "Ceará",
        dataInicio: "2027-08-15",
        dataFim: "2027-08-19",
        vagas: 18,
        parcelaCentavos: 58308,
        valorAVistaCentavos: 699700,
      },
    ],
  );
});

test("keeps required commercial fields complete and internally consistent", async () => {
  const { FAMTOUR_EDITIONS } = await loadCatalog();
  const slugs = new Set();

  for (const edition of FAMTOUR_EDITIONS) {
    assert.equal(edition.aereoIncluso, true);
    assert.equal(edition.parcelaQuantidade, 12);
    assert.ok(edition.imagem);
    assert.ok(edition.imagemAlt);
    assert.ok(edition.inclusos.length >= 4);
    assert.ok(edition.parcelaCentavos > 0);
    assert.ok(edition.valorAVistaCentavos > 0);
    assert.equal(slugs.has(edition.slug), false);
    slugs.add(edition.slug);
  }
});

test("finds a known edition by slug and rejects an unknown slug", async () => {
  const { getFamtourBySlug } = await loadCatalog();

  assert.equal(getFamtourBySlug("famtour-noronha-maio-2027")?.vagas, 15);
  assert.equal(getFamtourBySlug("edicao-inexistente"), undefined);
});
