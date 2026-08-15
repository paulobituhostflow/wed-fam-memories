import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();
const projectRequire = createRequire(path.join(projectRoot, "package.json"));
const { build } = projectRequire("esbuild");
const componentPath = path
  .resolve("src/components/newwed/Footer.tsx")
  .replaceAll("\\", "/");

async function renderFooter() {
  const buildDir = await mkdtemp(path.join(tmpdir(), "footer-"));
  const outfile = path.join(buildDir, "footer-render.cjs");

  await build({
    stdin: {
      contents: `
        import React from "react";
        import { renderToStaticMarkup } from "react-dom/server";
        import { Footer } from "${componentPath}";

        export const html = renderToStaticMarkup(React.createElement(Footer));
      `,
      loader: "tsx",
      resolveDir: projectRoot,
    },
    bundle: true,
    format: "cjs",
    jsx: "automatic",
    nodePaths: [path.join(projectRoot, "node_modules")],
    platform: "node",
    outfile,
    plugins: [
      {
        name: "router-link-stub",
        setup(buildContext) {
          buildContext.onResolve(
            { filter: /^@tanstack\/react-router$/ },
            () => ({ path: "router-link-stub", namespace: "stub" }),
          );
          buildContext.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
            contents: `
                import React from "react";
                export function Link({ to, children, ...props }) {
                  return React.createElement("a", { href: to, ...props }, children);
                }
              `,
            loader: "jsx",
            resolveDir: projectRoot,
          }));
        },
      },
    ],
  });

  try {
    return projectRequire(outfile).html;
  } finally {
    await rm(buildDir, { recursive: true, force: true });
  }
}

test("footer presents the approved institutional description", async () => {
  const html = await renderFooter();

  assert.match(
    html,
    /O maior ecossistema de conexões para o mercado de casamento no Nordeste\. Curadoria e autoridade desde 2014\./,
  );
  assert.doesNotMatch(html, /Ecossistema de Destination Wedding no Nordeste/);
});

test("footer links the four approved Instagram profiles in order", async () => {
  const html = await renderFooter();
  const profiles = [
    ...html.matchAll(
      /<a href="(https:\/\/www\.instagram\.com\/[^"]+)"[^>]*>(@[^<]+)<\/a>/g,
    ),
  ].map(([, href, label]) => ({ href, label }));

  assert.deepEqual(profiles, [
    {
      href: "https://www.instagram.com/new_wed_feira/",
      label: "@new_wed_feira",
    },
    {
      href: "https://www.instagram.com/new_wed_guianordeste/",
      label: "@new_wed_guianordeste",
    },
    {
      href: "https://www.instagram.com/new_wed_destinos/",
      label: "@new_wed_destinos",
    },
    {
      href: "https://www.instagram.com/new_wed_workshop/",
      label: "@new_wed_workshop",
    },
  ]);
});
