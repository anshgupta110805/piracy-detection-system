import json
import random
from datetime import datetime, timedelta
from payloads import PAYLOADS

INTENTS = ["Marketing", "Billing", "Medical", "Piracy"]

USERS = [
    "Dr. Smith (Doctor)", "Nurse Joy (Nurse)", "Sarah Jones (Billing)",
    "Mike Ross (Marketing)", "Admin System (System)"
]
BOTS = ["Shadow_Script (Bot)", "Data_Harvester (Crawler)", "Anom_User_99 (Scraper)"]

NORMAL_IPS = ["192.168.1.55", "192.168.1.102", "10.0.0.15", "10.0.0.42", "172.16.0.4"]
ATTACKER_IPS = ["45.33.22.11", "88.99.100.22", "167.88.92.1"]

def generate_mock_data():
    entries = []
    now = datetime.now()
    
    for i in range(200):
        # 80% normal traffic, 20% attacks
        is_attack = random.random() < 0.20
        
        if is_attack:
            ip = random.choice(ATTACKER_IPS)
            user = random.choice(BOTS)
            intent = "Piracy"
            confidence = round(random.uniform(0.70, 0.99), 2)
            anomaly_score = round(random.uniform(0.6, 1.0), 2)
            is_violation = True
            escalated = False
            action = "Scraping/Dumping data"
        else:
            ip = random.choice(NORMAL_IPS)
            user = random.choice(USERS)
            if "Doctor" in user or "Nurse" in user:
                intent = "Medical"
            elif "Billing" in user:
                intent = "Billing"
            elif "Marketing" in user:
                intent = "Marketing"
            else:
                intent = random.choice(["Marketing", "Billing", "Medical"])
                
            # Allow some accidental errors/low confidence
            if random.random() < 0.1:
                confidence = round(random.uniform(0.45, 0.69), 2)
                escalated = True
                is_violation = False
            else:
                confidence = round(random.uniform(0.85, 0.99), 2)
                escalated = False
                is_violation = False
                
            anomaly_score = round(random.uniform(-1.0, 0.2), 2)
            action = "Accessing module"

        payload = random.choice(PAYLOADS[intent])
        
        # Time spread across last 7 days
        days_ago = random.uniform(0, 7)
        timestamp = now - timedelta(days=days_ago)

        entry = {
            "timestamp": timestamp.isoformat(),
            "user": user,
            "action": action,
            "data_accessed": "System Data",
            "context_text": payload,
            "intent": intent,
            "confidence": confidence,
            "anomaly_score": anomaly_score,
            "ip_address": ip,
            "is_violation": is_violation,
            "escalated": escalated,
            "top_features": payload.split()[:3]
        }
        entries.append(entry)

    # Sort chronologically
    entries.sort(key=lambda x: x["timestamp"])

    with open("sample_data.json", "w") as f:
        json.dump(entries, f, indent=4)
        
    print(f"✅ Generated 200 realistic audit entries in sample_data.json")

if __name__ == "__main__":
    generate_mock_data()
