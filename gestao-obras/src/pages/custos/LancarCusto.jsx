import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Save, AlertTriangle, TrendingDown, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useObras } from "../../hooks/useObras";
import { supabase } from "../../lib/supabase";
import { formatCurrency, CATEGORIAS_PADRAO } from "../../lib/utils";

const TIPOS = [
  { value: "material", label: "Material / Serviço", desc: "Compra de material ou contratação de serviço vinculado a uma obra" },
  { value: "mao_de_obra", label: "Mão de Obra", desc: "Pagamento de funcionários ou equipes de obra" },
  { value: "admin", label: "Administrativo", desc: "Custo do escritório (não vinculado a obra específica)" },
];

const FORMAS_PAGAMENTO = ["Dinheiro", "PIX", "Transferência", "Boleto", "Cartão de Crédito", "Cartão de Débito", "Cheque"];
const PLANO_CONTAS_ADMIN = [
  "Aluguel e Condomínio",
  "Internet e Telefone",
  "Contador / Honorários",
  "Salários Administrativos",
  "Software e Licenças",
  "Material de Escritório",
  "Combustível (Geral)",
  "Marketing e Publicidade",
  "Outros Administrativos",
];

export default function LancarCusto() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const obraIdParam = searchParams.get("obra_id");

  const { obras } = useObras();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [tipo, setTipo] = useState("material");
  const [form, setForm] = useState({
    obra_id: obraIdParam || "",
    categoria: "",
    subcategoria: "",
    plano_contas: "",
    fornecedor: "",
    descricao: "",
    valor: "",
    data_emissao: new Date().toISOString().split("T")[0],
    data_vencimento: "",
    forma_pagamento: "",
    banco: "",
    pago: false,
    data_pagamento: "",
    numero_nota: "",
  });

  const [subcategorias, setSubcategorias] = useState([]);
  const [novaSubcat, setNovaSubcat] = useState("");
  const [bancos, setBancos] = useState([]);

  // Carrega bancos
  useEffect(() => {
    supabase.from("bancos").select("*").then(({ data }) => setBancos(data || []));
  }, []);

  // Carrega subcategorias quando muda de obra/categoria
  useEffect(() => {
    if (form.categoria) {
      supabase
        .from("subcategorias")
        .select("*")
        .eq("categoria", form.categoria)
        .then(({ data }) => setSubcategorias(data || []));
    }
  }, [form.categoria]);

  // Orçamento da categoria selecionada
  const obraSelecionada = obras.find((o) => o.id === form.obra_id);
  const catOrcada = obraSelecionada?.orcamento_categorias?.find(
    (c) => c.categoria === form.categoria
  );
  const saldoCategoria = catOrcada
    ? catOrcada.valor_orcado - (catOrcada.gasto || 0)
    : null;
  const valorLancamento = parseFloat(form.valor) || 0;
  const alertaEstouro =
    saldoCategoria !== null && valorLancamento > saldoCategoria;

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleTipoChange(novoTipo) {
    setTipo(novoTipo);
    setForm((f) => ({
      ...f,
      categoria: "",
      subcategoria: "",
      plano_contas: "",
      obra_id: novoTipo === "admin" ? "" : f.obra_id,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.descricao || !form.valor) {
      setError("Descrição e valor são obrigatórios.");
      return;
    }
    if (tipo !== "admin" && !form.obra_id) {
      setError("Selecione a obra.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        tipo,
        descricao: form.descricao,
        valor: parseFloat(form.valor),
        data_emissao: form.data_emissao,
        data_vencimento: form.data_vencimento || null,
        forma_pagamento: form.forma_pagamento || null,
        banco_id: form.banco || null,
        pago: form.pago,
        data_pagamento: form.pago && form.data_pagamento ? form.data_pagamento : null,
        numero_nota: form.numero_nota || null,
        fornecedor: form.fornecedor || null,
      };

      if (tipo === "material") {
        payload.obra_id = form.obra_id;
        payload.categoria = form.categoria || null;
        payload.subcategoria = form.subcategoria || novaSubcat || null;
      } else if (tipo === "mao_de_obra") {
        payload.obra_id = form.obra_id;
        payload.subcategoria = form.subcategoria || novaSubcat || null;
      } else {
        payload.plano_contas = form.plano_contas || null;
      }

      const { error: dbError } = await supabase.from("custos_obra").insert([payload]);
      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => {
        if (form.obra_id) {
          navigate(`/obras/${form.obra_id}`);
        } else {
          navigate("/financeiro");
        }
      }, 1200);
    } catch (err) {
      setError(err.message || "Erro ao salvar lançamento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={form.obra_id ? `/obras/${form.obra_id}` : "/obras"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lançar Custo</h1>
          <p className="text-gray-500 text-sm">Formulário inteligente de lançamento</p>
        </div>
      </div>

      {/* Seleção de Tipo */}
      <div className="grid grid-cols-3 gap-3">
        {TIPOS.map(({ value, label, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleTipoChange(value)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              tipo === value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className={`font-semibold text-sm ${tipo === value ? "text-blue-700" : "text-gray-700"}`}>
              {label}
            </p>
            <p className="text-xs text-gray-400 mt-1 leading-tight">{desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos por tipo */}
        {(tipo === "material" || tipo === "mao_de_obra") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Vinculação à Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Obra *</Label>
                <Select value={form.obra_id} onValueChange={(v) => updateField("obra_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a obra..." />
                  </SelectTrigger>
                  <SelectContent>
                    {obras.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {tipo === "material" && (
                <div className="space-y-1.5">
                  <Label>Categoria (EAP)</Label>
                  <Select value={form.categoria} onValueChange={(v) => updateField("categoria", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PADRAO.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Subcategoria / Insumo</Label>
                <div className="flex gap-2">
                  <Select value={form.subcategoria} onValueChange={(v) => updateField("subcategoria", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Existente ou nova abaixo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategorias.map((s) => (
                        <SelectItem key={s.id} value={s.nome}>{s.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={novaSubcat}
                    onChange={(e) => setNovaSubcat(e.target.value)}
                    placeholder="Ou digite nova..."
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Alerta de saldo da categoria */}
              {catOrcada && (
                <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${alertaEstouro ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {alertaEstouro ? (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {alertaEstouro ? "Atenção: Este lançamento estourará o orçamento da categoria!" : "Saldo disponível na categoria"}
                    </p>
                    <p className="text-xs mt-0.5">
                      Orçado: {formatCurrency(catOrcada.valor_orcado)} · Saldo: {formatCurrency(saldoCategoria)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tipo === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Plano de Contas Administrativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Conta</Label>
                <Select value={form.plano_contas} onValueChange={(v) => updateField("plano_contas", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANO_CONTAS_ADMIN.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dados do lançamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dados do Lançamento</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Descrição *</Label>
              <Input
                value={form.descricao}
                onChange={(e) => updateField("descricao", e.target.value)}
                placeholder="Ex: Cimento CP-III 50 sacos, Nota Fiscal 1234..."
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fornecedor / Prestador</Label>
              <Input
                value={form.fornecedor}
                onChange={(e) => updateField("fornecedor", e.target.value)}
                placeholder="Nome do fornecedor (opcional)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nº Nota Fiscal / Documento</Label>
              <Input
                value={form.numero_nota}
                onChange={(e) => updateField("numero_nota", e.target.value)}
                placeholder="Ex: NF-001234"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => updateField("valor", e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data de Emissão (DRE)</Label>
              <Input
                type="date"
                value={form.data_emissao}
                onChange={(e) => updateField("data_emissao", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data de Vencimento (Caixa)</Label>
              <Input
                type="date"
                value={form.data_vencimento}
                onChange={(e) => updateField("data_vencimento", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Forma de Pagamento</Label>
              <Select value={form.forma_pagamento} onValueChange={(v) => updateField("forma_pagamento", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Banco de Saída</Label>
              <Select value={form.banco} onValueChange={(v) => updateField("banco", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco..." />
                </SelectTrigger>
                <SelectContent>
                  {bancos.length === 0 ? (
                    <SelectItem value="__nenhum__" disabled>Nenhum banco cadastrado</SelectItem>
                  ) : (
                    bancos.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Pago */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.pago}
                  onChange={(e) => updateField("pago", e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Já foi pago</span>
              </label>
            </div>

            {form.pago && (
              <div className="space-y-1.5">
                <Label>Data de Pagamento</Label>
                <Input
                  type="date"
                  value={form.data_pagamento}
                  onChange={(e) => updateField("data_pagamento", e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de impacto em tempo real */}
        {valorLancamento > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-800">Impacto do Lançamento</p>
                  <div className="mt-2 space-y-1 text-blue-700">
                    <p>Valor: <strong>{formatCurrency(valorLancamento)}</strong></p>
                    {tipo === "material" && form.categoria && (
                      <p>Categoria: <strong>{form.categoria}</strong></p>
                    )}
                    {tipo === "admin" && (
                      <p>Será rateado entre as obras ativas no DRE mensal.</p>
                    )}
                    {!form.pago && form.data_vencimento && (
                      <p>Entrará no fluxo de caixa em: <strong>
                        {new Date(form.data_vencimento).toLocaleDateString("pt-BR")}
                      </strong></p>
                    )}
                    {form.pago && (
                      <p className="text-green-700">Saldo bancário será debitado imediatamente.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
            Lançamento salvo com sucesso! Redirecionando...
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link to={form.obra_id ? `/obras/${form.obra_id}` : "/obras"}>
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving || success}>
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Lançamento"}
          </Button>
        </div>
      </form>
    </div>
  );
}
