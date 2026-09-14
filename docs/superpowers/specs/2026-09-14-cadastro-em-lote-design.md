# Design — Cadastro em Lote de Equipamentos

**Projeto:** Sistemas-De-Cadastro-Suporte-PMPA  
**Data:** 2026-09-14  
**Status:** Aprovado funcionalmente pelo usuário

## 1. Objetivo

Criar um modo de **Cadastro em Lote** dentro do módulo de Equipamentos para acelerar o trabalho em missões externas, especialmente pelo celular, sem alterar o comportamento do cadastro individual existente.

O novo fluxo deve permitir cadastrar vários equipamentos em uma única operação, reaproveitando dados comuns e mantendo a regra estrutural do sistema:

> **1 equipamento = 1 registro independente = 1 O.S. própria.**

O modo em lote não agrupa vários equipamentos em uma única O.S. e não substitui o cadastro individual atual.

## 2. Regras funcionais aprovadas

### 2.1 Dados gerais do lote

O usuário informa os dados gerais antes de adicionar os equipamentos:

- Data de entrada — obrigatória.
- Unidade — obrigatória.
- Técnico — obrigatório.
- Tipo de atendimento — obrigatório, com as opções **Manutenção** e **Laudo**.
- Tipo de equipamento padrão — obrigatório.
- Análise Técnica padrão — obrigatória tanto para Manutenção quanto para Laudo.

O campo de Análise Técnica deve reutilizar o mecanismo atual de **Sugestões**, com as categorias já existentes.

### 2.2 Dados de cada equipamento

Cada equipamento do lote possui obrigatoriamente:

- RP.
- Patrimônio.

O **Patrimônio** continuará sendo armazenado no campo existente `Nº_Serie`/`nSerie`; não será criado um novo campo no banco nesta funcionalidade.

Ao adicionar um equipamento, ele herda todos os dados gerais já selecionados. O tipo do equipamento e a análise técnica podem ser alterados individualmente quando necessário.

### 2.3 O.S. individual

Cada item salvo deve gerar sua própria O.S. (`Id_cod`) única.

Exemplo para um lote de 3 equipamentos:

- Equipamento 1 → O.S. 2501
- Equipamento 2 → O.S. 2502
- Equipamento 3 → O.S. 2503

O lote é apenas a interface e a operação de gravação conjunta. Os documentos persistidos continuam independentes na coleção `servicos`.

### 2.4 Cadastro individual preservado

O fluxo atual de **Novo Cadastro** permanece disponível e com o mesmo comportamento.

Na tela de Equipamentos haverá uma segunda opção, por exemplo **Cadastro em lote**, direcionada ao novo fluxo.

### 2.5 Mapeamento do tipo de atendimento

No Cadastro em Lote, o seletor geral usa os rótulos de negócio **Manutenção** e **Laudo**, mas persiste no campo atual `Serviço` usando os valores já reconhecidos pelo sistema:

- `MANUTENCAO` → `PENDENTE`
- `LAUDO` → `LAUDO`

Essa regra vale para os registros criados pelo Cadastro em Lote.


## 3. Experiência no celular

A interface deve ser mobile-first, pois o caso de uso principal ocorre durante missões externas.

### 3.1 Estrutura da tela

No topo:

```text
DADOS GERAIS

Tipo de atendimento
( ) Manutenção
( ) Laudo

Data
Unidade
Técnico
Tipo de equipamento padrão

Análise Técnica padrão
[ ✨ Sugestões ]
```

Abaixo, cada equipamento aparece em um card vertical e compacto:

```text
EQUIPAMENTO 03

Tipo: Computador
RP: 18452
Patrimônio: 009876

Análise Técnica
✓ Herdada dos dados gerais

[ Editar análise ] [ Remover ]
```

O fluxo comum deve exigir, por equipamento, apenas a digitação de **RP + Patrimônio**, já que os demais dados foram herdados.

### 3.2 Ações por item

Cada card deve permitir:

- Editar os dados individuais.
- Alterar o tipo do equipamento, quando necessário.
- Alterar a análise técnica, quando necessário.
- Remover o item do lote.
- Duplicar um item como atalho opcional, sempre exigindo novo RP e novo Patrimônio antes de salvar.

### 3.3 Adicionar equipamento

O botão **+ Adicionar equipamento** cria um novo card já preenchido com uma cópia dos dados gerais selecionados naquele momento.

A herança deve ser explícita no estado do item para que cada registro final seja autocontido antes do envio ao backend.

## 4. Revisão antes do envio

Antes da gravação, o usuário deve visualizar um resumo do lote, por exemplo:

```text
REVISAR LOTE

15 equipamentos
Unidade: 15º BPM
Técnico: ALAN
Atendimento: LAUDO

✓ Dados gerais válidos
✓ Equipamentos completos
✓ Nenhum RP repetido no lote
✓ Nenhum patrimônio repetido no lote

[ VOLTAR E EDITAR ]
[ CADASTRAR 15 EQUIPAMENTOS ]
```

Se houver erro, o sistema deve apontar exatamente qual card precisa ser corrigido e não deve iniciar nenhuma gravação.

## 5. Prevenção de duplicidades e sobrescrita

O Cadastro em Lote **nunca atualiza nem sobrescreve** registros existentes.

Antes de gravar, o sistema deve validar:

1. RP duplicado dentro do próprio lote.
2. Patrimônio duplicado dentro do próprio lote.
3. RP já existente na coleção `servicos`.
4. Patrimônio (`Nº_Serie`) já existente na coleção `servicos`.

A regra aprovada é:

> **RP existente OU Patrimônio existente = bloquear o lote inteiro.**

Em caso de conflito, nenhum registro é criado.

A resposta de erro deve identificar o equipamento e, quando possível, a O.S. existente relacionada ao conflito.

Exemplo:

```text
Não foi possível salvar o lote.

Equipamento 4
RP: 18452
Patrimônio: 009876

Conflito:
RP já cadastrado na O.S. 2314.
```

Não haverá ação automática de “substituir”, “mesclar” ou “atualizar existente”. Alterações em registros já cadastrados continuam sendo realizadas pelo fluxo normal de edição.

## 6. API de cadastro em lote

Criar uma rota dedicada, por exemplo:

```text
POST /api/servicos/lote
```

A requisição deve transportar os equipamentos já resolvidos com os dados que serão persistidos, permitindo que o backend valide o lote como unidade antes de escrever.

Uma representação conceitual:

```json
{
  "equipamentos": [
    {
      "dataEnt": "2026-09-14",
      "unidade": "15º BPM",
      "tecnico": "ALAN SANTOS",
      "servico": "LAUDO",
      "tEquipSuporte": "COMPUTADOR",
      "analiseTecnica": "...",
      "rp": "12345",
      "nSerie": "PATRIMONIO-001"
    },
    {
      "dataEnt": "2026-09-14",
      "unidade": "15º BPM",
      "tecnico": "ALAN SANTOS",
      "servico": "LAUDO",
      "tEquipSuporte": "IMPRESSORA",
      "analiseTecnica": "Análise específica deste equipamento.",
      "rp": "12346",
      "nSerie": "PATRIMONIO-002"
    }
  ]
}
```

O backend não deve confiar apenas na validação do frontend. Todas as regras obrigatórias e de duplicidade devem ser repetidas no servidor.

## 7. Atomicidade: todos ou nenhum

A operação de lote deve ser atômica.

Regra aprovada:

> **Se 15 equipamentos forem enviados, ou os 15 são gravados, ou 0 são gravados.**

A implementação deve utilizar uma transação MongoDB no Atlas para garantir rollback integral em caso de falha.

Fluxo esperado no backend:

1. Validar formato e campos obrigatórios.
2. Normalizar RP e Patrimônio para comparação segura.
3. Detectar duplicidades dentro do lote.
4. Consultar conflitos no banco.
5. Determinar as O.S. candidatas.
6. Criar todos os documentos na mesma transação.
7. Confirmar a transação apenas se todos forem persistidos com sucesso.
8. Em qualquer erro, abortar a transação inteira.

## 8. Geração segura das O.S.

`Id_cod` continua sendo único e cada item do lote recebe um valor distinto.

Para preservar o mecanismo atual e evitar uma alteração estrutural desnecessária, o lote pode:

1. Buscar a maior O.S. atual.
2. Montar uma faixa sequencial para a quantidade do lote.
3. Tentar inserir todos os documentos na transação.
4. Se houver colisão de `Id_cod` causada por concorrência com outro cadastro, abortar a tentativa.
5. Recalcular a faixa e repetir por um número limitado de tentativas.
6. Se ainda houver conflito, retornar erro sem salvar nenhum item.

A restrição única de `Id_cod` no MongoDB permanece como a proteção final contra colisões.

A mesma requisição não deve ser executada duas vezes por toque duplo: o botão de salvar fica desabilitado enquanto o envio estiver em andamento.

## 9. Resposta de sucesso

Após o commit da transação, a API deve retornar a relação entre equipamento e O.S. criada.

Exemplo:

```json
{
  "success": true,
  "count": 3,
  "records": [
    { "os": 2501, "rp": "12345", "nSerie": "001" },
    { "os": 2502, "rp": "12346", "nSerie": "002" },
    { "os": 2503, "rp": "12347", "nSerie": "003" }
  ]
}
```

Na interface:

```text
3 equipamentos cadastrados com sucesso.

O.S. 2501 — RP 12345 — Patrimônio 001
O.S. 2502 — RP 12346 — Patrimônio 002
O.S. 2503 — RP 12347 — Patrimônio 003
```

## 10. Rascunho automático e recuperação

O lote deve ser salvo automaticamente no `localStorage` do aparelho durante o preenchimento.

O rascunho deve conter:

- Dados gerais.
- Lista de equipamentos.
- Alterações individuais.
- Estado suficiente para reconstruir o formulário.
- Data/hora da última atualização do rascunho.

O rascunho é somente local e **não cria O.S. nem grava documentos no MongoDB**.

Ao reabrir a tela e existir um rascunho não concluído:

```text
Cadastro em lote não concluído encontrado.

12 equipamentos recuperados.

[ CONTINUAR LOTE ]
[ DESCARTAR RASCUNHO ]
```

O descarte deve exigir confirmação para evitar perda acidental.

Após uma gravação bem-sucedida do lote, o rascunho deve ser apagado automaticamente.

## 11. Normalização para duplicidades

Para comparar RP e Patrimônio com segurança, a validação deve remover espaços externos e tratar diferenças irrelevantes de caixa quando aplicável.

A validação não deve alterar silenciosamente o valor original que será exibido ao usuário; a normalização serve para comparação.

Valores vazios após normalização são inválidos.

## 12. Segurança e permissões

O novo endpoint deve usar as mesmas regras de autenticação e autorização aplicáveis ao cadastro de serviços.

Usuários sem permissão para criar registros não podem utilizar o cadastro em lote.

As regras de escopo por unidade existentes no sistema não devem ser enfraquecidas pelo novo endpoint.

## 13. Compatibilidade

A funcionalidade não deve:

- Migrar registros históricos.
- Alterar o significado de `Id_cod`.
- Criar uma O.S. compartilhada entre equipamentos.
- Mudar o comportamento funcional do cadastro individual atual.
- Impor ao cadastro individual uma nova regra global de unicidade de RP/Patrimônio apenas para viabilizar o lote.
- Sobrescrever registros existentes.
- Criar um novo campo de Patrimônio nesta etapa.

O campo `Nº_Serie` continua servindo como Patrimônio no fluxo aprovado.

## 14. Arquivos e componentes esperados

A implementação provavelmente envolverá:

- `frontend/src/pages/Cadastro.tsx` — entrada para o novo modo.
- Um novo componente/página de Cadastro em Lote, mantendo o formulário atual isolado.
- Reuso de `UnidadeCombobox` e `EquipCombobox`.
- Reuso/extração das sugestões de Análise Técnica para que o cadastro normal e o lote compartilhem a mesma fonte.
- `backend/server.js` — novo endpoint transacional de lote e helpers de validação.
- Testes de validação, duplicidade, atomicidade e geração de O.S.

Evitar refatorações não relacionadas.

## 15. Cenários mínimos de teste

### Fluxo feliz

- Criar lote de 1 equipamento.
- Criar lote de vários equipamentos.
- Confirmar O.S. distinta para cada item.
- Confirmar herança dos dados gerais.
- Confirmar tipo/análise individual diferente em um item.

### Validação

- Data ausente.
- Unidade ausente.
- Técnico ausente.
- Tipo de atendimento ausente.
- Tipo de equipamento ausente.
- Análise técnica ausente.
- RP ausente.
- Patrimônio ausente.

### Duplicidade

- Dois itens com mesmo RP no lote.
- Dois itens com mesmo Patrimônio no lote.
- RP do lote já existente no banco.
- Patrimônio do lote já existente no banco.
- Confirmar que nenhum item é salvo quando qualquer conflito existe.

### Atomicidade

- Simular falha no meio da criação e confirmar rollback total.
- Simular colisão de O.S. e confirmar retry sem gravação parcial.

### Mobile / UX

- Adicionar e remover vários cards.
- Recarregar a página com rascunho e recuperar o lote.
- Descartar rascunho com confirmação.
- Salvar com conexão lenta e confirmar que o botão não permite toque duplo.
- Após sucesso, confirmar remoção do rascunho.

## 16. Critérios de aceite

A funcionalidade será considerada concluída quando:

1. O cadastro individual continuar funcionando como antes.
2. Um lote puder conter vários equipamentos.
3. Cada equipamento gerar um registro e uma O.S. próprios.
4. Todos os equipamentos herdarem os dados gerais selecionados.
5. Tipo e Análise Técnica puderem ser ajustados por equipamento.
6. Manutenção e Laudo estiverem disponíveis no nível geral.
7. A Análise Técnica for obrigatória nos dois tipos de atendimento.
8. RP e Patrimônio forem obrigatórios por equipamento.
9. RP ou Patrimônio duplicado bloquear o lote inteiro.
10. Nenhum cadastro existente for sobrescrito pelo fluxo em lote.
11. A gravação for atômica: todos ou nenhum.
12. O resultado informar claramente as O.S. geradas.
13. O lote tiver rascunho automático e recuperação no celular.
14. O rascunho for apagado somente após sucesso ou descarte explicitamente confirmado.
