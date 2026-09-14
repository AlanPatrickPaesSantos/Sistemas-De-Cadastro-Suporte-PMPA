# Cadastro em Lote de Equipamentos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um fluxo mobile-first de Cadastro em Lote que cria vários equipamentos em uma única operação atômica, mantendo um registro e uma O.S. própria para cada equipamento, sem duplicar ou sobrescrever equipamentos existentes.

**Architecture:** O frontend terá uma página/componente de lote separado do `CadastroForm` atual, com estado próprio, herança por cópia dos dados gerais, validação local, revisão e rascunho no `localStorage`. O backend terá um serviço dedicado de lote e um endpoint `POST /api/servicos/lote`, usando transação Mongoose para validação, prevenção de duplicidades, geração segura de O.S. e gravação “todos ou nenhum”. As sugestões de Análise Técnica serão extraídas para um módulo compartilhado, evitando duplicação entre cadastro individual e lote.

**Tech Stack:** React 18, TypeScript 5, Vite 5, React Hook Form/Zod onde fizer sentido, Tailwind, Express 5, Node 20, Mongoose 9, MongoDB Atlas.

**Spec:** `docs/superpowers/specs/2026-09-14-cadastro-em-lote-design.md`

## Global Constraints

- O cadastro individual atual deve continuar funcionando.
- Cada equipamento do lote deve gerar um registro próprio e uma O.S. (`Id_cod`) própria.
- O modo de atendimento geral aceita `MANUTENCAO` e `LAUDO`; `MANUTENCAO` persiste como `Serviço = "PENDENTE"` e `LAUDO` persiste como `Serviço = "LAUDO"`.
- Data, Unidade, Técnico, Tipo de atendimento, Tipo de equipamento e Análise Técnica são obrigatórios no nível geral.
- RP e Patrimônio são obrigatórios por equipamento.
- Patrimônio continua sendo persistido em `Nº_Serie`; não criar um novo campo de negócio chamado Patrimônio.
- Um equipamento novo recebe uma cópia de todos os dados gerais selecionados naquele momento.
- Tipo de equipamento e Análise Técnica podem ser alterados individualmente.
- RP ou Patrimônio repetido no lote bloqueia o lote inteiro.
- RP ou Patrimônio já existente no banco bloqueia o lote inteiro.
- O fluxo em lote nunca atualiza, mescla ou sobrescreve registro existente.
- A proteção de duplicidade desta feature é do fluxo em lote; não alterar a semântica atual do cadastro individual para impedir recorrências históricas que hoje são permitidas.
- O salvamento deve ser atômico: todos ou nenhum.
- O rascunho é local e não gera O.S.; ele só é apagado após sucesso ou descarte explicitamente confirmado.
- O botão de salvar deve permanecer bloqueado durante o envio.
- Usuários `visualizador` não podem cadastrar, seguindo a proteção já aplicada às rotas `/api/servicos`.
- Evitar refatorações não relacionadas.

---

## Mapa de arquivos

**Criar**
- `docs/superpowers/specs/2026-09-14-cadastro-em-lote-design.md` — especificação aprovada.
- `docs/superpowers/plans/2026-09-14-cadastro-em-lote.md` — este plano.
- `frontend/src/lib/analiseSugestoes.ts` — fonte única das sugestões de Manutenção e Laudo.
- `frontend/src/lib/cadastroLote.ts` — tipos, normalização, validação, herança e persistência do rascunho.
- `frontend/src/lib/cadastroLote.test.ts` — testes puros do fluxo de lote.
- `frontend/src/components/AnaliseSugestoesMenu.tsx` — menu reutilizável de sugestões.
- `frontend/src/components/CadastroLoteEquipamentoCard.tsx` — card mobile de um equipamento.
- `frontend/src/components/CadastroLoteForm.tsx` — formulário de dados gerais, lista, revisão e envio.
- `frontend/src/pages/CadastroLote.tsx` — página/contêiner do novo fluxo.
- `backend/services/servicoLoteService.js` — validação, mapeamento, duplicidade e criação transacional.
- `backend/tests/servicoLoteService.test.js` — testes com `node:test`.

**Modificar**
- `frontend/package.json` — adicionar script/test runner Vitest.
- `frontend/src/components/CadastroForm.tsx` — consumir sugestões compartilhadas sem mudar o comportamento.
- `frontend/src/pages/Cadastro.tsx` — adicionar entrada “Cadastro em lote”.
- `frontend/src/App.tsx` — rota protegida `/cadastro/lote`.
- `backend/package.json` — trocar o script de teste para `node --test`.
- `backend/models/Servico.js` — manter `Id_cod` único e adicionar chaves internas opcionais de deduplicação para novos registros.
- `backend/server.js` — registrar o novo endpoint e usar o serviço de lote.

---

### Task 1: Registrar especificação e preparar infraestrutura mínima de testes

**Files:**
- Create: `docs/superpowers/specs/2026-09-14-cadastro-em-lote-design.md`
- Create: `docs/superpowers/plans/2026-09-14-cadastro-em-lote.md`
- Modify: `frontend/package.json`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: especificação aprovada pelo usuário.
- Produces: `npm test` funcional em `frontend/` e `backend/`.

- [ ] **Step 1: Criar a branch de trabalho a partir da `main` atual**

```bash
git switch main
git pull origin main
git switch -c feat/cadastro-em-lote
```

- [ ] **Step 2: Colocar os dois artefatos baixados na raiz do repositório e movê-los para `docs/`**

Depois de enviar para a raiz do Codespaces os arquivos com estes nomes exatos:

- `2026-09-14-cadastro-em-lote-design.md`
- `2026-09-14-cadastro-em-lote.md`

execute:

```bash
mkdir -p docs/superpowers/specs docs/superpowers/plans
mv ./2026-09-14-cadastro-em-lote-design.md   docs/superpowers/specs/2026-09-14-cadastro-em-lote-design.md
mv ./2026-09-14-cadastro-em-lote.md   docs/superpowers/plans/2026-09-14-cadastro-em-lote.md
```

- [ ] **Step 3: Adicionar Vitest ao frontend e o script de teste**

Em `frontend/package.json`, adicionar a `devDependency`:

```json
"vitest": "^3.2.4"
```

e em `scripts`:

```json
"test": "vitest run"
```

Depois:

```bash
cd frontend
npm install
cd ..
```

- [ ] **Step 4: Habilitar o test runner nativo do Node no backend**

Em `backend/package.json`, substituir:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

por:

```json
"test": "node --test"
```

Node 20 já está fixado no `Dockerfile`, portanto não é necessário adicionar framework de teste no backend.

- [ ] **Step 5: Verificar a infraestrutura antes de criar testes**

```bash
cd frontend
npm test -- --passWithNoTests
cd ../backend
npm test
cd ..
```

Resultado esperado: nenhum erro de configuração. O backend pode informar zero testes neste ponto.

- [ ] **Step 6: Commit da documentação e infraestrutura de testes**

```bash
git add \
  docs/superpowers/specs/2026-09-14-cadastro-em-lote-design.md \
  docs/superpowers/plans/2026-09-14-cadastro-em-lote.md \
  frontend/package.json \
  frontend/package-lock.json \
  backend/package.json

git commit -m "docs: define cadastro em lote"
```

---

### Task 2: Extrair sugestões de Análise Técnica para uso compartilhado

**Files:**
- Create: `frontend/src/lib/analiseSugestoes.ts`
- Create: `frontend/src/components/AnaliseSugestoesMenu.tsx`
- Modify: `frontend/src/components/CadastroForm.tsx`

**Interfaces:**
- Produces:
  - `ANALISE_SUGESTOES_MANUTENCAO`
  - `ANALISE_SUGESTOES_LAUDO`
  - `appendAnaliseSuggestion(current: string, suggestion: string): { value: string; duplicate: boolean }`
  - `<AnaliseSugestoesMenu onSelect={(text) => void} />`
- Consumes: os textos atuais já existentes em `CadastroForm.tsx`.

- [ ] **Step 1: Criar teste para preservar comportamento de concatenação e bloqueio de duplicata**

Criar `frontend/src/lib/cadastroLote.test.ts` inicialmente com:

```ts
import { describe, expect, it } from "vitest";
import { appendAnaliseSuggestion } from "./analiseSugestoes";

describe("appendAnaliseSuggestion", () => {
  it("adiciona uma sugestão a uma análise vazia", () => {
    expect(appendAnaliseSuggestion("", "Texto A")).toEqual({
      value: "Texto A",
      duplicate: false,
    });
  });

  it("concatena com pontuação sem duplicar texto", () => {
    expect(appendAnaliseSuggestion("Texto existente", "Texto B")).toEqual({
      value: "Texto existente. Texto B",
      duplicate: false,
    });
  });

  it("detecta sugestão já existente ignorando caixa", () => {
    expect(
      appendAnaliseSuggestion("Após análise técnica, defeito confirmado.", "APÓS ANÁLISE TÉCNICA, DEFEITO CONFIRMADO.")
    ).toEqual({
      value: "Após análise técnica, defeito confirmado.",
      duplicate: true,
    });
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

```bash
cd frontend
npm test -- src/lib/cadastroLote.test.ts
```

Esperado: FAIL porque `analiseSugestoes.ts` ainda não existe.

- [ ] **Step 3: Criar `frontend/src/lib/analiseSugestoes.ts`**

Mover, sem alterar textos, os arrays atuais de Manutenção e Laudo para o novo módulo e implementar:

```ts
export const appendAnaliseSuggestion = (current: string, suggestion: string) => {
  const normalizedCurrent = current.trim();
  const duplicate =
    normalizedCurrent.length > 0 &&
    normalizedCurrent.toLocaleLowerCase("pt-BR").includes(
      suggestion.toLocaleLowerCase("pt-BR")
    );

  if (duplicate) {
    return { value: current, duplicate: true };
  }

  const separator =
    normalizedCurrent && !/[.!?]$/.test(normalizedCurrent)
      ? ". "
      : normalizedCurrent
        ? " "
        : "";

  return {
    value: normalizedCurrent
      ? `${normalizedCurrent}${separator}${suggestion}`
      : suggestion,
    duplicate: false,
  };
};
```

- [ ] **Step 4: Criar `AnaliseSugestoesMenu.tsx`**

O componente deve renderizar as duas categorias atuais e expor somente:

```ts
interface AnaliseSugestoesMenuProps {
  onSelect: (text: string) => void;
}
```

Ele reutiliza `DropdownMenu`, `Sparkles`, os dois arrays compartilhados e não conhece React Hook Form.

- [ ] **Step 5: Alterar `CadastroForm.tsx` para usar o módulo compartilhado**

Remover os arrays locais e substituir a lógica atual de `addAnaliseSuggestion` por:

```ts
const addAnaliseSuggestion = (suggestion: string) => {
  const current = form.getValues("analiseTecnica") || "";
  const result = appendAnaliseSuggestion(current, suggestion);

  if (result.duplicate) {
    toast.info("Essa sugestão já foi adicionada.");
    return;
  }

  form.setValue("analiseTecnica", result.value, {
    shouldDirty: true,
    shouldTouch: true,
  });
};
```

Trocar o menu inline por:

```tsx
<AnaliseSugestoesMenu onSelect={addAnaliseSuggestion} />
```

- [ ] **Step 6: Rodar testes e build**

```bash
cd frontend
npm test -- src/lib/cadastroLote.test.ts
npm run build
cd ..
```

Esperado: testes PASS e build `✓ built`.

- [ ] **Step 7: Commit**

```bash
git add \
  frontend/src/lib/analiseSugestoes.ts \
  frontend/src/lib/cadastroLote.test.ts \
  frontend/src/components/AnaliseSugestoesMenu.tsx \
  frontend/src/components/CadastroForm.tsx

git commit -m "refactor: compartilha sugestões de análise"
```

---

### Task 3: Definir o modelo de estado, herança, validação e rascunho do frontend

**Files:**
- Create/Modify: `frontend/src/lib/cadastroLote.ts`
- Modify: `frontend/src/lib/cadastroLote.test.ts`

**Interfaces:**
- Produces:
  - `TipoAtendimento = "MANUTENCAO" | "LAUDO"`
  - `CadastroLoteGerais`
  - `CadastroLoteEquipamento`
  - `CadastroLoteDraft`
  - `createEquipamentoFromGerais(gerais, id)`
  - `validateCadastroLote(gerais, equipamentos)`
  - `saveCadastroLoteDraft(draft)`
  - `loadCadastroLoteDraft()`
  - `clearCadastroLoteDraft()`
  - `CADASTRO_LOTE_DRAFT_KEY = "ditel_draft_cadastro_lote_v1"`

Usar estes tipos:

```ts
export type TipoAtendimento = "MANUTENCAO" | "LAUDO";

export interface CadastroLoteGerais {
  dataEnt: string;
  unidade: string;
  tecnico: string;
  tipoAtendimento: TipoAtendimento | "";
  tEquipSuporte: string;
  analiseTecnica: string;
}

export interface CadastroLoteEquipamento {
  localId: string;
  dataEnt: string;
  unidade: string;
  tecnico: string;
  tipoAtendimento: TipoAtendimento | "";
  tEquipSuporte: string;
  analiseTecnica: string;
  rp: string;
  nSerie: string;
}

export interface CadastroLoteDraft {
  version: 1;
  updatedAt: string;
  gerais: CadastroLoteGerais;
  equipamentos: CadastroLoteEquipamento[];
}
```

- [ ] **Step 1: Adicionar testes de herança**

```ts
import {
  createEquipamentoFromGerais,
  validateCadastroLote,
} from "./cadastroLote";

it("copia todos os dados gerais para um equipamento novo", () => {
  const gerais = {
    dataEnt: "2026-09-14",
    unidade: "DITEL",
    tecnico: "ALAN",
    tipoAtendimento: "LAUDO" as const,
    tEquipSuporte: "COMPUTADOR",
    analiseTecnica: "Sem viabilidade de reparo.",
  };

  expect(createEquipamentoFromGerais(gerais, "eq-1")).toEqual({
    localId: "eq-1",
    ...gerais,
    rp: "",
    nSerie: "",
  });
});

it("cria uma cópia independente dos dados gerais", () => {
  const gerais = {
    dataEnt: "2026-09-14",
    unidade: "DITEL",
    tecnico: "ALAN",
    tipoAtendimento: "LAUDO" as const,
    tEquipSuporte: "COMPUTADOR",
    analiseTecnica: "Análise A",
  };

  const item = createEquipamentoFromGerais(gerais, "eq-1");
  gerais.tEquipSuporte = "IMPRESSORA";

  expect(item.tEquipSuporte).toBe("COMPUTADOR");
});
```

- [ ] **Step 2: Adicionar testes de campos obrigatórios e duplicidade interna**

```ts
it("bloqueia RP duplicado ignorando espaços e caixa", () => {
  const result = validateCadastroLote(
    {
      dataEnt: "2026-09-14",
      unidade: "DITEL",
      tecnico: "ALAN",
      tipoAtendimento: "MANUTENCAO",
      tEquipSuporte: "COMPUTADOR",
      analiseTecnica: "Análise",
    },
    [
      {
        localId: "a",
        dataEnt: "2026-09-14",
        unidade: "DITEL",
        tecnico: "ALAN",
        tipoAtendimento: "MANUTENCAO",
        tEquipSuporte: "COMPUTADOR",
        analiseTecnica: "Análise",
        rp: " RP-10 ",
        nSerie: "PAT-1",
      },
      {
        localId: "b",
        dataEnt: "2026-09-14",
        unidade: "DITEL",
        tecnico: "ALAN",
        tipoAtendimento: "MANUTENCAO",
        tEquipSuporte: "COMPUTADOR",
        analiseTecnica: "Análise",
        rp: "rp-10",
        nSerie: "PAT-2",
      },
    ]
  );

  expect(result.valid).toBe(false);
  expect(result.itemErrors.b).toContain("RP repetido no lote");
});
```

Adicionar teste equivalente para `nSerie`, além de testes para Data, Unidade, Técnico, Tipo de atendimento, Tipo de equipamento, Análise Técnica, RP e Patrimônio vazios.

- [ ] **Step 3: Rodar testes e confirmar falha**

```bash
cd frontend
npm test -- src/lib/cadastroLote.test.ts
```

Esperado: FAIL porque as funções ainda não existem.

- [ ] **Step 4: Implementar `cadastroLote.ts`**

Normalização:

```ts
export const normalizeLoteIdentifier = (value: string) =>
  value.trim().toLocaleUpperCase("pt-BR");
```

Validação deve retornar:

```ts
export interface CadastroLoteValidation {
  valid: boolean;
  generalErrors: string[];
  itemErrors: Record<string, string[]>;
}
```

Regras exatas:
- `gerais.dataEnt.trim()` obrigatório.
- `gerais.unidade.trim()` obrigatório.
- `gerais.tecnico.trim()` obrigatório.
- `tipoAtendimento` deve ser `MANUTENCAO` ou `LAUDO`.
- `gerais.tEquipSuporte.trim()` obrigatório.
- `gerais.analiseTecnica.trim()` obrigatório.
- Pelo menos 1 equipamento.
- Para cada item: `rp`, `nSerie`, `dataEnt`, `unidade`, `tecnico`, `tipoAtendimento`, `tEquipSuporte`, `analiseTecnica` obrigatórios.
- RP e `nSerie` repetidos após normalização marcam todos os cards envolvidos.

Rascunho:

```ts
export const CADASTRO_LOTE_DRAFT_KEY = "ditel_draft_cadastro_lote_v1";

export const saveCadastroLoteDraft = (draft: CadastroLoteDraft) => {
  localStorage.setItem(CADASTRO_LOTE_DRAFT_KEY, JSON.stringify(draft));
};

export const clearCadastroLoteDraft = () => {
  localStorage.removeItem(CADASTRO_LOTE_DRAFT_KEY);
};
```

`loadCadastroLoteDraft()` deve aceitar apenas `version === 1`, exigir `gerais` e array `equipamentos`, e retornar `null` em JSON inválido.

- [ ] **Step 5: Rodar testes**

```bash
cd frontend
npm test -- src/lib/cadastroLote.test.ts
cd ..
```

Esperado: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/cadastroLote.ts frontend/src/lib/cadastroLote.test.ts
git commit -m "feat: adiciona regras do cadastro em lote"
```

---

### Task 4: Criar serviço backend para validação, deduplicação e mapeamento

**Files:**
- Create: `backend/services/servicoLoteService.js`
- Create: `backend/tests/servicoLoteService.test.js`
- Modify: `backend/models/Servico.js`

**Interfaces:**
- Produces:
  - `normalizeIdentifier(value)`
  - `mapTipoAtendimento(tipo)`
  - `validateBatchPayload(equipamentos)`
  - `buildServicoDocument(item, idCod, finalUnidade)`
  - `findExistingConflicts(Servico, equipamentos, session)`
  - `createServicoBatch({ Servico, mongoose, user, equipamentos })`

Para mapear erros de índice único concorrente, o serviço também deve produzir:

```js
mapDuplicateKeyErrorToConflicts(error, equipamentos)
```

Essa função lê `error.keyPattern`/`error.keyValue`, encontra o item correspondente pelo identificador normalizado e devolve o mesmo formato de conflito usado pela validação prévia.

Mapeamento obrigatório:

```js
const mapTipoAtendimento = (tipo) => {
  if (tipo === 'MANUTENCAO') return 'PENDENTE';
  if (tipo === 'LAUDO') return 'LAUDO';
  return null;
};
```

- [ ] **Step 1: Escrever testes puros de normalização, atendimento e validação**

Criar `backend/tests/servicoLoteService.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeIdentifier,
  mapTipoAtendimento,
  validateBatchPayload,
  buildServicoDocument,
} = require('../services/servicoLoteService');

test('normaliza identificadores para comparação', () => {
  assert.equal(normalizeIdentifier('  rp-10  '), 'RP-10');
});

test('mapeia manutenção para PENDENTE e laudo para LAUDO', () => {
  assert.equal(mapTipoAtendimento('MANUTENCAO'), 'PENDENTE');
  assert.equal(mapTipoAtendimento('LAUDO'), 'LAUDO');
  assert.equal(mapTipoAtendimento('OUTRO'), null);
});

test('rejeita RP repetido no próprio lote', () => {
  const result = validateBatchPayload([
    {
      dataEnt: '2026-09-14',
      unidade: 'DITEL',
      tecnico: 'ALAN',
      tipoAtendimento: 'LAUDO',
      tEquipSuporte: 'COMPUTADOR',
      analiseTecnica: 'Análise',
      rp: 'RP-1',
      nSerie: 'PAT-1',
    },
    {
      dataEnt: '2026-09-14',
      unidade: 'DITEL',
      tecnico: 'ALAN',
      tipoAtendimento: 'LAUDO',
      tEquipSuporte: 'COMPUTADOR',
      analiseTecnica: 'Análise',
      rp: ' rp-1 ',
      nSerie: 'PAT-2',
    },
  ]);

  assert.equal(result.valid, false);
  assert.equal(result.conflicts[0].field, 'rp');
});
```

Adicionar teste equivalente para Patrimônio e para cada campo obrigatório.

- [ ] **Step 2: Rodar e confirmar falha**

```bash
cd backend
npm test
```

Esperado: FAIL porque o serviço ainda não existe.

- [ ] **Step 3: Implementar validação e construção de documento**

`buildServicoDocument` deve criar exatamente os campos esperados pelo modelo atual:

```js
const buildServicoDocument = (item, idCod, finalUnidade) => ({
  Id_cod: idCod,
  Data_Ent: new Date(item.dataEnt),
  Tecnico: item.tecnico.trim(),
  T_EquipSuporte: item.tEquipSuporte.trim(),
  Solicitante: '',
  Unidade: finalUnidade,
  'Nº_PAE': '',
  RP: item.rp.trim(),
  'Nº_Serie': item.nSerie.trim(),
  Defeito_Recl: '',
  Analise_Tecnica: item.analiseTecnica.trim(),
  'Serviço': mapTipoAtendimento(item.tipoAtendimento),
  Garantia: '',
  Laudo_Tecnico: '',
  Data_Envio: null,
  Data_Retorno: null,
  Data_Saida: null,
  saidaEquip: '',
  Bateria: '',
  telefone: '',
  Seção_Ditel: 'SUPORTE',
  fonteCabo: false,
  RP_Key: normalizeIdentifier(item.rp),
  Patrimonio_Key: normalizeIdentifier(item.nSerie),
});
```

Os campos `RP_Key` e `Patrimonio_Key` são **internos**, servem somente para impedir corridas de concorrência entre novos cadastros e não substituem `RP` ou `Nº_Serie`.

- [ ] **Step 4: Adicionar chaves internas opcionais ao schema**

Em `backend/models/Servico.js`:

```js
RP_Key: { type: String, unique: true, sparse: true, select: false },
Patrimonio_Key: { type: String, unique: true, sparse: true, select: false },
```

Não preencher essas chaves em migração dos registros históricos. O endpoint de lote fará consulta aos campos históricos `RP` e `Nº_Serie` antes de inserir; as chaves garantem apenas que duas novas gravações concorrentes não criem o mesmo identificador.

- [ ] **Step 5: Implementar `findExistingConflicts`**

Para cada lote, montar os identificadores normalizados e consultar registros históricos com comparação exata, ignorando espaços externos e caixa. Retornar objetos:

```js
{
  index: 2,
  field: 'rp',
  value: 'RP-10',
  existingOs: 2314
}
```

e/ou:

```js
{
  index: 4,
  field: 'nSerie',
  value: 'PAT-99',
  existingOs: 2201
}
```

A função deve ser chamada dentro da sessão usada pela transação.

- [ ] **Step 6: Rodar testes**

```bash
cd backend
npm test
cd ..
```

Esperado: PASS.

- [ ] **Step 7: Commit**

```bash
git add \
  backend/services/servicoLoteService.js \
  backend/tests/servicoLoteService.test.js \
  backend/models/Servico.js

git commit -m "feat: adiciona serviço transacional de lote"
```

---

### Task 5: Implementar criação atômica e geração segura de O.S. no backend

**Files:**
- Modify: `backend/services/servicoLoteService.js`
- Modify: `backend/tests/servicoLoteService.test.js`
- Modify: `backend/server.js`

**Interfaces:**
- Consumes: `createServicoBatch({ Servico, mongoose, user, equipamentos })`.
- Produces endpoint:
  - `POST /api/servicos/lote`
  - sucesso `201`
  - validação/duplicidade `400`
  - erro de concorrência esgotada `409`
  - falha interna `500`

- [ ] **Step 1: Escrever teste para a forma da resposta de conflito**

Adicionar teste usando `findExistingConflicts` com um `Servico` fake que retorna:

```js
[
  { Id_cod: 2314, RP: 'RP-10', 'Nº_Serie': 'PAT-X' }
]
```

e verificar que um lote contendo `rp: "rp-10"` produz `existingOs: 2314`.

- [ ] **Step 2: Escrever teste de geração de documentos com O.S. distintas**

```js
test('gera documentos com ids sequenciais distintos', () => {
  const baseItem = {
    dataEnt: '2026-09-14',
    unidade: 'DITEL',
    tecnico: 'ALAN',
    tipoAtendimento: 'LAUDO',
    tEquipSuporte: 'COMPUTADOR',
    analiseTecnica: 'Análise',
    rp: 'RP-1',
    nSerie: 'PAT-1',
  };

  const first = buildServicoDocument(baseItem, 2501, 'DITEL');
  const second = buildServicoDocument(
    { ...baseItem, rp: 'RP-2', nSerie: 'PAT-2' },
    2502,
    'DITEL'
  );

  assert.equal(first.Id_cod, 2501);
  assert.equal(second.Id_cod, 2502);
  assert.notEqual(first.Id_cod, second.Id_cod);
});
```

- [ ] **Step 3: Implementar `createServicoBatch` com transação e retry**

Fluxo exato:

```js
for (let attempt = 0; attempt < 5; attempt += 1) {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const validation = validateBatchPayload(equipamentos);
      if (!validation.valid) {
        const err = new Error('LOTE_INVALIDO');
        err.statusCode = 400;
        err.details = validation;
        throw err;
      }

      const conflicts = await findExistingConflicts(
        Servico,
        equipamentos,
        session
      );

      if (conflicts.length > 0) {
        const err = new Error('LOTE_DUPLICADO');
        err.statusCode = 400;
        err.conflicts = conflicts;
        throw err;
      }

      const last = await Servico.findOne({}, 'Id_cod')
        .sort({ Id_cod: -1 })
        .session(session)
        .lean();

      const firstId = last ? last.Id_cod + 1 : 1;

      const userIsAdminOrDitel =
        user && (user.papel === 'admin' || user.unidadeVinculada === 'DITEL');

      const docs = equipamentos.map((item, index) => {
        const finalUnidade = userIsAdminOrDitel
          ? item.unidade.trim()
          : user.unidadeVinculada;

        return buildServicoDocument(item, firstId + index, finalUnidade);
      });

      const inserted = await Servico.insertMany(docs, { session });

      result = inserted.map((record) => ({
        os: record.Id_cod,
        rp: record.RP,
        nSerie: record['Nº_Serie'],
      }));
    });

    return result;
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === 'Id_cod' && attempt < 4) {
        continue;
      }

      if (duplicateField === 'RP_Key' || duplicateField === 'Patrimonio_Key') {
        const err = new Error('LOTE_DUPLICADO');
        err.statusCode = 400;
        err.conflicts = mapDuplicateKeyErrorToConflicts(error, equipamentos);
        throw err;
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }
}
```

Quando o quinto retry também colidir, lançar erro com `statusCode = 409` e mensagem de concorrência.

- [ ] **Step 4: Criar a rota antes das rotas parametrizadas de serviço**

Em `backend/server.js`, depois de `/api/servicos/next-os` e antes das rotas que usam `:id`, adicionar:

```js
app.post('/api/servicos/lote', async (req, res) => {
  try {
    const equipamentos = Array.isArray(req.body?.equipamentos)
      ? req.body.equipamentos
      : [];

    const records = await createServicoBatch({
      Servico,
      mongoose,
      user: req.user,
      equipamentos,
    });

    return res.status(201).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: err.message,
        details: err.details,
        conflicts: err.conflicts || [],
      });
    }

    if (err.statusCode === 409) {
      return res.status(409).json({
        success: false,
        error: 'Não foi possível reservar O.S. únicas para o lote. Tente novamente.',
      });
    }

    return sendServerError(res, err, 'Erro ao criar lote de serviços.');
  }
});
```

Importar no topo:

```js
const { createServicoBatch } = require('./services/servicoLoteService');
```

A rota já herdará `verificarToken` e `bloquearVisualizador` porque o servidor aplica esses middlewares globalmente em `/api/servicos`.

- [ ] **Step 5: Preservar explicitamente o comportamento do cadastro individual**

Não adicionar validação global nova de duplicidade ao `POST /api/servicos` ou ao `PUT /api/servicos/:id`.

Não preencher `RP_Key`/`Patrimonio_Key` no fluxo individual. Essas chaves internas são exclusivas dos documentos criados pelo Cadastro em Lote e servem para impedir colisões entre gravações concorrentes do próprio fluxo em lote.

A rota individual existente deve continuar aceitando o mesmo conjunto de casos que aceita hoje, inclusive o mecanismo atual de histórico por RP/Patrimônio.

Adicionar ao teste/revisão uma regressão que confirme que a implementação do lote não alterou a lógica de criação e edição individual.

- [ ] **Step 6: Rodar testes backend**

```bash
cd backend
npm test
cd ..
```

Esperado: PASS.

- [ ] **Step 7: Verificar sintaxe do servidor**

```bash
node --check backend/server.js
node --check backend/services/servicoLoteService.js
```

Esperado: sem saída de erro.

- [ ] **Step 8: Commit**

```bash
git add \
  backend/server.js \
  backend/services/servicoLoteService.js \
  backend/tests/servicoLoteService.test.js

git commit -m "feat: cria endpoint atomico de cadastro em lote"
```

---

### Task 6: Construir os cards mobile e o formulário de lote

**Files:**
- Create: `frontend/src/components/CadastroLoteEquipamentoCard.tsx`
- Create: `frontend/src/components/CadastroLoteForm.tsx`

**Interfaces:**
- `CadastroLoteEquipamentoCard`:
  - `item: CadastroLoteEquipamento`
  - `index: number`
  - `errors: string[]`
  - `onChange(next: CadastroLoteEquipamento): void`
  - `onRemove(): void`
  - `onDuplicate(): void`
- `CadastroLoteForm`:
  - controla os dados gerais e a lista.
  - `onSuccess(records: CadastroLoteResultRecord[]): void`

- [ ] **Step 1: Criar o card de equipamento**

Layout mobile obrigatório:
- Título `Equipamento N`.
- `RP` e `Patrimônio` com `Input` de altura mínima 44px.
- Resumo do Tipo de equipamento.
- Resumo da Análise Técnica.
- Botão para expandir edição do Tipo e Análise.
- Reutilizar `EquipCombobox` quando o tipo for editado.
- Reutilizar `AnaliseSugestoesMenu` na análise individual.
- Botões `Duplicar` e `Remover`.
- Lista de erros do card com destaque visível.

Ao duplicar:
- copiar os dados herdados/individuais;
- gerar novo `localId`;
- limpar `rp`;
- limpar `nSerie`.

- [ ] **Step 2: Criar seção de dados gerais em `CadastroLoteForm`**

Campos:
- Data (`Input type="date"`).
- Unidade (`UnidadeCombobox`).
- Técnico (`Input`).
- Tipo de atendimento (`Select` com `MANUTENCAO` e `LAUDO`).
- Tipo de equipamento (`EquipCombobox`).
- Análise Técnica (`Textarea` + `AnaliseSugestoesMenu`).

Copy do seletor:

```text
MANUTENÇÃO
LAUDO
```

O estado deve usar `MANUTENCAO` sem acento internamente.

- [ ] **Step 3: Implementar `+ Adicionar equipamento`**

Antes de adicionar, validar os dados gerais. Se houver algum obrigatório vazio:
- não criar card;
- marcar os erros gerais;
- mostrar `toast.error("Preencha os dados gerais antes de adicionar equipamentos.")`.

Se válido:

```ts
setEquipamentos((current) => [
  ...current,
  createEquipamentoFromGerais(
    gerais,
    crypto.randomUUID()
  ),
]);
```

- [ ] **Step 4: Implementar revisão local antes do envio**

Ao tocar `Revisar e salvar lote`:
- executar `validateCadastroLote`.
- se inválido, manter a tela e rolar para o primeiro erro;
- se válido, abrir `Dialog`/`AlertDialog` de revisão.

A revisão deve mostrar:
- quantidade;
- Unidade;
- Técnico;
- Atendimento;
- contagem de itens válidos;
- botão `Voltar e editar`;
- botão `Cadastrar N equipamentos`.

- [ ] **Step 5: Implementar envio**

Payload:

```ts
const payload = {
  equipamentos: equipamentos.map(({ localId, ...item }) => item),
};
```

Enviar:

```ts
const response = await fetch(`${API_BASE}/servicos/lote`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("ditel_token")}`,
  },
  body: JSON.stringify(payload),
});
```

Enquanto `isSubmitting === true`:
- desabilitar o botão;
- trocar o texto por `Salvando lote...`;
- mostrar `Loader2`;
- impedir novo submit.

Em `400`, renderizar os conflitos retornados no card correspondente usando `index`.
Em `409`, mostrar toast de concorrência e manter o lote intacto.
Em erro de conexão, manter o lote e o rascunho intactos.
Em `201`, limpar o rascunho e chamar `onSuccess(records)`.

- [ ] **Step 6: Rodar build**

```bash
cd frontend
npm run build
cd ..
```

Esperado: `✓ built`.

- [ ] **Step 7: Commit**

```bash
git add \
  frontend/src/components/CadastroLoteEquipamentoCard.tsx \
  frontend/src/components/CadastroLoteForm.tsx

git commit -m "feat: cria formulario mobile de cadastro em lote"
```

---

### Task 7: Adicionar rascunho automático, recuperação e resultado de O.S.

**Files:**
- Modify: `frontend/src/components/CadastroLoteForm.tsx`
- Create: `frontend/src/pages/CadastroLote.tsx`

**Interfaces:**
- Consumes: `saveCadastroLoteDraft`, `loadCadastroLoteDraft`, `clearCadastroLoteDraft`.
- Produces: fluxo de recuperação e tela de sucesso com `O.S. → RP → Patrimônio`.

- [ ] **Step 1: Implementar autosave com debounce curto**

Em `CadastroLoteForm`, sempre que `gerais` ou `equipamentos` mudarem, salvar após 300 ms:

```ts
useEffect(() => {
  const timer = window.setTimeout(() => {
    saveCadastroLoteDraft({
      version: 1,
      updatedAt: new Date().toISOString(),
      gerais,
      equipamentos,
    });
  }, 300);

  return () => window.clearTimeout(timer);
}, [gerais, equipamentos]);
```

Não salvar um novo rascunho enquanto `isSubmitting` estiver concluindo um sucesso.

- [ ] **Step 2: Detectar rascunho na abertura sem restaurar silenciosamente**

Na montagem:
- chamar `loadCadastroLoteDraft()`;
- se houver draft, armazená-lo em `pendingDraft`;
- abrir diálogo:

```text
Cadastro em lote não concluído encontrado.
N equipamentos recuperados.

[ CONTINUAR LOTE ]
[ DESCARTAR RASCUNHO ]
```

`CONTINUAR LOTE` aplica `gerais` e `equipamentos`.
`DESCARTAR RASCUNHO` abre uma segunda confirmação; somente após confirmar chamar `clearCadastroLoteDraft()`.

- [ ] **Step 3: Criar a página `CadastroLote.tsx`**

A página deve:
- usar o mesmo fundo/container visual de `Cadastro.tsx`;
- ter botão `Voltar` para `/cadastro`;
- título `Cadastro em lote`;
- subtítulo curto `Cadastre vários equipamentos com uma O.S. individual para cada item.`;
- renderizar `CadastroLoteForm`.

- [ ] **Step 4: Implementar estado de sucesso**

Após resposta `201`, substituir ou sobrepor o formulário por:

```text
N equipamentos cadastrados com sucesso.

O.S. 2501 — RP 12345 — Patrimônio 001
O.S. 2502 — RP 12346 — Patrimônio 002
...
```

Ações:
- `Novo lote` → zerar estado e iniciar formulário vazio.
- `Voltar para Equipamentos` → navegar para `/cadastro`.

Não criar botão de edição ou sobrescrita nesse resultado.

- [ ] **Step 5: Confirmar limpeza do rascunho somente após sucesso**

Definir os helpers de storage com dependência injetável:

```ts
type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const saveCadastroLoteDraft = (
  draft: CadastroLoteDraft,
  storage: DraftStorage = window.localStorage
) => {
  storage.setItem(CADASTRO_LOTE_DRAFT_KEY, JSON.stringify(draft));
};

export const loadCadastroLoteDraft = (
  storage: DraftStorage = window.localStorage
) => {
  const raw = storage.getItem(CADASTRO_LOTE_DRAFT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed?.version !== 1 ||
      !parsed?.gerais ||
      !Array.isArray(parsed?.equipamentos)
    ) {
      return null;
    }
    return parsed as CadastroLoteDraft;
  } catch {
    return null;
  }
};

export const clearCadastroLoteDraft = (
  storage: DraftStorage = window.localStorage
) => {
  storage.removeItem(CADASTRO_LOTE_DRAFT_KEY);
};
```

No teste, usar um fake sem `jsdom`:

```ts
const memory = new Map<string, string>();

const storage = {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => void memory.set(key, value),
  removeItem: (key: string) => void memory.delete(key),
};

it("remove o rascunho explicitamente", () => {
  memory.set(CADASTRO_LOTE_DRAFT_KEY, "{}");
  clearCadastroLoteDraft(storage);
  expect(memory.has(CADASTRO_LOTE_DRAFT_KEY)).toBe(false);
});
```

No fluxo de sucesso, definir um flag `submitSucceeded = true` antes de limpar o storage; o efeito de autosave deve retornar sem salvar quando esse flag estiver ativo. Assim o rascunho antigo não é recriado entre o `clear` e a desmontagem do formulário.

- [ ] **Step 6: Rodar testes e build**

```bash
cd frontend
npm test
npm run build
cd ..
```

Esperado: todos os testes PASS e build `✓ built`.

- [ ] **Step 7: Commit**

```bash
git add \
  frontend/src/components/CadastroLoteForm.tsx \
  frontend/src/pages/CadastroLote.tsx \
  frontend/src/lib/cadastroLote.test.ts

git commit -m "feat: adiciona rascunho e recuperacao do lote"
```

---

### Task 8: Integrar o novo fluxo à navegação sem alterar o cadastro individual

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/Cadastro.tsx`

**Interfaces:**
- Produces rota protegida `/cadastro/lote`.
- Preserva rota `/cadastro` atual.

- [ ] **Step 1: Registrar a nova rota**

Em `frontend/src/App.tsx`:

```tsx
import CadastroLote from "./pages/CadastroLote";
```

e adicionar antes do catch-all:

```tsx
<Route
  path="/cadastro/lote"
  element={
    <ProtectedRoute>
      <CadastroLote />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 2: Adicionar entrada na tela Equipamentos**

Em `Cadastro.tsx`, junto ao botão `Novo`, adicionar um botão que navega para `/cadastro/lote`, sem alterar a lógica de `selectedRecord`:

```tsx
<Button
  type="button"
  variant="outline"
  size="sm"
  onClick={() => navigate("/cadastro/lote")}
  className="h-8 gap-1 font-bold text-[10px] uppercase border"
>
  Cadastro em lote
</Button>
```

Em telas estreitas, permitir quebra/empilhamento dos botões sem comprimir a busca.

- [ ] **Step 3: Verificar que o cadastro individual não mudou**

Rodar:

```bash
cd frontend
npm run build
npm test
cd ..
```

E testar manualmente:
1. abrir `/cadastro`;
2. criar/abrir um cadastro individual;
3. navegar anterior/próximo;
4. confirmar que os botões e formulário existentes continuam iguais;
5. abrir `/cadastro/lote`;
6. voltar para `/cadastro`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.tsx frontend/src/pages/Cadastro.tsx
git commit -m "feat: integra cadastro em lote aos equipamentos"
```

---

### Task 9: Verificação ponta a ponta e critérios de aceite

**Files:**
- Nenhuma alteração obrigatória; corrigir somente falhas encontradas nos arquivos já listados.

**Interfaces:**
- Valida a entrega completa antes de abrir PR.

- [ ] **Step 1: Rodar testes backend**

```bash
cd backend
npm test
cd ..
```

Esperado: todos os testes PASS.

- [ ] **Step 2: Rodar testes frontend**

```bash
cd frontend
npm test
cd ..
```

Esperado: todos os testes PASS.

- [ ] **Step 3: Rodar lint e build frontend**

```bash
cd frontend
npm run lint
npm run build
cd ..
```

Esperado: sem erros de lint e `✓ built`.

- [ ] **Step 4: Verificar whitespace e escopo do diff**

```bash
git diff --check
git status --short
git --no-pager diff --stat
```

Não usar `git add .`. Não adicionar scripts auxiliares ou arquivos não rastreados que não pertencem à funcionalidade.

- [ ] **Step 5: Teste manual de fluxo feliz no ambiente de desenvolvimento**

Criar um lote de pelo menos 3 itens:
- 2 computadores com análise herdada;
- 1 impressora com tipo individual alterado;
- 1 item com análise individual alterada.

Confirmar que:
- os 3 salvam numa única ação;
- cada um recebe O.S. diferente;
- os registros aparecem individualmente na busca normal;
- `MANUTENCAO` aparece no banco como `PENDENTE` e `LAUDO` como `LAUDO`.

- [ ] **Step 6: Teste manual de duplicidade sem gravação parcial**

Tentar:
- RP duplicado dentro do lote;
- Patrimônio duplicado dentro do lote;
- RP que já exista no banco;
- Patrimônio que já exista no banco.

Em todos os casos:
- resposta deve indicar o conflito;
- nenhum item daquele lote deve aparecer como novo registro;
- nenhum registro existente deve ser alterado.

- [ ] **Step 7: Teste manual de rascunho no celular ou DevTools mobile**

1. preencher dados gerais;
2. adicionar 3 equipamentos;
3. recarregar a página;
4. escolher `Continuar lote`;
5. confirmar os 3 equipamentos;
6. alterar um deles;
7. recarregar novamente;
8. confirmar a alteração recuperada;
9. salvar com sucesso;
10. abrir novo lote e confirmar que o rascunho anterior não retorna.

- [ ] **Step 8: Teste de toque duplo/conexão lenta**

No DevTools, aplicar throttling de rede e tocar `Cadastrar N equipamentos`.
Confirmar:
- botão entra em loading;
- segundo toque não dispara nova requisição;
- em falha de rede, os dados permanecem no formulário;
- em sucesso, o rascunho é removido.

- [ ] **Step 9: Verificar o caminho de falha transacional sem alterar produção**

Adicionar ao teste backend um `Servico.insertMany` fake que lança `new Error("falha-controlada")` dentro do callback de `withTransaction`, e uma sessão fake que registra `endSession()`.

O teste deve verificar:
- `createServicoBatch(...)` rejeita com `falha-controlada`;
- nenhum resultado de sucesso é retornado;
- `endSession()` foi chamado;
- não existe fallback que tente salvar item por item fora da transação.

Depois executar:

```bash
cd backend
npm test
cd ..
```

Esperado: PASS.

- [ ] **Step 10: Commit final apenas se houve correções de verificação**

Adicionar somente os arquivos corrigidos, por exemplo:

```bash
git add \
  frontend/src/components/CadastroLoteForm.tsx \
  backend/services/servicoLoteService.js

git commit -m "fix: reforca validacoes do cadastro em lote"
```

Se não houve correções, não criar commit vazio.

- [ ] **Step 11: Revisão final dos critérios de aceite**

Confirmar um a um:
1. Cadastro individual preservado.
2. Vários equipamentos no mesmo lote.
3. O.S. própria para cada equipamento.
4. Herança de todos os dados gerais.
5. Tipo e análise individualmente ajustáveis.
6. Manutenção e Laudo disponíveis.
7. Análise obrigatória nos dois.
8. RP e Patrimônio obrigatórios.
9. Duplicidade bloqueia o lote inteiro.
10. Nenhum registro existente é sobrescrito.
11. Todos ou nenhum.
12. Resultado mostra todas as O.S.
13. Rascunho automático e recuperação.
14. Rascunho limpo somente por sucesso ou descarte confirmado.

- [ ] **Step 12: Push e abertura de PR**

```bash
git push -u origin feat/cadastro-em-lote
```

Depois:

```bash
gh pr create \
  --base main \
  --title "Adiciona cadastro em lote de equipamentos" \
  --body "Implementa cadastro em lote mobile-first com O.S. individual por equipamento, validação de duplicidades, gravação atômica e recuperação automática de rascunho."
```

Não fazer merge antes de revisar o diff, os testes e o comportamento no ambiente publicado.
