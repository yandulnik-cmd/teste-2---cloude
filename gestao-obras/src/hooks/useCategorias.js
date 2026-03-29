import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CATEGORIAS_PADRAO } from "../lib/utils";

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [catResult, subResult] = await Promise.all([
        supabase.from("categorias").select("*").order("nome"),
        supabase.from("subcategorias").select("*").order("nome"),
      ]);

      // Se não tiver categorias no banco, usa as padrão
      if (!catResult.error && catResult.data?.length > 0) {
        setCategorias(catResult.data);
      } else {
        setCategorias(CATEGORIAS_PADRAO.map((nome, i) => ({ id: `padrao-${i}`, nome })));
      }

      if (!subResult.error) {
        setSubcategorias(subResult.data || []);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  return { categorias, subcategorias, loading };
}

export function usePlanoContas() {
  const [plano, setPlano] = useState([]);

  useEffect(() => {
    supabase
      .from("plano_contas_admin")
      .select("*")
      .order("nome")
      .then(({ data }) => setPlano(data || []));
  }, []);

  return { plano };
}
