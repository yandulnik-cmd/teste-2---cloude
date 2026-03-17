import { useMemo } from "react";
import { Building2, TrendingUp, AlertTriangle, DollarSign, TrendingDown, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useObras } from "../hooks/useObras";
import { useCustos, useFaturamentos, useBancos } from "../hooks/useFinanceiro";
import { formatCurrency, STATUS_COLORS, STATUS_LABELS } from "../lib/utils";
import { Link } from "react-router-dom";

function KPICard({ title, value, subtitle, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
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

function ProgressBar({ planned, real }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Progresso físico</span>
        <span>{real.toFixed(1)}%</span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="absolute h-full bg-gray-300 rounded-full" style={{ width: `${planned}%` }} />
        <div className="absolute h-full bg-blue-500 rounded-full opacity-80" style={{ width: `${real}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const mesAtual = new Date().toISOString().slice(0, 7);

  const { obras, loading: loadingObras } = useObras();
  const { custos } = useCustos({ mes: mesAtual });
  const { faturamentos } = useFaturamentos({ mes: mesAtual });
  const { bancos } = useBancos();

  const obrasAtivas = obras.filter((o) => o.status === "em_execucao");
  const obrasAtrasadas = obrasAtivas.filter((o) => (o.idp || 1) < 1.0).length;
  const totalContrato = obras.reduce((s, o) => s + (o.valor_contrato || 0), 0);

  const totalReceitas = useMemo(() => faturamentos.reduce((s, f) => s + (f.valor || 0), 0), [faturamentos]);
  const totalCustos = useMemo(() => custos.filter(c => c.tipo !== "admin").reduce((s, c) => s + (c.valor || 0), 0), [custos]);
  const margemBruta = totalReceitas - totalCustos;
  const saldoTotal = bancos.reduce((s, b) => s + (b.saldo_atual || 0), 0);

  const contasAPagar = custos.filter(c => !c.pago).reduce((s, c) => s + (c.valor || 0), 0);
  const contasAReceber = faturamentos.filter(f => !f.recebido).reduce((s, f) => s + (f.valor || 0), 0);

  if (loadingObras) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Executivo</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do escritório</p>
      </div>

      {/* KPIs de obras */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total de Obras" value={obras.length} subtitle={`${obrasAtivas.length} em execução`} icon={Building2} color="blue" />
        <KPICard title="Valor dos Contratos" value={formatCurrency(totalContrato)} subtitle="Soma de todos os contratos" icon={DollarSign} color="green" />
        <KPICard title="Obras em Atraso" value={obrasAtrasadas} subtitle="IDP < 1,0" icon={AlertTriangle} color={obrasAtrasadas > 0 ? "red" : "green"} />
        <KPICard title="Obras Ativas" value={obrasAtivas.length} subtitle="Em execução agora" icon={TrendingUp} color="blue" />
      </div>

      {/* KPIs financeiros do mês */}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
          Financeiro — {new Date(mesAtual + "-02").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Saldo em Caixa" value={formatCurrency(saldoTotal)} subtitle="Todos os bancos" icon={Landmark} color={saldoTotal >= 0 ? "blue" : "red"} />
          <KPICard title="Faturado no Mês" value={formatCurrency(totalReceitas)} subtitle="Receita bruta" icon={TrendingUp} color="green" />
          <KPICard title="Custos no Mês" value={formatCurrency(totalCustos)} subtitle="Custos diretos" icon={TrendingDown} color="red" />
          <KPICard
            title="Margem Bruta"
            value={formatCurrency(margemBruta)}
            subtitle={totalReceitas > 0 ? `${((margemBruta / totalReceitas) * 100).toFixed(1)}% do faturamento` : "Sem faturamento"}
            icon={DollarSign}
            color={margemBruta >= 0 ? "green" : "red"}
          />
        </div>
      </div>

      {/* Alertas financeiros */}
      {(contasAPagar > 0 || contasAReceber > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contasAReceber > 0 && (
            <Link to="/financeiro">
              <Card className="border-green-200 bg-green-50 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">A Receber</p>
                    <p className="text-xs text-green-600">{formatCurrency(contasAReceber)} de faturamentos pendentes</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
          {contasAPagar > 0 && (
            <Link to="/financeiro">
              <Card className="border-red-200 bg-red-50 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">A Pagar</p>
                    <p className="text-xs text-red-600">{formatCurrency(contasAPagar)} de contas pendentes</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Portfolio de Obras */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Portfolio de Obras</CardTitle>
          <Link to="/obras" className="text-sm text-blue-600 hover:underline font-medium">
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          {obras.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma obra cadastrada ainda.</p>
              <Link to="/obras/nova" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Cadastrar primeira obra
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {obras.slice(0, 6).map((obra) => (
                <Link
                  key={obra.id}
                  to={`/obras/${obra.id}`}
                  className="block p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{obra.nome}</p>
                      <p className="text-xs text-gray-400">{obra.cliente}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[obra.status]}`}>
                        {STATUS_LABELS[obra.status]}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(obra.valor_contrato)}
                      </span>
                    </div>
                  </div>
                  <ProgressBar planned={obra.percentual_planejado || 0} real={obra.percentual_real || 0} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
