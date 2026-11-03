import { useState, useEffect } from "react"; // Final stabilization v33.3
// Final stabilization v33.3
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Settings, ChevronRight, Loader2, Search, X, Activity, Printer, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CadastroForm } from "./CadastroForm";
import { ServicoInternoExternoForm } from "./ServicoInternoExternoForm";
import { API_BASE } from "../lib/api-config";
import { LaudoPrint } from "./LaudoPrint";
import { UnidadeCombobox } from "./UnidadeCombobox";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface RelatoriosSectionProps {
  externalTrigger?: { id: string; dateRange?: { start: string; end: string }; q?: string; status?: string } | null;
  onTriggerClean?: () => void;
}
type ReportRecord = { Id_cod?: number; os?: number; Data_Saida?: string; saidaEquip?: string; data?: string; Data_Ent?: string; servico?: string; Serviço?: string; [key: string]: unknown };
type Rankings = { unidades: unknown[]; servicos: unknown[]; defeitos: unknown[] };

// Auxiliares de Formatação fora do componente para evitar re-criação
const getFormattedDate = (item: ReportRecord) => {
  const d = item.Data_Saida || item.saidaEquip || item.data || item.Data_Ent;
  if (!d) return "---";
  if (typeof d === 'string' && d.includes('/')) return d.split(' ')[0];
  const date = new Date(d);
  return isNaN(date.getTime()) ? "---" : date.toLocaleDateString('pt-BR');
};

const getStatusStyle = (item: ReportRecord) => {
  const val = String(item.servico || item.Serviço || "").toLowerCase();
  if (val.includes("externo")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (val.includes("interno")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  if (val.includes("remoto")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
  if (val.includes("pronto")) return "bg-green-500/10 text-green-600 dark:text-green-400";
  return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
};

type EquipmentPrintFilters = { startDate: string; endDate: string };
type EquipmentQueryFilters = EquipmentPrintFilters & { q: string; status: string; unidade: string; bateria: boolean; garantia: boolean };
type EquipmentPage<T> = { records: T[]; total: number };

export const getEquipmentPrintFilters = (
  lastCompletedDateFilters: EquipmentPrintFilters | null,
  currentDateFilters: EquipmentPrintFilters,
) => lastCompletedDateFilters || currentDateFilters;

export const getEquipmentPrintQueryParams = (filters: EquipmentQueryFilters) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.unidade) params.set("unidade", filters.unidade);
  if (filters.bateria) params.set("bateria", "true");
  if (filters.garantia) params.set("garantia", "true");
  return params;
};

export const fetchAllEquipmentPages = async <T,>(
  fetchPage: (page: number) => Promise<EquipmentPage<T>>,
  pageSize = 100,
) => {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error("Tamanho de página inválido.");
  const first = await fetchPage(1);
  if (!Number.isInteger(first.total) || first.total < 0) throw new Error("A API não informou uma contagem total válida.");
  const records = [...first.records];
  if (records.length > first.total) throw new Error("A API retornou mais registros que o total informado.");
  const pageCount = Math.ceil(first.total / pageSize);
  for (let page = 2; page <= pageCount; page += 1) {
    const result = await fetchPage(page);
    if (result.total !== first.total) throw new Error("A quantidade total mudou durante a geração. Faça uma nova pesquisa.");
    records.push(...result.records);
  }
  if (records.length !== first.total) {
    throw new Error("Relatório incompleto: a API informou " + first.total + " registros, mas " + records.length + " foram carregados.");
  }
  return records;
};

const escapePrintHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const printValue = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text ? escapePrintHtml(text) : "—";
};

const formatPrintDate = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (!text) return "—";
  if (/^\d{2}\/\d{2}\/\d{4}/.test(text)) return escapePrintHtml(text.split(" ")[0]);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return printValue(text);
  return String(date.getUTCDate()).padStart(2, "0") + "/" +
    String(date.getUTCMonth() + 1).padStart(2, "0") + "/" + date.getUTCFullYear();
};

const formatSelectedDate = (value: string, fallback: string) => value ? formatPrintDate(value + "T00:00:00.000Z") : fallback;
const equipmentLabel = (item: ReportRecord) => item.T_EquipSuporte || item.T_EquipTelecom || item.Equipamento || "Não informado";
const equipmentStatus = (item: ReportRecord) => String(item.Serviço || item.servico || "Não informado").trim() || "Não informado";

const countEquipmentBy = (records: ReportRecord[], getLabel: (item: ReportRecord) => unknown) => {
  const counts = new Map<string, number>();
  records.forEach((item) => {
    const label = String(getLabel(item) ?? "").trim() || "Não informado";
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "pt-BR")).slice(0, 6);
};

const analyticsRows = (entries: [string, number][], total: number) => {
  const visibleEntries = entries.slice(0, 5);
  const remaining = entries.slice(5).reduce((sum, entry) => sum + entry[1], 0);
  if (remaining > 0) visibleEntries.push(["Outros", remaining]);
  return visibleEntries.map(([label, count]) => {
  const percent = total ? Math.round((count / total) * 100) : 0;
  return '<div class="metric"><div><span>' + printValue(label) + '</span><b>' + count +
    ' <small>(' + percent + '%)</small></b></div><i><span style="width:' + Math.max(2, percent) + '%"></span></i></div>';
}).join("");
};

export const buildEquipmentPrintHtml = (records: ReportRecord[], dateFilters: EquipmentPrintFilters, logoBase: string) => {
  const total = records.length;
  const statuses = countEquipmentBy(records, equipmentStatus);
  const units = countEquipmentBy(records, (item) => item.Unidade);
  const types = countEquipmentBy(records, equipmentLabel);
  const batteries = countEquipmentBy(records, (item) => String(item.Bateria ?? "").trim() ? "Informada" : "Não informada");
  const warranties = countEquipmentBy(records, (item) => /^sim$/i.test(String(item.Garantia ?? "").trim()) ? "Em garantia" : "Fora/sem garantia");
  const ready = records.filter((item) => /^pronto$/i.test(equipmentStatus(item))).length;
  const pending = records.filter((item) => /^pendente$/i.test(equipmentStatus(item))).length;
  const laudo = records.filter((item) => /^laudo$/i.test(equipmentStatus(item))).length;
  const cards = records.map((item) => {
    return '<article class="equipment-card"><header><div><small>ORDEM DE SERVIÇO</small><strong>#' + printValue(item.Id_cod) +
      '</strong></div><span class="status">' + printValue(equipmentStatus(item)) + '</span></header><h3>' + printValue(equipmentLabel(item)) +
      '</h3><div class="fields">' +
      '<div><small>Unidade</small><b>' + printValue(item.Unidade) + '</b></div>' +
      '<div><small>Data de entrada</small><b>' + formatPrintDate(item.Data_Ent) + '</b></div>' +
      '<div><small>RP</small><b>' + printValue(item.RP) + '</b></div>' +
      '<div><small>Nº de série</small><b>' + printValue(item["Nº_Serie"]) + '</b></div>' +
      '<div><small>Técnico</small><b>' + printValue(item.Tecnico) + '</b></div>' +
      '<div><small>Garantia</small><b>' + printValue(item.Garantia) + '</b></div>' +
      '<div><small>Bateria</small><b>' + printValue(item.Bateria) + '</b></div>' +
      '<div><small>Data de envio</small><b>' + formatPrintDate(item.Data_Envio) + '</b></div>' +
      '<div><small>Data de retorno</small><b>' + formatPrintDate(item.Data_Retorno) + '</b></div>' +
      '<div><small>Data de saída</small><b>' + formatPrintDate(item.Data_Saida || item.saidaEquip) + '</b></div></div>' +
      '<div class="notes"><div><small>Defeito reclamado</small><p>' + printValue(item.Defeito_Recl) + '</p></div>' +
      '<div><small>Análise técnica</small><p>' + printValue(item.Analise_Tecnica) + '</p></div></div></article>';
  }).join("");

  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8" />' +
    '<title>Relatório de Equipamentos - PMPA/DITEL</title><style>' +
    '@page{size:A4 portrait;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#172033;font:9pt Arial,sans-serif;line-height:1.4}' +
    '.header{display:flex;align-items:center;gap:14px;border-bottom:1.2pt solid #172033;padding-bottom:10px}' +
    '.logo{width:58px;height:58px;object-fit:contain}.ditel{width:76px;height:58px;object-fit:contain}' +
    '.header-text{flex:1;text-align:center;font-size:7.5pt;font-weight:bold;line-height:1.35;text-transform:uppercase}.header-text strong{display:block;font-size:10pt;margin-top:3px}' +
    'h1{text-align:center;font-size:15pt;margin:15px 0 4px;text-transform:uppercase}.subtitle{text-align:center;color:#64748b;font-size:8pt;margin-bottom:12px}' +
    '.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;border:1px solid #dbe3ed;padding:9px;margin-bottom:16px;font-size:8pt}.meta b{display:block;color:#64748b;font-size:7pt;text-transform:uppercase}' +
    '.section-title{margin:18px 0 9px;padding-left:8px;border-left:3px solid #004e9a;font-size:10pt;text-transform:uppercase}' +
    '.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}.summary div{border:1px solid #dbe3ed;padding:9px;border-radius:6px}.summary strong{display:block;color:#004e9a;font-size:17pt}.summary span{font-size:7pt;font-weight:bold;text-transform:uppercase;color:#475569}' +
    '.analytics{display:grid;grid-template-columns:1fr 1fr;gap:10px}.panel{border:1px solid #dbe3ed;padding:9px;border-radius:6px;break-inside:avoid}.panel h3{font-size:8pt;text-transform:uppercase;margin:0 0 8px}' +
    '.metric{margin:7px 0}.metric>div{display:flex;justify-content:space-between;gap:8px;font-size:7.5pt}.metric small{color:#64748b;font-weight:normal}.metric i{display:block;height:6px;background:#edf2f7;border-radius:5px;overflow:hidden;margin-top:3px}.metric i span{display:block;height:100%;background:#1769aa}' +
    '.equipment-card{border:1px solid #cbd5e1;border-radius:7px;padding:10px 11px;margin-bottom:10px;break-inside:avoid;page-break-inside:avoid}.equipment-card header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:7px}.equipment-card header small,.fields small,.notes small{display:block;color:#64748b;font-size:6.5pt;font-weight:bold;text-transform:uppercase}.equipment-card header strong{display:block;color:#004e9a;font-size:12pt}.status{border:1px solid #bfdbfe;background:#eff6ff;color:#1e40af;border-radius:20px;padding:3px 8px;font-size:7pt;font-weight:bold;text-transform:uppercase}.equipment-card h3{margin:7px 0 8px;font-size:10pt}' +
    '.fields{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 12px}.fields b{display:block;font-size:8pt;margin-top:2px;overflow-wrap:anywhere}.notes{display:grid;grid-template-columns:1fr 1fr;gap:10px;border-top:1px solid #e2e8f0;margin-top:9px;padding-top:8px}.notes p{font-size:7.5pt;margin:3px 0;overflow-wrap:anywhere;white-space:pre-wrap}.page-break{break-before:page;page-break-before:always}.footer{margin-top:14px;border-top:1px solid #cbd5e1;padding-top:7px;text-align:center;color:#64748b;font-size:7pt}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}' +
    '</style></head><body><header class="header"><img class="logo" src="' + escapePrintHtml(logoBase) + '/logo-pmpa.png" alt="PMPA" />' +
    '<div class="header-text"><div>GOVERNO DO ESTADO DO PARÁ</div><div>SECRETARIA DE ESTADO DE SEGURANÇA PÚBLICA E DEFESA SOCIAL</div><div>POLÍCIA MILITAR DO PARÁ</div><div>DEPARTAMENTO GERAL DE ADMINISTRAÇÃO</div><strong>DIRETORIA DE TELEMÁTICA</strong></div>' +
    '<img class="ditel" src="' + escapePrintHtml(logoBase) + '/Logo Ditel.jpeg" alt="DITEL" /></header>' +
    '<h1>Relatório de Equipamentos</h1><div class="subtitle">Dashboard consolidado e relação individual</div>' +
    '<div class="meta"><div><b>Período pesquisado</b>' + formatSelectedDate(dateFilters.startDate, "Início") + ' — ' + formatSelectedDate(dateFilters.endDate, "Fim") +
    '</div><div><b>Total de registros</b>' + total + '</div><div><b>Emissão</b>' + new Date().toLocaleDateString("pt-BR") + '</div></div>' +
    '<h2 class="section-title">1. Dashboard consolidado</h2><div class="summary">' +
    '<div><strong>' + total + '</strong><span>Total de O.S.</span></div><div><strong>' + ready + '</strong><span>Prontos</span></div>' +
    '<div><strong>' + pending + '</strong><span>Pendentes</span></div><div><strong>' + laudo + '</strong><span>Em laudo</span></div></div>' +
    '<div class="analytics"><div class="panel"><h3>Distribuição por situação</h3>' + analyticsRows(statuses,total) + '</div>' +
    '<div class="panel"><h3>Equipamentos por unidade</h3>' + analyticsRows(units,total) + '</div><div class="panel"><h3>Tipos de equipamento</h3>' + analyticsRows(types,total) + '</div>' +
    '<div class="panel"><h3>Condições de bateria</h3>' + analyticsRows(batteries,total) + '</div><div class="panel"><h3>Situação da garantia</h3>' + analyticsRows(warranties,total) + '</div></div>' +
    '<h2 class="section-title page-break">2. Relação individual dos equipamentos (' + total + ')</h2>' + cards +
    '<div class="footer">PMPA | Diretoria de Telemática — documento gerado a partir dos resultados completos da pesquisa.</div>' +
    '<script>let printed=false;const printOnce=()=>{if(printed)return;printed=true;window.print()};window.onload=()=>setTimeout(printOnce,350);setTimeout(printOnce,1500);window.onafterprint=()=>window.close();</script></body></html>';
};

export const RelatoriosSection = ({ externalTrigger, onTriggerClean }: RelatoriosSectionProps) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [results, setResults] = useState<ReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", q: "", status: "", unidade: "", bateria: false, garantia: false });
  const [lastCompletedDateFilters, setLastCompletedDateFilters] = useState<EquipmentPrintFilters | null>(null);
  const [lastCompletedEquipmentFilters, setLastCompletedEquipmentFilters] = useState<EquipmentQueryFilters | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ReportRecord | null>(null);
  const { user } = useAuth();
  const isViewer = user?.papel === 'visualizador';
  const [stats, setStats] = useState<{
    total: number;
    interno: number;
    externo: number;
    remoto: number;
    pendente: number;
    pronto: number;
    laudo: number;
    bateria: number;
    garantia: number;
    manutencaoTotal?: number;
    manutencaoProntas?: number;
    rankings?: Rankings;
  }>({ total: 0, interno: 0, externo: 0, remoto: 0, pendente: 0, pronto: 0, laudo: 0, bateria: 0, garantia: 0 });

  const [printType, setPrintType] = useState<'laudo' | 'saida' | 'entrada'>('laudo');

  // Gatilho Externo (vido do Dashboard)
  useEffect(() => {
    if (externalTrigger && externalTrigger.id) {
      const start = externalTrigger.dateRange?.start || "";
      const end = externalTrigger.dateRange?.end || "";
      const query = externalTrigger.q || "";
      const statusValue = externalTrigger.status || "";

      setFilters({ startDate: start, endDate: end, q: query, status: statusValue, unidade: "", bateria: false, garantia: false });
      setActiveReport(externalTrigger.id);

      // Pequeno delay para garantir que os estados foram aplicados antes da busca
      setTimeout(() => {
        handleGenerateReportFromParams(start, end, query, statusValue);
      }, 100);

      onTriggerClean?.();
    }
  }, [externalTrigger]);

  // Função unificada para busca de dados (Estatísticas + Lista)
  const fetchReportData = async (start: string, end: string, reportId: string, queryText?: string, statusText?: string) => {
    setIsLoading(true);
    try {
      const isMissions = reportId === "Rel_Missao_Consolidado";
      const isEquipments = reportId === "Rel_Equipamentos";
      const endpoint = isMissions ? "missoes" : "servicos";

      // Se houver statusText ou filters.status, usamos ele estritamente
      // Caso contrário, se for relatórios de missões ou específico, o statusParam fica vazio.
      const currentStatus = statusText !== undefined ? statusText : filters.status;
      const statusParam = currentStatus ? `&status=${currentStatus}` : (isMissions || isEquipments ? "" : "&status=PENDENTE");

      const currentQ = queryText !== undefined ? queryText : filters.q;
      const searchQuery = currentQ ? `&q=${encodeURIComponent(currentQ)}` : "";

      const currentUnidade = filters.unidade;
      const unidadeParam = currentUnidade ? `&unidade=${encodeURIComponent(currentUnidade)}` : "";

      const currentBateria = filters.bateria;
      const bateriaParam = currentBateria ? "&bateria=true" : "";

      const currentGarantia = filters.garantia;
      const garantiaParam = currentGarantia ? "&garantia=true" : "";

      // 1. Busca Contagens Consolidadas (Missões e Equipamentos) em um ÚNICO pacote (v40.2 Turbo)
      const token = localStorage.getItem("ditel_token");
      const statsUrl = `${API_BASE}/stats/consolidated?startDate=${start}&endDate=${end}${searchQuery}${bateriaParam}${garantiaParam}${unidadeParam}`;
      const statsResp = await fetch(statsUrl, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const allStats = await statsResp.json();

      // 2. Busca Registros para a Lista
      const listUrl = `${API_BASE}/${endpoint}?startDate=${start}&endDate=${end}${statusParam}${searchQuery}${bateriaParam}${garantiaParam}${unidadeParam}`;
      const listResp = await fetch(listUrl, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await listResp.json();

      setResults(Array.isArray(data) ? data : []);

      // 3. Atualiza o estado global de estatísticas com os dados do "pacote único"
      setStats({
        total: isMissions ? allStats.missoes.total : allStats.servicos.total,
        interno: allStats.missoes.interno || 0,
        externo: allStats.missoes.externo || 0,
        remoto: allStats.missoes.remoto || 0,
        pendente: isMissions ? allStats.missoes.pendente : allStats.servicos.pendente,
        pronto: allStats.servicos.pronto || 0,
        laudo: allStats.servicos.laudo || 0,
        bateria: allStats.servicos.bateria || 0,
        garantia: allStats.servicos.garantia || 0,
        // Rankings auditados do servidor (v40.5)
        rankings: allStats.missoes.rankings || { unidades: [], servicos: [], defeitos: [] }
      });
      if (isEquipments) {
        setLastCompletedDateFilters({ startDate: start, endDate: end });
        setLastCompletedEquipmentFilters({ startDate: start, endDate: end, q: currentQ, status: currentStatus || "", unidade: currentUnidade, bateria: currentBateria, garantia: currentGarantia });
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReportFromParams = async (start: string, end: string, queryText?: string, statusText?: string) => {
    if (!activeReport) return;
    await fetchReportData(start, end, activeReport, queryText, statusText);
  };

  const handleGenerateReport = async () => {
    if (!activeReport) return;
    await fetchReportData(filters.startDate, filters.endDate, activeReport, filters.q, filters.status);
  };

  const handleSave = async (data: Record<string, unknown>) => {
    if (!selectedRecord) return;
    try {
      const isMissions = activeReport === "Rel_Missao_Consolidado";
      const endpoint = isMissions ? "missoes" : "servicos";
      const id = isMissions ? selectedRecord.os : selectedRecord.Id_cod;
      const token = localStorage.getItem("ditel_token");

      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`✅ Registro #${id} atualizado com sucesso!`);
        setSelectedRecord(result.record || result.missao || data);
        // Atualiza a lista de resultados para refletir a mudança
        handleGenerateReport();
      } else {
        toast.error("Erro ao salvar: " + (result.error || "Tente novamente."));
      }
    } catch (err) {
      toast.error("Erro de conexão com o servidor.");
    }
  };

  const loadDetail = async (item: ReportRecord) => {
    setIsLoading(true);
    try {
      const isMissions = activeReport === "Rel_Missao_Consolidado";
      const endpoint = isMissions ? "missoes" : "servicos";
      const id = isMissions ? item.os : item.Id_cod;
      const token = localStorage.getItem("ditel_token");
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const fullData = await res.json();
        // A API de serviços retorna um envelope { record, hasPrev, hasNext },
        // enquanto a de missões retorna o objeto direto.
        setSelectedRecord(fullData.record || fullData);
      } else {
        setSelectedRecord(item);
      }
    } catch {
      setSelectedRecord(item);
    } finally {
      setIsLoading(false);
    }
  };


  const handlePrint = async () => {
    if (stats.total === 0) return;

    // 1. Abre a janela de impressão IMEIDATAMENTE para contornar qualquer bloqueador de popups.
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita pop-ups no seu navegador para imprimir o relatório.");
      return;
    }

    // Tela de carregamento temporária na nova aba
    printWindow.document.write(`
      <html>
        <head>
          <title>Gerando Relatório...</title>
          <style>body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 1.2rem; color: #555; }</style>
        </head>
        <body>Aguarde, calculando dados do relatório...</body>
      </html>
    `);

    // --- DADOS ANALÍTICOS AUDITADOS (v40.5) ---
    // Usamos os rankings calculados diretamente no servidor para precisão de 100%
    const topUnidades = stats.rankings?.unidades || [];
    const topServicos = stats.rankings?.servicos || [];
    const topDefeitos = stats.rankings?.defeitos || [];

    // Coleta dados locais para o relatório de manutenção (v40.2)
    const manutencaoStats = {
      total: stats.total,
      prontas: stats.pronto
    };

    const logoBase = window.location.origin;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Atividades - DITEL</title>
        <meta charset="UTF-8" />
        <style>
          @page { margin: 12mm; size: A4; }
          body { 
            font-family: "Segoe UI", Roboto, Arial, sans-serif; 
            padding: 0; 
            color: #1a1a1a; 
            line-height: 1.4; 
            background: white; 
            font-size: 12pt;
          }
          
          .header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            border-bottom: 1.2pt solid #1e293b; 
            padding-bottom: 12px; 
            margin-bottom: 15px; 
            margin-top: 0;
          }
          .logo { height: 75px; width: auto; object-fit: contain; }
          .header-text { 
            text-align: center; 
            flex: 1; 
            font-weight: bold; 
            text-transform: uppercase; 
            font-size: 9pt; 
            line-height: 1.4; 
          }
          .header-text .ditel { font-size: 14pt; color: black; margin-top: 4px; }

          .doc-title-box {
            background: transparent;
            border: none;
            padding: 5px;
            text-align: center;
            margin-bottom: 15px;
          }
          .doc-title { 
            font-weight: 900; 
            text-transform: uppercase; 
            font-size: 13pt; 
            margin: 0;
            letter-spacing: 1px;
            color: black;
          }

          .meta-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            font-size: 8.5pt;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
          }
          .meta-item b { color: #1e293b; text-transform: uppercase; font-size: 7.5pt; }

          /* Layout de Seções */
          section { margin-bottom: 22px; page-break-inside: avoid; }
          .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            border-left: 4px solid #004e9a;
            padding-left: 10px;
            background: transparent;
            padding-top: 6px;
            padding-bottom: 6px;
          }
          .section-title { 
            font-size: 9.5pt; 
            font-weight: 900; 
            text-transform: uppercase; 
            margin: 0;
            color: #1e293b;
          }

          /* Tabelas Estilizadas */
          table { width: 100%; border-collapse: collapse; background: transparent; }
          th, td { border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 9pt; text-align: left; }
          th { 
            background-color: #004e9a; 
            color: white; 
            font-weight: bold; 
            text-transform: uppercase; 
            font-size: 8pt; 
            text-align: center;
          }
          td.label { font-weight: 600; width: 65%; color: #334155; }
          td.value { font-weight: 800; text-align: center; font-size: 10pt; border-left: 1px solid #e2e8f0; }
          
          /* Visual de Barras Analíticas */
          .analytic-row { margin-bottom: 6px; }
          .analytic-header { display: flex; justify-content: space-between; font-size: 8pt; font-weight: bold; margin-bottom: 2px; }
          .progression-bar {
            height: 6px;
            background: #f1f5f9;
            width: 100%;
            border-radius: 3px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .progression-fill {
            height: 100%;
            background: linear-gradient(90deg, #004e9a, #3b82f6);
          }

          /* Cards de Resumo */
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .summary-card {
            border: 1px solid #e2e8f0;
            padding: 10px;
            text-align: center;
            background: transparent;
          }
          .card-val { font-size: 14pt; font-weight: 900; color: #004e9a; display: block; }
          .card-lbl { font-size: 7.5pt; font-weight: bold; text-transform: uppercase; color: #334155; }

          .signatures {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            text-align: center;
          }
          .signature-box { border-top: 1px solid #000; padding-top: 8px; }
          .sig-title { font-weight: bold; font-size: 8.5pt; text-transform: uppercase; }
          .sig-rank { font-size: 7.5pt; color: #334155; }

          .footer-note {
            margin-top: 35px;
            font-size: 7pt;
            color: #475569;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 8px;
          }
          
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }

          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            z-index: -100;
            width: 500px;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <img src="${logoBase}/logo-pmpa.png" class="watermark" />
        <div class="header">
          <img src="${logoBase}/logo-pmpa.png" class="logo" onerror="this.style.display='none'" />
          <div class="header-text">
            <div>GOVERNO DO ESTADO DO PARÁ</div>
            <div>SECRETARIA DE ESTADO DE SEGURANÇA PÚBLICA</div>
            <div>POLÍCIA MILITAR DO PARÁ</div>
            <div>DEPARTAMENTO GERAL DE ADMINISTRAÇÃO</div>
            <div class="ditel">DIRETORIA DE TELEMÁTICA</div>
          </div>
          <img src="${logoBase}/Logo Ditel.jpeg" class="logo" onerror="this.style.display='none'" />
        </div>

        <div class="doc-title-box">
          <p class="doc-title">Relatório de Desempenho Institucional</p>
        </div>

        <div class="meta-info">
          <div class="meta-item">
            <b>Emissão:</b><br/> ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div class="meta-item">
            <b>Período Analisado:</b><br/> ${filters.startDate ? new Date(filters.startDate).toLocaleDateString("pt-BR") : "Início"} — ${filters.endDate ? new Date(filters.endDate).toLocaleDateString("pt-BR") : "Fim"}
          </div>
        </div>

        <!-- SEÇÃO 1: NÚMEROS GERAIS -->
        <section>
          <div class="section-header">
            <div class="section-title">1. Resumo Operacional de Missões</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="text-align:left">Indicadores Principais</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="label">Missões de Caráter Interno (Sede/Ditel)</td><td class="value">${stats.interno}</td></tr>
              <tr><td class="label">Missões de Caráter Externo (Batalhões/Unidades)</td><td class="value">${stats.externo}</td></tr>
              <tr><td class="label">Atendimentos de Caráter Remoto (Telefônico/Rede)</td><td class="value">${stats.remoto}</td></tr>
              <tr><td class="label">Equipamentos/Serviços Aguardando Conclusão</td><td class="value">${stats.pendente}</td></tr>
              <tr>
                <td class="label" style="font-size: 10pt; color: #0f172a;">Carga Horária / Produção Total do Período</td>
                <td class="value" style="font-size: 13pt; color: #004e9a;">${stats.total}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- SEÇÃO 2: ANALÍTICA POR UNIDADE (v40.5 Auditado) -->
        <section>
          <div class="section-header">
            <div class="section-title">2. Distribuição de Apoio por Unidades</div>
          </div>
          <p style="font-size: 8pt; margin-bottom: 10px; color: #64748b;">Abaixo, as 5 unidades da PMPA que mais demandaram apoio técnico da DITEL no período.</p>
          ${topUnidades.length > 0 ? topUnidades.map(([unidade, qtd]) => `
            <div class="analytic-row">
              <div class="analytic-header">
                <span>${unidade}</span>
                <span>${qtd} ATENDIMENTOS (${Math.round((qtd / stats.total) * 100)}%)</span>
              </div>
              <div class="progression-bar">
                <div class="progression-fill" style="width: ${(qtd / topUnidades[0][1]) * 100}%"></div>
              </div>
            </div>
          `).join("") : "<p style='text-align:center; font-style:italic; font-size:9pt;'>Dados de unidade insuficientes para este período.</p>"}
        </section>

        <!-- SEÇÃO 3: DEMANDAS TÉCNICAS (NOVO v40.1) -->
        <section>
          <div class="section-header">
            <div class="section-title">3. Principais Demandas e Serviços</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="font-size: 8pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; color: #004e9a;">Categorias de Missão</p>
              ${topServicos.length > 0 ? topServicos.map(([serv, qtd]) => `
                <div style="display:flex; justify-content:space-between; font-size: 8.5pt; border-bottom: 1px solid #f1f5f9; padding: 3px 0;">
                  <span>${serv}</span>
                  <b>${qtd}</b>
                </div>
              `).join("") : "N/A"}
            </div>
            <div>
              <p style="font-size: 8pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; color: #004e9a;">Defeitos/Reclamações Comuns</p>
              ${topDefeitos.length > 0 ? topDefeitos.map(([def, qtd]) => `
                <div style="display:flex; justify-content:space-between; font-size: 8.5pt; border-bottom: 1px solid #f1f5f9; padding: 3px 0;">
                  <span style="font-size: 7.5pt;">${def.length > 25 ? def.substring(0, 25) + '...' : def}</span>
                  <b>${qtd}</b>
                </div>
              `).join("") : "N/A"}
            </div>
          </div>
        </section>

        <!-- SEÇÃO 4: MANUTENÇÃO -->
        <section>
          <div class="section-header">
            <div class="section-title">4. Manutenção de Equipamentos de Suporte</div>
          </div>
          <div class="summary-grid">
            <div class="summary-card">
              <span class="card-val">${manutencaoStats.total}</span>
              <span class="card-lbl">Ordens de Serviço</span>
            </div>
            <div class="summary-card">
              <span class="card-val" style="color: #059669;">${manutencaoStats.prontas}</span>
              <span class="card-lbl">Equips. Prontos</span>
            </div>
            <div class="summary-card">
              <span class="card-val" style="color: #0369a1;">${manutencaoStats.total > 0 ? Math.round((manutencaoStats.prontas / manutencaoStats.total) * 100) : 0}%</span>
              <span class="card-lbl">Taxa de Reparo</span>
            </div>
          </div>
        </section>

        <div class="signatures" style="margin-top: 100px;">
          <div class="signature-box">
            <div class="sig-title">Oficial Responsável pela Emissão</div>
            <div class="sig-rank">DITEL - PMPA</div>
          </div>
          <div class="signature-box">
            <div class="sig-title">Visto do Comando / Diretoria</div>
            <div class="sig-rank">DGA - DIRETORIA DE TELEMÁTICA</div>
          </div>
        </div>

        <div class="footer-note">
          As informações contidas neste relatório são geradas através dos registros oficiais da Diretoria de Telemática.<br/>
          PMPA | Diretoria de Telemática | ${new Date().getFullYear()}
        </div>

        <script>
          let impresso = false;
          function chamarImpressao() {
            if (impresso) return;
            impresso = true;
            window.print();
          }
          window.onload = function() { setTimeout(chamarImpressao, 1200); };
          setTimeout(chamarImpressao, 4000);
          window.onafterprint = function() { window.close(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open(); // Limpa o documento anterior (a tela de carregamento)
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintEquipamentos = async () => {
    if (activeReport !== "Rel_Equipamentos" || results.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita pop-ups no seu navegador para imprimir o relatório.");
      return;
    }
    printWindow.document.write("<html><body style='font-family:Arial;padding:32px'>Carregando todos os equipamentos para impressão...</body></html>");
    try {
      const completedFilters = lastCompletedEquipmentFilters || {
        startDate: filters.startDate, endDate: filters.endDate, q: filters.q, status: filters.status,
        unidade: filters.unidade, bateria: filters.bateria, garantia: filters.garantia,
      };
      const params = getEquipmentPrintQueryParams(completedFilters);
      const token = localStorage.getItem("ditel_token");
      const allRecords = await fetchAllEquipmentPages<ReportRecord>(async (page) => {
        const pageParams = new URLSearchParams(params);
        pageParams.set("page", String(page));
        pageParams.set("limit", "100");
        const response = await fetch(API_BASE + "/servicos?" + pageParams.toString(), {
          headers: { Authorization: "Bearer " + token },
        });
        if (!response.ok) throw new Error("Falha ao carregar página " + page + " (HTTP " + response.status + ").");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("A API retornou um formato inesperado.");
        const totalHeader = response.headers.get("X-Total-Count");
        if (totalHeader === null) throw new Error("A API não informou X-Total-Count; impressão cancelada para evitar relatório parcial.");
        return { records: data as ReportRecord[], total: Number(totalHeader) };
      });
      printWindow.document.open();
      printWindow.document.write(buildEquipmentPrintHtml(allRecords, completedFilters, window.location.origin));
      printWindow.document.close();
    } catch (error) {
      console.error("Erro ao preparar impressão de equipamentos:", error);
      printWindow.document.open();
      printWindow.document.write("<html><body style='font-family:Arial;padding:32px;color:#991b1b'><h2>Não foi possível gerar o relatório completo.</h2><p>" +
        escapePrintHtml(error instanceof Error ? error.message : "Erro inesperado.") +
        "</p><p>Feche esta aba e execute a pesquisa novamente antes de imprimir.</p></body></html>");
      printWindow.document.close();
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden bg-white/95 dark:bg-[#182944]/95 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-blue-300/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500 group">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#004e9a] to-[#002f5c] transform origin-left transition-transform duration-500" />
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="p-6 md:p-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 shadow-sm transition-transform group-hover:scale-110 duration-500">
              <FileText className="h-6 w-6 text-[#004e9a] dark:text-blue-400 drop-shadow-sm" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm">Painel de Relatórios</h2>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { icon: Activity, id: "Rel_Missao_Consolidado", title: "Consolidado Missões", desc: "Relatório de serviços Int/Ext" },
              { icon: Wrench, id: "Rel_Equipamentos", title: "Consolidado Equipamentos", desc: "Relatório de Manutenção e Reparos" },
            ].map((item) => (
              <Button
                key={item.id}
                onClick={() => {
                  setActiveReport(item.id);
                  setResults([]);
                }}
                variant="outline"
                className="w-full justify-start gap-4 h-auto py-4 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#004e9a]/50 transition-all duration-300 group/btn shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-0.5"
              >
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover/btn:bg-white dark:group-hover/btn:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors flex-shrink-0">
                  <item.icon className="h-5 w-5 text-slate-500 group-hover/btn:text-[#004e9a]" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="font-bold text-[14px] text-slate-700 dark:text-slate-200 group-hover/btn:text-[#004e9a] dark:group-hover/btn:text-blue-400 transition-colors tracking-wide truncate sm:whitespace-normal">{item.title}</span>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider truncate sm:whitespace-normal">{item.desc}</span>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-slate-300 group-hover/btn:text-[#004e9a] transition-all group-hover/btn:translate-x-1 flex-shrink-0" />
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Dialog open={!!activeReport} onOpenChange={(open) => {
        if (!open) {
          setActiveReport(null);
          setResults([]);
          setStats({ total: 0, interno: 0, externo: 0, remoto: 0, pendente: 0, pronto: 0, laudo: 0, bateria: 0, garantia: 0 });
          setFilters({ startDate: "", endDate: "", q: "", status: "", unidade: "", bateria: false, garantia: false });
          setLastCompletedDateFilters(null);
          setLastCompletedEquipmentFilters(null);
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] sm:w-full max-h-[92vh] overflow-hidden flex flex-col p-4 md:p-6 border-border/50 shadow-2xl bg-white dark:bg-slate-900">
          <DialogHeader className="p-1 md:p-4 border-b border-border/50 bg-white dark:bg-slate-900/50 rounded-t-lg">
            <DialogTitle className="text-lg md:text-2xl font-black text-pmpa-navy uppercase">
              {activeReport === "Rel_Missao_Consolidado" ? "Relatório de Missões" : "Relatório de Equipamentos"}
            </DialogTitle>
            <DialogDescription className="text-[10px] md:text-sm">Visualize e imprima relatórios consolidados do sistema DITEL.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-2 md:gap-4 p-1 md:p-0">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2 md:gap-3 items-end bg-slate-50/50 dark:bg-slate-800/20 p-2 md:p-4 rounded-xl border border-border/40 print:hidden shrink-0">
              <div className="space-y-1.5 flex-1 min-w-[150px]">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Início</label>
                <Input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[150px]">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Fim</label>
                <Input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Unidade</label>
                  {filters.unidade && (
                    <button
                      onClick={() => setFilters({ ...filters, unidade: "" })}
                      className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors flex items-center gap-1"
                    >
                      <X className="h-2 w-2" />
                      Limpar
                    </button>
                  )}
                </div>
                <UnidadeCombobox
                  value={filters.unidade}
                  onChange={(val) => setFilters({ ...filters, unidade: val })}
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Busca Rápida</label>
                  {filters.status && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${filters.status === 'PRONTO' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-orange-500/20 text-orange-600'}`}>
                      Filtro: {filters.status}
                    </span>
                  )}
                  {filters.bateria && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-amber-500/20 text-amber-600">
                      Filtro: BATERIA
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Pesquisar..."
                    value={filters.q}
                    onChange={(e) => setFilters({ ...filters, q: e.target.value, status: "", bateria: false })}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateReport()}
                    className={(filters.status || filters.bateria) ? "border-primary/50 bg-primary/5" : ""}
                  />
                  {(filters.status || filters.bateria) && (
                    <button
                      onClick={() => {
                        const newFilters = { ...filters, status: "", bateria: false };
                        setFilters(newFilters);
                        fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              <Button onClick={() => fetchReportData(filters.startDate, filters.endDate, activeReport!)} disabled={isLoading} className="h-10 md:h-12 bg-pmpa-navy hover:bg-pmpa-navy/90 text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 md:px-8 rounded-xl shadow-md transition-all">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar Dados"}
              </Button>

              {results.length > 0 && activeReport === "Rel_Missao_Consolidado" && (
                <Button onClick={handlePrint} variant="outline" className="border-pmpa-navy text-pmpa-navy hover:bg-pmpa-navy/5 gap-2 h-10">
                  <FileText className="h-4 w-4" />
                  Imprimir
                </Button>
              )}
              {results.length > 0 && activeReport === "Rel_Equipamentos" && (
                <Button onClick={handlePrintEquipamentos} variant="outline" className="border-pmpa-navy text-pmpa-navy hover:bg-pmpa-navy/5 gap-2 h-10">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              )}
            </div>

            {/* Resumo Estatístico Missões */}
            {activeReport === "Rel_Missao_Consolidado" && results.length > 0 && (
              <div className="relative overflow-hidden print:hidden border-b border-border/20 mb-6 pb-2 z-20 bg-white dark:bg-slate-900/95 backdrop-blur-sm shrink-0">
                <div className="flex flex-nowrap md:grid md:grid-cols-5 gap-2 overflow-x-auto pb-4 px-1 md:pb-0 custom-scrollbar scroll-smooth snap-x snap-mandatory">
                  <div className="bg-muted/40 p-2 md:p-3 rounded-lg border border-border/50 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Total</p>
                    <p className="text-sm md:text-xl font-black text-foreground">{String(stats.total || 0)}</p>
                  </div>
                  <div className="bg-blue-500/10 p-2 md:p-3 rounded-lg border border-blue-500/20 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-blue-500">Internas</p>
                    <p className="text-sm md:text-xl font-black text-blue-600 dark:text-blue-400">{String(stats.interno || 0)}</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2 md:p-3 rounded-lg border border-emerald-500/20 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-emerald-500">Externas</p>
                    <p className="text-sm md:text-xl font-black text-emerald-600 dark:text-emerald-400">{String(stats.externo || 0)}</p>
                  </div>
                  <div className="bg-purple-500/10 p-2 md:p-3 rounded-lg border border-purple-500/20 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-purple-500">Remotas</p>
                    <p className="text-sm md:text-xl font-black text-purple-600 dark:text-purple-400">{String(stats.remoto || 0)}</p>
                  </div>
                  <div className="bg-orange-500/10 p-2 md:p-3 rounded-lg border border-orange-500/20 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-orange-500">Pendentes</p>
                    <p className="text-sm md:text-xl font-black text-orange-600 dark:text-orange-400">{String(stats.pendente || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeReport === "Rel_Equipamentos" && results.length > 0 && (
              <div className="relative overflow-hidden print:hidden border-b border-border/20 mb-6 pb-2 z-20 bg-white dark:bg-slate-900/95 backdrop-blur-sm shrink-0">
                <div className="flex flex-nowrap md:grid md:grid-cols-6 gap-2 overflow-x-auto pb-4 px-1 md:pb-0 custom-scrollbar scroll-smooth snap-x snap-mandatory">

                  <div className="bg-muted/40 p-2 md:p-3 rounded-lg border border-border/50 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Total O.S.</p>
                    <p className="text-sm md:text-xl font-black text-foreground">{String(stats.total || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "PENDENTE", bateria: false, garantia: false };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "PENDENTE");
                    }}
                    className={`bg-orange-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-orange-500/20 active:scale-[0.97] transition-all snap-start ${filters.status === "PENDENTE" ? "ring-2 ring-orange-500 border-orange-500 bg-orange-500/20" : "border-orange-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-orange-500">Pendente</p>
                    <p className="text-sm md:text-xl font-black text-orange-600 dark:text-orange-400">{String(stats.pendente || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "LAUDO", bateria: false, garantia: false };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "LAUDO");
                    }}
                    className={`bg-blue-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-blue-500/20 active:scale-[0.97] transition-all snap-start ${filters.status === "LAUDO" ? "ring-2 ring-blue-500 border-blue-500 bg-blue-500/20" : "border-blue-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-blue-500">LAUDO</p>
                    <p className="text-sm md:text-xl font-black text-blue-600 dark:text-blue-400">{String(stats.laudo || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "", bateria: true, garantia: false };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "");
                    }}
                    className={`bg-amber-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-amber-500/20 active:scale-[0.97] transition-all snap-start ${filters.bateria ? "ring-2 ring-amber-500 border-amber-500 bg-amber-500/20" : "border-amber-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-amber-500">Bateria</p>
                    <p className="text-sm md:text-xl font-black text-amber-600 dark:text-amber-400">{String(stats.bateria || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "PRONTO", bateria: false, garantia: false };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "PRONTO");
                    }}
                    className={`bg-emerald-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-emerald-500/20 active:scale-[0.97] transition-all snap-start ${filters.status === "PRONTO" ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/20" : "border-emerald-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-emerald-500">PRONTO</p>
                    <p className="text-sm md:text-xl font-black text-emerald-600 dark:text-emerald-400">{String(stats.pronto || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "", bateria: false, garantia: true };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "");
                    }}
                    className={`bg-cyan-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-cyan-500/20 active:scale-[0.97] transition-all snap-start ${filters.garantia ? "ring-2 ring-cyan-500 border-cyan-500 bg-cyan-500/20" : "border-cyan-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-cyan-500">Garantia</p>
                    <p className="text-sm md:text-xl font-black text-cyan-600 dark:text-cyan-400">{String(stats.garantia || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Resultados */}
            <div className="flex-1 min-h-[250px] overflow-y-auto border border-border/40 rounded-lg divide-y divide-border/40 custom-scrollbar print:hidden shadow-inner bg-white dark:bg-slate-900">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3 animate-pulse">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-20" />
                      </div>
                      <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-full" />
                      <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <FileText className="h-12 w-12 opacity-10" />
                  <p className="font-bold text-xs uppercase tracking-widest text-center px-4">Nenhum dado carregado para este período.</p>
                </div>
              )}
              {Array.isArray(results) && results.filter(Boolean).map((item, index) => (
                <button
                  key={item._id || `report-item-${index}`}
                  onClick={() => loadDetail(item)}
                  className="w-full text-left p-4 hover:bg-primary/5 transition-colors group flex flex-col relative pr-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        {activeReport === "Rel_Missao_Consolidado" ? "OS #" : "ID / Código"}
                      </p>
                      <p className="font-bold text-foreground">
                        #{activeReport === "Rel_Missao_Consolidado" ? String(item.os || "---") : String(item.Id_cod || "---")}
                      </p>
                    </div>
                    <div className="md:col-span-1 space-y-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        {activeReport === "Rel_Missao_Consolidado" ? "Unidade / Solicitante" : "Equipamento / Unidade"}
                      </p>
                      <p className="font-semibold text-foreground truncate">
                        {activeReport === "Rel_Missao_Consolidado"
                          ? `${String(item.unidade || "N/A")} - ${String(item.solicitante || 'N/A')}`
                          : `${String(item.T_EquipSuporte || item.T_EquipTelecom || "N/A")} - ${String(item.Unidade || "N/A")}`}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Data Ref.</p>
                      <p className="font-bold text-foreground">
                        {getFormattedDate(item)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        {activeReport === "Rel_Missao_Consolidado" ? "Tipo" : "Status"}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(item)}`}>
                        {activeReport === "Rel_Missao_Consolidado"
                          ? (String(item.servico || "N/A").toUpperCase().includes("COMPARTILHAMENTO") ? "PASTA COMPARTILHADA" : String(item.servico || "N/A"))
                          : String(item.Serviço || "PENDENTE")}
                      </span>
                    </div>
                  </div>

                  {/* Prévia de Defeito/Análise - VISIBILIDADE TOTAL */}
                  <div className="mt-4 pt-3 border-t border-border/20 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-70">Defeito Reclamado</p>
                      <p className="text-xs text-foreground/80 leading-relaxed break-words whitespace-pre-wrap">
                        {String(item.Defeito_Recl || item.def_recla || "---").substring(0, 300)}
                        {String(item.Defeito_Recl || item.def_recla || "").length > 300 ? "..." : ""}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-70">Análise Técnica</p>
                      <p className="text-xs text-foreground/80 leading-relaxed break-words whitespace-pre-wrap">
                        {String(item.Analise_Tecnica || item.analise || "---").substring(0, 300)}
                        {String(item.Analise_Tecnica || item.analise || "").length > 300 ? "..." : ""}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="absolute right-4 top-6 h-5 w-5 text-pmpa-navy/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[92vh] overflow-hidden flex flex-col p-0 border-border/50 shadow-2xl">
          <DialogHeader className="p-4 md:p-6 pb-2 border-b border-border/50 bg-pmpa-navy/5">
            <DialogTitle className="text-xl md:text-2xl font-black text-pmpa-navy uppercase tracking-tight">
              {activeReport === "Rel_Missao_Consolidado" ? `Missão OS #${selectedRecord ? String(selectedRecord.os) : ""}` : `Equipamento #${selectedRecord ? String(selectedRecord.Id_cod) : ""}`}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Detalhamento técnico do registro selecionado no relatório.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
            {activeReport === "Rel_Missao_Consolidado" ? (
              <ServicoInternoExternoForm
                id="report-detail-form"
                initialData={selectedRecord}
                onCancel={() => setSelectedRecord(null)}
                onSubmit={handleSave}
                onPrint={(type) => { setPrintType(type); setTimeout(() => window.print(), 100); }}
                isEditMode={!!selectedRecord}
                readOnly={isViewer}
              />
            ) : (
              <CadastroForm
                id="report-detail-form"
                initialData={selectedRecord}
                onCancel={() => setSelectedRecord(null)}
                onSubmit={handleSave}
                onPrint={(type) => { setPrintType(type); setTimeout(() => window.print(), 100); }}
                isEditMode={!!selectedRecord}
                readOnly={isViewer}
              />
            )}
            {selectedRecord && <LaudoPrint data={selectedRecord} type={printType} />}
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};
