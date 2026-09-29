import type { Empreendimento } from './types';

/** Inteiro no padrão pt-BR (ex.: 1.604). */
export const fmtInt = (n: number): string => n.toLocaleString('pt-BR');

/** Percentual no padrão pt-BR, sem o símbolo (ex.: 18,6 · 41,88). */
export const fmtPct = (n: number, min = 1, max = 2): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max });

/**
 * Estágio do empreendimento normalizado. Unifica variações de grafia da origem
 * (ex.: "Obra paralisda" / "Obra Paralisada") em uma única categoria.
 */
export const normalizarEstagio = (row: Pick<Empreendimento, 'Estagio_mapeamento' | 'Estagio'>): string => {
  const bruto = (row.Estagio_mapeamento || row.Estagio || '').trim();
  if (!bruto) return 'Não informado';
  if (/^obra paralis/i.test(bruto)) return 'Obra paralisada';
  return bruto;
};
