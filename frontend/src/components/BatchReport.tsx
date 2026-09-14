import { Button } from "@/components/ui/button";

type ReportItem = { os?: number; tEquipSuporte: string; rp: string; nSerie: string; analiseTecnica: string };

export function BatchReport({ items, fallbackDescription, unit, date }: { items: ReportItem[]; fallbackDescription: string; unit: string; date: string }) {
  if (!items.length) return null;
  const print = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = items.map(item => `<tr><td>${item.os || "—"}</td><td>${item.tEquipSuporte}</td><td>${item.rp}</td><td>${item.nSerie || "—"}</td><td>${item.analiseTecnica || fallbackDescription}</td></tr>`).join("");
    win.document.write(`<html><head><title>Relatório consolidado do lote</title><style>@page{size:A4 portrait;margin:12mm}body{font-family:Arial;padding:0;color:#000;font-size:10px}.header{display:flex;align-items:center;justify-content:space-between;border-bottom:1.2pt solid #000;padding-bottom:8px}.header img{width:82px;height:82px;object-fit:contain}.header-text{text-align:center;font-weight:bold;text-transform:uppercase;font-size:8px;line-height:1.35}.header-text strong{font-size:10px}.title{text-align:center;margin:18px 0 14px;font-size:13px}.meta{border-bottom:1px solid #000;padding-bottom:7px;margin-bottom:12px;font-weight:bold}.table{width:100%;border-collapse:collapse;table-layout:fixed}.table th,.table td{border:1px solid #000;padding:6px;text-align:left;vertical-align:top;word-wrap:break-word}.table th{background:#eee;text-transform:uppercase;font-size:9px}.table th:nth-child(1){width:7%}.table th:nth-child(2){width:20%}.table th:nth-child(3){width:12%}.table th:nth-child(4){width:14%}.footer{position:fixed;bottom:0;left:0;right:0;border-top:1px solid #000;padding-top:7px;text-align:center;font-size:8px;font-weight:bold}.footer p{margin:2px}</style></head><body><div class="header"><img src="${location.origin}/logo-pmpa.png"><div class="header-text"><div>Governo do Estado do Pará</div><div>Secretaria de Estado de Segurança Pública e Defesa Social</div><div>Polícia Militar do Pará</div><div>Departamento Geral de Administração</div><strong>Diretoria de Telemática</strong></div><img src="${location.origin}/Logo Ditel.jpeg"></div><h1 class="title">RELATÓRIO CONSOLIDADO DE EQUIPAMENTOS DO LOTE</h1><div class="meta">Unidade: ${unit || "—"} &nbsp;&nbsp; Data de entrada: ${date || "—"}</div><table class="table"><thead><tr><th>O.S.</th><th>Equipamento</th><th>RP</th><th>Nº de série</th><th>Descrição do laudo/manutenção</th></tr></thead><tbody>${rows}</tbody></table><div class="footer"><p>Diretoria de Telemática - DITEL / PMPA</p><p>"A Diretoria de Telemática não possui peças de reposição ou suprimento para aquisição destas peças informadas"</p></div></body></html>`);
    win.document.close();
    win.onload = () => setTimeout(() => win.print(), 300);
    setTimeout(() => win.print(), 800);
  };
  return <Button type="button" variant="outline" className="w-full" onClick={print}>Imprimir relatório do lote</Button>;
}
