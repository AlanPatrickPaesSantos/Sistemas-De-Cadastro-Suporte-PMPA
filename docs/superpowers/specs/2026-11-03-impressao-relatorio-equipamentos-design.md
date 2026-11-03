# Impressão do Relatório de Equipamentos — desenho

## Intenção

Adicionar impressão do relatório de Equipamentos usando os registros já carregados em `results`, mantendo a pesquisa existente por `startDate`/`endDate` e sem alterar a impressão de Missões.

## Escopo e restrições

- Alterar somente `frontend/src/components/RelatoriosSection.tsx` e seus testes.
- Não recriar filtros, alterar endpoints ou modificar dados.
- Exibir apenas campos existentes no registro de `servicos`.
- Imprimir em nova janela, em A4, com cabeçalho PMPA/DITEL, período pesquisado e tabela multipágina.

## Abordagem escolhida

Foi escolhida uma função independente `handlePrintEquipamentos` dentro de `RelatoriosSection.tsx`. Ela será acionada somente para `Rel_Equipamentos` com resultados e não compartilhará o fluxo interno de `handlePrint`, preservando Missões. O HTML da tabela será montado a partir de `results`, com células vazias representadas por `—` e estilos de impressão com repetição do cabeçalho e prevenção de quebra dentro das linhas.

## Validação

Testar botão condicionado, período inicial/final, campos disponíveis, ausência de dados inventados, múltiplos registros e preservação do botão/fluxo de Missões. Executar testes, lint, build e `git diff --check`.
