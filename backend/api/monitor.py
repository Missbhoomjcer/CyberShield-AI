from fastapi import APIRouter, HTTPException
from datetime import datetime
from collections import deque
import os
import sys
import numpy as np
import torch


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/monitor",
    tags=["Activity Monitor"]
)


# =========================================================
# PATH SETUP
# =========================================================

BACKEND_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


# =========================================================
# IMPORT MONITORING FUNCTIONS
# =========================================================

try:
    from monitoring.cpu_monitor import get_cpu_usage
    from monitoring.memory_monitor import get_memory_usage

    from monitoring.process_monitor import (
        get_process_count,
        get_suspicious_process_count,
    )

    from monitoring.file_monitor import get_file_change_count

    from monitoring.network_monitor import (
        get_network_connection_count
    )

    from monitoring.registry_monitor import (
        get_registry_snapshot,
        get_registry_change_count,
    )

    from monitoring.monitor_manager import (
        calculate_suspicious_score,
        predict_lstm,
        SEQUENCE_LENGTH,
    )

    from dl.threat_alert_engine import (
        calculate_final_risk
    )

    MONITOR_AVAILABLE = True
    MONITOR_ERROR = None

except Exception as e:

    MONITOR_AVAILABLE = False
    MONITOR_ERROR = str(e)


# =========================================================
# MONITOR STATE
# =========================================================

monitoring = False

sequence_buffer = deque(
    maxlen=10
)

previous_registry_snapshot = None

activity_log = []


# =========================================================
# ADD ACTIVITY EVENT
# =========================================================

def add_activity_event(
    event_type,
    text
):

    global activity_log

    event = {
        "id": int(
            datetime.now().timestamp() * 1000
        ),
        "type": event_type,
        "text": text,
        "time": datetime.now().strftime(
            "%H:%M:%S"
        )
    }

    activity_log.insert(
        0,
        event
    )

    activity_log = activity_log[:30]


# =========================================================
# COLLECT LIVE METRICS
# =========================================================

def collect_metrics():

    global previous_registry_snapshot

    if not MONITOR_AVAILABLE:

        raise RuntimeError(
            f"Monitoring engine unavailable: "
            f"{MONITOR_ERROR}"
        )

    # -----------------------------------------------------
    # BASIC SYSTEM METRICS
    # -----------------------------------------------------

    cpu_usage = get_cpu_usage()

    memory_usage = get_memory_usage()

    process_count = get_process_count()

    suspicious_process_count = (
        get_suspicious_process_count()
    )

    file_change_count = get_file_change_count(
        interval=0.2
    )

    network_connection_count = (
        get_network_connection_count()
    )

    # -----------------------------------------------------
    # SUSPICIOUS SCORE
    # -----------------------------------------------------

    suspicious_score = (
        calculate_suspicious_score(
            cpu_usage,
            memory_usage,
            process_count,
            file_change_count,
            network_connection_count,
            suspicious_process_count,
        )
    )

    # -----------------------------------------------------
    # REGISTRY MONITORING
    # -----------------------------------------------------

    current_registry_snapshot = (
        get_registry_snapshot()
    )

    registry_change_count = 0

    if previous_registry_snapshot is not None:

        registry_change_count = (
            get_registry_change_count(
                previous_registry_snapshot,
                current_registry_snapshot,
            )
        )

    previous_registry_snapshot = (
        current_registry_snapshot
    )

    # -----------------------------------------------------
    # BUILD LSTM FEATURE VECTOR
    # -----------------------------------------------------

    feature_vector = [

        cpu_usage,

        memory_usage,

        process_count,

        file_change_count,

        network_connection_count,

        suspicious_process_count,

        suspicious_score,
    ]

    sequence_buffer.append(
        feature_vector
    )

    # -----------------------------------------------------
    # DEFAULT LSTM DATA
    # -----------------------------------------------------

    lstm_prediction = "COLLECTING DATA"

    lstm_probability = 0.0

    final_risk = suspicious_score

    risk_level = "LOW"

    alert = False

    reasons = [
        "Collecting behavioral data for analysis"
    ]

    # -----------------------------------------------------
    # RUN LSTM AFTER ENOUGH SAMPLES
    # -----------------------------------------------------

    if len(sequence_buffer) >= SEQUENCE_LENGTH:

        lstm_prediction, lstm_probability = (
            predict_lstm(
                list(sequence_buffer)
            )
        )

        threat_result = calculate_final_risk(

            lstm_probability=lstm_probability,

            suspicious_score=suspicious_score,

            cpu_usage=cpu_usage,

            memory_usage=memory_usage,

            process_count=process_count,

            file_change_count=file_change_count,

            network_connection_count=(
                network_connection_count
            ),

            suspicious_process_count=(
                suspicious_process_count
            ),

            registry_change_count=(
                registry_change_count
            ),
        )

        final_risk = (
            threat_result.final_risk
        )

        risk_level = (
            threat_result.risk_level
        )

        alert = (
            threat_result.alert
        )

        reasons = (
            threat_result.reasons
        )

    # -----------------------------------------------------
    # CREATE ACTIVITY EVENTS
    # -----------------------------------------------------

    add_activity_event(
        "info",
        f"CPU usage: {cpu_usage}% | "
        f"Memory: {memory_usage}%"
    )

    if file_change_count > 0:

        add_activity_event(
            "file",
            f"Detected {file_change_count} "
            f"file changes"
        )

    if suspicious_process_count > 0:

        add_activity_event(
            "warning",
            f"Detected {suspicious_process_count} "
            f"suspicious processes"
        )

    if alert:

        add_activity_event(
            "critical",
            f"Threat Alert: {risk_level} risk "
            f"({final_risk:.2f}%)"
        )

    # -----------------------------------------------------
    # RETURN DATA
    # -----------------------------------------------------

    return {

        "monitoring": monitoring,

        "timestamp": (
            datetime.now().isoformat()
        ),

        "metrics": {

            "cpuUsage": cpu_usage,

            "memoryUsage": memory_usage,

            "processCount": process_count,

            "fileModRate": file_change_count,

            "networkConnections": (
                network_connection_count
            ),

            "suspiciousProcesses": (
                suspicious_process_count
            ),

            "suspiciousScore": (
                suspicious_score
            ),

            "registryChanges": (
                registry_change_count
            ),
        },

        "lstm": {

            "status": lstm_prediction,

            "probability": (
                round(
                    lstm_probability * 100,
                    2
                )
            ),

            "samplesCollected": (
                len(sequence_buffer)
            ),

            "samplesRequired": (
                SEQUENCE_LENGTH
            ),
        },

        "threat": {

            "risk": round(
                final_risk,
                2
            ),

            "riskLevel": risk_level,

            "alert": alert,

            "reasons": reasons,
        },

        "activity": activity_log,
    }


# =========================================================
# START MONITORING
# =========================================================

@router.post("/start")
def start_monitoring():

    global monitoring
    global sequence_buffer
    global previous_registry_snapshot
    global activity_log

    if not MONITOR_AVAILABLE:

        raise HTTPException(
            status_code=500,
            detail=(
                "Monitoring engine unavailable: "
                f"{MONITOR_ERROR}"
            )
        )

    monitoring = True

    sequence_buffer.clear()

    activity_log.clear()

    previous_registry_snapshot = (
        get_registry_snapshot()
    )

    add_activity_event(
        "info",
        "Real-time monitoring started"
    )

    return {
        "status": "Monitoring started",
        "monitoring": True
    }


# =========================================================
# STOP MONITORING
# =========================================================

@router.post("/stop")
def stop_monitoring():

    global monitoring

    monitoring = False

    add_activity_event(
        "info",
        "Real-time monitoring stopped"
    )

    return {
        "status": "Monitoring stopped",
        "monitoring": False
    }


# =========================================================
# GET MONITOR STATUS
# =========================================================

@router.get("/status")
def get_monitor_status():

    return {

        "monitoring": monitoring,

        "monitor_available": (
            MONITOR_AVAILABLE
        ),

        "error": MONITOR_ERROR,

        "samplesCollected": (
            len(sequence_buffer)
        ),

        "samplesRequired": (
            SEQUENCE_LENGTH
        ),
    }


# =========================================================
# GET LIVE METRICS
# =========================================================

@router.get("/metrics")
def get_monitor_metrics():

    if not monitoring:

        return {

            "monitoring": False,

            "message": (
                "Monitoring is currently stopped"
            ),

            "activity": activity_log,
        }

    try:

        return collect_metrics()

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )