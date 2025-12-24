#!/usr/bin/env python3
"""
FEAS PDF Generation Test Script

This script tests the PDF generation functionality by creating
a sample forensic report. Run this to verify PDF generation is working.

Usage:
    cd backend
    python -m pytest tests/test_pdf_generation.py -v

Or run directly:
    cd backend
    python tests/test_pdf_generation.py
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_pdf_generation():
    """Test PDF generation with sample data"""
    try:
        from app.services.pdf_generator import PDFReportGenerator
        from app.models.schemas import JobDetailsResponse, JobStatus
    except ImportError as e:
        raise ImportError(
            f"Failed to import required modules: {e}. "
            "Make sure you're running from the backend directory with dependencies installed."
        ) from e
    
    # Create sample job details
    sample_details = JobDetailsResponse(
        job_id="test-job-12345-abcde",
        status=JobStatus.COMPLETED,
        source="url",
        platform="twitter",
        metadata={
            "file_name": "sample_video.mp4",
            "file_size": 15728640,  # 15 MB
            "mime_type": "video/mp4",
            "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "extraction_timestamp": datetime.utcnow(),
            "exif_data": {
                "Duration": "00:02:30",
                "Resolution": "1920x1080",
                "Codec": "H.264",
                "Bitrate": "8000 kbps"
            },
            "media_metadata": {
                "video_codec": "h264",
                "audio_codec": "aac",
                "frame_rate": 30
            }
        },
        chain_of_custody=[
            {
                "timestamp": datetime.utcnow() - timedelta(minutes=10),
                "event": "ACQUISITION",
                "details": {"source": "url", "url": "https://twitter.com/user/status/123"},
                "investigator_id": "INV-001",
                "hash_verification": None
            },
            {
                "timestamp": datetime.utcnow() - timedelta(minutes=8),
                "event": "HASH_CALCULATED",
                "details": {"algorithm": "SHA256"},
                "investigator_id": "INV-001",
                "hash_verification": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            },
            {
                "timestamp": datetime.utcnow() - timedelta(minutes=5),
                "event": "METADATA_EXTRACTED",
                "details": {"mime_type": "video/mp4", "file_size": 15728640},
                "investigator_id": "INV-001",
                "hash_verification": None
            },
            {
                "timestamp": datetime.utcnow() - timedelta(minutes=3),
                "event": "EVIDENCE_STORED",
                "details": {"location": "local"},
                "investigator_id": "INV-001",
                "hash_verification": None
            },
            {
                "timestamp": datetime.utcnow(),
                "event": "REPORT_GENERATED",
                "details": {"report_path": "/tmp/test_report.pdf"},
                "investigator_id": "INV-001",
                "hash_verification": None
            }
        ],
        created_at=datetime.utcnow() - timedelta(minutes=10),
        completed_at=datetime.utcnow(),
        file_path="/evidence/test-job-12345/sample_video.mp4",
        storage_location="local",
        original_url="https://twitter.com/user/status/1234567890123456789"
    )
    
    # Generate PDF
    print("🔧 Generating test PDF report...")
    pdf_path = PDFReportGenerator.generate_report(sample_details)
    
    # Verify PDF was created
    assert os.path.exists(pdf_path), f"PDF file not created at {pdf_path}"
    assert os.path.getsize(pdf_path) > 0, "PDF file is empty"
    
    print(f"✅ PDF generated successfully: {pdf_path}")
    print(f"📄 File size: {os.path.getsize(pdf_path)} bytes")
    
    # Clean up
    # os.unlink(pdf_path)  # Uncomment to auto-delete test PDF
    
    return pdf_path


def test_verification_report():
    """Test verification report generation"""
    try:
        from app.services.pdf_generator import PDFReportGenerator
    except ImportError as e:
        raise ImportError(
            f"Failed to import PDFReportGenerator: {e}. "
            "Make sure you're running from the backend directory with dependencies installed."
        ) from e
    
    verification_result = {
        "matches": True,
        "original_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "current_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "verification_timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    print("🔧 Generating verification report...")
    pdf_path = PDFReportGenerator.create_verification_report(
        job_id="test-job-12345",
        verification_result=verification_result
    )
    
    assert os.path.exists(pdf_path), f"Verification PDF not created at {pdf_path}"
    print(f"✅ Verification report generated: {pdf_path}")
    
    return pdf_path


if __name__ == "__main__":
    print("=" * 60)
    print("FEAS PDF Generation Test")
    print("=" * 60)
    
    try:
        # Test main report
        report_path = test_pdf_generation()
        print()
        
        # Test verification report
        verification_path = test_verification_report()
        print()
        
        print("=" * 60)
        print("✅ All PDF generation tests passed!")
        print(f"📄 Main report: {report_path}")
        print(f"📄 Verification report: {verification_path}")
        print("=" * 60)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're running from the backend directory with dependencies installed.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
