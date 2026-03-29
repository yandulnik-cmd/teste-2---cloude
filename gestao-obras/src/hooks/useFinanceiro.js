import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useCustos(filters = {}) {
  const [custos, setCustos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustos = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("custos_obra")
        .select("*, bancos(nome)")
        .order("data_emissao", { ascending: false });

      if (filters.obra_id) query = query.eq("obra_id", filters.obra_id);
      if (filters.tipo) query = query.eq("tipo", filters.tipo);
      if (filters.pago !== undefined) query = query.eq("pago", filters.pago);
      if (filters.mes) {
        const inicio = `${filters.mes}-01`;
        const fim = new Date(filters.mes + "-01");
        fim.setMonth(fim.getMonth() + 1);
        query = query.gte("data_emissao", inicio).lt("data_emissao", fim.toISOString().split("T")[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCustos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.obra_id, filters.tipo, filters.mes]);

  useEffect(() => { fetchCustos(); }, [fetchCustos]);

  const createCusto = async (payload) => {
    const { data, error } = await supabase.from("custos_obra").insert([payload]).select().single();
    if (error) throw error;
    await fetchCustos();
    return data;
  };

  const updateCusto = async (id, payload) => {
    const { data, error } = await supabase.from("custos_obra").update(payload).eq("id", id).select().single();
    if (error) throw error;
    await fetchCustos();
    return data;
  };

  const deleteCusto = async (id) => {
    const { error } = await supabase.from("custos_obra").delete().eq("id", id);
    if (error) throw error;
    await fetchCustos();
  };

  return { custos, loading, error, fetchCustos, createCusto, updateCusto, deleteCusto };
}

export function useFaturamentos(filters = {}) {
  const [faturamentos, setFaturamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFaturamentos = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("faturamentos")
        .select("*, obras(nome), bancos(nome)")
        .order("data_emissao", { ascending: false });

      if (filters.obra_id) query = query.eq("obra_id", filters.obra_id);
      if (filters.recebido !== undefined) query = query.eq("recebido", filters.recebido);
      if (filters.mes) {
        const inicio = `${filters.mes}-01`;
        const fim = new Date(filters.mes + "-01");
        fim.setMonth(fim.getMonth() + 1);
        query = query.gte("data_emissao", inicio).lt("data_emissao", fim.toISOString().split("T")[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFaturamentos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.obra_id, filters.recebido, filters.mes]);

  useEffect(() => { fetchFaturamentos(); }, [fetchFaturamentos]);

  const createFaturamento = async (payload) => {
    const { data, error } = await supabase.from("faturamentos").insert([payload]).select().single();
    if (error) throw error;
    await fetchFaturamentos();
    return data;
  };

  const updateFaturamento = async (id, payload) => {
    const { data, error } = await supabase.from("faturamentos").update(payload).eq("id", id).select().single();
    if (error) throw error;
    await fetchFaturamentos();
    return data;
  };

  const deleteFaturamento = async (id) => {
    const { error } = await supabase.from("faturamentos").delete().eq("id", id);
    if (error) throw error;
    await fetchFaturamentos();
  };

  return { faturamentos, loading, error, fetchFaturamentos, createFaturamento, updateFaturamento, deleteFaturamento };
}

export function useBancos() {
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBancos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("saldo_bancos").select("*");
    setBancos(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBancos(); }, [fetchBancos]);

  const createBanco = async (payload) => {
    const { data, error } = await supabase.from("bancos").insert([payload]).select().single();
    if (error) throw error;
    await fetchBancos();
    return data;
  };

  const deleteBanco = async (id) => {
    const { error } = await supabase.from("bancos").delete().eq("id", id);
    if (error) throw error;
    await fetchBancos();
  };

  return { bancos, loading, fetchBancos, createBanco, deleteBanco };
}
