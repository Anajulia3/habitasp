import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { FeatureCollection } from 'geojson';
import { getEmpreendimentosGeoJSON, getObrasGeoJSON, getFavelasGeoJSON } from '../services/api';
import { AlertTriangle } from 'lucide-react';

type Props = Record<string, unknown> | null | undefined;

/** Escapa texto antes de inseri-lo no HTML dos popups. */
const esc = (v: unknown): string =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const val = (v: unknown, fallback = 'S/I'): string =>
  v === null || v === undefined || v === '' ? fallback : esc(typeof v === 'number' ? v.toLocaleString('pt-BR') : v);

export const Mapa: React.FC = () => {
  const [empreendimentos, setEmpreendimentos] = useState<FeatureCollection | null>(null);
  const [obras, setObras] = useState<FeatureCollection | null>(null);
  const [favelas, setFavelas] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getEmpreendimentosGeoJSON(), getObrasGeoJSON(), getFavelasGeoJSON()])
      .then(([empRes, obrasRes, favRes]) => {
        setEmpreendimentos(empRes);
        setObras(obrasRes);
        setFavelas(favRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar camadas do mapa:', err);
        setErro('Não foi possível carregar as camadas do mapa. Verifique se a API do HabitaSP está no ar e recarregue a página.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Carregando camadas do mapa...</p>
      </div>
    );
  }

  const saoPauloCenter: [number, number] = [-23.5505, -46.6333];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-blue-900">Mapa Territorial da Política Habitacional</h1>
        <p className="text-gray-600 mt-1">
          Explore os empreendimentos habitacionais, as obras de urbanização em assentamentos precários e o contexto de favelas em São Paulo.
        </p>
      </div>

      {erro && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 h-[700px] relative z-0">
        <MapContainer center={saoPauloCenter} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            {/* Camada 1: Empreendimentos (polígonos) */}
            {empreendimentos && (
              <LayersControl.Overlay checked name="Empreendimentos Habitacionais">
                <GeoJSON
                  data={empreendimentos}
                  style={() => ({ color: '#ffffff', weight: 1, fillColor: '#1d4ed8', fillOpacity: 0.85 })}
                  onEachFeature={(feature, layer) => {
                    const p = feature.properties as Props;
                    layer.bindPopup(`
                      <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
                        <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-weight: bold;">${val(p?.Nome, 'Empreendimento')}</h4>
                        <b>Total UHs:</b> ${val(p?.Total_UHs)}<br/>
                        <b>Entregues:</b> ${val(p?.UHs_entregues)}<br/>
                        <b>Distrito:</b> ${val(p?.Distrito)}<br/>
                        <b>Estágio:</b> ${val(p?.Estagio_mapeamento)}
                      </div>`);
                  }}
                />
              </LayersControl.Overlay>
            )}

            {/* Camada 2: Obras de Urbanização */}
            {obras && (
              <LayersControl.Overlay checked name="Obras de Urbanização">
                <GeoJSON
                  data={obras}
                  style={() => ({ color: '#f97316', weight: 3, fillOpacity: 0.5 })}
                  onEachFeature={(feature, layer) => {
                    const p = feature.properties as Props;
                    layer.bindPopup(`
                      <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
                        <h4 style="margin: 0 0 6px 0; color: #c2410c; font-weight: bold;">${val(p?.Nome, 'Obra de Urbanização')}</h4>
                        <b>Escopo:</b> ${val(p?.Escopo)}<br/>
                        <b>Famílias estimadas:</b> ${val(p?.Estimativa_familias)}<br/>
                        <b>Distrito:</b> ${val(p?.Distrito)}<br/>
                        <b>Estágio:</b> ${val(p?.Estagio_mapeamento)}
                      </div>`);
                  }}
                />
              </LayersControl.Overlay>
            )}

            {/* Camada 3: Favelas (contexto — desligada por padrão) */}
            {favelas && (
              <LayersControl.Overlay name="Favelas (contexto)">
                <GeoJSON
                  data={favelas}
                  style={() => ({ color: '#dc2626', weight: 1, fillOpacity: 0.3 })}
                  onEachFeature={(feature, layer) => {
                    const p = feature.properties as Props;
                    layer.bindPopup(`
                      <div style="font-family: sans-serif; padding: 4px;">
                        <h4 style="margin: 0 0 6px 0; color: #dc2626; font-weight: bold;">${val(p?.nome, 'Favela')}</h4>
                        <b>Domicílios:</b> ${val(p?.tot_domicilio)}<br/>
                        <b>Área (m²):</b> ${val(p?.areageo_m2)}
                      </div>`);
                  }}
                />
              </LayersControl.Overlay>
            )}
          </LayersControl>

          {/* Legenda flutuante */}
          <div className="leaflet-bottom leaflet-left" style={{ zIndex: 1000, margin: '12px' }}>
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 text-xs space-y-2.5 min-w-[220px]">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                <span>Legenda do Mapa</span>
                <span className="text-[10px] font-normal text-slate-400">GeoSampa / SEHAB</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-blue-700 border border-white shadow-xs shrink-0"></span>
                  <span className="text-slate-700 font-medium">Empreendimentos Habitacionais</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-1.5 bg-orange-500 rounded-xs shrink-0"></span>
                  <span className="text-slate-700 font-medium">Obras de Urbanização</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-red-600/40 border border-red-600 shrink-0"></span>
                  <span className="text-slate-700 font-medium">
                    Favelas (contexto) <span className="text-slate-400 font-normal">· opcional</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </MapContainer>
      </div>
    </div>
  );
};
