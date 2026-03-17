import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Calculator } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useObras } from "../../hooks/useObras";
import { formatCurrency, CATEGORIAS_PADRAO } from "../../lib/utils";

const CATEGORIAS_INICIAIS = CATEGORIAS_PADRAO.map((nome) => ({
  categoria: nome,
  valor_orcado: 0,
  percentual_orcado: 0,
}));

export default function NovaObra() {
  const navigate = useNavigate();
  const { createObra } = useObras();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    cliente: "",
    endereco: "",
    area_m2: "",
    valor_contrato: "",
    bdi_percentual: "20",
    mao_de_obra_percentual: "30",
    contingencia_percentual: "5",
    data_inicio: "",
    data_previsao_fim: "",
    status: "planejamento",
    descricao: "",
  });

  const [categorias, setCategorias] = useState(CATEGORIAS_INICIAIS);

  const valorContrato = parseFloat(form.valor_contrato) || 0;
  const bdi = (valorContrato * parseFloat(form.bdi_percentual || 0)) / 100;
  const maoDeObra = (valorContrato * parseFloat(form.mao_de_obra_percentual || 0)) / 100;
  const contingencia = (valorContrato * parseFloat(form.contingencia_percentual || 0)) / 100;
  const custoDisponivel = valorContrato - bdi - maoDeObra - contingencia;

  const totalOrcado = categorias.reduce((s, c) => s + (c.valor_orcado || 0), 0);
  const saldoDistribuir = custoDisponivel - totalOrcado;

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateCategoria(idx, field, value) {
    setCategorias((cats) => {
      const next = [...cats];
      if (field === "valor_orcado") {
        const val = parseFloat(value) || 0;
        next[idx] = {
          ...next[idx],
          valor_orcado: val,
          percentual_orcado: custoDisponivel > 0 ? (val / custoDisponivel) * 100 : 0,
        };
      } else if (field === "percentual_orcado") {
        const pct = parseFloat(value) || 0;
        next[idx] = {
          ...next[idx],
          percentual_orcado: pct,
          valor_orcado: (custoDisponivel * pct) / 100,
        };
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.valor_contrato) {
      setError("Nome e valor do contrato são obrigatórios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const obraData = {
        ...form,
        area_m2: form.area_m2 ? parseFloat(form.area_m2) : null,
        valor_contrato: parseFloat(form.valor_contrato),
        bdi_percentual: parseFloat(form.bdi_percentual),
        mao_de_obra_percentual: parseFloat(form.mao_de_obra_percentual),
        contingencia_percentual: parseFloat(form.contingencia_percentual),
        custo_direto_disponivel: custoDisponivel,
        data_inicio: form.data_inicio || null,
        data_previsao_fim: form.data_previsao_fim || null,
      };

      const obra = await createObra(obraData);

      // Salva categorias de orçamento
      const categoriasComObra = categorias
        .filter((c) => c.valor_orcado > 0)
        .map((c) => ({ ...c, obra_id: obra.id }));

      if (categoriasComObra.length > 0) {
        await supabase.from("orcamento_categorias").insert(categoriasComObra);
      }

      navigate(`/obras/${obra.id}`);
    } catch (err) {
      setError(err.message || "Erro ao salvar obra.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/obras">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Obra</h1>
          <p className="text-gray-500 text-sm">Cadastro e orçamento inicial</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da Obra</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome da Obra *</Label>
              <Input
                value={form.nome}
                onChange={(e) => updateField("nome", e.target.value)}
                placeholder="Ex: Residência Família Silva"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Input
                value={form.cliente}
                onChange={(e) => updateField("cliente", e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Endereço</Label>
              <Input
                value={form.endereco}
                onChange={(e) => updateField("endereco", e.target.value)}
                placeholder="Endereço completo"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Área (m²)</Label>
              <Input
                type="number"
                value={form.area_m2}
                onChange={(e) => updateField("area_m2", e.target.value)}
                placeholder="Ex: 250"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={form.data_inicio}
                onChange={(e) => updateField("data_inicio", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Previsão de Conclusão</Label>
              <Input
                type="date"
                value={form.data_previsao_fim}
                onChange={(e) => updateField("data_previsao_fim", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Observações</Label>
              <Input
                value={form.descricao}
                onChange={(e) => updateField("descricao", e.target.value)}
                placeholder="Informações adicionais sobre a obra"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orçamento Top-Down */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Orçamento (Top-Down)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Valor do Contrato (R$) *</Label>
                <Input
                  type="number"
                  value={form.valor_contrato}
                  onChange={(e) => updateField("valor_contrato", e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>BDI (%)</Label>
                <Input
                  type="number"
                  value={form.bdi_percentual}
                  onChange={(e) => updateField("bdi_percentual", e.target.value)}
                  placeholder="20"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mão de Obra Global (%)</Label>
                <Input
                  type="number"
                  value={form.mao_de_obra_percentual}
                  onChange={(e) => updateField("mao_de_obra_percentual", e.target.value)}
                  placeholder="30"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Contingência (%)</Label>
                <Input
                  type="number"
                  value={form.contingencia_percentual}
                  onChange={(e) => updateField("contingencia_percentual", e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>

            {/* Resumo do cálculo top-down */}
            {valorContrato > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor do Contrato</span>
                  <span className="font-medium">{formatCurrency(valorContrato)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>(-) BDI ({form.bdi_percentual}%)</span>
                  <span>- {formatCurrency(bdi)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>(-) Mão de Obra ({form.mao_de_obra_percentual}%)</span>
                  <span>- {formatCurrency(maoDeObra)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>(-) Contingência ({form.contingencia_percentual}%)</span>
                  <span>- {formatCurrency(contingencia)}</span>
                </div>
                <div className="flex justify-between font-semibold text-blue-700 border-t border-blue-200 pt-2">
                  <span>= Custo Direto Disponível</span>
                  <span>{formatCurrency(custoDisponivel)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por categorias */}
        {custoDisponivel > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição por Categorias (EAP)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categorias.map((cat, idx) => (
                  <div key={cat.categoria} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-4">
                      <p className="text-sm font-medium text-gray-700">{cat.categoria}</p>
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <Input
                          type="number"
                          value={cat.percentual_orcado.toFixed(2)}
                          onChange={(e) => updateCategoria(idx, "percentual_orcado", e.target.value)}
                          className="pr-6 text-right"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                        <Input
                          type="number"
                          value={cat.valor_orcado.toFixed(2)}
                          onChange={(e) => updateCategoria(idx, "valor_orcado", e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, cat.percentual_orcado)}%`, minWidth: cat.percentual_orcado > 0 ? "4px" : 0 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex justify-between ${
                Math.abs(saldoDistribuir) < 1
                  ? "bg-green-50 text-green-700"
                  : saldoDistribuir < 0
                  ? "bg-red-50 text-red-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}>
                <span>
                  {Math.abs(saldoDistribuir) < 1
                    ? "Orçamento distribuído"
                    : saldoDistribuir > 0
                    ? "Saldo a distribuir"
                    : "Orçamento ultrapassado"}
                </span>
                <span>{formatCurrency(Math.abs(saldoDistribuir))}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link to="/obras">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Obra"}
          </Button>
        </div>
      </form>
    </div>
  );
}
