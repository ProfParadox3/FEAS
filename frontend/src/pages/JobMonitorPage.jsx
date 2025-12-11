import React from 'react';
import styled from 'styled-components';
import { 
  FaDatabase, 
  FaFilter,
  FaSearch,
  FaSync,
  FaHistory,
  FaChartBar,
  FaDownload,
  FaExclamationTriangle 
} from 'react-icons/fa';
import JobMonitorTable from '../components/monitoring/JobMonitorTable';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1rem;
  line-height: 1.6;
  max-width: 800px;
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  color: ${({ theme, color }) => color || theme.primary};
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 0.25rem;
`;

const ControlsSection = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const ControlsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ControlLabel = styled.label`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  font-family: var(--font-mono);
`;

const ControlSelect = styled.select`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const ControlInput = styled.input`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme, variant }) => 
    variant === 'primary' ? theme.primary : 'transparent'};
  color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.cardBackground : theme.text};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'primary' ? theme.primary : theme.cardBorder};
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px ${({ theme }) => theme.primary}20;
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`;

const AlertBanner = styled.div`
  background: ${({ theme }) => theme.warning}20;
  border: 1px solid ${({ theme }) => theme.warning}40;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AlertIcon = styled.div`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.warning};
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.warning};
  margin-bottom: 0.25rem;
`;

const AlertText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
`;

const JobMonitorPage = () => {
  const mockStats = {
    total: 42,
    completed: 28,
    processing: 8,
    pending: 4,
    failed: 2,
    storage: '78%',
    averageTime: '2m 34s'
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FaDatabase />
          Evidence Processing <span>Monitor</span>
        </PageTitle>
        <PageDescription>
          Real-time monitoring of forensic evidence processing jobs. Track status, progress, 
          and access completed evidence with full chain of custody logs.
        </PageDescription>
      </PageHeader>
      
      <StatsBar>
        <StatCard>
          <StatIcon color="#3b82f6">
            <FaDatabase />
          </StatIcon>
          <StatInfo>
            <StatValue>{mockStats.total}</StatValue>
            <StatLabel>Total Jobs</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon color="#10b981">
            <FaSync />
          </StatIcon>
          <StatInfo>
            <StatValue>{mockStats.processing}</StatValue>
            <StatLabel>Processing Now</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon color="#f59e0b">
            <FaHistory />
          </StatIcon>
          <StatInfo>
            <StatValue>{mockStats.averageTime}</StatValue>
            <StatLabel>Avg Processing Time</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon color="#ef4444">
            <FaExclamationTriangle />
          </StatIcon>
          <StatInfo>
            <StatValue>{mockStats.failed}</StatValue>
            <StatLabel>Failed Jobs</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsBar>
      
      <AlertBanner>
        <AlertIcon>
          <FaExclamationTriangle />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>System Maintenance Notice</AlertTitle>
          <AlertText>
            Scheduled maintenance is planned for Sunday, 2:00 AM - 4:00 AM UTC. 
            Evidence processing may be temporarily unavailable during this window.
          </AlertText>
        </AlertContent>
      </AlertBanner>
      
      <ControlsSection>
        <ControlsTitle>
          <FaFilter />
          Filter & Search Controls
        </ControlsTitle>
        
        <ControlsGrid>
          <ControlGroup>
            <ControlLabel>Time Range</ControlLabel>
            <ControlSelect>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </ControlSelect>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Investigator</ControlLabel>
            <ControlSelect>
              <option value="all">All Investigators</option>
              <option value="INV-2023-001">INV-2023-001</option>
              <option value="INV-2023-002">INV-2023-002</option>
              <option value="INV-2023-003">INV-2023-003</option>
            </ControlSelect>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Source Type</ControlLabel>
            <ControlSelect>
              <option value="all">All Sources</option>
              <option value="url">URL Acquisition</option>
              <option value="upload">Local Upload</option>
            </ControlSelect>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Search</ControlLabel>
            <ControlInput 
              type="text" 
              placeholder="Search by Job ID, filename, or hash..."
            />
          </ControlGroup>
        </ControlsGrid>
        
        <ActionButtons>
          <ActionButton variant="primary">
            <FaSync />
            Refresh Now
          </ActionButton>
          
          <ActionButton>
            <FaFilter />
            Apply Filters
          </ActionButton>
          
          <ActionButton>
            <FaDownload />
            Export CSV
          </ActionButton>
          
          <ActionButton>
            <FaChartBar />
            View Analytics
          </ActionButton>
        </ActionButtons>
      </ControlsSection>
      
      <JobMonitorTable />
    </PageContainer>
  );
};

export default JobMonitorPage;