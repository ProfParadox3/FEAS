from enum import Enum

class ProcessingStage(str, Enum):
    INITIALIZATION = "initialization"
    VALIDATION = "validation"
    DOWNLOAD = "download"
    HASHING = "hashing"
    METADATA_EXTRACTION = "metadata_extraction"
    STORAGE = "storage"
    REPORT_GENERATION = "report_generation"
    COMPLETION = "completion"

class StorageType(str, Enum):
    LOCAL = "local"
    S3 = "s3"
    AZURE = "azure"
    GCS = "gcs"

class HashAlgorithm(str, Enum):
    SHA256 = "sha256"
    SHA512 = "sha512"
    MD5 = "md5"

class EvidenceType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    OTHER = "other"

class InvestigationStatus(str, Enum):
    ACTIVE = "active"
    PENDING = "pending"
    CLOSED = "closed"
    ARCHIVED = "archived"