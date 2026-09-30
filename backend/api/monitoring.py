from fastapi import APIRouter, HTTPException
import time

from dl.behavioral_collector import collect_sample
from dl.lstm_predictor import predict


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
    "suspicious_score"
]


@router.get("/live")
def live_monitoring(
    observations: int = 10,
    interval: int = 1
):
    """
    Collect real system activity and run LSTM prediction.
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

        samples = []
        previous_snapshot = {}

        # -------------------------------------------------
        # COLLECT 10 REAL OBSERVATIONS
        # -------------------------------------------------

        for index in range(observations):

            sample, previous_snapshot = collect_sample(
                previous_snapshot
            )

            samples.append(sample)

            # Don't wait after the final observation
            if index < observations - 1:
                time.sleep(interval)

        # -------------------------------------------------
        # CREATE LSTM SEQUENCE
        # -------------------------------------------------

        sequence = [
            [
                sample[feature]
                for feature in FEATURES
            ]
            for sample in samples
        ]

        # -------------------------------------------------
        # LSTM PREDICTION
        # -------------------------------------------------

        prediction = predict(sequence)

        # -------------------------------------------------
        # LATEST SYSTEM ACTIVITY
        # -------------------------------------------------

        latest = samples[-1]

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {
            "status": "Monitoring Analysis Completed",

            "prediction": prediction["prediction"],

            "label": prediction["label"],

            "probability": prediction["probability"],

            "risk_percent": prediction["risk_percent"],

            "observations": len(samples),

            "interval_seconds": interval,

            "latest_activity": {
                "timestamp": latest["timestamp"],
                "cpu_usage": latest["cpu_usage"],
                "memory_usage": latest["memory_usage"],
                "process_count": latest["process_count"],
                "file_change_count": latest[
                    "file_change_count"
                ],
                "network_connection_count": latest[
                    "network_connection_count"
                ],
                "suspicious_process_count": latest[
                    "suspicious_process_count"
                ],
                "suspicious_score": latest[
                    "suspicious_score"
                ]
            }
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Real-time monitoring failed: {str(e)}"
        )