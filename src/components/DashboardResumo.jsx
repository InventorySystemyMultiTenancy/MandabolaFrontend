import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { CountUp } from "./CountUp";

const reais = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const nomeMes = (mes) => {
  if (!mes) return "";
  const [a, m] = mes.split("-").map(Number);
  const nome = new Date(a, m - 1, 1).toLocaleString("pt-BR", { month: "long" });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}/${a}`;
};

const mesAnterior = (mes) => {
  if (!/^\d{4}-\d{2}$/.test(mes || "")) return null;
  const [a, m] = mes.split("-").map(Number);
  return m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, "0")}`;
};

// ---- Ícones de traço (consistentes, 24px) ----
const Icone = ({ d, className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
    {[].concat(d).map((p) => (
      <path key={p} strokeLinecap="round" strokeLinejoin="round" d={p} />
    ))}
  </svg>
);
const ICONES = {
  vendas: ["M3 17l6-6 4 4 8-8", "M14 7h7v7"],
  pix: ["M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2z", "M4 10h16", "M8 15h3"],
  dinheiro: ["M3 7h18v10H3z", "M12 9.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z", "M6 10v4M18 10v4"],
  gasto: ["M12 3v18", "M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 2.6 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3"],
  manutencao: ["M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"],
  movimentacao: ["M4 7h13l-3-3", "M20 17H7l3 3"],
  alerta: ["M12 9v4", "M12 17h.01", "M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"],
  ok: ["M5 13l4 4L19 7"],
  trofeu: ["M8 21h8M12 17v4", "M7 4h10v5a5 5 0 01-10 0z", "M17 6h3a3 3 0 01-3 3M7 6H4a3 3 0 003 3"],
  seta: ["M9 5l7 7-7 7"],
  mais: ["M12 5v14M5 12h14"],
  carrinho: ["M3 4h2l2.4 10.2a2 2 0 002 1.6h7.7a2 2 0 001.9-1.4L21 8H6", "M10 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z"],
};

function CardValor({ titulo, valor, detalhe, icone, atraso, className = "" }) {
  return (
    <div className={`mb-kpi reveal ${className}`} style={{ "--reveal-delay": `${atraso}ms` }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-100/70">{titulo}</p>
        <span className="mb-kpi-icone">
          <Icone d={ICONES[icone]} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-white">
        <CountUp valor={valor} formatar={reais} />
      </p>
      {detalhe && <p className="mt-1 text-xs text-blue-100/60">{detalhe}</p>}
    </div>
  );
}

function Esqueleto() {
  return (
    <div className="mb-financeiro">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.35fr_1fr_1fr]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Boxes do topo do Dashboard: valores do mês, manutenções, movimentações,
// alertas de estoque e top máquinas/produtos. Dados e regras iguais aos de
// antes; `atualizacao` muda quando o usuário clica em Atualizar.
export function DashboardResumo({ podeManutencoes, podeMovimentacoes, podeCarrinhos, alertasEstoque, atualizacao = 0 }) {
  const [dados, setDados] = useState(null);
  const [anterior, setAnterior] = useState(null);
  const [piscar, setPiscar] = useState(false);

  useEffect(() => {
    let ativo = true;
    api
      .get("/dashboard/resumo")
      .then((res) => {
        if (!ativo) return;
        setDados(res.data);
        if (atualizacao > 0) {
          setPiscar(true);
          setTimeout(() => ativo && setPiscar(false), 900);
        }
        // Mês anterior (mesma rota), só para referência no card de vendas
        const mesPassado = res.data?.valores ? mesAnterior(res.data.mes) : null;
        if (mesPassado) {
          api
            .get("/dashboard/resumo", { params: { mes: mesPassado } })
            .then((r) => ativo && setAnterior(r.data))
            .catch(() => {});
        }
      })
      .catch(() => ativo && setDados({ manutencoes: { abertas: 0 } }));
    return () => {
      ativo = false;
    };
  }, [atualizacao]);

  const v = dados?.valores;
  const abertas = dados?.manutencoes?.abertas || 0;
  const pendentes = dados?.manutencoes?.pendentes || 0;
  const top = dados?.top;
  const vendasAnterior = Number(anterior?.valores?.vendasMes || 0);
  const percentualDoAnterior =
    v && vendasAnterior > 0 ? Math.round((Number(v.vendasMes || 0) / vendasAnterior) * 100) : null;

  const maxMaquina = Math.max(1, ...(top?.maquinas || []).map((m) => Number(m.total) || 0));
  const maxProduto = Math.max(1, ...(top?.produtos || []).map((p) => Number(p.quantidade) || 0));

  const nivelAlerta = !alertasEstoque?.total ? "ok" : alertasEstoque.total >= 10 ? "critico" : "atencao";

  return (
    <div className="space-y-5 md:space-y-6 mb-8">
      {/* ---------------- Valores do mês ---------------- */}
      {!dados && <Esqueleto />}
      {v && (
        <section className={`mb-financeiro reveal ${piscar ? "mb-atualizado" : ""}`} aria-label="Valores do mês">
          <div className="mb-financeiro-luz" aria-hidden="true" />
          <div className="relative flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <span className="mb-kpi-icone"><Icone d={ICONES.vendas} className="h-4 w-4" /></span>
              Valores do mês
            </h2>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-blue-100">
              {nomeMes(dados.mes)}
            </span>
          </div>

          <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
            {/* Faturamento total: destaque */}
            <div className="mb-kpi-total reveal sm:col-span-2 lg:col-span-1 lg:row-span-2" style={{ "--reveal-delay": "60ms" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-yellow">Vendas no mês</p>
                <span className="mb-kpi-icone mb-kpi-icone-ouro"><Icone d={ICONES.vendas} className="h-4 w-4" /></span>
              </div>
              <p className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow">
                <CountUp valor={v.vendasMes} formatar={reais} duracao={1400} />
              </p>
              <p className="mt-2 text-sm text-blue-100/75">Machine Pay + dinheiro físico</p>

              {percentualDoAnterior !== null && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-blue-100/75">
                    <span>{nomeMes(anterior.mes)} fechou em {reais(vendasAnterior)}</span>
                    <span className="font-bold text-accent-yellow">{percentualDoAnterior}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="mb-barra h-full rounded-full bg-gradient-to-r from-cyan-300 via-primary-light to-accent-yellow"
                      style={{ "--barra": `${Math.min(100, percentualDoAnterior)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-blue-100/50">Mês atual em andamento comparado ao mês anterior completo</p>
                </div>
              )}
            </div>

            <CardValor
              titulo="Machine Pay (entrada)"
              valor={v.machinePay}
              icone="pix"
              atraso={120}
              detalhe={v.machinePayFonte === "monitor" ? "PIX e cartão de todas as máquinas" : "PIX e cartão lançados nas coletas"}
            />
            <CardValor titulo="Dinheiro físico" valor={v.dinheiroFisico} icone="dinheiro" atraso={180} detalhe="Notas, moedas e fichas das coletas" />
            <CardValor titulo="Gasto variável" valor={v.gastoVariavel} icone="gasto" atraso={240} detalhe="Gastos dos roteiros no mês" className="sm:col-span-2" />
          </div>
        </section>
      )}

      {/* ---------------- Cards operacionais ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {podeManutencoes && (
          <Link
            to="/manutencoes"
            className={`mb-op reveal ${abertas ? "mb-op-perigo" : ""}`}
            style={{ "--reveal-delay": "0ms" }}
          >
            <div className="flex items-start justify-between">
              <span className={`mb-op-icone ${abertas ? "bg-red-50 text-red-600" : "bg-primary/10 text-primary"}`}>
                <Icone d={ICONES.manutencao} />
              </span>
              {abertas > 0 && (
                <span className="relative flex h-3 w-3" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              )}
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500">Manutenções</p>
            <p className={`text-3xl font-extrabold ${abertas ? "text-red-600" : "text-primary-dark"}`}>
              {abertas ? <CountUp valor={abertas} formatar={(n) => Math.round(n)} /> : "Tudo certo"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {abertas ? `${pendentes} pendente(s) · ${abertas - pendentes} em andamento` : "Nenhuma manutenção pendente"}
            </p>
            <span className="mb-op-acao">
              Ver manutenções <Icone d={ICONES.seta} className="h-4 w-4 mb-op-seta" />
            </span>
          </Link>
        )}

        {podeMovimentacoes && (
          <div className="mb-op mb-op-destaque reveal" style={{ "--reveal-delay": "80ms" }}>
            <span className="mb-op-icone bg-accent-yellow/20 text-amber-700">
              <Icone d={ICONES.movimentacao} />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-500">Movimentações</p>
            <p className="text-xl font-extrabold text-primary-dark">Arrecadação e roteiros</p>
            <p className="mt-1 text-sm text-slate-500">Registre coletas e abastecimentos das máquinas</p>
            <div className="mt-auto pt-4 flex flex-wrap gap-2">
              <Link to="/movimentacoes" className="mb-btn-sm mb-btn-sm-primario">
                <Icone d={ICONES.mais} className="h-4 w-4" /> Nova movimentação
              </Link>
              {podeCarrinhos && (
                <Link to="/carrinhos" className="mb-btn-sm mb-btn-sm-claro">
                  <Icone d={ICONES.carrinho} className="h-4 w-4" /> Carrinhos
                </Link>
              )}
            </div>
          </div>
        )}

        {alertasEstoque && (
          <button
            type="button"
            onClick={() =>
              document.getElementById("alertas-estoque-maquinas")?.scrollIntoView({ behavior: "smooth" })
            }
            className={`mb-op reveal text-left ${nivelAlerta === "critico" ? "mb-op-perigo" : nivelAlerta === "atencao" ? "mb-op-atencao" : ""}`}
            style={{ "--reveal-delay": "160ms" }}
          >
            <span
              className={`mb-op-icone ${
                nivelAlerta === "ok" ? "bg-emerald-50 text-emerald-600" : nivelAlerta === "critico" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
              }`}
            >
              <Icone d={nivelAlerta === "ok" ? ICONES.ok : ICONES.alerta} />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-500">Alertas de Estoque</p>
            <p
              className={`text-3xl font-extrabold ${
                nivelAlerta === "ok" ? "text-emerald-600" : nivelAlerta === "critico" ? "text-red-600" : "text-orange-600"
              }`}
            >
              <CountUp valor={alertasEstoque.total} formatar={(n) => Math.round(n)} />
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {alertasEstoque.total
                ? `${alertasEstoque.maquinas} máquina(s) · ${alertasEstoque.lojas} loja(s)`
                : "Estoque das máquinas e lojas em dia"}
            </p>
            {alertasEstoque.total > 0 && (
              <span className="mb-op-acao">
                Ver alertas <Icone d={ICONES.seta} className="h-4 w-4 mb-op-seta" />
              </span>
            )}
          </button>
        )}
      </div>

      {/* ---------------- Top do mês ---------------- */}
      {top && (
        <section className="mb-painel reveal" aria-label="Top do mês">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary-dark">
              <span className="mb-op-icone h-9 w-9 bg-accent-yellow/20 text-amber-700">
                <Icone d={ICONES.trofeu} className="h-4 w-4" />
              </span>
              Top do mês
            </h2>
            <span className="text-sm text-slate-500">{nomeMes(dados.mes)}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary mb-3">Máquinas que mais vendem</p>
              {top.maquinas.length === 0 && <p className="text-sm text-slate-500">Sem coletas no mês.</p>}
              <ol className="space-y-3">
                {top.maquinas.map((m, i) => (
                  <li key={m.maquinaId} className="reveal" style={{ "--reveal-delay": `${i * 70}ms` }}>
                    <div className="flex items-center gap-3">
                      <span className={`mb-rank ${i === 0 ? "mb-rank-ouro" : ""}`}>{i + 1}</span>
                      <Link to={`/maquinas/${m.maquinaId}`} className="flex-1 min-w-0 hover:text-primary">
                        <p className="font-semibold truncate">{m.nome}</p>
                        {m.loja && <p className="text-xs text-slate-500 truncate">{m.loja}</p>}
                      </Link>
                      <span className="font-bold text-primary-dark tabular-nums">{reais(m.total)}</span>
                    </div>
                    <div className="ml-10 mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="mb-barra h-full rounded-full bg-gradient-to-r from-primary to-primary-light" style={{ "--barra": `${(Number(m.total) / maxMaquina) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary mb-3">Produtos que mais saem</p>
              {top.produtos.length === 0 && <p className="text-sm text-slate-500">Sem saídas de pelúcias no mês.</p>}
              <ol className="space-y-3">
                {top.produtos.map((p, i) => (
                  <li key={p.produtoId} className="reveal" style={{ "--reveal-delay": `${i * 70}ms` }}>
                    <div className="flex items-center gap-3">
                      <span className={`mb-rank ${i === 0 ? "mb-rank-ouro" : ""}`}>{i + 1}</span>
                      <span className="text-xl">{p.emoji}</span>
                      <p className="flex-1 font-semibold truncate">{p.nome}</p>
                      <span className="font-bold text-primary-dark tabular-nums">{p.quantidade} un.</span>
                    </div>
                    <div className="ml-10 mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="mb-barra h-full rounded-full bg-gradient-to-r from-accent-yellow to-amber-500" style={{ "--barra": `${(Number(p.quantidade) / maxProduto) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
