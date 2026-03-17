import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, Search, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useObras } from "../../hooks/useObras";
import { formatCurrency, STATUS_COLORS, STATUS_LABELS } from "../../lib/utils";

function ObraCard({ obra }) {
  const progReal = obra.percentual_real || 0;
  const progPlan = obra.percentual_planejado || 0;
  const idp = progPlan > 0 ? progReal / progPlan : 1;
  const atrasada = idp < 0.95 && obra.status === "em_execucao";

  return (
    <Link to={`/obras/${obra.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer border hover:border-blue-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">{obra.nome}</h3>
                {atrasada && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{obra.cliente}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${STATUS_COLORS[obra.status]}`}>
              {STATUS_LABELS[obra.status]}
            </span>
          </div>

          {/* Progresso */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progresso Físico</span>
              <span className={atrasada ? "text-red-600 font-semibold" : ""}>
                {progReal.toFixed(1)}% / {progPlan.toFixed(1)}% planejado
              </span>
            </div>
            <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gray-300 rounded-full"
                style={{ width: `${progPlan}%` }}
              />
              <div
                className={`absolute h-full rounded-full ${atrasada ? "bg-red-400" : "bg-blue-500"}`}
                style={{ width: `${progReal}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400 text-xs">Contrato: </span>
              <span className="font-semibold text-gray-800">{formatCurrency(obra.valor_contrato)}</span>
            </div>
            {obra.area_m2 && (
              <span className="text-gray-400 text-xs">{obra.area_m2} m²</span>
            )}
          </div>

          {obra.data_inicio && (
            <p className="text-xs text-gray-400 mt-2">
              Início: {new Date(obra.data_inicio).toLocaleDateString("pt-BR")}
              {obra.data_previsao_fim && ` · Previsão: ${new Date(obra.data_previsao_fim).toLocaleDateString("pt-BR")}`}
            </p>
          )}
        </CardContent>
      </Card>
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
          <p className="text-gray-500 text-sm mt-1">{obras.length} obras cadastradas</p>
        </div>
        <Link to="/obras/nova">
          <Button>
            <Plus className="h-4 w-4" />
            Nova Obra
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["todos", "planejamento", "em_execucao", "concluida", "pausada"].map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filtroStatus === s
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s === "todos" ? "Todos" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de obras */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando obras...</div>
      ) : obrasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500">Nenhuma obra encontrada.</p>
          <Link to="/obras/nova">
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4" />
              Cadastrar Obra
            </Button>
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
