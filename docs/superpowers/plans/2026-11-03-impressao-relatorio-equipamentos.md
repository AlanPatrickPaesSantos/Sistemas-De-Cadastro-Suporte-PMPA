# Impressão do Relatório de Equipamentos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adicionar impressão A4 do relatório de Equipamentos usando os resultados efetivamente retornados pela pesquisa.

**Architecture:** Manter `handlePrint` de Missões intacto e criar `handlePrintEquipamentos` em `RelatoriosSection.tsx`. A nova função abre uma janela, monta uma tabela a partir de `results` e dispara `window.print()` após carregar o documento.

**Tech Stack:** React, TypeScript, Vitest, Vite, Tailwind/CSS inline de impressão.

**Spec:** `docs/superpowers/specs/2026-11-03-impressao-relatorio-equipamentos-design.md`

## Global Constraints

- Não recriar os campos de data.
- Não alterar a lógica de pesquisa existente.
- Não modificar a impressão de Missões.
- Não inventar valores ausentes.
- Não fazer commit, push, merge ou deploy.

## Review Focus

- O botão não aparece sem resultados ou no relatório de Missões — teste de renderização condicional.
- Datas são exibidas exatamente como selecionadas — teste do cabeçalho do documento.
- Campos ausentes não produzem texto fictício — teste da tabela com registro parcial.
- Muitos registros mantêm cabeçalho e linhas imprimíveis — teste das regras CSS geradas.
- A janela de impressão usa os registros pesquisados, não estatísticas agregadas — teste com dois registros distintos.

### Task 1: Teste da impressão de Equipamentos

**Files:**
- Create: `frontend/src/components/RelatoriosSection.test.tsx`

- [ ] Escrever testes para a função/HTML de impressão cobrindo período, registros, campos ausentes, tabela multipágina e condicionamento do botão.
- [ ] Executar o teste direcionado e confirmar falha pela ausência da nova função/comportamento.

### Task 2: Implementação da impressão independente

**Files:**
- Modify: `frontend/src/components/RelatoriosSection.tsx`

- [ ] Criar `handlePrintEquipamentos` usando `results` e `filters`.
- [ ] Adicionar botão condicionado a `activeReport === "Rel_Equipamentos" && results.length > 0`.
- [ ] Montar cabeçalho PMPA/DITEL, período e tabela A4 com campos disponíveis e regras de quebra de página.
- [ ] Executar os testes direcionados e confirmar aprovação.

### Task 3: Verificação final

**Files:**
- No additional production files.

- [ ] Executar `npm test`, `npm run lint` e `npm run build` no frontend.
- [ ] Executar `npm test`, `node --check server.js` e `node --check services/servicoLoteService.js` no backend.
- [ ] Executar `git diff --check`, revisar diff completo e confirmar apenas arquivos intencionais alterados.
