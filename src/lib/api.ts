import type { PreInscricaoData } from "./schemas/preInscricao";
import {
  FAMTOUR_EDITIONS,
  toLegacyFamTour,
  type LegacyFamTour,
} from "./famtours";

export type FamTour = LegacyFamTour;

const BASE_URL = import.meta.env.VITE_BASE44_API_URL as string | undefined;
const API_KEY = import.meta.env.VITE_BASE44_API_KEY as string | undefined;

export async function getFamToursAtivos(): Promise<FamTour[]> {
  return FAMTOUR_EDITIONS.map(toLegacyFamTour);
}

export type SubmitResponse = {
  inscricao_id: string;
  confirmacao_token: string;
};

export async function submitPreInscricao(
  payload: PreInscricaoData,
): Promise<SubmitResponse> {
  if (!BASE_URL || !API_KEY) {
    // Dev / unconfigured — simulate success so UX flow works.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      inscricao_id: `local-${Date.now()}`,
      confirmacao_token: "local-token",
    };
  }

  const response = await fetch(`${BASE_URL}/api/inscricoes/criar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Falha ao enviar (${response.status}). ${text}`);
  }

  return (await response.json()) as SubmitResponse;
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
  const rawAnswers = data.respostas_brutas;

  // When the user selects "Outro" we send the free-text they typed instead.
  const destinoInteresse =
    rawAnswers.destino_interesse === "OUTRO" &&
    rawAnswers.destino_outro?.trim()
      ? rawAnswers.destino_outro.trim()
      : rawAnswers.destino_interesse;

  const payload: Base44WebhookPayload = {
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    empresa: data.empresa,
    instagram: data.instagram ?? "",
    cidade_estado: data.cidade_estado,
    famtour_id: resolvedFamtourId,
    status_dw: rawAnswers.status_dw,
    destino_interesse: destinoInteresse,
    expectativa: rawAnswers.expectativa,
    tem_casal_nordeste: rawAnswers.tem_casal_nordeste,
    trabalha_sozinho: rawAnswers.trabalha_sozinho ?? "",
    maior_desafio: rawAnswers.maior_desafio ?? "",
  };

  let response: Response;
  try {
    response = await fetch(BASE44_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
    );
  }

  if (response.status !== 201) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Erro ao registrar pré-inscrição (${response.status}). Por favor tente novamente.${
        text ? ` ${text}` : ""
      }`,
    );
  }
}
