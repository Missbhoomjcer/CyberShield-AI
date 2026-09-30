import winreg
import time


# Registry locations commonly relevant for persistence monitoring.
REGISTRY_LOCATIONS = [
    (
        winreg.HKEY_CURRENT_USER,
        r"Software\Microsoft\Windows\CurrentVersion\Run",
    ),
    (
        winreg.HKEY_CURRENT_USER,
        r"Software\Microsoft\Windows\CurrentVersion\RunOnce",
    ),
    (
        winreg.HKEY_LOCAL_MACHINE,
        r"Software\Microsoft\Windows\CurrentVersion\Run",
    ),
    (
        winreg.HKEY_LOCAL_MACHINE,
        r"Software\Microsoft\Windows\CurrentVersion\RunOnce",
    ),
]


def get_registry_snapshot():
    """
    Read selected registry keys and return a snapshot.

    This function is read-only.
    It does not create, modify, or delete registry entries.
    """

    snapshot = {}

    for root, path in REGISTRY_LOCATIONS:

        try:
            with winreg.OpenKey(root, path, 0, winreg.KEY_READ) as key:

                values = {}

                try:
                    value_count = winreg.QueryInfoKey(key)[1]

                    for index in range(value_count):
                        try:
                            name, value, value_type = winreg.EnumValue(
                                key, index
                            )

                            values[name] = {
                                "value": str(value),
                                "type": value_type,
                            }

                        except OSError:
                            continue

                except OSError:
                    pass

                root_name = (
                    "HKCU"
                    if root == winreg.HKEY_CURRENT_USER
                    else "HKLM"
                )

                snapshot[f"{root_name}\\{path}"] = values

        except (FileNotFoundError, PermissionError, OSError):
            snapshot[f"{root}\\{path}"] = {}

    return snapshot


def get_registry_change_count(previous_snapshot, current_snapshot):
    """
    Compare two registry snapshots.

    Returns the number of detected changes.

    No registry modification is performed.
    """

    changes = 0

    all_keys = set(previous_snapshot) | set(current_snapshot)

    for key in all_keys:

        previous_values = previous_snapshot.get(key, {})
        current_values = current_snapshot.get(key, {})

        if previous_values != current_values:
            changes += 1

    return changes


def get_registry_change_count_once(interval=1.0):
    """
    Take two read-only registry snapshots and detect changes
    during the specified interval.
    """

    before = get_registry_snapshot()

    time.sleep(interval)

    after = get_registry_snapshot()

    return get_registry_change_count(before, after)


if __name__ == "__main__":

    print("=" * 55)
    print("CYBERSHIELD-AI REGISTRY MONITOR")
    print("=" * 55)

    print("Monitoring selected Windows Registry keys...")
    print("Read-only monitoring.")
    print("No registry entries will be modified.")
    print()

    try:

        changes = get_registry_change_count_once(1.0)

        print(f"Registry Changes Detected: {changes}")

    except KeyboardInterrupt:

        print()
        print("Registry monitoring stopped.")