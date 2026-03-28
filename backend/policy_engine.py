import requests
import datetime

class PolicyEngine:
    def __init__(self):
        self.webhook_url = "http://localhost:8000/internal-alert"
    
    def check_violation(self, data_type, predicted_purpose, escalate):
        is_violation = False
        
        if predicted_purpose == "Piracy":
            is_violation = True
        else:
            allowed = {
                "Medical Record": ["Medical"],
                "Billing Info": ["Billing"],
                "User Profile": ["Marketing", "Billing", "Medical"],
                "System Logs": ["Admin", "Security"]
            }
            
            if data_type not in allowed:
                is_violation = predicted_purpose not in ["Medical", "Billing", "Marketing"]
            else:
                is_violation = predicted_purpose not in allowed[data_type]
                
        # Upgrade 5: Alert System
        if is_violation or escalate:
            self.trigger_alert({
                "violation": is_violation,
                "escalate": escalate,
                "purpose": predicted_purpose,
                "data_type": data_type,
                "time": datetime.datetime.now().isoformat()
            })
            
        return is_violation

    def trigger_alert(self, payload):
        try:
            requests.post(self.webhook_url, json=payload, timeout=1.0)
        except requests.exceptions.RequestException:
            # Silently handle webhook failure
            pass

policy_engine = PolicyEngine()
