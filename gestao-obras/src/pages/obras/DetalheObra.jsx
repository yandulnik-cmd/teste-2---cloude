import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, DollarSign, TrendingUp, AlertTriangle, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { useObra } from "../../hooks/useObras";
import { formatCurrency, formatDate, formatPercent, STATUS_COLORS, STATUS_LABELS } from "../../lib/utils";

function KPICard({ label, value, sub, color = "gray" }) {
  const bg = { gray: "bg-gray-50", blue: "bg-blue-50", green: "bg-green-50", red: "bg-red-50", yellow: "bg-yellow-50" };
  const text = { gray: "text-gray-900", blue: "text-blue-700", green: "text-green-700", red: "text-red-700", yellow: "text-yellow-700" };
  return (
    <div className={`${bg[color]} rounded-lg p-4`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-xl font-bold mt-1 ${text[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DetalheObra() {
  const { id } = useParams();
  const { obra, loading, error } = useObra(id);

  if (loading) return <div className="p-6 text-gray-400">Carregando...</div>;
  if (error) return <div className="p-6 text-red-500">Erro: {error}</div>;
  if (!obra) return <div className="p-6 text-gray-400">Obra não encontrada.</div>;

  const progReal = obra.percentual_real || 0;
  const progPlan = obra.percentual_planejado || 0;
  const idp = progPlan > 0 ? progReal / progPlan : 1;

  // Cálculos EVM
  const valorAgregado = ((obra.valor_contrato || 0) * progReal) / 100;
  const custoRealizado = obra.orcamento_categorias?.reduce((s, c) => {
    const custos = c.custos_obra?.reduce((cs, custo) => cs + (custo.valor || 0), 0) || 0;
    return s + custos;
  }, 0) || 0;
  const idc = valorAgregado > 0 ? valorAgregado / custoRealizado : 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/obras">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{obra.nome}</h1>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[obra.status]}`}>
                {STATUS_LABELS[obra.status]}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{obra.cliente} · {obra.endereco}</p>
          </div>
        </div>
        <Link to={`/custos/novo?obra_id=${obra.id}`}>
          <Button>
            <PlusCircle className="h-4 w-4" />
            Lançar Custo
          </Button>
        </Link>
      </div>

      {/* KPIs EVM */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Valor do Contrato"
          value={formatCurrency(obra.valor_contrato)}
          color="gray"
        />
        <KPICard
          label="Progresso Físico"
          value={formatPercent(progReal)}
          sub={`Planejado: ${formatPercent(progPlan)}`}
          color="blue"
        />
        <KPICard
          label="IDP (Índice de Prazo)"
          value={idp.toFixed(2)}
          sub={idp < 1 ? "Atrasado" : "No prazo"}
          color={idp < 0.95 ? "red" : idp >= 1 ? "green" : "yellow"}
        />
        <KPICard
          label="IDC (Índice de Custo)"
          value={idc.toFixed(2)}
          sub={idc < 1 ? "Acima do orçamento" : "Dentro do orçamento"}
          color={idc < 0.95 ? "red" : idc >= 1 ? "green" : "yellow"}
        />
      </div>

      {/* Alertas */}
      {(idp < 0.95 || idc < 0.95) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            {idp < 0.95 && (
              <p className="text-sm text-red-700">
                <strong>Atraso de Prazo:</strong> Obra está {((1 - idp) * 100).toFixed(1)}% abaixo do planejado fisicamente.
              </p>
            )}
            {idc < 0.95 && (
              <p className="text-sm text-red-700">
                <strong>Estouro de Custo:</strong> Custo realizado maior que o valor agregado. IDC = {idc.toFixed(2)}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
          <TabsTrigger value="custos">Custos Lançados</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Informações da Obra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Cliente", obra.cliente || "-"],
                  ["Endereço", obra.endereco || "-"],
                  ["Área", obra.area_m2 ? `${obra.area_m2} m²` : "-"],
                  ["Início", obra.data_inicio ? formatDate(obra.data_inicio) : "-"],
                  ["Previsão de Fim", obra.data_previsao_fim ? formatDate(obra.data_previsao_fim) : "-"],
                  ["R$/m²", obra.area_m2 ? formatCurrency(obra.valor_contrato / obra.area_m2) : "-"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Orçamento Global
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Valor do Contrato", formatCurrency(obra.valor_contrato)],
                  ["BDI", `${obra.bdi_percentual || 0}%`],
                  ["Mão de Obra Global", `${obra.mao_de_obra_percentual || 0}%`],
                  ["Contingência", `${obra.contingencia_percentual || 0}%`],
                  ["Custo Direto Disponível", formatCurrency(obra.custo_direto_disponivel)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orcamento" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Orçamento por Categorias (EAP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!obra.orcamento_categorias || obra.orcamento_categorias.length === 0) ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Nenhuma categoria orçada. Edite a obra para distribuir o orçamento.
                </p>
              ) : (
                <div className="space-y-3">
                  {obra.orcamento_categorias.map((cat) => {
                    const gastoCategoria = cat.custos_obra?.reduce((s, c) => s + (c.valor || 0), 0) || 0;
                    const pctGasto = cat.valor_orcado > 0 ? (gastoCategoria / cat.valor_orcado) * 100 : 0;
                    const estouro = pctGasto > 100;

                    return (
                      <div key={cat.id} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{cat.categoria}</span>
                          <div className="text-right">
                            <span className={estouro ? "text-red-600 font-semibold" : "text-gray-600"}>
                              {formatCurrency(gastoCategoria)}
                            </span>
                            <span className="text-gray-400 ml-1">/ {formatCurrency(cat.valor_orcado)}</span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full rounded-full ${estouro ? "bg-red-500" : "bg-blue-500"}`}
                            style={{ width: `${Math.min(100, pctGasto)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 text-right">
                          {pctGasto.toFixed(1)}% utilizado
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custos" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Custos Lançados</CardTitle>
              <Link to={`/custos/novo?obra_id=${id}`}>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-3 w-3" />
                  Novo Lançamento
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {custoRealizado === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Nenhum custo lançado ainda.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Total lançado: <strong>{formatCurrency(custoRealizado)}</strong>
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
