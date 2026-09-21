import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LaudoData, LaudoPrint, BatchLaudoRecord } from "@/components/LaudoPrint";

type Item = { os?: number; rp: string; nSerie: string; tEquipSuporte: string; atendimento: string; situacao: string; analiseTecnica: string };

export function BatchIndividualReports({ items, unit, date, technician, requester, pae, defect }: { items: Item[]; unit: string; date: string; technician: string; requester: string; pae: string; defect: string }) {
  const [printing, setPrinting] = useState(false);
  if (!items.length) return null;
  const records: BatchLaudoRecord[] = items.map(item => {
    const data: LaudoData = {
      Id_cod: item.os || "—", T_EquipSuporte: item.tEquipSuporte, Unidade: unit, Nº_PAE: pae, RP: item.rp,
      Nº_Serie: item.nSerie, Solicitante: requester, Data_Ent: date, Defeito_Recl: defect,
      Analise_Tecnica: item.analiseTecnica, Laudo_Tecnico: item.analiseTecnica, Tecnico: technician,
    };
    return { data, type: item.atendimento === "LAUDO" ? "laudo" : "saida" };
  });
  const print = () => { setPrinting(true); setTimeout(() => window.print(), 150); };
  return <>
    <Button type="button" className="w-full bg-[#004e9a] text-white shadow-md hover:bg-[#003b75]" onClick={print}>Imprimir O.S. individuais do lote</Button>
    {printing && <div className="hidden"><LaudoPrint data={records[0].data} batch={records} /></div>}
  </>;
}
