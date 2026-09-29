import React, { useEffect, useState } from 'react';
import { getMetas, getMetaInfo, getDadosTabulares } from '../services/api';
import type { Meta, MetaInfo, Empreendimento } from '../types';
import { fmtInt, fmtPct, normalizarEstagio } from '../utils';
import { Building2, Home, CheckCircle2, TrendingUp, Award, PieChart, BarChart3, Lightbulb, Layers, AlertTriangle, RefreshCw } from 'lucide-react';

export const VisaoGeral: React.FC = () => {
  const [metas, setMetas] = useState<Record<string, Meta> | null>(null);
  const [metaInfo, setMetaInfo] = useState<MetaInfo | null>(null);
  const [dados, setDados] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDonutSlice, setActiveDonutSlice] = useState<number | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([getMetas(), getMetaInfo(), getDadosTabulares()])
      .then(([metasRes, infoRes, dadosRes]) => {
        setMetas(metasRes);
        setMetaInfo(infoRes);
        setDados(dadosRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setError("Não foi possível carregar os dados analíticos da API do HabitaSP. Verifique se o backend FastAPI está rodando e tente novamente.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Carregando painel analítico do HabitaSP...</p>
      </div>
    );
  }


  const compInd = metaInfo?.indicadores_complementares || {
    uh_em_obras: 0,
    area_urbanizacao_m2: 0,
    cartas_credito: 0,
    auxilio_aluguel: 0
  };

  // Análise de Dados Avançada
  const totalEmpreendimentos = dados.length;
  const totalUHsCadastradas = dados.reduce((acc, curr) => acc + (Number(curr.Total_UHs) || 0), 0);
  const totalUHsEntreguesReal = dados.reduce((acc, curr) => acc + (Number(curr.UHs_entregues) || 0), 0);
  const areaTotalM2 = dados.reduce((acc, curr) => acc + (Number(curr.Area_m2) || 0), 0);

  // Distribuição por Estágio / Mapeamento
  const estagioCount: Record<string, number> = {};
  dados.forEach(d => {
    const est = normalizarEstagio(d);
    estagioCount[est] = (estagioCount[est] || 0) + 1;
  });

  const distribuicaoEstagios = Object.entries(estagioCount)
    .sort((a, b) => b[1] - a[1]);

  // Agrupar UHs por Subprefeitura (Análise Comparativa Total vs Entregues)
  const subprefData: Record<string, { totalUHs: number; entreguesUHs: number; count: number }> = {};
  dados.forEach(d => {
    if (d.Subprefeitura) {
      if (!subprefData[d.Subprefeitura]) {
        subprefData[d.Subprefeitura] = { totalUHs: 0, entreguesUHs: 0, count: 0 };
      }
      subprefData[d.Subprefeitura].totalUHs += Number(d.Total_UHs) || 0;
      subprefData[d.Subprefeitura].entreguesUHs += Number(d.UHs_entregues) || 0;
      subprefData[d.Subprefeitura].count += 1;
    }
  });

  const topSubprefComparativo = Object.entries(subprefData)
    .sort((a, b) => b[1].totalUHs - a[1].totalUHs)
    .slice(0, 5);

  const maxUHsSubpref = Math.max(...topSubprefComparativo.map(([, val]) => val.totalUHs), 1);

  const topSubprefNome = topSubprefComparativo[0]?.[0] || 'São Paulo';
  const topSubprefTotalUHs = topSubprefComparativo[0]?.[1].totalUHs || 0;
  const percentTopUHs = fmtPct(totalUHsCadastradas ? (topSubprefTotalUHs / totalUHsCadastradas) * 100 : 0, 1, 1);

  // Função de cor específica para etapas (ex: Obra Paralisada ganha cor distinta)
  const getStageColor = (estagio: string, idx: number) => {
    const lower = estagio.toLowerCase();
    if (lower.includes('paralis')) {
      return '#f97316'; // Laranja vibrante para obra paralisada
    }
    const defaultColors = ['#2563eb', '#059669', '#d97706', '#e11d48', '#7c3aed', '#0891b2', '#475569'];
    return defaultColors[idx % defaultColors.length];
  };

  // Cálculo SVG Donut Chart
  let cumulativePercent = 0;
  const donutSlices = distribuicaoEstagios.map(([estagio, qtd], idx) => {
    const percent = totalEmpreendimentos ? (qtd / totalEmpreendimentos) * 100 : 0;
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += percent;
    const endAngle = (cumulativePercent / 100) * 360;
    return {
      estagio,
      qtd,
      percent: fmtPct(percent, 1, 1),
      color: getStageColor(estagio, idx),
      startAngle,
      endAngle
    };
  });

  return (
    <div className="space-y-8 pb-16">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-red-800">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-xl shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-red-950">Falha na Comunicação com a API</h4>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition shrink-0"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Header Executivo */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-800/80 backdrop-blur-sm text-blue-200 text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-3 border border-blue-700/50">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Secretaria Municipal de Habitação (SEHAB)
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">HabitaSP — Painel Territorial & Metas</h1>
          <p className="text-blue-100/90 mt-2 text-sm md:text-base max-w-2xl leading-relaxed">
            Monitoramento integrado das metas habitacionais do Programa de Metas 2025–2028 e análise espacial de empreendimentos na cidade de São Paulo.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
          <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold block">Data de Referência</span>
          <span className="text-lg font-bold text-white">{metaInfo?.data_referencia}</span>
          <span className="text-xs text-blue-300 block mt-0.5">Fonte: HabitaSampa & GeoSampa</span>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-4 hover:border-blue-300 transition group">
          <div className="p-3.5 bg-blue-50 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
            <Building2 size={26} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Empreendimentos</span>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalEmpreendimentos.toLocaleString('pt-BR')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-4 hover:border-emerald-300 transition group">
          <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
            <Home size={26} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total UHs Mapeadas</span>
              <span className="text-[10px] text-slate-400 cursor-help" title="Soma das unidades habitacionais de todos os empreendimentos mapeados na camada do GeoSampa (estoque acumulado).">ℹ️</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalUHsCadastradas.toLocaleString('pt-BR')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-4 hover:border-indigo-300 transition group">
          <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">UHs Entregues (estoque GeoSampa)</span>
              <span className="text-[10px] text-slate-400 cursor-help" title="Estoque histórico acumulado de UHs entregues nos empreendimentos do GeoSampa. Não equivale à Meta 8, que conta apenas entregas desde jan/2025 (HabitaSampa).">ℹ️</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalUHsEntreguesReal.toLocaleString('pt-BR')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-4 hover:border-amber-300 transition group">
          <div className="p-3.5 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition">
            <TrendingUp size={26} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Área Mapeada (m²)</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{areaTotalM2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²</h3>
          </div>
        </div>
      </div>

      {/* Banner de Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
            <Lightbulb size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-blue-950">Inteligência & Analytics Territorial</h4>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
              A subprefeitura com maior volume de UHs contratadas é <b>{topSubprefNome}</b> ({fmtInt(topSubprefTotalUHs)} UHs, <b>{percentTopUHs}%</b> do total mapeado no GeoSampa). Segundo o HabitaSampa, há <b>{compInd.uh_em_obras?.toLocaleString('pt-BR')} UHs em obras</b> na cidade.
            </p>
          </div>
        </div>
        <div className="shrink-0 bg-white px-4 py-3 rounded-xl border border-blue-200 shadow-2xs text-xs text-blue-900 font-semibold">
          Dados de {metaInfo?.data_referencia}
        </div>
      </div>

      {/* Seção de Gráficos Analíticos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico 1: Gráfico de Rosca (Donut SVG) - Distribuição por Estágio */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="text-blue-600" size={20} />
                Distribuição Percentual por Estágio
              </h3>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                Gráfico de Rosca (Donut)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
              {/* Gráfico SVG Donut */}
              <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {donutSlices.map((slice, idx) => {
                    const strokeDasharray = `${(slice.endAngle - slice.startAngle) * (282.7 / 360)} 282.7`;
                    const strokeDashoffset = -slice.startAngle * (282.7 / 360);
                    const isHovered = activeDonutSlice === idx;
                    return (
                      <circle
                        key={slice.estagio}
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? "14" : "12"}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300 cursor-pointer origin-center"
                        onMouseEnter={() => setActiveDonutSlice(idx)}
                        onMouseLeave={() => setActiveDonutSlice(null)}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Total</span>
                  <span className="text-xl font-black text-slate-900">
                    {fmtInt(activeDonutSlice !== null ? donutSlices[activeDonutSlice].qtd : totalEmpreendimentos)}
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold">
                    {activeDonutSlice !== null ? `${donutSlices[activeDonutSlice].percent}%` : 'Projetos'}
                  </span>
                </div>
              </div>

              {/* Legenda Interativa */}
              <div className="space-y-2 w-full">
                {donutSlices.map((slice, idx) => (
                  <div
                    key={slice.estagio}
                    onMouseEnter={() => setActiveDonutSlice(idx)}
                    onMouseLeave={() => setActiveDonutSlice(null)}
                    className={`flex items-center justify-between text-xs p-2 rounded-xl cursor-pointer transition ${activeDonutSlice === idx ? 'bg-blue-50 border border-blue-200 font-bold' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
                      <span className="text-slate-700 truncate" title={slice.estagio}>{slice.estagio}</span>
                    </div>
                    <span className="text-slate-900 font-bold shrink-0 ml-2">{fmtInt(slice.qtd)} ({slice.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
            Base territorial: GeoSampa / SEHAB · contagens calculadas neste projeto a partir da base vetorial
          </div>
        </div>

        {/* Gráfico 2: Gráfico de Barras Comparativas (Total UHs vs. UHs Entregues por Subprefeitura) */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="text-blue-600" size={20} />
                UHs Contratadas vs. Entregues (Top Subprefeituras)
              </h3>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                Gráfico Comparativo
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {topSubprefComparativo.map(([sub, val]) => {
                const totalWidth = Math.max((val.totalUHs / maxUHsSubpref) * 100, 15);
                const entreguesWidth = val.totalUHs > 0 ? (val.entreguesUHs / val.totalUHs) * totalWidth : 0;
                return (
                  <div key={sub} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-800 truncate" title={sub}>{sub}</span>
                      <span className="text-slate-600 font-bold">
                        <span className="text-emerald-700">{val.entreguesUHs.toLocaleString('pt-BR')}</span> / {val.totalUHs.toLocaleString('pt-BR')} UHs
                      </span>
                    </div>
                    {/* Barra Comparativa Dupla */}
                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 relative border border-slate-200/50">
                      <div
                        className="bg-blue-600 h-full rounded-full absolute left-0 top-0.5 bottom-0.5 opacity-90"
                        style={{ width: `${totalWidth}%` }}
                        title={`Total UHs: ${val.totalUHs}`}
                      ></div>
                      <div
                        className="bg-emerald-500 h-full rounded-full absolute left-0 top-0.5 bottom-0.5 z-10"
                        style={{ width: `${entreguesWidth}%` }}
                        title={`Entregues: ${val.entreguesUHs}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Total Contratado (UHs)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> UHs Entregues</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
            Comparativo por subprefeitura · cálculo próprio sobre a base do GeoSampa
          </div>
        </div>
      </div>

      {/* Seção de Metas do Programa de Metas (Com Gráfico Comparativo Dual-Bar) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Award className="text-blue-600" size={24} />
            Metas do Programa (2025–2028) — Comparativo & Progresso
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            4 Metas Oficiais SEHAB
          </span>
        </div>
        <p className="text-xs text-slate-500 -mt-2">
          Metas: Programa de Metas 2025–2028 (PMSP) · Execução: HabitaSampa (entregas desde jan/2025). Os valores diferem do estoque histórico do GeoSampa exibido acima, que tem outro escopo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metas && Object.keys(metas).map((key) => {
            const meta = metas[key];
            return (
              <div key={key} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{meta.titulo}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 shrink-0">
                      {fmtPct(meta.percentual)}% Alcançado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{meta.descricao}</p>
                  {meta.unidade.toLowerCase().includes('proxy') && (
                    <span className="inline-block mt-2 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Indicador proxy — ver descrição
                    </span>
                  )}
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-slate-900">
                      {meta.atual_valor?.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-slate-500">{meta.unidade}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Meta Alvo: {meta.meta_valor?.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(meta.percentual, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span><b>Fonte:</b> {meta.fonte.split(';')[0]}</span>
                    <span className="text-emerald-700 font-semibold">Status: {meta.percentual >= 100 ? 'Concluída' : meta.percentual > 0 ? 'Em execução' : 'Não iniciada'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicadores Complementares em Grid Profissional */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={20} />
          Matriz de Indicadores Complementares
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 block font-medium">UH em Obras</span>
              <span className="text-xl font-black text-slate-900">{compInd.uh_em_obras?.toLocaleString('pt-BR')}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">UH</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Urbanização Finalizada</span>
              <span className="text-base font-black text-slate-900">{compInd.area_urbanizacao_m2?.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">m²</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Famílias com Auxílio Aluguel</span>
              <span className="text-xl font-black text-slate-900">{compInd.auxilio_aluguel?.toLocaleString('pt-BR')}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">Fam.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
