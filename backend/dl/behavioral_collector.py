import os
import csv
import time
from datetime import datetime

import psutil


# ============================================================
# CyberShield-AI
# Behavioral Data Collector
#
# Collects system activity over time for LSTM training.
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
    "behavioral_data.csv"
)


# ============================================================
# CSV COLUMNS
# ============================================================

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
# SUSPICIOUS PROCESS NAMES
# ============================================================

SUSPICIOUS_PROCESS_NAMES = {

    "powershell.exe",
    "cmd.exe",
    "wscript.exe",
    "cscript.exe",
    "mshta.exe",
    "rundll32.exe",
    "regsvr32.exe",
    "certutil.exe"
}


# ============================================================
# GET PROCESS COUNT
# ============================================================

def get_process_information():

    total_processes = 0
    suspicious_processes = 0

    try:

        for process in psutil.process_iter(
            ["name"]
        ):

            total_processes += 1

            try:

                name = process.info["name"]

                if name:

                    name = name.lower()

                    if name in SUSPICIOUS_PROCESS_NAMES:

                        suspicious_processes += 1

            except (
                psutil.NoSuchProcess,
                psutil.AccessDenied
            ):

                continue

    except Exception:

        pass

    return (
        total_processes,
        suspicious_processes
    )


# ============================================================
# GET NETWORK CONNECTION COUNT
# ============================================================

def get_network_connections():

    try:

        connections = psutil.net_connections()

        return len(connections)

    except Exception:

        return 0


# ============================================================
# GET FILE CHANGE COUNT
#
# This is a lightweight approximation.
# We count changes inside the user's Downloads folder.
# ============================================================

def get_file_change_count(previous_snapshot):

    downloads_folder = os.path.join(
        os.path.expanduser("~"),
        "Downloads"
    )

    current_snapshot = {}

    if not os.path.exists(
        downloads_folder
    ):

        return 0, current_snapshot


    try:

        for root, dirs, files in os.walk(
            downloads_folder
        ):

            # Avoid excessively large scans
            dirs[:] = dirs[:50]

            for filename in files[:500]:

                path = os.path.join(
                    root,
                    filename
                )

                try:

                    modified_time = os.path.getmtime(
                        path
                    )

                    current_snapshot[path] = modified_time

                except (
                    OSError,
                    PermissionError
                ):

                    continue

    except Exception:

        return 0, current_snapshot


    if not previous_snapshot:

        return 0, current_snapshot


    changes = 0


    # New files / modified files

    for path, modified_time in current_snapshot.items():

        if path not in previous_snapshot:

            changes += 1

        elif previous_snapshot[path] != modified_time:

            changes += 1


    # Deleted files

    for path in previous_snapshot:

        if path not in current_snapshot:

            changes += 1


    return (
        changes,
        current_snapshot
    )


# ============================================================
# CALCULATE SUSPICIOUS SCORE
# ============================================================

def calculate_suspicious_score(
    cpu_usage,
    memory_usage,
    file_changes,
    suspicious_processes
):

    score = 0


    # High CPU activity

    if cpu_usage > 80:

        score += 25


    # High memory usage

    if memory_usage > 80:

        score += 15


    # File modification activity

    if file_changes > 10:

        score += 35

    elif file_changes > 5:

        score += 20


    # Suspicious processes

    if suspicious_processes > 0:

        score += 25


    return min(
        score,
        100
    )


# ============================================================
# COLLECT ONE SAMPLE
# ============================================================

def collect_sample(
    previous_snapshot
):

    cpu_usage = psutil.cpu_percent(
        interval=1
    )

    memory_usage = psutil.virtual_memory().percent


    (
        process_count,
        suspicious_process_count
    ) = get_process_information()


    network_connection_count = (
        get_network_connections()
    )


    (
        file_change_count,
        current_snapshot
    ) = get_file_change_count(
        previous_snapshot
    )


    suspicious_score = calculate_suspicious_score(
        cpu_usage,
        memory_usage,
        file_change_count,
        suspicious_process_count
    )


    # --------------------------------------------------------
    # IMPORTANT
    #
    # Normal system monitoring is labelled 0.
    # Later we will add controlled ransomware-like
    # behavioral simulations labelled 1.
    # --------------------------------------------------------

    label = 0


    sample = {

        "timestamp":
            datetime.now().isoformat(),

        "cpu_usage":
            cpu_usage,

        "memory_usage":
            memory_usage,

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
            label
    }


    return (
        sample,
        current_snapshot
    )


# ============================================================
# INITIALIZE CSV
# ============================================================

def initialize_csv():

    if not os.path.exists(
        OUTPUT_FILE
    ):

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


# ============================================================
# MAIN COLLECTION LOOP
# ============================================================

def start_collection(
    duration_seconds=300,
    interval_seconds=2
):

    print()
    print("=" * 70)
    print("CYBERSHIELD-AI BEHAVIORAL DATA COLLECTION")
    print("=" * 70)

    print(
        "Output:",
        OUTPUT_FILE
    )

    print(
        "Duration:",
        duration_seconds,
        "seconds"
    )

    print(
        "Interval:",
        interval_seconds,
        "seconds"
    )

    print()
    print(
        "Collecting normal system behavior..."
    )

    print(
        "Press CTRL+C to stop early."
    )

    print("=" * 70)


    initialize_csv()


    previous_snapshot = {}


    start_time = time.time()


    with open(
        OUTPUT_FILE,
        "a",
        newline=""
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=FIELDS
        )


        while (
            time.time() - start_time
            < duration_seconds
        ):

            try:

                (
                    sample,
                    previous_snapshot
                ) = collect_sample(
                    previous_snapshot
                )


                writer.writerow(
                    sample
                )

                file.flush()


                print(
                    f"[{sample['timestamp']}] "
                    f"CPU={sample['cpu_usage']:.1f}% | "
                    f"MEM={sample['memory_usage']:.1f}% | "
                    f"PROC={sample['process_count']} | "
                    f"FILES={sample['file_change_count']} | "
                    f"NET={sample['network_connection_count']} | "
                    f"SUSPICIOUS={sample['suspicious_score']}"
                )


                time.sleep(
                    interval_seconds
                )


            except KeyboardInterrupt:

                print()
                print(
                    "Collection stopped by user."
                )

                break


            except Exception as error:

                print(
                    "Collection error:",
                    error
                )

                time.sleep(
                    interval_seconds
                )


    print()
    print("=" * 70)
    print("BEHAVIORAL DATA COLLECTION COMPLETED")
    print("=" * 70)

    print(
        "Saved to:",
        OUTPUT_FILE
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    start_collection(
        duration_seconds=120,
        interval_seconds=2
    )