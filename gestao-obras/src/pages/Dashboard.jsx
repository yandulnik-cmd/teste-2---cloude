import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Building2, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Plus, Landmark, Zap } from "lucide-react";
import { useObras } from "../hooks/useObras";
import { useCustos, useFaturamentos, useBancos } from "../hooks/useFinanceiro";
import { formatCurrency, STATUS_LABELS } from "../lib/utils";

function GlowCard({ children, className = "", style = {}, span = "" }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  function handleMouseMove(e) {
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (glowRef.current) {
      glowRef.current.style.left = `${x - 150}px`;
      glowRef.current.style.top = `${y - 150}px`;
    }
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`bento-card p-8 flex flex-col ${span} ${className}`}
      style={style}
    >
      <div ref={glowRef} className="glow-dot" />
      {children}
    </div>
  );
}

const STATUS_TAG = {
  planejamento: "tag-amber",
  em_execucao: "tag-emerald",
  concluida: "tag-indigo",
  pausada: "tag-rose",
};

export default function Dashboard() {
  const mesAtual = new Date().toISOString().slice(0, 7);

  const { obras, loading } = useObras();
  const { custos } = useCustos({ mes: mesAtual });
  const { faturamentos } = useFaturamentos({ mes: mesAtual });
  const { bancos } = useBancos();

  const obrasAtivas = obras.filter(o => o.status === "em_execucao");
  const totalContrato = obras.reduce((s, o) => s + (o.valor_contrato || 0), 0);
  const totalReceitas = useMemo(() => faturamentos.reduce((s, f) => s + (f.valor || 0), 0), [faturamentos]);
  const totalCustos = useMemo(() => custos.filter(c => c.tipo !== "admin").reduce((s, c) => s + (c.valor || 0), 0), [custos]);
  const margemBruta = totalReceitas - totalCustos;
  const saldoTotal = bancos.reduce((s, b) => s + (b.saldo_atual || 0), 0);
  const contasAPagar = custos.filter(c => !c.pago).reduce((s, c) => s + (c.valor || 0), 0);
  const contasAReceber = faturamentos.filter(f => !f.recebido).reduce((s, f) => s + (f.valor || 0), 0);
  const obrasAtrasadas = obrasAtivas.filter(o => (o.idp || 1) < 1.0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "#475569" }}>
          Executive Dashboard
        </h2>
        <p className="text-2xl font-black tracking-tight text-white mt-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">

        {/* CARD 1 — Capital Disponível (2x2) */}
        <GlowCard span="col-span-2 row-span-2" style={{ minHeight: "280px" }}>
          <div className="flex justify-between items-start relative z-10 mb-auto">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: "#475569" }}>
                Capital Disponível
              </p>
              <h2 className="text-5xl font-black tracking-tighter text-white mono">
                {saldoTotal >= 1000000
                  ? `${(saldoTotal / 1000000).toFixed(2)}M`
                  : saldoTotal >= 1000
                  ? `${(saldoTotal / 1000).toFixed(1)}k`
                  : formatCurrency(saldoTotal)}
              </h2>
            </div>
            <div className="p-3 rounded-2xl" style={{ background: "rgba(99,102,241,0.1)" }}>
              <Landmark className="w-6 h-6" style={{ color: "#818cf8" }} />
            </div>
          </div>

          <div className="relative z-10 mt-6 space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>
              {bancos.length} conta(s) bancária(s)
            </p>
            {/* Mini bar chart — saldo por banco */}
            <div className="flex items-end gap-1.5 h-14">
              {bancos.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-t-lg transition-all" style={{ background: "rgba(255,255,255,0.05)", height: `${30 + i * 10}%` }} />
                ))
              ) : (
                bancos.map((b, i) => {
                  const maxSaldo = Math.max(...bancos.map(x => x.saldo_atual || 0), 1);
                  const pct = Math.max(5, ((b.saldo_atual || 0) / maxSaldo) * 100);
                  return (
                    <div key={b.id} title={b.nome} className="flex-1 rounded-t-lg transition-all"
                      style={{ height: `${pct}%`, background: i === bancos.length - 1 ? "#6366f1" : "rgba(255,255,255,0.06)" }} />
                  );
                })
              )}
            </div>
            <div className="flex justify-between items-center pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>A Receber</span>
              <span className="text-sm font-black mono" style={{ color: "#34d399" }}>{formatCurrency(contasAReceber)}</span>
            </div>
          </div>
        </GlowCard>

        {/* CARD 2 — Fila de Desembolso (2x2) */}
        <GlowCard span="col-span-2 row-span-2" style={{ minHeight: "280px" }}>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: "#64748b" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f43f5e" }} />
              Fila de Desembolso
            </h3>
            <Link to="/financeiro" className="text-[9px] font-black uppercase tracking-wider transition-colors hover:text-white" style={{ color: "#6366f1" }}>
              Ver tudo
            </Link>
          </div>

          <div className="space-y-2.5 relative z-10 flex-1">
            {custos.filter(c => !c.pago).slice(0, 4).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <p className="text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: "#334155" }}>
                  Nenhuma conta pendente
                </p>
              </div>
            ) : (
              custos.filter(c => !c.pago).slice(0, 4).map((c) => {
                const isHoje = c.data_vencimento === new Date().toISOString().split("T")[0];
                return (
                  <div key={c.id} className="flex justify-between items-center p-3.5 rounded-3xl transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: isHoje ? "rgba(244,63,94,0.1)" : "rgba(99,102,241,0.1)" }}>
                        <span className="text-[8px] font-black" style={{ color: isHoje ? "#fb7185" : "#818cf8" }}>
                          {isHoje ? "HOJE" : c.data_vencimento ? new Date(c.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "—"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-white truncate max-w-32">{c.descricao}</p>
                        <p className="text-[8px] font-bold uppercase" style={{ color: "#475569" }}>
                          {c.tipo === "material" ? "Material" : c.tipo === "mao_de_obra" ? "Mão de Obra" : "Admin"}
                          {c.fornecedor ? ` · ${c.fornecedor}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black mono text-white flex-shrink-0">{formatCurrency(c.valor)}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="relative z-10 mt-4 flex justify-between items-center pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>Total a pagar</span>
            <span className="text-sm font-black mono" style={{ color: "#fb7185" }}>{formatCurrency(contasAPagar)}</span>
          </div>
        </GlowCard>

        {/* CARD 3 — KPI Obras */}
        <GlowCard>
          <div className="flex justify-between items-start relative z-10 mb-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#475569" }}>Portfolio</p>
            <div className="p-2 rounded-xl" style={{ background: "rgba(99,102,241,0.1)" }}>
              <Building2 className="w-4 h-4" style={{ color: "#818cf8" }} />
            </div>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="text-4xl font-black tracking-tighter text-white">{obras.length}</h3>
            <p className="text-[9px] font-bold uppercase mt-1" style={{ color: "#10b981" }}>
              {obrasAtivas.length} em execução
            </p>
          </div>
        </GlowCard>

        {/* CARD 4 — Contratos */}
        <GlowCard>
          <div className="flex justify-between items-start relative z-10 mb-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#475569" }}>Contratos</p>
            <div className="p-2 rounded-xl" style={{ background: "rgba(16,185,129,0.1)" }}>
              <DollarSign className="w-4 h-4" style={{ color: "#34d399" }} />
            </div>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="text-2xl font-black tracking-tighter text-white mono">
              {totalContrato >= 1000000 ? `${(totalContrato / 1000000).toFixed(1)}M` : `${(totalContrato / 1000).toFixed(0)}k`}
            </h3>
            <p className="text-[9px] font-bold uppercase mt-1" style={{ color: "#475569" }}>valor total</p>
          </div>
        </GlowCard>

        {/* CARD 5 — Faturado no Mês */}
        <GlowCard>
          <div className="flex justify-between items-start relative z-10 mb-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#475569" }}>Faturado</p>
            <div className="p-2 rounded-xl" style={{ background: "rgba(16,185,129,0.1)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "#34d399" }} />
            </div>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="text-2xl font-black tracking-tighter text-white mono">
              {totalReceitas >= 1000 ? `${(totalReceitas / 1000).toFixed(1)}k` : formatCurrency(totalReceitas)}
            </h3>
            <p className="text-[9px] font-bold uppercase mt-1" style={{ color: "#475569" }}>este mês</p>
          </div>
        </GlowCard>

        {/* CARD 6 — Margem Bruta */}
        <GlowCard>
          <div className="flex justify-between items-start relative z-10 mb-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#475569" }}>Margem</p>
            <div className="p-2 rounded-xl" style={{ background: margemBruta >= 0 ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)" }}>
              {margemBruta >= 0
                ? <TrendingUp className="w-4 h-4" style={{ color: "#34d399" }} />
                : <TrendingDown className="w-4 h-4" style={{ color: "#fb7185" }} />
              }
            </div>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="text-2xl font-black tracking-tighter mono" style={{ color: margemBruta >= 0 ? "#34d399" : "#fb7185" }}>
              {margemBruta >= 0 ? "+" : ""}{margemBruta >= 1000 ? `${(margemBruta / 1000).toFixed(1)}k` : formatCurrency(margemBruta)}
            </h3>
            <p className="text-[9px] font-bold uppercase mt-1" style={{ color: "#475569" }}>bruta no mês</p>
          </div>
        </GlowCard>

        {/* CARD 7 — Quick Action */}
        <Link to="/custos/novo">
          <div className="bento-card p-8 flex flex-col items-center justify-center gap-3 cursor-pointer h-full"
            style={{ background: "#f8fafc", borderColor: "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "#ffffff"}
            onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#6366f1" }}>
              <Plus className="w-6 h-6 text-white" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#020617" }}>
              Novo Gasto
            </p>
          </div>
        </Link>

        {/* CARD 8 — Alerta / Insight */}
        <GlowCard className="cursor-pointer" style={{ background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.2)" }}>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <Zap className="w-5 h-5" style={{ color: "rgba(255,255,255,0.4)" }} />
            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Insight</span>
          </div>
          <p className="text-[10px] font-bold text-white leading-snug relative z-10">
            {obrasAtrasadas.length > 0
              ? `${obrasAtrasadas.length} obra(s) com IDP abaixo de 1.0. Verifique o cronograma.`
              : totalCustos > totalReceitas && totalReceitas > 0
              ? "Custos maiores que receitas este mês. Revise os lançamentos."
              : "Tudo certo! Sem alertas críticos no momento."}
          </p>
        </GlowCard>

        {/* CARD 9 — Lista de Obras (full width) */}
        <div className="col-span-2 lg:col-span-4 bento-card p-8">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "#64748b" }}>
              Portfolio de Obras
            </h3>
            <Link to="/obras" className="text-[9px] font-black uppercase tracking-wider hover:text-white transition-colors" style={{ color: "#6366f1" }}>
              Ver todas →
            </Link>
          </div>

          {obras.length === 0 ? (
            <div className="text-center py-8 relative z-10">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#334155" }}>
                Nenhuma obra cadastrada
              </p>
              <Link to="/obras/nova" className="text-[10px] font-black uppercase tracking-wider mt-2 inline-block" style={{ color: "#6366f1" }}>
                + Cadastrar primeira obra
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
              {obras.slice(0, 6).map((obra) => (
                <Link key={obra.id} to={`/obras/${obra.id}`}>
                  <div className="p-4 rounded-2xl transition-all cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[10px] font-black uppercase text-white truncate max-w-36">{obra.nome}</p>
                        <p className="text-[8px] font-bold mt-0.5 truncate max-w-36" style={{ color: "#475569" }}>{obra.cliente}</p>
                      </div>
                      <span className={STATUS_TAG[obra.status] || "tag-indigo"}>{STATUS_LABELS[obra.status]}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>Progresso</span>
                        <span className="text-[8px] font-black mono" style={{ color: "#818cf8" }}>{(obra.percentual_real || 0).toFixed(0)}%</span>
                      </div>
                      <div className="progress-dark">
                        <div className="progress-fill-indigo" style={{ width: `${obra.percentual_real || 0}%` }} />
                      </div>
                      <p className="text-[9px] font-black mono text-right text-white">{formatCurrency(obra.valor_contrato)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
