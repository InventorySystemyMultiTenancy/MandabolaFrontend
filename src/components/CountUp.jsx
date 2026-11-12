import { useEffect, useRef, useState } from "react";

const reduzirMovimento = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Mostra um número contando até o valor real (só visual: o valor final é
// sempre o recebido). Recontagem a partir do valor anterior quando muda.
export function CountUp({ valor, formatar = (n) => n, duracao = 1100 }) {
  const alvo = Number(valor) || 0;
  const [atual, setAtual] = useState(reduzirMovimento() ? alvo : 0);
  const anterior = useRef(reduzirMovimento() ? alvo : 0);

  useEffect(() => {
    if (reduzirMovimento()) {
      setAtual(alvo);
      anterior.current = alvo;
      return undefined;
    }
    const inicio = anterior.current;
    const t0 = performance.now();
    let frame;
    const passo = (agora) => {
      const p = Math.min(1, (agora - t0) / duracao);
      const suave = 1 - Math.pow(1 - p, 3); // ease-out
      setAtual(inicio + (alvo - inicio) * suave);
      if (p < 1) frame = requestAnimationFrame(passo);
      else anterior.current = alvo;
    };
    frame = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(frame);
  }, [alvo, duracao]);

  return <span className="tabular-nums">{formatar(atual)}</span>;
}
