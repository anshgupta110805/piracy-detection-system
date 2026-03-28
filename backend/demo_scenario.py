import time
import requests
from _thread import start_new_thread
from payloads import PAYLOADS
import random

API_URL = "http://localhost:8000/monitor"

GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
CYAN = '\033[96m'
RESET = '\033[0m'

def get_token():
    res = requests.post("http://localhost:8000/login", data={"username": "admin", "password": "admin"})
    return res.json()["access_token"]

def send_req(token, user, role, intent, ip="127.0.0.1"):
    headers = {'Authorization': f'Bearer {token}', 'X-Forwarded-For': ip}
    data = { "user": f"{user} ({role})", "action": "Demo Action", "data_accessed": "Data", "context_text": random.choice(PAYLOADS[intent]) }
    requests.post(API_URL, json=data, headers=headers)

if __name__ == "__main__":
    token = get_token()
    print(f"\n{CYAN}=========================================={RESET}")
    print(f"{CYAN}  STARTING 5-MINUTE ACADEMIC DEMO SCRIPT  {RESET}")
    print(f"{CYAN}=========================================={RESET}\n")

    # PHASE 1
    print(f"{GREEN}[Minute 1] PHASE 1: Normal Operations...{RESET}")
    print("Sending standard traffic. Point teacher to the Dashboard showing ALLOWED events.")
    for i in range(10):
        send_req(token, "Mike Ross", "Marketing", "Marketing")
        time.sleep(1)

    # PHASE 2
    print(f"\n{YELLOW}[Minute 2] PHASE 2: Suspicious Anomalies...{RESET}")
    print("Sending borderline requests. Point teacher to ESCALATED warnings in Audit Trail.")
    for i in range(5):
        send_req(token, "Mike Ross", "Marketing", "Medical") # Wrong intent
        time.sleep(1.5)

    # PHASE 3
    print(f"\n{RED}[Minute 3] PHASE 3: Bot Attack Initiated...{RESET}")
    print("Attacker accessing piracy content. Point teacher to the Threat Meter turning RED.")
    for i in range(5):
        send_req(token, "Scraper_X", "Bot", "Piracy", ip="45.11.22.33")
        time.sleep(1)

    # PHASE 4
    print(f"\n{RED}[Minute 4] PHASE 4: Coordinated Burst Attack...{RESET}")
    print("Multiple IPs hitting system simultaneously. Show the Alerts Sidebar filling up.")
    for i in range(5):
        start_new_thread(send_req, (token, f"Node_{i}", "Crawler", "Piracy", f"100.200.0.{i}"))
    time.sleep(3)

    # PHASE 5
    print(f"\n{GREEN}[Minute 5] PHASE 5: System Recovery...{RESET}")
    print("Attack neutralized. Traffic returns to normal. Threats blocked successfully.")
    for i in range(5):
        send_req(token, "Dr. Smith", "Doctor", "Medical")
        time.sleep(1)
        
    print(f"\n{CYAN}=========================================={RESET}")
    print(f"{CYAN}          DEMO SCRIPT CONCLUDED           {RESET}")
    print(f"{CYAN}=========================================={RESET}\n")
