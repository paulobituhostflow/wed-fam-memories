import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const routePath = path.resolve(testDir, "../src/routes/index.tsx");
const carouselPath = path.resolve(
  testDir,
  "../src/components/newwed/PreviousEditionsCarousel.tsx",
);
const dataPath = path.resolve(testDir, "../src/lib/previousEditions.ts");
const galleryRoutePath = path.resolve(
  testDir,
  "../src/routes/edicoes.$slug.tsx",
);

async function routeSource() {
  return readFile(routePath, "utf8");
}

async function optionalSource(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
}

test("the editorial introduction links visitors to previous editions", async () => {
  const source = await routeSource();
  const compact = source.replace(/\s+/g, " ");

  assert.match(compact, /Não é viagem\./);
  assert.match(compact, /É uma especialização no destino\./);
  assert.match(
    compact,
    /O Famtour New Wed é uma experiência fechada e curada para assessores e profissionais de casamentos que querem entrar no mercado de Destination Wedding com autoridade, guiada por quem tem autoridade no Nordeste\./,
  );
  assert.match(compact, /CONFIRA EDIÇÕES ANTERIORES/);
  assert.match(compact, /scrollTo\("edicoes-anteriores"\)/);
});

test("centralizes the three confirmed 2026 previous editions", async () => {
  const [source, carousel, data] = await Promise.all([
    routeSource(),
    optionalSource(carouselPath),
    optionalSource(dataPath),
  ]);

  assert.match(source, /id="edicoes-anteriores"/);
  assert.match(source, />EDIÇÕES ANTERIORES</);
  assert.match(source, /<PreviousEditionsCarousel \/>/);
  assert.doesNotMatch(source, /const EDICOES_ANTERIORES/);

  assert.match(carousel, /PREVIOUS_EDITIONS\.map/);
  assert.match(data, /slug: "fernando-de-noronha-2026"/);
  assert.match(data, /slug: "rio-grande-do-norte-2026"/);
  assert.match(data, /slug: "alagoas-2026"/);
  assert.equal((data.match(/ano: 2026/g) ?? []).length, 3);
  assert.match(data, /fantour-noronha\.jpg/);
  assert.match(data, /dest-rn\.jpg/);
  assert.match(data, /dest-milagres\.jpg/);
});

test("renders a scalable snap carousel with clickable editorial covers", async () => {
  const carousel = await optionalSource(carouselPath);

  assert.match(carousel, /snap-x snap-mandatory/);
  assert.match(carousel, /overflow-x-auto/);
  assert.match(carousel, /flex-\[0_0_86%\]/);
  assert.match(carousel, /lg:flex-\[0_0_calc\(\(100%_-_2\.5rem\)\/3\)\]/);
  assert.match(carousel, /hidden justify-end gap-2 md:flex/);
  assert.match(carousel, /aria-label="Edição anterior"/);
  assert.match(carousel, /aria-label="Próxima edição"/);
  assert.match(carousel, /to="\/edicoes\/\$slug"/);
  assert.match(carousel, /EDIÇÃO \{edicao\.ano\}/);
  assert.match(carousel, /VER GALERIA/);
  assert.match(carousel, /group-hover:scale/);
  assert.doesNotMatch(carousel, /setInterval|autoPlay|autoplay/);
});

test("uses one dynamic gallery route backed by the same edition data", async () => {
  const galleryRoute = await optionalSource(galleryRoutePath);

  assert.match(galleryRoute, /createFileRoute\("\/edicoes\/\$slug"\)/);
  assert.match(galleryRoute, /getPreviousEditionBySlug/);
  assert.match(galleryRoute, /edition\.galeria\.map/);
  assert.match(galleryRoute, /EDIÇÃO \{edition\.ano\}/);
  assert.match(galleryRoute, /Edição não encontrada/);
});
