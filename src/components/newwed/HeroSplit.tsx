import { useEffect, useRef, useState } from "react";

/**
 * CARROSSEL DE IMAGENS — painel direito do HeroSplit
 * Imagens servidas direto da pasta /public — sem import.
 * Para adicionar fotos, edite o array SLIDES abaixo.
 */
const SLIDES = [
  "/LE040347.webp",
  "/LE049274.webp",
  "/LE049367.webp",
  "/WhatsApp-Image-2018-12-26-at-10.03.03.webp",
  "/LE048829.webp",
];

/** Intervalo em ms entre cada slide */
const INTERVAL_MS = 5000;

export function HeroSplit({ onCta }: { onCta: () => void }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number) => {
    setCurrent(index);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, INTERVAL_MS);
  };

  useEffect(() => {
    if (SLIDES.length <= 1) return;
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <section
      className="relative grid grid-cols-1 md:grid-cols-[40%_60%]"
      style={{ minHeight: "90vh" }}
    >
      {/* ── Painel esquerdo — branco ── */}
      <div className="flex flex-col items-center justify-center bg-white px-8 py-16">
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.18em",
            fontSize: "1.5rem",
            color: "#191010",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          NEWED DESTINOS
          <div
            style={{
              fontWeight: 400,
              letterSpacing: "0.28em",
              fontSize: "0.85rem",
              color: "#2E8E8E",
              marginTop: "0.4rem",
            }}
          >
            NORDESTE
          </div>
        </div>
        <div
          style={{
            marginTop: "2rem",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#2E8E8E",
          }}
        >
          FAMTOUR • EDIÇÃO 2027
        </div>
      </div>

      {/* ── Painel direito — carrossel com fade ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "#0a2b28", minHeight: "inherit" }}
      >
        {/* Camadas de imagem: todas absolutas, só a ativa tem opacity 1 */}
        {SLIDES.map((src, i) => (
          <div
            key={src}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: i === current ? 1 : 0,
              transition: "opacity 1.2s ease",
              zIndex: 1,
            }}
          />
        ))}

        {/* Overlay escuro para contraste do texto */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.68) 0%, rgba(10,43,40,0.60) 100%)",
            zIndex: 2,
          }}
        />

        {/* Conteúdo textual — acima de tudo */}
        <div
          className="relative flex flex-col items-start justify-center px-8 py-20 md:px-16"
          style={{ minHeight: "90vh", zIndex: 3 }}
        >
          <div className="max-w-xl">
            <div
              style={{
                width: 80,
                height: 1,
                background: "rgba(255,255,255,0.5)",
                marginBottom: "1.5rem",
              }}
            />
            <h1
              style={{
                fontFamily: "'Anton', sans-serif",
                fontWeight: 400,
                textTransform: "uppercase",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                color: "#FFFFFF",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              FAMTOUR
              <br />
              NORDESTE
              <br />
              EDIÇÃO 2027
            </h1>
            <div
              style={{
                width: 80,
                height: 1,
                background: "rgba(255,255,255,0.5)",
                margin: "1.5rem 0 2rem",
              }}
            />
            <button
              type="button"
              onClick={onCta}
              style={{
                background: "#FFFFFF",
                color: "#7A2535",
                padding: "1rem 2rem",
                borderRadius: 0,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "0.85rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
              }}
            >
              Ver edições abertas
            </button>
            <div
              style={{
                marginTop: "1rem",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              4 edições • Vagas limitadas.
            </div>
          </div>

          {/* Indicadores de slide (bolinhas) */}
          {SLIDES.length > 1 && (
            <div className="absolute bottom-6 left-8 flex gap-2 md:left-16">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => {
                    goTo(i);
                    resetTimer();
                  }}
                  style={{
                    width: i === current ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: "none",
                    background:
                      i === current ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    padding: 0,
                    transition: "width 0.35s ease, background 0.35s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
