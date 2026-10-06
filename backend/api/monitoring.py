from fastapi import APIRouter, HTTPException
import time
from pathlib import Path

from backend.dl.behavioral_collector import (
    collect_sample,
    build_file_snapshot,
    build_location_snapshots,
    get_location_file_changes,
)

from backend.dl.lstm_predictor import predict
from backend.dl.threat_decision_engine import decide_threat
from backend.dl.protection_controller import protect_file


router = APIRouter(
    prefix="/monitoring",
    tags=["Real-Time Monitoring"]
)


FEATURES = [
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score",
]


def is_safe_user_artifact(path: Path) -> bool:
    """
    Only allow protection of user-level files.

    Never allow the protection pipeline to target:
    - Windows system files
    - directories
    """

    try:
        path = path.resolve()

        if not path.exists():
            return False

        if not path.is_file():
            return False

        windows_dir = Path(
            __import__("os").environ.get(
                "WINDIR",
                r"C:\Windows"
            )
        ).resolve()

        try:
            path.relative_to(windows_dir)
            return False
        except ValueError:
            pass

        return True

    except Exception:
        return False


@router.get("/live")
def live_monitoring(
    observations: int = 10,
    interval: int = 1,
    protect_path: str | None = None,
):
    """
    Run real-time behavioral monitoring.

    observations:
        Must be exactly 10 because the LSTM expects 10 samples.

    interval:
        Seconds between observations.

    protect_path:
        Optional user file to pass through the existing
        CyberShield protection pipeline.
    """

    if observations != 10:
        raise HTTPException(
            status_code=400,
            detail="LSTM requires exactly 10 observations."
        )

    if interval < 1 or interval > 60:
        raise HTTPException(
            status_code=400,
            detail="Interval must be between 1 and 60 seconds."
        )

    try:

        # ====================================================
        # EXISTING COMBINED FILE SNAPSHOT
        # ====================================================

        previous_snapshot = build_file_snapshot()

        # ====================================================
        # NEW LOCATION-WISE SNAPSHOT
        #
        # Separately tracks:
        # - User TEMP
        # - Windows TEMP
        # - Downloads
        # ====================================================

        previous_location_snapshots = (
            build_location_snapshots()
        )

        location_change_totals = {
            "user_temp": 0,
            "windows_temp": 0,
            "downloads": 0,
        }

        latest_location_changes = {
            "user_temp": 0,
            "windows_temp": 0,
            "downloads": 0,
        }

        samples = []

        # ====================================================
        # COLLECT 10 OBSERVATIONS
        # ====================================================

        for index in range(observations):

            sample, previous_snapshot = collect_sample(
                previous_snapshot
            )

            # ------------------------------------------------
            # NEW: LOCATION-WISE FILE ACTIVITY
            # ------------------------------------------------

            (
                location_changes,
                previous_location_snapshots
            ) = get_location_file_changes(
                previous_location_snapshots
            )

            for location_key in location_change_totals:

                change_count = location_changes.get(
                    location_key,
                    0
                )

                location_change_totals[
                    location_key
                ] += change_count

                latest_location_changes[
                    location_key
                ] = change_count

            samples.append(sample)

            if index < observations - 1:
                time.sleep(interval)

        # ====================================================
        # LSTM SEQUENCE
        # ====================================================

        sequence = [
            [
                sample[feature]
                for feature in FEATURES
            ]
            for sample in samples
        ]

        prediction = predict(sequence)

        # ====================================================
        # WINDOW ANALYSIS
        # ====================================================

        max_suspicious_score = max(
            sample["suspicious_score"]
            for sample in samples
        )

        total_file_changes = sum(
            sample["file_change_count"]
            for sample in samples
        )

        max_suspicious_processes = max(
            sample["suspicious_process_count"]
            for sample in samples
        )

        max_network_connections = max(
            sample["network_connection_count"]
            for sample in samples
        )

        max_cpu_usage = max(
            sample["cpu_usage"]
            for sample in samples
        )

        max_memory_usage = max(
            sample["memory_usage"]
            for sample in samples
        )

        max_process_count = max(
            sample["process_count"]
            for sample in samples
        )

        # ====================================================
        # THREAT DECISION
        # ====================================================

        threat = decide_threat(
            static_probability=None,
            lstm_probability=prediction["probability"],
            suspicious_score=max_suspicious_score,
            cpu_usage=max_cpu_usage,
            memory_usage=max_memory_usage,
            process_count=max_process_count,
            file_change_count=total_file_changes,
            network_connection_count=max_network_connections,
            suspicious_process_count=max_suspicious_processes,
            registry_change_count=0,
        )

        latest = samples[-1]

        # ====================================================
        # RESPONSE
        # ====================================================

        response = {

            "status":
                "Monitoring Analysis Completed",

            # ------------------------------------------------
            # LSTM
            # ------------------------------------------------

            "lstm": {

                "prediction":
                    prediction["prediction"],

                "label":
                    prediction["label"],

                "probability":
                    prediction["probability"],

                "risk_percent":
                    prediction["risk_percent"],
            },

            # ------------------------------------------------
            # THREAT DECISION
            # ------------------------------------------------

            "threat_decision": {

                "overall_risk":
                    threat.overall_risk,

                "threat_level":
                    threat.threat_level,

                "action":
                    threat.action,

                "confidence":
                    threat.confidence,

                "static_risk":
                    threat.static_risk,

                "behavioral_risk":
                    threat.behavioral_risk,

                "evidence_score":
                    threat.evidence_score,

                "reasons":
                    threat.reasons,
            },

            # ------------------------------------------------
            # WINDOW ANALYSIS
            # ------------------------------------------------

            "window_analysis": {

                "observations_analyzed":
                    len(samples),

                "max_suspicious_score":
                    max_suspicious_score,

                "total_file_changes":
                    total_file_changes,

                "max_suspicious_processes":
                    max_suspicious_processes,

                "max_network_connections":
                    max_network_connections,

                "max_cpu_usage":
                    max_cpu_usage,

                "max_memory_usage":
                    max_memory_usage,
            },

            # =================================================
            # NEW: REAL-TIME FILE MONITORING
            # =================================================

            "file_monitoring": {

                "user_temp": {

                    "label":
                        "User TEMP",

                    "path":
                        "%TEMP%",

                    "status":
                        "MONITORING",

                    "changes_in_window":
                        location_change_totals[
                            "user_temp"
                        ],

                    "latest_changes":
                        latest_location_changes[
                            "user_temp"
                        ],
                },

                "windows_temp": {

                    "label":
                        "Windows TEMP",

                    "path":
                        r"C:\Windows\Temp",

                    "status":
                        "MONITORING",

                    "changes_in_window":
                        location_change_totals[
                            "windows_temp"
                        ],

                    "latest_changes":
                        latest_location_changes[
                            "windows_temp"
                        ],
                },

                "downloads": {

                    "label":
                        "Downloads",

                    "path":
                        r"%USERPROFILE%\Downloads",

                    "status":
                        "MONITORING",

                    "changes_in_window":
                        location_change_totals[
                            "downloads"
                        ],

                    "latest_changes":
                        latest_location_changes[
                            "downloads"
                        ],
                },
            },

            # ------------------------------------------------
            # OBSERVATION INFO
            # ------------------------------------------------

            "observations":
                len(samples),

            "interval_seconds":
                interval,

            # ------------------------------------------------
            # LATEST ACTIVITY
            # ------------------------------------------------

            "latest_activity": {

                "timestamp":
                    latest["timestamp"],

                "cpu_usage":
                    latest["cpu_usage"],

                "memory_usage":
                    latest["memory_usage"],

                "process_count":
                    latest["process_count"],

                "file_change_count":
                    latest["file_change_count"],

                "network_connection_count":
                    latest["network_connection_count"],

                "suspicious_process_count":
                    latest["suspicious_process_count"],

                "suspicious_score":
                    latest["suspicious_score"],
            },

            # ------------------------------------------------
            # PROTECTION
            # ------------------------------------------------

            "protection": {

                "executed":
                    False,

                "message":
                    (
                        "No file was sent to the "
                        "protection pipeline."
                    ),
            },
        }

        # ====================================================
        # OPTIONAL PROTECTION
        # ====================================================

        if protect_path:

            target = Path(
                protect_path
            ).resolve()

            if not is_safe_user_artifact(
                target
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Protection target is invalid "
                        "or belongs to a protected "
                        "system location."
                    ),
                )

            if threat.threat_level in (
                "HIGH",
                "CRITICAL"
            ):

                protection_result = protect_file(
                    file_path=target,

                    static_probability=None,

                    behavioral_metrics={

                        "suspicious_score":
                            max_suspicious_score,

                        "file_change_count":
                            total_file_changes,

                        "suspicious_process_count":
                            max_suspicious_processes,

                        "network_connection_count":
                            max_network_connections,

                        "registry_change_count":
                            0,

                        "cpu_usage":
                            max_cpu_usage,

                        "memory_usage":
                            max_memory_usage,

                        "process_count":
                            max_process_count,
                    },
                )

                response["protection"] = {

                    "executed":
                        True,

                    "threat_level":
                        protection_result.threat_level,

                    "risk_score":
                        protection_result.risk_score,

                    "confidence":
                        protection_result.confidence,

                    "action":
                        protection_result.action,

                    "protection_mode":
                        protection_result.protection_mode,

                    "reason":
                        protection_result.reason,

                    "quarantined":
                        protection_result.quarantined,

                    "quarantine_id":
                        protection_result.quarantine_id,

                    "quarantine_path":
                        protection_result.quarantine_path,
                }

            else:

                response["protection"] = {

                    "executed":
                        False,

                    "message":
                        (
                            "Protection was not executed "
                            "because the monitored threat "
                            "level is "
                            f"{threat.threat_level}. "
                            "No automatic quarantine "
                            "performed."
                        ),
                }

        return response

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Real-time monitoring failed: "
                f"{str(e)}"
            ),
        )