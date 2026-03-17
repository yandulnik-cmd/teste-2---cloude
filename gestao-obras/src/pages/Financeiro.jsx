import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign, TrendingDown, TrendingUp, AlertTriangle,
  Plus, CheckCircle, Clock, Building2, CreditCard, Landmark
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useCustos, useFaturamentos, useBancos } from "../hooks/useFinanceiro";
import { formatCurrency } from "../lib/utils";

function KPICard({ title, value, subtitle, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ pago, recebido }) {
  if (pago || recebido) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
        <CheckCircle className="h-3 w-3" /> {pago ? "Pago" : "Recebido"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
      <Clock className="h-3 w-3" /> Pendente
    </span>
  );
}

function DRERow({ label, value, type, indent = false, bold = false }) {
  const colors = {
    receita: "text-green-600",
    custo: "text-red-600",
    resultado_pos: "text-blue-700",
    resultado_neg: "text-red-700",
  };
  return (
    <div className={`flex justify-between py-1.5 ${indent ? "pl-4" : ""}`}>
      <span className={`text-sm ${bold ? "font-bold" : "text-gray-600"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold" : ""} ${colors[type]}`}>
        {value >= 0 ? formatCurrency(value) : `- ${formatCurrency(Math.abs(value))}`}
      </span>
    </div>
  );
}

export default function Financeiro() {
  const mesAtual = new Date().toISOString().slice(0, 7);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);

  const { custos, loading: loadingCustos, updateCusto } = useCustos({ mes: mesSelecionado });
  const { faturamentos, loading: loadingFat, updateFaturamento } = useFaturamentos({ mes: mesSelecionado });
  const { bancos, loading: loadingBancos } = useBancos();

  const totalReceitas = useMemo(() => faturamentos.reduce((s, f) => s + (f.valor || 0), 0), [faturamentos]);
  const totalCustosDiretos = useMemo(() => custos.filter(c => c.tipo !== "admin").reduce((s, c) => s + (c.valor || 0), 0), [custos]);
  const totalCustosAdmin = useMemo(() => custos.filter(c => c.tipo === "admin").reduce((s, c) => s + (c.valor || 0), 0), [custos]);
  const margemBruta = totalReceitas - totalCustosDiretos;
  const margemLiquida = margemBruta - totalCustosAdmin;

  const contasAPagar = custos.filter(c => !c.pago);
  const contasAReceber = faturamentos.filter(f => !f.recebido);
  const totalAPagar = contasAPagar.reduce((s, c) => s + (c.valor || 0), 0);
  const totalAReceber = contasAReceber.reduce((s, f) => s + (f.valor || 0), 0);
  const saldoTotal = bancos.reduce((s, b) => s + (b.saldo_atual || 0), 0);

  const marcarPago = async (custo) => {
    await updateCusto(custo.id, { pago: true, data_pagamento: new Date().toISOString().split("T")[0] });
  };

  const marcarRecebido = async (fat) => {
    await updateFaturamento(fat.id, { recebido: true, data_recebimento: new Date().toISOString().split("T")[0] });
  };

  const loading = loadingCustos || loadingFat || loadingBancos;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 text-sm mt-1">DRE Gerencial e Fluxo de Caixa</p>
        </div>
        <div className="flex gap-2">
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Link to="/custos/novo">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Lançar Custo
            </Button>
          </Link>
        </div>
      </div>

      {/* Saldo dos Bancos */}
      {bancos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bancos.map((banco) => (
            <Card key={banco.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Landmark className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{banco.nome}</p>
                  <p className={`text-lg font-bold ${banco.saldo_atual >= 0 ? "text-gray-900" : "text-red-600"}`}>
                    {formatCurrency(banco.saldo_atual || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Saldo Total em Caixa" value={formatCurrency(saldoTotal)} subtitle="Todos os bancos" icon={Landmark} color={saldoTotal >= 0 ? "blue" : "red"} />
        <KPICard title="A Receber" value={formatCurrency(totalAReceber)} subtitle={`${contasAReceber.length} faturamento(s) pendente(s)`} icon={TrendingUp} color="green" />
        <KPICard title="A Pagar" value={formatCurrency(totalAPagar)} subtitle={`${contasAPagar.length} conta(s) pendente(s)`} icon={TrendingDown} color="red" />
        <KPICard
          title="Posição Líquida"
          value={formatCurrency(saldoTotal + totalAReceber - totalAPagar)}
          subtitle="Caixa + Receber - Pagar"
          icon={DollarSign}
          color={saldoTotal + totalAReceber - totalAPagar >= 0 ? "green" : "red"}
        />
      </div>

      <Tabs defaultValue="dre">
        <TabsList>
          <TabsTrigger value="dre">DRE do Mês</TabsTrigger>
          <TabsTrigger value="pagar">
            Contas a Pagar {contasAPagar.length > 0 && <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 rounded-full">{contasAPagar.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="receber">
            Contas a Receber {contasAReceber.length > 0 && <span className="ml-1 bg-green-100 text-green-600 text-xs px-1.5 rounded-full">{contasAReceber.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="custos">Todos os Lançamentos</TabsTrigger>
        </TabsList>

        {/* DRE */}
        <TabsContent value="dre" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                DRE Gerencial — {new Date(mesSelecionado + "-02").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-400 text-sm text-center py-8">Carregando...</p>
              ) : totalReceitas === 0 && totalCustosDiretos === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum lançamento neste mês.</p>
                  <p className="text-xs mt-1">Lance custos e faturamentos para ver o DRE.</p>
                </div>
              ) : (
                <div className="space-y-1 max-w-lg">
                  <DRERow label="Receita Bruta (Faturamentos)" value={totalReceitas} type="receita" />
                  <DRERow label="(-) Custos Diretos de Obra" value={totalCustosDiretos} type="custo" indent />
                  <div className="border-t border-gray-200 my-2" />
                  <DRERow label="= Margem Bruta" value={margemBruta} type={margemBruta >= 0 ? "resultado_pos" : "resultado_neg"} bold />
                  <DRERow label="(-) Custos Administrativos" value={totalCustosAdmin} type="custo" indent />
                  <div className="border-t border-gray-200 my-2" />
                  <DRERow label="= Margem Líquida" value={margemLiquida} type={margemLiquida >= 0 ? "resultado_pos" : "resultado_neg"} bold />
                  {totalReceitas > 0 && (
                    <p className="text-xs text-gray-400 mt-4">
                      Margem líquida: {((margemLiquida / totalReceitas) * 100).toFixed(1)}% sobre faturamento
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contas a Pagar */}
        <TabsContent value="pagar" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Contas a Pagar</CardTitle>
              <Link to="/custos/novo">
                <Button size="sm" variant="outline"><Plus className="h-4 w-4" /> Lançar</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {contasAPagar.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Nenhuma conta pendente neste mês.</p>
              ) : (
                <div className="space-y-2">
                  {contasAPagar.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 bg-red-50 rounded">
                          <CreditCard className="h-3.5 w-3.5 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.descricao}</p>
                          <p className="text-xs text-gray-400">
                            {c.obra_id ? "Obra" : "Administrativo"}
                            {c.data_vencimento && ` · Vence ${new Date(c.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-red-600">{formatCurrency(c.valor)}</span>
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => marcarPago(c)}>
                          <CheckCircle className="h-3 w-3" /> Pagar
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-semibold">
                    <span>Total a Pagar</span>
                    <span className="text-red-600">{formatCurrency(totalAPagar)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contas a Receber */}
        <TabsContent value="receber" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Contas a Receber</CardTitle>
              <Link to="/faturamentos/novo">
                <Button size="sm" variant="outline"><Plus className="h-4 w-4" /> Faturar</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {contasAReceber.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Nenhum faturamento pendente neste mês.</p>
              ) : (
                <div className="space-y-2">
                  {contasAReceber.map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 bg-green-50 rounded">
                          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {f.descricao || `Medição #${f.numero_medicao}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {f.obras?.nome}
                            {f.data_vencimento && ` · Vence ${new Date(f.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(f.valor)}</span>
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => marcarRecebido(f)}>
                          <CheckCircle className="h-3 w-3" /> Receber
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-semibold">
                    <span>Total a Receber</span>
                    <span className="text-green-600">{formatCurrency(totalAReceber)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Todos os custos */}
        <TabsContent value="custos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Todos os Lançamentos do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              {custos.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Nenhum custo lançado neste mês.</p>
              ) : (
                <div className="space-y-2">
                  {custos.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.descricao}</p>
                        <p className="text-xs text-gray-400">
                          {c.tipo === "material" ? "Material" : c.tipo === "mao_de_obra" ? "Mão de Obra" : "Administrativo"}
                          {c.categoria && ` · ${c.categoria}`}
                          {c.fornecedor && ` · ${c.fornecedor}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge pago={c.pago} />
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(c.valor)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
