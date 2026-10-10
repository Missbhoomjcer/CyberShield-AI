from pathlib import Path
import zipfile
import shutil
import tempfile

SUPPORTED_EXTENSIONS = {
    ".exe", ".dll", ".sys",
    ".pdf",
    ".doc", ".docx",
    ".xls", ".xlsx"
}

MAX_FILES = 500
MAX_EXTRACTED_SIZE = 200 * 1024 * 1024


def safe_extract(archive, destination):
    destination = Path(destination).resolve()
    extracted = []
    total_size = 0

    for info in archive.infolist():
        if info.is_dir():
            continue

        target = (destination / info.filename).resolve()

        if not str(target).startswith(str(destination)):
            raise ValueError(f"Unsafe ZIP path detected: {info.filename}")

        total_size += info.file_size

        if total_size > MAX_EXTRACTED_SIZE:
            raise ValueError("ZIP extraction size limit exceeded.")

        target.parent.mkdir(parents=True, exist_ok=True)

        with archive.open(info) as source, open(target, "wb") as output:
            shutil.copyfileobj(source, output)

        extracted.append(target)

    return extracted


def scan_file(file_path):
    extension = file_path.suffix.lower()

    if extension in {".exe", ".dll", ".sys"}:
        from backend.ml.predict_file import predict_file
        return predict_file(str(file_path)), "PE/XGBoost"

    if extension == ".pdf":
        from backend.ml.predict_pdf import predict_pdf
        return predict_pdf(str(file_path)), "PDF/XGBoost"

    if extension in {".doc", ".docx"}:
        from backend.ml.predict_word import predict_word
        return predict_word(str(file_path)), "Word/XGBoost"

    if extension in {".xls", ".xlsx"}:
        from backend.ml.predict_excel import predict_excel
        return predict_excel(str(file_path)), "Excel/XGBoost"

    return None, None


def get_verdict(result):
    if not isinstance(result, dict):
        return "UNKNOWN"

    verdict = str(result.get("verdict", "")).upper()
    prediction = result.get("prediction")

    if verdict in {"MALICIOUS", "SUSPICIOUS", "THREAT"}:
        return "MALICIOUS"

    if prediction == 1:
        return "MALICIOUS"

    return "BENIGN"


def inspect_zip(file_path):
    file_path = Path(file_path)

    if not zipfile.is_zipfile(file_path):
        raise ValueError("Uploaded file is not a valid ZIP archive.")

    with zipfile.ZipFile(file_path, "r") as archive:

        if len(archive.infolist()) > MAX_FILES:
            raise ValueError("ZIP contains too many files.")

        entries = []

        for info in archive.infolist():
            entries.append({
                "name": info.filename,
                "size": info.file_size,
                "compressed_size": info.compress_size,
                "extension": Path(info.filename).suffix.lower()
            })

        supported_files = [
            x["name"]
            for x in entries
            if x["extension"] in SUPPORTED_EXTENSIONS
        ]

        suspicious_files = [
            x["name"]
            for x in entries
            if x["extension"] in {
                ".exe", ".dll", ".sys",
                ".js", ".vbs", ".ps1", ".bat", ".cmd"
            }
        ]

        if not supported_files:
            return {
                "file": str(file_path),
                "file_type": ".zip",
                "entries": len(entries),
                "supported_files": [],
                "suspicious_files": suspicious_files,
                "scanned_files": [],
                "verdict": "INSPECTABLE"
            }

        results = []

        with tempfile.TemporaryDirectory(prefix="cybershield_zip_") as temp_dir:

            extracted_files = safe_extract(
                archive,
                temp_dir
            )

            for extracted_file in extracted_files:

                if extracted_file.suffix.lower() not in SUPPORTED_EXTENSIONS:
                    continue

                try:
                    prediction, detector = scan_file(extracted_file)

                    results.append({
                        "file": extracted_file.relative_to(temp_dir).as_posix(),
                        "detector": detector,
                        "verdict": get_verdict(prediction),
                        "prediction": prediction
                    })

                except Exception as exc:
                    results.append({
                        "file": extracted_file.relative_to(temp_dir).as_posix(),
                        "detector": "ERROR",
                        "verdict": "ERROR",
                        "error": str(exc)
                    })

        malicious_files = [
            r for r in results
            if r["verdict"] == "MALICIOUS"
        ]

        error_files = [
            r for r in results
            if r["verdict"] == "ERROR"
        ]

        if malicious_files:
            final_verdict = "MALICIOUS"
        elif error_files and not results:
            final_verdict = "SCAN_ERROR"
        else:
            final_verdict = "BENIGN"

        return {
            "file": str(file_path),
            "file_type": ".zip",
            "entries": len(entries),
            "supported_files": supported_files,
            "suspicious_files": suspicious_files,
            "scanned_files": results,
            "malicious_count": len(malicious_files),
            "error_count": len(error_files),
            "verdict": final_verdict
        }
