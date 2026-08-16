import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Toaster } from "sonner";
import { SiteShell } from "@/components/newwed/SiteShell";
import { HeroSplit } from "@/components/newwed/HeroSplit";
import { ParceirosLogos } from "@/components/newwed/Parceiros";
import { FamTourCard } from "@/components/newwed/FamTourCard";
import {
  InterestFormHeading,
  OpenEditionsHeading,
} from "@/components/newwed/FamtourLandingCopy";
import { PreInscricaoForm } from "@/components/newwed/PreInscricaoForm";
import { SuccessScreen } from "@/components/newwed/SuccessScreen";
import { FAMTOUR_EDITIONS, toLegacyFamTour } from "@/lib/famtours";
import type { PreInscricaoData } from "@/lib/schemas/preInscricao";
import noronhaImg from "@/assets/fantour-noronha.jpg";
import rioGrandeDoNorteImg from "@/assets/dest-rn.jpg";
import alagoasImg from "@/assets/dest-milagres.jpg";

const searchSchema = z.object({
  edicao: z.string().optional(),
});

const EDICOES_ANTERIORES = [
  {
    slug: "fernando-de-noronha",
    title: "Fernando de Noronha",
    image: noronhaImg,
  },
  {
    slug: "rio-grande-do-norte",
    title: "Rio Grande do Norte",
    image: rioGrandeDoNorteImg,
  },
  {
    slug: "alagoas",
    title: "Alagoas",
    image: alagoasImg,
  },
];

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

  const famtours = FAMTOUR_EDITIONS;
  const formFamtours = FAMTOUR_EDITIONS.map(toLegacyFamTour);

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

  const handleLearnMore = (slug: string) => {
    navigate({ to: "/", search: { edicao: slug }, hash: "form" });
    setTimeout(() => scrollTo("form"), 50);
  };

  const handleRegister = (slug: string) => {
    navigate({ to: "/inscricao/$slug", params: { slug } });
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

            {/* Parceiros e marcas apoiadoras */}
            <ParceirosLogos />

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
                  É uma especialização no destino.
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
                O Famtour New Wed é uma experiência fechada e curada para
                assessores e profissionais de casamentos que querem entrar no
                mercado de Destination Wedding com autoridade, guiada por quem
                tem autoridade no Nordeste.
              </p>
              <button
                type="button"
                onClick={() => scrollTo("edicoes-anteriores")}
                style={{
                  marginTop: "2rem",
                  background: "#7A2535",
                  color: "#FFFFFF",
                  border: "1px solid #7A2535",
                  padding: "1rem 1.75rem",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  borderRadius: 0,
                  cursor: "pointer",
                }}
              >
                CONFIRA EDIÇÕES ANTERIORES
              </button>
            </section>

            {/* Edições anteriores */}
            <section
              id="edicoes-anteriores"
              style={{
                maxWidth: 1100,
                margin: "0 auto",
                padding: "2rem 1.5rem 4rem",
                scrollMarginTop: 80,
              }}
            >
              <Divisor>EDIÇÕES ANTERIORES</Divisor>
              <div
                className="grid grid-cols-1 md:grid-cols-3"
                style={{ gap: "1.25rem" }}
              >
                {EDICOES_ANTERIORES.map(({ slug, title, image }) => (
                  <button
                    key={slug}
                    type="button"
                    data-gallery-key={slug}
                    aria-label={`Galeria de fotos de ${title}`}
                    className="group relative block w-full cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E8E8E] focus-visible:ring-offset-2"
                    style={{
                      aspectRatio: "4 / 5",
                      borderRadius: 0,
                      border: 0,
                      padding: 0,
                      background: "#0a2b28",
                    }}
                  >
                    <img
                      src={image}
                      alt={title}
                      loading="lazy"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      aria-hidden
                      className="transition-opacity duration-500 group-hover:opacity-95 group-focus-visible:opacity-95"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(10,43,40,0.88) 0%, rgba(10,43,40,0.08) 65%)",
                      }}
                    />
                    <div
                      className="transition-transform duration-500 group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
                      style={{
                        position: "absolute",
                        left: "1.25rem",
                        right: "1.25rem",
                        bottom: "1.25rem",
                        color: "#FFFFFF",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 400,
                          fontSize: "clamp(1.5rem, 3vw, 2rem)",
                          lineHeight: 1.1,
                          textTransform: "uppercase",
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{
                          marginTop: "0.65rem",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                          fontSize: "0.65rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.72)",
                        }}
                      >
                        GALERIA DE FOTOS
                      </div>
                    </div>
                  </button>
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
              <OpenEditionsHeading />
              <div
                className="grid grid-cols-1 md:grid-cols-2"
                style={{ gap: "2rem" }}
              >
                {famtours.map((f) => (
                  <FamTourCard
                    key={f.id}
                    famtour={f}
                    onLearnMore={handleLearnMore}
                    onRegister={handleRegister}
                  />
                ))}
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
              <InterestFormHeading />
              <PreInscricaoForm
                famtours={formFamtours}
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
