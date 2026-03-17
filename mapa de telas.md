Mapa de Telas e Dashboards (Sitemap do Sistema)

Este documento descreve o que o utilizador vai visualizar e fazer em cada página do sistema. A hierarquia foi pensada para ir do "Macro" (Visão Geral da Empresa) para o "Micro" (Detalhe do tijolo comprado).

1. PÁGINA INICIAL: DASHBOARD GERAL (Visão Executiva)

Pergunta que responde: "A empresa está saudável hoje e tem dinheiro para a próxima semana?"

KPIs (Cards no Topo):

Saldo Total em Contas (Soma de todos os bancos).

A Pagar (Próximos 15 dias).

A Receber (Próximos 15 dias).

Alerta de Risco: Ponto de Equilíbrio do mês (Quanto falta faturar para cobrir a sede).

Gráficos:

Previsão de Caixa (Gráfico de Barras): Eixo X são os próximos 6 meses. Barras verdes (Entradas Previstas) e vermelhas (Saídas). Se a barra vermelha for maior que a verde em algum mês, o sistema pinta o mês de amarelo.

Análises em Texto (Insights):

"Alerta de Efeito Tesoura: O seu Prazo Médio de Pagamento é 30 dias, e o de Recebimento é 45 dias. Risco de descapitalização na 2ª quinzena."

Ações Rápidas: Botões gigantes para "Novo Lançamento", "Nova Obra", "Aprovar Compras".

2. PÁGINA: PORTFÓLIO DE OBRAS (Lista)

Pergunta que responde: "Quais obras estão a dar problema e exigem a minha atenção?"

KPIs (Cards no Topo):

Total de Obras em Execução.

Obras com Atraso Crítico (IDP < 1.0).

Obras com Margem no Vermelho (IDC < 1.0).

Visualização Principal (Tabela de Obras):

Nome | Cliente | Valor do Contrato.

Barra Visual Dupla: Uma barra azul mostrando o Progresso Físico (%) em cima de uma barra verde mostrando o Progresso Financeiro (Faturado %).

Badge de Status Inteligente: Em vez de dizer apenas "Em Execução", diz "Em Execução (Estourou Orçamento)" se o IDC < 1.

Análises em Texto:

Ranking: "As 3 Obras Mais Lucrativas do Ano" vs "As 3 Obras que mais consumiram o caixa".

Ações Rápidas: Botão "Cadastrar Nova Obra".

3. PÁGINA: COCKPIT DA OBRA (A Obra Detalhada)

Pergunta que responde: "Exatamente onde esta obra específica está a ganhar ou perder dinheiro?"
(Nota: Esta página tem abas internas para não poluir a tela)

Aba 1: Resumo & EVM (Engenharia de Custos)

KPIs: Progresso Físico Real vs Planeado, Valor Agregado (R$), IDC, IDP, Custo Paramétrico Atual (R$/m²).

Gráfico: A Curva S. Três linhas cruzando-se: Planeado (Cinza tracejado) vs Custo Real (Vermelho) vs Faturado (Verde).

Análises em Texto: "Dinheiro na Mesa: A obra gerou R$ 50 mil em valor agregado este mês, mas apenas R$ 30 mil foram faturados nas medições. Faltam R$ 20 mil."

Aba 2: Orçamento (O Teto de Gastos)

Gráfico: Barras Horizontais por Categoria (Fundações, Estrutura). A barra vai enchendo conforme os gastos são lançados.

Análises: "A categoria 'Fundações' atingiu 95% do orçamento, mas a etapa física está apenas em 60%. Risco grave de estouro."

Aba 3: Cronograma e Medição (Os Sliders)

Aqui fica a tela de sliders que desenhámos, onde o engenheiro arrasta as barras para atualizar o avanço físico do mês, gerando automaticamente o VA e o IDP.

4. PÁGINA: CENTRAL DE LANÇAMENTOS (Custos e Despesas)

Pergunta que responde: "Como lanço esta nota fiscal sem errar a classificação contábil?"

Esta é a tela inteligente de formulário dinâmico.

Ações Principais: Escolher entre Material, Mão de Obra ou Administrativo.

Análises em Texto (O Feedback Dinâmico):

Não há gráficos pesados aqui, mas há o Card de Impacto Lateral.

"Se você salvar este lançamento, o saldo da categoria 'Elétrica' cairá para R$ 1.200."

"Se você pagar isto à vista, o saldo do Banco Itaú ficará negativo."

5. PÁGINA: INTELIGÊNCIA FINANCEIRA (DRE & Rateio)

Pergunta que responde: "No final das contas, qual foi o verdadeiro lucro limpo da construtora no mês?"

KPIs (Cards no Topo):

Faturamento Total (Mês).

Custos Diretos Totais (Soma das Obras).

Custos Indiretos (Sede / Administrativo).

Lucro Líquido Limpo e Margem Líquida (%).

Gráficos:

Gráfico em Cascata (DRE Waterfall): Uma barra grande verde (Receitas), subtraindo barras vermelhas (Impostos, Materiais, Mão de Obra, Sede), até sobrar a barra final azul (Lucro Líquido).

Curva ABC (Gráfico de Donut): Mostrando as Subcategorias. Ex: "Aço CA-50 representa 22% de todos os custos da empresa".

Análises em Texto (A Tabela da Verdade):

Tabela de Rateio Administrativo: Mostra a Obra X, o Lucro Bruto dela, e subtrai o "Pedágio" (o custo do escritório dividido por ela), revelando o Lucro Limpo da Obra.

Insight: "O seu Ponto de Equilíbrio é R$ 80 mil. A construtora já atingiu esta meta este mês."

6. PÁGINA: SUPRIMENTOS E COMPRAS (Prevenção)

Pergunta que responde: "O que as obras estão a pedir para comprar que vai impactar o meu caixa no futuro?"

KPIs: Total em Ordens de Compra (Pedidos Pendentes), Compras Aprovadas no Mês.

Listagem: Requisições de material feitas pelos engenheiros aguardando aprovação do financeiro.

Análises em Texto:

Alerta Just-in-Time: "Atenção: Estão a pedir para comprar Cerâmica para o Edifício Horizonte, mas o cronograma diz que essa etapa só inicia daqui a 3 meses. Deseja reter a compra para não congelar o capital?"

7. PÁGINA: MEDIÇÕES E FATURAMENTO

Pergunta que responde: "O que eu já posso cobrar aos meus clientes hoje?"

Listagem: Contas a Receber geradas pelas medições da Obra.

Análises em Texto:

Alertas de Inadimplência: "O cliente Y tem uma medição de R$ 45.000 atrasada há 15 dias."

8. PÁGINA: CONFIGURAÇÕES E BANCOS (Admin)

Pergunta que responde: "Como estão as regras e os cofres do sistema?"

Abas Internas:

EAP (Categorias e Subcategorias): A lista em "Sanfona" onde o dono cadastra os insumos da empresa (Aço, Cimento, Tijolo).

Bancos e Caixas: Cadastro das contas bancárias com o saldo inicial para a conciliação.

Fornecedores e Clientes: Uma tabela simples de cadastros. (Com um Insight futuro: Ranking de melhores fornecedores).