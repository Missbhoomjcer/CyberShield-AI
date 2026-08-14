import psutil


def get_network_connection_count():
    """
    Return the number of active network connections.

    This only reads connection information.
    It does not connect to, block, or modify any network traffic.
    """

    try:
        connections = psutil.net_connections(kind="inet")

        active_connections = [
            connection
            for connection in connections
            if connection.status in (
                psutil.CONN_ESTABLISHED,
                psutil.CONN_SYN_SENT,
                psutil.CONN_SYN_RECV,
            )
        ]

        return len(active_connections)

    except (psutil.AccessDenied, psutil.Error):
        return 0


if __name__ == "__main__":
    print("=" * 50)
    print("CYBERSHIELD-AI NETWORK MONITOR")
    print("=" * 50)

    connections = get_network_connection_count()

    print(f"Active Network Connections: {connections}")