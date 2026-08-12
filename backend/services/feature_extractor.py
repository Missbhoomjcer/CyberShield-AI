import os
import hashlib
import math


class FeatureExtractor:

    def __init__(self, file_path):
        self.file_path = file_path

    def calculate_sha256(self):
        sha = hashlib.sha256()

        with open(self.file_path, "rb") as f:
            while True:
                data = f.read(4096)

                if not data:
                    break

                sha.update(data)

        return sha.hexdigest()

    def get_file_size(self):
        return os.path.getsize(self.file_path)

    def get_extension(self):
        return os.path.splitext(self.file_path)[1].lower()

    def calculate_entropy(self):

        with open(self.file_path, "rb") as f:
            data = f.read()

        if len(data) == 0:
            return 0

        entropy = 0

        for x in range(256):
            p = data.count(bytes([x])) / len(data)

            if p > 0:
                entropy -= p * math.log2(p)

        return round(entropy, 3)

    def extract_features(self):

        return {
            "filename": os.path.basename(self.file_path),
            "extension": self.get_extension(),
            "size": self.get_file_size(),
            "entropy": self.calculate_entropy(),
            "sha256": self.calculate_sha256()
        }