from pathlib import Path
import sys
import zipfile
import math


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

MAX_FILES = 5000
MAX_TOTAL_UNCOMPRESSED_SIZE = 500 * 1024 * 1024  # 500 MB
MAX_COMPRESSION_RATIO = 100

SUSPICIOUS_EXTENSIONS = {
    ".exe",
    ".dll",
    ".scr",
    ".com",
    ".bat",
    ".cmd",
    ".ps1",
    ".psm1",
    ".vbs",
    ".vbe",
    ".js",
    ".jse",
    ".wsf",
    ".wsh",
    ".hta",
    ".msi",
    ".msp",
    ".jar",
}

SUPPORTED_DOCUMENT_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
}


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def get_extension(filename):
    return Path(filename).suffix.lower()


def is_double_extension(filename):
    """
    Detect names such as:
        invoice.pdf.exe
        document.docx.scr
    """

    parts = Path(filename).name.lower().split(".")

    if len(parts) < 3:
        return False

    suspicious_final_extensions = SUSPICIOUS_EXTENSIONS

    return (
        "." + parts[-1]
    ) in suspicious_final_extensions


def calculate_compression_ratio(original_size, compressed_size):
    if compressed_size <= 0:
        return math.inf if original_size > 0 else 1.0

    return original_size / compressed_size


# ---------------------------------------------------------
# ZIP inspection
# ---------------------------------------------------------

def inspect_zip(file_path):

    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    if file_path.suffix.lower() != ".zip":
        raise ValueError(
            "Only .zip files are supported."
        )

    result = {
        "file": str(file_path),
        "file_type": ".zip",
        "valid_zip": False,

        "file_count": 0,
        "directory_count": 0,

        "total_compressed_size": 0,
        "total_uncompressed_size": 0,

        "suspicious_files": [],
        "executable_files": [],
        "document_files": [],
        "nested_archives": [],

        "double_extension_files": [],

        "encrypted_files": [],

        "compression_ratio": 0.0,
        "zip_bomb_indicator": False,

        "suspicious": False,
        "risk_level": "LOW",
        "reasons": [],
    }

    try:

        with zipfile.ZipFile(
            file_path,
            "r"
        ) as archive:

            result["valid_zip"] = True

            infos = archive.infolist()

            result["file_count"] = len(infos)

            # -------------------------------------------------
            # File-count protection
            # -------------------------------------------------

            if len(infos) > MAX_FILES:

                result["suspicious"] = True

                result["reasons"].append(
                    f"Archive contains more than {MAX_FILES} entries."
                )

            # -------------------------------------------------
            # Inspect every entry
            # -------------------------------------------------

            for info in infos:

                filename = info.filename

                # Directories
                if info.is_dir():

                    result["directory_count"] += 1
                    continue

                result["total_compressed_size"] += (
                    info.compress_size
                )

                result["total_uncompressed_size"] += (
                    info.file_size
                )

                extension = get_extension(
                    filename
                )

                # -------------------------------------------------
                # Executables / scripts
                # -------------------------------------------------

                if extension in SUSPICIOUS_EXTENSIONS:

                    result["executable_files"].append(
                        filename
                    )

                    result["suspicious_files"].append(
                        filename
                    )

                # -------------------------------------------------
                # Documents
                # -------------------------------------------------

                if extension in SUPPORTED_DOCUMENT_EXTENSIONS:

                    result["document_files"].append(
                        filename
                    )

                # -------------------------------------------------
                # Nested archives
                # -------------------------------------------------

                if extension in {
                    ".zip",
                    ".rar",
                    ".7z",
                    ".tar",
                    ".gz",
                }:

                    result["nested_archives"].append(
                        filename
                    )

                # -------------------------------------------------
                # Double extensions
                # -------------------------------------------------

                if is_double_extension(filename):

                    result["double_extension_files"].append(
                        filename
                    )

                    result["suspicious_files"].append(
                        filename
                    )

                # -------------------------------------------------
                # Encryption
                # -------------------------------------------------

                # ZIP encryption flag
                if info.flag_bits & 0x1:

                    result["encrypted_files"].append(
                        filename
                    )

            # -------------------------------------------------
            # Total archive size protection
            # -------------------------------------------------

            if (
                result["total_uncompressed_size"]
                > MAX_TOTAL_UNCOMPRESSED_SIZE
            ):

                result["zip_bomb_indicator"] = True

                result["suspicious"] = True

                result["reasons"].append(
                    "Very large total uncompressed archive size."
                )

            # -------------------------------------------------
            # Compression ratio
            # -------------------------------------------------

            result["compression_ratio"] = (
                calculate_compression_ratio(
                    result["total_uncompressed_size"],
                    result["total_compressed_size"],
                )
            )

            if (
                result["compression_ratio"]
                > MAX_COMPRESSION_RATIO
            ):

                result["zip_bomb_indicator"] = True

                result["suspicious"] = True

                result["reasons"].append(
                    "Extremely high compression ratio detected."
                )

            # -------------------------------------------------
            # Executables
            # -------------------------------------------------

            if result["executable_files"]:

                result["suspicious"] = True

                result["reasons"].append(
                    "Executable or script files found inside archive."
                )

            # -------------------------------------------------
            # Double extensions
            # -------------------------------------------------

            if result["double_extension_files"]:

                result["suspicious"] = True

                result["reasons"].append(
                    "Suspicious double-extension filename detected."
                )

            # -------------------------------------------------
            # Nested archives
            # -------------------------------------------------

            if result["nested_archives"]:

                result["reasons"].append(
                    "Nested archive(s) detected."
                )

            # -------------------------------------------------
            # Encrypted archive
            # -------------------------------------------------

            if result["encrypted_files"]:

                result["reasons"].append(
                    "Encrypted ZIP entries detected."
                )

            # -------------------------------------------------
            # Risk level
            # -------------------------------------------------

            if result["zip_bomb_indicator"]:

                result["risk_level"] = "CRITICAL"

            elif (
                result["executable_files"]
                or result["double_extension_files"]
            ):

                result["risk_level"] = "HIGH"

            elif (
                result["nested_archives"]
                or result["encrypted_files"]
            ):

                result["risk_level"] = "MEDIUM"

            else:

                result["risk_level"] = "LOW"

    except zipfile.BadZipFile:

        result["valid_zip"] = False
        result["suspicious"] = True
        result["risk_level"] = "HIGH"

        result["reasons"].append(
            "Invalid or corrupted ZIP archive."
        )

    return result


# ---------------------------------------------------------
# Display result
# ---------------------------------------------------------

def print_result(result):

    print("=" * 60)
    print("CYBERSHIELD-AI ZIP INSPECTOR")
    print("=" * 60)

    print(
        f"File                  : {result['file']}"
    )

    print(
        f"Valid ZIP             : {result['valid_zip']}"
    )

    print(
        f"Files                 : {result['file_count']}"
    )

    print(
        f"Directories           : {result['directory_count']}"
    )

    print(
        f"Compressed size       : "
        f"{result['total_compressed_size']:,} bytes"
    )

    print(
        f"Uncompressed size     : "
        f"{result['total_uncompressed_size']:,} bytes"
    )

    print(
        f"Compression ratio     : "
        f"{result['compression_ratio']:.2f}"
    )

    print()
    print(
        f"Executable files      : "
        f"{len(result['executable_files'])}"
    )

    print(
        f"Document files        : "
        f"{len(result['document_files'])}"
    )

    print(
        f"Nested archives       : "
        f"{len(result['nested_archives'])}"
    )

    print(
        f"Encrypted files       : "
        f"{len(result['encrypted_files'])}"
    )

    print(
        f"Double extensions     : "
        f"{len(result['double_extension_files'])}"
    )

    print()
    print(
        f"ZIP bomb indicator    : "
        f"{result['zip_bomb_indicator']}"
    )

    print(
        f"Risk level            : "
        f"{result['risk_level']}"
    )

    print(
        f"Suspicious            : "
        f"{result['suspicious']}"
    )

    if result["suspicious_files"]:

        print()
        print("Suspicious files:")

        for filename in result["suspicious_files"]:

            print(
                f"  - {filename}"
            )

    if result["reasons"]:

        print()
        print("Reasons:")

        for reason in result["reasons"]:

            print(
                f"  - {reason}"
            )

    print()
    print("=" * 60)


# ---------------------------------------------------------
# Main
# ---------------------------------------------------------

if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(
            'Usage: python backend\\ml\\zip_detector.py "C:\\path\\file.zip"'
        )

        sys.exit(1)

    file_path = sys.argv[1]

    try:

        result = inspect_zip(file_path)

        print_result(result)

    except Exception as e:

        print()
        print("ERROR:")
        print(str(e))

        sys.exit(1)