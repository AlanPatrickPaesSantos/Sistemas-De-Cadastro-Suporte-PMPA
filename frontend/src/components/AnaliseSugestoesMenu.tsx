import { Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ANALISE_SUGESTOES_LAUDO, ANALISE_SUGESTOES_MANUTENCAO } from "@/lib/analiseSugestoes";

interface AnaliseSugestoesMenuProps { onSelect: (text: string) => void; }
export function AnaliseSugestoesMenu({ onSelect }: AnaliseSugestoesMenuProps) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button type="button" variant="outline" className="gap-2"><Sparkles className="h-3 w-3" /> Sugestões</Button></DropdownMenuTrigger>
    <DropdownMenuContent className="max-h-80 overflow-y-auto">
      <DropdownMenuLabel>Manutenção</DropdownMenuLabel>
      {ANALISE_SUGESTOES_MANUTENCAO.map(item => <DropdownMenuItem key={item.label} onSelect={() => onSelect(item.text)}>{item.label}</DropdownMenuItem>)}
      <DropdownMenuSeparator /><DropdownMenuLabel>Laudo</DropdownMenuLabel>
      {ANALISE_SUGESTOES_LAUDO.map(item => <DropdownMenuItem key={item.label} onSelect={() => onSelect(item.text)}>{item.label}</DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>;
}
