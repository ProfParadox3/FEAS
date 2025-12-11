import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaGlobe, 
  FaUpload, 
  FaSpinner, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEye,
  FaFilePdf,
  FaFingerprint,
  FaExclamationTriangle,
  FaPauseCircle,
  FaPlayCircle,
  FaFilter,
  FaSync
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { forensicAPI } from '../../services/api';

const Container = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
`;

const MonitorHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.background};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const MonitorStats = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme, color }) => color || theme.primary};
  font-family: var(--font-mono);
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.background};
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    padding: 1rem;
  }
`;

const FilterSelect = styled.select`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme, active }) => 
    active ? theme.primary : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.cardBackground : theme.text};
  border: 1px solid ${({ theme, active }) => 
    active ? theme.primary : theme.cardBorder};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 0.875rem;
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.background};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.primary}10;
  }
  
  ${({ status, theme }) => {
    switch(status) {
      case 'completed':
        return `border-left: 3px solid ${theme.success};`;
      case 'failed':
        return `border-left: 3px solid ${theme.error};`;
      case 'processing':
        return `border-left: 3px solid ${theme.primary};`;
      default:
        return `border-left: 3px solid ${theme.warning};`;
    }
  }}
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  border-bottom: 2px solid ${({ theme }) => theme.cardBorder};
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${({ theme }) => theme.text};
  vertical-align: middle;
`;

const JobId = styled.div`
  font-family: var(--font-mono);
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const SourceCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SourceIcon = styled.div`
  font-size: 1rem;
  color: ${({ source, theme }) => 
    source === 'url' ? theme.primary : theme.secondary};
`;

const SourceText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SourceType = styled.span`
  font-weight: 600;
`;

const Platform = styled.small`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.75rem;
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FileName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const FileSize = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.75rem;
`;

const StatusCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIcon = styled.div`
  font-size: 1rem;
  color: ${({ status, theme }) => {
    switch(status) {
      case 'completed':
        return theme.success;
      case 'failed':
        return theme.error;
      case 'processing':
        return theme.primary;
      default:
        return theme.warning;
    }
  }};
  
  ${({ spinning }) => spinning && `
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}
`;

const StatusText = styled.span`
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: ${({ status, theme }) => {
    switch(status) {
      case 'completed':
        return theme.success;
      case 'failed':
        return theme.error;
      case 'processing':
        return theme.primary;
      default:
        return theme.warning;
    }
  }};
`;

const ProgressBar = styled.div`
  width: 100px;
  height: 6px;
  background: ${({ theme }) => theme.cardBorder};
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.25rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.primary};
  border-radius: 3px;
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const HashCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  color: ${({ theme }) => theme.text};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
  }
  
  ${({ variant, theme }) => {
    switch(variant) {
      case 'view':
        return `&:hover { background: ${theme.primary}20; }`;
      case 'pdf':
        return `&:hover { background: ${theme.error}20; color: ${theme.error}; }`;
      default:
        return '';
    }
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
`;

const LoadingIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-family: var(--font-mono);
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-family: var(--font-mono);
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0.5rem;
`;

const MonitorFooter = styled.div`
  padding: 1rem 2rem;
  border-top: 1px solid ${({ theme }) => theme.cardBorder};
  background: ${({ theme }) => theme.background};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
`;

const RefreshStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const JobMonitorTable = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const queryClient = useQueryClient();
  
  const { data: jobs, isLoading, error } = useQuery(
    ['jobs', filter],
    async () => {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockJobs = [
        {
          id: 'JOB-8A3F2B1C',
          source: 'url',
          platform: 'twitter',
          filename: 'twitter_video.mp4',
          size: 15674321,
          status: 'completed',
          progress: 100,
          hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234',
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3500000),
          investigatorId: 'INV-2023-001'
        },
        {
          id: 'JOB-9B4C3D2E',
          source: 'local_upload',
          filename: 'evidence_image.jpg',
          size: 4567890,
          status: 'processing',
          progress: 65,
          hash: 'b2c3d4e5f67890a123456789012345678901234567890123456789012345',
          createdAt: new Date(Date.now() - 1200000),
          updatedAt: new Date(Date.now() - 60000),
          investigatorId: 'INV-2023-002'
        },
        {
          id: 'JOB-7C2D1E0F',
          source: 'url',
          platform: 'youtube',
          filename: 'youtube_video.mp4',
          size: 25432109,
          status: 'failed',
          progress: 30,
          hash: null,
          createdAt: new Date(Date.now() - 1800000),
          updatedAt: new Date(Date.now() - 1750000),
          investigatorId: 'INV-2023-003',
          error: 'Download failed: Video unavailable'
        },
        {
          id: 'JOB-6D1E0F2G',
          source: 'local_upload',
          filename: 'surveillance_footage.mov',
          size: 98765432,
          status: 'pending',
          progress: 0,
          hash: null,
          createdAt: new Date(Date.now() - 300000),
          updatedAt: new Date(Date.now() - 300000),
          investigatorId: 'INV-2023-004'
        },
        {
          id: 'JOB-5E0F2G3H',
          source: 'url',
          platform: 'twitter',
          filename: 'tweet_screenshot.png',
          size: 1234567,
          status: 'completed',
          progress: 100,
          hash: 'c3d4e5f67890a1b234567890123456789012345678901234567890123456',
          createdAt: new Date(Date.now() - 7200000),
          updatedAt: new Date(Date.now() - 7100000),
          investigatorId: 'INV-2023-001'
        }
      ];
      
      let filtered = mockJobs;
      
      if (filter !== 'all') {
        filtered = filtered.filter(job => job.status === filter);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(job => 
          job.id.toLowerCase().includes(searchLower) ||
          job.filename.toLowerCase().includes(searchLower) ||
          job.investigatorId.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered.sort((a, b) => b.createdAt - a.createdAt);
    },
    {
      refetchInterval: autoRefresh ? 5000 : false,
    }
  );
  
  const handleRefresh = () => {
    queryClient.invalidateQueries('jobs');
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaPauseCircle />;
      case 'processing':
        return <FaSpinner />;
      case 'completed':
        return <FaCheckCircle />;
      case 'failed':
        return <FaTimesCircle />;
      default:
        return <FaExclamationTriangle />;
    }
  };
  
  const getSourceIcon = (source) => {
    return source === 'url' ? <FaGlobe /> : <FaUpload />;
  };
  
  const formatHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}`;
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const stats = {
    total: jobs?.length || 0,
    completed: jobs?.filter(j => j.status === 'completed').length || 0,
    processing: jobs?.filter(j => j.status === 'processing').length || 0,
    pending: jobs?.filter(j => j.status === 'pending').length || 0,
    failed: jobs?.filter(j => j.status === 'failed').length || 0
  };
  
  if (isLoading) {
    return (
      <Container>
        <MonitorHeader>
          <Title>
            <FaSpinner />
            Evidence Processing Monitor
          </Title>
        </MonitorHeader>
        <LoadingContainer>
          <LoadingIcon>
            <FaSpinner />
          </LoadingIcon>
          <LoadingText>
            Loading forensic jobs...
          </LoadingText>
        </LoadingContainer>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <MonitorHeader>
          <Title>
            <FaExclamationTriangle />
            Evidence Processing Monitor
          </Title>
        </MonitorHeader>
        <LoadingContainer>
          <LoadingIcon>
            <FaExclamationTriangle />
          </LoadingIcon>
          <LoadingText>
            Error loading jobs: {error.message}
          </LoadingText>
        </LoadingContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <MonitorHeader>
        <Title>
          <FaFingerprint />
          Evidence Processing <span>Monitor</span>
        </Title>
        
        <MonitorStats>
          <Stat>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Total</StatLabel>
          </Stat>
          <Stat>
            <StatNumber color="#10b981">{stats.completed}</StatNumber>
            <StatLabel>Completed</StatLabel>
          </Stat>
          <Stat>
            <StatNumber color="#3b82f6">{stats.processing}</StatNumber>
            <StatLabel>Processing</StatLabel>
          </Stat>
          <Stat>
            <StatNumber color="#f59e0b">{stats.pending}</StatNumber>
            <StatLabel>Pending</StatLabel>
          </Stat>
          <Stat>
            <StatNumber color="#ef4444">{stats.failed}</StatNumber>
            <StatLabel>Failed</StatLabel>
          </Stat>
        </MonitorStats>
      </MonitorHeader>
      
      <Controls>
        <FilterSelect 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </FilterSelect>
        
        <SearchInput
          type="text"
          placeholder="Search jobs by ID, filename, or investigator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <ControlButton onClick={handleRefresh}>
          <FaSync />
          Refresh
        </ControlButton>
        
        <ControlButton 
          active={autoRefresh}
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? <FaPauseCircle /> : <FaPlayCircle />}
          Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
        </ControlButton>
      </Controls>
      
      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Job ID</TableHeader>
              <TableHeader>Source</TableHeader>
              <TableHeader>File</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>SHA-256</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {jobs?.map((job) => (
              <TableRow key={job.id} status={job.status}>
                <TableCell>
                  <JobId>{job.id}</JobId>
                </TableCell>
                
                <TableCell>
                  <SourceCell>
                    <SourceIcon source={job.source}>
                      {getSourceIcon(job.source)}
                    </SourceIcon>
                    <SourceText>
                      <SourceType>
                        {job.source === 'url' ? 'Web Crawl' : 'Local Upload'}
                      </SourceType>
                      {job.platform && (
                        <Platform>{job.platform}</Platform>
                      )}
                    </SourceText>
                  </SourceCell>
                </TableCell>
                
                <TableCell>
                  <FileInfo>
                    <FileName>{job.filename}</FileName>
                    <FileSize>{formatFileSize(job.size)}</FileSize>
                  </FileInfo>
                </TableCell>
                
                <TableCell>
                  <StatusCell>
                    <StatusIcon status={job.status} spinning={job.status === 'processing'}>
                      {getStatusIcon(job.status)}
                    </StatusIcon>
                    <StatusText status={job.status}>
                      {job.status}
                    </StatusText>
                  </StatusCell>
                  {job.status === 'processing' && (
                    <ProgressBar>
                      <ProgressFill progress={job.progress} />
                    </ProgressBar>
                  )}
                </TableCell>
                
                <TableCell>
                  <HashCell>
                    <FaFingerprint />
                    {formatHash(job.hash)}
                  </HashCell>
                </TableCell>
                
                <TableCell>
                  {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                </TableCell>
                
                <TableCell>
                  <ActionsCell>
                    <ActionButton 
                      variant="view"
                      as={Link}
                      to={`/evidence/${job.id}`}
                      title="View Details"
                    >
                      <FaEye />
                    </ActionButton>
                    
                    {job.status === 'completed' && (
                      <ActionButton 
                        variant="pdf"
                        title="Download PDF Report"
                        onClick={() => {
                          // PDF download logic
                          window.open(`/api/v1/jobs/${job.id}/pdf`, '_blank');
                        }}
                      >
                        <FaFilePdf />
                      </ActionButton>
                    )}
                  </ActionsCell>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        
        {jobs?.length === 0 && (
          <EmptyState>
            <EmptyIcon>
              <FaUpload />
            </EmptyIcon>
            <EmptyText>No evidence jobs found</EmptyText>
            <EmptyText>
              {search || filter !== 'all' 
                ? 'Try changing your search or filter criteria' 
                : 'Submit your first evidence acquisition to get started'}
            </EmptyText>
          </EmptyState>
        )}
      </TableContainer>
      
      <MonitorFooter>
        <div>
          Showing {jobs?.length || 0} jobs • Last updated: {new Date().toLocaleTimeString()}
        </div>
        
        <RefreshStatus>
          {autoRefresh ? (
            <>
              <FaSync style={{ animation: 'spin 2s linear infinite' }} />
              Auto-refreshing every 5 seconds
            </>
          ) : (
            'Auto-refresh disabled'
          )}
        </RefreshStatus>
      </MonitorFooter>
    </Container>
  );
};

export default JobMonitorTable;