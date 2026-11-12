import { useEffect } from "react";

// Revela com animação os elementos com a classe "reveal" dentro do container
// quando entram na tela. Também pega elementos montados depois (seções que
// aparecem quando os dados chegam), via MutationObserver.
// Marca com o atributo data-revealed (o React não mexe nele, diferente do
// className, que é refeito a cada render). CSS em index.css; respeita
// prefers-reduced-motion.
export function useRevealOnScroll(containerRef, ativo = true) {
  useEffect(() => {
    const raiz = containerRef.current;
    if (!ativo || !raiz) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      raiz.querySelectorAll(".reveal").forEach((el) => el.setAttribute("data-revealed", ""));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const revelar = (el) => {
      el.setAttribute("data-revealed", "");
      io.unobserve(el);
    };

    // Já visível ao aparecer (ex: seção que chega depois da API): revela na
    // hora. O resto espera entrar na tela pelo IntersectionObserver.
    const observar = () =>
      raiz.querySelectorAll(".reveal:not([data-revealed])").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.95) revelar(el);
        else io.observe(el);
      });
    observar();

    const mo = new MutationObserver(observar);
    mo.observe(raiz, { childList: true, subtree: true });

    // Rede de segurança: nada pode ficar invisível se algum evento falhar.
    const seguranca = setTimeout(() => {
      raiz
        .querySelectorAll(".reveal:not([data-revealed])")
        .forEach((el) => el.getBoundingClientRect().top < window.innerHeight && revelar(el));
    }, 2500);

    return () => {
      clearTimeout(seguranca);
      io.disconnect();
      mo.disconnect();
    };
  }, [containerRef, ativo]);
}

// Deslocamento suave conforme a rolagem (parallax), aplicado via CSS var
// --parallax-y no elemento. Usa rAF e desliga com reduced-motion.
export function useParallax(ref, fator = 0.15) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    let frame = 0;
    const atualizar = () => {
      frame = 0;
      const y = Math.min(window.scrollY, 600) * fator;
      el.style.setProperty("--parallax-y", `${y.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(atualizar);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    atualizar();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, fator]);
}
