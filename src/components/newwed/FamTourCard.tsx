import { Check, Plane } from "lucide-react";
import {
  formatCurrency,
  type FamtourEdition,
} from "@/lib/famtours";

type Props = {
  famtour: FamtourEdition;
  onLearnMore: (slug: string) => void;
  onRegister: (slug: string) => void;
};

export function FamTourCard({ famtour, onLearnMore, onRegister }: Props) {
  return (
    <article className="group flex h-full flex-col border border-black/15 bg-white transition-colors hover:border-teal-600">
      <img
        src={famtour.imagem}
        alt={famtour.imagemAlt}
        loading="lazy"
        className="h-56 w-full object-cover"
      />

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-[#2E8E8E]">
          {famtour.label}
        </p>
        <h3 className="mt-2 font-serif text-[1.8rem] font-normal leading-[1.05] text-[#191010]">
          {famtour.destino}
        </h3>
        <p className="mt-2 font-sans text-sm text-black/65">
          {famtour.periodo}
        </p>

        <ul className="my-5 flex flex-col gap-2">
          {famtour.inclusos
            .filter((item) => item !== "Aéreo incluso")
            .map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 font-sans text-sm leading-relaxed text-[#191010]"
              >
                <Check
                  aria-hidden="true"
                  size={16}
                  color="#2E8E8E"
                  strokeWidth={2.5}
                  className="mt-1 shrink-0"
                />
                <span>{item}</span>
              </li>
            ))}
        </ul>

        <div className="mt-auto border-t border-black/10 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#7A2535]">
              {famtour.vagas} VAGAS
            </span>
            <span className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[#2E8E8E]">
              <Plane aria-hidden="true" size={17} strokeWidth={1.8} />
              AÉREO INCLUSO
            </span>
          </div>

          <div className="mt-5 text-right">
            <p className="font-serif text-[clamp(1.8rem,4vw,2.35rem)] leading-none text-[#7A2535]">
              {famtour.parcelaQuantidade}x de{" "}
              {formatCurrency(famtour.parcelaCentavos)}
            </p>
            <p className="mt-2 font-sans text-xs uppercase tracking-[0.08em] text-black/55">
              {formatCurrency(famtour.valorAVistaCentavos)} à vista
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onLearnMore(famtour.slug)}
              className="min-h-12 border border-[#7A2535] bg-white px-4 py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[#7A2535] transition-colors hover:bg-[#F7F4EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E8E8E]"
            >
              SABER MAIS
            </button>
            <button
              type="button"
              onClick={() => onRegister(famtour.slug)}
              className="min-h-12 border border-[#7A2535] bg-[#7A2535] px-4 py-3 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#641D2C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E8E8E]"
            >
              FAZER INSCRIÇÃO
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
