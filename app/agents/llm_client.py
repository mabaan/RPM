from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional

import httpx


class LLMClient:
    def __init__(self, api_base: str, model: str, temperature: float = 0.2, timeout: float = 30.0):
        self.api_base = api_base.rstrip("/")
        self.model = model
        self.temperature = temperature
        self.timeout = timeout

    def chat(self, messages: List[Dict[str, str]]) -> str:
        url = f"{self.api_base}/v1/chat/completions"
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": 800,
        }
        headers = {"Authorization": f"Bearer {os.getenv('LLM_API_KEY', 'local')}"}
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
        return data["choices"][0]["message"]["content"]


def mock_enabled() -> bool:
    return os.getenv("MOCK_LLM", "true").lower() in {"1", "true", "yes"}


def extract_json(text: str) -> Optional[Dict[str, Any]]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    snippet = text[start : end + 1]
    try:
        return json.loads(snippet)
    except json.JSONDecodeError:
        return None


def try_llm_json(client: Optional[LLMClient], messages: List[Dict[str, str]], retries: int = 1) -> Optional[Dict[str, Any]]:
    if client is None or mock_enabled():
        return None

    attempts = retries + 1
    for _ in range(attempts):
        try:
            content = client.chat(messages)
            parsed = extract_json(content)
            if parsed is not None:
                return parsed
        except Exception:
            continue
    return None
