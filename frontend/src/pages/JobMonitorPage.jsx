import React from 'react';
import styled from 'styled-components';
import { FaDatabase, FaFilter, FaSearch, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import JobMonitorTable from '../components/monitoring/JobMonitorTable';

const PageContainer = styled.div` max-width: 1400px; margin: 0 auto; `;
const PageHeader = styled.div` margin-bottom: 2rem; `;
const PageTitle = styled.h1` font-size: 2rem; font-weight: 700; color: ${({ theme }) => theme.text}; margin-bottom: 0.5rem; span { color: ${({ theme }) => theme.primary}; } `;
const AlertBanner = styled.div` background: ${({ theme }) => theme.warning}20; border: 1px solid ${({ theme }) => theme.warning}40; border-radius: 8px; padding: 1rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; color: ${({ theme }) => theme.text}; `;

const JobMonitorPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FaDatabase /> Evidence Processing <span>Monitor</span>
        </PageTitle>
        <p style={{ color: '#9ca3af' }}>
          Real-time monitoring of forensic evidence processing jobs. Track status, progress, 
          and access completed evidence with full chain of custody logs.
        </p>
      </PageHeader>
      
      <AlertBanner>
        <FaExclamationTriangle color="#f59e0b" size={24} />
        <div>
          <strong>System Status:</strong> All systems operational. Real-time updates enabled.
        </div>
      </AlertBanner>
      
      <JobMonitorTable />
    </PageContainer>
  );
};

export default JobMonitorPage;
