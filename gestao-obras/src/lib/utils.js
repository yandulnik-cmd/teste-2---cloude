import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercent(value) {
  if (value === null || value === undefined) return "0%";
  return `${Number(value).toFixed(1)}%`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export const STATUS_LABELS = {
  planejamento: "Planejamento",
  em_execucao: "Em Execução",
  concluida: "Concluída",
  pausada: "Pausada",
};

export const STATUS_COLORS = {
  planejamento: "bg-blue-100 text-blue-800",
  em_execucao: "bg-green-100 text-green-800",
  concluida: "bg-gray-100 text-gray-800",
  pausada: "bg-yellow-100 text-yellow-800",
};

export const CATEGORIAS_PADRAO = [
  "Fundações",
  "Estrutura",
  "Alvenaria",
  "Cobertura",
  "Instalações Elétricas",
  "Instalações Hidráulicas",
  "Revestimentos",
  "Esquadrias",
  "Pintura",
  "Serviços Finais",
];

export const TIPO_CUSTO = {
  material: "Material/Serviço",
  mao_de_obra: "Mão de Obra",
  admin: "Administrativo",
};
