import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

// MandaAI — "manda aí a sua pergunta".
// Botão flutuante em todas as telas (logado). O usuário fala ou digita e a IA
// responde, mostra dados ou leva direto para a aba certa já preenchida.

const ROTAS_SEM_ASSISTENTE = ["/login", "/registrar", "/creditos", "/style-guide"];
const CHAVE_HISTORICO = "mandaai:conversa";
const CHAVE_VOZ = "mandaai:voz";

const SUGESTOES_PADRAO = [
  "Quanto vendemos este mês?",
  "Quais manutenções estão abertas?",
  "O que está acabando no estoque?",
  "Abre a aba de máquinas",
];

const lerStorage = (storage, chave, padrao) => {
  try {
    const v = storage.getItem(chave);
    return v ? JSON.parse(v) : padrao;
  } catch {
    return padrao;
  }
};
const salvarStorage = (storage, chave, valor) => {
  try {
    storage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem storage: segue sem salvar */
  }
};

const novaId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function IconeMandaAI({ className = "h-6 w-6" }) {
  // Bola com brilho + faísca: "Manda Bola" + IA
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="13.5" r="7.5" fill="currentColor" opacity="0.95" />
      <path d="M6.5 11.5a4.5 4.5 0 0 1 4-3.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <path d="M19 1.8l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" fill="#F5B400" />
    </svg>
  );
}

function IconeMic({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 18.5a6.5 6.5 0 006.5-6.5M5.5 12a6.5 6.5 0 006.5 6.5m0 0V22m0 0h4m-4 0H8m4-7a3 3 0 003-3V5a3 3 0 10-6 0v7a3 3 0 003 3z" />
    </svg>
  );
}

function IconeEnviar({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function TabelaResposta({ tabela }) {
  if (!tabela?.linhas?.length) return null;
  const n = tabela.colunas.length;
  return (
    <div className="mt-2 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-slate-100 text-slate-600">
          <tr>
            {tabela.colunas.map((c) => (
              <th key={c} className="px-2 py-1.5 font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabela.linhas.map((linha, i) => {
            const destaque = linha.length > n && linha[n] === true;
            return (
              <tr key={i} className={`border-t border-slate-100 ${destaque ? "bg-red-50 text-red-800" : ""}`}>
                {linha.slice(0, n).map((cel, j) => (
                  <td key={j} className="px-2 py-1.5 align-top">{String(cel)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Mensagem({ msg, onAtalho, onConfirmar, onCancelar }) {
  if (msg.autor === "usuario") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-white shadow-sm">
          {msg.voz && <span className="mr-1 opacity-75">🎤</span>}
          {msg.texto}
        </div>
      </div>
    );
  }
  const erro = msg.tipo === "erro";
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-dark text-primary-light">
        <IconeMandaAI className="h-4 w-4" />
      </span>
      <div className={`max-w-[88%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm shadow-sm ${erro ? "bg-red-50 text-red-800" : "bg-slate-100 text-slate-800"}`}>
        <p className="whitespace-pre-line">{msg.texto}</p>

        {msg.dados?.cards?.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {msg.dados.cards.map((c) => (
              <div key={c.rotulo} className="rounded-lg bg-white px-2 py-1.5 shadow-sm">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{c.rotulo}</div>
                <div className="text-sm font-bold text-primary-dark">{c.valor}</div>
              </div>
            ))}
          </div>
        )}

        <TabelaResposta tabela={msg.dados?.tabela} />

        {msg.confirmacao && !msg.confirmacao.resolvida && (
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => onConfirmar(msg)}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-dark">
              Confirmar
            </button>
            <button type="button" onClick={() => onCancelar(msg)}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        )}

        {msg.atalhos?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.atalhos.map((a) => (
              <button key={a.rota} type="button" onClick={() => onAtalho(a)}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10">
                {a.rotulo} →
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MandaAI() {
  const { usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [mensagens, setMensagens] = useState(() => lerStorage(sessionStorage, CHAVE_HISTORICO, []));
  const [status, setStatus] = useState("idle"); // idle | ouvindo | pensando
  const [modo, setModo] = useState(null); // ia | basico
  const [sugestoes, setSugestoes] = useState(SUGESTOES_PADRAO);
  const [falarRespostas, setFalarRespostas] = useState(() => lerStorage(localStorage, CHAVE_VOZ, false));

  const recognitionRef = useRef(null);
  const fimRef = useRef(null);
  const inputRef = useRef(null);

  const oculto = !usuario || ROTAS_SEM_ASSISTENTE.some((r) => location.pathname.startsWith(r));
  const vozDisponivel =
    typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => salvarStorage(sessionStorage, CHAVE_HISTORICO, mensagens.slice(-40)), [mensagens]);
  useEffect(() => salvarStorage(localStorage, CHAVE_VOZ, falarRespostas), [falarRespostas]);

  useEffect(() => {
    if (aberto) {
      fimRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [aberto, mensagens.length]);

  useEffect(() => {
    if (!aberto || modo || oculto) return;
    api
      .get("/mandaai/status")
      .then((r) => {
        setModo(r.data?.modo || "ia");
        if (r.data?.sugestoes?.length) setSugestoes(r.data.sugestoes);
      })
      .catch(() => {});
  }, [aberto, modo, oculto]);

  // Atalho: Ctrl+K (ou Cmd+K) abre/fecha a MandaAI; Esc fecha.
  useEffect(() => {
    if (oculto) return undefined;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberto((v) => !v);
      } else if (e.key === "Escape") {
        setAberto(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [oculto]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const falar = useCallback(
    (frase) => {
      if (!falarRespostas || !frase || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(frase.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ""));
        u.lang = "pt-BR";
        window.speechSynthesis.speak(u);
      } catch {
        /* navegador sem voz */
      }
    },
    [falarRespostas],
  );

  const adicionar = (msg) => setMensagens((atual) => [...atual, { id: novaId(), ...msg }]);

  const irPara = useCallback(
    (rota, state) => {
      navigate(rota, state ? { state } : undefined);
      // No celular o painel ocupa a tela: fecha para mostrar a aba aberta.
      if (window.innerWidth < 640) setAberto(false);
    },
    [navigate],
  );

  const enviar = useCallback(
    async (conteudo, { voz = false } = {}) => {
      const pergunta = String(conteudo || "").trim();
      if (!pergunta || status === "pensando") return;
      setTexto("");
      const historico = mensagens.slice(-8).map((m) => ({ autor: m.autor, texto: m.texto }));
      adicionar({ autor: "usuario", texto: pergunta, voz });
      setStatus("pensando");

      try {
        const { data } = await api.post("/mandaai/comando", { texto: pergunta, historico });
        if (data?.modo) setModo(data.modo);
        const r = data?.resultado || {};
        adicionar({
          autor: "ia",
          texto: r.mensagem || "Pronto!",
          dados: r.dados || null,
          atalhos: r.atalhos || [],
          confirmacao: r.status === "confirmar_acao" ? { ...r.acao, resolvida: false } : null,
        });
        falar(r.mensagem);
        if (r.acao?.tipo === "navegar" && r.acao.rota) irPara(r.acao.rota, r.acao.state);
      } catch (error) {
        const msg =
          error.response?.status === 401
            ? "Sua sessão expirou. Entre de novo para usar a MandaAI."
            : error.response?.data?.error || "Não consegui falar com o servidor agora. Tenta de novo?";
        adicionar({ autor: "ia", tipo: "erro", texto: msg });
      } finally {
        setStatus("idle");
      }
    },
    [falar, irPara, mensagens, status],
  );

  const marcarResolvida = (id) =>
    setMensagens((atual) =>
      atual.map((m) => (m.id === id ? { ...m, confirmacao: { ...m.confirmacao, resolvida: true } } : m)),
    );

  const confirmar = async (msg) => {
    marcarResolvida(msg.id);
    setStatus("pensando");
    try {
      const { data } = await api.post("/mandaai/executar", {
        operacao: msg.confirmacao.operacao,
        dados: msg.confirmacao.dados,
      });
      adicionar({ autor: "ia", texto: data?.mensagem || "Feito!", atalhos: data?.atalhos || [] });
      falar(data?.mensagem);
    } catch (error) {
      adicionar({ autor: "ia", tipo: "erro", texto: error.response?.data?.error || "Não consegui concluir. Tenta de novo?" });
    } finally {
      setStatus("idle");
    }
  };

  const cancelar = (msg) => {
    marcarResolvida(msg.id);
    adicionar({ autor: "ia", texto: "Beleza, cancelado. 👍" });
  };

  const ouvir = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      adicionar({ autor: "ia", tipo: "erro", texto: "Este navegador não tem reconhecimento de voz. Use o Chrome ou digite a pergunta." });
      return;
    }
    if (status === "ouvindo") {
      recognitionRef.current?.stop();
      return;
    }
    recognitionRef.current?.abort();
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.interimResults = true;
    rec.continuous = false;
    let final = "";
    rec.onstart = () => setStatus("ouvindo");
    rec.onresult = (e) => {
      let parcial = "";
      for (const r of e.results) {
        if (r.isFinal) final = r[0].transcript;
        else parcial += r[0].transcript;
      }
      setTexto(final || parcial);
    };
    rec.onerror = (e) => {
      setStatus("idle");
      if (e.error === "not-allowed") {
        adicionar({ autor: "ia", tipo: "erro", texto: "Libera o microfone no navegador pra falar comigo. 🎤" });
      }
    };
    rec.onend = () => {
      recognitionRef.current = null;
      setStatus("idle");
      if (final.trim()) enviar(final, { voz: true });
    };
    recognitionRef.current = rec;
    rec.start();
  };

  if (oculto) return null;

  const pensando = status === "pensando";
  const ouvindo = status === "ouvindo";

  return (
    <div className="no-print">
      {/* Botão flutuante */}
      {!aberto && (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-dark py-2.5 pl-2.5 pr-4 font-bold text-white shadow-xl ring-2 ring-accent-yellow transition hover:scale-105 sm:bottom-6 sm:right-6"
          title="MandaAI — manda aí a sua pergunta (Ctrl+K)"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-accent-yellow">
            <IconeMandaAI />
          </span>
          <span className="leading-tight text-left">
            <span className="block text-sm">MandaAI</span>
            <span className="block text-[10px] font-medium text-white/75">manda aí a sua pergunta</span>
          </span>
        </button>
      )}

      {/* Painel */}
      {aberto && (
        <section
          className="fixed inset-0 z-[60] flex flex-col bg-white shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[400px] sm:rounded-2xl sm:ring-1 sm:ring-slate-200"
          aria-label="MandaAI"
        >
          <header className="flex items-center gap-3 bg-gradient-to-r from-primary-dark to-primary px-4 py-3 text-white sm:rounded-t-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-accent-yellow ring-2 ring-accent-yellow/70">
              <IconeMandaAI />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="flex items-center gap-2 text-lg font-extrabold leading-tight">
                MandaAI
                {modo === "basico" && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold" title="Sem chave da OpenAI: entende comandos simples">
                    modo básico
                  </span>
                )}
              </h2>
              <p className="text-xs text-white/80">manda aí a sua pergunta:</p>
            </div>
            <button type="button" onClick={() => setFalarRespostas((v) => !v)}
              className={`rounded-lg p-2 text-sm hover:bg-white/15 ${falarRespostas ? "text-accent-yellow" : "text-white/60"}`}
              title={falarRespostas ? "Respostas faladas: ligado" : "Respostas faladas: desligado"}>
              {falarRespostas ? "🔊" : "🔇"}
            </button>
            {mensagens.length > 0 && (
              <button type="button" onClick={() => setMensagens([])}
                className="rounded-lg p-2 text-xs text-white/70 hover:bg-white/15" title="Limpar conversa">
                Limpar
              </button>
            )}
            <button type="button" onClick={() => setAberto(false)}
              className="rounded-lg p-2 text-xl leading-none text-white/80 hover:bg-white/15" title="Fechar (Esc)">
              ×
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-background-light px-3 py-4">
            {mensagens.length === 0 && (
              <div className="rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                <p className="font-semibold text-primary-dark">
                  Oi{usuario?.nome ? `, ${usuario.nome.split(" ")[0]}` : ""}! Eu sou a MandaAI. 👋
                </p>
                <p className="mt-1">
                  Fala ou digita o que precisa: eu abro a aba certa, puxo números, abro manutenção e já deixo a
                  movimentação preenchida.
                </p>
              </div>
            )}
            {mensagens.map((m) => (
              <Mensagem key={m.id} msg={m} onAtalho={(a) => irPara(a.rota)} onConfirmar={confirmar} onCancelar={cancelar} />
            ))}
            {pensando && (
              <div className="flex items-center gap-2 pl-9 text-xs text-slate-500">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                </span>
                MandaAI pensando...
              </div>
            )}
            <div ref={fimRef} />
          </div>

          {mensagens.length === 0 && (
            <div className="flex gap-1.5 overflow-x-auto border-t border-slate-100 bg-white px-3 py-2">
              {sugestoes.map((s) => (
                <button key={s} type="button" onClick={() => enviar(s)}
                  className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-primary/20">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(texto);
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 sm:rounded-b-2xl"
          >
            {vozDisponivel && (
              <button type="button" onClick={ouvir} disabled={pensando}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition ${ouvindo ? "animate-pulse bg-accent-red" : "bg-primary-dark hover:bg-primary"} disabled:opacity-50`}
                title={ouvindo ? "Parar" : "Falar com a MandaAI"}>
                <IconeMic />
              </button>
            )}
            <input
              ref={inputRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={ouvindo ? "Ouvindo..." : "Manda aí a sua pergunta..."}
              className="h-11 min-w-0 flex-1 rounded-full border border-slate-300 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              maxLength={800}
              disabled={pensando}
            />
            <button type="submit" disabled={pensando || !texto.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-yellow text-primary-dark transition hover:brightness-95 disabled:opacity-40"
              title="Enviar">
              <IconeEnviar />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
