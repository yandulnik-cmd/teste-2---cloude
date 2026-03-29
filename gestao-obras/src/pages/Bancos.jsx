import { useState } from "react";
import { Landmark, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useBancos } from "../hooks/useFinanceiro";
import { formatCurrency } from "../lib/utils";

export default function Bancos() {
  const { bancos, loading, createBanco, deleteBanco } = useBancos();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", saldo_inicial: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const saldoTotal = bancos.reduce((s, b) => s + (b.saldo_atual || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome) { setError("Informe o nome do banco."); return; }
    setSaving(true);
    setError(null);
    try {
      await createBanco({
        nome: form.nome,
        saldo_inicial: parseFloat(form.saldo_inicial) || 0,
      });
      setForm({ nome: "", saldo_inicial: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Excluir este banco? Os lançamentos vinculados perderão a referência.")) return;
    await deleteBanco(id);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bancos e Contas</h1>
          <p className="text-gray-500 text-sm mt-1">Controle de saldo por conta bancária</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-blue-200">
          <CardHeader><CardTitle className="text-sm">Nova Conta Bancária</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5">
                <Label>Nome do Banco / Conta *</Label>
                <Input
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Bradesco Conta Corrente, Caixa, Nubank..."
                  required
                />
              </div>
              <div className="w-48 space-y-1.5">
                <Label>Saldo Inicial (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.saldo_inicial}
                  onChange={e => setForm(f => ({ ...f, saldo_inicial: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Saldo consolidado */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Landmark className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Saldo Total Consolidado</p>
              <p className={`text-3xl font-bold ${saldoTotal >= 0 ? "text-blue-800" : "text-red-700"}`}>
                {formatCurrency(saldoTotal)}
              </p>
            </div>
          </div>
          <p className="text-sm text-blue-500">{bancos.length} conta(s)</p>
        </CardContent>
      </Card>

      {/* Lista de bancos */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">Carregando...</p>
      ) : bancos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-400">
            <Landmark className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma conta cadastrada</p>
            <p className="text-sm mt-1">Clique em "Nova Conta" para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bancos.map((banco) => {
            const positivo = banco.saldo_atual >= 0;
            return (
              <Card key={banco.id} className={`border-l-4 ${positivo ? "border-l-green-400" : "border-l-red-400"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${positivo ? "bg-green-50" : "bg-red-50"}`}>
                        <Landmark className={`h-4 w-4 ${positivo ? "text-green-600" : "text-red-600"}`} />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{banco.nome}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(banco.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className={`text-2xl font-bold mb-3 ${positivo ? "text-gray-900" : "text-red-600"}`}>
                    {formatCurrency(banco.saldo_atual || 0)}
                  </p>

                  <div className="space-y-1 text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /> Saldo inicial</span>
                      <span>{formatCurrency(banco.saldo_inicial || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /> Entradas</span>
                      <span className="text-green-600">+{formatCurrency(banco.entradas_recebidas || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-500" /> Saídas</span>
                      <span className="text-red-600">-{formatCurrency(Math.abs(banco.saidas_pagas || 0))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
