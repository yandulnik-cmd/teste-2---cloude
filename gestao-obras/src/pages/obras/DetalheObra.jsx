import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, DollarSign, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { useObra } from "../../hooks/useObras";
import { useCustos, useFaturamentos } from "../../hooks/useFinanceiro";
import { formatCurrency, formatDate, formatPercent, STATUS_LABELS } from "../../lib/utils";

const STATUS_TAG = {
  planejamento: "tag-amber", em_execucao: "tag-emerald", concluida: "tag-indigo", pausada: "tag-rose",
};

function KPI({ label, value, sub, color = "#818cf8" }) {
  return (
    <div className="bento-card p-5">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] relative z-10" style={{ color: "#475569" }}>{label}</p>
      <p className="text-2xl font-black tracking-tighter mono mt-2 relative z-10" style={{ color }}>{value}</p>
      {sub && <p className="text-[8px] font-bold uppercase mt-1 relative z-10" style={{ color: "#475569" }}>{sub}</p>}
    </div>
  );
}

export default function DetalheObra() {
  const { id } = useParams();
  const { obra, loading, error } = useObra(id);
  const { custos } = useCustos({ obra_id: id });
  const { faturamentos } = useFaturamentos({ obra_id: id });
  const [tab, setTab] = useState("resumo");

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>Carregando...</p></div>;
  if (error) return <div className="p-6" style={{ color: "#fb7185" }}>Erro: {error}</div>;
  if (!obra) return <div className="p-6" style={{ color: "#475569" }}>Obra não encontrada.</div>;

  const progReal = obra.percentual_real || 0;
  const progPlan = obra.percentual_planejado || 0;
  const idp = progPlan > 0 ? progReal / progPlan : 1;

  const custoRealizado = custos.reduce((s, c) => s + (c.valor || 0), 0);
  const valorAgregado = ((obra.valor_contrato || 0) * progReal) / 100;
  const idc = custoRealizado > 0 ? valorAgregado / custoRealizado : 1;
  const totalFaturado = faturamentos.reduce((s, f) => s + (f.valor || 0), 0);
  const lucroEstimado = totalFaturado - custoRealizado;

  const tabs = [
    { key: "resumo", label: "Resumo" },
    { key: "orcamento", label: "Orçamento" },
    { key: "custos", label: "Custos" },
    { key: "faturamentos", label: "Faturamentos" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/obras">
            <button className="btn-ghost-dark w-9 h-9 p-0 flex items-center justify-center rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white">{obra.nome}</h1>
              <span className={STATUS_TAG[obra.status]}>{STATUS_LABELS[obra.status]}</span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: "#475569" }}>
              {obra.cliente}{obra.endereco && ` · ${obra.endereco}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/custos/novo?obra_id=${obra.id}`}><button className="btn-primary"><Plus className="w-4 h-4" /> Custo</button></Link>
          <Link to={`/faturamentos/novo?obra_id=${obra.id}`}><button className="btn-ghost-dark"><TrendingUp className="w-4 h-4" /> Faturar</button></Link>
        </div>
      </div>

      {/* KPIs EVM */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPI label="Contrato" value={formatCurrency(obra.valor_contrato)} />
        <KPI label="Progresso Físico" value={formatPercent(progReal)} sub={`Plan: ${formatPercent(progPlan)}`} color="#818cf8" />
        <KPI label="IDP (Prazo)" value={idp.toFixed(2)} sub={idp < 1 ? "Atrasado" : "No prazo"} color={idp < 0.95 ? "#fb7185" : "#34d399"} />
        <KPI label="IDC (Custo)" value={idc.toFixed(2)} sub={idc < 1 ? "Acima do orçamento" : "Dentro"} color={idc < 0.95 ? "#fb7185" : "#34d399"} />
        <KPI label="Lucro Estimado" value={formatCurrency(lucroEstimado)} color={lucroEstimado >= 0 ? "#34d399" : "#fb7185"} />
      </div>

      {/* Alerta */}
      {(idp < 0.95 || idc < 0.95) && (
        <div className="p-4 rounded-2xl flex items-start gap-3"
          style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#fb7185" }} />
          <div className="space-y-1 text-sm" style={{ color: "#fb7185" }}>
            {idp < 0.95 && <p><strong>Atraso:</strong> Obra {((1 - idp) * 100).toFixed(1)}% abaixo do planejado.</p>}
            {idc < 0.95 && <p><strong>Estouro de Custo:</strong> IDC = {idc.toFixed(2)}.</p>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
            style={{
              background: tab === t.key ? "#6366f1" : "rgba(255,255,255,0.04)",
              color: tab === t.key ? "white" : "#64748b",
              border: tab === t.key ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.06)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="dark-card p-6">
        {tab === "resumo" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>
                <Building2 className="w-3.5 h-3.5 inline mr-1" />Informações
              </p>
              <div className="space-y-3">
                {[
                  ["Cliente", obra.cliente || "—"],
                  ["Endereço", obra.endereco || "—"],
                  ["Área", obra.area_m2 ? `${obra.area_m2} m²` : "—"],
                  ["Início", obra.data_inicio ? formatDate(obra.data_inicio) : "—"],
                  ["Previsão Fim", obra.data_previsao_fim ? formatDate(obra.data_previsao_fim) : "—"],
                  ["R$/m²", obra.area_m2 ? formatCurrency(obra.valor_contrato / obra.area_m2) : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span style={{ color: "#64748b" }}>{l}</span>
                    <span className="font-bold text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>
                <DollarSign className="w-3.5 h-3.5 inline mr-1" />Orçamento Global
              </p>
              <div className="space-y-3">
                {[
                  ["Contrato", formatCurrency(obra.valor_contrato)],
                  ["BDI", `${obra.bdi_percentual || 0}%`],
                  ["Mão de Obra Global", `${obra.mao_de_obra_percentual || 0}%`],
                  ["Contingência", `${obra.contingencia_percentual || 0}%`],
                  ["Custo Direto Disponível", formatCurrency(obra.custo_direto_disponivel)],
                  ["Custo Realizado", formatCurrency(custoRealizado)],
                  ["Total Faturado", formatCurrency(totalFaturado)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span style={{ color: "#64748b" }}>{l}</span>
                    <span className="font-bold mono text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "orcamento" && (
          <>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>Orçamento por Categorias (EAP)</p>
            {(!obra.orcamento_categorias || obra.orcamento_categorias.length === 0) ? (
              <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Nenhuma categoria orçada</p>
            ) : (
              <div className="space-y-3">
                {obra.orcamento_categorias.map(cat => {
                  const gasto = custos.filter(c => c.categoria === cat.categoria).reduce((s, c) => s + (c.valor || 0), 0);
                  const pct = cat.valor_orcado > 0 ? (gasto / cat.valor_orcado) * 100 : 0;
                  const estouro = pct > 100;
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{cat.categoria}</span>
                        <div className="text-right">
                          <span className="text-[10px] font-black mono" style={{ color: estouro ? "#fb7185" : "#f8fafc" }}>
                            {formatCurrency(gasto)}
                          </span>
                          <span className="text-[9px] font-bold ml-1" style={{ color: "#475569" }}>/ {formatCurrency(cat.valor_orcado)}</span>
                        </div>
                      </div>
                      <div className="progress-dark">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: estouro ? "#f43f5e" : "#6366f1" }} />
                      </div>
                      <p className="text-[8px] font-bold text-right" style={{ color: "#475569" }}>{pct.toFixed(1)}% utilizado</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "custos" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "#475569" }}>Custos Lançados</p>
              <Link to={`/custos/novo?obra_id=${id}`}>
                <button className="btn-ghost-dark text-[9px]"><Plus className="w-3 h-3" /> Lançar</button>
              </Link>
            </div>
            {custos.length === 0 ? (
              <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Nenhum custo lançado</p>
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
                        {c.data_emissao && ` · ${new Date(c.data_emissao + "T12:00:00").toLocaleDateString("pt-BR")}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={c.pago ? "tag-emerald" : "tag-amber"} style={{ fontSize: "7px" }}>{c.pago ? "Pago" : "Pendente"}</span>
                      <span className="text-sm font-black mono text-white">{formatCurrency(c.valor)}</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-sm font-black" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-white">Total</span>
                  <span className="mono text-white">{formatCurrency(custoRealizado)}</span>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "faturamentos" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "#475569" }}>Faturamentos</p>
              <Link to={`/faturamentos/novo?obra_id=${obra.id}`}>
                <button className="btn-ghost-dark text-[9px]"><Plus className="w-3 h-3" /> Faturar</button>
              </Link>
            </div>
            {faturamentos.length === 0 ? (
              <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Nenhum faturamento</p>
            ) : (
              <div className="space-y-2">
                {faturamentos.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-white truncate">{f.descricao || `Medição #${f.numero_medicao}`}</p>
                      <p className="text-[8px] font-bold uppercase" style={{ color: "#475569" }}>
                        {f.data_emissao && new Date(f.data_emissao + "T12:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={f.recebido ? "tag-emerald" : "tag-amber"} style={{ fontSize: "7px" }}>{f.recebido ? "Recebido" : "Pendente"}</span>
                      <span className="text-sm font-black mono" style={{ color: "#34d399" }}>{formatCurrency(f.valor)}</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-sm font-black" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-white">Total Faturado</span>
                  <span className="mono" style={{ color: "#34d399" }}>{formatCurrency(totalFaturado)}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
