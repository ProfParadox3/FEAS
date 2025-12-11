import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FaFingerprint, FaFileAlt, FaHistory, FaDownload,
  FaGlobe, FaUpload, FaExclamationTriangle
} from 'react-icons/fa';
import { format } from 'date-fns';
import SHA256Display from '../components/evidence/SHA256Display';
import VerifyIntegrityButton from '../components/evidence/VerifyIntegrityButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { forensicAPI } from '../services/api';

/* ---- Styled Components ---- */

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderArea = styled.div`
  margin: 2rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;

const JobId = styled.code`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  padding: 0.25rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: ${({ theme }) => theme.primary};
  border-radius: 4px;
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
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
  padding-bottom: 0.75rem;
  color: ${({ theme }) => theme.primary};
  font-size: 1.25rem;
`;

const MetadataList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

const MetadataLabel = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
`;

const MetadataValue = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  font-size: 0.875rem;
  font-family: ${({ mono }) => (mono ? 'var(--font-mono)' : 'inherit')};
  text-align: right;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.cardBackground};
  border: none;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px ${({ theme }) => theme.primary}40;
  }
`;

const DownloadButton = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  &:hover:not(:disabled) {
    background-color: #218838;
  }
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

/* ---- Component ---- */

const EvidenceDetailPage = () => {
  const { jobId } = useParams();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: job, isLoading, error } = useQuery(
    ['jobDetails', jobId],
    () => forensicAPI.getJobDetails(jobId),
    { enabled: !!jobId, refetchInterval: 10000 }
  );

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      await forensicAPI.downloadReport(jobId);
    } catch (err) {
      alert("Failed to download report. See console for details.");
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  /* --- Loading State --- */
  if (isLoading)
    return <LoadingSpinner text="Loading forensic evidence details..." />;

  /* --- Error State --- */
  if (error)
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}>
        <FaExclamationTriangle size={50} />
        <h2>Evidence Not Found</h2>
        <p>{error.message}</p>
      </div>
    );

  return (
    <PageContainer>
      {/* Header */}
      <HeaderArea>
        <Title>Evidence Details: Job {jobId}</Title>

        {job?.status === 'completed' && (
          <DownloadButton
            onClick={handleDownloadReport}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download PDF Report'}
          </DownloadButton>
        )}
      </HeaderArea>

      <PageHeader>
        <PageTitle>
          <FaFingerprint /> Evidence Details <JobId>{job.job_id}</JobId>
        </PageTitle>

        <div
          style={{
            color: job.status === 'completed' ? '#10b981' : '#f59e0b',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {job.status}
        </div>
      </PageHeader>

      {/* SHA256 Hash Display */}
      <SHA256Display hash={job.metadata?.sha256_hash} jobId={job.job_id} />

      {/* Metadata */}
      <MetadataGrid>
        <MetadataCard>
          <MetadataHeader>
            <FaFileAlt /> File Information
          </MetadataHeader>
          <MetadataList>
            <MetadataItem>
              <MetadataLabel>Filename</MetadataLabel>
              <MetadataValue mono>{job.metadata?.file_name}</MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Size</MetadataLabel>
              <MetadataValue>
                {(job.metadata?.file_size / 1024 / 1024).toFixed(2)} MB
              </MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>MIME Type</MetadataLabel>
              <MetadataValue mono>{job.metadata?.mime_type}</MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Source</MetadataLabel>
              <MetadataValue>
                {job.source === 'url' ? (
                  <>
                    <FaGlobe /> URL
                  </>
                ) : (
                  <>
                    <FaUpload /> Upload
                  </>
                )}
              </MetadataValue>
            </MetadataItem>
          </MetadataList>
        </MetadataCard>

        <MetadataCard>
          <MetadataHeader>
            <FaHistory /> Timeline
          </MetadataHeader>
          <MetadataList>
            <MetadataItem>
              <MetadataLabel>Acquired</MetadataLabel>
              <MetadataValue>
                {format(new Date(job.created_at), 'yyyy-MM-dd HH:mm:ss')}
              </MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Completed</MetadataLabel>
              <MetadataValue>
                {job.completed_at
                  ? format(new Date(job.completed_at), 'yyyy-MM-dd HH:mm:ss')
                  : 'Processing...'}
              </MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Chain Events</MetadataLabel>
              <MetadataValue>{job.chain_of_custody?.length || 0}</MetadataValue>
            </MetadataItem>
          </MetadataList>
        </MetadataCard>
      </MetadataGrid>

      {/* Action Buttons */}
      <ActionButtons>
        <ActionButton onClick={handleDownloadReport} disabled={job.status !== 'completed'}>
          <FaDownload /> Download Forensic Report
        </ActionButton>

        <VerifyIntegrityButton jobId={job.job_id} />
      </ActionButtons>
    </PageContainer>
  );
};

export default EvidenceDetailPage;
