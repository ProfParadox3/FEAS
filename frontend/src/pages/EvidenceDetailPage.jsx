import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FaFingerprint, 
  FaFileAlt,
  FaHistory,
  FaDownload,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaUser,
  FaGlobe,
  FaUpload,
  FaExclamationTriangle
} from 'react-icons/fa';
import { format } from 'date-fns';
import SHA256Display from '../components/evidence/SHA256Display';
import { forensicAPI } from '../services/api';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const JobId = styled.code`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: ${({ theme }) => theme.primary};
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetadataCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 1.5rem;
`;

const MetadataHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
`;

const MetadataIcon = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.primary};
`;

const MetadataTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const MetadataList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const MetadataLabel = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 500;
`;

const MetadataValue = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  text-align: right;
  max-width: 200px;
  word-break: break-word;
  font-family: ${({ mono }) => mono ? 'var(--font-mono)' : 'inherit'};
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: ${({ status, theme }) => {
    switch(status) {
      case 'completed':
        return `${theme.success}20`;
      case 'processing':
        return `${theme.primary}20`;
      case 'failed':
        return `${theme.error}20`;
      default:
        return `${theme.warning}20`;
    }
  }};
  color: ${({ status, theme }) => {
    switch(status) {
      case 'completed':
        return theme.success;
      case 'processing':
        return theme.primary;
      case 'failed':
        return theme.error;
      default:
        return theme.warning;
    }
  }};
  border: 1px solid ${({ status, theme }) => {
    switch(status) {
      case 'completed':
        return `${theme.success}40`;
      case 'processing':
        return `${theme.primary}40`;
      case 'failed':
        return `${theme.error}40`;
      default:
        return `${theme.warning}40`;
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme, variant }) => {
    switch(variant) {
      case 'primary':
        return theme.primary;
      case 'danger':
        return theme.error;
      default:
        return 'transparent';
    }
  }};
  color: ${({ theme, variant }) => {
    switch(variant) {
      case 'primary':
      case 'danger':
        return theme.cardBackground;
      default:
        return theme.text;
    }
  }};
  border: 1px solid ${({ theme, variant }) => {
    switch(variant) {
      case 'primary':
        return theme.primary;
      case 'danger':
        return theme.error;
      default:
        return theme.cardBorder;
    }
  }};
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px ${({ theme }) => theme.primary}40;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  width: 50px;
  height: 50px;
  border: 3px solid ${({ theme }) => theme.cardBorder};
  border-top-color: ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
`;

const LoadingText = styled.div`
  font-family: var(--font-mono);
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  background: ${({ theme }) => theme.error}10;
  border: 1px solid ${({ theme }) => theme.error}20;
  border-radius: 12px;
  padding: 2rem;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.error};
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.error};
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.text};
  margin-bottom: 1.5rem;
  max-width: 500px;
`;

const EvidenceDetailPage = () => {
  const { jobId } = useParams();
  
  const { data: jobDetails, isLoading, error } = useQuery(
    ['jobDetails', jobId],
    async () => {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!jobId) {
        throw new Error('Job ID is required');
      }
      
      const mockJob = {
        id: jobId || 'JOB-8A3F2B1C',
        status: 'completed',
        source: 'url',
        platform: 'twitter',
        filename: 'twitter_video.mp4',
        size: 15674321,
        mimeType: 'video/mp4',
        sha256Hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234',
        investigatorId: 'INV-2023-001',
        caseNumber: 'CASE-2023-456',
        createdAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3500000),
        originalUrl: 'https://twitter.com/user/status/1234567890',
        storagePath: '/evidence_storage/JOB-8A3F2B1C/evidence.mp4',
        notes: 'Evidence acquired for investigation into online harassment case.',
        metadata: {
          video: {
            duration: '120.5',
            resolution: '1920x1080',
            codec: 'h264',
            frameRate: '30'
          },
          platform: {
            uploader: '@username',
            uploadDate: '2023-10-15',
            views: '15000',
            likes: '450'
          }
        },
        chainOfCustody: [
          {
            timestamp: new Date(Date.now() - 3600000),
            event: 'EVIDENCE_ACQUISITION',
            investigatorId: 'INV-2023-001',
            details: { source: 'twitter', url: 'https://twitter.com/user/status/1234567890' }
          },
          {
            timestamp: new Date(Date.now() - 3550000),
            event: 'DOWNLOAD_COMPLETE',
            investigatorId: 'SYSTEM',
            details: { fileSize: 15674321, duration: '120.5s' }
          },
          {
            timestamp: new Date(Date.now() - 3530000),
            event: 'HASH_COMPUTATION',
            investigatorId: 'SYSTEM',
            details: { algorithm: 'SHA-256', hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234' }
          },
          {
            timestamp: new Date(Date.now() - 3500000),
            event: 'PROCESSING_COMPLETE',
            investigatorId: 'SYSTEM',
            details: { status: 'success', storageLocation: '/evidence_storage/JOB-8A3F2B1C' }
          }
        ]
      };
      
      return mockJob;
    },
    {
      enabled: !!jobId,
      retry: 1
    }
  );
  
  const handleDownloadPDF = () => {
    // PDF download logic
    window.open(`/api/v1/jobs/${jobId}/pdf`, '_blank');
  };
  
  const handleVerifyIntegrity = async () => {
    try {
      await forensicAPI.verifyIntegrity(jobId);
      alert('Integrity verification initiated');
    } catch (error) {
      alert(`Verification failed: ${error.message}`);
    }
  };
  
  const handleDownloadOriginal = () => {
    // Original file download logic
    alert('Original file download initiated');
  };
  
  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>
          Loading forensic evidence details...
        </LoadingText>
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>
          <FaExclamationTriangle />
        </ErrorIcon>
        <ErrorTitle>Evidence Not Found</ErrorTitle>
        <ErrorMessage>
          The requested evidence with Job ID "{jobId}" could not be found.
          Please check the job ID and try again.
        </ErrorMessage>
        <ActionButton onClick={() => window.history.back()}>
          Go Back
        </ActionButton>
      </ErrorContainer>
    );
  }
  
  if (!jobDetails) {
    return null;
  }
  
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FaFingerprint />
          Evidence Details
          <JobId>{jobDetails.id}</JobId>
        </PageTitle>
        
        <StatusBadge status={jobDetails.status}>
          {jobDetails.status === 'completed' && <FaCheckCircle />}
          {jobDetails.status === 'failed' && <FaTimesCircle />}
          {jobDetails.status.toUpperCase()}
        </StatusBadge>
      </PageHeader>
      
      <SHA256Display 
        hash={jobDetails.sha256Hash} 
        jobId={jobDetails.id}
      />
      
      <MetadataGrid>
        <MetadataCard>
          <MetadataHeader>
            <MetadataIcon>
              <FaFileAlt />
            </MetadataIcon>
            <MetadataTitle>File Information</MetadataTitle>
          </MetadataHeader>
          
          <MetadataList>
            <MetadataItem>
              <MetadataLabel>Filename</MetadataLabel>
              <MetadataValue mono>{jobDetails.filename}</MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>File Size</MetadataLabel>
              <MetadataValue>
                {(jobDetails.size / 1024 / 1024).toFixed(2)} MB
              </MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>MIME Type</MetadataLabel>
              <MetadataValue mono>{jobDetails.mimeType}</MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>Source</MetadataLabel>
              <MetadataValue>
                {jobDetails.source === 'url' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaGlobe /> URL Acquisition
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaUpload /> Local Upload
                  </span>
                )}
              </MetadataValue>
            </MetadataItem>
            
            {jobDetails.platform && (
              <MetadataItem>
                <MetadataLabel>Platform</MetadataLabel>
                <MetadataValue>
                  {jobDetails.platform.toUpperCase()}
                </MetadataValue>
              </MetadataItem>
            )}
          </MetadataList>
        </MetadataCard>
        
        <MetadataCard>
          <MetadataHeader>
            <MetadataIcon>
              <FaUser />
            </MetadataIcon>
            <MetadataTitle>Investigation Details</MetadataTitle>
          </MetadataHeader>
          
          <MetadataList>
            <MetadataItem>
              <MetadataLabel>Investigator ID</MetadataLabel>
              <MetadataValue mono>{jobDetails.investigatorId}</MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>Case Number</MetadataLabel>
              <MetadataValue mono>{jobDetails.caseNumber || 'N/A'}</MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>Acquisition Date</MetadataLabel>
              <MetadataValue>
                {format(jobDetails.createdAt, 'yyyy-MM-dd HH:mm:ss')}
              </MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>Completion Date</MetadataLabel>
              <MetadataValue>
                {jobDetails.completedAt 
                  ? format(jobDetails.completedAt, 'yyyy-MM-dd HH:mm:ss')
                  : 'N/A'}
              </MetadataValue>
            </MetadataItem>
            
            {jobDetails.originalUrl && (
              <MetadataItem>
                <MetadataLabel>Original URL</MetadataLabel>
                <MetadataValue mono>
                  <a 
                    href={jobDetails.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {jobDetails.originalUrl.substring(0, 30)}...
                  </a>
                </MetadataValue>
              </MetadataItem>
            )}
          </MetadataList>
        </MetadataCard>
        
        <MetadataCard>
          <MetadataHeader>
            <MetadataIcon>
              <FaHistory />
            </MetadataIcon>
            <MetadataTitle>Processing Timeline</MetadataTitle>
          </MetadataHeader>
          
          <MetadataList>
            {jobDetails.chainOfCustody?.slice(0, 5).map((entry, index) => (
              <MetadataItem key={index}>
                <MetadataLabel>
                  {format(entry.timestamp, 'HH:mm:ss')}
                </MetadataLabel>
                <MetadataValue>
                  {entry.event.replace(/_/g, ' ')}
                </MetadataValue>
              </MetadataItem>
            ))}
            
            {jobDetails.chainOfCustody && jobDetails.chainOfCustody.length > 5 && (
              <MetadataItem>
                <MetadataLabel>...</MetadataLabel>
                <MetadataValue>
                  +{jobDetails.chainOfCustody.length - 5} more events
                </MetadataValue>
              </MetadataItem>
            )}
          </MetadataList>
        </MetadataCard>
        
        <MetadataCard>
          <MetadataHeader>
            <MetadataIcon>
              <FaShieldAlt />
            </MetadataIcon>
            <MetadataTitle>Chain of Custody</MetadataTitle>
          </MetadataHeader>
          
          <MetadataList>
            <MetadataItem>
              <MetadataLabel>Total Events</MetadataLabel>
              <MetadataValue>
                {jobDetails.chainOfCustody?.length || 0}
              </MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>First Event</MetadataLabel>
              <MetadataValue>
                {jobDetails.chainOfCustody?.[0]?.event.replace(/_/g, ' ') || 'N/A'}
              </MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>Last Event</MetadataLabel>
              <MetadataValue>
                {jobDetails.chainOfCustody?.[jobDetails.chainOfCustody.length - 1]?.event.replace(/_/g, ' ') || 'N/A'}
              </MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>Integrity Verified</MetadataLabel>
              <MetadataValue>
                <span style={{ color: '#10b981', fontWeight: '600' }}>
                  ✓ Yes
                </span>
              </MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>Storage Path</MetadataLabel>
              <MetadataValue mono>
                {jobDetails.storagePath}
              </MetadataValue>
            </MetadataItem>
          </MetadataList>
        </MetadataCard>
      </MetadataGrid>
      
      <ActionButtons>
        <ActionButton variant="primary" onClick={handleDownloadPDF}>
          <FaDownload />
          Download PDF Report
        </ActionButton>
        
        <ActionButton onClick={handleVerifyIntegrity}>
          <FaShieldAlt />
          Verify Integrity
        </ActionButton>
        
        <ActionButton onClick={handleDownloadOriginal}>
          <FaDownload />
          Download Original File
        </ActionButton>
        
        <ActionButton>
          <FaCalendarAlt />
          View Full Chain of Custody
        </ActionButton>
      </ActionButtons>
    </PageContainer>
  );
};

export default EvidenceDetailPage;