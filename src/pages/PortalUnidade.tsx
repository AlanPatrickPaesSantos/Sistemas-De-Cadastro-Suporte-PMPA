import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Radio, AlertTriangle, CheckCircle2, Clock, Send, LogOut, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const PortalUnidade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Demanda</label>
                      <Select defaultValue="manutencao_radio">
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

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição Detalhada</label>
                    <Textarea 
                      placeholder="Descreva o problema. Ex: O rádio HT de serial XYZ não está ligando mesmo após troca de bateria." 
                      className="min-h-[150px] bg-slate-50 dark:bg-slate-950 resize-y"
                    />
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

          {/* ABA 2: INVENTÁRIO (SOMENTE LEITURA) */}
          <TabsContent value="inventario">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b">
                <CardTitle className="text-lg">Carga Atual: CPR I (Santarém)</CardTitle>
                <CardDescription>Esta é a visão do DITEL sobre a sua carga. Se houver divergências, abra um chamado.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/80">
                      <tr>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Modelo</th>
                        <th className="px-6 py-4">Quantidade</th>
                        <th className="px-6 py-4 text-center">Status Predominante</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-slate-800">
                        <td className="px-6 py-4 font-bold">Rádio Portátil (HT)</td>
                        <td className="px-6 py-4">Motorola APX 2000</td>
                        <td className="px-6 py-4">45</td>
                        <td className="px-6 py-4 text-center"><Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">Operante</Badge></td>
                      </tr>
                      <tr className="border-b dark:border-slate-800">
                        <td className="px-6 py-4 font-bold">Rádio Móvel (Vtr)</td>
                        <td className="px-6 py-4">Motorola APX 2500</td>
                        <td className="px-6 py-4">12</td>
                        <td className="px-6 py-4 text-center"><Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">Operante</Badge></td>
                      </tr>
                      <tr className="border-b dark:border-slate-800">
                        <td className="px-6 py-4 font-bold">Repetidora</td>
                        <td className="px-6 py-4">Motorola SLR 5300</td>
                        <td className="px-6 py-4">2</td>
                        <td className="px-6 py-4 text-center"><Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-0">1 em Manutenção</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
