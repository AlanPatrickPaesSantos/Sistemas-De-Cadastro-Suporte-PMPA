import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api-config";
import { toast } from "sonner";
import { Loader2, Send, PenTool } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const TecnicoDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tecnicos: user?.nomeCompleto || user?.username || "",
    solicitante: "",
    def_recla: "",
    solucao: "",
    horario: "",
    horario_saida: "",
    data: new Date().toISOString().split("T")[0],
    categoria: "Serviço Interno"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.solicitante || !formData.def_recla) {
      toast.warning("Preencha os campos obrigatórios (Solicitante e Problema).");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("ditel_token");
      const res = await fetch(`${API_BASE}/missoes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`✅ Chamado Interno O.S ${result.missao.os} criado com sucesso!`);
        // Reset form
        setFormData({
          tecnicos: user?.nomeCompleto || user?.username || "",
          solicitante: "",
          def_recla: "",
          solucao: "",
          horario: "",
          horario_saida: "",
          data: new Date().toISOString().split("T")[0],
          categoria: "Serviço Interno"
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
          <CardHeader className="bg-[#004e9a] text-white p-6 pb-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <PenTool className="h-6 w-6" />
              Missão Interna
            </CardTitle>
            <CardDescription className="text-blue-100 font-medium text-sm">
              Abertura de O.S (Uso Exclusivo Técnico)
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 -mt-4 bg-white dark:bg-slate-900 rounded-t-3xl relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Técnico</Label>
                <Input 
                  name="tecnicos"
                  value={formData.tecnicos}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  className="h-12 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Solicitante <span className="text-red-500">*</span></Label>
                <Input 
                  name="solicitante"
                  value={formData.solicitante}
                  onChange={handleChange}
                  placeholder="Nome de quem chamou"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Problema Constatado <span className="text-red-500">*</span></Label>
                <Textarea 
                  name="def_recla"
                  value={formData.def_recla}
                  onChange={handleChange}
                  placeholder="Descreva o problema..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Solução Adotada</Label>
                <Textarea 
                  name="solucao"
                  value={formData.solucao}
                  onChange={handleChange}
                  placeholder="O que foi feito..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Entrada (Hora)</Label>
                  <Input 
                    type="time"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Saída (Hora)</Label>
                  <Input 
                    type="time"
                    name="horario_saida"
                    value={formData.horario_saida}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-[#004e9a] hover:bg-[#003d7a] text-white font-black text-lg uppercase tracking-widest shadow-lg rounded-xl mt-4"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>
                    <Send className="h-5 w-5 mr-2" /> GRAVAR O.S
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TecnicoDashboard;
