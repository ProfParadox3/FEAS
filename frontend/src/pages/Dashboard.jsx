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
  FaServer,
  FaLock,
  FaUserShield,
  FaFileAlt,
  FaCloudDownloadAlt,
  FaUpload,
  FaGlobe
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { forensicAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardContainer = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  @media (max-width: 768px) { grid-template-columns: 1fr; }
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
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1rem;
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
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ accentColor, theme }) => accentColor || theme.primary};
  }
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ theme, color }) => color || theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${({ color }) => color ? `${color}15` : 'transparent'};
`;

const StatContent = styled.div`flex: 1;`;

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
  color: ${({ positive }) => positive ? '#10b981' : '#ef4444'};
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Section = styled.section`margin-top: 2rem;`;

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

const SystemStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatusCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ status }) => 
    status === 'online' ? '#10b981' : 
    status === 'warning' ? '#f59e0b' : '#ef4444'};
  box-shadow: 0 0 10px ${({ status }) => 
    status === 'online' ? '#10b98150' : 
    status === 'warning' ? '#f59e0b50' : '#ef444450'};
`;

const StatusContent = styled.div`flex: 1;`;

const StatusTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const StatusSubtitle = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  font-size: 1.75rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.5;
`;

const SuccessRateBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  margin-top: 1rem;
  overflow: hidden;
`;

const SuccessRateFill = styled.div`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const Dashboard = () => {
  // Use real API call for analytics
  const { data: stats, isLoading } = useQuery('analytics', () => forensicAPI.getAnalytics('7d'), {
    refetchInterval: 30000,
    onError: () => {
      // Fallback/Empty state if API fails
      return { total_jobs: 0, completed_jobs: 0, pending_jobs: 0, failed_jobs: 0 };
    }
  });

  if (isLoading) return <LoadingSpinner text="Loading system analytics..." />;

  const totalJobs = stats?.total_jobs || 0;
  const completedJobs = stats?.completed_jobs || 0;
  const pendingJobs = stats?.pending_jobs || 0;
  const failedJobs = stats?.failed_jobs || 0;
  const successRate = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : 0;

  const quickActions = [
    { to: '/submit', icon: <FaFingerprint />, title: 'Acquire Evidence', description: 'Submit new evidence via URL or file upload from social media platforms' },
    { to: '/monitor', icon: <FaDatabase />, title: 'Job Monitor', description: 'Track evidence processing jobs in real-time with detailed logs' },
    { to: '/evidence', icon: <FaShieldAlt />, title: 'Evidence Browser', description: 'Browse, manage and verify acquired digital evidence' },
    { to: '/analytics', icon: <FaChartLine />, title: 'Analytics', description: 'View detailed processing metrics and performance stats' },
  ];

  const systemStatus = [
    { title: 'API Server', status: 'online', subtitle: 'Operational' },
    { title: 'Database', status: 'online', subtitle: 'Connected' },
    { title: 'Storage', status: 'online', subtitle: 'Available' },
    { title: 'Worker Queue', status: 'online', subtitle: 'Processing' },
  ];

  const features = [
    { icon: <FaLock />, title: 'SHA-256 Hashing', description: 'Cryptographic fingerprinting for all evidence files ensuring tamper-proof integrity verification.' },
    { icon: <FaHistory />, title: 'Chain of Custody', description: 'Immutable audit trail logging every action from acquisition to archive.' },
    { icon: <FaGlobe />, title: 'Multi-Platform Support', description: 'Acquire evidence from Twitter/X, YouTube, Facebook, and Instagram.' },
    { icon: <FaFileAlt />, title: 'Professional Reports', description: 'Generate court-ready PDF reports with complete evidence documentation.' },
  ];

  return (
    <>
      <PageHeader>
        <PageTitle>
          <FaUserShield />
          Forensic Dashboard
        </PageTitle>
        <PageSubtitle>
          Digital Evidence Acquisition System - Monitor and manage your forensic operations
        </PageSubtitle>
      </PageHeader>

      {/* Statistics Overview */}
      <DashboardContainer>
        <StatCard accentColor="#3b82f6">
          <StatIcon color="#3b82f6"><FaDatabase /></StatIcon>
          <StatContent>
            <StatValue>{totalJobs}</StatValue>
            <StatLabel>Total Evidence Jobs</StatLabel>
            <StatTrend positive>Last 7 days</StatTrend>
          </StatContent>
        </StatCard>

        <StatCard accentColor="#10b981">
          <StatIcon color="#10b981"><FaCheckCircle /></StatIcon>
          <StatContent>
            <StatValue>{completedJobs}</StatValue>
            <StatLabel>Completed Successfully</StatLabel>
            <StatTrend positive>{successRate}% success rate</StatTrend>
          </StatContent>
        </StatCard>

        <StatCard accentColor="#f59e0b">
          <StatIcon color="#f59e0b"><FaClock /></StatIcon>
          <StatContent>
            <StatValue>{pendingJobs}</StatValue>
            <StatLabel>Currently Processing</StatLabel>
            <StatTrend positive>Active jobs</StatTrend>
          </StatContent>
        </StatCard>

        <StatCard accentColor="#ef4444">
          <StatIcon color="#ef4444"><FaExclamationTriangle /></StatIcon>
          <StatContent>
            <StatValue>{failedJobs}</StatValue>
            <StatLabel>Failed Jobs</StatLabel>
            <StatTrend positive={failedJobs === 0}>Requires attention</StatTrend>
          </StatContent>
        </StatCard>
      </DashboardContainer>

      {/* Success Rate Visual */}
      <Section>
        <SectionTitle><FaChartLine /> Processing Success Rate</SectionTitle>
        <StatCard accentColor="#10b981" style={{ padding: '2rem' }}>
          <StatContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <StatLabel>Overall Success Rate</StatLabel>
              <StatValue style={{ fontSize: '1.5rem' }}>{successRate}%</StatValue>
            </div>
            <SuccessRateBar>
              <SuccessRateFill percentage={successRate} />
            </SuccessRateBar>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <StatLabel>{completedJobs} successful</StatLabel>
              <StatLabel>{failedJobs} failed</StatLabel>
            </div>
          </StatContent>
        </StatCard>
      </Section>

      {/* System Status */}
      <Section>
        <SectionTitle><FaServer /> System Status</SectionTitle>
        <SystemStatusGrid>
          {systemStatus.map((status, index) => (
            <StatusCard key={index}>
              <StatusIndicator status={status.status} />
              <StatusContent>
                <StatusTitle>{status.title}</StatusTitle>
                <StatusSubtitle>{status.subtitle}</StatusSubtitle>
              </StatusContent>
            </StatusCard>
          ))}
        </SystemStatusGrid>
      </Section>

      {/* Quick Actions */}
      <Section>
        <SectionTitle><FaFingerprint /> Quick Actions</SectionTitle>
        <QuickActions>
          {quickActions.map((action, index) => (
            <ActionCard key={index} to={action.to}>
              <ActionIcon>{action.icon}</ActionIcon>
              <ActionTitle>{action.title}</ActionTitle>
              <ActionDescription>{action.description}</ActionDescription>
            </ActionCard>
          ))}
        </QuickActions>
      </Section>

      {/* Features Overview */}
      <Section>
        <SectionTitle><FaShieldAlt /> Forensic Capabilities</SectionTitle>
        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </Section>
    </>
  );
};

export default Dashboard;
