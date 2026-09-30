import os
import csv
import random
import time
from datetime import datetime


# ============================================================
# CyberShield-AI
# SAFE SUSPICIOUS BEHAVIOR SIMULATOR
#
# This does NOT encrypt, delete, rename, or damage files.
# It only generates synthetic behavioral telemetry for ML.
# ============================================================


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)

DATA_DIR = os.path.join(
    BACKEND_DIR,
    "datasets",
    "behavioral"
)

os.makedirs(
    DATA_DIR,
    exist_ok=True
)

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    "simulated_suspicious_data.csv"
)


FIELDS = [
    "timestamp",
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score",
    "label"
]


# ============================================================
# GENERATE ONE SYNTHETIC SUSPICIOUS SAMPLE
# ============================================================

def generate_sample(index):

    # Gradually increase activity to imitate
    # a suspicious behavioral burst.

    cpu_usage = random.uniform(
        65,
        95
    )

    memory_usage = random.uniform(
        70,
        95
    )

    process_count = random.randint(
        300,
        420
    )

    # High file activity is an important
    # ransomware-like behavioral signal.

    file_change_count = random.randint(
        15,
        100
    )

    network_connection_count = random.randint(
        80,
        180
    )

    suspicious_process_count = random.randint(
        2,
        10
    )

    suspicious_score = min(
        100,
        40
        + random.randint(
            20,
            55
        )
    )

    return {

        "timestamp":
            datetime.now().isoformat(),

        "cpu_usage":
            round(
                cpu_usage,
                2
            ),

        "memory_usage":
            round(
                memory_usage,
                2
            ),

        "process_count":
            process_count,

        "file_change_count":
            file_change_count,

        "network_connection_count":
            network_connection_count,

        "suspicious_process_count":
            suspicious_process_count,

        "suspicious_score":
            suspicious_score,

        "label":
            1
    }


# ============================================================
# GENERATE DATASET
# ============================================================

def generate_dataset(
    number_of_samples=100
):

    print()
    print("=" * 70)
    print("CYBERSHIELD-AI SAFE BEHAVIOR SIMULATOR")
    print("=" * 70)

    print(
        "Generating:",
        number_of_samples,
        "synthetic suspicious samples"
    )

    print(
        "No real files will be modified."
    )

    print(
        "No encryption will be performed."
    )

    print(
        "No ransomware will be executed."
    )

    print("=" * 70)


    with open(
        OUTPUT_FILE,
        "w",
        newline=""
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=FIELDS
        )

        writer.writeheader()


        for index in range(
            number_of_samples
        ):

            sample = generate_sample(
                index
            )

            writer.writerow(
                sample
            )


            print(
                f"[{index + 1}/{number_of_samples}] "
                f"CPU={sample['cpu_usage']:.1f}% | "
                f"FILES={sample['file_change_count']} | "
                f"PROC={sample['process_count']} | "
                f"NET={sample['network_connection_count']} | "
                f"SCORE={sample['suspicious_score']}"
            )


    print()
    print("=" * 70)
    print("SIMULATION DATASET CREATED")
    print("=" * 70)

    print(
        "Saved to:"
    )

    print(
        OUTPUT_FILE
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    generate_dataset(
        number_of_samples=100
    )