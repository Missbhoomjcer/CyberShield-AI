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
#
# File activity is monitored in:
#   1. User Downloads folder
#   2. User Windows Temp folder
#   3. Windows system Temp folder
#
# Temp activity is incorporated into the existing
# file_change_count feature.
# ============================================================


CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

BACKEND_DIR = os.path.dirname(
    CURRENT_DIR
)

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
# GET MONITORED DIRECTORIES
# ============================================================

def get_monitored_directories():
    """
    Return directories used for behavioral file monitoring.

    Includes:
        - User Downloads
        - User Temp
        - Windows Temp
    """

    directories = []

    # --------------------------------------------------------
    # User Downloads
    # --------------------------------------------------------

    downloads_folder = os.path.join(
        os.path.expanduser("~"),
        "Downloads"
    )

    directories.append(
        downloads_folder
    )

    # --------------------------------------------------------
    # User Temp
    # --------------------------------------------------------

    user_temp = os.environ.get(
        "TEMP"
    )

    if user_temp:
        directories.append(
            user_temp
        )

    # --------------------------------------------------------
    # Windows Temp
    # --------------------------------------------------------

    windows_directory = os.environ.get(
        "WINDIR"
    )

    if windows_directory:
        windows_temp = os.path.join(
            windows_directory,
            "Temp"
        )

        directories.append(
            windows_temp
        )

    # --------------------------------------------------------
    # Remove duplicates and invalid paths
    # --------------------------------------------------------

    unique_directories = []

    for directory in directories:

        if not directory:
            continue

        try:

            directory = os.path.abspath(
                directory
            )

            if (
                os.path.exists(directory)
                and directory not in unique_directories
            ):
                unique_directories.append(
                    directory
                )

        except (
            OSError,
            PermissionError
        ):
            continue

    return unique_directories


# ============================================================
# GET NAMED MONITORED LOCATIONS
# ============================================================

def get_monitored_locations():
    """
    Return the monitored locations with friendly names.

    This is used by the frontend so it can display
    User TEMP, Windows TEMP and Downloads separately.
    """

    locations = {}

    # --------------------------------------------------------
    # User TEMP
    # --------------------------------------------------------

    user_temp = os.environ.get(
        "TEMP"
    )

    if user_temp:
        locations["user_temp"] = {
            "label": "User TEMP",
            "path": os.path.abspath(user_temp),
            "display_path": "%TEMP%"
        }

    # --------------------------------------------------------
    # Windows TEMP
    # --------------------------------------------------------

    windows_directory = os.environ.get(
        "WINDIR"
    )

    if windows_directory:

        windows_temp = os.path.join(
            windows_directory,
            "Temp"
        )

        locations["windows_temp"] = {
            "label": "Windows TEMP",
            "path": os.path.abspath(windows_temp),
            "display_path": r"C:\Windows\Temp"
        }

    # --------------------------------------------------------
    # Downloads
    # --------------------------------------------------------

    downloads_folder = os.path.join(
        os.path.expanduser("~"),
        "Downloads"
    )

    locations["downloads"] = {
        "label": "Downloads",
        "path": os.path.abspath(downloads_folder),
        "display_path": r"%USERPROFILE%\Downloads"
    }

    return locations


# ============================================================
# GET PROCESS INFORMATION
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

                    if (
                        name
                        in SUSPICIOUS_PROCESS_NAMES
                    ):
                        suspicious_processes += 1

            except (
                psutil.NoSuchProcess,
                psutil.AccessDenied,
                psutil.ZombieProcess
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

        return len(
            connections
        )

    except Exception:

        return 0


# ============================================================
# BUILD FILE SNAPSHOT
# ============================================================

def build_file_snapshot():

    """
    Build a snapshot of files in the monitored directories.

    The snapshot stores:
        file_path -> modification_time

    This allows us to detect:
        - newly created files
        - modified files
        - deleted files
    """

    current_snapshot = {}

    monitored_directories = (
        get_monitored_directories()
    )

    for directory in monitored_directories:

        try:

            for root, dirs, files in os.walk(
                directory
            ):

                # ------------------------------------------------
                # Prevent excessively large recursive scans.
                # ------------------------------------------------

                if len(dirs) > 50:
                    dirs[:] = dirs[:50]

                # ------------------------------------------------
                # Limit files processed in each directory.
                # ------------------------------------------------

                if len(files) > 500:
                    files = files[:500]

                for filename in files:

                    path = os.path.join(
                        root,
                        filename
                    )

                    try:

                        modified_time = (
                            os.path.getmtime(
                                path
                            )
                        )

                        current_snapshot[
                            path
                        ] = modified_time

                    except (
                        OSError,
                        PermissionError
                    ):
                        continue

        except (
            OSError,
            PermissionError
        ):
            continue

    return current_snapshot


# ============================================================
# BUILD LOCATION-WISE FILE SNAPSHOT
# ============================================================

def build_location_snapshots():

    """
    Build separate file snapshots for:

        - User TEMP
        - Windows TEMP
        - Downloads

    This does NOT replace the existing combined snapshot.
    It is only used to show location-specific activity.
    """

    location_snapshots = {}

    locations = get_monitored_locations()

    for location_key, location_info in locations.items():

        directory = location_info["path"]

        snapshot = {}

        try:

            if not os.path.exists(directory):
                location_snapshots[location_key] = snapshot
                continue

            for root, dirs, files in os.walk(
                directory
            ):

                if len(dirs) > 50:
                    dirs[:] = dirs[:50]

                if len(files) > 500:
                    files = files[:500]

                for filename in files:

                    path = os.path.join(
                        root,
                        filename
                    )

                    try:

                        snapshot[path] = (
                            os.path.getmtime(path)
                        )

                    except (
                        OSError,
                        PermissionError
                    ):
                        continue

        except (
            OSError,
            PermissionError
        ):
            pass

        location_snapshots[
            location_key
        ] = snapshot

    return location_snapshots


# ============================================================
# GET LOCATION-WISE FILE CHANGES
# ============================================================

def get_location_file_changes(
    previous_snapshots
):

    """
    Compare previous and current snapshots separately
    for User TEMP, Windows TEMP and Downloads.

    Returns:

        changes,
        current_snapshots

    Example:

        {
            "user_temp": 1,
            "windows_temp": 0,
            "downloads": 0
        }
    """

    current_snapshots = (
        build_location_snapshots()
    )

    changes = {}

    for location_key, current_snapshot in (
        current_snapshots.items()
    ):

        previous_snapshot = (
            previous_snapshots.get(
                location_key,
                {}
            )
        )

        location_changes = 0

        # --------------------------------------------------------
        # New and modified files
        # --------------------------------------------------------

        for path, modified_time in (
            current_snapshot.items()
        ):

            if path not in previous_snapshot:

                location_changes += 1

            elif (
                previous_snapshot[path]
                != modified_time
            ):

                location_changes += 1

        # --------------------------------------------------------
        # Deleted files
        # --------------------------------------------------------

        for path in previous_snapshot:

            if path not in current_snapshot:

                location_changes += 1

        changes[
            location_key
        ] = location_changes

    return (
        changes,
        current_snapshots
    )


# ============================================================
# GET FILE CHANGE COUNT
# ============================================================

def get_file_change_count(
    previous_snapshot
):

    """
    Compare the previous file snapshot with
    the current snapshot.

    Counts:
        - new files
        - modified files
        - deleted files

    Activity from Downloads and both Temp locations
    contributes to the existing file_change_count
    LSTM feature.
    """

    current_snapshot = (
        build_file_snapshot()
    )

    # --------------------------------------------------------
    # First observation
    # --------------------------------------------------------

    if not previous_snapshot:

        return (
            0,
            current_snapshot
        )

    changes = 0

    # --------------------------------------------------------
    # New files and modified files
    # --------------------------------------------------------

    for path, modified_time in (
        current_snapshot.items()
    ):

        if path not in previous_snapshot:

            changes += 1

        elif (
            previous_snapshot[path]
            != modified_time
        ):

            changes += 1

    # --------------------------------------------------------
    # Deleted files
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # High CPU activity
    # --------------------------------------------------------

    if cpu_usage > 80:
        score += 25

    # --------------------------------------------------------
    # High memory usage
    # --------------------------------------------------------

    if memory_usage > 80:
        score += 15

    # --------------------------------------------------------
    # File modification activity
    # --------------------------------------------------------

    if file_changes > 10:
        score += 35

    elif file_changes > 5:
        score += 20

    # --------------------------------------------------------
    # Suspicious processes
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # CPU
    # --------------------------------------------------------

    cpu_usage = psutil.cpu_percent(
        interval=1
    )

    # --------------------------------------------------------
    # Memory
    # --------------------------------------------------------

    memory_usage = (
        psutil.virtual_memory().percent
    )

    # --------------------------------------------------------
    # Processes
    # --------------------------------------------------------

    (
        process_count,
        suspicious_process_count
    ) = get_process_information()

    # --------------------------------------------------------
    # Network
    # --------------------------------------------------------

    network_connection_count = (
        get_network_connections()
    )

    # --------------------------------------------------------
    # File activity
    #
    # Includes:
    # Downloads
    # User Temp
    # Windows Temp
    # --------------------------------------------------------

    (
        file_change_count,
        current_snapshot
    ) = get_file_change_count(
        previous_snapshot
    )

    # --------------------------------------------------------
    # Suspicious score
    # --------------------------------------------------------

    suspicious_score = (
        calculate_suspicious_score(
            cpu_usage,
            memory_usage,
            file_change_count,
            suspicious_process_count
        )
    )

    # --------------------------------------------------------
    # Current collection is normal behavior.
    #
    # Controlled suspicious/ransomware-like
    # samples can be labelled later.
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

    print(
        "CYBERSHIELD-AI BEHAVIORAL DATA COLLECTION"
    )

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
        "Monitoring directories:"
    )

    for directory in (
        get_monitored_directories()
    ):

        print(
            f"  - {directory}"
        )

    print()

    print(
        "Collecting behavioral activity..."
    )

    print(
        "Temp activity is included in file_change_count."
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
                    f"SUSPICIOUS={sample['suspicious_process_count']} | "
                    f"SCORE={sample['suspicious_score']}"
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

    print(
        "BEHAVIORAL DATA COLLECTION COMPLETED"
    )

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