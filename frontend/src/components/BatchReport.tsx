import { Button } from "@/components/ui/button";

type ReportItem = { os?: number; tEquipSuporte: string; rp: string; nSerie: string; analiseTecnica: string };

export function BatchReport({ items, fallbackDescription }: { items: ReportItem[]; fallbackDescription: string }) {
  if (!items.length) return null;
  const print = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = items.map(item => `<tr><td>${item.os || "—"}</td><td>${item.tEquipSuporte}</td><td>${item.rp}</td><td>${item.nSerie || "—"}</td><td>${item.analiseTecnica || fallbackDescription}</td></tr>`).join("");
    win.document.write(`<html><head><title>Relatório do lote</title><style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #aaa;padding:8px;text-align:left}th{background:#eee}</style></head><body><h1>Relatório do lote</h1><table><thead><tr><th>O.S.</th><th>Equipamento</th><th>RP</th><th>Nº de série</th><th>Descrição do laudo/manutenção</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    win.document.close();
    win.print();
  };
  return <Button type="button" variant="outline" className="w-full" onClick={print}>Imprimir relatório do lote</Button>;
}
