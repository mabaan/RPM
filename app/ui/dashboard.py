import os
import requests
import streamlit as st

API_URL = os.getenv("API_URL", "http://localhost:8000")

st.set_page_config(page_title="Incident Radar", layout="wide")

st.title("Customer Incident Radar")

limit = st.number_input("Number of sample incidents", min_value=1, max_value=20, value=5)

if st.button("Run demo"):
    with st.spinner("Processing incidents..."):
        response = requests.post(f"{API_URL}/demo/run", json={"limit": limit}, timeout=60)
        if response.ok:
            cards = response.json()
            for card in cards:
                st.subheader(f"{card['routing']['primary_team']} - {card['routing']['priority']}")
                st.write(card["signals"]["summary"])
                st.json(card)
        else:
            st.error(response.text)
