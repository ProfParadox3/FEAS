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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const queryClient = useQueryClient();
  
  const { data: jobs, isLoading, error } = useQuery(
    ['jobs'],
    () => forensicAPI.getAllJobs(), // Real API call
    {
      refetchInterval: autoRefresh ? 5000 : false,
    }
  );
  
  const handleRefresh = () => {
    queryClient.invalidateQueries('jobs');
  };

  // Helper functions for display
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaPauseCircle />;
      case 'processing': return <FaSpinner className="spin" />; // Ensure CSS class exists or use styled prop
      case 'completed': return <FaCheckCircle />;
      case 'failed': return <FaTimesCircle />;
      default: return <FaExclamationTriangle />;
    }
  };

  const filteredJobs = jobs?.filter(job => filter === 'all' || job.status === filter) || [];

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}><FaSpinner className="spin" size={30} /> Loading jobs...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444' }}>Error loading jobs: {error.message}</div>;

  return (
    <Container>
      <MonitorHeader>
        <Title>Evidence Processing <span>Monitor</span></Title>
      </MonitorHeader>
      
      <Controls>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ background: '#111827', border: '1px solid #374151', color: '#fff', padding: '0.5rem', borderRadius: '4px' }}
        >
          <option value="all">All Status</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <ControlButton onClick={handleRefresh}><FaSync /> Refresh</ControlButton>
        <ControlButton onClick={() => setAutoRefresh(!autoRefresh)}>
          {autoRefresh ? <FaPauseCircle /> : <FaPlayCircle />} {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
        </ControlButton>
      </Controls>

      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Job ID</TableHeader>
              <TableHeader>Source</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Progress</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {filteredJobs.map((job) => (
              <TableRow key={job.job_id}>
                <TableCell style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{job.job_id.substring(0, 8)}...</TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {job.source === 'url' ? <FaGlobe /> : <FaUpload />}
                    {job.source === 'url' ? 'URL' : 'Upload'}
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusIcon status={job.status}>{getStatusIcon(job.status)}</StatusIcon>
                    <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>{job.status}</span>
                  </div>
                </TableCell>
                <TableCell>{Math.round(job.progress)}%</TableCell>
                <TableCell>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ActionButton as={Link} to={`/evidence/${job.job_id}`} title="View Details"><FaEye /></ActionButton>
                    {job.status === 'completed' && (
                      <ActionButton onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'}/jobs/${job.job_id}/pdf`, '_blank')} title="PDF Report"><FaFilePdf /></ActionButton>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default JobMonitorTable;
