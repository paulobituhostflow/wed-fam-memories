/**
 * ParceirosLogos — Seção de logotipos de marcas e parceiros
 *
 * Para adicionar/trocar logos:
 * 1. Coloque os arquivos de imagem na pasta /public (PNG ou WebP com fundo transparente)
 * 2. Edite o array LOGOS abaixo com os caminhos e nome acessível (alt)
 *
 * Efeito: grayscale + opacidade reduzida → cor original ao hover.
 */

// ─── LOGOS — edite aqui ───────────────────────────────────────────────────
const LOGOS: { src: string; alt: string }[] = [
  { src: "/empetur - Branca.webp", alt: "Empetur" },
  { src: "/azul- branca.webp",     alt: "Azul Linhas Aéreas" },
  // Adicione mais parceiros aqui:
  // { src: "/parceiro-3.webp", alt: "Nome do Parceiro" },
];
// ─────────────────────────────────────────────────────────────────────────

export function ParceirosLogos() {
  return (
    <section
      style={{
        background: "#191010",
        padding: "3.5rem 1.5rem",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Título discreto */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "2.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: "0.75rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          Marcas e Parceiros
        </span>
      </div>

      {/* Grade de logos */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "2.5rem 3.5rem",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        {LOGOS.map(({ src, alt }) => (
          <div
            key={src}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              style={{
                height: 48,
                width: "auto",
                maxWidth: 140,
                objectFit: "contain",
                /* Efeito inicial: cinza + opacidade */
                filter: "grayscale(100%)",
                opacity: 0.45,
                transition: "filter 0.35s ease, opacity 0.35s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLImageElement).style.filter = "grayscale(0%)";
                (e.currentTarget as HTMLImageElement).style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLImageElement).style.filter = "grayscale(100%)";
                (e.currentTarget as HTMLImageElement).style.opacity = "0.45";
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
