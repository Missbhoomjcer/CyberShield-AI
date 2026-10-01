from pathlib import Path
import re
import pymupdf


def leading_number(value):
    """
    Extract the leading numeric value from a string.
    Example:
        '12(1)' -> 12
        '3'     -> 3
        '-1'    -> -1
    """
    if value is None:
        return 0.0

    match = re.match(r"^-?\d+(?:\.\d+)?", str(value).strip())

    if match:
        return float(match.group())

    return 0.0


def pdf_version(header):
    """Extract PDF version from %PDF-1.x."""
    if not header:
        return 0.0

    match = re.search(r"%PDF-(\d+\.\d+)", header)

    if match:
        return float(match.group(1))

    return 0.0


def yes_no_unclear(value):
    """
    Dataset encoding:
    No      -> 0
    Yes     -> 1
    unclear -> 2
    -1      -> -1
    """
    value = str(value).strip()

    mapping = {
        "No": 0,
        "Yes": 1,
        "unclear": 2,
        "-1": -1,
        "0": 0,
    }

    return mapping.get(value, 0)


def extract_pdf_features(pdf_path):
    """
    Extract the 31 features expected by the trained PDF XGBoost model.
    """

    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    if pdf_path.suffix.lower() != ".pdf":
        raise ValueError("Input file must be a PDF.")

    doc = pymupdf.open(pdf_path)

    try:
        file_bytes = pdf_path.read_bytes()
        file_size = len(file_bytes)

        header_match = re.search(
            rb"%PDF-(\d+\.\d+)",
            file_bytes[:1024]
        )

        header = (
            header_match.group(0).decode(
                "latin-1",
                errors="ignore"
            )
            if header_match
            else ""
        )

        # ---------------------------------------------------------
        # Basic PDF information
        # ---------------------------------------------------------

        page_count = len(doc)

        metadata = doc.metadata or {}

        metadata_size = sum(
            len(str(value))
            for value in metadata.values()
            if value
        )

        title = metadata.get("title") or ""

        title_characters = len(title)

        is_encrypted = 1 if doc.is_encrypted else 0

        # ---------------------------------------------------------
        # PDF object / structure analysis
        # ---------------------------------------------------------

        full_text = ""

        images = 0
        javascript = 0
        embedded_files = 0

        for page in doc:
            try:
                full_text += page.get_text()
            except Exception:
                pass

            try:
                images += len(page.get_images(full=True))
            except Exception:
                pass

        # JavaScript / embedded file counts
        try:
            javascript = len(doc.get_page_text("javascript"))
        except Exception:
            javascript = 0

        try:
            embedded_files = doc.embfile_names()
            embedded_file_count = len(embedded_files)
        except Exception:
            embedded_file_count = 0

        # ---------------------------------------------------------
        # Raw PDF keyword analysis
        # ---------------------------------------------------------

        raw_text = file_bytes.decode(
            "latin-1",
            errors="ignore"
        )

        def count_keyword(keyword):
            return len(
                re.findall(
                    re.escape(keyword),
                    raw_text,
                    flags=re.IGNORECASE
                )
            )

        obj = count_keyword(" obj")
        endobj = count_keyword("endobj")
        stream = count_keyword("stream")
        endstream = count_keyword("endstream")
        xref = count_keyword("xref")
        trailer = count_keyword("trailer")
        startxref = count_keyword("startxref")

        js_count = count_keyword("/JS")
        javascript_count = count_keyword("/JavaScript")
        aa_count = count_keyword("/AA")
        open_action = count_keyword("/OpenAction")
        acroform = count_keyword("/AcroForm")
        jbig2 = count_keyword("/JBIG2Decode")
        richmedia = count_keyword("/RichMedia")
        launch = count_keyword("/Launch")
        embedded_file = count_keyword("/EmbeddedFile")
        xfa = count_keyword("/XFA")

        objstm = count_keyword("/ObjStm")

        # ---------------------------------------------------------
        # Dataset-compatible text feature
        # ---------------------------------------------------------

        if full_text.strip():
            text_feature = 1
        else:
            text_feature = 0

        # ---------------------------------------------------------
        # Colors approximation
        # ---------------------------------------------------------

        colors = 0

        try:
            for page in doc:
                drawings = page.get_drawings()
                if drawings:
                    colors = 1
                    break
        except Exception:
            pass

        # ---------------------------------------------------------
        # Final 31-feature dictionary
        # ---------------------------------------------------------

        features = {
            "pdfsize": float(file_size),
            "metadata size": float(metadata_size),
            "pages": float(page_count),

            "xref Length": float(
                count_keyword("xref")
            ),

            "title characters": float(title_characters),

            "isEncrypted": float(is_encrypted),

            "embedded files": float(embedded_file_count),

            "images": float(images),

            "text": float(text_feature),

            "obj": float(obj),

            "endobj": float(endobj),

            "stream": float(stream),

            "endstream": float(endstream),

            "xref": float(xref),

            "trailer": float(trailer),

            "startxref": float(startxref),

            "pageno": float(page_count),

            "encrypt": float(
                count_keyword("/Encrypt")
            ),

            "ObjStm": float(objstm),

            "JS": float(js_count),

            "Javascript": float(javascript_count),

            "AA": float(aa_count),

            "OpenAction": float(open_action),

            "Acroform": float(acroform),

            "JBIG2Decode": float(jbig2),

            "RichMedia": float(richmedia),

            "launch": float(launch),

            "EmbeddedFile": float(embedded_file),

            "XFA": float(xfa),

            "Colors": float(colors),

            "header_version": float(
                pdf_version(header)
            ),
        }

        return features

    finally:
        doc.close()


if __name__ == "__main__":

    print("PDF feature extractor loaded successfully.")

    test_pdf = input(
        "Enter path to a PDF for testing: "
    ).strip().strip('"')

    try:

        features = extract_pdf_features(test_pdf)

        print("\nPDF FEATURES")
        print("=" * 60)

        for name, value in features.items():
            print(f"{name:25} : {value}")

        print("=" * 60)
        print(f"Total features: {len(features)}")

    except Exception as e:

        print("\nERROR:")
        print(e)