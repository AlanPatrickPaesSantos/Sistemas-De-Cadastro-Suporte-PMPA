import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MapPin, CheckCircle2 } from "lucide-react";

export const PainelDemandas = () => {
  // Dados mockados simulando tickets recebidos das OPMs
  const chamadosPendentes = [
    {
      id: "DITEL-8472",
      unidade: "CPR I - Santarém",
      tipo: "Falha em Repetidora",
      descricao: "Repetidora de Alter do Chão inoperante desde ontem à noite.",
      urgencia: "crítica",
      data: "Há 2 horas",
    },
    {
      id: "DITEL-8471",
      unidade: "15º BPM - Itaituba",
      tipo: "Manutenção de Rádio",
      descricao: "5 Rádios HT APX 2000 não estão segurando carga na bateria.",
      urgencia: "normal",
      data: "Há 5 horas",
    },
    {
      id: "DITEL-8470",
      unidade: "BPRV - Mosqueiro",
      tipo: "Solicitação de Novos Equipamentos",
      descricao: "Necessidade de 10 HTs extras para a Operação Verão.",
      urgencia: "alta",
      data: "Ontem",
    }
  ];

  const getUrgenciaBadge = (urgencia: string) => {
    switch (urgencia) {
      case "crítica": return <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">CRÍTICA</Badge>;
      case "alta": return <Badge className="bg-orange-500 hover:bg-orange-600">ALTA</Badge>;
      default: return <Badge className="bg-blue-500 hover:bg-blue-600">NORMAL</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
            Central de Demandas Externas
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tickets e solicitações abertas pelas Unidades e CPRs.
          </p>
        </div>
        <div className="flex gap-2">
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase">Críticos</p>
                <p className="text-xl font-black text-red-700 dark:text-red-300 leading-none">1</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Abertos</p>
                <p className="text-xl font-black text-blue-700 dark:text-blue-300 leading-none">14</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {chamadosPendentes.map((chamado) => (
          <Card key={chamado.id} className="border-l-4 overflow-hidden transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-800" style={{ borderLeftColor: chamado.urgencia === 'crítica' ? '#ef4444' : chamado.urgencia === 'alta' ? '#f97316' : '#3b82f6' }}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{chamado.id}</span>
                      {getUrgenciaBadge(chamado.urgencia)}
                    </div>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {chamado.data}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{chamado.tipo}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{chamado.descricao}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-[#004e9a] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 inline-flex px-3 py-1.5 rounded-md">
                    <MapPin className="h-3.5 w-3.5" />
                    {chamado.unidade}
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 min-w-[150px]">
                  <Button className="w-full bg-[#004e9a] hover:bg-[#003870] font-bold text-xs" size="sm">
                    ATENDER
                  </Button>
                  <Button variant="outline" className="w-full text-xs font-bold" size="sm">
                    Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
