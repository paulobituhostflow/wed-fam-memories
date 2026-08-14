import { Check } from "lucide-react";
import type { FamTour } from "@/lib/api";

type Props = {
  famtour: FamTour;
  onSelect: (slug: string) => void;
};

export function FamTourCard({ famtour, onSelect }: Props) {
  return (
    <article
      className="group flex flex-col bg-white transition-colors"
      style={{
        border: "1.5px solid rgba(25,16,16,0.12)",
        borderRadius: 0,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "#2E8E8E")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "rgba(25,16,16,0.12)")
      }
    >
      <img
        src={famtour.imagem}
        alt={famtour.nome}
        loading="lazy"
        style={{
          width: "100%",
          height: 220,
          objectFit: "cover",
          display: "block",
        }}
      />
      <div style={{ padding: "1.5rem 1.5rem 0.5rem" }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#2E8E8E",
          }}
        >
          {famtour.label}
        </div>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: "1.8rem",
            color: "#191010",
            margin: "0.5rem 0 0.25rem",
            lineHeight: 1.1,
          }}
        >
          {famtour.nome}
        </h3>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem",
            color: "rgba(25,16,16,0.65)",
          }}
        >
          {famtour.sub}
        </div>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: "0 1.5rem 1rem",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {famtour.bullets.map((b) => (
          <li
            key={b}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem",
              color: "#191010",
              lineHeight: 1.6,
            }}
          >
            <Check
              size={16}
              color="#2E8E8E"
              strokeWidth={2.5}
              style={{ flexShrink: 0, marginTop: 3 }}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 1.5rem 1rem",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#2E8E8E",
            }}
          >
            VAGAS LIMITADAS
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: "2rem",
              color: "#7A2535",
              lineHeight: 1,
              marginTop: 4,
            }}
          >
            {famtour.vagas_restantes}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#2E8E8E",
            }}
          >
            VALOR COM AERO INCLUSO (À VISTA)
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: "1.4rem",
              color: "#7A2535",
              lineHeight: 1,
              marginTop: 4,
            }}
          >
            {famtour.preco_a_partir_de}
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.05em",
              color: "rgba(25,16,16,0.5)",
              marginTop: 4,
            }}
          >
            OU 10X NO CARTÃO (CONSULTE TAXAS)
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSelect(famtour.slug)}
        style={{
          background: "#7A2535",
          color: "#FFFFFF",
          border: "none",
          padding: "1rem 1.5rem",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: "0.85rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          borderRadius: 0,
          cursor: "pointer",
          margin: "auto 1.5rem 1.5rem",
        }}
      >
        PRÉ-INSCRIÇÃO →
      </button>
    </article>
  );
}
