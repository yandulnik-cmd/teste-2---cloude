Sistema de Gestão de Obras e Financeiro – Estrutura Completa

Este documento descreve a arquitetura completa de um sistema de gestão
de obras para construtoras, incluindo estrutura de banco de dados,
funcionalidades, dashboards, páginas do sistema e integração entre os
dados.

O objetivo do sistema é permitir controle completo de:

-   Obras
-   Custos
-   Receitas
-   Fluxo de caixa
-   Previsão financeira
-   Rentabilidade das obras
-   Planejamento financeiro da empresa

============================================================

VISÃO GERAL DO SISTEMA

O sistema possui quatro núcleos principais:

1.  Obras
2.  Financeiro
3.  Planejamento
4.  Administração

Esses módulos trabalham integrados.

A obra é o centro de todas as informações.

Todas as movimentações financeiras, custos e medições estão vinculadas a
uma obra.

============================================================

MÓDULO OBRAS

Esse módulo gerencia todas as informações das construções.

Funções principais:

-   Cadastro de obras
-   Controle de orçamento
-   Controle de custos
-   Medições
-   Progresso físico da obra
-   Análise de lucratividade

Campos principais da obra:

id nome cliente area_m2 valor_contrato data_inicio data_fim_prevista
status

Status possíveis:

planejamento em execução concluída pausada

============================================================

ORÇAMENTO DA OBRA

Tabela responsável por armazenar o custo previsto da obra.

Cada obra possui um orçamento dividido por categorias.

Campos:

id obra_id categoria_id valor_previsto

Exemplo:

Fundação → 30.000 Estrutura → 50.000 Alvenaria → 25.000

Essa tabela permite criar análises:

-   Previsto vs realizado
-   Estouro de orçamento
-   Planejamento financeiro

============================================================

CATEGORIAS DE OBRA

As categorias organizam os custos da construção.

Exemplos de categorias:

Serviços preliminares Fundação Estrutura Alvenaria Cobertura Instalações
elétricas Instalações hidráulicas Revestimentos Pintura Esquadrias Forro
Pisos Complementos

Campos da tabela:

id nome tipo

Tipo:

obra administrativo

============================================================

SUBCATEGORIAS

Servem para detalhar os custos.

Exemplo:

Categoria: Estrutura

Subcategorias:

Concreto Aço Forma Mão de obra

Campos:

id categoria_id nome

============================================================

CUSTOS DA OBRA

Essa é a tabela mais utilizada do sistema.

Registra todas as despesas relacionadas às obras.

Campos:

id obra_id categoria_id subcategoria_id data descricao fornecedor valor
forma_pagamento banco_id status_pagamento conta_pagar_id

Esses dados alimentam:

-   fluxo de caixa
-   custo total da obra
-   análise financeira
-   dashboards

============================================================

MEDIÇÕES

Representam valores faturados para o cliente.

Campos:

id obra_id numero data valor status conta_receber_id

Status:

pendente aprovado recebido

As medições alimentam:

-   contas a receber
-   fluxo de caixa
-   faturamento da empresa

============================================================

PROGRESSO FÍSICO DA OBRA

Permite registrar o avanço da obra.

Campos:

id obra_id data percentual observacao

Esse dado permite criar análises como:

progresso físico vs custo executado

Exemplo:

Obra executada 60% Custo executado 75%

Indica risco de estouro de orçamento.

============================================================

MÓDULO FINANCEIRO

Responsável por gerenciar o dinheiro da empresa.

Inclui:

-   contas a pagar
-   contas a receber
-   fluxo de caixa
-   movimentações bancárias

============================================================

CONTAS A PAGAR

Registra despesas futuras.

Campos:

id descricao obra_id valor data_vencimento status categoria

Status:

pendente pago

============================================================

CONTAS A RECEBER

Registra valores que a empresa irá receber.

Campos:

id descricao obra_id valor data_prevista status

Status:

pendente recebido

============================================================

MOVIMENTAÇÕES FINANCEIRAS

Tabela responsável pelo fluxo de caixa.

Registra entradas e saídas reais.

Campos:

id banco_id tipo origem origem_id data valor descricao

Tipo:

entrada saida

Origem:

custo medicao administrativo manual

============================================================

BANCOS

Controla contas bancárias da empresa.

Campos:

id nome saldo_inicial

Permite acompanhar saldo por conta.

============================================================

CUSTOS ADMINISTRATIVOS

Custos que não pertencem a nenhuma obra.

Exemplos:

Aluguel Internet Contador Software Salários administrativos

Campos:

id descricao categoria valor data banco_id

============================================================

FORNECEDORES

Tabela para controle de fornecedores.

Campos:

id nome telefone tipo

Permite análises como:

-   ranking de fornecedores
-   histórico de compras

============================================================

DASHBOARDS DO SISTEMA

O sistema possui três níveis de dashboards.

1.  Dashboard da empresa
2.  Dashboard das obras
3.  Dashboard operacional

============================================================

DASHBOARD DA EMPRESA

Mostra a saúde financeira geral.

Indicadores:

saldo de caixa contas a receber contas a pagar lucro estimado das obras

Indicador principal:

Saúde financeira da empresa.

Fórmula:

Saldo caixa + contas a receber - contas a pagar + lucro estimado obras

============================================================

PREVISÃO DE CAIXA

O dashboard mais importante.

Projeta entradas e saídas futuras.

Dados utilizados:

contas a pagar contas a receber medições previstas

Permite prever meses com risco de falta de caixa.

============================================================

DINHEIRO PRESO EM OBRAS

Compara:

executado fisicamente medido recebido

Exemplo:

Executado: 200k Medido: 160k Recebido: 120k

80k ainda não entrou no caixa.

============================================================

LUCRO DAS OBRAS

Calculado por:

valor do contrato - custo total da obra

Permite criar ranking de obras mais lucrativas.

============================================================

CURVA S DA OBRA

Gráfico utilizado na engenharia.

Mostra:

custo acumulado ao longo do tempo.

Permite comparar:

planejado vs realizado

============================================================

CUSTO POR METRO QUADRADO

Cálculo:

custo total da obra ÷ área da obra

Permite criar histórico de custos para futuros orçamentos.

============================================================

PÁGINAS DO SISTEMA

Página inicial:

Dashboard financeiro da empresa

Página obras:

lista de obras status valor contrato lucro estimado

Página obra detalhada:

orçamento custos medições progresso físico lucro da obra

Página custos:

lançamento de despesas

Página medições:

lançamento de faturamento

Página financeiro:

contas a pagar contas a receber fluxo de caixa

Página fornecedores:

cadastro e histórico

Página bancos:

controle de contas bancárias

============================================================

TECNOLOGIA DO SISTEMA

Front-end:

React

Estilização:

Tailwind CSS

Componentes:

Shadcn UI

Back-end:

Supabase

Banco de dados:

PostgreSQL

============================================================

OBJETIVO FINAL DO SISTEMA

Criar um sistema que permita:

controle total das obras controle financeiro da empresa previsão de
caixa análise de rentabilidade tomada de decisão baseada em dados
