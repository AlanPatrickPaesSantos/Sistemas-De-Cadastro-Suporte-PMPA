export const ANALISE_SUGESTOES_MANUTENCAO = [
  { label: "Backup & Formatação", text: "Realizado backup dos dados e formatação completa do sistema." },
  { label: "Limpeza Interna", text: "Executada limpeza interna preventiva para remoção de poeira e oxidação." },
  { label: "Troca de Bateria", text: "Substituição de bateria por componente novo e testes de autonomia realizados." },
  { label: "Fonte com defeito", text: "Após análise técnica, constatou-se defeito na fonte de alimentação do equipamento." },
  { label: "HD/SSD com defeito", text: "Após análise técnica, constatou-se defeito na unidade de armazenamento (HD/SSD)." },
  { label: "Memória RAM com defeito", text: "Após análise técnica, constatou-se falha na memória RAM do equipamento." },
  { label: "Display/Tela com defeito", text: "Após análise técnica, constatou-se defeito no display/tela do equipamento." },
  { label: "Bateria sem carga", text: "Após análise técnica, constatou-se que a bateria encontra-se sem carga e sem autonomia adequada para uso." },
] as const;
export const ANALISE_SUGESTOES_LAUDO = [
  { label: "Equipamento sem condições de uso", text: "Após análise técnica, constatou-se que o equipamento encontra-se sem condições de uso, não sendo recomendado o reparo." },
  { label: "Equipamento em desuso", text: "Após análise técnica, constatou-se que o equipamento encontra-se em desuso e sem viabilidade de reaproveitamento operacional." },
  { label: "Placa lógica/placa-mãe com defeito", text: "Após análise técnica, constatou-se defeito na placa lógica/placa-mãe do equipamento." },
  { label: "Placa em curto", text: "Após análise técnica, constatou-se curto-circuito na placa lógica/placa-mãe do equipamento." },
  { label: "Sem fonte/cabo", text: "Após análise técnica, constatou-se que o equipamento foi apresentado sem fonte de alimentação e/ou cabo correspondente." },
  { label: "Sem viabilidade de reparo", text: "Após análise técnica, constatou-se que o equipamento não apresenta viabilidade técnica/econômica de reparo." },
  { label: "Laudo para baixa do equipamento", text: "Após análise técnica, conclui-se que o equipamento encontra-se sem condições de uso, sendo recomendada sua baixa patrimonial, conforme procedimentos administrativos cabíveis." },
] as const;
export const appendAnaliseSuggestion = (current: string, suggestion: string) => {
  const normalizedCurrent = current.trim();
  const duplicate = normalizedCurrent.length > 0 && normalizedCurrent.toLocaleLowerCase("pt-BR").includes(suggestion.toLocaleLowerCase("pt-BR"));
  if (duplicate) return { value: current, duplicate: true };
  const separator = normalizedCurrent && !/[.!?]$/.test(normalizedCurrent) ? ". " : normalizedCurrent ? " " : "";
  return { value: normalizedCurrent ? `${normalizedCurrent}${separator}${suggestion}` : suggestion, duplicate: false };
};
