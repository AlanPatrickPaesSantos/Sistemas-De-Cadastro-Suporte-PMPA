import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";

export const Header = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full overflow-hidden border-b border-white/10 bg-[linear-gradient(90deg,#0a4b86_0%,#0c5ea7_36%,#0a4f90_62%,#083a6a_100%)] shadow-[0_8px_24px_rgba(0,25,58,0.24)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_58%,rgba(255,255,255,0.06)_58%,rgba(255,255,255,0.06)_70%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />

      <div className="relative grid h-[72px] w-full grid-cols-[1fr_auto] items-center gap-3 px-3 md:h-[88px] md:px-7 lg:grid-cols-[1fr_auto_1fr]">
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
              <span className="text-[22px] font-black uppercase leading-none tracking-tight text-white drop-shadow-sm md:text-[30px]">
                PMPA
              </span>
              <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-blue-100 md:text-[12px]">
                DITEL / SUPORTE
              </span>
            </span>
          </button>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <div className="h-14 w-px bg-white/20" />
          <div className="px-10 text-center">
            <span className="block text-[34px] font-black uppercase leading-none tracking-[0.06em] text-white drop-shadow-sm xl:text-[40px]">
              SISCAD
            </span>
            <span className="mt-2 block text-[13px] font-semibold tracking-[0.02em] text-blue-50/95 xl:text-[15px]">
              Sistemas De Cadastro Suporte
            </span>
          </div>
          <div className="h-14 w-px bg-white/20" />
        </div>

        <div id="header-user-menu" className="flex items-center justify-end gap-2.5 sm:gap-3 md:gap-4">
          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.14] shadow-inner">
              <UserRound className="h-5 w-5 text-white" />
            </div>
            <span className="max-w-[150px] truncate text-[11px] font-black uppercase tracking-wide text-white md:text-xs">
              {user?.nomeCompleto || user?.username || "Usuário"}
            </span>
          </div>

          <div className="hidden h-9 w-px bg-white/18 sm:block" />

          <div className="rounded-full border border-white/10 bg-white/[0.08] shadow-inner transition-colors hover:bg-white/[0.12]">
            <ThemeToggle />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-10 rounded-xl border border-white/45 bg-white/[0.03] px-3 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:border-white/70 hover:bg-white/10 hover:text-white md:h-11 md:px-4 md:text-xs"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
