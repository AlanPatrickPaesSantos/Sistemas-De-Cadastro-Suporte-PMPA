/**
 * Configuração inteligente de API para o DITEL/PMPA
 * Em desenvolvimento: usa o localhost:5001 do seu computador
 * Em produção (Render): usa a mesma URL onde o site está hospedado
 */

const getApiBase = () => {
  // Se estivermos rodando no endereço do Render, usamos o próprio domínio
  if (import.meta.env.PROD) {
    return '/api';
  }
  // Se estivermos em desenvolvimento (npm run dev), usamos a porta do backend local
  return 'http://localhost:5001/api';
};

export const API_BASE = getApiBase();
