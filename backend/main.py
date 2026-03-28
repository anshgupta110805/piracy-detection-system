from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import datetime
import json
import os
import jwt

from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, JSON
from sqlalchemy.orm import sessionmaker, declarative_base

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# 1. DATABASE SETUP
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vertexguard.db")
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String, index=True)
    user = Column(String)
    action = Column(String)
    data_accessed = Column(String)
    intent = Column(String)
    confidence = Column(Float)
    anomaly_score = Column(Float)
    ip_address = Column(String)
    is_violation = Column(Boolean)
    escalated = Column(Boolean)
    top_features = Column(JSON)

Base.metadata.create_all(bind=engine)

# 2. FASTAPI APP & PLUGINS
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="VertexGuard API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. JWT AUTH SETUP
SECRET_KEY = "supersecretkey_vertexguard"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/login")
def login(req: LoginRequest):
    if req.username == "admin" and req.password == "admin":
        return {"access_token": create_access_token({"sub": req.username}), "token_type": "bearer"}
    raise HTTPException(status_code=400, detail="Incorrect username or password")

# 4. BOT FINGERPRINTING MIDDLEWARE
@app.middleware("http")
async def bot_fingerprint_middleware(request: Request, call_next):
    user_agent = request.headers.get("user-agent", "").lower()
    if request.url.path not in ["/ws", "/login"] and request.method != "OPTIONS":
        if not user_agent or "python-requests" in user_agent or "curl" in user_agent:
            return JSONResponse(status_code=403, content={"detail": "Bot Traffic Detected"})
    return await call_next(request)

# 5. REQUEST MODELS
class MonitorRequest(BaseModel):
    user: str
    action: str
    data_accessed: str
    context_text: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AlertPayload(BaseModel):
    violation: bool
    escalate: bool
    purpose: str
    data_type: str
    time: str

# 6. WEBSOCKET MANAGER
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass

manager = ConnectionManager()

from ai_engine import ai_engine
from policy_engine import policy_engine

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/internal-alert")
def receive_alert(payload: AlertPayload):
    print(f"WEBHOOK ALERT TRIGGERED: {payload.dict()}")
    return {"status": "received"}

@app.post("/monitor")
@limiter.limit("30/minute")
async def monitor_usage(request: Request, req: MonitorRequest, token: str = Depends(verify_token)):
    ip_address = request.client.host if request.client else "127.0.0.1"
    
    hour = datetime.datetime.now().hour
    payload_len = len(req.context_text)
    
    ai_result = ai_engine.predict(req.context_text, hour_of_day=hour, payload_length=payload_len, request_frequency=2)
    
    predicted_purpose = ai_result["predicted_purpose"]
    confidence = ai_result["confidence"]
    escalate = ai_result["escalate"]
    anomaly_score = ai_result["anomaly_score"]
    top_features = ai_result["top_features"]
    
    is_violation = policy_engine.check_violation(req.data_accessed, predicted_purpose, escalate)
    
    timestamp = datetime.datetime.now().isoformat()
    
    db = SessionLocal()
    db_log = AuditLog(
        timestamp=timestamp,
        user=req.user,
        action=req.action,
        data_accessed=req.data_accessed,
        intent=predicted_purpose,
        confidence=confidence,
        anomaly_score=anomaly_score,
        ip_address=ip_address,
        is_violation=is_violation,
        escalated=escalate,
        top_features=top_features
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    db.close()
    
    log_dict = {
        "id": db_log.id,
        "timestamp": db_log.timestamp,
        "user": db_log.user,
        "action": db_log.action,
        "data_accessed": db_log.data_accessed,
        "predicted_purpose": db_log.intent,
        "confidence": db_log.confidence,
        "anomaly_score": db_log.anomaly_score,
        "is_violation": db_log.is_violation,
        "escalated": db_log.escalated,
        "top_features": db_log.top_features,
        "ip_address": db_log.ip_address
    }
    
    await manager.broadcast(log_dict)
    return log_dict

@app.get("/history")
def get_history(token: str = Depends(verify_token)):
    db = SessionLocal()
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(100).all()
    db.close()
    
    res = []
    for l in logs:
        res.append({
            "id": l.id,
            "timestamp": l.timestamp,
            "user": l.user,
            "action": l.action,
            "data_accessed": l.data_accessed,
            "predicted_purpose": l.intent,
            "confidence": l.confidence,
            "anomaly_score": l.anomaly_score,
            "is_violation": l.is_violation,
            "escalated": l.escalated,
            "top_features": l.top_features,
            "ip_address": l.ip_address
        })
    return res

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
