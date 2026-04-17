import React, { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  Building, 
  Database, 
  FileText, 
  Home, 
  Plus, 
  Search, 
  Wrench,
  Activity,
  LogOut,
  User,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api-config";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search logic (Debounced)
  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Search in equipments/services
        const res = await fetch(`${API_BASE}/servicos?q=${encodeURIComponent(search)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Command Search Error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="O que você está procurando? (Busque ID, RP, Unidade...)" 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          {isLoading ? "Buscando..." : "Nenhum resultado encontrado."}
        </CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading="Equipamentos Encontrados">
            {results.map((item) => (
              <CommandItem
                key={item.Id_cod}
                onSelect={() => runCommand(() => navigate(`/`))} // For now navigate to home where search results can be loaded or open a specific dialog
                className="flex items-center gap-3 py-3"
              >
                <Database className="h-4 w-4 text-[#004e9a]" />
                <div className="flex flex-col">
                  <span className="font-bold">OS #{item.Id_cod} - {item.T_EquipSuporte || "Equipamento"}</span>
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                    {item.Unidade} | RP: {item.RP || "N/A"}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Atalhos Rápidos">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard Principal</span>
            <span className="ml-auto text-[10px] text-muted-foreground">⌘H</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/cadastro"))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Novo Cadastro de Equipamento</span>
            <span className="ml-auto text-[10px] text-muted-foreground">⌘N</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/servico-interno-externo"))}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Gestão de Missões</span>
            <span className="ml-auto text-[10px] text-muted-foreground">⌘M</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Sistema">
          <CommandItem onSelect={() => runCommand(() => { logout(); navigate("/login"); })}>
            <LogOut className="mr-2 h-4 w-4 text-red-500" />
            <span>Sair do Sistema</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        <span>Ditel / PMPA</span>
        <div className="flex items-center gap-3">
          <span>Esc p/ fechar</span>
          <span>↵ p/ selecionar</span>
        </div>
      </div>
    </CommandDialog>
  );
}
