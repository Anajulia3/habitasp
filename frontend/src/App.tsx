import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { VisaoGeral } from './pages/VisaoGeral';
import { Mapa } from './pages/Mapa';
import { ExplorarDados } from './pages/ExplorarDados';
import { Sobre } from './pages/Sobre';
import { getMetaInfo } from './services/api';
import { LayoutDashboard, Map, Table, Info, Building } from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
          : 'text-slate-600 hover:bg-slate-100 hover:text-blue-900'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

function App() {
  const [dataReferencia, setDataReferencia] = useState('Agosto de 2026');

  useEffect(() => {
    getMetaInfo()
      .then(res => {
        if (res && res.data_referencia) {
          setDataReferencia(res.data_referencia);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Sidebar / Barra Lateral */}
        <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 shadow-sm">
          <div>
            <div className="flex items-center gap-3 px-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Building size={22} />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-lg leading-tight">HabitaSP</h1>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">SEHAB • São Paulo</span>
              </div>
            </div>

            <nav className="space-y-1.5">
              <NavItem to="/" icon={<LayoutDashboard size={20} />}>
                Visão Geral & Análise
              </NavItem>
              <NavItem to="/mapa" icon={<Map size={20} />}>
                Mapa Territorial
              </NavItem>
              <NavItem to="/dados" icon={<Table size={20} />}>
                Explorar & Filtrar Dados
              </NavItem>
              <NavItem to="/sobre" icon={<Info size={20} />}>
                Sobre o Projeto
              </NavItem>
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-100 text-xs text-slate-400 px-2 space-y-1">
            <p className="font-semibold text-slate-600">Edital ADE Sampa nº 005/2026</p>
            <p className="text-slate-400 pt-1">Snapshot: {dataReferencia}</p>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sistema Operacional • Dados Oficiais GeoSampa & HabitaSampa</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                CRS: EPSG:4326 (WGS84)
              </span>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<VisaoGeral />} />
              <Route path="/mapa" element={<Mapa />} />
              <Route path="/dados" element={<ExplorarDados />} />
              <Route path="/sobre" element={<Sobre />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
