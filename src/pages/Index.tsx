import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";

import { ConsultasSection } from "@/components/ConsultasSection";
// Lazy load components that are not needed immediately
const RelatoriosSection = lazy(() => import("@/components/RelatoriosSection").then(m => ({ default: m.RelatoriosSection })));
const EqSuporteDialog = lazy(() => import("@/components/EqSuporteDialog").then(m => ({ default: m.EqSuporteDialog })));
const EqTelecomDialog = lazy(() => import("@/components/EqTelecomDialog").then(m => ({ default: m.EqTelecomDialog })));
const EqUnidadeDialog = lazy(() => import("@/components/EqUnidadeDialog").then(m => ({ default: m.EqUnidadeDialog })));

import { Database, Headphones, Phone, Building, Server, Shield, Wrench, Activity, Loader2 } from "lucide-react";
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


      <main className="w-full max-w-screen-xl mx-auto flex-1 px-4 md:px-6 pt-6 md:pt-8 pb-12">

        <div className="relative z-10 w-full mb-10">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 px-1 md:px-0">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm">Centro de Comando</h2>
            </div>
          </div>

          {/* PREMIUM ACTION CARDS (Top Row - 5 Buttons) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            
            {/* Cadastro */}
            <div 
              onClick={() => navigate("/cadastro")} 
              className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-5 cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-50 dark:border-slate-800 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] flex items-center justify-center group-hover:bg-[#004e9a] transition-all duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3">
                <Database className="w-10 h-10 text-[#004e9a] dark:text-blue-400 group-hover:text-white transition-colors duration-500" />
              </div>
              <div className="relative z-10 text-center">
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight group-hover:text-[#004e9a] dark:group-hover:text-blue-300 transition-colors">Cadastro</span>
              </div>
            </div>

            {/* Serv_Int_Ext */}
            <div 
              onClick={() => navigate("/servico-interno-externo")} 
              className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-5 cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-50 dark:border-slate-800 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] flex items-center justify-center group-hover:bg-[#004e9a] transition-all duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3">
                <Server className="w-10 h-10 text-[#004e9a] dark:text-blue-400 group-hover:text-white transition-colors duration-500" />
              </div>
              <div className="relative z-10 text-center">
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight group-hover:text-[#004e9a] dark:group-hover:text-blue-300 transition-colors">Serv_Int_Ext</span>
              </div>
            </div>

            {/* Telecom */}
            <div 
              onClick={() => setEqTelecomOpen(true)} 
              className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-5 cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-50 dark:border-slate-800 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] flex items-center justify-center group-hover:bg-[#004e9a] transition-all duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3">
                <Phone className="w-10 h-10 text-[#004e9a] dark:text-blue-400 group-hover:text-white transition-colors duration-500" />
              </div>
              <div className="relative z-10 text-center">
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight group-hover:text-[#004e9a] dark:group-hover:text-blue-300 transition-colors">Telecom</span>
              </div>
            </div>

            {/* Unidade */}
            <div 
              onClick={() => setEqUnidadeOpen(true)} 
              className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-5 cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-50 dark:border-slate-800 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] flex items-center justify-center group-hover:bg-[#004e9a] transition-all duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3">
                <Building className="w-10 h-10 text-[#004e9a] dark:text-blue-400 group-hover:text-white transition-colors duration-500" />
              </div>
              <div className="relative z-10 text-center">
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight group-hover:text-[#004e9a] dark:group-hover:text-blue-300 transition-colors">Unidade</span>
              </div>
            </div>

            {/* Suporte */}
            <div 
              onClick={() => setEqSuporteOpen(true)} 
              className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-5 cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-50 dark:border-slate-800 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] flex items-center justify-center group-hover:bg-[#004e9a] transition-all duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3">
                <Headphones className="w-10 h-10 text-[#004e9a] dark:text-blue-400 group-hover:text-white transition-colors duration-500" />
              </div>
              <div className="relative z-10 text-center">
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight group-hover:text-[#004e9a] dark:group-hover:text-blue-300 transition-colors">Suporte</span>
              </div>
            </div>

          </div>

          {/* DASHBOARD STATS WIDGETS (Bottom Row) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            
            {/* Widget: Manutenção */}
            <div 
              onClick={() => {
                const now = new Date();
                const yearStart = `${now.getFullYear()}-01-01`;
                const yearEnd = `${now.getFullYear()}-12-31`;
                setExternalReportTrigger({ id: "Rel_Equipamentos", dateRange: { start: yearStart, end: yearEnd } });
              }}
              className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-7 cursor-pointer shadow-sm transition-all duration-300 hover:shadow-xl hover:border-red-400/30"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl group-hover:bg-red-100 transition-colors">
                  <Wrench className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none mb-1">
                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-red-500/50" /> : stats.maintenance}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Equipamentos em Manutenção</p>
                </div>
              </div>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                <Wrench className="w-24 h-24 text-red-600" />
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
              className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-7 cursor-pointer shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-400/30"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl group-hover:bg-blue-100 transition-colors">
                  <Activity className="w-7 h-7 text-[#004e9a]" />
                </div>
                <div>
                  <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none mb-1">
                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-blue-500/50" /> : stats.missions}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Missões Registradas (Mês)</p>
                </div>
              </div>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                <Activity className="w-24 h-24 text-[#004e9a]" />
              </div>
            </div>

          </div>

          {/* Main Content Grid */}
          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            <ConsultasSection />
            <Suspense fallback={
              <div className="flex items-center justify-center p-12 bg-card border border-border/60 rounded-2xl animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-pmpa-navy/20" />
              </div>
            }>
              <RelatoriosSection externalTrigger={externalReportTrigger} onTriggerClean={() => setExternalReportTrigger(null)} />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-white/80 dark:bg-slate-900 relative border-t border-slate-200 dark:border-slate-800">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#004e9a]/20 to-transparent" />
        <div className="w-full max-w-screen-xl mx-auto px-4 py-3 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="shrink-0 h-4 w-4 text-pmpa-navy opacity-80" />
            <p className="text-[10px] md:text-xs font-extrabold text-pmpa-navy dark:text-white tracking-widest uppercase leading-tight">
              PROGRAMA DE CADASTRO DE EQUIPAMENTOS E SERVIÇOS DA PMPA
            </p>
          </div>
          <p className="text-[10px] md:text-[11px] text-muted-foreground leading-relaxed flex items-center gap-2">
            Ditel - Diretoria de Informática e Telecomunicações.
            <span className="opacity-30">|</span>
            <span className="font-black uppercase tracking-[0.3em] text-[9px] opacity-40 hover:opacity-100 transition-opacity cursor-default">System Design by Alan Santos</span>
          </p>
        </div>
        {/* Linha fina azul marinho no fundo para dar um acabamento PMPA igual ao header */}
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
