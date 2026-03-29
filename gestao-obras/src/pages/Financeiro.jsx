import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, Plus, CheckCircle, Clock, CreditCard, Landmark } from "lucide-react";
import { useCustos, useFaturamentos, useBancos } from "../hooks/useFinanceiro";
import { formatCurrency } from "../lib/utils";

function DRERow({ label, value, type, indent = false, bold = false }) {
  const colors = { receita: "#34d399", custo: "#fb7185", pos: "#818cf8", neg: "#fb7185" };
  return (
    <div className={`flex justify-between py-1.5 ${indent ? "pl-4" : ""}`}>
      <span className={`text-sm ${bold ? "font-black text-white" : ""}`} style={bold ? {} : { color: "#94a3b8" }}>{label}</span>
      <span className={`text-sm mono ${bold ? "font-black" : "font-bold"}`} style={{ color: colors[type] }}>
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

export default function Financeiro() {
  const mesAtual = new Date().toISOString().slice(0, 7);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [tab, setTab] = useState("dre");

  const { custos, loading: lc, updateCusto } = useCustos({ mes: mesSelecionado });
  const { faturamentos, loading: lf, updateFaturamento } = useFaturamentos({ mes: mesSelecionado });
  const { bancos, loading: lb } = useBancos();

  const totalReceitas = useMemo(() => faturamentos.reduce((s, f) => s + (f.valor || 0), 0), [faturamentos]);
  const totalDiretos = useMemo(() => custos.filter(c => c.tipo !== "admin").reduce((s, c) => s + (c.valor || 0), 0), [custos]);
  const totalAdmin = useMemo(() => custos.filter(c => c.tipo === "admin").reduce((s, c) => s + (c.valor || 0), 0), [custos]);
  const margemBruta = totalReceitas - totalDiretos;
  const margemLiquida = margemBruta - totalAdmin;

  const contasAPagar = custos.filter(c => !c.pago);
  const contasAReceber = faturamentos.filter(f => !f.recebido);
  const totalAPagar = contasAPagar.reduce((s, c) => s + (c.valor || 0), 0);
  const totalAReceber = contasAReceber.reduce((s, f) => s + (f.valor || 0), 0);
  const saldoTotal = bancos.reduce((s, b) => s + (b.saldo_atual || 0), 0);

  const marcarPago = async (c) => await updateCusto(c.id, { pago: true, data_pagamento: new Date().toISOString().split("T")[0] });
  const marcarRecebido = async (f) => await updateFaturamento(f.id, { recebido: true, data_recebimento: new Date().toISOString().split("T")[0] });

  const tabs = [
    { key: "dre", label: "DRE" },
    { key: "pagar", label: "A Pagar", count: contasAPagar.length },
    { key: "receber", label: "A Receber", count: contasAReceber.length },
    { key: "todos", label: "Todos" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: "#475569" }}>Controle Financeiro</p>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">Financeiro</h1>
        </div>
        <div className="flex gap-2">
          <input type="month" value={mesSelecionado} onChange={e => setMesSelecionado(e.target.value)}
            className="input-dark text-xs" style={{ width: "160px", colorScheme: "dark" }} />
          <Link to="/custos/novo"><button className="btn-primary"><Plus className="w-4 h-4" /> Custo</button></Link>
          <Link to="/faturamentos/novo"><button className="btn-ghost-dark"><TrendingUp className="w-4 h-4" /> Faturar</button></Link>
        </div>
      </div>

      {/* Bancos */}
      {bancos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {bancos.map(b => (
            <div key={b.id} className="dark-card p-4 flex items-center gap-3" style={{ borderLeft: "3px solid #6366f1" }}>
              <div className="p-2 rounded-xl" style={{ background: "rgba(99,102,241,0.1)" }}>
                <Landmark className="w-4 h-4" style={{ color: "#818cf8" }} />
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>{b.nome}</p>
                <p className={`text-lg font-black mono ${(b.saldo_atual || 0) >= 0 ? "text-white" : ""}`}
                  style={(b.saldo_atual || 0) < 0 ? { color: "#fb7185" } : {}}>
                  {formatCurrency(b.saldo_atual || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Saldo em Caixa", value: formatCurrency(saldoTotal), icon: Landmark, color: saldoTotal >= 0 ? "#818cf8" : "#fb7185", bg: saldoTotal >= 0 ? "rgba(99,102,241,0.1)" : "rgba(244,63,94,0.1)" },
          { label: "A Receber", value: formatCurrency(totalAReceber), icon: TrendingUp, color: "#34d399", bg: "rgba(16,185,129,0.1)" },
          { label: "A Pagar", value: formatCurrency(totalAPagar), icon: TrendingDown, color: "#fb7185", bg: "rgba(244,63,94,0.1)" },
          { label: "Posição Líquida", value: formatCurrency(saldoTotal + totalAReceber - totalAPagar), icon: DollarSign, color: saldoTotal + totalAReceber - totalAPagar >= 0 ? "#34d399" : "#fb7185", bg: saldoTotal + totalAReceber - totalAPagar >= 0 ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)" },
        ].map(kpi => (
          <div key={kpi.label} className="bento-card p-6">
            <div className="flex justify-between items-start relative z-10">
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "#475569" }}>{kpi.label}</p>
              <div className="p-2 rounded-xl" style={{ background: kpi.bg }}><kpi.icon className="w-4 h-4" style={{ color: kpi.color }} /></div>
            </div>
            <h3 className="text-xl font-black tracking-tighter mono mt-2 relative z-10" style={{ color: kpi.color }}>{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
            style={{
              background: tab === t.key ? "#6366f1" : "rgba(255,255,255,0.04)",
              color: tab === t.key ? "white" : "#64748b",
              border: tab === t.key ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.06)",
            }}>
            {t.label}
            {t.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[8px]"
                style={{ background: tab === t.key ? "rgba(255,255,255,0.2)" : "rgba(244,63,94,0.2)", color: tab === t.key ? "white" : "#fb7185" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="dark-card p-6">
        {tab === "dre" && (
          <>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>
              DRE Gerencial — {new Date(mesSelecionado + "-02").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
            {(lc || lf) ? (
              <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Carregando...</p>
            ) : totalReceitas === 0 && totalDiretos === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-10 text-white" />
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#334155" }}>Sem lançamentos neste mês</p>
              </div>
            ) : (
              <div className="space-y-1 max-w-lg">
                <DRERow label="Receita Bruta (Faturamentos)" value={totalReceitas} type="receita" />
                <DRERow label="(-) Custos Diretos de Obra" value={totalDiretos} type="custo" indent />
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "0.5rem 0" }} />
                <DRERow label="= Margem Bruta" value={margemBruta} type={margemBruta >= 0 ? "pos" : "neg"} bold />
                <DRERow label="(-) Custos Administrativos" value={totalAdmin} type="custo" indent />
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "0.5rem 0" }} />
                <DRERow label="= Margem Líquida" value={margemLiquida} type={margemLiquida >= 0 ? "pos" : "neg"} bold />
                {totalReceitas > 0 && (
                  <p className="text-[9px] font-bold mt-3" style={{ color: "#475569" }}>
                    Margem líquida: {((margemLiquida / totalReceitas) * 100).toFixed(1)}% sobre faturamento
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {tab === "pagar" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "#475569" }}>Contas a Pagar</p>
              <Link to="/custos/novo"><button className="btn-ghost-dark text-[9px]"><Plus className="w-3 h-3" /> Lançar</button></Link>
            </div>
            {contasAPagar.length === 0 ? (
              <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Nenhuma conta pendente</p>
            ) : (
              <div className="space-y-2">
                {contasAPagar.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg" style={{ background: "rgba(244,63,94,0.1)" }}>
                        <CreditCard className="w-3.5 h-3.5" style={{ color: "#fb7185" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase text-white truncate">{c.descricao}</p>
                        <p className="text-[8px] font-bold uppercase" style={{ color: "#475569" }}>
                          {c.data_vencimento && `Vence ${new Date(c.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-black mono" style={{ color: "#fb7185" }}>{formatCurrency(c.valor)}</span>
                      <button className="btn-ghost-dark text-[8px] py-1 px-2" onClick={() => marcarPago(c)}>
                        <CheckCircle className="w-3 h-3" /> Pagar
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-sm font-black" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-white">Total</span>
                  <span className="mono" style={{ color: "#fb7185" }}>{formatCurrency(totalAPagar)}</span>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "receber" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "#475569" }}>Contas a Receber</p>
              <Link to="/faturamentos/novo"><button className="btn-ghost-dark text-[9px]"><Plus className="w-3 h-3" /> Faturar</button></Link>
            </div>
            {contasAReceber.length === 0 ? (
              <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Nenhum faturamento pendente</p>
            ) : (
              <div className="space-y-2">
                {contasAReceber.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)" }}>
                        <TrendingUp className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase text-white truncate">{f.descricao || `Medição #${f.numero_medicao}`}</p>
                        <p className="text-[8px] font-bold uppercase" style={{ color: "#475569" }}>
                          {f.obras?.nome}{f.data_vencimento && ` · Vence ${new Date(f.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-black mono" style={{ color: "#34d399" }}>{formatCurrency(f.valor)}</span>
                      <button className="btn-ghost-dark text-[8px] py-1 px-2" onClick={() => marcarRecebido(f)}>
                        <CheckCircle className="w-3 h-3" /> Receber
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-sm font-black" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-white">Total</span>
                  <span className="mono" style={{ color: "#34d399" }}>{formatCurrency(totalAReceber)}</span>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "todos" && (
          <>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>Todos os Lançamentos</p>
            {custos.length === 0 ? (
              <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Sem lançamentos</p>
            ) : (
              <div className="space-y-2">
                {custos.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-white truncate">{c.descricao}</p>
                      <p className="text-[8px] font-bold uppercase" style={{ color: "#475569" }}>
                        {c.tipo === "material" ? "Material" : c.tipo === "mao_de_obra" ? "M.O." : "Admin"}
                        {c.categoria && ` · ${c.categoria}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={c.pago ? "tag-emerald" : "tag-amber"} style={{ fontSize: "7px" }}>
                        {c.pago ? "Pago" : "Pendente"}
                      </span>
                      <span className="text-sm font-black mono text-white">{formatCurrency(c.valor)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
