# VertexGuard - Academic Live Demo Guide 🎓

✨ **Project Overview**: VertexGuard is an AI-powered Data Privacy and Security Monitoring pipeline that uses DistilBERT NLP and IsolationForest to analyze network traffic intents, identify API scraping anomalies, and block coordinated IP attacks in real-time.

---

### 🚀 How to Start the Demo
We engineered a 1-click startup script that launches the backend, seeds the database, starts the frontend, and initializes the simulated network traffic!

Open a terminal and run:
```bash
sh start_demo.sh
```
*(If the browser doesn't open automatically, go to `http://localhost:5173`)*

---

### 📝 Step-by-Step Teacher Walkthrough (5 Minutes)

#### 1. The Dashboard (Minute 1)
- Log in with `admin` / `admin`.
- **"Professor, this is the main Command Center."** 
- Point out the **Live Audit Trail** filling up with data. Focus on the green `ALLOWED` intents (Medical, Marketing).
- Show the **Traffic Velocity Graph** and **Threat Meter** (currently LOW).

#### 2. The Suspicious Activity (Minute 2)
- Note the terminal output turning yellow as the `mock_app` simulator sends borderline requests (e.g., Marketing users trying to access Medical records).
- Point to the **Dashboard Confidence Bars** turning yellow (<70%) and watch the system automatically mark them as `ESCALATED`.

#### 3. Full Bot Attack (Minute 3)
- The simulator will now trigger a full Piracy scraping attack.
- Watch the **Threat Level** meter glow red and jump to `CRITICAL`.
- Go to the **Threat Center** page.
- Show the massive red Alert Banner. 
- Point out the Anomaly Score progress bars maxing out.
- **Action:** Click "Block IP" on an attacker row and show it being added to the Blacklist panel.

#### 4. The Analytics & AI Detail (Minute 4)
- Go to the **AI Engine Monitor** page.
- Show the live inference feed extracting context and top driver features (keywords) via LIME Text Explainability.
- Share the Confidence Matrix graph.

#### 5. Demo Conclusion (Minute 5)
- Go to **Audit Logs** and show you can Export all logs to CSV.
- Stop the simulation (Ctrl+C).

---

### 🛠️ Technology Stack
* **Frontend**: React.js 18, Vite, Recharts, Framer Motion, HTML5, CSS3 Glassmorphism UI
* **Backend**: FastAPI, Python 3.14, Uvicorn, SQLite/PostgreSQL
* **AI Pipelines**: HuggingFace Transformers (DistilBERT), PyTorch, Scikit-Learn (Isolation Forest), LIME (Explainability)
* **Security Edge**: PyJWT, SlowAPI, NetworkX (Graph Analysis)
