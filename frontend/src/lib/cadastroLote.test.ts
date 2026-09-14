import { describe, expect, it } from "vitest";
import { appendAnaliseSuggestion } from "./analiseSugestoes";
describe("appendAnaliseSuggestion", () => {
  it("adiciona sugestão vazia", () => expect(appendAnaliseSuggestion("", "Texto A")).toEqual({ value: "Texto A", duplicate: false }));
  it("concatena com pontuação", () => expect(appendAnaliseSuggestion("Texto existente", "Texto B")).toEqual({ value: "Texto existente. Texto B", duplicate: false }));
  it("detecta duplicata ignorando caixa", () => expect(appendAnaliseSuggestion("Após análise técnica, defeito confirmado.", "APÓS ANÁLISE TÉCNICA, DEFEITO CONFIRMADO.")).toEqual({ value: "Após análise técnica, defeito confirmado.", duplicate: true }));
});
