import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MapPin, CheckCircle2, MessageSquare, Send, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const PainelDemandas = () => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Dados mockados simulando tickets recebidos
  const chamadosPendentes = [
    {
      id: "DITEL-8472",
      unidade: "CPR I - Santarém",
      tipo: "Falha em Repetidora",
      descricao: "Repetidora de Alter do Chão inoperante desde ontem à noite. Suspeita de queda de energia no site.",
      urgencia: "crítica",
      data: "Há 2 horas",
      status: "Em Análise",
      solicitante: "CAP PM Oliveira",
      contato: "(93) 99123-4567"
    },
    {
      id: "DITEL-8471",
      unidade: "15º BPM - Itaituba",
      tipo: "Manutenção de Rádio",
      descricao: "5 Rádios HT APX 2000 não estão segurando carga na bateria.",
      urgencia: "normal",
      data: "Há 5 horas",
      status: "Em Análise",
      solicitante: "SGT PM Silva",
      contato: "(93) 98888-1111"
    },
    {
      id: "DITEL-8470",
      unidade: "BPRV - Mosqueiro",
      tipo: "Solicitação de Novos Equipamentos",
      descricao: "Necessidade de 10 HTs extras para a Operação Verão.",
      urgencia: "alta",
      data: "Ontem",
      status: "Em Análise",
      solicitante: "TEN PM Costa",
      contato: "(91) 98111-2222"
    }
  ];

  const chartData = [
    { name: 'CPR I', chamados: 12 },
    { name: 'CPR II', chamados: 5 },
    { name: 'CME', chamados: 8 },
    { name: 'BPRV', chamados: 3 },
  ];

  const getUrgenciaBadge = (urgencia: string) => {
    switch (urgencia) {
      case "crítica": return <Badge className="bg-red-500 hover:bg-red-600 animate-pulse border-0">CRÍTICA</Badge>;
      case "alta": return <Badge className="bg-orange-500 hover:bg-orange-600 border-0">ALTA</Badge>;
      default: return <Badge className="bg-blue-500 hover:bg-blue-600 border-0">NORMAL</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mini-Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Demandas por Comando (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[140px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="chamados" fill="#004e9a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900 shadow-sm flex-1">
            <CardContent className="p-4 flex items-center gap-4 h-full">
              <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Alarme Crítico</p>
                <p className="text-3xl font-black text-red-700 dark:text-red-300 leading-none">1</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 shadow-sm flex-1">
            <CardContent className="p-4 flex items-center gap-4 h-full">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Fila de Atendimento</p>
                <p className="text-3xl font-black text-blue-700 dark:text-blue-300 leading-none">14</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-4">
          Caixa de Entrada (Triagem)
        </h2>
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
                        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{chamado.status}</Badge>
                      </div>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {chamado.data}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{chamado.tipo}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{chamado.descricao}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#004e9a] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 inline-flex px-3 py-1.5 rounded-md">
                        <MapPin className="h-3.5 w-3.5" />
                        {chamado.unidade}
                      </div>
                      <div className="text-xs text-slate-500 font-medium hidden sm:block">
                        Solicitante: <strong className="text-slate-700 dark:text-slate-300">{chamado.solicitante}</strong>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 min-w-[150px]">
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-[#004e9a] hover:bg-[#003870] font-bold text-xs" size="sm" onClick={() => setSelectedTicket(chamado)}>
                          ATENDER
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-slate-50 dark:bg-slate-950">
                        <DialogHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-[#004e9a] text-white border-0">{chamado.id}</Badge>
                            {getUrgenciaBadge(chamado.urgencia)}
                          </div>
                          <DialogTitle className="text-xl font-black text-slate-800 dark:text-slate-100">
                            {chamado.tipo}
                          </DialogTitle>
                          <DialogDescription className="text-sm font-medium">
                            Origem: {chamado.unidade} | Solicitante: {chamado.solicitante} | {chamado.contato}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Descrição Original</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{chamado.descricao}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Mudar Status</label>
                              <Select defaultValue="em_atendimento">
                                <SelectTrigger className="bg-white dark:bg-slate-900">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                                  <SelectItem value="aguardando_peca">Aguardando Peça (RMA)</SelectItem>
                                  <SelectItem value="manutencao_externa">Manutenção Externa (Contrato)</SelectItem>
                                  <SelectItem value="concluido">Resolvido / Finalizado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Atribuir Técnico</label>
                              <Select defaultValue="cb_santos">
                                <SelectTrigger className="bg-white dark:bg-slate-900">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cb_santos">CB PM Santos</SelectItem>
                                  <SelectItem value="sgt_costa">SGT PM Costa</SelectItem>
                                  <SelectItem value="sd_oliveira">SD PM Oliveira</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" /> Adicionar Interação (Chat Interno)
                            </label>
                            <div className="flex gap-2">
                              <Textarea placeholder="Digite a solução aplicada ou requisição de informações para a Unidade..." className="h-20 resize-none bg-white dark:bg-slate-900" />
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="sm:justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-4">
                          <p className="text-xs text-slate-400 font-medium">As alterações notificarão a Unidade automaticamente.</p>
                          <Button className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Salvar Alterações
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="w-full text-xs font-bold bg-white dark:bg-slate-900" size="sm">
                      Ver Histórico
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
