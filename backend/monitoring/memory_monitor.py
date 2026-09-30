import psutil


def get_memory_usage():
    """
    Return current system memory usage percentage.
    """
    memory = psutil.virtual_memory()
    return round(memory.percent, 2)


if __name__ == "__main__":
    print("=" * 50)
    print("CYBERSHIELD-AI MEMORY MONITOR")
    print("=" * 50)

    memory = get_memory_usage()

    print(f"Memory Usage: {memory}%")