from __future__ import annotations

import json
import os
import threading
from typing import Any, Dict, List, Optional, Protocol

import httpx

try:  # Optional; required for local model execution.
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
except Exception:  # pragma: no cover - handled at runtime
    torch = None
    AutoModelForCausalLM = None
    AutoTokenizer = None


class LLMClient:
    def __init__(
        self,
        api_base: str,
        model: str,
        temperature: float = 0.2,
        timeout: float = 30.0,
        max_tokens: int = 800,
    ):
        self.api_base = api_base.rstrip("/")
        self.model = model
        self.temperature = temperature
        self.timeout = timeout
        self.max_tokens = max_tokens

    def chat(self, messages: List[Dict[str, str]]) -> str:
        url = f"{self.api_base}/v1/chat/completions"
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }
        headers = {"Authorization": f"Bearer {os.getenv('LLM_API_KEY', 'local')}"}
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
        return data["choices"][0]["message"]["content"]


class _LocalModel:
    def __init__(self, model: str):
        if AutoTokenizer is None or AutoModelForCausalLM is None or torch is None:
            raise RuntimeError(
                "Local LLM dependencies not available. Install torch and transformers to use local models."
            )

        hf_token = os.getenv("HF_TOKEN")
        self._tokenizer = AutoTokenizer.from_pretrained(
            model, trust_remote_code=True, token=hf_token
        )
        if self._tokenizer.pad_token_id is None and self._tokenizer.eos_token_id is not None:
            self._tokenizer.pad_token_id = self._tokenizer.eos_token_id
        self._model = AutoModelForCausalLM.from_pretrained(
            model,
            torch_dtype="auto",
            device_map="auto",
            trust_remote_code=True,
            token=hf_token,
        )
        self._model.eval()

    def generate(self, messages: List[Dict[str, str]], temperature: float, max_tokens: int) -> str:
        prompt = self._tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = self._tokenizer(prompt, return_tensors="pt")
        device = next(self._model.parameters()).device
        inputs = {key: value.to(device) for key, value in inputs.items()}

        do_sample = temperature is not None and temperature > 0
        generation_args = {
            "max_new_tokens": max_tokens,
            "do_sample": do_sample,
        }
        if do_sample:
            generation_args["temperature"] = temperature
            generation_args["top_p"] = 0.9

        output = self._model.generate(**inputs, **generation_args)
        result = output[0][inputs["input_ids"].shape[1] :]
        return self._tokenizer.decode(result, skip_special_tokens=True).strip()


class LocalLLMClient:
    def __init__(self, backend: _LocalModel, temperature: float = 0.2, max_tokens: int = 800):
        self._backend = backend
        self.temperature = temperature
        self.max_tokens = max_tokens

    def chat(self, messages: List[Dict[str, str]]) -> str:
        return self._backend.generate(messages, temperature=self.temperature, max_tokens=self.max_tokens)


_LOCAL_MODELS: Dict[str, _LocalModel] = {}
_LOCAL_CLIENTS: Dict[str, LocalLLMClient] = {}
_LOCAL_LOCK = threading.Lock()


class ChatClient(Protocol):
    def chat(self, messages: List[Dict[str, str]]) -> str:
        ...


def get_local_client(model: str, temperature: float = 0.2, max_tokens: int = 800) -> LocalLLMClient:
    key = f"{model}:{temperature}:{max_tokens}"
    with _LOCAL_LOCK:
        if key not in _LOCAL_CLIENTS:
            if model not in _LOCAL_MODELS:
                _LOCAL_MODELS[model] = _LocalModel(model)
            _LOCAL_CLIENTS[key] = LocalLLMClient(_LOCAL_MODELS[model], temperature=temperature, max_tokens=max_tokens)
        return _LOCAL_CLIENTS[key]


def warm_start_models() -> None:
    if os.getenv("WARM_START_MODELS", "true").lower() not in {"1", "true", "yes"}:
        return

    agent1_model = os.getenv("AGENT1_MODEL", "Qwen/Qwen2.5-32B-Instruct")
    agent3_model = os.getenv("AGENT3_MODEL", "Qwen/Qwen2.5-32B-Instruct")
    guard_model = os.getenv("GUARDRAILS_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")

    agent1_temp = float(os.getenv("AGENT1_TEMPERATURE", "0.2"))
    agent3_temp = float(os.getenv("AGENT3_TEMPERATURE", "0.2"))
    guard_temp = float(os.getenv("GUARDRAILS_TEMPERATURE", "0.1"))

    agent1_tokens = int(os.getenv("AGENT1_MAX_TOKENS", "800"))
    agent3_tokens = int(os.getenv("AGENT3_MAX_TOKENS", "800"))
    guard_tokens = int(os.getenv("GUARDRAILS_MAX_TOKENS", "400"))

    get_local_client(agent1_model, temperature=agent1_temp, max_tokens=agent1_tokens)
    get_local_client(agent3_model, temperature=agent3_temp, max_tokens=agent3_tokens)
    get_local_client(guard_model, temperature=guard_temp, max_tokens=guard_tokens)


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


def try_llm_json(client: Optional[ChatClient], messages: List[Dict[str, str]], retries: int = 1) -> Optional[Dict[str, Any]]:
    if client is None:
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
