import axios from 'axios';
import type { FeatureCollection } from 'geojson';
import type { Meta, MetaInfo, Empreendimento } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getMetas = async (): Promise<Record<string, Meta>> => {
  const response = await apiClient.get('/api/metas');
  return response.data;
};

export const getMetaInfo = async (): Promise<MetaInfo> => {
  const response = await apiClient.get('/api/meta-info');
  return response.data;
};

export const getEmpreendimentosGeoJSON = async (): Promise<FeatureCollection> => {
  const response = await apiClient.get('/api/mapa/empreendimentos');
  return response.data;
};

export const getObrasGeoJSON = async (): Promise<FeatureCollection> => {
  const response = await apiClient.get('/api/mapa/obras-urbanizacao');
  return response.data;
};

export const getFavelasGeoJSON = async (): Promise<FeatureCollection> => {
  const response = await apiClient.get('/api/mapa/favelas');
  return response.data;
};

export const getDadosTabulares = async (distrito?: string): Promise<{ total: number; data: Empreendimento[] }> => {
  const params = distrito && distrito !== 'Todos' ? { distrito } : {};
  const response = await apiClient.get('/api/dados', { params });
  return response.data;
};
