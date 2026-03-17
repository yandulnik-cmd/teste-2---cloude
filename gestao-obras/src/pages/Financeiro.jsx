import { DollarSign, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Financeiro() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500 text-sm mt-1">DRE e Fluxo de Caixa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: "Receitas do Mês", value: "R$ 0,00", color: "text-green-600", bg: "bg-green-50" },
          { icon: TrendingDown, label: "Custos Diretos", value: "R$ 0,00", color: "text-red-600", bg: "bg-red-50" },
          { icon: DollarSign, label: "Margem Líquida", value: "R$ 0,00", color: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-12 text-center text-gray-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Módulo Financeiro</p>
          <p className="text-sm mt-1">DRE completo e Fluxo de Caixa em desenvolvimento.</p>
          <p className="text-sm mt-1">Lance custos e faturamentos para popular este módulo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
