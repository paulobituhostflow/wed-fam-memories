import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Toaster } from "sonner";
import { SiteShell } from "@/components/newwed/SiteShell";
import { HeroSplit } from "@/components/newwed/HeroSplit";
import { PhotoMarquee } from "@/components/newwed/PhotoMarquee";
import { ParceirosLogos } from "@/components/newwed/Parceiros";
import { FamTourCard } from "@/components/newwed/FamTourCard";
import { PreInscricaoForm } from "@/components/newwed/PreInscricaoForm";
import { SuccessScreen } from "@/components/newwed/SuccessScreen";
import { getFamToursAtivos } from "@/lib/api";
import type { PreInscricaoData } from "@/lib/schemas/preInscricao";
import { MapPin, Handshake, ClipboardList, Sparkles } from "lucide-react";

const searchSchema = z.object({
  edicao: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: AplicarPage,
});

function Divisor({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        maxWidth: 320,
        margin: "0 auto 1.5rem",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "rgba(25,16,16,0.1)" }} />
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#2E8E8E",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(25,16,16,0.1)" }} />
    </div>
  );
}

function AplicarPage() {
  const { edicao } = Route.useSearch();
  const navigate = useNavigate();

  const { data: famtours = [] } = useQuery({
    queryKey: ["famtours-ativos"],
    queryFn: getFamToursAtivos,
    staleTime: 5 * 60 * 1000,
  });

  const [success, setSuccess] = useState<{
    data: PreInscricaoData;
    famtourNome: string;
  } | null>(null);

  const scrollTo = (id: string) => {
    if (typeof document !== "undefined") {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectEdicao = (slug: string) => {
    navigate({ to: "/", search: { edicao: slug }, hash: "form" });
    setTimeout(() => scrollTo("form"), 50);
  };

  return (
    <SiteShell>
      <Toaster position="top-center" richColors />
      <main
        className="bg-white"
        style={{
          color: "#191010",
          scrollBehavior: "smooth",
          paddingTop: "64px", // offset for fixed nav
        }}
      >
        {!success ? (
          <>
            <HeroSplit onCta={() => scrollTo("famtours")} />

            {/* O que é */}
            <section
              style={{
                maxWidth: 720,
                margin: "0 auto",
                padding: "4rem 1.5rem",
                textAlign: "center",
              }}
            >
              <Divisor>O que é</Divisor>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  color: "#191010",
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                Não é viagem.
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 300 }}>
                  É imersão profissional.
                </em>
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: "0.92rem",
                  lineHeight: "1.8",
                  marginTop: "1.5rem",
                  color: "#191010",
                  textAlign: "center",
                }}
              >
                O Famtour Newed é uma experiência fechada e curada para assessores e profissionais de casamentos que buscam autoridade no mercado de Destination Wedding. Você vivencia cada detalhe de um casamento à distância — do planejamento à execução — guiada por quem é referência no Nordeste.
              </p>
            </section>

            {/* Vivências */}
            <section
              style={{
                maxWidth: 1100,
                margin: "0 auto",
                padding: "2rem 1.5rem 4rem",
              }}
            >
              <Divisor>Vivências</Divisor>
              <div
                className="grid grid-cols-2 md:grid-cols-4"
                style={{ gap: "1rem" }}
              >
                {[
                  {
                    Icon: MapPin,
                    title: "Experiências Reais",
                    text: "Visitas técnicas e imersões em locais que são referência no mercado de casamentos premium no Nordeste.",
                  },
                  {
                    Icon: Handshake,
                    title: "Conexões",
                    text: "Conheça pessoalmente os fornecedores que são referência em cada estado do Nordeste e construa parcerias sólidas.",
                  },
                  {
                    Icon: ClipboardList,
                    title: "Estratégia e Logística",
                    text: "Entenda os bastidores do planejamento: de deslocamentos e hospedagem à experiência completa dos noivos e convidados.",
                  },
                  {
                    Icon: Sparkles,
                    title: "GRUPO NEW WED",
                    text: "Somos um ecossistema dedicado a fortalecer o mercado de casamentos no Nordeste, gerando conexões e oportunidades reais de negócios.",
                  },
                ].map(({ Icon, title, text }) => (
                  <div
                    key={title}
                    style={{
                      background: "#F7F4EE",
                      padding: "1.5rem",
                      borderRadius: 0,
                    }}
                  >
                    <Icon size={22} color="#2E8E8E" strokeWidth={1.5} />
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        fontSize: "1rem",
                        color: "#191010",
                        marginTop: "0.75rem",
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.8rem",
                        color: "rgba(25,16,16,0.7)",
                        marginTop: "0.4rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {text}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Edições abertas */}
            <section
              id="famtours"
              style={{
                maxWidth: 1100,
                margin: "0 auto",
                padding: "3rem 1.5rem 4rem",
              }}
            >
              <Divisor>Edições abertas</Divisor>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: "2.5rem",
                  color: "#191010",
                  textAlign: "center",
                  margin: "0 0 2.5rem",
                }}
              >
                Escolha a sua imersão.
              </h2>
              <div
                className="grid grid-cols-1 md:grid-cols-2"
                style={{ gap: "2rem" }}
              >
                {famtours.map((f) => (
                  <FamTourCard
                    key={f.id}
                    famtour={f}
                    onSelect={handleSelectEdicao}
                  />
                ))}
              </div>
            </section>

            {/* Parceiros e marcas apoiadoras */}
            <ParceirosLogos />

            {/* CTA pré-form */}
            <section
              style={{
                background: "#0a2b28",
                padding: "4rem 1.5rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Esteira de fotos infinita */}
              <PhotoMarquee />

              {/* Overlay escuro para legibilidade do texto */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "rgba(0,0,0,0.62)",
                  zIndex: 1,
                }}
              />
              <div
                className="relative"
                style={{ zIndex: 2, maxWidth: 600, margin: "0 auto", textAlign: "center" }}
              >
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    color: "#FFFFFF",
                    lineHeight: 1.15,
                    margin: 0,
                  }}
                >
                  Famtour Nordeste • Vagas Limitadas
                </h2>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.92rem",
                    color: "rgba(255,255,255,0.95)",
                    maxWidth: 480,
                    margin: "1.5rem auto 2rem",
                    lineHeight: 1.6,
                  }}
                >
                  Preencha sua pré-inscrição agora. Nossa equipe entrará em contato via WhatsApp em até 24h para confirmar sua vaga e enviar os detalhes de pagamento.
                </p>
                <button
                  type="button"
                  onClick={() => scrollTo("form")}
                  style={{
                    background: "#FFFFFF",
                    color: "#7A2535",
                    border: "none",
                    padding: "1.2rem 2.5rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    borderRadius: 0,
                    cursor: "pointer",
                    width: "100%",
                    maxWidth: 400,
                  }}
                >
                  Fazer pré-inscrição →
                </button>
                <div
                  style={{
                    marginTop: "1rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Sem cartão. Sem compromisso até confirmar.
                </div>
              </div>
            </section>

            {/* Form */}
            <section
              id="form"
              style={{
                maxWidth: 720,
                margin: "0 auto",
                padding: "4rem 1.5rem",
              }}
            >
              <Divisor>Pré-inscrição</Divisor>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  color: "#191010",
                  lineHeight: 1.15,
                  margin: 0,
                  textAlign: "center",
                }}
              >
                Boas<span style={{ fontFeatureSettings: "'liga' 0, 'dlig' 0, 'calt' 0" }}>-</span>vindas
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.92rem",
                  lineHeight: 1.72,
                  color: "rgba(25,16,16,0.75)",
                  marginTop: "1.25rem",
                  marginBottom: "2.5rem",
                  textAlign: "center",
                }}
              >
                Estamos felizes por ter você aqui.  
                Queremos conhecer um pouco sobre você e entender seu perfil. A partir desta pré-inscrição, nossa equipe entrará em contato para apresentar todos os detalhes da experiência, esclarecer suas dúvidas e orientar você sobre os próximos passos.  
                Preencha as informações abaixo. Será um prazer ter você conosco nesta imersão.
              </p>
              <PreInscricaoForm
                famtours={famtours}
                preSelectedSlug={edicao}
                onSuccess={(data, famtourNome) =>
                  setSuccess({ data, famtourNome })
                }
              />
            </section>
          </>
        ) : (
          <SuccessScreen
            nome={success.data.nome}
            telefoneFormatado={success.data.telefone}
            famtourNome={success.famtourNome}
          />
        )}
      </main>
    </SiteShell>
  );
}
