import os
import sys

# Add backend to Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from dl.threat_alert_engine import calculate_final_risk


print("=" * 65)
print("CYBERSHIELD-AI SAFE THREAT SIMULATOR")
print("=" * 65)

print()
print("No malware will be executed.")
print("No files will be modified.")
print("No registry entries will be changed.")
print()


# ============================================================
# TEST 1 — NORMAL
# ============================================================

print("=" * 65)
print("TEST 1: NORMAL SYSTEM BEHAVIOR")
print("=" * 65)

normal_result = calculate_final_risk(
    lstm_probability=0.02,
    suspicious_score=10.0,
    cpu_usage=25.0,
    memory_usage=60.0,
    process_count=250,
    file_change_count=2,
    network_connection_count=30,
    suspicious_process_count=0,
    registry_change_count=0,
)

print()
print(f"Prediction       : NORMAL")
print(f"LSTM Probability : 0.02")
print(f"Behavior Score   : 10.00")
print(f"Final Risk       : {normal_result.final_risk:.2f}%")
print(f"Risk Level       : {normal_result.risk_level}")
print(f"Threat Alert     : {'YES' if normal_result.alert else 'NO'}")

print()
print("Reasons:")

for reason in normal_result.reasons:
    print(f" - {reason}")


# ============================================================
# TEST 2 — SUSPICIOUS BEHAVIOR
# ============================================================

print()
print("=" * 65)
print("TEST 2: SIMULATED SUSPICIOUS BEHAVIOR")
print("=" * 65)

suspicious_result = calculate_final_risk(
    lstm_probability=0.95,
    suspicious_score=90.0,
    cpu_usage=96.0,
    memory_usage=95.0,
    process_count=500,
    file_change_count=80,
    network_connection_count=180,
    suspicious_process_count=8,
    registry_change_count=5,
)

print()
print(f"Prediction       : SUSPICIOUS")
print(f"LSTM Probability : 0.95")
print(f"Behavior Score   : 90.00")
print(f"Final Risk       : {suspicious_result.final_risk:.2f}%")
print(f"Risk Level       : {suspicious_result.risk_level}")
print(f"Threat Alert     : {'YES' if suspicious_result.alert else 'NO'}")

print()
print("Reasons:")

for reason in suspicious_result.reasons:
    print(f" - {reason}")


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 65)
print("SAFE THREAT SIMULATION COMPLETED")
print("=" * 65)

print()
print("Normal scenario      -> No threat expected")
print("Suspicious scenario  -> High risk / Alert expected")
print()
print("No malware was executed.")
print("No system files were modified.")
print("No registry entries were modified.")
print("=" * 65)