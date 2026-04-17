import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NavigationCard } from "@/components/NavigationCard";
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
        const yearStart = `${now.getFullYear()}-01-01`;
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        // Busca Manutenções (Pendentes desde o início do ano)
        const [servPentoResp, servProntoResp, missResp] = await Promise.all([
          fetch(`${API_BASE}/servicos/count?status=PENDENTE&startDate=${yearStart}`),
          fetch(`${API_BASE}/servicos/count?status=PRONTO&startDate=${yearStart}`),
          fetch(`${API_BASE}/missoes/count?startDate=${firstDay}&endDate=${lastDay}`)
        ]);

        if (servPentoResp.ok && servProntoResp.ok && missResp.ok) {
          const pentoData = await servPentoResp.json();
          const prontoData = await servProntoResp.json();
          const missData = await missResp.json();
          setStats({
            maintenance: pentoData.count || 0,
            ready: prontoData.count || 0,
            missions: missData.total || 0
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />


      <main className="container flex-1 px-6 pt-6 pb-12 relative overflow-hidden">
        {/* Dynamic Abstract Vercel/Linear-style Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#004e9a]/10 dark:bg-[#004e9a]/20 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none z-0 mix-blend-multiply dark:mix-blend-lighten" />
        
        {/* Subtle Watermark Overlay */}
        <div className="absolute bottom-10 right-10 opacity-[0.02] dark:opacity-[0.03] pointer-events-none z-0">
          <img src="/logo-pmpa.png" alt="PMPA Watermark" className="w-[500px] h-auto grayscale" />
        </div>

        <div className="relative z-10 w-full">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/40 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/60 dark:border-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#004e9a] animate-pulse" />
                <span className="text-[10px] font-bold text-[#004e9a] dark:text-blue-400 uppercase tracking-widest">Sistema Operacional Online</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm">Painel de Controle</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Acesso corporativo às ferramentas do DITEL</p>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
            <NavigationCard icon={Database} title="Cadastro" onClick={() => navigate("/cadastro")} />
            <NavigationCard icon={Server} title="Serviço Int/Ext" onClick={() => navigate("/servico-interno-externo")} />
            <NavigationCard icon={Phone} title="Telecom" onClick={() => setEqTelecomOpen(true)} />
            <NavigationCard icon={Building} title="Unidade" onClick={() => setEqUnidadeOpen(true)} />
            <NavigationCard icon={Headphones} title="Suporte" onClick={() => setEqSuporteOpen(true)} />
          </div>

          <div className="mb-6 mt-10">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm">Visão Geral</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent ml-4" />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Acompanhamento e estatísticas operacionais</p>
          </div>

          {/* Dashboard Widgets */}
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {/* Widget 1: Manutenção */}
            <div 
              onClick={() => {
                const now = new Date();
                const yearStart = `${now.getFullYear()}-01-01`;
                const yearEnd = `${now.getFullYear()}-12-31`;
                setExternalReportTrigger({ 
                  id: "Rel_Equipamentos", 
                  dateRange: { start: yearStart, end: yearEnd } 
                });
              }}
              className="group bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-white/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(220,38,38,0.15)] transition-all duration-500 relative overflow-hidden cursor-pointer hover:-translate-y-1 active:scale-[0.98] backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute right-[-24px] bottom-[-24px] opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                <Wrench className="w-48 h-48 text-red-600" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:border-red-100 dark:group-hover:border-red-800 transition-colors duration-500">
                    <Wrench className="w-8 h-8 text-slate-400 group-hover:text-red-500 transition-colors duration-500" />
                  </div>
                  <span className="text-[11px] font-black text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">Ativo</span>
                </div>
                <div>
                  <p className="text-5xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3 tracking-tighter">
                    {isLoading ? <Loader2 className="h-10 w-10 animate-spin text-red-500/50" /> : stats.maintenance}
                  </p>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Painel de Manutenção</p>
                </div>
              </div>
            </div>

            {/* Widget 2: Serviços Int/Ext Mês */}
            <div 
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                setExternalReportTrigger({ 
                  id: "Rel_Missao_Consolidado", 
                  dateRange: { start: firstDay, end: lastDay } 
                });
              }}
              className="group bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-white/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,78,154,0.15)] transition-all duration-500 relative overflow-hidden cursor-pointer hover:-translate-y-1 active:scale-[0.98] backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#004e9a] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute right-[-24px] bottom-[-24px] opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                <Activity className="w-48 h-48 text-[#004e9a]" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-colors duration-500">
                    <Activity className="w-8 h-8 text-slate-400 group-hover:text-[#004e9a] transition-colors duration-500" />
                  </div>
                  <span className="text-[11px] font-black text-[#004e9a] bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">Neste Mês</span>
                </div>
                <div>
                  <p className="text-5xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3 tracking-tighter">
                    {isLoading ? <Loader2 className="h-10 w-10 animate-spin text-[#004e9a]/50" /> : stats.missions}
                  </p>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Missões Registradas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-4">
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
        <div className="container px-6 py-3 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="h-4 w-4 text-pmpa-navy opacity-80 translate-y-[-1px]" />
            <p className="text-xs font-extrabold text-pmpa-navy dark:text-white tracking-widest uppercase">
              PROGRAMA DE CADASTRO DE EQUIPAMENTOS E SERVIÇOS DA PMPA
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Use este sistema corporativo para controlar a entrada e saída de equipamentos com máxima segurança e rastreabilidade. Ditel - Diretoria de Informática e Telecomunicações.
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
