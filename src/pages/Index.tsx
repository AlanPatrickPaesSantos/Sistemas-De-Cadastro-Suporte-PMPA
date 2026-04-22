import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";

import { ConsultasSection } from "@/components/ConsultasSection";
// Lazy load components that are not needed immediately
const RelatoriosSection = lazy(() => import("@/components/RelatoriosSection").then(m => ({ default: m.RelatoriosSection })));
const EqSuporteDialog = lazy(() => import("@/components/EqSuporteDialog").then(m => ({ default: m.EqSuporteDialog })));
const EqTelecomDialog = lazy(() => import("@/components/EqTelecomDialog").then(m => ({ default: m.EqTelecomDialog })));
const EqUnidadeDialog = lazy(() => import("@/components/EqUnidadeDialog").then(m => ({ default: m.EqUnidadeDialog })));

import { Database, Headphones, Phone, Building, Server, Shield, Wrench, Activity, Loader2, Search } from "lucide-react";
import { API_BASE } from "@/lib/api-config";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [eqSuporteOpen, setEqSuporteOpen] = useState(false);
  const [eqTelecomOpen, setEqTelecomOpen] = useState(false);
  const [eqUnidadeOpen, setEqUnidadeOpen] = useState(false);
  const [stats, setStats] = useState({ maintenance: 0, ready: 0, missions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [externalReportTrigger, setExternalReportTrigger] = useState<{ id: string; dateRange?: { start: string; end: string }; q?: string } | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        // Busca Estatísticas Consolidadas (v40.11 Restauração Total)
        const statsUrl = `${API_BASE}/stats/consolidated?startDate=${firstDay}&endDate=${lastDay}`;
        const resp = await fetch(statsUrl);
        
        if (resp.ok) {
          const allStats = await resp.json();
          setStats({
            maintenance: allStats.dashboard.maintenance || 0, // Manutenção (YTD - Desde Janeiro)
            ready: allStats.dashboard.ready || 0,             // Pronto para Entrega (YTD)
            missions: allStats.dashboard.missions || 0       // Missões do Mês (Apenas mês atual)
          });
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        toast.error("Erro ao carregar dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-200 dark:bg-slate-950 overflow-x-hidden">
      <Header />


      <main className="w-full max-w-screen-xl mx-auto flex-1 px-3 md:px-6 pt-4 md:pt-8 pb-10">

        <div className="relative z-10 w-full mb-8 md:mb-10">
          <div className="mb-5 md:mb-6 px-1 md:px-0">
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm">Centro de Comando</h2>
          </div>

          {/* PREMIUM ACTION CARDS (Glassmorphism Design) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            
            {/* Cadastro */}
            <div 
              onClick={() => navigate("/cadastro")} 
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 h-36 md:h-48 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(0,78,154,0.25)] hover:-translate-y-2 transition-all duration-500 border border-white/40 dark:border-slate-800/50 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#004e9a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] group-hover:scale-110 transition-transform duration-500 relative z-10 border border-white/60 dark:border-slate-700/50">
                <Database className="w-7 h-7 md:w-9 md:h-9 text-[#004e9a] dark:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(0,78,154,0.5)] transition-all" />
              </div>
              <div className="text-center relative z-10">
                <span className="block text-[11px] md:text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] group-hover:text-[#004e9a] transition-colors">Cadastro</span>
                <div className="h-0.5 w-0 bg-[#004e9a] mx-auto mt-1.5 group-hover:w-full transition-all duration-500 rounded-full" />
              </div>
            </div>

            {/* Serv_Int_Ext */}
            <div 
              onClick={() => navigate("/servico-interno-externo")} 
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 h-36 md:h-48 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(0,78,154,0.25)] hover:-translate-y-2 transition-all duration-500 border border-white/40 dark:border-slate-800/50 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#004e9a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] group-hover:scale-110 transition-transform duration-500 relative z-10 border border-white/60 dark:border-slate-700/50">
                <Server className="w-7 h-7 md:w-9 md:h-9 text-[#004e9a] dark:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(0,78,154,0.5)] transition-all" />
              </div>
              <div className="text-center relative z-10">
                <span className="block text-[11px] md:text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] group-hover:text-[#004e9a] transition-colors">Serv_Int_Ext</span>
                <div className="h-0.5 w-0 bg-[#004e9a] mx-auto mt-1.5 group-hover:w-full transition-all duration-500 rounded-full" />
              </div>
            </div>

            {/* Telecom */}
            <div 
              onClick={() => setEqTelecomOpen(true)} 
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 h-36 md:h-48 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(0,78,154,0.25)] hover:-translate-y-2 transition-all duration-500 border border-white/40 dark:border-slate-800/50 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#004e9a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] group-hover:scale-110 transition-transform duration-500 relative z-10 border border-white/60 dark:border-slate-700/50">
                <Phone className="w-7 h-7 md:w-9 md:h-9 text-[#004e9a] dark:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(0,78,154,0.5)] transition-all" />
              </div>
              <div className="text-center relative z-10">
                <span className="block text-[11px] md:text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] group-hover:text-[#004e9a] transition-colors">Telecom</span>
                <div className="h-0.5 w-0 bg-[#004e9a] mx-auto mt-1.5 group-hover:w-full transition-all duration-500 rounded-full" />
              </div>
            </div>

            {/* Unidade */}
            <div 
              onClick={() => setEqUnidadeOpen(true)} 
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 h-36 md:h-48 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(0,78,154,0.25)] hover:-translate-y-2 transition-all duration-500 border border-white/40 dark:border-slate-800/50 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#004e9a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] group-hover:scale-110 transition-transform duration-500 relative z-10 border border-white/60 dark:border-slate-700/50">
                <Building className="w-7 h-7 md:w-9 md:h-9 text-[#004e9a] dark:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(0,78,154,0.5)] transition-all" />
              </div>
              <div className="text-center relative z-10">
                <span className="block text-[11px] md:text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] group-hover:text-[#004e9a] transition-colors">Unidade</span>
                <div className="h-0.5 w-0 bg-[#004e9a] mx-auto mt-1.5 group-hover:w-full transition-all duration-500 rounded-full" />
              </div>
            </div>

            {/* Suporte */}
            <div 
              onClick={() => setEqSuporteOpen(true)} 
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 h-36 md:h-48 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(0,78,154,0.25)] hover:-translate-y-2 transition-all duration-500 border border-white/40 dark:border-slate-800/50 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#004e9a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] group-hover:scale-110 transition-transform duration-500 relative z-10 border border-white/60 dark:border-slate-700/50">
                <Headphones className="w-7 h-7 md:w-9 md:h-9 text-[#004e9a] dark:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(0,78,154,0.5)] transition-all" />
              </div>
              <div className="text-center relative z-10">
                <span className="block text-[11px] md:text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] group-hover:text-[#004e9a] transition-colors">Suporte</span>
                <div className="h-0.5 w-0 bg-[#004e9a] mx-auto mt-1.5 group-hover:w-full transition-all duration-500 rounded-full" />
              </div>
            </div>

          </div>

          {/* PREMIUM STATS WIDGETS */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Widget: Manutenção */}
            <div 
              onClick={() => {
                const now = new Date();
                const yearStart = `${now.getFullYear()}-01-01`;
                const yearEnd = `${now.getFullYear()}-12-31`;
                setExternalReportTrigger({ id: "Rel_Equipamentos", dateRange: { start: yearStart, end: yearEnd } });
              }}
              className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-[2.5rem] p-6 md:p-8 cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-15px_rgba(239,68,68,0.15)] transition-all duration-700 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/10 transition-colors" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-5 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-slate-900 rounded-3xl shadow-[0_5px_15px_rgba(239,68,68,0.1)] group-hover:bg-red-500 transition-all duration-500 group-hover:rotate-6">
                  <Wrench className="w-8 h-8 text-red-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Manutenção Ativa</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                      {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-red-500/50" /> : stats.maintenance}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg">TOTAL</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-0 group-hover:w-[65%] transition-all duration-1000 delay-100 rounded-full" />
              </div>
            </div>

            {/* Widget: Missões */}
            <div 
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                setExternalReportTrigger({ id: "Rel_Missao_Consolidado", dateRange: { start: firstDay, end: lastDay } });
              }}
              className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-[2.5rem] p-6 md:p-8 cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-15px_rgba(0,78,154,0.15)] transition-all duration-700 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#004e9a]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#004e9a]/10 transition-colors" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 rounded-3xl shadow-[0_5px_15px_rgba(0,78,154,0.1)] group-hover:bg-[#004e9a] transition-all duration-500 group-hover:-rotate-6">
                  <Activity className="w-8 h-8 text-[#004e9a] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Missões Executadas</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                      {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-blue-500/50" /> : stats.missions}
                    </span>
                    <span className="text-xs font-bold text-[#004e9a] bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">MÊS</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#004e9a] w-0 group-hover:w-[85%] transition-all duration-1000 delay-100 rounded-full" />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="mt-8 grid lg:grid-cols-2 gap-4 md:gap-6 items-stretch w-full max-w-full">
            
            {/* Box de Busca */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col w-full max-w-full overflow-hidden">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="p-2 bg-[#004e9a]/10 rounded-lg">
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-[#004e9a]" />
                </div>
                <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">Busca Rápida</h3>
              </div>
              <div className="flex-1 w-full">
                <ConsultasSection />
              </div>
            </div>
            
            {/* Box de Relatórios */}
            <Suspense fallback={
              <div className="flex items-center justify-center p-8 md:p-12 bg-card border border-border/60 rounded-2xl animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-pmpa-navy/20" />
              </div>
            }>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-3 mb-5 md:mb-6">
                  <div className="p-2 bg-[#004e9a]/10 rounded-lg">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 text-[#004e9a]" />
                  </div>
                  <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">Painel de Relatórios</h3>
                </div>
                <div className="flex-1 w-full">
                  <RelatoriosSection externalTrigger={externalReportTrigger} onTriggerClean={() => setExternalReportTrigger(null)} />
                </div>
              </div>
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-white/80 dark:bg-slate-900 relative border-t border-slate-200 dark:border-slate-800">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#004e9a]/20 to-transparent" />
        <div className="w-full max-w-screen-xl mx-auto px-4 py-4 text-center flex flex-col items-center justify-center">
          <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
            <Shield className="shrink-0 h-4 w-4 text-pmpa-navy opacity-80" />
            <p className="text-[9px] md:text-xs font-extrabold text-pmpa-navy dark:text-white tracking-widest uppercase leading-tight max-w-[280px] md:max-w-none">
              PROGRAMA DE CADASTRO DE EQUIPAMENTOS E SERVIÇOS DA PMPA
            </p>
          </div>
          <div className="text-[9px] md:text-[11px] text-muted-foreground leading-relaxed flex flex-col md:flex-row items-center gap-1 md:gap-2">
            <span>Ditel - Diretoria de Informática e Telecomunicações</span>
            <span className="hidden md:inline opacity-30">|</span>
            <span className="font-black uppercase tracking-[0.2em] text-[8px] md:text-[9px] opacity-40">System Design by Alan Santos</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-pmpa-navy" />
      </footer>

      <Suspense fallback={null}>
        <EqSuporteDialog open={eqSuporteOpen} onOpenChange={setEqSuporteOpen} />
        <EqTelecomDialog open={eqTelecomOpen} onOpenChange={setEqTelecomOpen} />
        <EqUnidadeDialog open={eqUnidadeOpen} onOpenChange={setEqUnidadeOpen} />
      </Suspense>
    </div>
  );
};

export default Index;
