import os
import time
import threading
from pathlib import Path


class TempMonitor:
    """
    Real-time monitoring of Windows Temp directories.

    This monitor counts file-system activity in Temp directories.
    It does NOT delete, block, or quarantine files.
    """

    def __init__(self):
        self.temp_directories = self._get_temp_directories()

        self.file_change_count = 0
        self.created_count = 0
        self.modified_count = 0
        self.deleted_count = 0

        self.running = False
        self.monitor_thread = None

    def _get_temp_directories(self):
        """Get Windows Temp directories that exist."""

        directories = []

        user_temp = os.environ.get("TEMP")
        windows_temp = os.environ.get("WINDIR")

        if user_temp:
            directories.append(Path(user_temp))

        if windows_temp:
            directories.append(
                Path(windows_temp) / "Temp"
            )

        # Remove duplicates and non-existing paths
        unique_directories = []

        for directory in directories:
            directory = directory.resolve()

            if directory.exists() and directory not in unique_directories:
                unique_directories.append(directory)

        return unique_directories

    def _snapshot(self):
        """
        Take a snapshot of files currently present
        in the Temp directories.
        """

        files = set()

        for directory in self.temp_directories:

            try:
                for root, _, filenames in os.walk(directory):

                    for filename in filenames:

                        path = os.path.join(
                            root,
                            filename
                        )

                        files.add(path)

            except (PermissionError, OSError):
                continue

        return files

    def _monitor(self):
        """Continuously compare Temp directory snapshots."""

        previous_files = self._snapshot()

        print("\n[Temp Monitor] Started")
        print("[Temp Monitor] Watching:")

        for directory in self.temp_directories:
            print(f"  - {directory}")

        while self.running:

            time.sleep(1)

            current_files = self._snapshot()

            created = current_files - previous_files
            deleted = previous_files - current_files

            created_count = len(created)
            deleted_count = len(deleted)

            if created_count > 0:

                self.created_count += created_count
                self.file_change_count += created_count

                print(
                    f"[Temp Monitor] "
                    f"{created_count} file(s) created"
                )

            if deleted_count > 0:

                self.deleted_count += deleted_count
                self.file_change_count += deleted_count

                print(
                    f"[Temp Monitor] "
                    f"{deleted_count} file(s) deleted"
                )

            previous_files = current_files

    def start(self):
        """Start monitoring in a background thread."""

        if self.running:
            print("[Temp Monitor] Already running")
            return

        self.running = True

        self.monitor_thread = threading.Thread(
            target=self._monitor,
            daemon=True
        )

        self.monitor_thread.start()

    def stop(self):
        """Stop monitoring."""

        self.running = False

        if self.monitor_thread:
            self.monitor_thread.join(
                timeout=2
            )

        print("[Temp Monitor] Stopped")

    def get_stats(self):
        """Return current Temp activity statistics."""

        return {
            "temp_file_change_count": self.file_change_count,
            "created_count": self.created_count,
            "modified_count": self.modified_count,
            "deleted_count": self.deleted_count,
            "monitored_directories": [
                str(directory)
                for directory in self.temp_directories
            ]
        }


if __name__ == "__main__":

    monitor = TempMonitor()

    monitor.start()

    try:

        while True:
            time.sleep(5)

            print(
                "\n[Temp Monitor Stats]"
            )

            print(
                monitor.get_stats()
            )

    except KeyboardInterrupt:

        monitor.stop()

        print(
            "\n[Temp Monitor] "
            "Monitoring stopped by user."
        )