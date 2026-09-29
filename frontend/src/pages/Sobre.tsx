import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Lightbulb, Database, AlertCircle } from 'lucide-react';

const Card: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200/80 space-y-3">
    <div className="flex items-center gap-3 text-blue-900 font-bold text-xl">
      {icon}
      <h2>{title}</h2>
    </div>
    <div className="text-slate-700 leading-relaxed text-sm md:text-base space-y-2">{children}</div>
  </div>
);

export const Sobre: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-3xl font-black text-blue-950">Sobre o HabitaSP</h1>
        <p className="text-slate-600 mt-1">
          Resumo da documentação técnica, das escolhas de arquitetura e da metodologia. A documentação completa está no README do repositório.
        </p>
      </div>

      <div className="space-y-6">
        <Card icon={<BookOpen className="text-blue-600" size={24} />} title="1. Contexto e Problema Identificado">
          <p>
            A Prefeitura de São Paulo possui metas oficiais de habitação (Programa de Metas 2025–2028) e publica dados em portais distintos
            (HabitaSampa, GeoSampa, notícias da SEHAB). O <b>HabitaSP</b> resolve a ausência de um painel único que consolide o progresso das
            metas, a localização geográfica dos empreendimentos e o contexto territorial.
          </p>
        </Card>

        <Card icon={<ShieldCheck className="text-blue-600" size={24} />} title="2. Órgão Relacionado e Público Beneficiado">
          <ul className="list-disc pl-5 space-y-2">
            <li><b>Órgão:</b> Secretaria Municipal de Habitação (SEHAB).</li>
            <li><b>Público beneficiado:</b> gestores públicos (acompanhamento de metas), imprensa, pesquisadores e cidadãos interessados na transparência da política habitacional.</li>
          </ul>
        </Card>

        <Card icon={<Database className="text-blue-600" size={24} />} title="3. Dados e Fontes">
          <ul className="list-disc pl-5 space-y-2">
            <li><b>Dados reais, sem dados sintéticos ou simulados.</b> Data de referência: setembro de 2026.</li>
            <li><b>Metas:</b> Programa de Metas 2025–2028 da Prefeitura de São Paulo (Metas 8 a 11 — SEHAB). Execução das metas: HabitaSampa.</li>
            <li><b>Empreendimentos, obras de urbanização e favelas:</b> camadas oficiais da SEHAB no GeoSampa. As contagens e somas exibidas (empreendimentos, UHs, áreas, comparativos por subprefeitura) são resultado de processamento próprio sobre essa base vetorial.</li>
            <li>Termos como “Favela”, “Núcleo” e “Cortiço” seguem a nomenclatura oficial das camadas do GeoSampa/SEHAB.</li>
          </ul>
        </Card>

        <Card icon={<Cpu className="text-blue-600" size={24} />} title="4. Arquitetura Técnica e Escolhas">
          <ul className="list-disc pl-5 space-y-2">
            <li><b>Monorepo (FastAPI + React):</b> API REST em Python e interface em React + TypeScript + Vite, com deploy independente de cada camada.</li>
            <li><b>Snapshot local dos dados:</b> as camadas do GeoSampa foram baixadas via WFS, reprojetadas para WGS84 (EPSG:4326) e salvas no repositório. A aplicação não depende do serviço externo durante o uso.</li>
            <li><b>Exclusão do déficit habitacional:</b> excluído do escopo por exigir metodologia própria, que não deve ser aproximada em um MVP.</li>
          </ul>
        </Card>

        <Card icon={<AlertCircle className="text-blue-600" size={24} />} title="5. Limitações">
          <ul className="list-disc pl-5 space-y-2">
            <li>O indicador oficial da Meta 10 (famílias beneficiadas por urbanização) não consta no snapshot do HabitaSampa; o painel exibe, de forma identificada, os m² de urbanização finalizada como indicador proxy.</li>
            <li>“UHs entregues” do GeoSampa (estoque histórico) e da Meta 8 (entregas desde jan/2025) têm escopos diferentes e não devem ser comparados diretamente.</li>
            <li>O estágio dos empreendimentos é a classificação publicada pela SEHAB, usada sem recálculo.</li>
            <li>No plano gratuito de hospedagem, a primeira requisição após um período de inatividade pode levar de 30 a 60 segundos.</li>
          </ul>
        </Card>

        <Card icon={<Lightbulb className="text-blue-600" size={24} />} title="6. Uso de IA Generativa & Melhorias Futuras">
          <p>
            O Claude foi usado como copiloto na pesquisa das fontes, na estruturação do monorepo, na coleta geoespacial, nos endpoints da API e nos
            componentes de interface. O código gerado foi revisado e testado de ponta a ponta, e os números exibidos foram conferidos contra os
            dados de origem e contra as páginas oficiais da Prefeitura. Como evolução futura, planeja-se um assistente conversacional
            (“Pergunte aos dados”) via RAG com grounding nas fontes oficiais da SEHAB.
          </p>
        </Card>
      </div>
    </div>
  );
};
