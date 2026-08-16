import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Toaster } from "sonner";
import { SiteShell } from "@/components/newwed/SiteShell";
import { HeroSplit } from "@/components/newwed/HeroSplit";
import { ParceirosLogos } from "@/components/newwed/Parceiros";
import { PreviousEditionsCarousel } from "@/components/newwed/PreviousEditionsCarousel";
import { FamTourCard } from "@/components/newwed/FamTourCard";
import {
  InterestFormHeading,
  OpenEditionsHeading,
} from "@/components/newwed/FamtourLandingCopy";
import { PreInscricaoForm } from "@/components/newwed/PreInscricaoForm";
import { SuccessScreen } from "@/components/newwed/SuccessScreen";
import { FAMTOUR_EDITIONS, toLegacyFamTour } from "@/lib/famtours";
import type { PreInscricaoData } from "@/lib/schemas/preInscricao";

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
            <section className="mx-auto max-w-[720px] px-6 py-12 text-center md:py-16">
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
              className="mx-auto max-w-[1100px] px-6 pb-8 pt-0 md:pb-12 md:pt-4"
              style={{
                scrollMarginTop: 80,
              }}
            >
              <Divisor>EDIÇÕES ANTERIORES</Divisor>
              <PreviousEditionsCarousel />
            </section>

            {/* Edições abertas */}
            <section
              id="famtours"
              className="mx-auto max-w-[1100px] px-6 pb-10 pt-10 md:pb-12 md:pt-12"
            >
              <OpenEditionsHeading />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
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
              className="mx-auto max-w-[720px] px-6 pb-12 pt-10 md:py-16"
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
