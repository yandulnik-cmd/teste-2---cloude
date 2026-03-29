import { useState, useEffect } from "react";
import { Plus, Trash2, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { supabase } from "../lib/supabase";
import { formatCurrency } from "../lib/utils";

function BancosSection() {
  const [bancos, setBancos] = useState([]);
  const [form, setForm] = useState({ nome: "", saldo_inicial: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("bancos").select("*").order("nome").then(({ data }) => setBancos(data || []));
  }, []);

  async function addBanco() {
    if (!form.nome) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("bancos")
      .insert([{ nome: form.nome, saldo_inicial: parseFloat(form.saldo_inicial) || 0 }])
      .select()
      .single();
    if (!error) {
      setBancos((b) => [...b, data]);
      setForm({ nome: "", saldo_inicial: "" });
    }
    setSaving(false);
  }

  async function removeBanco(id) {
    await supabase.from("bancos").delete().eq("id", id);
    setBancos((b) => b.filter((x) => x.id !== id));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Bancos e Contas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label>Nome do Banco / Conta</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Caixa Bradesco, Conta Corrente Itaú..."
            />
          </div>
          <div className="w-40 space-y-1.5">
            <Label>Saldo Inicial (R$)</Label>
            <Input
              type="number"
              value={form.saldo_inicial}
              onChange={(e) => setForm((f) => ({ ...f, saldo_inicial: e.target.value }))}
              placeholder="0,00"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addBanco} disabled={saving || !form.nome}>
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>

        {bancos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhum banco cadastrado. Adicione acima.
          </p>
        ) : (
          <div className="space-y-2">
            {bancos.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-sm text-gray-900">{b.nome}</p>
                  <p className="text-xs text-gray-500">Saldo inicial: {formatCurrency(b.saldo_inicial)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeBanco(b.id)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Configuracoes() {
  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Bancos, categorias e configurações do sistema</p>
      </div>
      <BancosSection />
    </div>
  );
}
