import lief
import os


class PEAnalyzer:

    def __init__(self, file_path):
        self.file_path = file_path

    def analyze(self):

        extension = os.path.splitext(self.file_path)[1].lower()

        if extension not in [".exe", ".dll"]:
            return {
                "pe_file": False
            }

        try:

            binary = lief.parse(self.file_path)

            imports = []

            for library in binary.imports:
                imports.append(library.name)

            return {

                "pe_file": True,

                "machine": str(binary.header.machine),

                "entrypoint": binary.optional_header.addressof_entrypoint,

                "imagebase": binary.optional_header.imagebase,

                "number_of_sections": len(binary.sections),

                "imports": imports,

                "is_signed": binary.has_signatures

            }

        except Exception as e:

            return {

                "pe_file": False,

                "error": str(e)

            }