import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api-config";
import { toast } from "sonner";
import { Loader2, Send, PenTool, ChevronLeft, ChevronRight, Plus, Lock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnidadeCombobox } from "@/components/UnidadeCombobox";

const TecnicoDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentOsRecord, setCurrentOsRecord] = useState<any>(null);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [draftFormData, setDraftFormData] = useState<any>(null);
  const [searchOs, setSearchOs] = useState("");

  const [formData, setFormData] = useState(() => {
    // Tenta recuperar rascunho ativo
    const savedDraft = localStorage.getItem("ditel_tecnico_draft");
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch (e) {
        console.error("Erro ao analisar rascunho salvo:", e);
      }
    }

    // Inicialização padrão
    const savedTecnico = localStorage.getItem("ditel_tecnico_name");
    return {
      tecnicos: savedTecnico || "",
      solicitante: "",
      def_recla: "",
      solucao: "",
      horario: "",
      horario_saida: "",
      data: new Date().toISOString().split("T")[0],
      categoria: "interno",
      unidade: "",
      status: "Pendente"
    };
  });

  const isReadOnly = currentOsRecord !== null;

  // Sincroniza rascunho no localStorage
  useEffect(() => {
    if (currentOsRecord === null) {
      localStorage.setItem("ditel_tecnico_draft", JSON.stringify(formData));
    }
  }, [formData, currentOsRecord]);

  // Sincroniza o nome do técnico separadamente para maior conveniência
  useEffect(() => {
    if (formData.tecnicos && currentOsRecord === null) {
      localStorage.setItem("ditel_tecnico_name", formData.tecnicos);
    }
  }, [formData.tecnicos, currentOsRecord]);

  // Carrega nome do usuário atual assim que o AuthContext estiver pronto
  useEffect(() => {
    if (user && !formData.tecnicos) {
      const savedTecnico = localStorage.getItem("ditel_tecnico_name");
      setFormData(prev => ({
        ...prev,
        tecnicos: savedTecnico || user.nomeCompleto || user.username || ""
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Navegar para próximo ou anterior
  const handleNavigate = async (direction: "prev" | "next") => {
    if (isNavLoading) return;

    // Se estiver saindo do rascunho de criação, salva rascunho
    if (currentOsRecord === null) {
      setDraftFormData(formData);
    }

    try {
      let url: string;

      if (currentOsRecord === null) {
        // Buscamos a última O.S no sistema
        const token = localStorage.getItem("ditel_token");
        const res = await fetch(`${API_BASE}/missoes/next-os`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const latestOs = data.nextOs - 1;
        if (latestOs < 1) {
          toast.warning("Não há O.S registradas no sistema.");
          return;
        }

        // Se estamos no modo de criação e clicamos em "Anterior",
        // queremos carregar diretamente a última O.S (sem aplicar "prev" sobre ela)
        if (direction === "prev") {
          url = `${API_BASE}/missoes/${latestOs}`;
        } else {
          url = `${API_BASE}/missoes/${latestOs}/${direction}`;
        }
      } else {
        url = `${API_BASE}/missoes/${currentOsRecord.os}/${direction}`;
      }

      setIsNavLoading(true);
      const token = localStorage.getItem("ditel_token");
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        if (direction === "next" && currentOsRecord) {
          handleNewCall();
          return;
        }
        throw new Error("Fim dos registros");
      }

      const data = await res.json();
      setCurrentOsRecord(data.record);
      setHasPrev(data.hasPrev);
      setHasNext(data.hasNext);

      setFormData({
        tecnicos: data.record.tecnicos || "",
        solicitante: data.record.solicitante || "",
        def_recla: data.record.def_recla || "",
        solucao: data.record.solucao || "",
        horario: data.record.horario || "",
        horario_saida: data.record.horario_saida || "",
        data: data.record.data ? new Date(data.record.data).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        categoria: data.record.categoria || "interno",
        unidade: data.record.unidade || "",
        status: data.record.status || "Pendente"
      });

      toast.success(`Visualizando O.S ${data.record.os}`);
    } catch {
      toast.error("Não há mais missões nesta direção.");
    } finally {
      setIsNavLoading(false);
    }
  };

  const handleSearch = async (osNumberToSearch?: string) => {
    const osToSearch = osNumberToSearch || searchOs;
    if (!osToSearch) return;

    setIsNavLoading(true);
    try {
      const token = localStorage.getItem("ditel_token");
      const res = await fetch(`${API_BASE}/missoes/${osToSearch}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("O.S não encontrada");
      }

      const data = await res.json();
      setCurrentOsRecord(data.record);
      setHasPrev(data.hasPrev);
      setHasNext(data.hasNext);

      setFormData({
        tecnicos: data.record.tecnicos || "",
        solicitante: data.record.solicitante || "",
        def_recla: data.record.def_recla || "",
        solucao: data.record.solucao || "",
        horario: data.record.horario || "",
        horario_saida: data.record.horario_saida || "",
        data: data.record.data ? new Date(data.record.data).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        categoria: data.record.categoria || "interno",
        unidade: data.record.unidade || "",
        status: data.record.status || "Pendente"
      });

      toast.success(`Visualizando O.S ${data.record.os}`);
      setSearchOs("");
    } catch (err) {
      toast.error("O.S não encontrada no sistema.");
    } finally {
      setIsNavLoading(false);
    }
  };

  // Retorna para o Modo de Criação (Novo Chamado)
  const handleNewCall = () => {
    setCurrentOsRecord(null);
    setHasPrev(false);
    setHasNext(false);

    if (draftFormData) {
      setFormData(draftFormData);
      setDraftFormData(null);
      toast.success("Rascunho de O.S restaurado!");
    } else {
      const savedTecnico = localStorage.getItem("ditel_tecnico_name");
      setFormData({
        tecnicos: savedTecnico || user?.nomeCompleto || user?.username || "",
        solicitante: "",
        def_recla: "",
        solucao: "",
        horario: "",
        horario_saida: "",
        data: new Date().toISOString().split("T")[0],
        categoria: "interno",
        unidade: "",
        status: "Pendente"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!formData.solicitante || !formData.def_recla || !formData.unidade) {
      toast.warning("Preencha os campos obrigatórios (Solicitante, Problema e Unidade/Seção).");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("ditel_token");
      const payload = {
        ...formData,
        servico: formData.status === "Concluído" ? "PRONTO" : "PENDENTE"
      };

      const res = await fetch(`${API_BASE}/missoes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`✅ Chamado Interno O.S ${result.missao.os} criado com sucesso!`);
        
        // Remove rascunho após criação bem-sucedida
        localStorage.removeItem("ditel_tecnico_draft");
        const savedTecnico = localStorage.getItem("ditel_tecnico_name");
        
        setFormData({
          tecnicos: savedTecnico || user?.nomeCompleto || user?.username || "",
          solicitante: "",
          def_recla: "",
          solucao: "",
          horario: "",
          horario_saida: "",
          data: new Date().toISOString().split("T")[0],
          categoria: "interno",
          unidade: "",
          status: "Pendente"
        });
      } else {
        toast.error("Erro ao salvar: " + (result.error || "Tente novamente."));
      }
    } catch (err) {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-lg mx-auto p-4 md:p-6 animate-in fade-in duration-500 flex flex-col justify-center">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md dark:bg-slate-900 overflow-hidden rounded-2xl mb-8">
          <CardHeader className="bg-[#004e9a] text-white p-6 pb-8 relative">
            <CardTitle className="text-2xl font-black flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <PenTool className="h-6 w-6 text-blue-100" />
                <span>{isReadOnly ? `O.S ${currentOsRecord?.os}` : "Nova Missão Interna"}</span>
              </div>
              {!isReadOnly && (
                <span className="text-[10px] tracking-widest font-black uppercase text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30 shadow-sm animate-pulse">
                  Novo Chamado
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-blue-100 font-medium text-sm">
              {isReadOnly ? "Modo de Leitura (Histórico)" : "Abertura de O.S (Uso Exclusivo Técnico)"}
            </CardDescription>
          </CardHeader>

          {/* Barra de Pesquisa de O.S */}
          <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Buscar por O.S..."
                value={searchOs}
                onChange={(e) => setSearchOs(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="h-10 pr-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-[#004e9a]"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <Button
              type="button"
              onClick={() => handleSearch()}
              disabled={isNavLoading || !searchOs}
              className="bg-[#004e9a] hover:bg-[#003d7a] text-white px-4 h-10 rounded-xl font-bold text-xs"
            >
              Buscar
            </Button>
          </div>

          {/* Barra de Navegação Rápida entre O.S */}
          <div className="grid grid-cols-3 items-center p-3 border-b bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
            <div className="flex justify-start">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate("prev")}
                disabled={isNavLoading}
                className="text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
            </div>

            <div className="flex justify-center">
              {isReadOnly && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleNewCall}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-8 px-2.5 rounded-lg flex items-center shadow-sm animate-in fade-in zoom-in-90 duration-200"
                >
                  <Plus className="h-3 w-3 mr-1" /> Novo
                </Button>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate("next")}
                disabled={isNavLoading || (!hasNext && !isReadOnly)}
                className="text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              >
                Próximo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          <CardContent className="p-6 bg-white dark:bg-slate-900 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Técnico</Label>
                <Input 
                  name="tecnicos"
                  value={formData.tecnicos}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  disabled={isReadOnly}
                  className={`h-12 ${isReadOnly ? "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Solicitante <span className="text-red-500">*</span></Label>
                <Input 
                  name="solicitante"
                  value={formData.solicitante}
                  onChange={handleChange}
                  placeholder="Nome de quem chamou"
                  disabled={isReadOnly}
                  className={`h-12 ${isReadOnly ? "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tipo de Atendimento <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleSelectChange("categoria", "interno")}
                    className={`py-3 px-4 text-sm font-semibold rounded-xl border transition-all ${formData.categoria === "interno" ? "bg-[#004e9a] text-white border-[#004e9a] shadow-md shadow-[#004e9a]/10" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50"} ${isReadOnly && formData.categoria !== "interno" ? "opacity-40" : ""}`}
                  >
                    Interno (Presencial)
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleSelectChange("categoria", "remoto")}
                    className={`py-3 px-4 text-sm font-semibold rounded-xl border transition-all ${formData.categoria === "remoto" ? "bg-[#004e9a] text-white border-[#004e9a] shadow-md shadow-[#004e9a]/10" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50"} ${isReadOnly && formData.categoria !== "remoto" ? "opacity-40" : ""}`}
                  >
                    Remoto (Anydesk)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Problema Constatado <span className="text-red-500">*</span></Label>
                <Textarea 
                  name="def_recla"
                  value={formData.def_recla}
                  onChange={handleChange}
                  placeholder="Descreva o problema..."
                  disabled={isReadOnly}
                  className={`min-h-[80px] resize-none ${isReadOnly ? "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Solução Adotada</Label>
                <Textarea 
                  name="solucao"
                  value={formData.solucao}
                  onChange={handleChange}
                  placeholder="O que foi feito..."
                  disabled={isReadOnly}
                  className={`min-h-[80px] resize-none ${isReadOnly ? "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200" : ""}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Unidade / Seção <span className="text-red-500">*</span></Label>
                  <UnidadeCombobox 
                    value={formData.unidade} 
                    onChange={(val) => handleSelectChange("unidade", val)} 
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Status <span className="text-red-500">*</span></Label>
                  <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)} disabled={isReadOnly}>
                    <SelectTrigger className={`h-12 ${isReadOnly ? "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200" : ""}`}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Entrada (Hora)</Label>
                  <Input 
                    type="time"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className={`h-12 ${isReadOnly ? "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200" : ""}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Saída (Hora)</Label>
                  <Input 
                    type="time"
                    name="horario_saida"
                    value={formData.horario_saida}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className={`h-12 ${isReadOnly ? "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200" : ""}`}
                  />
                </div>
              </div>

              {isReadOnly ? (
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl text-center shadow-inner mt-4 animate-in slide-in-from-bottom duration-300">
                  <p className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                    <Lock className="h-3.5 w-3.5" /> Modo de Visualização Ativo
                  </p>
                  <p className="text-[11px] font-medium text-amber-600 dark:text-amber-500 mt-1">
                    Técnicos possuem permissão apenas para visualizar chamados anteriores.
                  </p>
                  <Button
                    type="button"
                    onClick={handleNewCall}
                    className="mt-3.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase py-2 h-10 rounded-xl transition-all shadow-md shadow-emerald-500/10"
                  >
                    Abrir Nova O.S (Chamado)
                  </Button>
                </div>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-[#004e9a] hover:bg-[#003d7a] text-white font-black text-lg uppercase tracking-widest shadow-lg rounded-xl mt-4 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <>
                      <Send className="h-5 w-5 mr-2" /> GRAVAR O.S
                    </>
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TecnicoDashboard;
