DICIONÁRIO E FLUXO DE DADOS - ERP GESTÃO DE OBRAS (V3.0)

Este documento mapeia cada campo do banco de dados, explicando a sua origem (como nasce) e o seu impacto (o que ele altera nos gráficos e relatórios).

1. MÓDULO: CADASTROS BÁSICOS

Tabela: bancos (Contas Bancárias)

nome: ⌨️ [Entrada Manual] - Nome do banco (Ex: "Itaú Obras").

saldo_inicial: ⌨️ [Entrada Manual] - O dinheiro que estava lá no dia em que o sistema começou a ser usado.

Impacto: É a base do Fluxo de Caixa. Todas as contas pagas vão subtrair daqui.

Tabela: categorias e subcategorias (A EAP)

nome: ⌨️ [Entrada Manual] - (Ex: "Fundações", "Cimento").

is_padrao: ⚙️ [Resultado do Sistema] - O sistema define como TRUE para categorias que não podem ser apagadas (travadas pela arquitetura).

2. MÓDULO: OBRAS E ORÇAMENTO (A Linha de Base)

Tabela: obras (O Cabeçalho do Projeto)

nome, cliente, area_m2: ⌨️ [Entrada Manual] - Cadastrado no início.

valor_contrato: ⌨️ [Entrada Manual] - O valor total da venda ao cliente. (Alimenta a Receita Mínima Esperada).

bdi_percentual: ⌨️ [Entrada Manual] - A % de Lucro/Indiretos.

mo_global_valor: ⌨️ [Entrada Manual] - O valor fixado para Mão de Obra.

contingencia_percentual: ⌨️ [Entrada Manual] - A gordura contra imprevistos.

A MÁGICA: Estes 4 campos geram o ⚙️ [Custo Direto de Materiais], que o sistema calcula subtraindo o BDI, MO e Contingência do Valor do Contrato.

Tabela: orcamento_categorias (A Distribuição / O Teto)

obra_id: 🔗 [Vínculo Relacional] - Puxa a Obra automaticamente.

categoria_id: 🔗 [Vínculo Relacional] - O utilizador seleciona "Estrutura".

percentual_material: ⌨️ [Entrada Manual] - O utilizador digita "35%".

valor_material: ⚙️ [Resultado Matemático] - O sistema calcula sozinho: Pega no "Custo Direto de Materiais" (da tabela obras) e multiplica pelos 35%.

Impacto: Este campo cria o Teto de Gastos. Se o financeiro tentar lançar uma nota fiscal maior que este valor, o sistema bloqueia/alerta.

3. MÓDULO: CRONOGRAMA E MEDIÇÃO FÍSICA

Tabela: cronograma_fisico (A Meta de Prazo)

mes_referencia: ⌨️ [Entrada Manual] - O mês planeado (Ex: Março 2024).

percentual_previsto_mes: ⌨️ [Entrada Manual] - O engenheiro diz: "Vou fazer 20% da estrutura este mês".

Impacto: Gera a linha tracejada cinza do gráfico "Curva S" (Baseline).

Tabela: medicao_fisica (A Realidade / Os Sliders)

percentual_acumulado: ⌨️ [Entrada Manual] - O utilizador arrasta o slider no tablet.

A MÁGICA DOS KPIs: Este slider, sozinho, gera os 3 dados mais vitais do sistema como ⚙️ [Resultado Matemático]:

Avanço % Real: O slider atual vs o slider planeado.

IDP (Prazo): Se o slider está atrás da meta do cronograma, IDP < 1.0.

Valor Agregado (VA): O sistema multiplica o slider pelo Orçamento e descobre quantos Reais (R$) a obra "ganhou" pelo esforço físico daquele mês.

4. MÓDULO: LANÇAMENTO DE CUSTOS (A Operação)

Tabela: despesas (O Boleto / A Nota Fiscal)

descricao: ⌨️ [Entrada Manual] - O que comprou (Ex: "50 Sacos Cimento").

fornecedor_id: 🔗 [Vínculo] ou fornecedor_texto: ⌨️ [Entrada] - Quem vendeu.

valor_total: ⌨️ [Entrada Manual] - O valor exato que vai sair do banco.

data_emissao: ⌨️ [Entrada Manual] - (A Data Competência).

Impacto: Esta data joga o custo para o DRE (Lucro do Mês), mesmo que a conta não tenha sido paga ainda.

data_vencimento: ⌨️ [Entrada Manual] - (A Data Caixa).

Impacto: Esta data joga o custo para o gráfico de Previsão de Caixa.

banco_id: 🔗 [Vínculo Relacional] - De qual conta sai o dinheiro.

is_fixa: ⌨️ [Entrada Manual] - Checkbox (True/False). Se True, o sistema clona este custo para os próximos meses no Fluxo de Caixa.

Tabela: despesa_rateios (A Divisão Inteligente)

Por que existe? Para permitir que uma nota fiscal de R$ 10.000 seja dividida (rateada) entre a Obra A e a Obra B.

despesa_id: 🔗 [Vínculo Relacional] - O sistema vincula automaticamente ao boleto que o utilizador acabou de lançar.

tipo_lancamento: ⌨️ [Entrada Manual] - O utilizador clica no grande botão: "Material", "Mão de Obra" ou "Admin".

valor_rateio: ⌨️ [Entrada Manual] - Pode ser o valor total da nota ou uma fatia dela (ex: R$ 5.000).

obra_id: 🔗 [Vínculo Relacional] - Obrigatório se for Material ou M.O. Desaparece se for Admin.

categoria_id: 🔗 [Vínculo Relacional] - Obrigatório se for Material ou Admin. Desaparece se for M.O. (porque M.O. desconta do balde global da obra).

subcategoria_id: 🔗 [Vínculo Relacional] - Sempre obrigatório para Material e M.O.

Impacto Total: É esta tabela que subtrai o saldo visual do Card Lateral de Impacto. É ela que gera o Gráfico de Pizza (Curva ABC) dizendo que 30% do dinheiro foi gasto na subcategoria "Aço".

5. MÓDULO: FATURAMENTO (A Receita)

Tabela: faturamentos (As Medições Cobradas)

obra_id: 🔗 [Vínculo Relacional].

valor_faturado: ⌨️ [Entrada Manual] - O valor do boleto emitido para o cliente.

data_vencimento: ⌨️ [Entrada Manual] - Quando o cliente tem de pagar. (Alimenta as entradas do Fluxo de Caixa).

A MÁGICA DO ALERTA: O sistema faz um ⚙️ [Resultado Matemático]: Pega no Valor Agregado (VA) gerado pelos sliders e subtrai o valor_faturado. Se o VA for maior, o sistema grita na tela inicial: "Dinheiro deixado na mesa: Faltam faturar X mil reais da obra Y!".

RESUMO DA INTELIGÊNCIA (O que ninguém digita, o sistema cria)

Nunca vai haver uma tabela chamada "lucro_da_obra" ou "fluxo_de_caixa_hoje". Isso são cálculos em tempo real.

O Saldo do Banco: Saldo Inicial (bancos) + Soma de Faturamentos Pagos - Soma de Despesas Pagas.

O Lucro Limpo da Obra (Margem Real):
Soma de Faturamentos (Receitas da Obra)

Soma de Rateios (Material + MO da Obra)

Sua fatia do Rateio Administrativo daquele mês (O pedágio da sede).

Ponto de Equilíbrio (Break-even):
Soma de todos os rateios tipo "Admin" com data de emissão neste mês.