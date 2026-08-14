import psutil


def get_process_count():
    """
    Return the number of currently running processes.
    """
    return len(list(psutil.process_iter()))


def get_suspicious_process_count():
    """
    Safely count processes using simple behavioral indicators.

    This does NOT terminate or modify any process.
    """
    suspicious_names = {
        "powershell.exe",
        "cmd.exe",
        "wscript.exe",
        "cscript.exe",
        "mshta.exe",
    }

    count = 0

    for process in psutil.process_iter(["name"]):
        try:
            name = process.info["name"]

            if name and name.lower() in suspicious_names:
                count += 1

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return count


if __name__ == "__main__":
    print("=" * 50)
    print("CYBERSHIELD-AI PROCESS MONITOR")
    print("=" * 50)

    total = get_process_count()
    suspicious = get_suspicious_process_count()

    print(f"Process Count: {total}")
    print(f"Suspicious Process Count: {suspicious}")