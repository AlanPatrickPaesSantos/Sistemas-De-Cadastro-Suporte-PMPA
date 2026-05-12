import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { API_BASE } from "../lib/api-config";

interface EquipComboboxProps {
  value?: string;
  onChange: (value: string) => void;
}

export function EquipCombobox({ value, onChange }: EquipComboboxProps) {
  const [open, setOpen] = useState(false);
  const [equipamentos, setEquipamentos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEquipamentos = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const authHeaders: any = {};
        if (token) authHeaders['Authorization'] = `Bearer ${token}`; // /api/eqsuporte is unprotected explicitly, but sending token doesn't hurt.
        
        const response = await fetch(`${API_BASE}/eqsuporte`, { headers: authHeaders });
        const data = await response.json();
        setEquipamentos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar equipamentos de suporte:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipamentos();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 font-normal border-input bg-background hover:bg-muted/30 uppercase"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Selecione o equipamento..."}
          </span>
          {isLoading 
            ? <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder="Buscar equipamento..." className="h-9 uppercase" />
          <CommandList>
            <CommandEmpty>Nenhum equipamento encontrado.</CommandEmpty>
            <CommandGroup>
              {equipamentos.map((equip) => (
                <CommandItem
                  key={equip}
                  value={equip}
                  onSelect={(val) => {
                    onChange(val === value ? "" : val.toUpperCase());
                    setOpen(false);
                  }}
                  className="uppercase"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === equip ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {equip}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
