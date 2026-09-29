import json
import os
from contextlib import asynccontextmanager
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.mapa import load_geojson
from app.metas import get_metas

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"


@lru_cache(maxsize=1)
def load_registros():
    """Tabela de empreendimentos (sem geometria), lida uma única vez."""
    path = DATA_DIR / "habita_conj_tabular.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Aquece o cache na inicialização para que a primeira requisição seja rápida
    load_registros()
    for nome in ("habita_conj.geojson", "habita_obras.geojson", "habita_favela.geojson"):
        load_geojson(nome)
    yield


app = FastAPI(
    title="HabitaSP API",
    description="API do Painel Territorial de Acompanhamento da Política Habitacional de São Paulo (SEHAB)",
    version="1.0.0",
    lifespan=lifespan,
)

# Origens permitidas: por padrão qualquer origem (API pública, somente leitura, sem credenciais).
# Em produção pode-se restringir: ALLOWED_ORIGINS="https://seu-app.vercel.app,http://localhost:5173"
_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)
# Os GeoJSON são grandes; a compressão reduz muito o tempo de carga (importante no plano gratuito)
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do HabitaSP", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/metas")
def get_api_metas():
    return get_metas().get("metas", {})


@app.get("/api/meta-info")
def get_api_meta_info():
    data = get_metas()
    return {
        "data_referencia": data.get("data_referencia", "Agosto de 2026"),
        "fonte_primaria": data.get("fonte_primaria", "HabitaSampa"),
        "indicadores_complementares": data.get("indicadores_complementares", {}),
    }


@app.get("/api/mapa/empreendimentos")
def get_empreendimentos():
    return load_geojson("habita_conj.geojson")


@app.get("/api/mapa/obras-urbanizacao")
def get_obras():
    return load_geojson("habita_obras.geojson")


@app.get("/api/mapa/favelas")
def get_favelas():
    return load_geojson("habita_favela.geojson")


@app.get("/api/dados")
def get_dados(distrito: str = Query(None, description="Filtrar por distrito")):
    records = load_registros()
    if distrito and distrito != "Todos":
        records = [r for r in records if r.get("Distrito") == distrito]
    return {"total": len(records), "data": records}
