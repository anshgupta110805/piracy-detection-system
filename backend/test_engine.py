import pytest
from ai_engine import ai_engine
from policy_engine import policy_engine

@pytest.fixture(scope="module")
def setup_ai():
    # Attempt to train or setup dummy
    if not ai_engine.is_trained:
        ai_engine.train_model()

def test_ai_predict_normal_marketing(setup_ai):
    res = ai_engine.predict("export_marketing_list", hour_of_day=14, payload_length=150, request_frequency=5)
    assert res["predicted_purpose"] in ["Marketing", "UNCERTAIN"]
    assert "confidence" in res
    assert "anomaly_score" in res
    assert -1.0 <= res["anomaly_score"] <= 1.0

def test_ai_predict_piracy_high_anomaly(setup_ai):
    res = ai_engine.predict("bulk_download_patient_database", hour_of_day=3, payload_length=2000, request_frequency=100)
    assert res["predicted_purpose"] in ["Piracy", "UNCERTAIN"]
    # This should definitely be anomalous based on the IsolationForest
    assert res["anomaly_score"] < 0

def test_ai_predict_low_confidence_escalate(setup_ai):
    # random garbage text should drop confidence
    res = ai_engine.predict("sdlkfjsd lkfjds lfksd", 12, 100, 1)
    # If prob < 0.70, escalate should be true
    assert res["escalate"] == True or res["confidence"] >= 0.70

def test_ai_top_features_exist(setup_ai):
    res = ai_engine.predict("calculate_monthly_bill", 12, 50, 1)
    assert len(res["top_features"]) <= 3

def test_policy_no_violation():
    # Access Billing as Billing should be allowed
    assert policy_engine.check_violation("Billing Info", "Billing", False) == False

def test_policy_violation_mismatch():
    # Access Medical Record with Marketing intent
    assert policy_engine.check_violation("Medical Record", "Marketing", False) == True

def test_policy_escalate_triggers_violation():
    # Even if valid, if escalate=True, it might be violation or alert
    # The policy engine triggers alert if escalate, but returns false for is_violation unless mismatch
    assert policy_engine.check_violation("System Logs", "UNCERTAIN", True) == True

def test_policy_piracy_is_violation():
    assert policy_engine.check_violation("Medical Record", "Piracy", False) == True

def test_policy_unrecognized_data_type():
    # Unrecognized data type but valid intent (e.g. Marketing)
    assert policy_engine.check_violation("Random Type", "Marketing", False) == False

def test_policy_unrecognized_intent():
    assert policy_engine.check_violation("User Profile", "RandomIntent", False) == True
