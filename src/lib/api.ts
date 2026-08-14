import type { PreInscricaoData } from "./schemas/preInscricao";

export type FamTour = {
  id: string;
  slug: string;
  nome: string;
  label: string;
  sub: string;
  data_inicio: string;
  data_fim: string;
  vagas_restantes: number;
  preco_a_partir_de: string;
  imagem: string;
  bullets: string[];
};

const BASE_URL = import.meta.env.VITE_BASE44_API_URL as string | undefined;
const API_KEY = import.meta.env.VITE_BASE44_API_KEY as string | undefined;



const FALLBACK: FamTour[] = [
  {
    id: "famtour-rn-abril-2027",
    slug: "famtour-rn-abril-2027",
    nome: "Famtour Rio Grande do Norte",
    label: "EDIÇÃO • ABRIL 2027",
    sub: "Rio Grande do Norte • 04/04 a 08/04 de 2027",
    data_inicio: "2027-04-04",
    data_fim: "2027-04-08",
    vagas_restantes: 18,
    preco_a_partir_de: "R$ 6.997,00",
    imagem: "/famtour-rn.webp",
    bullets: [
      "Hospedagem em pousada selecionada",
      "Visitas técnicas e experiências imersivas no destino\u00a0",
      "Bastidores com os melhores fornecedores locais\n",
    ],
  },
  {
    id: "famtour-noronha-maio-2027",
    slug: "famtour-noronha-maio-2027",
    nome: "Famtour Noronha",
    label: "EDIÇÃO • MAIO 2027",
    sub: "Fernando de Noronha • 05/05 a 09/05 de 2027",
    data_inicio: "2027-05-05",
    data_fim: "2027-05-09",
    vagas_restantes: 15,
    preco_a_partir_de: "R$ 7.997,00",
    imagem: "/famtour-noronha.webp",
    bullets: [
      "Hospedagem em pousada selecionada",
      "Visitas técnicas e experiências imersivas no destino\u00a0",
      "Bastidores com os melhores fornecedores locais",
    ],
  },
];

export async function getFamToursAtivos(): Promise<FamTour[]> {
  if (!BASE_URL || !API_KEY) return FALLBACK;
  try {
    const res = await fetch(`${BASE_URL}/api/famtours/ativos`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as FamTour[];
    const filtered = data
      .filter((f) => !/teste/i.test(f.nome))
      .sort((a, b) => (a.data_inicio < b.data_inicio ? -1 : 1));
    return filtered.length ? filtered : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export type SubmitResponse = { inscricao_id: string; confirmacao_token: string };

export async function submitPreInscricao(
  payload: PreInscricaoData,
): Promise<SubmitResponse> {
  if (!BASE_URL || !API_KEY) {
    // Dev / unconfigured — simulate success so UX flow works.
    await new Promise((r) => setTimeout(r, 600));
    return {
      inscricao_id: "local-" + Date.now(),
      confirmacao_token: "local-token",
    };
  }
  const res = await fetch(`${BASE_URL}/api/inscricoes/criar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar (${res.status}). ${text}`);
  }
  return (await res.json()) as SubmitResponse;
}

// ---------------------------------------------------------------------------
// Base44 public webhook — no API key required
// ---------------------------------------------------------------------------

const BASE44_WEBHOOK_URL =
  "https://app--famtour-new-wed.base44.app/api/apps/6a2b20a76bcea34109c3ccb5/functions/receberFormularioExterno";

export type Base44WebhookPayload = {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  instagram: string;
  cidade_estado: string;
  famtour_id: string;
  status_dw: string;
  destino_interesse: string;
  expectativa: string;
  tem_casal_nordeste: string;
  trabalha_sozinho: string;
  maior_desafio: string;
};

/**
 * Maps the validated PreInscricaoData form object to the Base44 webhook
 * payload and POSTs it. Resolves on HTTP 201; throws a localized error
 * on any other status or network failure.
 */
export async function submitToBase44Webhook(
  data: PreInscricaoData,
  resolvedFamtourId: string,
): Promise<void> {
  const rb = data.respostas_brutas;

  // When the user selects "Outro" we send the free-text they typed instead.
  const destinoInteresse =
    rb.destino_interesse === "OUTRO" && rb.destino_outro?.trim()
      ? rb.destino_outro.trim()
      : rb.destino_interesse;

  const payload: Base44WebhookPayload = {
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    empresa: data.empresa,
    instagram: data.instagram ?? "",
    cidade_estado: data.cidade_estado,
    famtour_id: resolvedFamtourId,
    status_dw: rb.status_dw,
    destino_interesse: destinoInteresse,
    expectativa: rb.expectativa,
    tem_casal_nordeste: rb.tem_casal_nordeste,
    trabalha_sozinho: rb.trabalha_sozinho ?? "",
    maior_desafio: rb.maior_desafio ?? "",
  };

  let res: Response;
  try {
    res = await fetch(BASE44_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
    );
  }

  if (res.status !== 201) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Erro ao registrar pré-inscrição (${res.status}). Por favor tente novamente.${
        text ? " " + text : ""
      }`,
    );
  }
}
