import torch
from torch.utils.data import DataLoader, Dataset
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import pandas as pd
import numpy as np
from lime.lime_text import LimeTextExplainer
from sklearn.ensemble import IsolationForest

class AIDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=64):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, item):
        text = str(self.texts[item])
        label = self.labels[item]
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            return_token_type_ids=False,
            padding='max_length',
            return_attention_mask=True,
            return_tensors='pt',
            truncation=True
        )
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

class AIEngine:
    def __init__(self):
        self.model_name = 'distilbert-base-uncased'
        self.tokenizer = None
        self.model = None
        self.explainer = None
        self.anomaly_detector = None
        self.label_map = {"Marketing": 0, "Billing": 1, "Medical": 2, "Piracy": 3}
        self.id2label = {v: k for k, v in self.label_map.items()}
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.is_trained = False
        
    def train_model(self):
        print("Downloading/Loading DistilBERT weights...")
        self.tokenizer = DistilBertTokenizer.from_pretrained(self.model_name)
        self.model = DistilBertForSequenceClassification.from_pretrained(self.model_name, num_labels=4)
        self.model.to(self.device)

        data = [
            ("send_marketing_email", "Marketing"),
            ("export_marketing_list", "Marketing"),
            ("calculate_monthly_bill", "Billing"),
            ("process_payment", "Billing"),
            ("view_patient_diagnosis", "Medical"),
            ("update_medical_record", "Medical"),
            ("check_drug_interaction", "Medical"),
            ("run_analytics_campaign", "Marketing"),
            ("generate_invoice", "Billing"),
            ("bulk_download_patient_database", "Piracy"),
            ("scrape_user_profiles_selenium", "Piracy"),
            ("bypass_access_control_script", "Piracy"),
            ("mass_export_medical_records", "Piracy"),
            ("unauthorized_database_dump", "Piracy")
        ]
        df = pd.DataFrame(data, columns=["context", "purpose"])
        df['label'] = df['purpose'].map(self.label_map)
        
        dataset = AIDataset(df['context'].to_numpy(), df['label'].to_numpy(), self.tokenizer)
        loader = DataLoader(dataset, batch_size=4, shuffle=True)
        
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=5e-5)
        self.model.train()
        
        print("Fine-tuning DistilBERT on 4 intents...")
        for batch in loader:
            optimizer.zero_grad()
            input_ids = batch['input_ids'].to(self.device)
            attention_mask = batch['attention_mask'].to(self.device)
            labels = batch['labels'].to(self.device)
            
            outputs = self.model(input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            
        print("Training IsolationForest for Anomaly Detection...")
        np.random.seed(42)
        X_normal = np.random.normal([12, 150, 5], [4, 50, 2], (1000, 3))
        X_abnormal = np.random.normal([3, 1000, 50], [1, 200, 10], (50, 3))
        X_anomaly = np.vstack([X_normal, X_abnormal])
        self.anomaly_detector = IsolationForest(contamination=0.05, random_state=42)
        self.anomaly_detector.fit(X_anomaly)

        print("Initializing LIME Explainer...")
        self.explainer = LimeTextExplainer(class_names=list(self.label_map.keys()))

        self.is_trained = True
        print("Model fine-tuned and anomaly detection ready.")
        
    def predict(self, context_text, hour_of_day=12, payload_length=100, request_frequency=2):
        if not self.is_trained:
            self.train_model()
            
        self.model.eval()
        encoding = self.tokenizer.encode_plus(
            context_text,
            add_special_tokens=True,
            max_length=64,
            return_token_type_ids=False,
            padding='max_length',
            return_attention_mask=True,
            return_tensors='pt',
            truncation=True
        )
        
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        
        with torch.no_grad():
            outputs = self.model(input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=1).cpu().numpy()[0]
            
        max_prob = float(np.max(probs))
        predicted_class_idx = int(np.argmax(probs))
        predicted_class = self.id2label[predicted_class_idx]
        
        escalate = False
        if max_prob < 0.70:
            predicted_class = "UNCERTAIN"
            escalate = True
            
        # TASK 2: Anomaly Detection
        features = np.array([[hour_of_day, payload_length, request_frequency]])
        anomaly_score_raw = self.anomaly_detector.decision_function(features)[0]
        anomaly_score = float(-anomaly_score_raw) 
        anomaly_score = max(-1.0, min(1.0, anomaly_score))

        # TASK 8: LIME Explainability
        def predictor(texts):
            encodings = self.tokenizer(texts, truncation=True, padding=True, max_length=64, return_tensors='pt')
            encodings = {k: v.to(self.device) for k, v in encodings.items()}
            with torch.no_grad():
                outputs = self.model(**encodings)
                probs = torch.nn.functional.softmax(outputs.logits, dim=1)
            return probs.cpu().numpy()
            
        try:
            exp = self.explainer.explain_instance(context_text, predictor, num_features=3, top_labels=1)
            explanation = exp.as_list(exp.available_labels()[0])
            top_features = [word for word, score in explanation]
        except Exception:
            top_features = ["context"]
            
        return {
            "predicted_purpose": predicted_class,
            "confidence": max_prob,
            "escalate": escalate,
            "anomaly_score": anomaly_score,
            "top_features": top_features
        }

ai_engine = AIEngine()
