import os
import math
import hashlib
import pefile


# ============================================================
# CyberShield-AI
# PE Feature Engineering
# ============================================================


def calculate_entropy(data):
    """Calculate Shannon entropy."""

    if not data:
        return 0.0

    frequency = {}

    for byte in data:
        frequency[byte] = frequency.get(byte, 0) + 1

    entropy = 0.0
    length = len(data)

    for count in frequency.values():

        probability = count / length

        entropy -= probability * math.log2(
            probability
        )

    return entropy


def calculate_sha256(file_path):

    sha256 = hashlib.sha256()

    with open(
        file_path,
        "rb"
    ) as file:

        while True:

            chunk = file.read(8192)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()


def calculate_md5(file_path):

    md5 = hashlib.md5()

    with open(
        file_path,
        "rb"
    ) as file:

        while True:

            chunk = file.read(8192)

            if not chunk:
                break

            md5.update(chunk)

    return md5.hexdigest()


def safe_get(obj, attribute, default=0):

    try:
        value = getattr(
            obj,
            attribute
        )

        if value is None:
            return default

        return value

    except Exception:
        return default


def extract_pe_features(file_path):

    """
    Extract PE features from an EXE/DLL file.

    Returns a dictionary containing the features
    required by the CyberShield-AI pipeline.
    """

    if not os.path.exists(file_path):

        raise FileNotFoundError(
            f"File not found: {file_path}"
        )


    # ========================================================
    # BASIC INFORMATION
    # ========================================================

    file_size = os.path.getsize(
        file_path
    )

    sha256 = calculate_sha256(
        file_path
    )

    md5 = calculate_md5(
        file_path
    )


    # ========================================================
    # LOAD PE
    # ========================================================

    try:

        pe = pefile.PE(
            file_path,
            fast_load=False
        )

    except pefile.PEFormatError:

        raise ValueError(
            "The uploaded file is not a valid Windows PE file."
        )


    # ========================================================
    # DOS HEADER
    # ========================================================

    dos = pe.DOS_HEADER

    result = {

        "file_extension":
            os.path.splitext(
                file_path
            )[1].lower(),

        "EntryPoint":
            safe_get(
                dos,
                "e_ip"
            ),

        "PEType":
            safe_get(
                pe.FILE_HEADER,
                "Machine"
            ),

        "MachineType":
            safe_get(
                pe.FILE_HEADER,
                "Machine"
            ),

        "magic_number":
            safe_get(
                dos,
                "e_magic"
            ),

        "bytes_on_last_page":
            safe_get(
                dos,
                "e_cblp"
            ),

        "pages_in_file":
            safe_get(
                dos,
                "e_cp"
            ),

        "relocations":
            safe_get(
                dos,
                "e_crlc"
            ),

        "size_of_header":
            safe_get(
                dos,
                "e_cparhdr"
            ),

        "min_extra_paragraphs":
            safe_get(
                dos,
                "e_minalloc"
            ),

        "max_extra_paragraphs":
            safe_get(
                dos,
                "e_maxalloc"
            ),

        "init_ss_value":
            safe_get(
                dos,
                "e_ss"
            ),

        "init_sp_value":
            safe_get(
                dos,
                "e_sp"
            ),

        "init_ip_value":
            safe_get(
                dos,
                "e_ip"
            ),

        "init_cs_value":
            safe_get(
                dos,
                "e_cs"
            ),

        "over_lay_number":
            safe_get(
                dos,
                "e_ovno"
            ),

        "oem_identifier":
            safe_get(
                dos,
                "e_oemid"
            ),

        "address_of_ne_header":
            safe_get(
                dos,
                "e_lfanew"
            )
    }


    # ========================================================
    # FILE HEADER
    # ========================================================

    file_header = pe.FILE_HEADER

    result.update({

        "MachineType":
            safe_get(
                file_header,
                "Machine"
            ),

        "over_lay_number":
            safe_get(
                file_header,
                "NumberOfSections"
            )
    })


    # ========================================================
    # OPTIONAL HEADER
    # ========================================================

    optional = pe.OPTIONAL_HEADER

    optional_attributes = [

        "Magic",

        "SizeOfCode",

        "SizeOfInitializedData",

        "SizeOfUninitializedData",

        "AddressOfEntryPoint",

        "BaseOfCode",

        "BaseOfData",

        "ImageBase",

        "SectionAlignment",

        "FileAlignment",

        "MajorOperatingSystemVersion",

        "MajorImageVersion",

        "SizeOfImage",

        "SizeOfHeaders",

        "CheckSum",

        "Subsystem",

        "DllCharacteristics",

        "SizeOfStackReserve",

        "SizeOfStackCommit",

        "SizeOfHeapCommit",

        "SizeOfHeapReserve",

        "LoaderFlags"
    ]


    for attribute in optional_attributes:

        if attribute == "MajorOperatingSystemVersion":

            column = "OperatingSystemVersion"

        elif attribute == "MajorImageVersion":

            column = "ImageVersion"

        elif attribute == "CheckSum":

            column = "Checksum"

        else:

            column = attribute

        result[column] = safe_get(
            optional,
            attribute
        )


    # ========================================================
    # SECTION FEATURES
    # ========================================================

    section_names = [
        ".text",
        ".rdata"
    ]


    for section_name in section_names:

        prefix = section_name.replace(
            ".",
            ""
        )


        found_section = None


        for section in pe.sections:

            name = (
                section.Name
                .decode(
                    errors="ignore"
                )
                .rstrip("\x00")
            )

            if name.lower() == section_name:

                found_section = section

                break


        if found_section is None:

            result[
                f"{prefix}_VirtualSize"
            ] = 0

            result[
                f"{prefix}_VirtualAddress"
            ] = 0

            result[
                f"{prefix}_SizeOfRawData"
            ] = 0

            result[
                f"{prefix}_PointerToRawData"
            ] = 0

            result[
                f"{prefix}_PointerToRelocations"
            ] = 0

            result[
                f"{prefix}_PointerToLineNumbers"
            ] = 0

            result[
                f"{prefix}_Characteristics"
            ] = 0

        else:

            result[
                f"{prefix}_VirtualSize"
            ] = safe_get(
                found_section,
                "Misc_VirtualSize"
            )

            result[
                f"{prefix}_VirtualAddress"
            ] = safe_get(
                found_section,
                "VirtualAddress"
            )

            result[
                f"{prefix}_SizeOfRawData"
            ] = safe_get(
                found_section,
                "SizeOfRawData"
            )

            result[
                f"{prefix}_PointerToRawData"
            ] = safe_get(
                found_section,
                "PointerToRawData"
            )

            result[
                f"{prefix}_PointerToRelocations"
            ] = safe_get(
                found_section,
                "PointerToRelocations"
            )

            result[
                f"{prefix}_PointerToLineNumbers"
            ] = safe_get(
                found_section,
                "PointerToLinenumbers"
            )

            result[
                f"{prefix}_Characteristics"
            ] = safe_get(
                found_section,
                "Characteristics"
            )


    # ========================================================
    # BEHAVIOURAL FEATURES
    #
    # These cannot be obtained from a static PE file.
    # They will be populated later by the real-time
    # monitoring/simulation module.
    # ========================================================

    behavioural_features = [

        "registry_read",
        "registry_write",
        "registry_delete",
        "registry_total",

        "network_threats",
        "network_dns",
        "network_http",
        "network_connections",

        "processes_malicious",
        "processes_suspicious",
        "processes_monitored",
        "total_procsses",

        "files_malicious",
        "files_suspicious",
        "files_text",
        "files_unknown",

        "dlls_calls",
        "apis"
    ]


    for feature in behavioural_features:

        result[feature] = 0


    # ========================================================
    # EXTRA INFORMATION
    # ========================================================

    result["_file_size"] = file_size

    result["_entropy"] = calculate_entropy(
        open(
            file_path,
            "rb"
        ).read()
    )

    result["_sha256"] = sha256

    result["_md5"] = md5


    # ========================================================
    # CLOSE PE
    # ========================================================

    pe.close()


    return result


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)

    print(
        "CyberShield-AI PE Feature Extractor"
    )

    print("=" * 60)

    print(
        "Module loaded successfully."
    )

    print(
        "Use extract_pe_features(file_path)"
    )

    print(
        "to analyze a Windows EXE/DLL."
    )

    print("=" * 60)