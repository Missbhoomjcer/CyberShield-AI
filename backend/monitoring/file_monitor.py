import os
import time


def get_file_change_count(directory=None, interval=1):
    """
    Safely monitor a directory for file changes.

    Returns the number of detected file changes during the interval.
    No files are created, deleted, renamed, encrypted, or modified.
    """

    if directory is None:
        directory = os.path.expanduser("~/Desktop")

    try:
        before = set(os.listdir(directory))
    except (FileNotFoundError, PermissionError):
        return 0

    time.sleep(interval)

    try:
        after = set(os.listdir(directory))
    except (FileNotFoundError, PermissionError):
        return 0

    added = after - before
    removed = before - after

    return len(added) + len(removed)


if __name__ == "__main__":
    print("=" * 50)
    print("CYBERSHIELD-AI FILE MONITOR")
    print("=" * 50)

    print("Monitoring Desktop for 1 second...")
    print("No files will be modified.")

    changes = get_file_change_count()

    print(f"File Changes Detected: {changes}")