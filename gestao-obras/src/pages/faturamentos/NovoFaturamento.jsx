import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Save, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useObras } from "../../hooks/useObras";
import { useFaturamentos, useBancos } from "../../hooks/useFinanceiro";
import { formatCurrency } from "../../lib/utils";

export default function NovoFaturamento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const obraIdParam = searchParams.get("obra_id");

  const { obras } = useObras();
  const { createFaturamento, faturamentos } = useFaturamentos({});
  const { bancos } = useBancos();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    obra_id: obraIdParam || "",
    descricao: "",
    numero_medicao: "",
    valor: "",
    data_emissao: new Date().toISOString().split("T")[0],
    data_vencimento: "",
    recebido: false,
    data_recebimento: "",
    banco_id: "",
  });

  // Sugere o próximo número de medição para a obra selecionada
  useEffect(() => {
    if (form.obra_id) {
      const medicoesDaObra = faturamentos.filter(f => f.obra_id === form.obra_id);
      const proximoNum = medicoesDaObra.length + 1;
      setForm(f => ({ ...f, numero_medicao: String(proximoNum) }));
    }
  }, [form.obra_id, faturamentos]);

  function updateField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const obraSelecionada = obras.find(o => o.id === form.obra_id);
  const valorLancamento = parseFloat(form.valor) || 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.obra_id) { setError("Selecione a obra."); return; }
    if (!form.valor) { setError("Informe o valor."); return; }

    setSaving(true);
    setError(null);
    try {
      await createFaturamento({
        obra_id: form.obra_id,
        descricao: form.descricao || null,
        numero_medicao: form.numero_medicao ? parseInt(form.numero_medicao) : null,
        valor: parseFloat(form.valor),
        data_emissao: form.data_emissao,
        data_vencimento: form.data_vencimento || null,
        recebido: form.recebido,
        data_recebimento: form.recebido && form.data_recebimento ? form.data_recebimento : null,
        banco_id: form.banco_id || null,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(form.obra_id ? `/obras/${form.obra_id}` : "/financeiro");
      }, 1200);
    } catch (err) {
      setError(err.message || "Erro ao salvar faturamento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={form.obra_id ? `/obras/${form.obra_id}` : "/financeiro"}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Faturamento</h1>
          <p className="text-gray-500 text-sm">Registrar medição / cobrança ao cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Obra e Medição</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Obra *</Label>
              <Select value={form.obra_id} onValueChange={v => updateField("obra_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione a obra..." /></SelectTrigger>
                <SelectContent>
                  {obras.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {obraSelecionada && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <p className="font-medium">{obraSelecionada.nome}</p>
                <p className="text-xs mt-0.5">
                  Contrato: {formatCurrency(obraSelecionada.valor_contrato)} · Cliente: {obraSelecionada.cliente}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nº da Medição</Label>
                <Input
                  type="number"
                  value={form.numero_medicao}
                  onChange={e => updateField("numero_medicao", e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={e => updateField("valor", e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input
                value={form.descricao}
                onChange={e => updateField("descricao", e.target.value)}
                placeholder="Ex: Medição #1 — Fundações e estrutura..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Datas e Recebimento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Data de Emissão</Label>
                <Input type="date" value={form.data_emissao} onChange={e => updateField("data_emissao", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Data de Vencimento</Label>
                <Input type="date" value={form.data_vencimento} onChange={e => updateField("data_vencimento", e.target.value)} />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.recebido}
                onChange={e => updateField("recebido", e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Já foi recebido</span>
            </label>

            {form.recebido && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Data de Recebimento</Label>
                  <Input type="date" value={form.data_recebimento} onChange={e => updateField("data_recebimento", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Banco de Entrada</Label>
                  <Select value={form.banco_id} onValueChange={v => updateField("banco_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {bancos.map(b => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview do impacto */}
        {valorLancamento > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-green-800">Impacto do Faturamento</p>
                <div className="mt-1 space-y-0.5 text-green-700">
                  <p>Valor: <strong>{formatCurrency(valorLancamento)}</strong></p>
                  {!form.recebido && form.data_vencimento && (
                    <p>Entrará no caixa em: <strong>{new Date(form.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR")}</strong></p>
                  )}
                  {form.recebido && <p className="text-green-700">Saldo bancário será creditado.</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Faturamento salvo! Redirecionando...
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link to={form.obra_id ? `/obras/${form.obra_id}` : "/financeiro"}>
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving || success}>
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Faturamento"}
          </Button>
        </div>
      </form>
    </div>
  );
}
