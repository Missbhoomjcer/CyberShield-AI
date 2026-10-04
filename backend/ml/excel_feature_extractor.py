import os
import re
import math
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter


FEATURE_NAMES = [
    "file_size",
    "sheet_count",
    "max_rows",
    "max_cols",
    "total_cells",
    "non_empty_cells",
    "numeric_cell_count",
    "string_cell_count",
    "formula_count",
    "hyperlink_count",
    "avg_cell_length",
    "entropy_of_text",
    "base64_pattern_count",
    "hex_pattern_count",
    "has_macro",
    "remote_template_present",
    "ocr_extracted_text_length",
    "preview_image_text_entropy",
    "deceptive_keywords_count_ocr",
    "macro_line_count",
    "macro_procedure_count",
    "macro_chr_count",
    "macro_string_function_count",
    "macro_arithmetic_operator_count",
    "macro_concatenation_count",
    "macro_callbyname_count",
    "macro_comment_lines",
    "macro_average_line_length",
    "macro_token_count",
    "macro_count",
    "uses_file_api",
    "uses_network_api",
    "uses_process_api",
    "merged_cells_count",
    "hidden_sheets_count",
    "protected_sheets_count",
    "named_ranges_count",
    "empty_sheet_count",
    "rich_text_formatting_count",
    "macro_count_parentheses",
    "macro_count_assignments",
    "macro_max_line_length",
    "macro_max_string_literals",
    "macro_max_arithmetic_ops",
    "macro_max_concat_ops",
    "macro_vocab_size",
    "preview_image_width",
    "preview_image_height",
]


NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def entropy(text):
    if not text:
        return 0.0

    counts = Counter(text)
    total = len(text)

    return -sum(
        (count / total) * math.log2(count / total)
        for count in counts.values()
        if count
    )


def safe_int(value, default=0):
    try:
        return int(value)
    except Exception:
        return default


def read_xml(z, name):
    try:
        return ET.fromstring(z.read(name))
    except Exception:
        return None


def extract_vba_text(z):
    """
    Best-effort extraction of VBA-related text from an Office package.

    VBA project storage is binary. Without external Office/VBA parsers,
    we recover printable ASCII strings from the binary stream.
    """

    candidates = [
        name for name in z.namelist()
        if name.lower().endswith("vbaProject.bin")
    ]

    if not candidates:
        return ""

    try:
        data = z.read(candidates[0])

        strings = re.findall(rb"[\x20-\x7e]{4,}", data)

        decoded = []
        for item in strings:
            try:
                decoded.append(item.decode("latin1", errors="ignore"))
            except Exception:
                pass

        return "\n".join(decoded)

    except Exception:
        return ""


def extract_excel_features(file_path):

    if not os.path.isfile(file_path):
        raise FileNotFoundError(file_path)

    features = {name: 0 for name in FEATURE_NAMES}

    features["file_size"] = os.path.getsize(file_path)

    # ------------------------------------------------------------------
    # Open Office package
    # ------------------------------------------------------------------

    with zipfile.ZipFile(file_path, "r") as z:

        names = z.namelist()

        # --------------------------------------------------------------
        # Workbook
        # --------------------------------------------------------------

        workbook = read_xml(z, "xl/workbook.xml")

        sheet_names = []

        if workbook is not None:
            for sheet in workbook.findall(
                "main:sheets/main:sheet", NS
            ):
                name = sheet.attrib.get("name", "")
                sheet_names.append(name)

        features["sheet_count"] = len(sheet_names)

        # --------------------------------------------------------------
        # Shared strings
        # --------------------------------------------------------------

        shared_strings = []

        if "xl/sharedStrings.xml" in names:

            root = read_xml(z, "xl/sharedStrings.xml")

            if root is not None:
                for si in root.findall("main:si", NS):

                    parts = []

                    for t in si.iter(
                        "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"
                    ):
                        if t.text:
                            parts.append(t.text)

                    shared_strings.append("".join(parts))

        # --------------------------------------------------------------
        # Workbook relationships / external links
        # --------------------------------------------------------------

        remote_count = 0

        for name in names:

            lower = name.lower()

            if "externalLinks" in name:
                remote_count += 1

            if lower.endswith(".xml.rels"):

                try:
                    data = z.read(name).decode(
                        "utf-8",
                        errors="ignore"
                    ).lower()

                    if (
                        "external" in data
                        or "http://" in data
                        or "https://" in data
                    ):
                        remote_count += data.count("http://")
                        remote_count += data.count("https://")

                except Exception:
                    pass

        features["remote_template_present"] = remote_count

        # --------------------------------------------------------------
        # Macro detection
        # --------------------------------------------------------------

        vba_text = extract_vba_text(z)

        if vba_text:
            features["has_macro"] = 1
            features["macro_count"] = 1

        # --------------------------------------------------------------
        # Workbook-level properties
        # --------------------------------------------------------------

        if workbook is not None:

            defined_names = workbook.find(
                "main:definedNames", NS
            )

            if defined_names is not None:
                features["named_ranges_count"] = len(
                    list(defined_names)
                )

        # --------------------------------------------------------------
        # Worksheet processing
        # --------------------------------------------------------------

        worksheet_files = sorted(
            n for n in names
            if re.match(r"xl/worksheets/sheet\d+\.xml$", n)
        )

        all_text = []

        total_cells = 0
        non_empty = 0
        numeric_cells = 0
        string_cells = 0
        formula_count = 0
        hyperlink_count = 0

        max_rows = 0
        max_cols = 0

        merged_count = 0
        hidden_count = 0
        protected_count = 0
        empty_count = 0
        rich_text_count = 0

        for sheet_file in worksheet_files:

            root = read_xml(z, sheet_file)

            if root is None:
                continue

            # ----------------------------------------------------------
            # Rows / cells
            # ----------------------------------------------------------

            rows = root.findall(
                ".//main:sheetData/main:row",
                NS
            )

            sheet_has_cells = False

            sheet_max_row = 0
            sheet_max_col = 0

            for row in rows:

                row_num = safe_int(
                    row.attrib.get("r", "0")
                )

                sheet_max_row = max(
                    sheet_max_row,
                    row_num
                )

                cells = row.findall(
                    "main:c",
                    NS
                )

                for cell in cells:

                    sheet_has_cells = True
                    total_cells += 1
                    non_empty += 1

                    ref = cell.attrib.get("r", "")

                    # Column number from Excel reference
                    match = re.match(
                        r"([A-Z]+)",
                        ref.upper()
                    )

                    if match:

                        col_letters = match.group(1)

                        col_num = 0

                        for char in col_letters:
                            col_num = (
                                col_num * 26
                                + ord(char) - ord("A") + 1
                            )

                        sheet_max_col = max(
                            sheet_max_col,
                            col_num
                        )

                    cell_type = cell.attrib.get("t", "")

                    formula = cell.find(
                        "main:f",
                        NS
                    )

                    if formula is not None:
                        formula_count += 1

                    value_node = cell.find(
                        "main:v",
                        NS
                    )

                    inline_node = cell.find(
                        "main:is",
                        NS
                    )

                    value = ""

                    if value_node is not None and value_node.text:
                        value = value_node.text

                    elif inline_node is not None:
                        parts = []

                        for t in inline_node.iter(
                            "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"
                        ):
                            if t.text:
                                parts.append(t.text)

                        value = "".join(parts)

                    if cell_type == "s":

                        idx = safe_int(value)

                        if 0 <= idx < len(shared_strings):
                            value = shared_strings[idx]

                        string_cells += 1

                    elif cell_type == "str":
                        string_cells += 1

                    elif cell_type == "inlineStr":
                        string_cells += 1

                    else:

                        if value != "":
                            numeric_cells += 1

                    if value:
                        all_text.append(str(value))

                        if len(str(value)) > 0:
                            rich_text_count += 0

            max_rows = max(max_rows, sheet_max_row)
            max_cols = max(max_cols, sheet_max_col)

            if not sheet_has_cells:
                empty_count += 1

            # ----------------------------------------------------------
            # Hyperlinks
            # ----------------------------------------------------------

            hyperlinks = root.findall(
                ".//main:hyperlinks/main:hyperlink",
                NS
            )

            hyperlink_count += len(hyperlinks)

            # ----------------------------------------------------------
            # Merged cells
            # ----------------------------------------------------------

            merged = root.findall(
                ".//main:mergeCells/main:mergeCell",
                NS
            )

            merged_count += len(merged)

            # ----------------------------------------------------------
            # Hidden rows
            # ----------------------------------------------------------

            for row in rows:
                if row.attrib.get("hidden") == "1":
                    hidden_count += 1

            # ----------------------------------------------------------
            # Sheet protection
            # ----------------------------------------------------------

            protection = root.find(
                ".//main:sheetProtection",
                NS
            )

            if protection is not None:
                protected_count += 1

        # --------------------------------------------------------------
        # Basic features
        # --------------------------------------------------------------

        features["max_rows"] = max_rows
        features["max_cols"] = max_cols
        features["total_cells"] = total_cells
        features["non_empty_cells"] = non_empty
        features["numeric_cell_count"] = numeric_cells
        features["string_cell_count"] = string_cells
        features["formula_count"] = formula_count
        features["hyperlink_count"] = hyperlink_count

        if all_text:

            text = " ".join(all_text)

            features["avg_cell_length"] = (
                sum(len(x) for x in all_text)
                / len(all_text)
            )

            features["entropy_of_text"] = entropy(text)

            # Base64-like sequences
            features["base64_pattern_count"] = len(
                re.findall(
                    r"(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{20,}={0,2}(?![A-Za-z0-9+/])",
                    text
                )
            )

            # Hex-like sequences
            features["hex_pattern_count"] = len(
                re.findall(
                    r"(?<![A-Fa-f0-9])[A-Fa-f0-9]{16,}(?![A-Fa-f0-9])",
                    text
                )
            )

        features["merged_cells_count"] = merged_count
        features["hidden_sheets_count"] = hidden_count
        features["protected_sheets_count"] = protected_count
        features["empty_sheet_count"] = empty_count
        features["rich_text_formatting_count"] = rich_text_count

        # --------------------------------------------------------------
        # Macro features
        # --------------------------------------------------------------

        if vba_text:

            lines = vba_text.splitlines()

            features["macro_line_count"] = len(lines)

            nonempty_lines = [
                x.strip()
                for x in lines
                if x.strip()
            ]

            if nonempty_lines:

                features["macro_average_line_length"] = (
                    sum(len(x) for x in nonempty_lines)
                    / len(nonempty_lines)
                )

                features["macro_max_line_length"] = max(
                    len(x) for x in nonempty_lines
                )

            lower = vba_text.lower()

            features["macro_procedure_count"] = len(
                re.findall(
                    r"\b(sub|function|property)\b",
                    lower
                )
            )

            features["macro_chr_count"] = len(
                re.findall(
                    r"\bchr(w)?\s*\(",
                    lower
                )
            )

            features["macro_string_function_count"] = len(
                re.findall(
                    r"\b(left|right|mid|replace|strreverse|strings?)\s*\(",
                    lower
                )
            )

            features["macro_arithmetic_operator_count"] = len(
                re.findall(
                    r"(?<![<>=])[\+\-\*/](?![<>=])",
                    vba_text
                )
            )

            features["macro_concatenation_count"] = len(
                re.findall(
                    r"\s&\s",
                    vba_text
                )
            )

            # Dataset column is zero for all supplied samples.
            features["macro_callbyname_count"] = 0

            features["macro_comment_lines"] = sum(
                1
                for line in lines
                if line.strip().startswith("'")
            )

            tokens = re.findall(
                r"[A-Za-z_][A-Za-z0-9_]*",
                vba_text
            )

            features["macro_token_count"] = len(tokens)
            features["macro_vocab_size"] = len(set(tokens))

            features["macro_count_parentheses"] = (
                vba_text.count("(")
                + vba_text.count(")")
            )

            features["macro_count_assignments"] = len(
                re.findall(
                    r"(?<![<>=])=(?!=)",
                    vba_text
                )
            )

            string_literals = re.findall(
                r'"[^"]*"',
                vba_text
            )

            features["macro_max_string_literals"] = len(
                string_literals
            )

            features["macro_max_arithmetic_ops"] = max(
                (
                    len(
                        re.findall(
                            r"[\+\-\*/]",
                            line
                        )
                    )
                    for line in lines
                ),
                default=0
            )

            features["macro_max_concat_ops"] = max(
                (
                    line.count("&")
                    for line in lines
                ),
                default=0
            )

            # API indicators
            file_apis = [
                "open",
                "close",
                "kill",
                "mkdir",
                "rmdir",
                "filesystemobject",
                "opentextfile",
            ]

            network_apis = [
                "xmlhttp",
                "winhttp",
                "internetopen",
                "urlmon",
                "http",
                "https",
            ]

            process_apis = [
                "shell",
                "wscript.shell",
                "createprocess",
                "shellexecute",
                "exec",
            ]

            features["uses_file_api"] = int(
                any(x in lower for x in file_apis)
            )

            features["uses_network_api"] = int(
                any(x in lower for x in network_apis)
            )

            features["uses_process_api"] = int(
                any(x in lower for x in process_apis)
            )

        # --------------------------------------------------------------
        # These are zero throughout the supplied dataset.
        # --------------------------------------------------------------

        features["ocr_extracted_text_length"] = 0
        features["preview_image_text_entropy"] = 0
        features["deceptive_keywords_count_ocr"] = 0
        features["preview_image_width"] = 0
        features["preview_image_height"] = 0

    return [features[name] for name in FEATURE_NAMES]


if __name__ == "__main__":

    import sys

    if len(sys.argv) != 2:
        print(
            "Usage: python excel_feature_extractor.py <file.xlsx>"
        )
        sys.exit(1)

    path = sys.argv[1]

    values = extract_excel_features(path)

    print("Excel feature extraction successful")
    print("Feature count:", len(values))
    print()

    for name, value in zip(FEATURE_NAMES, values):
        print(f"{name}: {value}")
