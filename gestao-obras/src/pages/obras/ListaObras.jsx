import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, Search, AlertTriangle } from "lucide-react";
import { useObras } from "../../hooks/useObras";
import { formatCurrency, STATUS_LABELS } from "../../lib/utils";

const STATUS_TAG = {
  planejamento: "tag-amber",
  em_execucao: "tag-emerald",
  concluida: "tag-indigo",
  pausada: "tag-rose",
};

const STATUS_FILTERS = ["todos", "planejamento", "em_execucao", "concluida", "pausada"];

function ObraCard({ obra }) {
  const progReal = obra.percentual_real || 0;
  const progPlan = obra.percentual_planejado || 0;
  const idp = progPlan > 0 ? progReal / progPlan : 1;
  const atrasada = idp < 0.95 && obra.status === "em_execucao";

  return (
    <Link to={`/obras/${obra.id}`} className="block">
      <div className="bento-card p-6 flex flex-col gap-4 cursor-pointer"
        style={{ minHeight: "180px" }}>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {atrasada && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#fb7185" }} />}
              <h3 className="text-[11px] font-black uppercase text-white truncate">{obra.nome}</h3>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-wider truncate" style={{ color: "#475569" }}>{obra.cliente}</p>
          </div>
          <span className={STATUS_TAG[obra.status] || "tag-indigo"} style={{ flexShrink: 0, marginLeft: "0.5rem" }}>
            {STATUS_LABELS[obra.status]}
          </span>
        </div>

        <div className="space-y-1.5 relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>Progresso físico</span>
            <span className="text-[8px] font-black mono" style={{ color: atrasada ? "#fb7185" : "#818cf8" }}>
              {progReal.toFixed(0)}% / {progPlan.toFixed(0)}%
            </span>
          </div>
          <div className="progress-dark">
            <div className="progress-fill-indigo" style={{ width: `${progReal}%`, background: atrasada ? "#f43f5e" : "#6366f1" }} />
          </div>
        </div>

        <div className="flex items-center justify-between relative z-10">
          <span className="text-sm font-black mono text-white">{formatCurrency(obra.valor_contrato)}</span>
          {obra.area_m2 && (
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#334155" }}>{obra.area_m2} m²</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ListaObras() {
  const { obras, loading } = useObras();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const obrasFiltradas = obras.filter((o) => {
    const matchBusca =
      o.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      o.cliente?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || o.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-1" style={{ color: "#475569" }}>Portfolio</p>
          <h1 className="text-2xl font-black tracking-tight text-white">Obras</h1>
          <p className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: "#475569" }}>
            {obras.length} obras cadastradas
          </p>
        </div>
        <Link to="/obras/nova">
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            Nova Obra
          </button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#475569" }} />
          <input
            className="input-dark pl-10"
            placeholder="Buscar por nome ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all"
              style={{
                background: filtroStatus === s ? "#6366f1" : "rgba(255,255,255,0.04)",
                color: filtroStatus === s ? "white" : "#64748b",
                border: filtroStatus === s ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {s === "todos" ? "Todos" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#334155" }}>Carregando...</p>
        </div>
      ) : obrasFiltradas.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-10 text-white" />
          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "#334155" }}>
            Nenhuma obra encontrada
          </p>
          <Link to="/obras/nova">
            <button className="btn-ghost-dark">
              <Plus className="w-4 h-4" /> Cadastrar Obra
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {obrasFiltradas.map((obra) => (
            <ObraCard key={obra.id} obra={obra} />
          ))}
        </div>
      )}
    </div>
  );
}
