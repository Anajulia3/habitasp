# HabitaSP — Painel Territorial de Acompanhamento da Política Habitacional de São Paulo

Prova Técnica Prática — Edital de Seleção Pública nº 005/2026 (ADE Sampa)
Cargo: Assistente II — Dados e IA

---

## 1. Título do Projeto

**HabitaSP** — Painel Territorial de Acompanhamento da Política Habitacional de São Paulo.

## 2. Descrição do Problema Identificado

A Prefeitura de São Paulo estabeleceu, no Programa de Metas 2025–2028, metas oficiais e mensuráveis para a política habitacional (entrega de moradias, emissão de títulos de posse, urbanização de áreas de favela e revitalização de conjuntos habitacionais). No entanto, os dados de execução dessas metas estão espalhados em portais distintos — HabitaSampa, GeoSampa, notícias e balanços da SEHAB — sem um painel único que consolide, ao mesmo tempo, o progresso numérico das metas, a localização geográfica dos empreendimentos e o contexto territorial. Essa fragmentação dificulta tanto o acompanhamento por parte de gestores públicos quanto a fiscalização pela população e pela imprensa.

## 3. Contexto e Justificativa da Escolha do Tema

Habitação é uma das áreas mais sensíveis da gestão municipal, com metas públicas explícitas e prazo definido (2025–2028). Escolhi esse tema porque ele reúne, ao mesmo tempo: (a) dados oficiais realmente públicos e verificáveis (Programa de Metas, HabitaSampa, GeoSampa), (b) um componente geoespacial rico o suficiente para justificar um mapa interativo, e (c) relevância direta para a transparência e a prestação de contas da gestão municipal à sociedade — um dos objetivos centrais que o edital pede para o recorte do problema.

## 4. Secretaria / Órgão / Política Pública Relacionada

Secretaria Municipal de Habitação (SEHAB) — responsável pela execução das Metas 8, 9, 10 e 11 do Programa de Metas 2025–2028 da Prefeitura de São Paulo.

## 5. Descrição da Solução Desenvolvida

Aplicação web em arquitetura **monorepo**, dividida em duas partes:

- **Backend (FastAPI, Python)**: serve os dados de metas e as camadas geoespaciais a partir de snapshots locais (arquivos processados uma única vez a partir das fontes oficiais), expondo uma API REST simples e documentada automaticamente (`/docs`).
- **Frontend (React + TypeScript + Vite)**: consome a API e apresenta a informação em quatro seções — Visão Geral, Mapa Territorial, Exploração de Dados e Sobre o Projeto — usando Leaflet para o mapa interativo e Tailwind CSS para a interface.

A separação entre backend e frontend foi uma escolha deliberada (ver seção 11) para permitir deploy independente de cada camada e uma API reaproveitável por outras interfaces no futuro.

## 6. Público / Área da Gestão Potencialmente Beneficiada

- Gestores da SEHAB, para acompanhamento interno do progresso das metas.
- Outras áreas da Prefeitura envolvidas em planejamento e prestação de contas do Programa de Metas.
- Jornalistas, pesquisadores e cidadãos interessados em fiscalizar a execução da política habitacional com dados oficiais e verificáveis.

## 7. Principais Funcionalidades

- **Visão Geral**: cards executivos com o progresso das Metas 8 a 11 do Programa de Metas 2025–2028 (valor atual, meta oficial e percentual de execução), além de indicadores complementares (UH em obras, área de urbanização finalizada, famílias com auxílio-aluguel) e uma análise agregada dos empreendimentos por estágio e por subprefeitura.
- **Mapa Territorial**: mapa interativo (Leaflet) com camadas georreferenciadas de Empreendimentos Habitacionais, Obras de Urbanização em Assentamento Precário e Favelas (camada de contexto), com popups mostrando os atributos de cada feição.
- **Exploração de Dados**: tabela filtrável por distrito e por busca textual (nome/endereço), com exportação dos dados filtrados em CSV.
- **Sobre o Projeto**: versão resumida da documentação (problema, metodologia, fontes e limitações) dentro do próprio app.

## 8. Fontes Pesquisadas

- **Programa de Metas 2025–2028** da Prefeitura de São Paulo, versão final vigente (Metas 8, 9, 10 e 11 — habitação, SEHAB), conforme a página "Ações e Programas" da SEHAB (prefeitura.sp.gov.br/web/habitacao/w/acesso_a_informacao/178759).
- **HabitaSampa** — painel de dados interativos da SEHAB, com indicadores de execução por região administrativa.
- **GeoSampa** — camadas geoespaciais oficiais da SEHAB, acessadas via serviço WFS (`wfs.geosampa.prefeitura.sp.gov.br`).
- **IBGE** (Censo 2022) — utilizado apenas como contexto territorial complementar, não como base de cálculo de indicador oficial.

## 9. Dados Utilizados

Todos os dados são **reais**, extraídos das fontes acima e salvos como snapshot local (data de referência: **agosto de 2026**), para garantir que a aplicação funcione de forma estável e independente durante a avaliação (ver justificativa na seção 11).

Camadas geoespaciais utilizadas (GeoSampa/WFS, reprojetadas para EPSG:4326):
- Empreendimento Habitacional (`habita2geosampa_habi_conjhabitacional2geosampa_ext`) — 1.604 feições.
- Obra de Urbanização em Assentamento Precário (`habita2geosampa_habi_obraurbanizacao2geosampa_ext`).
- Favela (`habita2geosampa_habi_favela2geosampa`) — camada de contexto territorial.

Indicadores de execução (HabitaSampa, snapshot de agosto/2026): UH de interesse social entregues, cartas de crédito emitidas, UH em obras, área de urbanização finalizada, títulos de posse/propriedade emitidos, conjuntos revitalizados, famílias com auxílio-aluguel e famílias com cartão emergencial.

## 10. Indicação de Dados Sintéticos ou Simulados

**Não há dados sintéticos ou simulados neste projeto.** Todos os números de execução apresentados são oficiais, extraídos do HabitaSampa e do GeoSampa (SEHAB), com data de referência explícita.

## 11. Justificativa das Principais Escolhas

- **Arquitetura separada (React + TypeScript no frontend, FastAPI no backend)**: permite deploy independente de cada camada (frontend em CDN/Vercel, backend como serviço em Render), API documentada e reaproveitável, e responsabilidades bem separadas entre interface e processamento de dados.
- **Snapshot local em vez de consulta ao vivo no WFS do GeoSampa**: os dados são baixados uma única vez e versionados no repositório. Isso evita que instabilidade, lentidão ou indisponibilidade do serviço público externo comprometa a avaliação da aplicação — um risco real e fora do meu controle se a aplicação dependesse de bater no WFS a cada requisição.
- **Exclusão do indicador "déficit habitacional por distrito"**: embora relevante, esse indicador exige uma metodologia própria de necessidades habitacionais (renda, tipo de domicílio, vacância etc.) que a própria Prefeitura ainda está atualizando via revisão do Plano Municipal de Habitação. Optei por não aproximar esse número para não apresentar uma conclusão sem lastro metodológico sólido.
- **Foco nas Metas 8 a 11**: são as metas do Programa de Metas 2025-2028 diretamente ligadas à execução territorial da SEHAB e com dados de acompanhamento já publicados pelo HabitaSampa, o que garante que o painel reflita números oficiais e verificáveis, não estimativas. Note-se que a Meta 12 do PdM é uma meta compartilhada entre SIURB e SEHAB (canalização de córregos e contenção de encostas), com natureza distinta das demais metas habitacionais, e por isso não foi incluída neste painel focado em produção habitacional.

## 12. Metodologia Adotada

1. Coleta dos dados geoespaciais via serviço WFS do GeoSampa (formato GeoJSON).
2. Tratamento e reprojeção das camadas de SIRGAS2000 (EPSG:31983) para WGS84 (EPSG:4326) com GeoPandas.
3. Coleta dos indicadores de execução das metas a partir do HabitaSampa, com data de referência fixada (agosto/2026).
4. Disponibilização dos dados processados via API REST (FastAPI).
5. Consumo da API e renderização das visualizações no frontend (React + Leaflet).

## 13. Tecnologias, Bibliotecas e Ferramentas Utilizadas

**Backend (API):** Python 3.11+, FastAPI, Uvicorn.
**Preparação dos dados (script offline, opcional):** GeoPandas, Pyogrio, Pandas.
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router, React-Leaflet / Leaflet, Axios, Lucide React.
**Deploy:** Vercel (frontend) e Render (backend).
**Dados e geoprocessamento:** GeoSampa (WFS), HabitaSampa, Programa de Metas 2025–2028.

## 14. Descrição Resumida da Utilização de Inteligência Artificial

Foi utilizado o Claude (Anthropic) como copiloto de desenvolvimento nas seguintes etapas:
- **Pesquisa e definição do tema**: apoio na identificação de fontes de dados oficiais e reais (GeoSampa, HabitaSampa, Programa de Metas), incluindo o levantamento dos nomes técnicos exatos das camadas WFS antes de qualquer codificação.
- **Arquitetura e estruturação**: definição da separação frontend/backend, dos endpoints da API e da estrutura de pastas do monorepo.
- **Geração e revisão de código**: geração inicial dos componentes React, das rotas FastAPI e das funções de tratamento geoespacial.
- **Depuração e revisão crítica**: o código gerado foi revisado e testado manualmente de ponta a ponta (backend + frontend rodando juntos). Nesse processo foram identificados e corrigidos: uma configuração incorreta do Tailwind CSS (v4) que deixava a interface sem estilo, um bug no filtro de distrito da tela de exploração de dados que travava as opções do seletor, uma inconsistência na numeração oficial das metas do Programa de Metas, corrigida após conferência com a página oficial da SEHAB, e ajustes de organização do repositório (remoção de arquivos de template não utilizados e configuração do `.gitignore`).



## 15. Limitações Identificadas

- O plano gratuito do serviço de hospedagem do backend (Render) coloca o serviço em repouso após um período de inatividade, podendo causar uma demora de 30 a 60 segundos na primeira requisição após um período sem uso.
- A Meta 10 tem como indicador oficial o número de famílias beneficiadas por urbanização, que não consta no snapshot do HabitaSampa; o painel exibe, de forma explicitamente identificada como proxy, os m² de urbanização finalizada frente aos 4 milhões de m² previstos nas ações estratégicas da meta. As Metas 9 e 11 também têm detalhamento territorial (por distrito/subprefeitura) mais limitado que a Meta 8.
- Os números de "UHs entregues" do GeoSampa (estoque histórico de empreendimentos) e da Meta 8 (entregas desde jan/2025, HabitaSampa) têm escopos diferentes e não devem ser comparados diretamente.
- O campo de estágio dos empreendimentos (`Estagio_mapeamento`) é derivado pela própria SEHAB e apresenta pequenas inconsistências de origem (ex.: variações de grafia e alguns registros classificados em categoria divergente do estágio bruto); foi utilizado como publicado.
- Podem existir pequenas divergências entre números divulgados em diferentes publicações da Prefeitura (ex.: notícias da SEHAB vs. painel HabitaSampa) para uma mesma data; adotei o HabitaSampa como fonte primária e fixei a data de referência para evitar ambiguidade.
- A tabela de exploração de dados carrega todos os registros de uma vez, sem paginação — funcional, mas pode ficar pesada em conexões mais lentas.

## 16. Possíveis Melhorias ou Evoluções da Solução

- Assistente conversacional ("Pergunte aos dados") com arquitetura RAG: consultas agregadas sobre os dados → LLM → resposta com números e fonte citados, evitando respostas livres sem lastro nos dados reais.
- Paginação e/ou virtualização da tabela de exploração de dados para grandes volumes.
- Inclusão de indicadores do Censo IBGE 2022 por distrito como camada de contexto adicional no mapa.
- Script de atualização automática do snapshot de dados, com data de referência dinâmica.
- Tipagem TypeScript mais estrita no frontend (atualmente parte do código usa tipos genéricos) e componentização adicional das telas.

## 17. Instruções de Instalação e Execução (do zero, localmente)

### Pré-requisitos
- Python 3.11 ou superior
- Node.js 20.19 ou superior (ou 22.12+), com npm — exigência do Vite 8

### Estrutura do repositório
```
backend/      API FastAPI + snapshot dos dados (backend/data/processed)
frontend/     Interface React + TypeScript (Vite)
render.yaml   (opcional) blueprint de deploy da API no Render
```

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

A API estará em `http://localhost:8000` (documentação interativa em `/docs`; verificação de saúde em `/health`).

### 2. Frontend (React)

Em **outro terminal**, a partir da raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará em `http://localhost:5173`. Não é necessário criar o arquivo `.env` para rodar localmente (o padrão já é `http://localhost:8000`); para apontar para outra API, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

Build de produção: `npm run build` (saída em `frontend/dist`).

### Ordem de execução
Suba sempre o **backend primeiro**; o frontend depende da API para carregar os dados. Se a API estiver fora do ar, as telas exibem uma mensagem de erro em vez de valores zerados.

### Variáveis de ambiente
| Onde | Variável | Descrição | Padrão |
|---|---|---|---|
| Frontend | `VITE_API_URL` | URL base da API | `http://localhost:8000` |
| Backend | `ALLOWED_ORIGINS` | Origens CORS permitidas, separadas por vírgula | `*` |

### Banco de dados e serviços externos
Não há banco de dados nem serviço externo em tempo de execução: os dados são servidos a partir de arquivos (JSON/GeoJSON) em `backend/data/processed/`.

### Atualizar o snapshot de dados (opcional)
```bash
cd backend
pip install -r requirements-dev.txt
python scripts/atualizar_dados.py
```
O script baixa as camadas do WFS do GeoSampa, reprojeta para WGS84, corrige grafias conhecidas do campo de estágio e compacta os arquivos. Não é necessário para executar ou avaliar o projeto.

## 18. Repositório e Aplicação Publicada

- **Repositório GitHub**: https://github.com/Anajulia3/habitasp
- **Aplicação publicada (frontend — Vercel)**: https://habitasp.vercel.app
- **API publicada (backend — Render)**: https://habitasp-api.onrender.com

> O plano gratuito do Render coloca a API em repouso após um período de inatividade. A primeira requisição após esse período pode levar de 30 a 60 segundos para responder.
