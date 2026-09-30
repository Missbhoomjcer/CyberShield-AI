import psutil


def get_cpu_usage():
    """
    Return current CPU usage percentage.
    """
    return round(psutil.cpu_percent(interval=1), 2)


if __name__ == "__main__":
    print("=" * 50)
    print("CYBERSHIELD-AI CPU MONITOR")
    print("=" * 50)

    cpu = get_cpu_usage()

    print(f"CPU Usage: {cpu}%")