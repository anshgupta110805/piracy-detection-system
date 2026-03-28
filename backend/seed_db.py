import json
from sqlalchemy.orm import Session
from main import SessionLocal, AuditLog

def seed_database():
    try:
        with open("sample_data.json", "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ sample_data.json not found. Run mock_data.py first!")
        return

    db = SessionLocal()
    
    print("Clearing old audit logs...")
    db.query(AuditLog).delete()
    db.commit()

    print(f"Seeding {len(data)} records...")
    
    for i, item in enumerate(data):
        log = AuditLog(
            timestamp=item["timestamp"],
            user=item["user"],
            action=item["action"],
            data_accessed=item["data_accessed"],
            intent=item["intent"],
            confidence=item["confidence"],
            anomaly_score=item["anomaly_score"],
            ip_address=item["ip_address"],
            is_violation=item["is_violation"],
            escalated=item["escalated"],
            top_features=item["top_features"]
        )
        db.add(log)
        if i % 50 == 0 and i > 0:
            print(f"Inserted {i} records...")
            
    db.commit()
    db.close()
    print("✅ Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
