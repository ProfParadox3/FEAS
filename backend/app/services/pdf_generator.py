from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
from typing import Dict, Any, List
import tempfile
import logging
from pathlib import Path

from app.models.schemas import JobDetailsResponse

logger = logging.getLogger(__name__)

class PDFReportGenerator:
    """Generates forensic PDF reports"""
    
    @staticmethod
    def create_header_footer(canvas_obj, doc):
        """Create header and footer for PDF pages"""
        canvas_obj.saveState()
        
        # Header
        canvas_obj.setFont('Helvetica-Bold', 12)
        canvas_obj.drawString(inch, 10.5*inch, "FORENSIC EVIDENCE ACQUISITION REPORT")
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.drawString(inch, 10.25*inch, "Classified: Law Enforcement Use Only")
        
        # Footer
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.drawString(inch, 0.75*inch, 
                            f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        canvas_obj.drawString(7*inch, 0.75*inch, f"Page {doc.page}")
        
        canvas_obj.restoreState()
    
    @staticmethod
    def generate_report(job_details: JobDetailsResponse) -> str:
        """Generate PDF report from job details"""
        try:
            # Create temporary file for PDF
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_path = temp_file.name
            temp_file.close()
            
            # Create document
            doc = SimpleDocTemplate(
                temp_path,
                pagesize=letter,
                rightMargin=inch,
                leftMargin=inch,
                topMargin=inch,
                bottomMargin=inch
            )
            
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            story = []
            
            # Title
            story.append(Paragraph("FORENSIC EVIDENCE REPORT", title_style))
            story.append(Spacer(1, 20))
            
            # Case Information
            case_data = [
                ["Job ID:", job_details.job_id],
                ["Investigator ID:", job_details.chain_of_custody[0].investigator_id],
                ["Source Type:", job_details.source.value.upper()],
                ["Platform:", job_details.platform.value.upper() if job_details.platform else "LOCAL"],
                ["Acquisition Date:", job_details.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')],
                ["Completion Date:", 
                 job_details.completed_at.strftime('%Y-%m-%d %H:%M:%S UTC') 
                 if job_details.completed_at else "N/A"],
            ]
            
            case_table = Table(case_data, colWidths=[2*inch, 4*inch])
            case_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            
            story.append(Paragraph("Case Information", styles['Heading2']))
            story.append(case_table)
            story.append(Spacer(1, 20))
            
            # Hash Information
            hash_data = [
                ["SHA-256 Hash:", job_details.metadata.sha256_hash],
                ["File Name:", job_details.metadata.file_name],
                ["File Size:", f"{job_details.metadata.file_size:,} bytes"],
                ["MIME Type:", job_details.metadata.mime_type],
            ]
            
            hash_table = Table(hash_data, colWidths=[2*inch, 4*inch])
            hash_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            
            story.append(Paragraph("Digital Fingerprint", styles['Heading2']))
            story.append(hash_table)
            story.append(Spacer(1, 20))
            
            # Chain of Custody
            story.append(Paragraph("Chain of Custody Log", styles['Heading2']))
            
            custody_data = [["Timestamp", "Event", "Investigator", "Details"]]
            for entry in job_details.chain_of_custody:
                details_str = str(entry.details)
                if len(details_str) > 100:
                    details_str = details_str[:100] + "..."
                
                custody_data.append([
                    entry.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    entry.event,
                    entry.investigator_id,
                    details_str
                ])
            
            custody_table = Table(custody_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 2*inch])
            custody_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
            ]))
            
            story.append(custody_table)
            story.append(Spacer(1, 20))
            
            # Metadata Section
            if job_details.metadata.exif_data:
                story.append(Paragraph("EXIF Metadata", styles['Heading2']))
                
                exif_data = [["Field", "Value"]]
                for key, value in job_details.metadata.exif_data.items():
                    value_str = str(value)
                    if len(value_str) > 200:
                        value_str = value_str[:200] + "..."
                    exif_data.append([key, value_str])
                
                exif_table = Table(exif_data, colWidths=[2*inch, 4*inch])
                exif_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('FONTSIZE', (0, 0), (-1, -1), 8),
                ]))
                
                story.append(exif_table)
            
            # Build PDF
            doc.build(story, 
                     onFirstPage=PDFReportGenerator.create_header_footer,
                     onLaterPages=PDFReportGenerator.create_header_footer)
            
            logger.info(f"PDF report generated: {temp_path}")
            return temp_path
            
        except Exception as e:
            logger.error(f"PDF generation failed: {str(e)}")
            raise
    
    @staticmethod
    def create_verification_report(job_id: str, 
                                  verification_result: Dict[str, Any]) -> str:
        """Create verification report"""
        try:
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='_verification.pdf')
            temp_path = temp_file.name
            temp_file.close()
            
            doc = SimpleDocTemplate(
                temp_path,
                pagesize=letter,
                rightMargin=inch,
                leftMargin=inch,
                topMargin=inch,
                bottomMargin=inch
            )
            
            styles = getSampleStyleSheet()
            story = []
            
            story.append(Paragraph("HASH VERIFICATION REPORT", styles['Title']))
            story.append(Spacer(1, 20))
            
            verification_data = [
                ["Job ID:", job_id],
                ["Verification Date:", 
                 datetime.fromisoformat(
                     verification_result['verification_timestamp'].replace('Z', '+00:00')
                 ).strftime('%Y-%m-%d %H:%M:%S UTC')],
                ["Original Hash:", verification_result['original_hash']],
                ["Current Hash:", verification_result['current_hash']],
                ["Integrity Match:", 
                 "✓ PASS" if verification_result['matches'] else "✗ FAIL"],
                ["Verification Result:", 
                 "File integrity verified. No alterations detected." 
                 if verification_result['matches'] 
                 else "WARNING: File integrity check failed. Evidence may have been altered."],
            ]
            
            table = Table(verification_data, colWidths=[2*inch, 4*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('BACKGROUND', (0, 4), (-1, 4), 
                 colors.lightgreen if verification_result['matches'] else colors.pink),
            ]))
            
            story.append(table)
            doc.build(story, onFirstPage=PDFReportGenerator.create_header_footer)
            
            return temp_path
            
        except Exception as e:
            logger.error(f"Verification report generation failed: {str(e)}")
            raise