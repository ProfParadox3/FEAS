import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaGlobe, 
  FaUpload, 
  FaShieldAlt,
  FaCheckCircle 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import URLInput from './URLInput';
import FileUpload from './FileUpload';

const Container = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
  background: ${({ theme }) => theme.background};
`;

const Tab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: transparent;
  border: none;
  color: ${({ active, theme }) => 
    active ? theme.primary : theme.textSecondary};
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary}10;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ active, theme }) => 
      active ? theme.primary : 'transparent'};
    transition: all 0.2s ease;
  }
`;

const TabContent = styled.div`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: ${({ theme }) => theme.success}10;
  border: 1px solid ${({ theme }) => theme.success}20;
  border-radius: 8px;
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.success};
  margin-bottom: 1.5rem;
`;

const SuccessTitle = styled.h3`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 2rem;
  max-width: 500px;
`;

const JobDetails = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  font-family: var(--font-mono);
`;

const JobDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
`;

const DetailValue = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  font-size: 0.875rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MonitorButton = styled(ActionButton)`
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.cardBackground};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px ${({ theme }) => theme.primary}40;
  }
`;

const NewSubmissionButton = styled(ActionButton)`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  color: ${({ theme }) => theme.text};
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`;

const tabs = [
  { id: 'url', label: 'URL Acquisition', icon: <FaGlobe /> },
  { id: 'upload', label: 'Local Upload', icon: <FaUpload /> },
];

const SubmissionTabs = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [isLoading, setIsLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [jobData, setJobData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (submissionData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockJobData = {
        id: `JOB-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        type: activeTab === 'url' ? 'URL Acquisition' : 'Local Upload',
        status: 'processing'
      };
      
      setJobData(mockJobData);
      setSubmissionSuccess(true);
      
      toast.success('Evidence submission successful! Processing has started.');
      
    } catch (error) {
      toast.error(`Submission failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSubmission = () => {
    setSubmissionSuccess(false);
    setJobData(null);
  };

  const handleMonitor = () => {
    navigate('/monitor');
  };

  return (
    <Container>
      {!submissionSuccess ? (
        <>
          <TabsHeader>
            {tabs.map(tab => (
              <Tab
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </Tab>
            ))}
          </TabsHeader>
          
          <TabContent>
            {activeTab === 'url' ? (
              <URLInput onSubmit={handleSubmit} isLoading={isLoading} />
            ) : (
              <FileUpload onSubmit={handleSubmit} isLoading={isLoading} />
            )}
          </TabContent>
        </>
      ) : (
        <TabContent>
          <SuccessMessage>
            <SuccessIcon>
              <FaCheckCircle />
            </SuccessIcon>
            <SuccessTitle>Evidence Submitted Successfully</SuccessTitle>
            <SuccessText>
              Your evidence has been submitted for forensic processing.
              The chain of custody has been initialized and processing is now underway.
            </SuccessText>
            
            <JobDetails>
              <JobDetail>
                <DetailLabel>Job ID:</DetailLabel>
                <DetailValue>{jobData?.id}</DetailValue>
              </JobDetail>
              <JobDetail>
                <DetailLabel>Submission Type:</DetailLabel>
                <DetailValue>{jobData?.type}</DetailValue>
              </JobDetail>
              <JobDetail>
                <DetailLabel>Status:</DetailLabel>
                <DetailValue style={{ color: '#3b82f6' }}>
                  IN PROCESSING
                </DetailValue>
              </JobDetail>
              <JobDetail>
                <DetailLabel>Timestamp:</DetailLabel>
                <DetailValue>
                  {new Date(jobData?.timestamp).toLocaleString()}
                </DetailValue>
              </JobDetail>
            </JobDetails>
            
            <ActionButtons>
              <MonitorButton onClick={handleMonitor}>
                <FaShieldAlt />
                View Job Monitor
              </MonitorButton>
              <NewSubmissionButton onClick={handleNewSubmission}>
                Submit New Evidence
              </NewSubmissionButton>
            </ActionButtons>
          </SuccessMessage>
        </TabContent>
      )}
    </Container>
  );
};

export default SubmissionTabs;