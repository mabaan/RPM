from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np

try:
    import faiss  # type: ignore
except Exception:  # pragma: no cover - optional at runtime
    faiss = None

try:
    from sentence_transformers import SentenceTransformer  # type: ignore
except Exception:  # pragma: no cover - optional at runtime
    SentenceTransformer = None

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"
SAMPLES_DIR = DATA_DIR / "samples"
PLAYBOOK_DIR = DATA_DIR / "playbooks"
INDEX_DIR = DATA_DIR / "indexes"

EVENT_INDEX_PATH = INDEX_DIR / "events.faiss"
EVENT_META_PATH = INDEX_DIR / "events.jsonl"
PLAYBOOK_INDEX_PATH = INDEX_DIR / "playbooks.faiss"
PLAYBOOK_META_PATH = INDEX_DIR / "playbooks.jsonl"

_EMBEDDER = None
_EVENT_INDEX = None
_EVENT_DOCS: List[Dict[str, str]] = []
_PLAYBOOK_INDEX = None
_PLAYBOOK_DOCS: List[Dict[str, str]] = []


TEAM_MAP = {
    "CustomerService": "Customer Service",
    "DevelopmentIT": "Development / IT",
    "GlobalPolicy": "GlobalPolicy",
}


def _normalize_team(name: str) -> str:
    return TEAM_MAP.get(name, name)


def _load_embedder() -> Optional[SentenceTransformer]:
    global _EMBEDDER
    if _EMBEDDER is not None:
        return _EMBEDDER
    if SentenceTransformer is None:
        return None
    model_name = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
    device = os.getenv("EMBEDDING_DEVICE", "cpu")
    _EMBEDDER = SentenceTransformer(model_name, device=device)
    return _EMBEDDER


def _embed_texts(texts: List[str]) -> Optional[np.ndarray]:
    embedder = _load_embedder()
    if embedder is None:
        return None
    embeddings = embedder.encode(texts, normalize_embeddings=True)
    return embeddings.astype("float32")


def _load_jsonl(path: Path) -> List[Dict[str, str]]:
    records = []
    if not path.exists():
        return records
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        records.append(json.loads(line))
    return records


def _write_jsonl(path: Path, records: List[Dict[str, str]]) -> None:
    lines = [json.dumps(record, ensure_ascii=True) for record in records]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def load_events() -> List[Dict[str, str]]:
    records: List[Dict[str, str]] = []
    for file in SAMPLES_DIR.glob("*.jsonl"):
        for line in file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            records.append(json.loads(line))
    return records


def load_playbooks() -> List[Dict[str, str]]:
    records: List[Dict[str, str]] = []
    for file in PLAYBOOK_DIR.glob("*.md"):
        team = _normalize_team(file.stem)
        text = file.read_text(encoding="utf-8")
        for idx, chunk in enumerate(chunk_text(text, chunk_size=450, overlap=90)):
            records.append(
                {
                    "text": chunk,
                    "team": team,
                    "source": file.name,
                    "chunk_id": f"{file.stem}_{idx}",
                }
            )
    return records


def chunk_text(text: str, chunk_size: int = 450, overlap: int = 90) -> List[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start = max(0, end - overlap)
    return chunks


def build_indexes() -> Tuple[int, int]:
    INDEX_DIR.mkdir(parents=True, exist_ok=True)

    events = load_events()
    playbooks = load_playbooks()

    event_texts = []
    event_docs = []
    for event in events:
        metadata = event.get("metadata", {}) or {}
        extra = " ".join(
            filter(None, [event.get("source"), metadata.get("product"), metadata.get("ticket_id")])
        )
        text = f"{event.get('text','')} {extra}".strip()
        event_texts.append(text)
        event_docs.append(
            {
                "text": event.get("text", ""),
                "source": event.get("source", ""),
                "timestamp": event.get("timestamp", ""),
                "event_id": event.get("event_id", ""),
                "thread_id": event.get("thread_id", ""),
            }
        )

    playbook_texts = [doc["text"] for doc in playbooks]

    if faiss is None:
        raise RuntimeError("faiss is not available. Install faiss-cpu to build indexes.")

    event_embeddings = _embed_texts(event_texts)
    playbook_embeddings = _embed_texts(playbook_texts)
    if event_embeddings is None or playbook_embeddings is None:
        raise RuntimeError("Embeddings model not available to build indexes.")

    event_index = faiss.IndexFlatIP(event_embeddings.shape[1])
    event_index.add(event_embeddings)
    faiss.write_index(event_index, str(EVENT_INDEX_PATH))
    _write_jsonl(EVENT_META_PATH, event_docs)

    playbook_index = faiss.IndexFlatIP(playbook_embeddings.shape[1])
    playbook_index.add(playbook_embeddings)
    faiss.write_index(playbook_index, str(PLAYBOOK_INDEX_PATH))
    _write_jsonl(PLAYBOOK_META_PATH, playbooks)

    return len(event_docs), len(playbooks)


def _load_indexes() -> None:
    global _EVENT_INDEX, _EVENT_DOCS, _PLAYBOOK_INDEX, _PLAYBOOK_DOCS

    if _EVENT_INDEX is None and EVENT_INDEX_PATH.exists() and faiss is not None:
        _EVENT_INDEX = faiss.read_index(str(EVENT_INDEX_PATH))
        _EVENT_DOCS = _load_jsonl(EVENT_META_PATH)

    if _PLAYBOOK_INDEX is None and PLAYBOOK_INDEX_PATH.exists() and faiss is not None:
        _PLAYBOOK_INDEX = faiss.read_index(str(PLAYBOOK_INDEX_PATH))
        _PLAYBOOK_DOCS = _load_jsonl(PLAYBOOK_META_PATH)


def _keyword_rank(query: str, docs: List[Dict[str, str]], top_k: int) -> List[Dict[str, str]]:
    query_terms = set(query.lower().split())
    scored = []
    for doc in docs:
        text = doc.get("text", "").lower()
        score = sum(1 for term in query_terms if term in text)
        scored.append((score, doc))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [doc for score, doc in scored[:top_k] if score > 0]


def retrieve_events(query: str, top_k: int = 5) -> List[Dict[str, str]]:
    _load_indexes()
    if _EVENT_INDEX is not None and _EVENT_DOCS:
        embeddings = _embed_texts([query])
        if embeddings is not None:
            scores, indices = _EVENT_INDEX.search(embeddings, top_k)
            return [
                _EVENT_DOCS[idx]
                for idx in indices[0]
                if idx >= 0 and idx < len(_EVENT_DOCS)
            ]

    events = load_events()
    docs = [
        {
            "text": event.get("text", ""),
            "source": event.get("source", ""),
            "timestamp": event.get("timestamp", ""),
        }
        for event in events
    ]
    return _keyword_rank(query, docs, top_k)


def retrieve_playbooks(query: str, team: Optional[str] = None, top_k: int = 4) -> List[Dict[str, str]]:
    _load_indexes()
    filtered_docs = _PLAYBOOK_DOCS
    if team:
        filtered_docs = [doc for doc in _PLAYBOOK_DOCS if doc.get("team") == team]

    if _PLAYBOOK_INDEX is not None and _PLAYBOOK_DOCS:
        embeddings = _embed_texts([query])
        if embeddings is not None:
            scores, indices = _PLAYBOOK_INDEX.search(embeddings, top_k * 2)
            docs = [
                _PLAYBOOK_DOCS[idx]
                for idx in indices[0]
                if idx >= 0 and idx < len(_PLAYBOOK_DOCS)
            ]
            if team:
                docs = [doc for doc in docs if doc.get("team") == team]
            if docs:
                return docs[:top_k]

    if not filtered_docs:
        filtered_docs = load_playbooks()
        if team:
            filtered_docs = [doc for doc in filtered_docs if doc.get("team") == team]

    return _keyword_rank(query, filtered_docs, top_k)
