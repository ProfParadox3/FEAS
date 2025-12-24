import React from 'react';
import styled from 'styled-components';
import { 
  FaFingerprint, 
  FaShieldAlt,
  FaHistory,
  FaLock 
} from 'react-icons/fa';
import SubmissionTabs from '../components/submission/SubmissionTabs';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
  line-height: 1.5;
`;

const SecurityNotice = styled.div`
  background: ${({ theme }) => theme.success}10;
  border: 1px solid ${({ theme }) => theme.success}20;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const SecurityIcon = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.success};
`;

const SecurityContent = styled.div`
  flex: 1;
`;

const SecurityTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.success};
  margin-bottom: 0.5rem;
`;

const SecurityText = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 0.875rem;
  line-height: 1.6;
`;

const SubmissionPage = () => {
  const features = [
    {
      icon: <FaFingerprint />,
      title: 'Digital Fingerprinting',
      description: 'Automated SHA-256 hashing for every piece of evidence, ensuring unique digital fingerprints and integrity verification.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Chain of Custody',
      description: 'Immutable append-only logging of every action, maintaining a secure audit trail from acquisition to archive.'
    },
    {
      icon: <FaHistory />,
      title: 'Metadata Preservation',
      description: 'Comprehensive extraction and preservation of EXIF, platform, and media metadata for forensic analysis.'
    },
    {
      icon: <FaLock />,
      title: 'Secure Processing',
      description: 'All forensic analysis performed server-side with encrypted storage and transmission protocols.'
    }
  ];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FaFingerprint />
          Evidence <span>Acquisition</span>
        </PageTitle>
        <PageSubtitle>
          Submit evidence for forensic processing through URL acquisition or local file upload.
          All submissions are automatically processed, hashed, and logged in the chain of custody.
        </PageSubtitle>
      </PageHeader>
      
      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureIcon>
              {feature.icon}
            </FeatureIcon>
            <FeatureTitle>
              {feature.title}
            </FeatureTitle>
            <FeatureDescription>
              {feature.description}
            </FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesGrid>
      
      <SubmissionTabs />
      
      <SecurityNotice>
        <SecurityIcon>
          <FaLock />
        </SecurityIcon>
        <SecurityContent>
          <SecurityTitle>Security & Compliance</SecurityTitle>
          <SecurityText>
            All evidence processing follows strict security protocols. Files are encrypted at rest and in transit. 
            Chain of custody logs are immutable and timestamped with UTC ISO8601 format. 
            Access is restricted to authorized investigators only.
          </SecurityText>
        </SecurityContent>
      </SecurityNotice>
    </PageContainer>
  );
};

export default SubmissionPage;