# HabitaSP — Frontend (React + TypeScript + Vite)

Interface web interativa e painel territorial de acompanhamento da política habitacional de São Paulo (SEHAB).

## Tecnologias Utilizadas
- **React 19** + **TypeScript**
- **Vite** (Build tool e bundler)
- **Tailwind CSS** (Estilização utilitária)
- **Leaflet / React-Leaflet** (Mapas interativos e camadas geoespaciais)
- **Axios** (Requisições HTTP para a API FastAPI)
- **Lucide React** (Ícones)

## Estrutura do Projeto
- `src/pages/`: Páginas principais da aplicação (`VisaoGeral.tsx`, `Mapa.tsx`, `ExplorarDados.tsx`, `Sobre.tsx`).
- `src/services/api.ts`: Cliente HTTP para comunicação com o backend.
- `src/types.ts`: Definições de tipos e interfaces TypeScript.
- `src/App.tsx`: Roteamento e layout base.

## Como Executar
Na pasta `frontend/`:
```bash
npm install
npm run dev
```
O aplicativo estará acessível em `http://localhost:5173`. Certifique-se de configurar a variável `VITE_API_URL` apontando para o backend FastAPI (padrão: `http://localhost:8000`).
