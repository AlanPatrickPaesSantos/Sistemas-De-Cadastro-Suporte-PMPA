import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

export const Header = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full overflow-hidden border-b border-sky-200/10 bg-gradient-to-r from-[#0b63ad] via-[#075294] to-[#06386b] shadow-[0_6px_24px_rgba(0,25,58,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.04] via-transparent to-sky-200/[0.04]" />

      <div className="relative grid h-[70px] w-full grid-cols-[1fr_auto] items-center gap-4 px-3 md:h-[88px] md:px-7 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex shrink-0 items-center gap-2.5 rounded-xl text-left transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:gap-4"
            aria-label="Ir para o início"
          >
            <img
              src="/logo-pmpa.png"
              alt="Brasão PMPA"
              className="h-[52px] w-auto object-contain md:h-[72px]"
            />
            <span className="hidden min-w-0 sm:flex sm:flex-col sm:justify-center">
              <span className="text-xl font-black uppercase leading-none tracking-tight text-white drop-shadow-sm md:text-3xl">
                PMPA
              </span>
              <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-blue-100 md:text-[12px]">
                DITEL / SUPORTE
              </span>
            </span>
          </button>
        </div>

        <div className="hidden min-w-[300px] flex-col items-center justify-center border-x border-white/20 px-8 text-center lg:flex">
          <span className="text-2xl font-black uppercase leading-none tracking-[0.08em] text-white drop-shadow-sm xl:text-[32px]">
            SISCAD
          </span>
          <span className="mt-1.5 text-[11px] font-medium tracking-wide text-blue-100/90 xl:text-sm">
            Sistemas De Cadastro Suporte
          </span>
        </div>

        <div id="header-user-menu" className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4">
          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/15 shadow-inner md:h-10 md:w-10">
              <UserRound className="h-5 w-5 text-white md:h-5.5 md:w-5.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="max-w-[140px] truncate text-[11px] font-black uppercase tracking-wide text-white md:text-xs">
                {user?.nomeCompleto || user?.username || "Usuário"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-blue-100/90" aria-hidden="true" />
            </div>
          </div>

          <div className="hidden h-8 w-px bg-white/20 sm:block" />

          <div className="rounded-full border border-white/10 bg-white/[0.06] shadow-inner transition-colors hover:bg-white/[0.10]">
            <ThemeToggle />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-10 rounded-lg border border-white/45 bg-transparent px-3 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:border-white/70 hover:bg-white/10 hover:text-white md:h-11 md:px-4 md:text-xs"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
