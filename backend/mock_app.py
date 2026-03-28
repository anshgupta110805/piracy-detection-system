import requests
import time
import random
import threading
from datetime import datetime
from payloads import PAYLOADS

API_URL = "http://localhost:8000/monitor"

# ANSI Colors for Terminal Output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
MAGENTA = '\033[95m'
RESET = '\033[0m'

NORMAL_USERS = [
    {"name": "Mike Ross", "role": "Marketing", "ip": "192.168.1.101"},
    {"name": "Sarah Jones", "role": "Billing", "ip": "192.168.1.102"},
    {"name": "Dr. Smith", "role": "Doctor", "ip": "10.0.0.14"}
]

ATTACK_IPS = ["45.33.22.11", "88.99.100.22", "167.88.92.1"]

stats = {"total": 0, "violations": 0}

def send_request(user_info, intent, is_attack=False, is_burst=False):
    payload = random.choice(PAYLOADS[intent])
    
    req_data = {
        "user": f"{user_info['name']} ({user_info['role']})",
        "action": "Automated Action",
        "data_accessed": "System Records",
        "context_text": payload
    }
    
    try:
        # We need a token. We'll authenticate once globally.
        headers = { 'Authorization': f'Bearer {global_token}' }
        
        # We can't actually fake IP addresses in the request easily via requests.post without proxies, 
        # But we can inject it via headers if FastAPI respects X-Forwarded-For
        headers['X-Forwarded-For'] = user_info.get("ip", "127.0.0.1")
        
        res = requests.post(API_URL, json=req_data, headers=headers)
        stats["total"] += 1
        
        if res.status_code == 200:
            data = res.json()
            if data.get('is_violation'):
                stats["violations"] += 1
                color = MAGENTA if is_burst else RED
                print(f"{color}[{datetime.now().strftime('%H:%M:%S')}] ATTACK BLOCKED: {req_data['user']} -> {intent} (Anomaly: {data.get('anomaly_score', 0):.2f}){RESET}")
            elif data.get('escalated'):
                print(f"{YELLOW}[{datetime.now().strftime('%H:%M:%S')}] SUSPICIOUS ESCALATED: {req_data['user']} -> {intent} (Confidence: {data.get('confidence',0)*100:.0f}%){RESET}")
            else:
                if not is_burst:
                    print(f"{GREEN}[{datetime.now().strftime('%H:%M:%S')}] NORMAL: {req_data['user']} -> {intent}{RESET}")
    except Exception as e:
        pass

def normal_traffic_loop():
    while True:
        user = random.choice(NORMAL_USERS[:2]) # Just marketing and billing
        send_request(user, user["role"])
        time.sleep(2)

def suspicious_traffic_loop():
    while True:
        time.sleep(8)
        user = NORMAL_USERS[2] # Doctor
        # Suspicious: doctor trying to access billing maybe?
        send_request(user, "Billing") 

def bot_attack_loop():
    while True:
        time.sleep(15)
        user = {"name": "BotNet_Alpha", "role": "Crawler", "ip": ATTACK_IPS[0]}
        send_request(user, "Piracy", is_attack=True)

def coordinated_burst_loop():
    while True:
        time.sleep(30)
        print(f"{MAGENTA}\n--- INITIATING COORDINATED BURST ATTACK ---{RESET}")
        for i in range(5):
            user = {"name": f"ScrapeNode_{i}", "role": "Bot", "ip": random.choice(ATTACK_IPS)}
            threading.Thread(target=send_request, args=(user, "Piracy", True, True)).start()

def stats_loop():
    while True:
        time.sleep(60)
        rate = (stats["violations"] / stats["total"] * 100) if stats["total"] > 0 else 0
        print(f"\n--- LIVE STATS: {stats['total']} Sent | {stats['violations']} Blocked | {rate:.1f}% Detection Rate ---\n")

if __name__ == "__main__":
    print("Authenticating to backend to start Live Simulator...")
    try:
        login_res = requests.post("http://localhost:8000/login", data={"username": "admin", "password": "admin"})
        global_token = login_res.json()["access_token"]
    except Exception:
        print("Backend must be running!")
        exit()
        
    print("Starting simulation threads...")
    threading.Thread(target=normal_traffic_loop, daemon=True).start()
    threading.Thread(target=suspicious_traffic_loop, daemon=True).start()
    threading.Thread(target=bot_attack_loop, daemon=True).start()
    threading.Thread(target=coordinated_burst_loop, daemon=True).start()
    threading.Thread(target=stats_loop, daemon=True).start()
    
    while True:
        time.sleep(1)
