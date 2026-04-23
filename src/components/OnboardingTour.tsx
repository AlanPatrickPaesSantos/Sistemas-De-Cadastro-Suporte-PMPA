import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: Step[] = [
  {
    targetId: 'command-center-title',
    title: 'Bem-vindo ao Centro de Comando 🛰️',
    content: 'Este é o coração operacional da Ditel. Projetado para oferecer uma visão tática e analítica completa, este painel consolida todos os indicadores críticos de desempenho e status da rede em um único ambiente de alta performance.',
    position: 'bottom'
  },
  {
    targetId: 'executive-toolbar',
    title: 'Barra de Operações Estratégicas 🛠️',
    content: 'Navegação rápida por módulos. Aqui você gerencia o Cadastro de Equipamentos, monitora enlaces de Telecom, controla o suporte às Unidades e o atendimento técnico. Cada card é uma porta de entrada para fluxos de dados especializados.',
    position: 'bottom'
  },
  {
    targetId: 'widget-manutencao',
    title: 'Monitor de Ativos em Reparo 🔧',
    content: 'Visualização direta do volume de equipamentos em manutenção. **DICA:** Clique neste widget para gerar instantaneamente o Relatório de Equipamentos consolidado desde janeiro, permitindo análise de falhas recorrentes.',
    position: 'top'
  },
  {
    targetId: 'widget-missoes',
    title: 'Indicador de Produtividade Mensal 📈',
    content: 'Métricas de sucesso da equipe no mês vigente. Acompanhe a volumetria de missões finalizadas. Clique para abrir o Relatório de Missão Consolidado e analisar a distribuição de carga horária e tipos de atendimento.',
    position: 'top'
  },
  {
    targetId: 'box-busca-rapida',
    title: 'Motor de Busca Avançada 🔍',
    content: 'Sistema de indexação em tempo real. Localize qualquer item por Número de Série, Unidade Militar, Matrícula de Operador ou Descrição. Resultados instantâneos para suporte crítico e auditoria imediata.',
    position: 'top'
  },
  {
    targetId: 'box-relatorios',
    title: 'Business Intelligence (BI) 📊',
    content: 'Painel analítico para extração de relatórios consolidados. Exporte dados para PDF ou Excel e visualize gráficos de missões por categoria (Interna, Externa ou Remota) para auxiliar na tomada de decisões do Comando.',
    position: 'top'
  },
  {
    targetId: 'header-user-menu',
    title: 'Central de Identidade e Segurança 👤',
    content: 'Gerencie sua sessão aqui. Alterne entre os temas Dark/Light para maior conforto visual e acesse suas credenciais. Lembre-se: o sistema utiliza criptografia ponta-a-ponta para todas as operações.',
    position: 'bottom'
  },
  {
    targetId: 'command-center-title',
    title: 'Atalho Maestro: Ctrl + K ⌨️',
    content: 'Para uma navegação profissional, utilize o atalho **Ctrl + K** em qualquer tela. Ele abre o menu de comando global, permitindo saltar entre módulos e buscar funções sem tirar as mãos do teclado.',
    position: 'bottom'
  }
];

export const OnboardingTour = () => {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const updateCoords = useCallback(() => {
    if (!active) return;
    const target = steps[currentStep].targetId;
    const element = document.getElementById(target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    } else {
      // Se o elemento não existe (ex: Cadastro escondido), pula para o próximo
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setActive(false);
      }
    }
  }, [active, currentStep]);

  useEffect(() => {
    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [updateCoords]);

  useEffect(() => {
    if (active) {
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [active, currentStep]);

  const startTour = () => {
    setCurrentStep(0);
    setActive(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setActive(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Padding para o highlight não ficar colado (respiro)
  const p = 6; 

  return (
    <>
      {!active && (
        <Button
          onClick={startTour}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#004e9a] hover:bg-blue-600 text-white shadow-2xl flex items-center justify-center group transition-all hover:scale-110 active:scale-95 border-4 border-white/20"
          title="Manual do Sistema"
        >
          <Info className="h-7 w-7" />
          <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap tracking-widest">
            Manual do Sistema
          </span>
        </Button>
      )}

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 pointer-events-auto"
              style={{
                clipPath: `polygon(
                  0% 0%, 
                  0% 100%, 
                  ${coords.left - p}px 100%, 
                  ${coords.left - p}px ${coords.top - p}px, 
                  ${coords.left + coords.width + p}px ${coords.top - p}px, 
                  ${coords.left + coords.width + p}px ${coords.top + coords.height + p}px, 
                  ${coords.left - p}px ${coords.top + coords.height + p}px, 
                  ${coords.left - p}px 100%, 
                  100% 100%, 
                  100% 0%
                )`
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{ 
                position: 'fixed',
                top: steps[currentStep].position === 'bottom' ? (coords.top + coords.height + 30) : 
                     steps[currentStep].position === 'top' ? (coords.top - 240) :
                     steps[currentStep].position === 'center' ? '50%' : coords.top,
                left: steps[currentStep].position === 'right' ? (coords.left + coords.width + 30) :
                      steps[currentStep].position === 'left' ? (coords.left - 330) :
                      steps[currentStep].position === 'center' ? '50%' : Math.max(20, Math.min(window.innerWidth - 340, coords.left)),
                transform: steps[currentStep].position === 'center' ? 'translate(-50%, -50%)' : 'none',
              }}
              className="z-[10000] w-[320px] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 pointer-events-auto border-t-4 border-[#004e9a]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-[#004e9a] uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                  Manual: Passo {currentStep + 1} de {steps.length}
                </span>
                <button onClick={() => setActive(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight uppercase tracking-tight">
                {steps[currentStep].title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                {steps[currentStep].content}
              </p>

              <div className="flex items-center justify-between gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex-1 text-slate-500 font-bold uppercase text-[10px] h-10 border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleNext}
                  className="flex-1 bg-[#004e9a] hover:bg-blue-600 text-white font-black uppercase text-[10px] h-10 shadow-lg shadow-blue-500/20"
                >
                  {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'} 
                  {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
