import { WHATSAPP_URL } from "@/lib/contact";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/newwed/SiteShell";
import { VerticalHero } from "@/components/newwed/VerticalHero";
import { Section } from "@/components/newwed/Section";
import { CtaBlock } from "@/components/newwed/CtaBlock";
import pipaImg from "@/assets/pipa.jpg";
import pernambucoImg from "@/assets/dest-pernambuco.jpg";
import milagresImg from "@/assets/dest-milagres.jpg";

export const Route = createFileRoute("/destinos")({
  component: DestinosPage,
});

const destinos = [
  { nome: "Pernambuco", img: "/famtour-noronha.webp", tag: "Premium" },
  { nome: "São Miguel dos Milagres", img: milagresImg, tag: "Alagoas" },
  { nome: "Fortaleza · Jericoacoara", img: pernambucoImg, tag: "Ceará" },
  { nome: "Gostoso e Pipa", img: "/famtour-rn.webp", tag: "Rio Grande do Norte" },
];

const incluidos = [
  { t: "Hospedagem", d: "Pousadas e resorts selecionados" },
  { t: "Visitas técnicas", d: "Os fornecedores certos do destino" },
  { t: "Experiências", d: "Vivências reais de Destination" },
  { t: "Transfer", d: "Logística completa entre paradas" },
];

function DestinosPage() {
  return (
    <SiteShell>
      <VerticalHero
        eyebrow="New Wed Destinos · Famtours imersivos"
        title={
          <>
            Experiências
            <br />
            que transformam
            <br />
            <em className="text-cream/55 italic">destinos em desejo.</em>
          </>
        }
        description="Apresentamos os destinos do Nordeste para profissionais de casamentos de todo o Brasil, gerando conhecimento, conexões e negócios reais."
        image="/famtour-noronha.webp"
        accent="oklch(0.30 0.045 165 / 0.55)"
        ctaPrimary={{ label: "Quero participar", href: "#contato" }}
        ctaSecondary={{ label: "Ver próximo Famtour", href: "#famtours" }}
      />

      {/* Destinos grid */}
      <Section variant="dark2" id="destinos">
        <div className="max-w-3xl">
          <div className="eyebrow mb-2">Destinos</div>
          <h2 className="sec-title text-cream">
            Quatro territórios.
            <br />
            <em>Curadoria de doze anos no mercado de casamentos.</em>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-12">
          {destinos.map((d) => (
            <div key={d.nome} className="relative aspect-[3/4] overflow-hidden rounded-[3px] group">
              <img
                src={d.img}
                alt={d.nome}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, oklch(0.14 0.012 40 / 0.95) 0%, oklch(0.14 0.012 40 / 0.1) 70%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[8px] tracking-[0.25em] uppercase text-cream/55 mb-1 font-light">
                  {d.tag}
                </div>
                <div className="serif text-cream text-base md:text-lg leading-tight">{d.nome}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Tudo incluso */}
      <div className="bg-green text-cream px-6 md:px-12 py-14 md:py-16">
        <div className="text-center mb-10">
          <div className="eyebrow">Tudo incluso na Famtour</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {incluidos.map((i) => (
            <div key={i.t} className="text-center">
              <div className="w-12 h-12 rounded-full border border-cream/25 mx-auto mb-4 flex items-center justify-center">
                <span className="serif text-cream/65 text-sm">✦</span>
              </div>
              <div className="serif text-cream text-lg mb-1.5">{i.t}</div>
              <div className="text-[10px] text-cream/55 font-light leading-snug">{i.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Próxima Famtour — Noronha */}
      <Section variant="cream" id="famtours">
        <div className="max-w-3xl">
          <div className="eyebrow-dark mb-2">Próxima imersão</div>
          <h2 className="sec-title text-dark">
            Famtour Noronha
            <br />
            <em>28 jun — 02 jul.</em>
          </h2>
          <p className="text-dark/55 text-[13px] leading-[1.85] font-light mt-5 max-w-xl">
            Cinco dias de imersão técnica, networking e curadoria com a Cindy Noel e Ed Andrade. Conheça os hotéis que realmente atendem, os fornecedores que entregam e os destinos que vendem.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <a href="/?edicao=famtour-noronha-agosto-2026#form" className="btn btn-solid">Garantir minha vaga</a>
            <a href="/contato" className="btn btn-outline-dark">Ver roteiro completo</a>
          </div>
        </div>
      </Section>

      {/* Próxima Famtour — Rio Grande do Norte */}
      <Section variant="dark2" id="famtour-rn">
        <div className="max-w-3xl">
          <div className="eyebrow mb-2">Próxima imersão</div>
          <h2 className="sec-title text-cream">
            FamTour Rio Grande do Norte
            <br />
            <em>26 jul — 30 jul.</em>
          </h2>
          <p className="text-cream/55 text-[13px] leading-[1.85] font-light mt-5 max-w-xl">
            Cinco dias de imersão técnica, networking e curadoria com a Cindy Noel e Ed Andrade. Conheça os hotéis que realmente atendem, os fornecedores que entregam e os destinos que vendem.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <a href="/?edicao=famtour-rn-julho-2026#form" className="btn btn-solid">Garantir minha vaga</a>
            <a href="/contato" className="btn btn-outline-light">Ver roteiro completo</a>
          </div>
        </div>
      </Section>

      <CtaBlock
        eyebrow="Aplicação"
        title={
          <>
            Sua próxima venda
            <br />
            <em>começa aqui.</em>
          </>
        }
        description="Vagas limitadas a profissionais do mercado de casamentos."
        primary={{ label: "Aplicar agora", href: "/#form" }}
        secondary={{ label: "Falar com a equipe", href: "/contato" }}
      />
    </SiteShell>
  );
}
