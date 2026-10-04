from pathlib import Path
from datetime import datetime
import hashlib
import json
import shutil
import uuid


# =========================================================
# PATHS
# =========================================================

BACKEND_DIR = Path(__file__).resolve().parents[1]

QUARANTINE_DIR = BACKEND_DIR / "quarantine"
QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)

METADATA_FILE = QUARANTINE_DIR / "quarantine_metadata.json"


# =========================================================
# HELPERS
# =========================================================

def calculate_sha256(file_path: Path) -> str:
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:
        while True:
            chunk = file.read(1024 * 1024)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()


def load_metadata() -> list:
    if not METADATA_FILE.exists():
        return []

    try:
        with open(METADATA_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)

        return data if isinstance(data, list) else []

    except (json.JSONDecodeError, OSError):
        return []


def save_metadata(metadata: list):
    temp_file = METADATA_FILE.with_suffix(".tmp")

    with open(temp_file, "w", encoding="utf-8") as file:
        json.dump(
            metadata,
            file,
            indent=4
        )

    temp_file.replace(METADATA_FILE)


# =========================================================
# QUARANTINE
# =========================================================

def quarantine_file(
    file_path: str,
    threat_level: str = "HIGH",
    action: str = "CONTAIN_AND_QUARANTINE",
    reasons: list | None = None
) -> dict:

    source = Path(file_path).resolve()

    if not source.exists():
        raise FileNotFoundError(
            f"File not found: {source}"
        )

    if not source.is_file():
        raise ValueError(
            "Only files can be quarantined."
        )

    # Prevent quarantining the quarantine database itself
    if source.parent == QUARANTINE_DIR.resolve():
        raise ValueError(
            "File is already in quarantine."
        )

    original_name = source.name

    file_hash = calculate_sha256(source)

    quarantine_id = uuid.uuid4().hex

    timestamp = datetime.utcnow().strftime(
        "%Y%m%d_%H%M%S"
    )

    quarantine_name = (
        f"{timestamp}_{quarantine_id}_{original_name}"
    )

    destination = QUARANTINE_DIR / quarantine_name

    shutil.move(
        str(source),
        str(destination)
    )

    record = {
        "quarantine_id": quarantine_id,
        "original_filename": original_name,
        "original_path": str(source),
        "quarantine_path": str(destination),
        "sha256": file_hash,
        "threat_level": threat_level,
        "action": action,
        "reasons": reasons or [],
        "quarantined_at": datetime.utcnow().isoformat()
    }

    metadata = load_metadata()
    metadata.append(record)
    save_metadata(metadata)

    return record


# =========================================================
# LIST QUARANTINED FILES
# =========================================================

def list_quarantined_files() -> list:
    return load_metadata()


# =========================================================
# FIND QUARANTINED FILE
# =========================================================

def get_quarantined_file(quarantine_id: str) -> dict | None:

    metadata = load_metadata()

    for item in metadata:
        if item.get("quarantine_id") == quarantine_id:
            return item

    return None


# =========================================================
# DELETE QUARANTINED FILE
# =========================================================

def delete_quarantined_file(quarantine_id: str) -> bool:

    metadata = load_metadata()

    target = None

    for item in metadata:
        if item.get("quarantine_id") == quarantine_id:
            target = item
            break

    if target is None:
        return False

    quarantine_path = Path(
        target["quarantine_path"]
    )

    if quarantine_path.exists():
        quarantine_path.unlink()

    metadata = [
        item
        for item in metadata
        if item.get("quarantine_id") != quarantine_id
    ]

    save_metadata(metadata)

    return True