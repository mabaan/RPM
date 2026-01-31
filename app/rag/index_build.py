from __future__ import annotations

from .retrieve import build_indexes


if __name__ == "__main__":
    events, playbooks = build_indexes()
    print(f"Built {events} event vectors and {playbooks} playbook vectors.")
