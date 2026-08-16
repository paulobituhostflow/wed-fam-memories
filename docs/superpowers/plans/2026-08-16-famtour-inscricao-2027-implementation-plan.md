# Fluxo de Inscrição Famtour 2027 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralizar as quatro edições Famtour 2027, atualizar os cards com dois fluxos de intenção e criar uma página dinâmica de inscrição sem envio ou pagamento.

**Architecture:** Um catálogo tipado em `src/lib/famtours.ts` será a única fonte de dados para cards, formulário atual e rota `/inscricao/$slug`. Os cards separarão `SABER MAIS`, que preserva a seleção no formulário atual, de `FAZER INSCRIÇÃO`, que navega para uma página dinâmica composta por blocos focados e um formulário estritamente visual.

**Tech Stack:** React 19, TypeScript 5.8, TanStack Router/Query, React Hook Form, Lucide React, Tailwind CSS 4, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-16-famtour-inscricao-2027-design.md`

## Global Constraints

- Nome, slug, datas, vagas, preço, parcela, imagem, inclusos e aéreo vêm exclusivamente de `src/lib/famtours.ts`.
- `SABER MAIS` seleciona o Famtour e faz scroll suave até o formulário atual.
- `FAZER INSCRIÇÃO` navega para `/inscricao/:slug`.
- A nova página não envia, não persiste e não transmite dados.
- Nenhum botão ou texto pode sugerir que uma cobrança ocorrerá nesta etapa.
- O webhook Base44 e o fluxo de envio do formulário atual permanecem intactos.
- Nenhum dado comercial de 2026 será reutilizado.
- Utilizar somente imagens existentes no projeto.
- Implementação mobile-first e acessível.

---

## Estrutura de arquivos

- `src/lib/famtours.ts`: modelo, catálogo 2027, busca por slug e adaptador compatível com o formulário atual.
- `src/lib/famtours.test.ts`: invariantes do catálogo e busca por slug.
- `src/lib/api.ts`: preserva somente integração remota/webhook e usa o catálogo como fallback.
- `src/components/newwed/FamTourCard.tsx`: apresentação comercial e dois CTAs.
- `src/components/newwed/FamTourCard.test.tsx`: hierarquia e callbacks do card.
- `src/components/newwed/inscricao/RegistrationFormPreview.tsx`: campos pessoais e endereço, sem `onSubmit` de rede.
- `src/components/newwed/inscricao/RegistrationSummary.tsx`: resumo derivado da edição.
- `src/routes/inscricao.$slug.tsx`: composição da página e estado de slug inválido.
- `src/routes/index.tsx`: navegação para inscrição e seleção/scroll de Saber Mais.
- `src/styles.css`: somente regras responsivas/foco que não sejam expressáveis com classes existentes.
- `src/routeTree.gen.ts`: regenerado automaticamente pelo plugin do TanStack Router.
- `vitest.config.ts`, `src/test/setup.ts`: ambiente de testes de componentes.
- `package.json`, `package-lock.json`: scripts e dependências de teste.

---

### Task 1: Infraestrutura de testes e catálogo único de Famtours

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/lib/famtours.ts`
- Create: `src/lib/famtours.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/lib/api.ts`

**Interfaces:**
- Produces: `FamtourEdition`, `FAMTOUR_EDITIONS`, `getFamtourBySlug(slug)`, `toLegacyFamTour(edition)`.
- Preserves: `getFamToursAtivos(): Promise<FamTour[]>` as a compatibility API and all Base44 submission exports.

- [ ] **Step 1: Add the test runner**

Run:

```powershell
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Configure `vitest.config.ts` with the React plugin, `vite-tsconfig-paths`, `environment: "jsdom"`, `setupFiles: ["./src/test/setup.ts"]`, and `globals: true`. Import `@testing-library/jest-dom/vitest` in `src/test/setup.ts`.

- [ ] **Step 2: Write failing catalog tests**

Create tests that assert:

```ts
expect(FAMTOUR_EDITIONS).toHaveLength(4)
expect(FAMTOUR_EDITIONS.map((edition) => edition.slug)).toEqual([
  "famtour-alagoas-fevereiro-2027",
  "famtour-rn-abril-2027",
  "famtour-noronha-maio-2027",
  "famtour-ceara-agosto-2027",
])
expect(getFamtourBySlug("famtour-noronha-maio-2027")?.vagas).toBe(15)
expect(getFamtourBySlug("inexistente")).toBeUndefined()
```

Itere pelas edições para validar slug único, `aereoIncluso === true`, exatamente 12 parcelas, imagem/alt não vazios, inclusos não vazios e valores positivos. Valide também as datas, vagas e valores exatos dos quatro registros aprovados.

- [ ] **Step 3: Run the catalog test and confirm RED**

Run:

```powershell
npm test -- src/lib/famtours.test.ts
```

Expected: FAIL because `@/lib/famtours` does not exist.

- [ ] **Step 4: Implement the typed catalog**

Use integer cents for monetary truth and format at render time:

```ts
export type FamtourEdition = {
  id: string
  slug: string
  destino: string
  nome: string
  label: string
  periodo: string
  dataInicio: string
  dataFim: string
  vagas: number
  parcelaQuantidade: 12
  parcelaCentavos: number
  valorAVistaCentavos: number
  imagem: string
  imagemAlt: string
  aereoIncluso: true
  inclusos: readonly string[]
}
```

Register these exact values:

```ts
Alagoas: 2027-02-21/2027-02-25, 18, 64142, 769700, "/src/assets/dest-milagres.jpg"
Rio Grande do Norte: 2027-04-04/2027-04-08, 18, 58308, 699700, "/famtour-rn.webp"
Fernando de Noronha: 2027-05-02/2027-05-06, 15, 66642, 799700, "/famtour-noronha.webp"
Ceará: 2027-08-15/2027-08-19, 18, 58308, 699700, "/src/assets/dest-pernambuco.jpg"
```

Import bundled images through Vite rather than storing `/src/...` runtime strings. All records include airfare, selected lodging, technical visits/immersive experiences and backstage with selected local suppliers.

Keep `FamTour` as a compatibility alias or adapter in `api.ts`. To enforce one source of truth, `getFamToursAtivos()` returns `FAMTOUR_EDITIONS.map(toLegacyFamTour)` and no longer replaces the 2027 catalog with remote edition data. Preserve the Base44 webhook URL, payload and submission functions byte-for-byte.

- [ ] **Step 5: Run catalog tests and quality checks**

Run:

```powershell
npm test -- src/lib/famtours.test.ts
npm run build
```

Expected: tests PASS and build exits 0.

- [ ] **Step 6: Commit the catalog atomically**

```powershell
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/lib/famtours.ts src/lib/famtours.test.ts src/lib/api.ts
git commit -m "feat(famtours): centralizar edições de 2027"
```

---

### Task 2: Atualizar cards com hierarquia comercial e dois CTAs

**Files:**
- Modify: `src/components/newwed/FamTourCard.tsx`
- Create: `src/components/newwed/FamTourCard.test.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: `FamtourEdition`, valores em centavos e `slug` do catálogo.
- Produces: props `onLearnMore(slug: string)` e `onRegister(slug: string)`.

- [ ] **Step 1: Write failing card tests**

Renderize o card com a edição de RN e valide:

```ts
expect(screen.getByText("AÉREO INCLUSO")).toBeInTheDocument()
expect(screen.getByText("12x de R$ 583,08")).toBeInTheDocument()
expect(screen.getByText("R$ 6.997,00 à vista")).toBeInTheDocument()
expect(screen.getByText("18 VAGAS")).toBeInTheDocument()
```

Clique em `SABER MAIS` e `FAZER INSCRIÇÃO` com `userEvent`; confirme que cada callback recebe `famtour-rn-abril-2027`. Confirme ausência de `PRÉ-INSCRIÇÃO`, `10X` e qualquer texto de taxas.

- [ ] **Step 2: Run the card test and confirm RED**

```powershell
npm test -- src/components/newwed/FamTourCard.test.tsx
```

Expected: FAIL because the current card exposes one `onSelect` callback and old pricing copy.

- [ ] **Step 3: Implement the card hierarchy**

- Import `Plane` and `Check` from `lucide-react`.
- Format cents with `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
- Render `Plane` with `aria-hidden="true"` beside visible `AÉREO INCLUSO`.
- Render vacancies with the complete word `VAGAS`.
- Make the installment the visually strongest price.
- Render two buttons in a responsive grid: outlined `SABER MAIS`, wine-filled `FAZER INSCRIÇÃO`.
- Give each button a visible focus state and an accessible name that includes the destination when needed.

- [ ] **Step 4: Wire both card actions on the landing page**

Keep the existing learn-more handler semantics:

```ts
const handleLearnMore = (slug: string) => {
  navigate({ to: "/", search: { edicao: slug }, replace: true })
  requestAnimationFrame(() => scrollTo("form"))
}

const handleRegister = (slug: string) => {
  navigate({ to: "/inscricao/$slug", params: { slug } })
}
```

Pass both callbacks to every card. Do not change the current form submission or the Base44 webhook.

- [ ] **Step 5: Run focused and full checks**

```powershell
npm test -- src/components/newwed/FamTourCard.test.tsx
npm test
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the card flow atomically**

```powershell
git add src/components/newwed/FamTourCard.tsx src/components/newwed/FamTourCard.test.tsx src/routes/index.tsx src/routeTree.gen.ts
git commit -m "feat(famtours): separar interesse e inscrição"
```

---

### Task 3: Criar formulário visual e resumo reutilizável

**Files:**
- Create: `src/components/newwed/inscricao/RegistrationFormPreview.tsx`
- Create: `src/components/newwed/inscricao/RegistrationFormPreview.test.tsx`
- Create: `src/components/newwed/inscricao/RegistrationSummary.tsx`
- Create: `src/components/newwed/inscricao/RegistrationSummary.test.tsx`

**Interfaces:**
- Consumes: `edition: FamtourEdition` in the summary.
- Produces: a presentational form with no submit callback and a data-driven summary.

- [ ] **Step 1: Write failing form safety tests**

Validate that personal labels exist for nome completo, e-mail, WhatsApp and CPF; billing labels exist for CEP, rua, número, complemento, bairro, cidade and UF. Assert:

```ts
expect(screen.queryByRole("button", { name: /pagar|comprar|finalizar/i })).not.toBeInTheDocument()
expect(screen.getByText("INSCRIÇÃO ONLINE EM BREVE")).toBeInTheDocument()
expect(screen.getByText(/seus dados não serão enviados/i)).toBeInTheDocument()
expect(screen.getByText(/nenhuma cobrança será realizada/i)).toBeInTheDocument()
```

The `<form>` must intercept submit with `event.preventDefault()` and expose no network callback prop.

- [ ] **Step 2: Write failing summary tests**

Render RN and assert destination, period, `18 VAGAS`, airfare, exact 12x/cash values and every item from `edition.inclusos`. Ensure no 2026 year appears.

- [ ] **Step 3: Run both tests and confirm RED**

```powershell
npm test -- src/components/newwed/inscricao
```

Expected: FAIL because both components do not exist.

- [ ] **Step 4: Implement the visual-only form**

Build semantic fieldsets for `DADOS PESSOAIS` and `ENDEREÇO DE COBRANÇA`. Use `autocomplete` tokens (`name`, `email`, `tel`, `postal-code`, `street-address`, `address-line2`, `address-level2`, `address-level1`) and mobile input modes. CPF, telefone and CEP may receive local display masks, but no value leaves the component.

End with a non-interactive status panel, not a submit button:

```tsx
<div role="status">
  <strong>INSCRIÇÃO ONLINE EM BREVE</strong>
  <p>Nesta etapa, seus dados não serão enviados e nenhuma cobrança será realizada.</p>
</div>
```

- [ ] **Step 5: Implement the data-driven summary**

Use `edition` only. Render the installment first, cash second, then period, vacancies, airfare and `edition.inclusos.map(...)`. Do not declare duplicated commercial constants.

- [ ] **Step 6: Run tests and build**

```powershell
npm test -- src/components/newwed/inscricao
npm run build
```

Expected: tests PASS and build exits 0.

- [ ] **Step 7: Commit the registration components atomically**

```powershell
git add src/components/newwed/inscricao
git commit -m "feat(inscricao): criar formulário visual e resumo"
```

---

### Task 4: Criar a página dinâmica `/inscricao/:slug`

**Files:**
- Create: `src/routes/inscricao.$slug.tsx`
- Create: `src/routes/inscricao-page.test.tsx`
- Modify: `src/routeTree.gen.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `getFamtourBySlug`, `RegistrationFormPreview`, `RegistrationSummary`.
- Produces: route `/inscricao/$slug` and safe not-found state.

- [ ] **Step 1: Write failing route-content tests**

Extract and export a presentational `InscricaoPage({ edition })` plus `EditionNotFound`. Test the presentational components without mounting the router:

```ts
expect(screen.getByText("FAMTOUR NEW WED 2027")).toBeInTheDocument()
expect(screen.getByRole("heading", { name: "Rio Grande do Norte" })).toBeInTheDocument()
expect(screen.getByText("4 a 8 de abril de 2027")).toBeInTheDocument()
expect(screen.queryByText(/2026/)).not.toBeInTheDocument()
expect(screen.queryByRole("button", { name: /pagar|checkout/i })).not.toBeInTheDocument()
```

For `EditionNotFound`, assert the message `EDIÇÃO NÃO ENCONTRADA` and a link back to `/#famtours` or the landing route with a safe hash behavior.

- [ ] **Step 2: Run the route test and confirm RED**

```powershell
npm test -- src/routes/inscricao-page.test.tsx
```

Expected: FAIL because the route and presentational exports do not exist.

- [ ] **Step 3: Implement route lookup and page composition**

Use:

```ts
export const Route = createFileRoute("/inscricao/$slug")({
  component: InscricaoRoute,
})

function InscricaoRoute() {
  const { slug } = Route.useParams()
  const edition = getFamtourBySlug(slug)
  return edition ? <InscricaoPage edition={edition} /> : <EditionNotFound />
}
```

Compose, in order:

1. compact New Wed navigation/back link;
2. editorial hero with image, 2027 eyebrow, destination, period, vacancies and airfare;
3. experience/inclusions block;
4. investment block with 12x dominant and cash below;
5. personal and billing form preview;
6. FAQ containing only confirmed statements;
7. responsive registration summary;
8. status explaining no send/no charge.

Use CSS/classes for a two-column desktop layout and one-column mobile flow. Keep focus visible, correct heading order and alt text from the catalog.

- [ ] **Step 4: Regenerate the route tree**

Run the project build so the TanStack Router plugin updates `src/routeTree.gen.ts`:

```powershell
npm run build
```

Expected: route tree contains `/inscricao/$slug` and build exits 0.

- [ ] **Step 5: Run tests and static checks**

```powershell
npm test -- src/routes/inscricao-page.test.tsx
npm test
npm run lint
npm run build
```

Expected: tests and build PASS; lint introduces no new errors in touched files. If the repository has pre-existing lint failures, record them separately and verify touched files directly with ESLint.

- [ ] **Step 6: Commit the dynamic page atomically**

```powershell
git add src/routes/inscricao.$slug.tsx src/routes/inscricao-page.test.tsx src/routeTree.gen.ts src/styles.css
git commit -m "feat(inscricao): adicionar página dinâmica por edição"
```

---

### Task 5: Validação integrada desktop/mobile e segurança de escopo

**Files:**
- Modify only files from Tasks 1–4 if validation reveals defects.

**Interfaces:**
- Consumes: complete landing/card/registration flow.
- Produces: evidence that both intentions work without payment or regression to Base44.

- [ ] **Step 1: Run automated gates**

```powershell
npm test
npm run lint
npm run build
```

Expected: tests and build exit 0; no new lint errors.

- [ ] **Step 2: Search forbidden and duplicated copy**

```powershell
rg -n "PRÉ-INSCRIÇÃO|10X NO CARTÃO|CONSULTE TAXAS|2026|pagar agora|finalizar pagamento" src/components/newwed/FamTourCard.tsx src/routes src/components/newwed/inscricao src/lib/famtours.ts --glob "inscricao*" --glob "*.tsx" --glob "*.ts"
rg -n "641,42|583,08|666,42|7\.697|6\.997|7\.997" src --glob "!lib/famtours.ts" --glob "!*.test.ts" --glob "!*.test.tsx"
```

Expected: no forbidden card/registration copy and no duplicated commercial values outside the catalog.

- [ ] **Step 3: Verify the two CTA flows in the browser**

At desktop width:

- click `SABER MAIS` on each card and verify the corresponding option is selected in the current form;
- click `FAZER INSCRIÇÃO` and verify the correct `/inscricao/<slug>` URL and matching edition data;
- open an invalid slug and verify the safe not-found state;
- inspect network activity while interacting with the registration preview and confirm no request is sent.

- [ ] **Step 4: Verify mobile-first behavior**

At approximately 375 × 812:

- verify card CTAs are not clipped and have comfortable touch targets;
- verify hero text, values, form fields and summary do not overflow;
- verify registration content order remains logical;
- verify keyboard focus and reduced-motion behavior.

- [ ] **Step 5: Review integration boundaries**

Run:

```powershell
git diff cdc5a1e -- src/lib/api.ts src/components/newwed/PreInscricaoForm.tsx src/lib/schemas/preInscricao.ts
```

Expected: Base44 webhook URL/payload and current submit function are unchanged; `PreInscricaoForm` changes only if needed to display the centralized edition type.

- [ ] **Step 6: Commit validation fixes if present**

Stage each concrete file changed during validation by its exact path, review `git diff --cached`, then run:

```powershell
git commit -m "fix(inscricao): ajustar validação responsiva"
```

If no fixes are needed, do not stage files and do not create an empty commit.
