-- ============================================================
-- SCHEMA GESTÃO DE OBRAS - v3.0
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- ========================
-- TABELAS BASE
-- ========================

-- Bancos / Contas Bancárias
CREATE TABLE IF NOT EXISTS bancos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  saldo_inicial NUMERIC(14,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias da EAP (macro)
CREATE TABLE IF NOT EXISTS categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  padrao BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subcategorias / Insumos (micro, livres)
CREATE TABLE IF NOT EXISTS subcategorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plano de contas administrativo
CREATE TABLE IF NOT EXISTS plano_contas_admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  fixo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- OBRAS
-- ========================

CREATE TABLE IF NOT EXISTS obras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cliente TEXT,
  endereco TEXT,
  area_m2 NUMERIC(10,2),
  valor_contrato NUMERIC(14,2) NOT NULL,
  bdi_percentual NUMERIC(5,2) DEFAULT 20,
  mao_de_obra_percentual NUMERIC(5,2) DEFAULT 30,
  contingencia_percentual NUMERIC(5,2) DEFAULT 5,
  custo_direto_disponivel NUMERIC(14,2),
  status TEXT DEFAULT 'planejamento'
    CHECK (status IN ('planejamento','em_execucao','concluida','pausada')),
  data_inicio DATE,
  data_previsao_fim DATE,
  percentual_planejado NUMERIC(5,2) DEFAULT 0,
  percentual_real NUMERIC(5,2) DEFAULT 0,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orçamento por categorias (EAP)
CREATE TABLE IF NOT EXISTS orcamento_categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  valor_orcado NUMERIC(14,2) DEFAULT 0,
  percentual_orcado NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cronograma físico por categoria (planejamento mensal)
CREATE TABLE IF NOT EXISTS cronograma_fisico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  mes INTEGER NOT NULL,  -- 1 = primeiro mês da obra
  percentual_planejado NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progresso físico real (medição via slider)
CREATE TABLE IF NOT EXISTS progresso_fisico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  percentual_real NUMERIC(5,2) DEFAULT 0,
  data_registro DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- CUSTOS
-- ========================

CREATE TABLE IF NOT EXISTS custos_obra (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('material','mao_de_obra','admin')),
  obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,  -- NULL para admin
  categoria TEXT,         -- categoria EAP (material)
  subcategoria TEXT,      -- insumo livre
  plano_contas TEXT,      -- para admin
  fornecedor TEXT,
  descricao TEXT NOT NULL,
  valor NUMERIC(14,2) NOT NULL,
  numero_nota TEXT,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,  -- para DRE
  data_vencimento DATE,                             -- para caixa
  forma_pagamento TEXT,
  banco_id UUID REFERENCES bancos(id) ON DELETE SET NULL,
  pago BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rateio de despesas entre múltiplas obras
CREATE TABLE IF NOT EXISTS custos_rateio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  custo_id UUID REFERENCES custos_obra(id) ON DELETE CASCADE,
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
  percentual NUMERIC(5,2),
  valor_rateado NUMERIC(14,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- FINANCEIRO
-- ========================

-- Faturamentos / Medições cobradas do cliente
CREATE TABLE IF NOT EXISTS faturamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
  numero_medicao INTEGER,
  descricao TEXT,
  valor NUMERIC(14,2) NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  data_recebimento DATE,
  recebido BOOLEAN DEFAULT FALSE,
  banco_id UUID REFERENCES bancos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movimentações bancárias avulsas
CREATE TABLE IF NOT EXISTS movimentacoes_bancarias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  banco_id UUID REFERENCES bancos(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('entrada','saida')),
  descricao TEXT,
  valor NUMERIC(14,2),
  data_movimentacao DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- DADOS INICIAIS
-- ========================

-- Categorias padrão
INSERT INTO categorias (nome, padrao) VALUES
  ('Fundações', TRUE),
  ('Estrutura', TRUE),
  ('Alvenaria', TRUE),
  ('Cobertura', TRUE),
  ('Instalações Elétricas', TRUE),
  ('Instalações Hidráulicas', TRUE),
  ('Revestimentos', TRUE),
  ('Esquadrias', TRUE),
  ('Pintura', TRUE),
  ('Serviços Finais', TRUE)
ON CONFLICT (nome) DO NOTHING;

-- Plano de contas admin padrão
INSERT INTO plano_contas_admin (nome, fixo) VALUES
  ('Aluguel e Condomínio', TRUE),
  ('Internet e Telefone', TRUE),
  ('Contador / Honorários', TRUE),
  ('Salários Administrativos', TRUE),
  ('Software e Licenças', TRUE),
  ('Material de Escritório', FALSE),
  ('Combustível (Geral)', FALSE),
  ('Marketing e Publicidade', FALSE),
  ('Outros Administrativos', FALSE);

-- ========================
-- VIEWS CALCULADAS
-- ========================

-- Saldo atual por banco
CREATE OR REPLACE VIEW saldo_bancos AS
SELECT
  b.id,
  b.nome,
  b.saldo_inicial,
  COALESCE(SUM(CASE WHEN c.pago THEN -c.valor ELSE 0 END), 0) AS saidas_pagas,
  COALESCE(SUM(CASE WHEN f.recebido THEN f.valor ELSE 0 END), 0) AS entradas_recebidas,
  b.saldo_inicial
    + COALESCE(SUM(CASE WHEN f.recebido AND f.banco_id = b.id THEN f.valor ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN c.pago AND c.banco_id = b.id THEN c.valor ELSE 0 END), 0)
    AS saldo_atual
FROM bancos b
LEFT JOIN custos_obra c ON c.banco_id = b.id
LEFT JOIN faturamentos f ON f.banco_id = b.id
WHERE b.ativo = TRUE
GROUP BY b.id, b.nome, b.saldo_inicial;

-- DRE por obra e mês
CREATE OR REPLACE VIEW dre_mensal AS
SELECT
  o.id AS obra_id,
  o.nome AS obra_nome,
  DATE_TRUNC('month', f.data_emissao) AS mes,
  COALESCE(SUM(f.valor), 0) AS receita_bruta,
  COALESCE(SUM(c.valor) FILTER (WHERE c.tipo = 'material'), 0) AS custo_material,
  COALESCE(SUM(c.valor) FILTER (WHERE c.tipo = 'mao_de_obra'), 0) AS custo_mao_obra,
  COALESCE(SUM(f.valor), 0)
    - COALESCE(SUM(c.valor) FILTER (WHERE c.tipo IN ('material','mao_de_obra')), 0)
    AS margem_bruta
FROM obras o
LEFT JOIN faturamentos f ON f.obra_id = o.id
LEFT JOIN custos_obra c ON c.obra_id = o.id
  AND DATE_TRUNC('month', c.data_emissao) = DATE_TRUNC('month', f.data_emissao)
GROUP BY o.id, o.nome, DATE_TRUNC('month', f.data_emissao);

-- ========================
-- RLS (Row Level Security)
-- ========================
-- Habilite RLS e crie políticas conforme sua necessidade de autenticação.
-- Para começar sem auth, deixe as políticas abertas:

ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE custos_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bancos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias ENABLE ROW LEVEL SECURITY;

-- Políticas abertas (sem auth) - troque por políticas com auth quando pronto
CREATE POLICY "allow_all_obras" ON obras FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_orcamento" ON orcamento_categorias FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_custos" ON custos_obra FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_faturamentos" ON faturamentos FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_bancos" ON bancos FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_categorias" ON categorias FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_subcategorias" ON subcategorias FOR ALL USING (TRUE) WITH CHECK (TRUE);
