"""
Regenera o snapshot local de dados a partir do WFS do GeoSampa (uso opcional, offline).

Uso (a partir da pasta backend/):
    pip install -r requirements-dev.txt
    python scripts/atualizar_dados.py

A API NÃO chama o GeoSampa em tempo de execução; ela lê apenas os arquivos gerados aqui.
"""
import json
from pathlib import Path

import geopandas as gpd
import pandas as pd

BASE_URL = (
    "http://wfs.geosampa.prefeitura.sp.gov.br/geoserver/ows"
    "?service=WFS&version=2.0.0&request=GetFeature&outputFormat=application/json"
)
LAYERS = {
    "habita_conj": "geoportal:habita2geosampa_habi_conjhabitacional2geosampa_ext",
    "habita_obras": "geoportal:habita2geosampa_habi_obraurbanizacao2geosampa_ext",
    "habita_favela": "geoportal:habita2geosampa_habi_favela2geosampa",
}
# Correções de grafia conhecidas na origem (campo Estagio_mapeamento)
CORRECOES_ESTAGIO = {"Obra paralisda": "Obra paralisada"}
CASAS_DECIMAIS = 6  # ~0,1 m; reduz bastante o tamanho dos arquivos

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"


def _arredondar(coords, n=CASAS_DECIMAIS):
    if isinstance(coords, (int, float)):
        return round(coords, n)
    return [_arredondar(c, n) for c in coords]


def _compactar_geojson(path: Path):
    geo = json.loads(path.read_text(encoding="utf-8"))
    geo.pop("crs", None)
    for feat in geo["features"]:
        if feat.get("geometry"):
            feat["geometry"]["coordinates"] = _arredondar(feat["geometry"]["coordinates"])
    path.write_text(json.dumps(geo, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def baixar_e_processar():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    for nome, typename in LAYERS.items():
        print(f"Processando {nome}...")
        gdf = gpd.read_file(f"{BASE_URL}&typeName={typename}")

        # Reprojeta de SIRGAS2000 (EPSG:31983) para WGS84 (EPSG:4326)
        if gdf.crs is not None and gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)

        if "Estagio_mapeamento" in gdf.columns:
            gdf["Estagio_mapeamento"] = gdf["Estagio_mapeamento"].replace(CORRECOES_ESTAGIO)

        saida = PROCESSED_DIR / f"{nome}.geojson"
        gdf.to_file(saida, driver="GeoJSON")
        _compactar_geojson(saida)
        print(f"  salvo em {saida}")

        if nome == "habita_conj":
            df = pd.DataFrame(gdf.drop(columns="geometry", errors="ignore"))
            df = df.astype(object).where(pd.notnull(df), None)
            tabular = PROCESSED_DIR / "habita_conj_tabular.json"
            tabular.write_text(
                json.dumps(df.to_dict(orient="records"), ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
            print(f"  salvo tabular em {tabular}")


if __name__ == "__main__":
    baixar_e_processar()
