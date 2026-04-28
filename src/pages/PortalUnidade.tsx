import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Radio, AlertTriangle, CheckCircle2, Clock, Send, LogOut, ShieldAlert, Monitor, Server, Activity, Wrench, XCircle, UploadCloud, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const PortalUnidade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoDemanda, setTipoDemanda] = useState("manutencao_radio");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Chamado Registrado com Sucesso!",
        description: "O DITEL foi notificado. Protocolo: DITEL-2026-" + Math.floor(Math.random() * 10000),
      });
      // Reset form could go here
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header Simplificado */}
      <header className="bg-[#004e9a] text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-yellow-400" />
            <div>
              <h1 className="font-black text-xl tracking-wider">PORTAL DA UNIDADE</h1>
              <p className="text-xs text-blue-200 font-medium">Comando de Policiamento Regional I - Santarém</p>
            </div>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/20 gap-2" onClick={() => navigate("/login")}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bem-vindo, Oficial.</h2>
          <p className="text-slate-500 dark:text-slate-400">Verifique sua carga ou abra um chamado técnico para o DITEL.</p>
        </div>

        <Tabs defaultValue="chamado" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto h-auto">
            <TabsTrigger value="chamado" className="py-3 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Abrir Chamado
            </TabsTrigger>
            <TabsTrigger value="inventario" className="py-3 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <Radio className="h-4 w-4 mr-2" />
              Meu Inventário Declarado
            </TabsTrigger>
            <TabsTrigger value="historico" className="py-3 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Meus Chamados
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: ABRIR CHAMADO */}
          <TabsContent value="chamado">
            <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none dark:border dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-6">
                <CardTitle className="text-xl text-[#004e9a] dark:text-blue-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Formulário de Solicitação Técnica
                </CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para enviar uma demanda oficial ao DITEL.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dados de Contato */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <User className="h-4 w-4 text-[#004e9a]" /> Nome do Solicitante
                      </label>
                      <Input placeholder="Ex: SGT PM Silva" className="h-12 bg-slate-50 dark:bg-slate-950" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#004e9a]" /> WhatsApp / Contato
                      </label>
                      <Input placeholder="(91) 90000-0000" className="h-12 bg-slate-50 dark:bg-slate-950" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Demanda</label>
                      <Select value={tipoDemanda} onValueChange={setTipoDemanda}>
                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manutencao_radio">Manutenção de Rádio</SelectItem>
                          <SelectItem value="manutencao_repetidora">Falha em Repetidora</SelectItem>
                          <SelectItem value="solicitacao_novo">Solicitação de Novos Equipamentos</SelectItem>
                          <SelectItem value="acessorios">Solicitação de Acessórios (Baterias, Antenas)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nível de Urgência</label>
                      <Select defaultValue="normal">
                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa (Preventiva/Rotina)</SelectItem>
                          <SelectItem value="normal">Normal (Problema isolado)</SelectItem>
                          <SelectItem value="alta">Alta (Impacto parcial no policiamento)</SelectItem>
                          <SelectItem value="critica">Crítica (Comunicação 100% inoperante)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Campos Dinâmicos */}
                  {tipoDemanda === "manutencao_radio" && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 animate-in fade-in zoom-in-95 duration-300">
                      <label className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 block">Número de Série (Tombamento)</label>
                      <Input placeholder="Digite o serial do equipamento com defeito" className="h-12 bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-800" />
                    </div>
                  )}

                  {tipoDemanda === "solicitacao_novo" && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30 animate-in fade-in zoom-in-95 duration-300">
                      <label className="text-sm font-bold text-green-800 dark:text-green-300 mb-2 block">Quantidade Desejada</label>
                      <Input type="number" min="1" placeholder="Ex: 5" className="h-12 bg-white dark:bg-slate-950 border-green-200 dark:border-green-800 w-full sm:w-1/3" />
                      <p className="text-xs text-green-600 mt-2 font-medium">Justifique a necessidade no campo de descrição abaixo.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição Detalhada</label>
                    <Textarea 
                      placeholder="Descreva o problema ou justificativa. Seja o mais claro possível." 
                      className="min-h-[120px] bg-slate-50 dark:bg-slate-950 resize-y"
                    />
                  </div>

                  {/* Mock Upload de Arquivos */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Anexar Evidências (Fotos/Ofícios)</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-6 w-6 text-[#004e9a] dark:text-blue-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Clique para anexar ou arraste os arquivos</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG ou PDF (Máx. 5MB)</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      type="submit" 
                      className="h-12 px-8 bg-[#004e9a] hover:bg-[#003870] text-white font-bold rounded-xl gap-2 w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "ENVIANDO..." : "ENVIAR SOLICITAÇÃO OFICIAL"}
                      {!isSubmitting && <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: INVENTÁRIO DECLARADO (DASHBOARD) */}
          <TabsContent value="inventario" className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Carga Total</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">89</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-900 border border-green-100 dark:border-green-900/50 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-500 mb-1">Em Operação</p>
                    <p className="text-2xl font-black text-green-700 dark:text-green-400">75</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-900 border border-yellow-100 dark:border-yellow-900/50 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-500 mb-1">Manutenção</p>
                    <p className="text-2xl font-black text-yellow-700 dark:text-yellow-400">8</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/50 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500 mb-1">Inoperantes</p>
                    <p className="text-2xl font-black text-red-700 dark:text-red-400">6</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Tabela de Radiocomunicação */}
              <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-4">
                  <div className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                    <CardTitle className="text-lg">Radiocomunicação</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/80 tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Equipamento</th>
                          <th className="px-2 py-3 text-center">Total</th>
                          <th className="px-2 py-3 text-center text-green-600">OPE</th>
                          <th className="px-2 py-3 text-center text-yellow-600">MAN</th>
                          <th className="px-2 py-3 text-center text-red-600">INO</th>
                          <th className="px-4 py-3">Motivo (Inoperantes)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">HT Motorola APX 2000</td>
                          <td className="px-2 py-3 text-center font-black bg-slate-50 dark:bg-slate-800/50">45</td>
                          <td className="px-2 py-3 text-center font-bold text-green-600">40</td>
                          <td className="px-2 py-3 text-center font-bold text-yellow-600">3</td>
                          <td className="px-2 py-3 text-center font-bold text-red-600">2</td>
                          <td className="px-4 py-3 text-xs text-slate-500">Bateria viciada / Display quebrado</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">Rádio Fixo APX 2500</td>
                          <td className="px-2 py-3 text-center font-black bg-slate-50 dark:bg-slate-800/50">12</td>
                          <td className="px-2 py-3 text-center font-bold text-green-600">10</td>
                          <td className="px-2 py-3 text-center font-bold text-yellow-600">1</td>
                          <td className="px-2 py-3 text-center font-bold text-red-600">1</td>
                          <td className="px-4 py-3 text-xs text-slate-500">Falta de Antena Veicular</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">Repetidora SLR 5300</td>
                          <td className="px-2 py-3 text-center font-black bg-slate-50 dark:bg-slate-800/50">2</td>
                          <td className="px-2 py-3 text-center font-bold text-green-600">1</td>
                          <td className="px-2 py-3 text-center font-bold text-yellow-600">1</td>
                          <td className="px-2 py-3 text-center font-bold text-red-600">0</td>
                          <td className="px-4 py-3 text-xs text-slate-500">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Informática */}
              <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                    <CardTitle className="text-lg">Informática e Redes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/80 tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Equipamento</th>
                          <th className="px-2 py-3 text-center">Total</th>
                          <th className="px-2 py-3 text-center text-green-600">OPE</th>
                          <th className="px-2 py-3 text-center text-yellow-600">MAN</th>
                          <th className="px-2 py-3 text-center text-red-600">INO</th>
                          <th className="px-4 py-3">Motivo (Inoperantes)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">Computador Desktop (Sede)</td>
                          <td className="px-2 py-3 text-center font-black bg-slate-50 dark:bg-slate-800/50">25</td>
                          <td className="px-2 py-3 text-center font-bold text-green-600">20</td>
                          <td className="px-2 py-3 text-center font-bold text-yellow-600">2</td>
                          <td className="px-2 py-3 text-center font-bold text-red-600">3</td>
                          <td className="px-4 py-3 text-xs text-slate-500">Placa mãe queimada / Sem HD</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">Notebook Lenovo</td>
                          <td className="px-2 py-3 text-center font-black bg-slate-50 dark:bg-slate-800/50">4</td>
                          <td className="px-2 py-3 text-center font-bold text-green-600">3</td>
                          <td className="px-2 py-3 text-center font-bold text-yellow-600">1</td>
                          <td className="px-2 py-3 text-center font-bold text-red-600">0</td>
                          <td className="px-4 py-3 text-xs text-slate-500">-</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">Switch Cisco 24p</td>
                          <td className="px-2 py-3 text-center font-black bg-slate-50 dark:bg-slate-800/50">1</td>
                          <td className="px-2 py-3 text-center font-bold text-green-600">1</td>
                          <td className="px-2 py-3 text-center font-bold text-yellow-600">0</td>
                          <td className="px-2 py-3 text-center font-bold text-red-600">0</td>
                          <td className="px-4 py-3 text-xs text-slate-500">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <ShieldAlert className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                Os números apresentados acima refletem o controle oficial do sistema DITEL. Se os equipamentos da sua OPM não baterem com essa tabela, por favor, abra um <strong className="font-bold">Chamado de Regularização de Carga</strong> na aba ao lado informando a inconsistência.
              </p>
            </div>
          </TabsContent>

          {/* ABA 3: HISTÓRICO */}
          <TabsContent value="historico">
            <div className="space-y-4">
              {[
                { id: "DITEL-2026-8472", tipo: "Falha em Repetidora", data: "Hoje", status: "Em Análise", cor: "bg-yellow-500" },
                { id: "DITEL-2026-1029", tipo: "Solicitação de Baterias", data: "15/04/2026", status: "Despachado", cor: "bg-blue-500" },
                { id: "DITEL-2026-0041", tipo: "Manutenção Rádio HT", data: "02/03/2026", status: "Finalizado", cor: "bg-green-500" },
              ].map((chamado, i) => (
                <Card key={i} className="border border-slate-200 dark:border-slate-800 hover:border-[#004e9a]/30 transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-500">{chamado.id}</span>
                        <Badge variant="outline" className="text-[10px] uppercase border-slate-200">{chamado.data}</Badge>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">{chamado.tipo}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${chamado.cor}`}></div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{chamado.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default PortalUnidade;
