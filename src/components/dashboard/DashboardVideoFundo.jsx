import { useEffect, useRef, useState } from "react";

// Vídeo de fundo do Dashboard controlado pela rolagem (mesma técnica do
// HeroScrollVideo do box-mecânica): o vídeo fica fixo atrás da página e o
// progresso do scroll — do topo até o rodapé — define o currentTime. Rolar
// para baixo avança, rolar para cima volta.
//
// Bem transparente e clareado (CSS em styles/dashboard.css) para se misturar
// com o fundo claro sem atrapalhar cards e botões.
//
// Os arquivos são codificados só com quadros-chave (todo frame é keyframe),
// sem áudio e com moov no início — é isso que deixa o "scrub" suave.
const VIDEO_DESKTOP = "/dashboard-scroll-scrub.mp4";
const VIDEO_MOBILE = "/dashboard-scroll-scrub-mobile.mp4";
const POSTER = "/dashboard-poster.jpg";
const DURACAO_RESERVA = 7.9; // duração real; usada se o navegador demorar a informar

const consultaMobile = "(max-width: 767px)";

const reduzirMovimento = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const economiaDeDados = () =>
  typeof navigator !== "undefined" && Boolean(navigator.connection?.saveData);

const duracao = (video) =>
  Number.isFinite(video.duration) && video.duration > 0 ? video.duration : DURACAO_RESERVA;

// Buscar exatamente o último quadro trava/pisca em alguns navegadores.
const tempoAlvo = (progresso, total) => Math.min(progresso * total, total - 0.05);

const progressoDaRolagem = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
};

export function DashboardVideoFundo() {
  const videoRef = useRef(null);
  const [estatico] = useState(() => reduzirMovimento() || economiaDeDados());
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.(consultaMobile).matches,
  );
  // Guarda QUAL versão já carregou: ao trocar celular/desktop a nova começa
  // invisível sem precisar resetar estado dentro do efeito.
  const versao = mobile ? "mobile" : "desktop";
  const [versaoPronta, setVersaoPronta] = useState(null);
  const pronto = versaoPronta === versao;

  // Troca a versão do vídeo se a tela mudar de celular para desktop (e vice-versa)
  useEffect(() => {
    const mq = window.matchMedia?.(consultaMobile);
    if (!mq) return undefined;
    const aoMudar = (e) => setMobile(e.matches);
    mq.addEventListener?.("change", aoMudar);
    return () => mq.removeEventListener?.("change", aoMudar);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || estatico) return undefined;

    let cancelado = false;
    let quadro = 0;
    let pendente = null; // último progresso pedido enquanto o vídeo ainda buscava

    const aplicar = (progresso) => {
      if (video.seeking) {
        pendente = progresso;
        return;
      }
      pendente = null;
      video.currentTime = tempoAlvo(progresso, duracao(video));
    };

    const aoRolar = () => {
      if (quadro) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        aplicar(progressoDaRolagem());
      });
    };

    const aoTerminarBusca = () => {
      if (pendente !== null) aplicar(pendente);
    };

    const aoCarregar = () => {
      if (cancelado) return;
      video.currentTime = tempoAlvo(progressoDaRolagem(), duracao(video));
      // iOS/Android não desenham o 1º quadro de um vídeo que nunca tocou:
      // "liga e desliga" rápido força a decodificação.
      const tocar = video.play();
      if (tocar) tocar.then(() => video.pause()).catch(() => {});
      setVersaoPronta(versao);
      window.addEventListener("scroll", aoRolar, { passive: true });
      window.addEventListener("resize", aoRolar, { passive: true });
    };

    video.addEventListener("seeked", aoTerminarBusca);
    video.addEventListener("loadedmetadata", aoCarregar);
    if (video.readyState >= 1) aoCarregar();

    return () => {
      cancelado = true;
      if (quadro) cancelAnimationFrame(quadro);
      video.removeEventListener("seeked", aoTerminarBusca);
      video.removeEventListener("loadedmetadata", aoCarregar);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, [estatico, versao]);

  return (
    <div className="mb-video-fundo" aria-hidden="true">
      {estatico ? (
        <img src={POSTER} alt="" className="mb-video-fundo-midia pronto" />
      ) : (
        <video
          key={versao}
          ref={videoRef}
          className={`mb-video-fundo-midia ${pronto ? "pronto" : ""}`}
          src={mobile ? VIDEO_MOBILE : VIDEO_DESKTOP}
          poster={POSTER}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
        />
      )}
      <div className="mb-video-fundo-veu" />
    </div>
  );
}
