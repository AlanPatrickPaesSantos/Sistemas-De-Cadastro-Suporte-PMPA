import { describe, expect, it } from "vitest";
import { buildEquipmentPrintHtml, fetchAllEquipmentPages, getEquipmentPrintFilters, getEquipmentPrintQueryParams } from "./RelatoriosSection";

describe("relatório imprimível de equipamentos", () => {
  it("monta uma tabela com o período e os registros retornados, preservando campos ausentes", () => {
    const html = buildEquipmentPrintHtml(
      [
        {
          Id_cod: 123,
          Data_Ent: "2026-10-03T12:00:00.000Z",
          Unidade: "1º BPM",
          T_EquipSuporte: "Notebook",
          RP: "RP-001",
          Nº_Serie: "SN-001",
          Tecnico: "Ana Silva",
          Serviço: "PRONTO",
        },
        {
          Id_cod: 124,
          Data_Ent: "2026-10-04T12:00:00.000Z",
          Unidade: "2º BPM",
          T_EquipTelecom: "Rádio",
        },
      ],
      { startDate: "2026-10-01", endDate: "2026-10-31" },
      "https://example.test",
    );

    expect(html).toContain("01/10/2026");
    expect(html).toContain("31/10/2026");
    expect(html).toContain("RP-001");
    expect(html).toContain("SN-001");
    expect(html).toContain("Ana Silva");
    expect(html).toContain("Rádio");
    expect(html).toContain("—");
    expect(html).toContain("table-header-group");
    expect(html).toContain("page-break-inside: avoid");
  });

  it("mantém no documento o período da última pesquisa concluída após editar os campos", () => {
    const lastCompletedSearch = { startDate: "2026-10-01", endDate: "2026-10-31" };
    const editedDateFields = { startDate: "2026-11-01", endDate: "2026-11-30" };
    const printFilters = getEquipmentPrintFilters(lastCompletedSearch, editedDateFields);
    const html = buildEquipmentPrintHtml([], printFilters, "https://example.test");

    expect(html).toContain("01/10/2026 — 31/10/2026");
    expect(html).not.toContain("01/11/2026 — 30/11/2026");
  });
});


describe("paginação completa do relatório de equipamentos", () => {
  it("carrega todas as páginas e preserva o total informado pela API", async () => {
    const requestedPages: number[] = [];
    const records = await fetchAllEquipmentPages(async (page) => {
      requestedPages.push(page);
      return {
        total: 205,
        records: Array.from({ length: page < 3 ? 100 : 5 }, (_, index) => ({
          Id_cod: (page - 1) * 100 + index + 1,
        })),
      };
    });

    expect(requestedPages).toEqual([1, 2, 3]);
    expect(records).toHaveLength(205);
    expect(records[0].Id_cod).toBe(1);
    expect(records[204].Id_cod).toBe(205);
  });

  it("interrompe a geração quando a quantidade carregada não corresponde ao total", async () => {
    await expect(fetchAllEquipmentPages(async () => ({
      total: 120,
      records: Array.from({ length: 50 }, (_, index) => ({ Id_cod: index + 1 })),
    }), 50)).rejects.toThrow("Relatório incompleto");
  });

  it("interrompe a geração se o total mudar entre páginas", async () => {
    await expect(fetchAllEquipmentPages(async (page) => ({
      total: page === 1 ? 101 : 102,
      records: Array.from({ length: 100 }, (_, index) => ({ Id_cod: index + 1 })),
    }), 100)).rejects.toThrow("quantidade total mudou");
  });

  it("monta os mesmos parâmetros de pesquisa usados no relatório concluído", () => {
    const params = getEquipmentPrintQueryParams({
      startDate: "2026-10-01",
      endDate: "2026-10-31",
      q: "notebook",
      status: "PRONTO",
      unidade: "1º BPM",
      bateria: true,
      garantia: false,
    });

    expect(params.get("startDate")).toBe("2026-10-01");
    expect(params.get("endDate")).toBe("2026-10-31");
    expect(params.get("q")).toBe("notebook");
    expect(params.get("status")).toBe("PRONTO");
    expect(params.get("unidade")).toBe("1º BPM");
    expect(params.get("bateria")).toBe("true");
    expect(params.has("garantia")).toBe(false);
  });
});

describe("dashboard e relação individual de equipamentos", () => {
  it("apresenta indicadores, análises e um cartão para cada equipamento", () => {
    const html = buildEquipmentPrintHtml([
      {
        Id_cod: 501,
        Unidade: "1º BPM",
        T_EquipSuporte: "Notebook",
        RP: "RP-501",
        "Nº_Serie": "SN-501",
        Tecnico: "Ana Silva",
        Serviço: "PRONTO",
        Bateria: "Sim",
        Garantia: "Sim",
        Defeito_Recl: "Não liga",
        Analise_Tecnica: "Fonte substituída",
      },
      {
        Id_cod: 502,
        Unidade: "2º BPM",
        T_EquipTelecom: "Rádio",
        Serviço: "PENDENTE",
      },
    ], { startDate: "2026-10-01", endDate: "2026-10-31" }, "https://example.test");

    expect(html).toContain("Dashboard consolidado");
    expect(html).toContain("Distribuição por situação");
    expect(html).toContain("Equipamentos por unidade");
    expect(html).toContain("Tipos de equipamento");
    expect(html).toContain("Condições de bateria");
    expect(html).toContain("Situação da garantia");
    expect(html).toContain("Ordem de serviço");
    expect(html).toContain("#501");
    expect(html).toContain("#502");
    expect(html).toContain("RP-501");
    expect(html).toContain("SN-501");
    expect(html).toContain("Ana Silva");
    expect(html).toContain("Não liga");
    expect(html).toContain("Fonte substituída");
  });

  it("escapa conteúdo fornecido pelos registros antes de inserir no HTML", () => {
    const html = buildEquipmentPrintHtml([{
      Id_cod: 1,
      T_EquipSuporte: "<script>alert(1)</script>",
      Unidade: "Unidade & Teste",
    }], { startDate: "", endDate: "" }, "https://example.test");

    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("Unidade &amp; Teste");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});
