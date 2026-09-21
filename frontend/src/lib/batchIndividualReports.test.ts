import { describe, expect, it } from "vitest";
import { buildBatchIndividualDocument } from "./batchIndividualReports";

describe("documentos individuais do lote", () => {
  it("gera uma página por equipamento e mantém o tipo de atendimento", () => {
    const html = buildBatchIndividualDocument({
      items: [
        { os: 3208, rp: "1", nSerie: "SN-1", tEquipSuporte: "MINI PC", atendimento: "LAUDO", situacao: "PENDENTE", analiseTecnica: "Sem defeito" },
        { os: 3209, rp: "2", nSerie: "SN-2", tEquipSuporte: "MONITOR", atendimento: "MANUTENCAO", situacao: "PRONTO", analiseTecnica: "Limpeza realizada" },
      ],
      unit: "CORREGEDORIA", date: "2026-09-14", technician: "VC ALAN", requester: "SGT TESTE", pae: "0000", defect: "Teste"
    });

    expect((html.match(/class="os-page"/g) || []).length).toBe(2);
    expect(html).toContain("RELATÓRIO DE LAUDO TÉCNICO");
    expect(html).toContain("RELATÓRIO DE SAÍDA DE EQUIPAMENTO");
    expect(html).toContain("3208");
    expect(html).toContain("3209");
  });
});
