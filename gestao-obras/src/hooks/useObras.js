import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useObras() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchObras = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("obras")
        .select(`
          *,
          orcamento_categorias (
            id, categoria, valor_orcado, percentual_orcado
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setObras(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObras();
  }, [fetchObras]);

  const createObra = async (obraData) => {
    const { data, error } = await supabase
      .from("obras")
      .insert([obraData])
      .select()
      .single();
    if (error) throw error;
    await fetchObras();
    return data;
  };

  const updateObra = async (id, obraData) => {
    const { data, error } = await supabase
      .from("obras")
      .update(obraData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    await fetchObras();
    return data;
  };

  const deleteObra = async (id) => {
    const { error } = await supabase.from("obras").delete().eq("id", id);
    if (error) throw error;
    await fetchObras();
  };

  return { obras, loading, error, fetchObras, createObra, updateObra, deleteObra };
}

export function useObra(id) {
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchObra = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("obras")
        .select(`
          *,
          orcamento_categorias (
            id, categoria, valor_orcado, percentual_orcado,
            progresso_fisico (id, percentual_real, data_registro),
            custos_obra (id, valor, tipo, descricao, data_emissao)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setObra(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchObra();
  }, [fetchObra]);

  return { obra, loading, error, refetch: fetchObra };
}
