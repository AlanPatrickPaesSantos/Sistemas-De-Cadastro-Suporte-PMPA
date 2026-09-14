# AGENTS.md — Sistemas-De-Cadastro-Suporte-PMPA

## Fonte de verdade para esta feature

Antes de modificar código para Cadastro em Lote, leia nesta ordem:

1. `docs/superpowers/specs/2026-09-14-cadastro-em-lote-design.md`
2. `docs/superpowers/plans/2026-09-14-cadastro-em-lote.md`

A especificação é a autoridade funcional. O plano é o roteiro de execução. Se houver conflito entre ambos, preserve a especificação e registre a decisão.

## Regras de negócio que não podem ser reinterpretadas

- Cadastro em Lote é adicional; o cadastro individual atual deve continuar funcionando.
- Cada equipamento do lote vira um documento independente em `servicos`.
- Cada equipamento recebe sua própria O.S. (`Id_cod`) única.
- Nunca criar uma O.S. compartilhada por vários equipamentos.
- Dados gerais obrigatórios: Data, Unidade, Técnico, Tipo de atendimento, Tipo de equipamento e Análise Técnica.
- Cada equipamento herda uma cópia de todos os dados gerais selecionados no momento em que é adicionado.
- Por equipamento, RP e Patrimônio são obrigatórios.
- Tipo do equipamento e Análise Técnica podem ser alterados individualmente.
- Patrimônio continua sendo persistido no campo atual `Nº_Serie`/`nSerie`; não criar um novo campo de negócio.
- `MANUTENCAO` persiste como `Serviço = "PENDENTE"`.
- `LAUDO` persiste como `Serviço = "LAUDO"`.
- RP ou Patrimônio repetido no próprio lote bloqueia o lote inteiro.
- RP ou Patrimônio já existente no banco bloqueia o lote inteiro.
- Cadastro em Lote nunca sobrescreve, mescla ou atualiza automaticamente um registro existente.
- Gravação do lote é atômica: todos os itens ou nenhum.
- Rascunho local não gera O.S. e só é removido depois de sucesso ou descarte confirmado.
- Não impor uma nova unicidade global de RP/Patrimônio ao cadastro individual para implementar esta feature.

## Segurança de alteração

- Trabalhe fora de `main`.
- Antes de editar: `git status --short`, `git branch --show-current`, `git log -1 --oneline`.
- Não use `git add .`.
- Adicione somente os arquivos intencionais de cada tarefa.
- Não apagar, sobrescrever ou versionar scripts auxiliares não rastreados do usuário.
- Não fazer migração destrutiva de MongoDB.
- Não alterar dados históricos.
- Não fazer merge na `main` sem autorização explícita.
- Não publicar/deployar automaticamente.
- Se uma mudança arquitetural fora do plano parecer necessária, pare antes da mudança e explique o motivo.

## Verificações mínimas

Frontend:
- `npm test`
- `npm run lint`
- `npm run build`

Backend:
- `npm test`
- `node --check server.js`
- `node --check services/servicoLoteService.js`

Raiz:
- `git diff --check`
- `git status --short`
- revisar `git diff --stat` e o diff completo antes do PR.

## Forma de execução

Execute o plano tarefa por tarefa. Faça commits pequenos conforme o plano e valide antes de avançar. Quando subagentes estiverem disponíveis no Codex, prefira execução com revisão por tarefa. Não pule os critérios de aceite finais.
