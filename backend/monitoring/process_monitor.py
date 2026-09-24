import os
import psutil


WINDOWS_SYSTEM_DIRS = {
    os.path.normcase(r"C:\Windows\System32"),
    os.path.normcase(r"C:\Windows\SysWOW64"),
}


SECURITY_SENSITIVE_NAMES = {
    "powershell.exe",
    "pwsh.exe",
    "cmd.exe",
    "wscript.exe",
    "cscript.exe",
    "mshta.exe",
    "rundll32.exe",
    "regsvr32.exe",
    "certutil.exe",
    "bitsadmin.exe",
}


SUSPICIOUS_COMMAND_PATTERNS = [
    "-enc",
    "-encodedcommand",
    "frombase64string",
    "downloadstring",
    "downloadfile",
    "invoke-expression",
    "iex ",
    "invoke-webrequest",
    "iwr ",
    "start-bitstransfer",
    "hidden",
    "bypass",
    "executionpolicy bypass",
]


def get_process_count():
    """Return the number of currently running processes."""

    try:
        return len(list(psutil.process_iter()))

    except psutil.Error:
        return 0


def _normalise_path(path):
    """Normalize a Windows path for comparison."""

    if not path:
        return ""

    try:
        return os.path.normcase(
            os.path.abspath(path)
        )

    except Exception:
        return os.path.normcase(path)


def _is_windows_system_executable(exe):
    """Check whether executable is located in Windows system directory."""

    if not exe:
        return False

    normalized = _normalise_path(exe)

    for directory in WINDOWS_SYSTEM_DIRS:

        if normalized.startswith(
            directory + os.sep
        ):
            return True

    return False


def _get_parent_info(process):
    """Safely obtain parent process information."""

    try:

        parent = process.parent()

        if parent is None:
            return None

        return {
            "pid": parent.pid,
            "name": (
                parent.name()
                or ""
            ).lower(),
            "exe": (
                parent.exe()
                if parent
                else ""
            ),
        }

    except (
        psutil.NoSuchProcess,
        psutil.AccessDenied,
        psutil.ZombieProcess,
    ):

        return None

    except Exception:

        return None


def _command_line(process):
    """Safely obtain process command line."""

    try:

        command = process.cmdline()

        if not command:
            return ""

        return " ".join(
            str(item)
            for item in command
        )

    except (
        psutil.NoSuchProcess,
        psutil.AccessDenied,
        psutil.ZombieProcess,
    ):

        return ""

    except Exception:

        return ""


def _find_suspicious_command_patterns(command):
    """Find security-relevant command-line patterns."""

    command_lower = command.lower()

    return [
        pattern
        for pattern in SUSPICIOUS_COMMAND_PATTERNS
        if pattern in command_lower
    ]


def get_suspicious_processes():
    """
    Identify processes that deserve security inspection.

    IMPORTANT:
    Security-sensitive programs such as PowerShell and CMD
    are NOT automatically considered malicious.

    A process is flagged only when additional evidence exists,
    such as suspicious command-line behavior or an unusual
    executable location.
    """

    suspicious = []

    for process in psutil.process_iter(
        [
            "pid",
            "name",
            "exe",
            "username",
            "status",
        ]
    ):

        try:

            info = process.info

            pid = info.get("pid")

            name = (
                info.get("name")
                or ""
            ).lower()

            exe = (
                info.get("exe")
                or ""
            )

            username = (
                info.get("username")
                or ""
            )

            status = (
                info.get("status")
                or ""
            )

            if not name:
                continue

            # -----------------------------------------
            # Get command line
            # -----------------------------------------

            command = _command_line(
                process
            )

            # -----------------------------------------
            # Parent process
            # -----------------------------------------

            parent = _get_parent_info(
                process
            )

            reasons = []

            # -----------------------------------------
            # Security-sensitive executable
            # -----------------------------------------

            if name in SECURITY_SENSITIVE_NAMES:

                # -------------------------------------
                # Suspicious command-line behavior
                # -------------------------------------

                patterns = (
                    _find_suspicious_command_patterns(
                        command
                    )
                )

                if patterns:

                    reasons.append(
                        "Suspicious command-line pattern: "
                        + ", ".join(patterns)
                    )

                # -------------------------------------
                # Executable outside normal location
                # -------------------------------------

                if (
                    name
                    in {
                        "powershell.exe",
                        "pwsh.exe",
                        "cmd.exe",
                    }
                ):

                    if not _is_windows_system_executable(
                        exe
                    ):

                        reasons.append(
                            "System interpreter running "
                            "from an unusual executable path"
                        )

            # -----------------------------------------
            # Non-standard copy of security-sensitive
            # executable
            # -----------------------------------------

            if (
                name in SECURITY_SENSITIVE_NAMES
                and exe
                and not _is_windows_system_executable(exe)
            ):

                reasons.append(
                    "Security-sensitive executable "
                    "is outside the normal Windows "
                    "system directory"
                )

            # -----------------------------------------
            # Only report when evidence exists
            # -----------------------------------------

            if not reasons:

                continue

            suspicious.append(
                {
                    "pid": pid,
                    "name": name,
                    "exe": exe,
                    "username": username,
                    "cmdline": command,
                    "status": status,
                    "parent_pid": (
                        parent["pid"]
                        if parent
                        else None
                    ),
                    "parent_name": (
                        parent["name"]
                        if parent
                        else None
                    ),
                    "parent_exe": (
                        parent["exe"]
                        if parent
                        else None
                    ),
                    "reason": "; ".join(
                        reasons
                    ),
                }
            )

        except (
            psutil.NoSuchProcess,
            psutil.AccessDenied,
            psutil.ZombieProcess,
        ):

            continue

        except Exception:

            continue

    return suspicious


def get_suspicious_process_count():
    """
    Return the number of processes with
    security-relevant evidence.
    """

    return len(
        get_suspicious_processes()
    )


def print_suspicious_processes():

    processes = get_suspicious_processes()

    print()
    print("=" * 70)
    print(
        "PROCESSES REQUIRING SECURITY INSPECTION"
    )
    print("=" * 70)

    if not processes:

        print(
            "No processes currently have "
            "security-relevant indicators."
        )

        print("=" * 70)

        return

    for process in processes:

        print()

        print(
            f"PID        : {process['pid']}"
        )

        print(
            f"Name       : {process['name']}"
        )

        print(
            f"Executable : {process['exe']}"
        )

        print(
            f"User       : {process['username']}"
        )

        print(
            f"Status     : {process['status']}"
        )

        print(
            f"Parent PID  : "
            f"{process['parent_pid']}"
        )

        print(
            f"Parent Name : "
            f"{process['parent_name']}"
        )

        print(
            f"Reason     : {process['reason']}"
        )

        print(
            f"Command    : "
            f"{process['cmdline']}"
        )

    print()
    print("=" * 70)


if __name__ == "__main__":

    print(
        f"Total processes: "
        f"{get_process_count()}"
    )

    print_suspicious_processes()