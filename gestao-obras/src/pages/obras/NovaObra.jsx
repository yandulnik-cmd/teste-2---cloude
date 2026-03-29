import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Calculator } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useObras } from "../../hooks/useObras";
import { formatCurrency, CATEGORIAS_PADRAO } from "../../lib/utils";

const CATEGORIAS_INICIAIS = CATEGORIAS_PADRAO.map((nome) => ({
  categoria: nome,
  valor_orcado: 0,
  percentual_orcado: 0,
}));

function Section({ title, children }) {
  return (
    <div className="dark-card p-6 space-y-4">
      <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "#475569" }}>{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="label-dark">{label}</label>
      {children}
    </div>
  );
}

export default function NovaObra() {
  const navigate = useNavigate();
  const { createObra } = useObras();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nome: "", cliente: "", endereco: "", area_m2: "",
    valor_contrato: "", bdi_percentual: "20",
    mao_de_obra_percentual: "30", contingencia_percentual: "5",
    data_inicio: "", data_previsao_fim: "", status: "planejamento", descricao: "",
  });

  const [categorias, setCategorias] = useState(CATEGORIAS_INICIAIS);

  const valorContrato = parseFloat(form.valor_contrato) || 0;
  const bdi = (valorContrato * parseFloat(form.bdi_percentual || 0)) / 100;
  const maoDeObra = (valorContrato * parseFloat(form.mao_de_obra_percentual || 0)) / 100;
  const contingencia = (valorContrato * parseFloat(form.contingencia_percentual || 0)) / 100;
  const custoDisponivel = valorContrato - bdi - maoDeObra - contingencia;
  const totalOrcado = categorias.reduce((s, c) => s + (c.valor_orcado || 0), 0);
  const saldoDistribuir = custoDisponivel - totalOrcado;

  function updateField(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function updateCategoria(idx, field, value) {
    setCategorias((cats) => {
      const next = [...cats];
      if (field === "valor_orcado") {
        const val = parseFloat(value) || 0;
        next[idx] = { ...next[idx], valor_orcado: val, percentual_orcado: custoDisponivel > 0 ? (val / custoDisponivel) * 100 : 0 };
      } else if (field === "percentual_orcado") {
        const pct = parseFloat(value) || 0;
        next[idx] = { ...next[idx], percentual_orcado: pct, valor_orcado: (custoDisponivel * pct) / 100 };
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.valor_contrato) { setError("Nome e valor do contrato são obrigatórios."); return; }
    setSaving(true); setError(null);
    try {
      const obra = await createObra({
        ...form,
        area_m2: form.area_m2 ? parseFloat(form.area_m2) : null,
        valor_contrato: parseFloat(form.valor_contrato),
        bdi_percentual: parseFloat(form.bdi_percentual),
        mao_de_obra_percentual: parseFloat(form.mao_de_obra_percentual),
        contingencia_percentual: parseFloat(form.contingencia_percentual),
        custo_direto_disponivel: custoDisponivel,
        data_inicio: form.data_inicio || null,
        data_previsao_fim: form.data_previsao_fim || null,
      });
      const cats = categorias.filter(c => c.valor_orcado > 0).map(c => ({ ...c, obra_id: obra.id }));
      if (cats.length > 0) await supabase.from("orcamento_categorias").insert(cats);
      navigate(`/obras/${obra.id}`);
    } catch (err) {
      setError(err.message || "Erro ao salvar obra.");
    } finally { setSaving(false); }
  }

  const inputStyle = { colorScheme: "dark" };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/obras">
          <button className="btn-ghost-dark w-9 h-9 p-0 flex items-center justify-center rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: "#475569" }}>Nova Obra</p>
          <h1 className="text-2xl font-black tracking-tight text-white">Cadastro e Orçamento</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Section title="Dados da Obra">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome da Obra *">
              <input className="input-dark" value={form.nome} onChange={e => updateField("nome", e.target.value)} placeholder="Ex: Residência Família Silva" required />
            </Field>
            <Field label="Cliente">
              <input className="input-dark" value={form.cliente} onChange={e => updateField("cliente", e.target.value)} placeholder="Nome do cliente" />
            </Field>
            <Field label="Endereço">
              <input className="input-dark" value={form.endereco} onChange={e => updateField("endereco", e.target.value)} placeholder="Endereço completo" />
            </Field>
            <Field label="Área (m²)">
              <input className="input-dark" type="number" value={form.area_m2} onChange={e => updateField("area_m2", e.target.value)} placeholder="250" />
            </Field>
            <Field label="Data de Início">
              <input className="input-dark" type="date" style={inputStyle} value={form.data_inicio} onChange={e => updateField("data_inicio", e.target.value)} />
            </Field>
            <Field label="Previsão de Conclusão">
              <input className="input-dark" type="date" style={inputStyle} value={form.data_previsao_fim} onChange={e => updateField("data_previsao_fim", e.target.value)} />
            </Field>
            <Field label="Status">
              <select className="input-dark" value={form.status} onChange={e => updateField("status", e.target.value)} style={{ colorScheme: "dark" }}>
                <option value="planejamento">Planejamento</option>
                <option value="em_execucao">Em Execução</option>
                <option value="concluida">Concluída</option>
                <option value="pausada">Pausada</option>
              </select>
            </Field>
            <Field label="Observações">
              <input className="input-dark" value={form.descricao} onChange={e => updateField("descricao", e.target.value)} placeholder="Informações adicionais" />
            </Field>
          </div>
        </Section>

        <Section title="Orçamento Top-Down">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Valor do Contrato (R$) *">
              <input className="input-dark" type="number" value={form.valor_contrato} onChange={e => updateField("valor_contrato", e.target.value)} placeholder="0,00" required />
            </Field>
            <Field label="BDI (%)">
              <input className="input-dark" type="number" value={form.bdi_percentual} onChange={e => updateField("bdi_percentual", e.target.value)} />
            </Field>
            <Field label="Mão de Obra (%)">
              <input className="input-dark" type="number" value={form.mao_de_obra_percentual} onChange={e => updateField("mao_de_obra_percentual", e.target.value)} />
            </Field>
            <Field label="Contingência (%)">
              <input className="input-dark" type="number" value={form.contingencia_percentual} onChange={e => updateField("contingencia_percentual", e.target.value)} />
            </Field>
          </div>

          {valorContrato > 0 && (
            <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}>
              {[
                { label: `Valor do Contrato`, value: formatCurrency(valorContrato), color: "#f8fafc" },
                { label: `(-) BDI (${form.bdi_percentual}%)`, value: `- ${formatCurrency(bdi)}`, color: "#64748b" },
                { label: `(-) Mão de Obra (${form.mao_de_obra_percentual}%)`, value: `- ${formatCurrency(maoDeObra)}`, color: "#64748b" },
                { label: `(-) Contingência (${form.contingencia_percentual}%)`, value: `- ${formatCurrency(contingencia)}`, color: "#64748b" },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span style={{ color: row.color }}>{row.label}</span>
                  <span className="mono font-bold" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-black pt-2" style={{ borderTop: "1px solid rgba(99,102,241,0.2)" }}>
                <span style={{ color: "#818cf8" }}>= Custo Direto Disponível</span>
                <span className="mono" style={{ color: "#818cf8" }}>{formatCurrency(custoDisponivel)}</span>
              </div>
            </div>
          )}
        </Section>

        {custoDisponivel > 0 && (
          <Section title="Distribuição por Categorias (EAP)">
            <div className="space-y-2">
              {categorias.map((cat, idx) => (
                <div key={cat.categoria} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{cat.categoria}</p>
                  </div>
                  <div className="col-span-3">
                    <input
                      className="input-dark text-right text-xs"
                      type="number" placeholder="0"
                      value={cat.percentual_orcado > 0 ? cat.percentual_orcado.toFixed(1) : ""}
                      onChange={e => updateCategoria(idx, "percentual_orcado", e.target.value)}
                      style={{ padding: "0.4rem 0.75rem" }}
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      className="input-dark text-right text-xs mono"
                      type="number" placeholder="0,00"
                      value={cat.valor_orcado > 0 ? cat.valor_orcado.toFixed(2) : ""}
                      onChange={e => updateCategoria(idx, "valor_orcado", e.target.value)}
                      style={{ padding: "0.4rem 0.75rem" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl text-sm font-black" style={{
              background: Math.abs(saldoDistribuir) < 1 ? "rgba(16,185,129,0.1)" : saldoDistribuir < 0 ? "rgba(244,63,94,0.1)" : "rgba(245,158,11,0.1)",
              color: Math.abs(saldoDistribuir) < 1 ? "#34d399" : saldoDistribuir < 0 ? "#fb7185" : "#fbbf24",
            }}>
              <span>{Math.abs(saldoDistribuir) < 1 ? "Orçamento distribuído ✓" : saldoDistribuir > 0 ? "Saldo a distribuir" : "Orçamento ultrapassado"}</span>
              <span className="mono">{formatCurrency(Math.abs(saldoDistribuir))}</span>
            </div>
          </Section>
        )}

        {error && (
          <div className="p-4 rounded-2xl text-sm font-bold" style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.2)" }}>
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pb-4">
          <Link to="/obras"><button className="btn-ghost-dark" type="button">Cancelar</button></Link>
          <button className="btn-primary" type="submit" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Obra"}
          </button>
        </div>
      </form>
    </div>
  );
}
