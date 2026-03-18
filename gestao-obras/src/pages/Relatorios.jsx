import { useState, useMemo } from "react";
import { BarChart3, PieChart, TrendingUp, TrendingDown, Building2, DollarSign, Layers, Target } from "lucide-react";
import { useObras } from "../hooks/useObras";
import { useCustos, useFaturamentos } from "../hooks/useFinanceiro";
import { formatCurrency } from "../lib/utils";

function BarH({ label, value, max, color = "#6366f1", sub = "" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-40" style={{ color: "#94a3b8" }}>{label}</span>
        <div className="text-right flex-shrink-0">
          <span className="text-[11px] font-black mono text-white">{formatCurrency(value)}</span>
          {sub && <span className="text-[8px] font-bold ml-1" style={{ color: "#475569" }}>{sub}</span>}
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function MiniBarChart({ data, maxVal }) {
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 5;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer" title={`${d.label}: ${formatCurrency(d.value)}`}
              style={{ height: `${Math.max(5, pct)}%`, background: d.color || "#6366f1" }} />
            <span className="text-[7px] font-bold uppercase" style={{ color: "#334155" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments, total, centerLabel }) {
  let offset = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="14" />
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dashLen = pct * circumference;
          const dashOffset = -offset * circumference;
          offset += pct;
          return (
            <circle key={i} cx="65" cy="65" r={radius} fill="none" stroke={seg.color} strokeWidth="14"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 65 65)"
              style={{ transition: "all 0.5s" }} />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-black mono text-white">{formatCurrency(total)}</span>
        <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>{centerLabel}</span>
      </div>
    </div>
  );
}

export default function Relatorios() {
  const { obras } = useObras();
  const { custos } = useCustos({});
  const { faturamentos } = useFaturamentos({});

  // Custos por tipo
  const custosPorTipo = useMemo(() => {
    const map = { material: 0, mao_de_obra: 0, admin: 0 };
    custos.forEach(c => { if (map[c.tipo] !== undefined) map[c.tipo] += (c.valor || 0); });
    return map;
  }, [custos]);
  const totalCustos = custosPorTipo.material + custosPorTipo.mao_de_obra + custosPorTipo.admin;

  // Custos por categoria (top 10)
  const custosPorCategoria = useMemo(() => {
    const map = {};
    custos.filter(c => c.categoria).forEach(c => {
      map[c.categoria] = (map[c.categoria] || 0) + (c.valor || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [custos]);
  const maxCategoria = custosPorCategoria.length > 0 ? custosPorCategoria[0][1] : 0;

  // Ranking de obras por valor de contrato
  const obrasRanking = useMemo(() =>
    [...obras].sort((a, b) => (b.valor_contrato || 0) - (a.valor_contrato || 0)).slice(0, 8),
  [obras]);
  const maxContrato = obrasRanking[0]?.valor_contrato || 0;

  // Faturamento total
  const totalFaturado = useMemo(() => faturamentos.reduce((s, f) => s + (f.valor || 0), 0), [faturamentos]);
  const totalRecebido = useMemo(() => faturamentos.filter(f => f.recebido).reduce((s, f) => s + (f.valor || 0), 0), [faturamentos]);

  // Custos por mês (últimos 6)
  const custosPorMes = useMemo(() => {
    const meses = {};
    custos.forEach(c => {
      const mes = (c.data_emissao || "").substring(0, 7);
      if (mes) meses[mes] = (meses[mes] || 0) + (c.valor || 0);
    });
    return Object.entries(meses).sort().slice(-6).map(([mes, val]) => ({
      label: mes.substring(5),
      value: val,
      color: "#6366f1",
    }));
  }, [custos]);
  const maxMes = Math.max(...custosPorMes.map(m => m.value), 1);

  // Faturamentos por mês (últimos 6)
  const fatPorMes = useMemo(() => {
    const meses = {};
    faturamentos.forEach(f => {
      const mes = (f.data_emissao || "").substring(0, 7);
      if (mes) meses[mes] = (meses[mes] || 0) + (f.valor || 0);
    });
    return Object.entries(meses).sort().slice(-6).map(([mes, val]) => ({
      label: mes.substring(5),
      value: val,
      color: "#10b981",
    }));
  }, [faturamentos]);
  const maxFatMes = Math.max(...fatPorMes.map(m => m.value), 1);

  // Margem por obra
  const margemPorObra = useMemo(() => {
    return obras.map(o => {
      const rec = faturamentos.filter(f => f.obra_id === o.id).reduce((s, f) => s + (f.valor || 0), 0);
      const cust = custos.filter(c => c.obra_id === o.id).reduce((s, c) => s + (c.valor || 0), 0);
      return { nome: o.nome, receita: rec, custo: cust, margem: rec - cust };
    }).sort((a, b) => b.margem - a.margem);
  }, [obras, custos, faturamentos]);

  const tipoSegments = [
    { label: "Material", value: custosPorTipo.material, color: "#6366f1" },
    { label: "Mão de Obra", value: custosPorTipo.mao_de_obra, color: "#10b981" },
    { label: "Administrativo", value: custosPorTipo.admin, color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: "#475569" }}>Business Intelligence</p>
        <h1 className="text-2xl font-black tracking-tight text-white mt-1">Relatórios & Gráficos</h1>
      </div>

      {/* KPI CARDS TOPO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Total Faturado", value: formatCurrency(totalFaturado), color: "#10b981", bg: "rgba(16,185,129,0.1)" },
          { icon: TrendingDown, label: "Total de Custos", value: formatCurrency(totalCustos), color: "#f43f5e", bg: "rgba(244,63,94,0.1)" },
          { icon: TrendingUp, label: "Lucro Bruto", value: formatCurrency(totalFaturado - totalCustos), color: totalFaturado - totalCustos >= 0 ? "#10b981" : "#f43f5e", bg: totalFaturado - totalCustos >= 0 ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)" },
          { icon: Target, label: "Recebimento", value: totalFaturado > 0 ? `${((totalRecebido / totalFaturado) * 100).toFixed(0)}%` : "0%", color: "#818cf8", bg: "rgba(99,102,241,0.1)" },
        ].map(kpi => (
          <div key={kpi.label} className="bento-card p-6">
            <div className="flex justify-between items-start relative z-10">
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "#475569" }}>{kpi.label}</p>
              <div className="p-2 rounded-xl" style={{ background: kpi.bg }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <h3 className="text-2xl font-black tracking-tighter mono mt-3 relative z-10" style={{ color: kpi.color }}>{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DONUT: Custos por Tipo */}
        <div className="dark-card p-6 flex flex-col items-center gap-4">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] self-start" style={{ color: "#475569" }}>Custos por Tipo</p>
          <DonutChart segments={tipoSegments} total={totalCustos} centerLabel="Total" />
          <div className="space-y-2 w-full">
            {tipoSegments.map(seg => (
              <div key={seg.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{seg.label}</span>
                </div>
                <span className="text-[10px] font-black mono text-white">{formatCurrency(seg.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BARRAS: Custos por Mês */}
        <div className="dark-card p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>
            <BarChart3 className="w-3.5 h-3.5 inline mr-1" style={{ color: "#818cf8" }} />
            Custos por Mês
          </p>
          {custosPorMes.length === 0 ? (
            <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Sem dados</p>
          ) : (
            <MiniBarChart data={custosPorMes} maxVal={maxMes} />
          )}

          <div className="mt-6">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>
              <TrendingUp className="w-3.5 h-3.5 inline mr-1" style={{ color: "#34d399" }} />
              Faturamento por Mês
            </p>
            {fatPorMes.length === 0 ? (
              <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Sem dados</p>
            ) : (
              <MiniBarChart data={fatPorMes} maxVal={maxFatMes} />
            )}
          </div>
        </div>

        {/* CURVA ABC: Custos por Categoria */}
        <div className="dark-card p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>
            <PieChart className="w-3.5 h-3.5 inline mr-1" style={{ color: "#818cf8" }} />
            Curva ABC — Categorias
          </p>
          {custosPorCategoria.length === 0 ? (
            <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Sem dados</p>
          ) : (
            <div className="space-y-2.5">
              {custosPorCategoria.map(([cat, val], i) => {
                const colors = ["#6366f1", "#818cf8", "#a5b4fc", "#c4b5fd", "#e0e7ff", "#f1f5f9", "#f1f5f9", "#f1f5f9", "#f1f5f9", "#f1f5f9"];
                return <BarH key={cat} label={cat} value={val} max={maxCategoria} color={colors[i]} />;
              })}
            </div>
          )}
        </div>
      </div>

      {/* RANKING DE OBRAS + MARGEM POR OBRA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dark-card p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>
            <Building2 className="w-3.5 h-3.5 inline mr-1" style={{ color: "#818cf8" }} />
            Ranking de Obras (Contrato)
          </p>
          {obrasRanking.length === 0 ? (
            <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Sem obras</p>
          ) : (
            <div className="space-y-2.5">
              {obrasRanking.map((o, i) => (
                <BarH key={o.id} label={`${i + 1}. ${o.nome}`} value={o.valor_contrato || 0} max={maxContrato}
                  color={i === 0 ? "#6366f1" : i === 1 ? "#818cf8" : "#334155"} />
              ))}
            </div>
          )}
        </div>

        <div className="dark-card p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "#475569" }}>
            <Layers className="w-3.5 h-3.5 inline mr-1" style={{ color: "#818cf8" }} />
            Margem por Obra
          </p>
          {margemPorObra.length === 0 ? (
            <p className="text-center py-8 text-[10px] font-bold uppercase" style={{ color: "#334155" }}>Sem dados</p>
          ) : (
            <div className="space-y-3">
              {margemPorObra.slice(0, 6).map(o => (
                <div key={o.nome} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-36" style={{ color: "#94a3b8" }}>{o.nome}</span>
                    <span className="text-[11px] font-black mono flex-shrink-0"
                      style={{ color: o.margem >= 0 ? "#34d399" : "#fb7185" }}>
                      {o.margem >= 0 ? "+" : ""}{formatCurrency(o.margem)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[8px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>
                    <span>Rec: {formatCurrency(o.receita)}</span>
                    <span>Cust: {formatCurrency(o.custo)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
