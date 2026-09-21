import { Button } from "@/components/ui/button";
import { buildBatchIndividualDocument, BatchIndividualData } from "@/lib/batchIndividualReports";

export function BatchIndividualReports(props: BatchIndividualData) {
  if (!props.items.length) return null;
  const print = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(buildBatchIndividualDocument(props, window.location.origin));
    win.document.close();
    win.onload = () => setTimeout(() => win.print(), 300);
    setTimeout(() => win.print(), 800);
  };
  return <Button type="button" className="w-full bg-[#004e9a] text-white shadow-md hover:bg-[#003b75]" onClick={print}>Imprimir O.S. individuais do lote</Button>;
}
