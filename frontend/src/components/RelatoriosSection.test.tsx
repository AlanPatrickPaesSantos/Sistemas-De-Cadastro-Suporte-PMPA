import { describe, expect, it } from "vitest";
import { buildEquipmentPrintHtml } from "./RelatoriosSection";

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
});
