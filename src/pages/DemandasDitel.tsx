import React, { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Inbox, Activity, CheckCircle2, AlertTriangle, MessageSquare, Wrench, Shield, Monitor, Battery, Radio } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE } from "@/lib/api-config";
import { format, startOfDay, subDays } from "date-fns";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

export default function DemandasDitel() {
  const { toast } = useToast();
  const [chamados, setChamados] = useState<any[]>([]);
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDados = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ditel_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resChamados, resRelatorios] = await Promise.all([
        fetch(`${API_BASE}/chamados`, { headers }),
        fetch(`${API_BASE}/relatorios-qualidade`, { headers })
      ]);

      if (resChamados.ok) {
        const data = await resChamados.json();
        setChamados(Array.isArray(data) ? data : data.chamados || []);
      }
      
      if (resRelatorios.ok) {
        const data = await resRelatorios.json();
        setRelatorios(Array.isArray(data) ? data : data.relatorios || []);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao carregar as demandas.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  const handleUpdateChamado = async (id: string, novoStatus: string) => {
    try {
      const token = localStorage.getItem('ditel_token');
      const res = await fetch(`${API_BASE}/chamados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: novoStatus })
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
      
      toast({ title: "Sucesso", description: "Status do chamado atualizado." });
      fetchDados();
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    }
  };

  // --- Processamento de Dados para Gráficos ---
  const stats = useMemo(() => {
    const pendentes = chamados.filter(c => c.status === 'pendente' || c.status === 'em_analise').length;
    const criticos = relatorios.filter(r => r.statusGeral === 'Critica').length;
    
    // Gráfico de Área (Chamados por dia)
    const ultimos7Dias = Array.from({length: 7}).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const label = format(d, 'dd/MM');
      const count = chamados.filter(c => format(new Date(c.dataAbertura || c.createdAt), 'dd/MM') === label).length;
      return { name: label, total: count };
    });

    // Gráfico de Donut (Status Geral)
    const statusData = [
      { name: 'Excelente', value: relatorios.filter(r => r.statusGeral === 'Excelente').length, color: '#10b981' },
      { name: 'Boa', value: relatorios.filter(r => r.statusGeral === 'Boa').length, color: '#3b82f6' },
      { name: 'Com Falhas', value: relatorios.filter(r => r.statusGeral === 'Com falhas').length, color: '#f59e0b' },
      { name: 'Crítica', value: relatorios.filter(r => r.statusGeral === 'Critica').length, color: '#ef4444' },
    ].filter(s => s.value > 0);

    // Gráfico de Barras (Equipamentos por Unidade - Top 5)
    const equipData = relatorios.slice(0, 5).map(r => ({
      name: r.unidade.split(' - ')[1] || r.unidade,
      operantes: (r.equipamentos?.radiosHT?.operantes || 0) + (r.equipamentos?.computadores?.operantes || 0),
      inoperantes: (r.equipamentos?.radiosHT?.inoperantes || 0) + (r.equipamentos?.computadores?.inoperantes || 0),
    }));

    // KPIs Globais
    const totalRadiosOpe = relatorios.reduce((acc, curr) => acc + (curr.equipamentos?.radiosHT?.operantes || 0) + (curr.equipamentos?.radiosMoveis?.operantes || 0), 0);
    const totalComputadoresOpe = relatorios.reduce((acc, curr) => acc + (curr.equipamentos?.computadores?.operantes || 0), 0);
    const totalComputadoresIno = relatorios.reduce((acc, curr) => acc + (curr.equipamentos?.computadores?.inoperantes || 0), 0);

    return { pendentes, criticos, ultimos7Dias, statusData, equipData, totalRadiosOpe, totalComputadoresOpe, totalComputadoresIno };
  }, [chamados, relatorios]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pendente': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'em_analise': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprovado': return 'bg-green-100 text-green-800 border-green-200';
      case 'recusado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header />
      <main className="w-full max-w-7xl mx-auto flex-1 px-4 py-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-3 tracking-tighter">
              DITEL CENTRAL COMMAND
            </h1>
            <p className="text-slate-400 mt-1 font-medium">Gestão de Demandas Estaduais e Inteligência Logística</p>
          </div>
          <div className="flex gap-2">
             <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">V.4.0 ADVANCED</Badge>
             <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1 uppercase tracking-widest">Live State Data</Badge>
          </div>
        </div>

        <Tabs defaultValue="qualidade" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-xl">
            <TabsTrigger value="qualidade" className="py-2.5 px-8 rounded-xl font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
              <Activity className="h-4 w-4 mr-2" /> DASHBOARD ANALÍTICO
            </TabsTrigger>
            <TabsTrigger value="inbox" className="py-2.5 px-8 rounded-xl font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
              <Inbox className="h-4 w-4 mr-2" /> CAIXA DE ENTRADA
              {stats.pendentes > 0 && <Badge variant="destructive" className="ml-2 bg-red-500 animate-pulse">{stats.pendentes}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qualidade" className="space-y-6 animate-in fade-in duration-500">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-600 to-blue-700 border-0 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Inbox className="h-24 w-24" /></div>
                <CardContent className="p-8 relative">
                  <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-1">Chamados Pendentes</p>
                  <h3 className="text-5xl font-black text-white tracking-tighter">{stats.pendentes}</h3>
                  <div className="mt-4 flex items-center gap-2 text-blue-100 text-xs font-bold">
                    <span className="bg-white/20 px-2 py-0.5 rounded">MÉDIA RESPOSTA: 2.5h</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Monitor className="h-24 w-24" /></div>
                <CardContent className="p-8 relative">
                  <p className="text-cyan-50 font-bold uppercase tracking-widest text-xs mb-1">Computadores em Uso</p>
                  <h3 className="text-5xl font-black text-white tracking-tighter">{stats.totalComputadoresOpe}</h3>
                  <p className="mt-4 text-cyan-100 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" /> {stats.totalComputadoresIno} EQUIPAMENTOS PARADOS NO ESTADO
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden group">
                <CardContent className="p-8 relative flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Unidades em Alerta</p>
                    <h3 className="text-5xl font-black text-red-500 tracking-tighter">{stats.criticos}</h3>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-full">
                    <Shield className="h-8 w-8 text-red-500 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 backdrop-blur-md">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" /> Fluxo de Chamados (Últimos 7 Dias)
                  </CardTitle>
                </CardHeader>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.ultimos7Dias}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="bg-slate-900/50 border border-slate-800 p-6 backdrop-blur-md flex flex-col">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" /> Saúde do Estado
                  </CardTitle>
                </CardHeader>
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {stats.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    {stats.statusData.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">{s.name}: {s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* CHARTS ROW 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card className="bg-slate-900/50 border border-slate-800 p-6 backdrop-blur-md">
                <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                    <Radio className="h-5 w-5 text-cyan-400" /> Carga Operacional por Regional
                  </CardTitle>
                </CardHeader>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.equipData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                      <Bar dataKey="operantes" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} name="Operantes" />
                      <Bar dataKey="inoperantes" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={20} name="Inoperantes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="space-y-4">
                <h4 className="font-black text-xs text-slate-500 uppercase tracking-[0.2em]">Últimas Atualizações de Qualidade</h4>
                {relatorios.slice(0, 4).map((rel, i) => (
                  <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-all cursor-default group">
                    <div className={`p-2 rounded-xl ${
                      rel.statusGeral === 'Critica' ? 'bg-red-500/10 text-red-500' : 
                      rel.statusGeral === 'Excelente' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-black text-sm tracking-tight group-hover:text-blue-400 transition-colors">{rel.unidade}</span>
                        <span className="text-[10px] text-slate-500 font-bold">{format(new Date(rel.dataEnvio || new Date()), 'dd/MM/yyyy')}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">"{rel.relatorioLivre}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inbox" className="animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-slate-900/50 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl">
              <CardHeader className="border-b border-slate-800/50 p-8">
                <CardTitle className="text-2xl font-black tracking-tighter">FILA DE ATENDIMENTO</CardTitle>
                <CardDescription className="text-slate-500">Gestão integrada de protocolos de suporte técnico das OPMs.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>
                ) : chamados.length === 0 ? (
                  <div className="text-center p-20 text-slate-500 font-bold italic">Nenhum chamado pendente no momento.</div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {chamados.map((chamado) => (
                      <div key={chamado._id} className="p-8 hover:bg-white/[0.02] transition-all flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4 flex-wrap">
                            <Badge className="font-black tracking-widest bg-blue-600 text-white px-3 py-1 rounded-md">{chamado.protocolo}</Badge>
                            <span className="font-black text-xl text-slate-100 tracking-tight">{chamado.unidadeSolicitante}</span>
                            <Badge variant="outline" className={`font-black uppercase tracking-widest text-[10px] py-1 px-3 ${getStatusColor(chamado.status)}`}>
                              {chamado.status.replace('_', ' ')}
                            </Badge>
                            {chamado.urgencia === 'critica' && <Badge className="bg-red-500 text-white font-black animate-pulse px-3 py-1">CRÍTICO</Badge>}
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50">
                            <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Demanda</p>
                              <p className="font-bold text-sm flex items-center gap-2"><Wrench className="w-4 h-4 text-blue-400"/> {(chamado.tipoDemanda || 'outro').replace(/_/g, ' ').toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Solicitante</p>
                              <p className="font-bold text-sm">{chamado.nomeSolicitante}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Contato</p>
                              <p className="font-bold text-sm">{chamado.contato}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Data de Abertura</p>
                              <p className="font-bold text-sm">{format(new Date(chamado.dataAbertura || new Date()), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                          </div>

                          <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl">
                             <p className="text-slate-400 text-sm leading-relaxed">
                               <strong className="text-blue-400 uppercase text-[10px] font-black tracking-widest block mb-2">Relato da Unidade:</strong> 
                               {chamado.descricao}
                             </p>
                          </div>
                        </div>

                        <div className="w-full md:w-56 shrink-0 flex flex-col gap-3 justify-center border-l border-slate-800/50 pl-0 md:pl-8">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Controle DITEL</p>
                          <Select value={chamado.status} onValueChange={(val) => handleUpdateChamado(chamado._id, val)}>
                            <SelectTrigger className="w-full bg-slate-950 border-slate-800 h-12 font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_analise">Em Análise</SelectItem>
                              <SelectItem value="aprovado">Aprovado</SelectItem>
                              <SelectItem value="recusado">Recusado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" className="w-full h-12 gap-2 border-slate-800 hover:bg-white/5 font-black text-xs uppercase" onClick={() => window.open(`https://wa.me/55${(chamado.contato || '').replace(/\D/g, '')}`, '_blank')}>
                            <MessageSquare className="w-4 h-4 text-green-500" /> Whatsapp Oficial
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

