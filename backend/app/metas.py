import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"


def get_metas():
    """Carrega metas.json e recalcula o percentual de cada meta (atual ÷ alvo)."""
    path = DATA_DIR / "metas.json"
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for meta in data.get("metas", {}).values():
        atual = meta.get("atual_valor", 0)
        alvo = meta.get("meta_valor", 0)
        if alvo > 0:
            meta["percentual"] = round((atual / alvo) * 100, 2)
    return data
