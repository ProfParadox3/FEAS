import json
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path
import logging
from contextlib import contextmanager

from app.core.config import settings
from app.models.schemas import ChainOfCustodyEntry

logger = logging.getLogger(__name__)

class ChainOfCustodyLogger:
    """Append-only chain of custody logger"""
    
    def __init__(self, log_path: str = None):
        self.log_path = Path(log_path or settings.CHAIN_OF_CUSTODY_LOG_PATH)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
    
    def log_event(self, 
                  job_id: str, 
                  event: str, 
                  details: Dict[str, Any],
                  investigator_id: str,
                  hash_verification: str = None) -> None:
        """Log a chain of custody event"""
        try:
            entry = ChainOfCustodyEntry(
                timestamp=datetime.utcnow(),
                event=event,
                details=details,
                investigator_id=investigator_id,
                hash_verification=hash_verification
            )
            
            log_entry = {
                'job_id': job_id,
                **entry.dict()
            }
            
            # Append to log file
            with open(self.log_path, 'a') as f:
                f.write(json.dumps(log_entry, default=str) + '\n')
            
            logger.info(f"Chain of custody logged: {job_id} - {event}")
            
        except Exception as e:
            logger.error(f"Failed to log chain of custody: {str(e)}")
    
    def get_job_logs(self, job_id: str) -> List[Dict[str, Any]]:
        """Retrieve all logs for a specific job"""
        logs = []
        
        try:
            if self.log_path.exists():
                with open(self.log_path, 'r') as f:
                    for line in f:
                        if line.strip():
                            try:
                                entry = json.loads(line)
                                if entry.get('job_id') == job_id:
                                    # Parse timestamp
                                    if 'timestamp' in entry:
                                        entry['timestamp'] = datetime.fromisoformat(
                                            entry['timestamp'].replace('Z', '+00:00')
                                        )
                                    logs.append(entry)
                            except json.JSONDecodeError as e:
                                logger.warning(f"Invalid JSON in log file: {str(e)}")
                                continue
        
        except Exception as e:
            logger.error(f"Failed to read chain of custody logs: {str(e)}")
        
        return sorted(logs, key=lambda x: x['timestamp'])
    
    @contextmanager
    def transaction(self, job_id: str, investigator_id: str):
        """Context manager for logging transaction events"""
        try:
            self.log_event(
                job_id=job_id,
                event="TRANSACTION_START",
                details={"action": "begin_transaction"},
                investigator_id=investigator_id
            )
            yield
            self.log_event(
                job_id=job_id,
                event="TRANSACTION_COMPLETE",
                details={"action": "end_transaction"},
                investigator_id=investigator_id
            )
        except Exception as e:
            self.log_event(
                job_id=job_id,
                event="TRANSACTION_FAILED",
                details={"error": str(e), "action": "failed_transaction"},
                investigator_id=investigator_id
            )
            raise
    
    def create_acquisition_log(self,
                             job_id: str,
                             source_type: str,
                             source_info: str,
                             investigator_id: str,
                             file_hash: str = None) -> None:
        """Create initial acquisition log entry"""
        self.log_event(
            job_id=job_id,
            event="EVIDENCE_ACQUISITION",
            details={
                "source_type": source_type,
                "source_info": source_info,
                "acquisition_method": "automated" if source_type == "url" else "manual_upload",
                "timestamp": datetime.utcnow().isoformat()
            },
            investigator_id=investigator_id,
            hash_verification=file_hash
        )
    
    def log_processing_stage(self,
                           job_id: str,
                           stage: str,
                           investigator_id: str,
                           details: Dict[str, Any] = None) -> None:
        """Log a processing stage"""
        self.log_event(
            job_id=job_id,
            event=f"PROCESSING_{stage.upper()}",
            details=details or {"stage": stage},
            investigator_id=investigator_id
        )