import React from 'react';
import styled from 'styled-components';
import { 
  FaFingerprint, 
  FaDatabase, 
  FaChartLine,
  FaShieldAlt,
  FaHistory,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaServer
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { forensicAPI } from '../services/api';

const DashboardContainer = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ theme, color }) => color || theme.primary};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.25rem;
`;

const StatTrend = styled.div`
  font-size: 0.75rem;
  color: ${({ theme, positive }) => 
    positive ? theme.success : theme.error};
  font-family: var(--font-mono);
  margin-top: 0.25rem;
`;

const Section = styled.section`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionCard = styled(Link)`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
`;

const ActionIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
`;

const ActionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.5;
`;

const SystemStatus = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'online':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'offline':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  }};
  animation: ${({ status }) => 
    status === 'online' ? 'pulse 2s ease-in-out infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const StatusInfo = styled.div`
  flex: 1;
`;

const StatusName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  font-size: 0.875rem;
`;

const StatusDescription = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 3rem;
`;

const Spinner = styled.div`
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.cardBorder};
  border-top-color: ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery(
    'dashboardStats',
    async () => {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        totalJobs: 42,
        completedJobs: 28,
        pendingJobs: 8,
        failedJobs: 6,
        storageUsed: 78,
        chainOfCustodyEntries: 156,
        averageProcessingTime: '2m 34s',
        systemUptime: '99.8%'
      };
    }
  );

  const quickActions = [
    {
      to: '/submit',
      icon: <FaFingerprint />,
      title: 'Acquire Evidence',
      description: 'Submit new evidence via URL or file upload'
    },
    {
      to: '/monitor',
      icon: <FaDatabase />,
      title: 'Job Monitor',
      description: 'Track evidence processing jobs in real-time'
    },
    {
      to: '/evidence',
      icon: <FaShieldAlt />,
      title: 'Evidence Browser',
      description: 'Browse and manage acquired evidence'
    },
    {
      to: '/analytics',
      icon: <FaChartLine />,
      title: 'Analytics',
      description: 'View processing statistics and trends'
    }
  ];

  const systemStatus = [
    { name: 'API Server', status: 'online', description: 'FastAPI Backend' },
    { name: 'Database', status: 'online', description: 'PostgreSQL' },
    { name: 'Storage', status: 'warning', description: '78% capacity' },
    { name: 'Processing Queue', status: 'online', description: 'Celery Workers' },
    { name: 'Chain of Custody', status: 'online', description: 'Append-only Log' },
    { name: 'Security Layer', status: 'online', description: 'Active & Encrypted' }
  ];

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
      </LoadingContainer>
    );
  }

  return (
    <>
      <DashboardContainer>
        <StatCard>
          <StatIcon>
            <FaDatabase />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.totalJobs || 0}</StatValue>
            <StatLabel>Total Evidence Jobs</StatLabel>
            <StatTrend positive>+12% this week</StatTrend>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <FaCheckCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.completedJobs || 0}</StatValue>
            <StatLabel>Completed</StatLabel>
            <StatTrend positive>94% success rate</StatTrend>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#3b82f6">
            <FaClock />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.pendingJobs || 0}</StatValue>
            <StatLabel>Processing</StatLabel>
            <StatTrend positive>Avg: {stats?.averageProcessingTime}</StatTrend>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#ef4444">
            <FaExclamationTriangle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.failedJobs || 0}</StatValue>
            <StatLabel>Failed</StatLabel>
            <StatTrend positive={false}>-3% this week</StatTrend>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#8b5cf6">
            <FaHistory />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.chainOfCustodyEntries || 0}</StatValue>
            <StatLabel>Custody Entries</StatLabel>
            <StatTrend positive>Immutable log</StatTrend>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <FaServer />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.storageUsed || 0}%</StatValue>
            <StatLabel>Storage Used</StatLabel>
            <StatTrend positive={false}>15GB available</StatTrend>
          </StatContent>
        </StatCard>
      </DashboardContainer>

      <Section>
        <SectionTitle>
          <FaFingerprint />
          Quick Actions
        </SectionTitle>
        
        <QuickActions>
          {quickActions.map((action, index) => (
            <ActionCard key={index} to={action.to}>
              <ActionIcon>
                {action.icon}
              </ActionIcon>
              <ActionTitle>
                {action.title}
              </ActionTitle>
              <ActionDescription>
                {action.description}
              </ActionDescription>
            </ActionCard>
          ))}
        </QuickActions>
      </Section>

      <SystemStatus>
        <SectionTitle>
          <FaServer />
          System Status
        </SectionTitle>
        
        <StatusGrid>
          {systemStatus.map((status, index) => (
            <StatusItem key={index}>
              <StatusIndicator status={status.status} />
              <StatusInfo>
                <StatusName>{status.name}</StatusName>
                <StatusDescription>{status.description}</StatusDescription>
              </StatusInfo>
            </StatusItem>
          ))}
        </StatusGrid>
      </SystemStatus>
    </>
  );
};

export default Dashboard;