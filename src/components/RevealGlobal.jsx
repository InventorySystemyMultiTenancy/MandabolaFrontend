import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Entrada suave dos blocos de TODAS as páginas (cards, cabeçalhos, tabelas),
// sem precisar mexer em cada página.
//
// Regras para não atrapalhar o uso:
//  - O que já está na tela ao abrir a página só ganha uma animação de
//    entrada (nunca fica escondido).
//  - O que está abaixo da tela fica oculto e aparece ao rolar até ele.
//  - Blocos que surgem depois do carregamento (filtros, buscas, listas que
//    atualizam) aparecem na hora, sem reanimar.
//  - Nada dentro de modais / elementos fixos é tocado.
//  - O Dashboard usa seu próprio sistema (.reveal) e é ignorado aqui.
//  - Rede de segurança: nada oculto que já esteja na tela fica invisível.
//  - prefers-reduced-motion: não faz nada.
const ALVOS = ".mb-page-header, .card, .card-gradient, .stat-card";
const JANELA_ENTRADA_MS = 1200;

const elegivel = (el) =>
  !el.hasAttribute("data-mb-visto") &&
  !el.closest(".reveal, .mb-dashboard, .fixed, [role='dialog']") &&
  // só o bloco mais externo anima (card dentro de card não)
  !el.parentElement?.closest(ALVOS);

export function RevealGlobal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    const raiz = document.getElementById("root");
    if (!raiz) return undefined;
    const inicio = performance.now();
    let ordem = 0;

    const mostrar = (el, animar) => {
      el.removeAttribute("data-mb-pendente");
      if (animar) el.setAttribute("data-mb-entrada", "");
    };

    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          mostrar(e.target, true);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );

    const processar = () => {
      const agora = performance.now();
      const naJanela = agora - inicio < JANELA_ENTRADA_MS;
      raiz.querySelectorAll(ALVOS).forEach((el) => {
        if (!elegivel(el)) return;
        el.setAttribute("data-mb-visto", "");
        const topo = el.getBoundingClientRect().top;
        if (topo < window.innerHeight * 0.96) {
          // já visível: entra animado só no carregamento da página
          if (naJanela) {
            el.style.setProperty("--mb-atraso", `${Math.min(ordem++, 6) * 60}ms`);
            mostrar(el, true);
          }
        } else {
          el.setAttribute("data-mb-pendente", "");
          io.observe(el);
        }
      });
    };

    processar();
    let agendado = 0;
    const mo = new MutationObserver(() => {
      if (!agendado) {
        agendado = requestAnimationFrame(() => {
          agendado = 0;
          processar();
        });
      }
    });
    mo.observe(raiz, { childList: true, subtree: true });

    // Rede de segurança: nada visível pode continuar oculto.
    const seguranca = setInterval(() => {
      raiz.querySelectorAll("[data-mb-pendente]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) mostrar(el, false);
      });
    }, 1500);

    return () => {
      mo.disconnect();
      io.disconnect();
      clearInterval(seguranca);
      if (agendado) cancelAnimationFrame(agendado);
      // Ao trocar de página, nada fica preso oculto.
      raiz.querySelectorAll("[data-mb-pendente]").forEach((el) => el.removeAttribute("data-mb-pendente"));
    };
  }, [pathname]);

  return null;
}
