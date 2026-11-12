import { useRef } from "react";
import { ClawMachine3D } from "./ClawMachine3D";
import { useParallax } from "../../hooks/useRevealOnScroll";

const saudacao = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

// Cabeçalho do Dashboard: título, saudação, ações (Atualizar / Veículos) e a
// máquina 3D. Os callbacks são os mesmos de antes; aqui é só apresentação.
export function DashboardHero({ nomeUsuario, onAtualizar, atualizando, mostrarVeiculos, onVeiculos }) {
  const heroRef = useRef(null);
  useParallax(heroRef, 0.12);
  const primeiroNome = String(nomeUsuario || "").split(" ")[0];
  const dataLonga = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const hoje = dataLonga.charAt(0).toUpperCase() + dataLonga.slice(1); // "Quinta-feira, 12 de novembro"

  return (
    <section ref={heroRef} className="mb-hero mb-8">
      <div className="mb-hero-grade" aria-hidden="true" />
      <div className="mb-hero-luz" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 hero-entra">
          <p className="mb-hero-chip">
            <span className="mb-pulso" aria-hidden="true" />
            <span className="hidden sm:inline">Operação ao vivo ·</span>
            <span>{hoje}</span>
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-2 max-w-md text-sm sm:text-base text-blue-100/80">
            {saudacao()}
            {primeiroNome ? `, ${primeiroNome}` : ""}. Visão geral das suas gruas, vendas e operação.
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onAtualizar}
              disabled={atualizando}
              className="mb-btn mb-btn-ouro"
              title="Atualizar dados"
            >
              <svg className={`h-5 w-5 ${atualizando ? "animate-spin" : "mb-btn-icone-gira"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {atualizando ? "Atualizando..." : "Atualizar"}
            </button>
            {mostrarVeiculos && (
              <button type="button" onClick={onVeiculos} className="mb-btn mb-btn-vidro" title="Ir para Veículos">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 13l1.6-4.8A2 2 0 016.5 7h11a2 2 0 011.9 1.2L21 13m-18 0v4a1 1 0 001 1h1m-2-5h18m0 0v4a1 1 0 01-1 1h-1M7 18a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m13 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M7 18h7" />
                </svg>
                Veículos
                <svg className="h-4 w-4 mb-btn-seta" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <ClawMachine3D className="hidden sm:block md:-my-6 md:mr-2" />
      </div>
    </section>
  );
}
