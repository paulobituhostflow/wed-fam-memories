# Fluxo de inscrição dos Famtours New Wed 2027

**Status:** aprovado para implementação  
**Data:** 16 de agosto de 2026

## 1. Contexto

A landing page New Wed já apresenta as edições abertas e possui um formulário geral de interesse. Hoje, porém, cada card conduz a uma única ação de pré-inscrição e os dados comerciais das edições não estão centralizados.

O novo fluxo separa duas intenções:

- **SABER MAIS:** mantém a edição selecionada e conduz ao formulário geral já existente;
- **FAZER INSCRIÇÃO:** abre uma experiência completa de inscrição em `/inscricao/:slug`, baseada na hierarquia e na sequência dos checkouts históricos da New Wed, sem pagamento, envio ou persistência nesta etapa.

Os checkouts de 2026 servem apenas como referência de UX/UI e arquitetura da informação. Nenhum dado comercial de 2026 será reutilizado.

## 2. Objetivos

- Criar uma única fonte de verdade para todos os dados das edições abertas.
- Atualizar os cards para comunicar aéreo, parcela, valor total e duas ações distintas.
- Criar uma rota dinâmica reutilizável para a inscrição de qualquer edição.
- Reproduzir o padrão de experiência dos checkouts New Wed: apresentação, resumo, inclusos, dados pessoais, endereço de cobrança, perguntas frequentes e resumo final.
- Manter a experiência responsiva e prioritariamente mobile-first.
- Preparar a arquitetura para uma futura integração de envio e pagamento, sem simulá-la agora.

## 3. Fora do escopo

- Processar pagamento, criar cobrança ou redirecionar para checkout externo.
- Enviar, persistir ou transmitir os dados preenchidos na nova página de inscrição.
- Alterar o webhook Base44 ou o envio do formulário geral já existente.
- Criar uma página separada e hardcoded para cada destino.
- Alterar Hero, Marcas e Parceiros, Edições anteriores, CTA geral, Footer ou outras páginas.
- Inventar benefícios, fotos ou informações que não estejam confirmados.

## 4. Arquitetura escolhida

### 4.1 Fonte única de verdade

Será criado um catálogo tipado central, por exemplo em `src/lib/famtours.ts`. A landing page, o formulário geral e a rota dinâmica consultarão essa mesma estrutura.

Cada edição terá, no mínimo:

```ts
type FamtourEdition = {
  id: string
  slug: string
  destino: string
  nome: string
  periodo: string
  datas: {
    inicio: string
    fim: string
    exibicao: string
  }
  vagas: number
  preco: {
    parcelaQuantidade: 12
    parcelaValor: string
    valorAVista: string
  }
  imagem: string
  imagemAlt: string
  aereoIncluso: boolean
  inclusos: string[]
}
```

Os campos monetários serão armazenados de forma consistente e formatados para `pt-BR` na interface. Se a implementação atual exigir compatibilidade temporária com o tipo `FamTour`, o adaptador também ficará junto do catálogo, evitando uma segunda cópia dos dados.

### 4.2 Edições 2027

| Destino | Slug | Período | Vagas | Parcela | À vista | Imagem existente |
|---|---|---|---:|---:|---:|---|
| Alagoas | `famtour-alagoas-fevereiro-2027` | 21 a 25 de fevereiro de 2027 | 18 | 12x de R$ 641,42 | R$ 7.697,00 | `src/assets/dest-milagres.jpg` |
| Rio Grande do Norte | `famtour-rn-abril-2027` | 4 a 8 de abril de 2027 | 18 | 12x de R$ 583,08 | R$ 6.997,00 | `public/famtour-rn.webp` |
| Fernando de Noronha | `famtour-noronha-maio-2027` | 2 a 6 de maio de 2027 | 15 | 12x de R$ 666,42 | R$ 7.997,00 | `public/famtour-noronha.webp` |
| Ceará | `famtour-ceara-agosto-2027` | 15 a 19 de agosto de 2027 | 18 | 12x de R$ 583,08 | R$ 6.997,00 | `src/assets/dest-pernambuco.jpg`, já usada no projeto para Ceará |

Todas as quatro edições terão `aereoIncluso: true`.

Os inclusos confirmados e compartilhados inicialmente serão:

- aéreo incluso;
- hospedagem em pousada selecionada;
- visitas técnicas e experiências imersivas;
- bastidores com fornecedores locais selecionados.

Qualquer inclusão adicional dependerá de confirmação posterior e deverá ser acrescentada somente no catálogo central.

## 5. Cards das edições abertas

Cada card continuará usando a identidade visual existente, com a seguinte hierarquia comercial:

1. destino, período e quantidade de vagas;
2. ícone de avião minimalista acompanhado do texto `AÉREO INCLUSO`;
3. `12x de R$ XXX,XX` em maior destaque;
4. `R$ X.XXX,XX à vista` em hierarquia secundária;
5. ações `SABER MAIS` e `FAZER INSCRIÇÃO`.

O ícone reforça a mensagem, mas não substitui o texto. Deve usar um ícone acessível já disponível na biblioteca do projeto, com tamanho discreto e cor coerente com o contexto do card.

### 5.1 SABER MAIS

- Registra a edição escolhida no estado do formulário atual.
- Faz scroll suave até o formulário geral existente.
- Mantém o comportamento de envio atual desse formulário sem alterar o webhook.
- O campo de destino deve aparecer preenchido com a edição selecionada.

### 5.2 FAZER INSCRIÇÃO

- Navega internamente para `/inscricao/:slug`.
- Não abre o formulário geral.
- Não menciona pagamento, checkout de cobrança ou confirmação de compra.
- O texto do botão representa intenção de inscrição, não uma cobrança imediata.

## 6. Rota dinâmica `/inscricao/:slug`

A implementação utilizará uma única rota dinâmica do roteador atual, prevista como `src/routes/inscricao.$slug.tsx`. A rota buscará a edição pelo slug no catálogo central.

### 6.1 Slug válido

A página renderiza os dados completos da edição selecionada sem duplicar conteúdo por destino.

### 6.2 Slug inválido

A página exibe um estado seguro de “edição não encontrada”, com link para voltar às edições abertas. Não usa dados padrão de outra edição e não redireciona silenciosamente para um destino incorreto.

## 7. Estrutura da página de inscrição

### 7.1 Cabeçalho da edição

Exibir claramente:

- `FAMTOUR NEW WED 2027`;
- nome do destino;
- período da edição;
- quantidade de vagas no formato `18 VAGAS` ou `15 VAGAS`;
- ícone de avião + `AÉREO INCLUSO`;
- imagem oficial já disponível no projeto.

### 7.2 Resumo da experiência

Apresentar destino, período e lista de inclusos extraída do mesmo registro da edição. O conteúdo terá estética editorial New Wed e leitura rápida no mobile.

### 7.3 Investimento

Ordem visual obrigatória:

1. `12x de R$ XXX,XX`, com o maior peso e tamanho;
2. `R$ X.XXX,XX à vista`, abaixo e em tamanho menor;
3. texto informativo explícito: `Nenhuma cobrança será realizada nesta etapa.`

Não haverá juros, taxas, cupom ou condições adicionais na interface enquanto essas informações não forem confirmadas.

### 7.4 Formulário visual de inscrição

A organização segue o padrão dos checkouts históricos, mas sem envio nesta etapa.

**Dados pessoais:**

- nome completo;
- e-mail;
- WhatsApp;
- CPF.

**Endereço de cobrança:**

- CEP;
- rua;
- número;
- complemento, opcional;
- bairro;
- cidade;
- UF.

Os campos terão labels persistentes, indicação clara de obrigatoriedade, tipos de teclado adequados no mobile e mensagens acessíveis. O endereço permanece na estrutura porque faz parte do modelo de inscrição de referência e prepara a futura etapa de cobrança, mas nenhum dado será enviado ou salvo agora.

### 7.5 Perguntas frequentes

Manter uma área compacta preparada para dúvidas específicas da edição. Nesta etapa, somente perguntas com respostas confirmadas poderão ser renderizadas; não serão copiadas condições de 2026.

### 7.6 Resumo da inscrição

Exibir novamente:

- destino;
- período;
- vagas;
- aéreo incluso;
- parcela em 12x;
- valor à vista;
- inclusos.

No desktop, esse resumo pode ficar em coluna lateral e acompanhar o preenchimento de forma não intrusiva. No mobile, ficará após os dados essenciais ou em bloco recolhível, sem ocultar informações comerciais obrigatórias.

### 7.7 Estado sem pagamento

O encerramento da página não terá botão de pagamento nem elemento que pareça concluir uma cobrança. Será exibido um aviso visual, sem ação de envio:

`INSCRIÇÃO ONLINE EM BREVE`

Logo abaixo:

`Nesta etapa, seus dados não serão enviados e nenhuma cobrança será realizada.`

Isso evita um formulário aparentemente funcional perder dados silenciosamente e deixa o estado atual inequívoco.

## 8. Responsividade e acessibilidade

- Abordagem mobile-first, com uma coluna no celular.
- Campos com área de toque confortável e sem compressão horizontal.
- Cards mantêm as duas ações legíveis; no mobile, podem empilhar em largura total.
- Resumo lateral passa para o fluxo principal no mobile.
- Contraste adequado, foco de teclado visível e navegação por teclado.
- Imagens com `alt` contextual e ícones decorativos marcados corretamente.
- Valores e informações essenciais não dependerão apenas de cor ou ícone.
- Animações e scroll suave respeitarão a preferência de movimento reduzido.

## 9. Fluxo de dados

```text
Catálogo central de Famtours 2027
        ├── Cards de edições abertas
        │     ├── SABER MAIS → seleciona edição → formulário atual
        │     └── FAZER INSCRIÇÃO → /inscricao/:slug
        └── Página dinâmica de inscrição
              ├── cabeçalho e imagem
              ├── inclusos e investimento
              ├── formulário visual sem envio
              └── resumo sem pagamento
```

Nenhuma parte da interface manterá uma cópia própria de nome, slug, datas, vagas, preço, parcela, imagem, inclusos ou informação de aéreo.

## 10. Arquivos previstos

- `src/lib/famtours.ts`: tipo, catálogo e utilitários de busca/formatação.
- `src/lib/api.ts`: adaptação para consumir o catálogo, se necessária, preservando a integração existente.
- `src/components/newwed/FamTourCard.tsx`: nova hierarquia e dois CTAs.
- `src/routes/index.tsx`: seleção do Famtour no `SABER MAIS` e ligação com o formulário atual.
- `src/routes/inscricao.$slug.tsx`: página dinâmica.
- Componentes específicos da inscrição poderão ser extraídos para `src/components/newwed/inscricao/` se isso melhorar legibilidade e testes.
- `src/routeTree.gen.ts`: atualização gerada pelo roteador, sem edição manual quando a ferramenta do projeto puder regenerá-la.

## 11. Verificação e critérios de aceite

- Os quatro cards mostram dados corretos de 2027 e são renderizados pelo mesmo catálogo.
- Não existe `PRÉ-INSCRIÇÃO` nos cards.
- `SABER MAIS` seleciona a edição correta e leva ao formulário atual.
- `FAZER INSCRIÇÃO` abre a rota correta para cada slug.
- A página dinâmica mostra destino, datas, vagas, aéreo, inclusos e valores corretos.
- A parcela em 12x tem maior hierarquia que o valor à vista.
- Nenhum botão ou texto indica que uma cobrança será realizada.
- Nenhum dado da nova página é enviado, persistido ou encaminhado ao webhook nesta etapa.
- Slugs inválidos não exibem dados de outra edição.
- Layout validado em desktop e mobile.
- Navegação por teclado, labels, foco e contraste verificados.
- Build, typecheck, lint e testes disponíveis no projeto executados com sucesso.
- Busca final confirma ausência de dados comerciais antigos de 2026 nos cards e na rota nova.

## 12. Evolução futura

Quando envio e pagamento forem autorizados, a futura integração deverá conectar-se ao mesmo catálogo e ao formulário já estruturado. A ação final só poderá ser habilitada depois de existir tratamento real de validação, persistência, falhas, idempotência e confirmação de cobrança. Essa evolução não deve exigir páginas específicas por destino.
