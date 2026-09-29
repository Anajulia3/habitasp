import React, { useEffect, useState } from 'react';
import { getDadosTabulares } from '../services/api';
import type { Empreendimento } from '../types';
import { fmtInt, normalizarEstagio } from '../utils';
import { Search, ArrowUpDown, Building2, Home, CheckCircle2, Download, AlertTriangle } from 'lucide-react';

export const ExplorarDados: React.FC = () => {
  const [distritos, setDistritos] = useState<string[]>([]);
  const [estagios, setEstagios] = useState<string[]>([]);
  const [data, setData] = useState<Empreendimento[]>([]);
  const [total, setTotal] = useState(0);
  const [distritoFiltro, setDistritoFiltro] = useState('Todos');
  const [estagioFiltro, setEstagioFiltro] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<string>('Nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    getDadosTabulares()
      .then((res) => {
        const items = res.data || [];
        const todosDistritos = Array.from(
          new Set(items.map((item) => item.Distrito).filter((d): d is string => Boolean(d)))
        ).sort();
        const todosEstagios = Array.from(new Set(items.map((item) => normalizarEstagio(item)))).sort();
        setDistritos(todosDistritos);
        setEstagios(todosEstagios);
      })
      .catch((err) => console.error("Erro ao carregar filtros:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setErro(null);
    getDadosTabulares(distritoFiltro)
      .then((res) => {
        setData(res.data || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados tabulares:", err);
        setErro("Não foi possível carregar os dados. Verifique se a API do HabitaSP está no ar e recarregue a página.");
        setLoading(false);
      });
  }, [distritoFiltro]);

  // Filtering by search term and stage
  const dadosFiltrados = data.filter(item => {
    const nome = (item.Nome || '').toLowerCase();
    const endereco = (item.Endereco || '').toLowerCase();
    const termo = busca.toLowerCase();
    const matchTermo = nome.includes(termo) || endereco.includes(termo);

    const estag = normalizarEstagio(item);
    const matchEstagio = estagioFiltro === 'Todos' || estag === estagioFiltro;

    return matchTermo && matchEstagio;
  });

  // Sorting
  const dadosOrdenados = [...dadosFiltrados].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const aVazio = aVal === null || aVal === undefined || aVal === '';
    const bVazio = bVal === null || bVal === undefined || bVal === '';
    if (aVazio && bVazio) return 0;
    if (aVazio) return 1;
    if (bVazio) return -1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const cmp = String(aVal).localeCompare(String(bVal), 'pt-BR', { sensitivity: 'base' });
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Exporta a visão atual (filtros + ordenação) em CSV compatível com Excel pt-BR (separador ;, UTF-8 com BOM)
  const exportarCSV = () => {
    const colunas: [string, string][] = [
      ['Nome', 'Nome'],
      ['Endereço', 'Endereco'],
      ['Subprefeitura', 'Subprefeitura'],
      ['Distrito', 'Distrito'],
      ['Total UHs', 'Total_UHs'],
      ['UHs entregues', 'UHs_entregues'],
      ['Estágio', 'Estagio'],
    ];
    const esc = (v: unknown) => {
      const t = v === null || v === undefined ? '' : String(v);
      return /[";\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    const linhas = [
      colunas.map(([rotulo]) => rotulo).join(';'),
      ...dadosOrdenados.map((r) =>
        colunas.map(([, campo]) => esc(campo === 'Estagio' ? normalizarEstagio(r) : r[campo])).join(';')
      ),
    ];
    const blob = new Blob(['\uFEFF' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habitasp_empreendimentos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Summary metrics for filtered data
  const totalUHsFiltradas = dadosFiltrados.reduce((acc, curr) => acc + (Number(curr.Total_UHs) || 0), 0);
  const totalUHsEntreguesFiltradas = dadosFiltrados.reduce((acc, curr) => acc + (Number(curr.UHs_entregues) || 0), 0);


  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-blue-950">Exploração e Análise de Dados</h1>
        <p className="text-slate-600 mt-1">
          Filtre por distrito, estágio de obra e pesquise registros oficiais de empreendimentos habitacionais de São Paulo.
        </p>
      </div>

      {erro && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Filtros Avançados */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Filtrar por Distrito</label>
          <select
            className="w-full border border-slate-300 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={distritoFiltro}
            onChange={(e) => setDistritoFiltro(e.target.value)}
          >
            <option value="Todos">Todos os Distritos</option>
            {distritos.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Filtrar por Estágio</label>
          <select
            className="w-full border border-slate-300 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={estagioFiltro}
            onChange={(e) => setEstagioFiltro(e.target.value)}
          >
            <option value="Todos">Todos os Estágios</option>
            {estagios.map((est) => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Pesquisar por Nome/Endereço</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Ex: Curuça, Paraisópolis..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

      </div>

      {/* Cards de Resumo Dinâmico dos Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Building2 size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Empreendimentos Filtrados</span>
            <h4 className="text-xl font-black text-slate-900 mt-0.5">{fmtInt(dadosFiltrados.length)}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Home size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total UHs no Filtro</span>
            <h4 className="text-xl font-black text-slate-900 mt-0.5">{totalUHsFiltradas.toLocaleString('pt-BR')}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">UHs Entregues no Filtro</span>
            <h4 className="text-xl font-black text-slate-900 mt-0.5">{totalUHsEntreguesFiltradas.toLocaleString('pt-BR')}</h4>
          </div>
        </div>
      </div>

      {/* Tabela de Dados Profissional */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex justify-between items-center text-sm text-slate-600">
          <span>Exibindo <b>{fmtInt(dadosOrdenados.length)}</b> de {fmtInt(total)} registros da base oficial</span>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-50 text-blue-800 px-3 py-1 rounded-full font-medium border border-blue-200">
              Ordenado por: <b>{sortField}</b> ({sortDirection.toUpperCase()})
            </span>
            <button
              onClick={exportarCSV}
              disabled={dadosOrdenados.length === 0}
              className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-full transition"
            >
              <Download size={14} />
              Exportar CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Carregando base de dados...</div>
        ) : (
          <div className="overflow-auto max-h-[600px]">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100/80 sticky top-0 z-10">
                <tr>
                  <th
                    onClick={() => handleSort('Nome')}
                    className="px-6 py-4 text-left font-bold text-slate-700 cursor-pointer hover:bg-slate-200/60 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      Nome do Empreendimento <ArrowUpDown size={14} className="text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('Subprefeitura')}
                    className="px-6 py-4 text-left font-bold text-slate-700 cursor-pointer hover:bg-slate-200/60 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      Subprefeitura <ArrowUpDown size={14} className="text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('Distrito')}
                    className="px-6 py-4 text-left font-bold text-slate-700 cursor-pointer hover:bg-slate-200/60 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      Distrito <ArrowUpDown size={14} className="text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('Total_UHs')}
                    className="px-6 py-4 text-left font-bold text-slate-700 cursor-pointer hover:bg-slate-200/60 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      Total UHs <ArrowUpDown size={14} className="text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('UHs_entregues')}
                    className="px-6 py-4 text-left font-bold text-slate-700 cursor-pointer hover:bg-slate-200/60 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      UHs Entregues <ArrowUpDown size={14} className="text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700">Estágio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dadosOrdenados.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{row.Nome || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{row.Subprefeitura || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{row.Distrito || '-'}</td>
                    <td className="px-6 py-4 text-slate-900 font-bold">{row.Total_UHs?.toLocaleString('pt-BR') ?? '-'}</td>
                    <td className="px-6 py-4 text-slate-900 font-bold">{row.UHs_entregues?.toLocaleString('pt-BR') ?? '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                        {normalizarEstagio(row)}
                      </span>
                    </td>
                  </tr>
                ))}
                {dadosOrdenados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Nenhum empreendimento encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <p className="px-4 py-3 text-[11px] text-slate-400 border-t border-slate-100">
          “-” indica valor não informado na base oficial (não entra nas somas). Estágio conforme classificação da SEHAB no GeoSampa.
        </p>
      </div>
    </div>
  );
};
