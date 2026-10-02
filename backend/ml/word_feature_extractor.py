from pathlib import Path
import sys
import json
import zipfile
import re


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "models"

FEATURE_NAMES_FILE = MODEL_DIR / "word_feature_names.json"


# ---------------------------------------------------------
# Dataset feature names
# ---------------------------------------------------------

DEFAULT_FEATURE_NAMES = [
    "ole_object_count",
    "ole_object_type_count",
    "macro_present",
    "dde_present",
    "vba_keywords_count",
    "entropy",
    "struct_ContentType",
    "struct_PartName",
    "file_size",
    "struct_pos",
    "struct_val",
    "struct_typeface",
    "struct_script",
    "path_/w-p",
    "path_w-r",
    "path_/w-r",
    "path_a-hlink",
    "path_w-p",
    "path_a-accent3",
    "struct_ang",
    "path_/a-effectLst",
    "path_a-themeElements",
    "struct_dist",
    "path_a-alpha",
    "struct_Extension",
    "path_a-dk1",
    "path_a-ln",
    "path_/a-accent6",
    "struct_w",
    "struct_name",
    "path_a-lt2",
    "path_/a-outerShdw",
    "struct_a-accent4",
    "path_/a-dk1",
    "path_a-accent1",
    "path_a-sysClr",
    "path_a-lt1",
    "path_/a-accent4",
    "struct_{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz",
    "path_a-solidFill",
    "path_{http://schemas.openxmlformats.org/wordprocessingml/2006/main}themeFill",
    "path_a-csb1",
    "path_a-styleId",
    "label",
]


def load_feature_names():
    """
    Load the exact feature order saved during training.
    If unavailable, use the fallback list.
    """

    if FEATURE_NAMES_FILE.exists():
        try:
            with open(FEATURE_NAMES_FILE, "r", encoding="utf-8") as f:
                names = json.load(f)

            if isinstance(names, list):
                return names
        except Exception:
            pass

    # Remove label because prediction does not contain label
    return [x for x in DEFAULT_FEATURE_NAMES if x != "label"]


FEATURE_NAMES = load_feature_names()


# ---------------------------------------------------------
# Utility functions
# ---------------------------------------------------------

def calculate_entropy(data: bytes) -> float:
    """
    Shannon entropy of bytes.
    """

    if not data:
        return 0.0

    frequency = [0] * 256

    for byte in data:
        frequency[byte] += 1

    length = len(data)
    entropy = 0.0

    for count in frequency:
        if count == 0:
            continue

        probability = count / length
        entropy -= probability * __import__("math").log2(probability)

    return entropy


def count_pattern(text: str, pattern: str) -> int:
    return len(re.findall(pattern, text, flags=re.IGNORECASE))


# ---------------------------------------------------------
# DOCX extraction
# ---------------------------------------------------------

def extract_docx(file_path: Path):
    """
    Extract security-related structural features from DOCX.

    Uses only Python standard library.
    No olefile.
    """

    features = {name: 0 for name in FEATURE_NAMES}

    file_size = file_path.stat().st_size
    features["file_size"] = file_size

    with zipfile.ZipFile(file_path, "r") as z:

        names = z.namelist()

        # -------------------------------------------------
        # Embedded / OLE objects
        # -------------------------------------------------

        embedded_files = [
            n for n in names
            if n.startswith("word/embeddings/")
        ]

        features["ole_object_count"] = len(embedded_files)

        embedded_types = set()

        for name in embedded_files:
            extension = Path(name).suffix.lower()

            if extension:
                embedded_types.add(extension)

        features["ole_object_type_count"] = len(embedded_types)

        # -------------------------------------------------
        # VBA / macros
        # -------------------------------------------------

        macro_files = [
            n for n in names
            if "vbaProject.bin" in n
        ]

        features["macro_present"] = 1 if macro_files else 0

        # -------------------------------------------------
        # Read XML files
        # -------------------------------------------------

        xml_parts = []

        for name in names:

            if not name.lower().endswith(".xml"):
                continue

            # Ignore huge/unrelated files
            if name.startswith("word/") or name == "[Content_Types].xml":

                try:
                    data = z.read(name)

                    text = data.decode(
                        "utf-8",
                        errors="ignore"
                    )

                    xml_parts.append(text)

                except Exception:
                    pass

        combined_xml = "\n".join(xml_parts)

        # -------------------------------------------------
        # DDE detection
        # -------------------------------------------------

        dde_patterns = [
            r"\bDDE\b",
            r"DDEAUTO",
            r"DDEBEGIN",
            r"DDEEND",
        ]

        dde_count = 0

        for pattern in dde_patterns:
            dde_count += count_pattern(
                combined_xml,
                pattern
            )

        features["dde_present"] = 1 if dde_count > 0 else 0

        # -------------------------------------------------
        # VBA-related keywords
        # -------------------------------------------------

        vba_keywords = [
            "vba",
            "macro",
            "autoopen",
            "autoclose",
            "document_open",
            "document_close",
            "shell",
            "powershell",
            "wscript",
            "cmd.exe",
            "createobject",
            "execute",
            "shellexecute",
        ]

        vba_keyword_count = 0

        lower_xml = combined_xml.lower()

        for keyword in vba_keywords:
            vba_keyword_count += lower_xml.count(
                keyword.lower()
            )

        features["vba_keywords_count"] = vba_keyword_count

        # -------------------------------------------------
        # XML entropy
        # -------------------------------------------------

        features["entropy"] = calculate_entropy(
            combined_xml.encode(
                "utf-8",
                errors="ignore"
            )
        )

        # -------------------------------------------------
        # Structural XML indicators
        # -------------------------------------------------

        features["struct_ContentType"] = count_pattern(
            combined_xml,
            r"ContentType"
        )

        features["struct_PartName"] = count_pattern(
            combined_xml,
            r"PartName"
        )

        features["struct_pos"] = count_pattern(
            combined_xml,
            r"\bpos\b"
        )

        features["struct_val"] = count_pattern(
            combined_xml,
            r"\bval\b"
        )

        features["struct_typeface"] = count_pattern(
            combined_xml,
            r"typeface"
        )

        features["struct_script"] = count_pattern(
            combined_xml,
            r"\bscript\b"
        )

        features["struct_ang"] = count_pattern(
            combined_xml,
            r"\bang\b"
        )

        features["struct_dist"] = count_pattern(
            combined_xml,
            r"\bdist\b"
        )

        features["struct_w"] = count_pattern(
            combined_xml,
            r"\bw\b"
        )

        features["struct_name"] = count_pattern(
            combined_xml,
            r"\bname\b"
        )

        features["struct_Extension"] = count_pattern(
            combined_xml,
            r"Extension"
        )

        # -------------------------------------------------
        # Common OOXML paths / elements
        # -------------------------------------------------

        path_patterns = {
            "path_/w-p": r"<w:p\b",
            "path_w-r": r"<w:r\b",
            "path_/w-r": r"</w:r>",
            "path_a-hlink": r"a:hlink",
            "path_w-p": r"w:p",
            "path_a-accent3": r"a:accent3",
            "path_/a-effectLst": r"a:effectLst",
            "path_a-themeElements": r"a:themeElements",
            "path_a-alpha": r"a:alpha",
            "path_a-dk1": r"a:dk1",
            "path_a-ln": r"a:ln",
            "path_/a-accent6": r"a:accent6",
            "path_a-lt2": r"a:lt2",
            "path_/a-outerShdw": r"a:outerShdw",
            "path_a-accent4": r"a:accent4",
            "path_/a-dk1": r"a:dk1",
            "path_a-accent1": r"a:accent1",
            "path_a-sysClr": r"a:sysClr",
            "path_a-lt1": r"a:lt1",
            "path_/a-accent4": r"a:accent4",
            "path_a-solidFill": r"a:solidFill",
            "path_a-csb1": r"a:csb1",
            "path_a-styleId": r"styleId",
            "path_{http://schemas.openxmlformats.org/wordprocessingml/2006/main}themeFill":
                r"themeFill",
        }

        for feature, pattern in path_patterns.items():

            if feature in features:

                features[feature] = count_pattern(
                    combined_xml,
                    pattern
                )

        # -------------------------------------------------
        # OOXML file count
        # -------------------------------------------------

        if "struct_{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz" in features:

            features[
                "struct_{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz"
            ] = count_pattern(
                combined_xml,
                r"<w:sz\b"
            )

        # -------------------------------------------------
        # Some features may not exist in the real extractor
        # -------------------------------------------------
        # They remain zero, which is intentional.

    return features


# ---------------------------------------------------------
# Legacy DOC extraction
# ---------------------------------------------------------

def extract_doc(file_path: Path):
    """
    Safe lightweight extraction for legacy .DOC files.

    We intentionally do NOT use olefile because it requires
    an additional package and can become slow/problematic.

    This method uses raw-byte signatures only.
    """

    features = {name: 0 for name in FEATURE_NAMES}

    raw = file_path.read_bytes()

    file_size = len(raw)

    features["file_size"] = file_size

    # -----------------------------------------------------
    # OLE compound document signature
    # -----------------------------------------------------

    ole_signature = bytes.fromhex(
        "D0CF11E0A1B11AE1"
    )

    is_ole = raw.startswith(ole_signature)

    if is_ole:

        # Legacy DOC is normally an OLE compound file.
        features["ole_object_count"] = 1
        features["ole_object_type_count"] = 1

    # -----------------------------------------------------
    # Raw-byte text
    # -----------------------------------------------------

    text = raw.decode(
        "latin-1",
        errors="ignore"
    )

    lower_text = text.lower()

    # -----------------------------------------------------
    # Macro / VBA indicators
    # -----------------------------------------------------

    macro_patterns = [
        "vba",
        "macro",
        "autoopen",
        "document_open",
        "documentopen",
        "shell",
        "powershell",
        "wscript",
        "cmd.exe",
        "createobject",
        "shellexecute",
    ]

    macro_count = 0

    for pattern in macro_patterns:
        macro_count += lower_text.count(pattern)

    features["vba_keywords_count"] = macro_count

    if macro_count > 0:
        features["macro_present"] = 1

    # -----------------------------------------------------
    # DDE
    # -----------------------------------------------------

    dde_patterns = [
        "dde",
        "ddeauto",
        "ddebegin",
        "ddeend",
    ]

    dde_count = sum(
        lower_text.count(pattern)
        for pattern in dde_patterns
    )

    features["dde_present"] = 1 if dde_count > 0 else 0

    # -----------------------------------------------------
    # Entropy
    # -----------------------------------------------------

    features["entropy"] = calculate_entropy(raw)

    # -----------------------------------------------------
    # Structural indicators
    # -----------------------------------------------------

    features["struct_pos"] = lower_text.count("pos")
    features["struct_val"] = lower_text.count("val")
    features["struct_name"] = lower_text.count("name")
    features["struct_script"] = lower_text.count("script")
    features["struct_Extension"] = lower_text.count("extension")

    return features


# ---------------------------------------------------------
# Main extraction function
# ---------------------------------------------------------

def extract_word_features(file_path):
    """
    Main DOC/DOCX feature extractor.

    Returns exactly the features expected by the model.
    """

    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    extension = file_path.suffix.lower()

    if extension == ".docx":
        features = extract_docx(file_path)

    elif extension == ".doc":
        features = extract_doc(file_path)

    else:
        raise ValueError(
            "Only .doc and .docx files are supported."
        )

    # -----------------------------------------------------
    # Guarantee exact model feature order
    # -----------------------------------------------------

    ordered_features = {}

    for feature in FEATURE_NAMES:

        if feature == "label":
            continue

        ordered_features[feature] = features.get(
            feature,
            0
        )

    return ordered_features


# ---------------------------------------------------------
# Command-line testing
# ---------------------------------------------------------

if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(
            "Usage:"
        )

        print(
            r'python backend\ml\word_feature_extractor.py "C:\path\file.docx"'
        )

        sys.exit(1)

    file_path = Path(sys.argv[1])

    print("=" * 60)
    print("DOC/DOCX FEATURE EXTRACTION")
    print("=" * 60)

    print(f"File      : {file_path}")
    print(f"Extension : {file_path.suffix.lower()}")

    try:

        features = extract_word_features(
            file_path
        )

        print()
        print(f"Features extracted: {len(features)}")
        print()

        for name, value in features.items():

            print(
                f"{name}: {value}"
            )

        print()
        print("=" * 60)
        print("EXTRACTION COMPLETE")
        print("=" * 60)

    except Exception as e:

        print()
        print("ERROR:")
        print(str(e))

        sys.exit(1)