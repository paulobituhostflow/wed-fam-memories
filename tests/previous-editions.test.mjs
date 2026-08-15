import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const routePath = path.resolve(testDir, "../src/routes/index.tsx");

async function routeSource() {
  return readFile(routePath, "utf8");
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

test("the former experiences area renders three visual previous-edition cards", async () => {
  const source = await routeSource();

  assert.match(source, /id="edicoes-anteriores"/);
  assert.match(source, />EDIÇÕES ANTERIORES</);
  assert.match(source, /Fernando de Noronha/);
  assert.match(source, /Rio Grande do Norte/);
  assert.match(source, /Alagoas/);
  assert.match(source, /fantour-noronha\.jpg/);
  assert.match(source, /dest-rn\.jpg/);
  assert.match(source, /dest-milagres\.jpg/);
  assert.match(source, /grid-cols-1 md:grid-cols-3/);

  assert.doesNotMatch(source, /Experiências Reais/);
  assert.doesNotMatch(source, /Estratégia e Logística/);
  assert.doesNotMatch(source, /GRUPO NEW WED/);
});

test("previous-edition cards expose a safe gallery action and editorial hover", async () => {
  const source = await routeSource();
  const sectionStart = source.indexOf("{/* Edições anteriores */}");
  const sectionEnd = source.indexOf("{/* Edições abertas */}", sectionStart);
  const section = source.slice(sectionStart, sectionEnd);

  assert.match(section, /<button/);
  assert.match(section, /data-gallery-key=\{slug\}/);
  assert.match(section, /GALERIA DE FOTOS/);
  assert.match(section, /cursor-pointer/);
  assert.match(section, /group-hover:scale/);
  assert.match(section, /group-hover:/);
  assert.match(section, /focus-visible:/);
});
