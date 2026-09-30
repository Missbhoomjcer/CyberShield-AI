"""
CyberShield-AI Quarantine Manager

Purpose:
    Safely isolate suspicious files without permanently deleting them.

Features:
    - Creates a dedicated quarantine directory
    - Moves suspicious files into quarantine
    - Generates a unique quarantine ID
    - Stores metadata
    - Calculates SHA-256 before quarantine
    - Supports listing quarantined files
    - Supports restoring a quarantined file
    - Supports permanently deleting a quarantined file

IMPORTANT:
    This module is designed to be used with the CyberShield
    protection engine. It does NOT execute suspicious files.
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

QUARANTINE_DIR = (
    PROJECT_ROOT
    / "backend"
    / "quarantine"
)

METADATA_FILE = (
    QUARANTINE_DIR
    / "quarantine_metadata.json"
)


# ============================================================
# INITIALIZATION
# ============================================================

def initialize_quarantine() -> None:
    """
    Create the quarantine directory and metadata file
    if they do not already exist.
    """

    QUARANTINE_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    if not METADATA_FILE.exists():

        METADATA_FILE.write_text(
            "[]",
            encoding="utf-8"
        )


# ============================================================
# HASH
# ============================================================

def calculate_sha256(
    file_path: str | Path
) -> str:
    """
    Calculate SHA-256 hash of a file.
    """

    path = Path(file_path)

    if not path.exists():

        raise FileNotFoundError(
            f"File not found: {path}"
        )

    if not path.is_file():

        raise ValueError(
            f"Not a file: {path}"
        )

    sha256 = hashlib.sha256()

    with path.open(
        "rb"
    ) as file:

        while True:

            chunk = file.read(
                1024 * 1024
            )

            if not chunk:
                break

            sha256.update(
                chunk
            )

    return sha256.hexdigest()


# ============================================================
# METADATA
# ============================================================

def load_metadata() -> list[dict]:
    """
    Load quarantine metadata.
    """

    initialize_quarantine()

    try:

        data = json.loads(
            METADATA_FILE.read_text(
                encoding="utf-8"
            )
        )

        if isinstance(data, list):
            return data

    except (
        json.JSONDecodeError,
        OSError
    ):
        pass

    return []


def save_metadata(
    metadata: list[dict]
) -> None:
    """
    Save quarantine metadata.
    """

    initialize_quarantine()

    temp_file = (
        METADATA_FILE.with_suffix(
            ".tmp"
        )
    )

    temp_file.write_text(
        json.dumps(
            metadata,
            indent=4
        ),
        encoding="utf-8"
    )

    temp_file.replace(
        METADATA_FILE
    )


# ============================================================
# QUARANTINE FILE
# ============================================================

def quarantine_file(
    file_path: str | Path,
    threat_level: str = "HIGH",
    risk_score: float = 0.0,
    reason: str = "Suspicious file detected",
) -> dict:
    """
    Move a suspicious file into quarantine.

    Returns metadata describing the quarantined file.
    """

    initialize_quarantine()

    source = Path(
        file_path
    ).resolve()

    # --------------------------------------------------------
    # Validate source
    # --------------------------------------------------------

    if not source.exists():

        raise FileNotFoundError(
            f"File not found: {source}"
        )

    if not source.is_file():

        raise ValueError(
            f"Path is not a file: {source}"
        )

    # --------------------------------------------------------
    # Prevent quarantining the quarantine itself
    # --------------------------------------------------------

    try:

        source.relative_to(
            QUARANTINE_DIR.resolve()
        )

        raise ValueError(
            "File is already inside the quarantine directory."
        )

    except ValueError as error:

        if str(error).startswith(
            "File is already"
        ):

            raise

        # Normal case:
        # source is outside quarantine.

    # --------------------------------------------------------
    # Calculate original hash
    # --------------------------------------------------------

    sha256 = calculate_sha256(
        source
    )

    # --------------------------------------------------------
    # Create unique quarantine ID
    # --------------------------------------------------------

    quarantine_id = (
        f"CSQ-"
        f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-"
        f"{uuid.uuid4().hex[:8].upper()}"
    )

    # --------------------------------------------------------
    # Preserve original filename safely
    # --------------------------------------------------------

    original_name = source.name

    quarantine_filename = (
        f"{quarantine_id}__{original_name}"
    )

    destination = (
        QUARANTINE_DIR
        / quarantine_filename
    )

    # --------------------------------------------------------
    # Move file
    # --------------------------------------------------------

    shutil.move(
        str(source),
        str(destination)
    )

    # --------------------------------------------------------
    # Verify destination exists
    # --------------------------------------------------------

    if not destination.exists():

        raise RuntimeError(
            "Quarantine move completed unexpectedly, "
            "but destination file was not found."
        )

    # --------------------------------------------------------
    # Create metadata
    # --------------------------------------------------------

    record = {

        "quarantine_id": quarantine_id,

        "original_filename": original_name,

        "original_path": str(source),

        "quarantine_path": str(
            destination
        ),

        "sha256": sha256,

        "file_size": destination.stat().st_size,

        "threat_level": str(
            threat_level
        ).upper(),

        "risk_score": round(
            float(risk_score),
            2
        ),

        "reason": reason,

        "status": "QUARANTINED",

        "quarantined_at": datetime.now(
            timezone.utc
        ).isoformat(),

        "restored_at": None,

        "deleted_at": None,
    }

    # --------------------------------------------------------
    # Save metadata
    # --------------------------------------------------------

    metadata = load_metadata()

    metadata.append(
        record
    )

    save_metadata(
        metadata
    )

    return record


# ============================================================
# LIST QUARANTINED FILES
# ============================================================

def list_quarantined_files() -> list[dict]:
    """
    Return all quarantine records.
    """

    return load_metadata()


# ============================================================
# FIND RECORD
# ============================================================

def find_quarantine_record(
    quarantine_id: str
) -> Optional[dict]:
    """
    Find a quarantine record by ID.
    """

    metadata = load_metadata()

    for record in metadata:

        if record.get(
            "quarantine_id"
        ) == quarantine_id:

            return record

    return None


# ============================================================
# RESTORE
# ============================================================

def restore_file(
    quarantine_id: str
) -> dict:
    """
    Restore a quarantined file to its original location.

    IMPORTANT:
        Restoration should only be performed after the file
        has been verified as safe.
    """

    record = find_quarantine_record(
        quarantine_id
    )

    if record is None:

        raise ValueError(
            f"Quarantine ID not found: "
            f"{quarantine_id}"
        )

    if record.get(
        "status"
    ) != "QUARANTINED":

        raise ValueError(
            "Only quarantined files can be restored."
        )

    quarantine_path = Path(
        record[
            "quarantine_path"
        ]
    )

    original_path = Path(
        record[
            "original_path"
        ]
    )

    if not quarantine_path.exists():

        raise FileNotFoundError(
            "Quarantined file no longer exists."
        )

    # --------------------------------------------------------
    # Prevent accidental overwrite
    # --------------------------------------------------------

    if original_path.exists():

        raise FileExistsError(
            "Original location already contains a file. "
            "Restore was cancelled to prevent overwrite."
        )

    # --------------------------------------------------------
    # Create original parent directory
    # --------------------------------------------------------

    original_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # Move back
    # --------------------------------------------------------

    shutil.move(
        str(quarantine_path),
        str(original_path)
    )

    # --------------------------------------------------------
    # Update metadata
    # --------------------------------------------------------

    metadata = load_metadata()

    for item in metadata:

        if item.get(
            "quarantine_id"
        ) == quarantine_id:

            item[
                "status"
            ] = "RESTORED"

            item[
                "restored_at"
            ] = datetime.now(
                timezone.utc
            ).isoformat()

            break

    save_metadata(
        metadata
    )

    return record


# ============================================================
# PERMANENT DELETE
# ============================================================

def delete_quarantined_file(
    quarantine_id: str
) -> dict:
    """
    Permanently delete a quarantined file.

    This action is irreversible.

    The function only accepts a quarantine ID, not an arbitrary
    filesystem path.
    """

    record = find_quarantine_record(
        quarantine_id
    )

    if record is None:

        raise ValueError(
            f"Quarantine ID not found: "
            f"{quarantine_id}"
        )

    if record.get(
        "status"
    ) != "QUARANTINED":

        raise ValueError(
            "Only quarantined files can be deleted."
        )

    quarantine_path = Path(
        record[
            "quarantine_path"
        ]
    )

    if quarantine_path.exists():

        quarantine_path.unlink()

    # --------------------------------------------------------
    # Update metadata
    # --------------------------------------------------------

    metadata = load_metadata()

    for item in metadata:

        if item.get(
            "quarantine_id"
        ) == quarantine_id:

            item[
                "status"
            ] = "DELETED"

            item[
                "deleted_at"
            ] = datetime.now(
                timezone.utc
            ).isoformat()

            break

    save_metadata(
        metadata
    )

    return record


# ============================================================
# SAFE DEMO
# ============================================================

def create_safe_test_file() -> Path:
    """
    Creates a harmless test file inside the project.

    This is ONLY for testing the quarantine mechanism.
    """

    test_dir = (
        PROJECT_ROOT
        / "backend"
        / "test_artifacts"
    )

    test_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    test_file = (
        test_dir
        / "cybershield_test_artifact.txt"
    )

    test_file.write_text(
        (
            "CYBERSHIELD-AI SAFE TEST FILE\n"
            "\n"
            "This file is harmless.\n"
            "It is only used to test the quarantine manager.\n"
        ),
        encoding="utf-8"
    )

    return test_file


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 65)
    print(
        "CYBERSHIELD-AI QUARANTINE MANAGER TEST"
    )
    print("=" * 65)

    # --------------------------------------------------------
    # Create harmless test file
    # --------------------------------------------------------

    test_file = create_safe_test_file()

    print(
        f"\n[TEST] Created safe file:"
    )

    print(
        f"       {test_file}"
    )

    # --------------------------------------------------------
    # Calculate hash
    # --------------------------------------------------------

    original_hash = calculate_sha256(
        test_file
    )

    print(
        f"\n[TEST] Original SHA-256:"
    )

    print(
        f"       {original_hash}"
    )

    # --------------------------------------------------------
    # Quarantine
    # --------------------------------------------------------

    print(
        "\n[TEST] Moving file to quarantine..."
    )

    record = quarantine_file(

        file_path=test_file,

        threat_level="HIGH",

        risk_score=85.0,

        reason=(
            "Safe test artifact used to verify "
            "CyberShield quarantine functionality."
        ),
    )

    print(
        "\n[OK] File quarantined."
    )

    print(
        f"     Quarantine ID : "
        f"{record['quarantine_id']}"
    )

    print(
        f"     Original Path : "
        f"{record['original_path']}"
    )

    print(
        f"     Quarantine    : "
        f"{record['quarantine_path']}"
    )

    print(
        f"     SHA-256       : "
        f"{record['sha256']}"
    )

    print(
        f"     Status        : "
        f"{record['status']}"
    )

    # --------------------------------------------------------
    # Verify
    # --------------------------------------------------------

    print(
        "\n[TEST] Verifying quarantine..."
    )

    if not Path(
        record["original_path"]
    ).exists():

        print(
            "[OK] Original file no longer "
            "exists at original location."
        )

    if Path(
        record["quarantine_path"]
    ).exists():

        print(
            "[OK] File exists inside quarantine."
        )

    # --------------------------------------------------------
    # List
    # --------------------------------------------------------

    print(
        "\n[TEST] Quarantine records:"
    )

    for item in list_quarantined_files():

        print(
            f" - {item['quarantine_id']} "
            f"| {item['status']} "
            f"| {item['original_filename']}"
        )

    print()
    print("=" * 65)

    print(
        "QUARANTINE TEST COMPLETED"
    )

    print("=" * 65)

    print(
        "\nIMPORTANT:"
    )

    print(
        "The test file was intentionally left in quarantine."
    )

    print(
        "Do NOT run or open quarantined files."
    )