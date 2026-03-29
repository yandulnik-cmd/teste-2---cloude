import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Tag, Layers, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";

function Section({ title, icon: Icon, children }) {
  return (
    <div className="dark-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl" style={{ background: "rgba(99,102,241,0.1)" }}>
          <Icon className="w-4 h-4" style={{ color: "#818cf8" }} />
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "#64748b" }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function Cadastros() {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [planoContas, setPlanoContas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [novaCat, setNovaCat] = useState("");
  const [novaSubNome, setNovaSubNome] = useState("");
  const [novaSubCat, setNovaSubCat] = useState("");
  const [novoConta, setNovoConta] = useState("");
  const [novoContaFixo, setNovoContaFixo] = useState(false);
  const [catSelecionada, setCatSelecionada] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [catRes, subRes, planoRes] = await Promise.all([
      supabase.from("categorias").select("*").order("nome"),
      supabase.from("subcategorias").select("*").order("nome"),
      supabase.from("plano_contas_admin").select("*").order("nome"),
    ]);
    setCategorias(catRes.data || []);
    setSubcategorias(subRes.data || []);
    setPlanoContas(planoRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function addCategoria() {
    if (!novaCat.trim()) return;
    const { error } = await supabase.from("categorias").insert([{ nome: novaCat.trim() }]);
    if (!error) { setNovaCat(""); fetchData(); }
  }

  async function removeCategoria(id) {
    if (!confirm("Excluir esta categoria?")) return;
    await supabase.from("categorias").delete().eq("id", id);
    fetchData();
  }

  async function addSubcategoria() {
    if (!novaSubNome.trim()) return;
    const { error } = await supabase.from("subcategorias").insert([{
      nome: novaSubNome.trim(),
      categoria: novaSubCat || null,
    }]);
    if (!error) { setNovaSubNome(""); fetchData(); }
  }

  async function removeSubcategoria(id) {
    await supabase.from("subcategorias").delete().eq("id", id);
    fetchData();
  }

  async function addPlanoContas() {
    if (!novoConta.trim()) return;
    const { error } = await supabase.from("plano_contas_admin").insert([{
      nome: novoConta.trim(),
      fixo: novoContaFixo,
    }]);
    if (!error) { setNovoConta(""); setNovoContaFixo(false); fetchData(); }
  }

  async function removePlanoContas(id) {
    await supabase.from("plano_contas_admin").delete().eq("id", id);
    fetchData();
  }

  const subcatsFiltradas = catSelecionada
    ? subcategorias.filter(s => s.categoria === catSelecionada)
    : subcategorias;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: "#475569" }}>Estrutura Analítica</p>
        <h1 className="text-2xl font-black tracking-tight text-white mt-1">Cadastros</h1>
        <p className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: "#475569" }}>
          Categorias, subcategorias e plano de contas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CATEGORIAS */}
        <Section title="Categorias (EAP)" icon={Tag}>
          <div className="flex gap-2 mb-4">
            <input
              className="input-dark flex-1"
              value={novaCat}
              onChange={e => setNovaCat(e.target.value)}
              placeholder="Nova categoria..."
              onKeyDown={e => e.key === "Enter" && addCategoria()}
            />
            <button className="btn-primary" onClick={addCategoria}><Plus className="w-4 h-4" /></button>
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {categorias.length === 0 ? (
              <p className="text-center py-6 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#334155" }}>Nenhuma categoria</p>
            ) : (
              categorias.map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group"
                  style={{
                    background: catSelecionada === cat.nome ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                    border: catSelecionada === cat.nome ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.04)",
                  }}
                  onClick={() => setCatSelecionada(catSelecionada === cat.nome ? null : cat.nome)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronRight className="w-3 h-3 flex-shrink-0 transition-transform"
                      style={{ color: "#475569", transform: catSelecionada === cat.nome ? "rotate(90deg)" : "none" }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white truncate">{cat.nome}</span>
                    {cat.padrao && <span className="tag-indigo" style={{ fontSize: "7px" }}>padrão</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[8px] font-bold mono" style={{ color: "#475569" }}>
                      {subcategorias.filter(s => s.categoria === cat.nome).length} sub
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); removeCategoria(cat.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "#475569" }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Section>

        {/* SUBCATEGORIAS */}
        <Section title={catSelecionada ? `Subcategorias de "${catSelecionada}"` : "Subcategorias (Insumos)"} icon={Layers}>
          <div className="flex gap-2 mb-4">
            <input
              className="input-dark flex-1"
              value={novaSubNome}
              onChange={e => setNovaSubNome(e.target.value)}
              placeholder="Nova subcategoria..."
              onKeyDown={e => e.key === "Enter" && addSubcategoria()}
            />
            <select
              className="input-dark"
              style={{ width: "140px" }}
              value={novaSubCat}
              onChange={e => setNovaSubCat(e.target.value)}
            >
              <option value="">Categoria</option>
              {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
            <button className="btn-primary" onClick={addSubcategoria}><Plus className="w-4 h-4" /></button>
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {subcatsFiltradas.length === 0 ? (
              <p className="text-center py-6 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#334155" }}>
                {catSelecionada ? `Nenhuma subcategoria em "${catSelecionada}"` : "Nenhuma subcategoria"}
              </p>
            ) : (
              subcatsFiltradas.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl group"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white truncate">{sub.nome}</span>
                    {sub.categoria && <span className="tag-amber" style={{ fontSize: "7px" }}>{sub.categoria}</span>}
                  </div>
                  <button onClick={() => removeSubcategoria(sub.id)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" style={{ color: "#475569" }} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Section>
      </div>

      {/* PLANO DE CONTAS */}
      <Section title="Plano de Contas Administrativo" icon={Tag}>
        <div className="flex gap-2 mb-4">
          <input
            className="input-dark flex-1"
            value={novoConta}
            onChange={e => setNovoConta(e.target.value)}
            placeholder="Nova conta administrativa..."
            onKeyDown={e => e.key === "Enter" && addPlanoContas()}
          />
          <label className="flex items-center gap-2 px-3 rounded-xl cursor-pointer"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <input type="checkbox" checked={novoContaFixo} onChange={e => setNovoContaFixo(e.target.checked)} className="w-3.5 h-3.5 rounded" />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>Fixo</span>
          </label>
          <button className="btn-primary" onClick={addPlanoContas}><Plus className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {planoContas.map(conta => (
            <div key={conta.id} className="flex items-center justify-between p-3 rounded-xl group"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white truncate">{conta.nome}</span>
                {conta.fixo && <span className="tag-rose" style={{ fontSize: "7px" }}>fixo</span>}
              </div>
              <button onClick={() => removePlanoContas(conta.id)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" style={{ color: "#475569" }} />
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
