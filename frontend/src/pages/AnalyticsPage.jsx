import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { 
  FaChartLine, 
  FaDatabase, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaClock 
} from 'react-icons/fa';
import { forensicAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
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
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ color, theme }) => color || theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
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

const ChartSection = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1.5rem;
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background};
  border: 2px dashed ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1rem;
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const PeriodButton = styled.button`
  background: ${({ active, theme }) => active ? theme.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.text};
  border: 1px solid ${({ active, theme }) => active ? theme.primary : theme.cardBorder};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const MetricsList = styled.div`
  display: grid;
  gap: 1rem;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`;

const MetricValue = styled.span`
  color: ${({ theme }) => theme.primary};
  font-weight: 700;
  font-family: var(--font-mono);
`;

const AnalyticsPage = () => {
  const [period, setPeriod] = React.useState('7d');
  
  const { data: stats, isLoading } = useQuery(
    ['analytics', period], 
    () => forensicAPI.getAnalytics(period),
    {
      refetchInterval: 30000,
      placeholderData: { total_jobs: 0, completed_jobs: 0, pending_jobs: 0, failed_jobs: 0 }
    }
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading analytics..." />;
  }

  const totalJobs = stats?.total_jobs || 0;
  const completedJobs = stats?.completed_jobs || 0;
  const pendingJobs = stats?.pending_jobs || 0;
  const failedJobs = stats?.failed_jobs || 0;
  
  const successRate = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : 0;
  const failureRate = totalJobs > 0 ? ((failedJobs / totalJobs) * 100).toFixed(1) : 0;

  return (
    <Container>
      <Header>
        <Title>
          <FaChartLine />
          Analytics Dashboard
        </Title>
        <Subtitle>Real-time forensic evidence processing metrics</Subtitle>
      </Header>

      <PeriodSelector>
        <PeriodButton active={period === '24h'} onClick={() => setPeriod('24h')}>
          Last 24 Hours
        </PeriodButton>
        <PeriodButton active={period === '7d'} onClick={() => setPeriod('7d')}>
          Last 7 Days
        </PeriodButton>
        <PeriodButton active={period === '30d'} onClick={() => setPeriod('30d')}>
          Last 30 Days
        </PeriodButton>
        <PeriodButton active={period === '90d'} onClick={() => setPeriod('90d')}>
          Last 90 Days
        </PeriodButton>
      </PeriodSelector>

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <FaDatabase />
          </StatIcon>
          <StatContent>
            <StatValue>{totalJobs}</StatValue>
            <StatLabel>Total Jobs</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <FaCheckCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{completedJobs}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#3b82f6">
            <FaClock />
          </StatIcon>
          <StatContent>
            <StatValue>{pendingJobs}</StatValue>
            <StatLabel>Processing</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#ef4444">
            <FaExclamationTriangle />
          </StatIcon>
          <StatContent>
            <StatValue>{failedJobs}</StatValue>
            <StatLabel>Failed</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <ChartSection>
        <SectionTitle>Job Performance Metrics</SectionTitle>
        <MetricsList>
          <MetricRow>
            <MetricLabel>Success Rate</MetricLabel>
            <MetricValue>{successRate}%</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Failure Rate</MetricLabel>
            <MetricValue>{failureRate}%</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Average Processing Time</MetricLabel>
            <MetricValue>-</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Total Evidence Collected</MetricLabel>
            <MetricValue>{completedJobs}</MetricValue>
          </MetricRow>
        </MetricsList>
      </ChartSection>

      <ChartSection>
        <SectionTitle>Job Timeline</SectionTitle>
        <ChartPlaceholder>
          Chart visualization coming soon - Install a charting library (e.g., recharts) for visualization
        </ChartPlaceholder>
      </ChartSection>
    </Container>
  );
};

export default AnalyticsPage;
