import json
from functools import lru_cache
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"

_VAZIO = {"type": "FeatureCollection", "features": []}


@lru_cache(maxsize=8)
def load_geojson(filename: str):
    """Lê o GeoJSON do snapshot local uma única vez (cache em memória)."""
    path = DATA_DIR / filename
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return _VAZIO
