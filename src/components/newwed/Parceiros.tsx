const PARCEIROS = [
  {
    name: "Azul",
    src: "/azul- branca.webp",
    height: 36,
  },
  {
    name: "Casar.com",
    src: "/casar-logo-white.svg",
    height: 38,
  },
  {
    name: "Assessoria VIP",
    src: "/assessoria-vip-white.png",
    height: 64,
  },
  {
    name: "Empetur",
    src: "/empetur - Branca.webp",
    height: 50,
  },
] as const;

const dividerStyle = {
  width: 1,
  height: 48,
  margin: "0 24px",
  flex: "0 0 auto",
  background: "rgba(231, 200, 138, 0.78)",
} as const;

/** Faixa compacta de marcas parceiras, com rolagem horizontal no mobile. */
export function ParceirosLogos() {
  return (
    <section
      aria-label="Marcas e Parceiros"
      style={{
        width: "100%",
        margin: 0,
        overflow: "hidden",
        backgroundColor: "#360005",
        backgroundImage: "url(/marcas-parceiros-fundo-faixa.png)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        className="partners-logo-ticker [&::-webkit-scrollbar]:hidden"
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 24px",
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        <p
          style={{
            margin: 0,
            flex: "0 0 auto",
            color: "#E7C88A",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.72rem",
            fontWeight: 500,
            letterSpacing: "0.22em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          MARCAS E PARCEIROS
        </p>

        <span aria-hidden="true" style={dividerStyle} />

        <ul
          aria-label="Logomarcas parceiras"
          role="list"
          style={{
            margin: 0,
            padding: 0,
            display: "flex",
            flex: "1 0 auto",
            flexWrap: "nowrap",
            alignItems: "center",
            listStyle: "none",
          }}
        >
          {PARCEIROS.map(({ name, src, height }, index) => (
            <li
              key={name}
              role="listitem"
              style={{
                display: "flex",
                flex: "0 0 auto",
                alignItems: "center",
              }}
            >
              <img
                src={src}
                alt={name}
                loading="lazy"
                style={{
                  display: "block",
                  width: "auto",
                  height,
                  maxHeight: height,
                  objectFit: "contain",
                  flex: "0 0 auto",
                }}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  const fallback = event.currentTarget
                    .nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = "inline-block";
                }}
              />
              <span
                style={{
                  display: "none",
                  color: "#FFFFFF",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </span>
              {index < PARCEIROS.length - 1 ? (
                <span aria-hidden="true" style={dividerStyle} />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
