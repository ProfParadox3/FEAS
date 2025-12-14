import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaQuestionCircle, 
  FaUpload, 
  FaLink, 
  FaSearch, 
  FaChartLine,
  FaShieldAlt,
  FaChevronDown,
  FaChevronUp,
  FaLightbulb,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
  padding-bottom: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 1rem;
  
  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.5rem;
  font-size: 1rem;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FAQItem = styled.div`
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FAQQuestion = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.background};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.primary}10;
  }
`;

const QuestionText = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const FAQAnswer = styled.div`
  padding: ${({ isOpen }) => isOpen ? '1rem 1.25rem' : '0 1.25rem'};
  max-height: ${({ isOpen }) => isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.6;
`;

const QuickStartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const QuickStartCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 1.5rem;
  
  h3 {
    color: ${({ theme }) => theme.text};
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.textSecondary};
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

const TipBox = styled.div`
  background: ${({ type, theme }) => 
    type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 
    type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 
    'rgba(59, 130, 246, 0.1)'};
  border: 1px solid ${({ type }) => 
    type === 'warning' ? '#f59e0b' : 
    type === 'success' ? '#10b981' : 
    '#3b82f6'};
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 0.75rem;
  
  svg {
    color: ${({ type }) => 
      type === 'warning' ? '#f59e0b' : 
      type === 'success' ? '#10b981' : 
      '#3b82f6'};
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  span {
    color: ${({ theme }) => theme.text};
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

const StepList = styled.ol`
  padding-left: 1.5rem;
  color: ${({ theme }) => theme.text};
  
  li {
    margin-bottom: 0.75rem;
    line-height: 1.6;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const HelpPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What file types are supported for upload?",
      answer: "FEAS supports a wide range of forensic evidence files including images (JPEG, PNG, HEIC/HEIF), videos (MP4, MOV, AVI), audio files (MP3, WAV), and documents (PDF). The maximum file size is 500MB."
    },
    {
      question: "How does URL acquisition work?",
      answer: "URL acquisition allows you to capture web content from supported platforms like Twitter/X and YouTube. Simply paste the URL, and FEAS will automatically download, hash, and preserve the evidence with full chain of custody documentation."
    },
    {
      question: "What is chain of custody and why is it important?",
      answer: "Chain of custody is a documented record of who handled evidence, when, and what actions were taken. It's crucial for legal proceedings as it proves evidence integrity and hasn't been tampered with. FEAS automatically logs every action taken on evidence."
    },
    {
      question: "How can I verify evidence integrity?",
      answer: "Each piece of evidence is assigned a SHA-256 hash upon acquisition. You can use the 'Verify Integrity' feature on any evidence to check if the current hash matches the original, ensuring no modifications have occurred."
    },
    {
      question: "What happens if my upload fails?",
      answer: "If an upload fails, check your internet connection and ensure the file size doesn't exceed 500MB. Make sure the backend services (API server and Celery worker) are running. Failed jobs can be viewed in the Job Monitor with error details."
    },
    {
      question: "How do I generate a forensic report?",
      answer: "Navigate to the evidence detail page and click 'Generate Report'. This creates a comprehensive PDF document containing all metadata, hash values, chain of custody logs, and evidence details suitable for legal proceedings."
    }
  ];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FaQuestionCircle /> Help <span>Center</span>
        </PageTitle>
        <PageDescription>
          Get help with using FEAS - your forensic evidence acquisition and management system
        </PageDescription>
      </PageHeader>

      <Section>
        <SectionTitle>
          <FaLightbulb /> Quick Start Guide
        </SectionTitle>
        
        <TipBox type="info">
          <FaLightbulb />
          <span>New to FEAS? Follow these steps to get started with evidence acquisition and management.</span>
        </TipBox>
        
        <QuickStartGrid>
          <QuickStartCard>
            <h3><FaUpload /> Upload Evidence</h3>
            <p>Upload local files directly from your device. Supported formats include images, videos, audio, and documents up to 500MB.</p>
          </QuickStartCard>
          
          <QuickStartCard>
            <h3><FaLink /> URL Acquisition</h3>
            <p>Capture web content by entering URLs from supported platforms like Twitter/X and YouTube.</p>
          </QuickStartCard>
          
          <QuickStartCard>
            <h3><FaSearch /> Browse Evidence</h3>
            <p>Search and filter your collected evidence in the Evidence Browser. View details, metadata, and chain of custody.</p>
          </QuickStartCard>
          
          <QuickStartCard>
            <h3><FaChartLine /> Monitor Jobs</h3>
            <p>Track acquisition progress in the Job Monitor. View status, completion time, and any errors.</p>
          </QuickStartCard>
        </QuickStartGrid>
      </Section>

      <Section>
        <SectionTitle>
          <FaShieldAlt /> Evidence Acquisition Steps
        </SectionTitle>
        
        <TipBox type="success">
          <FaCheckCircle />
          <span>All evidence is automatically hashed and logged in the chain of custody.</span>
        </TipBox>
        
        <StepList>
          <li>Navigate to <strong>Acquire Evidence</strong> from the sidebar menu</li>
          <li>Choose your acquisition method: File Upload or URL Acquisition</li>
          <li>Fill in the required information (Investigator ID, Case Number)</li>
          <li>Submit the evidence for processing</li>
          <li>Monitor progress in the Job Monitor page</li>
          <li>View completed evidence in the Evidence Browser</li>
          <li>Generate forensic reports as needed</li>
        </StepList>
      </Section>

      <Section>
        <SectionTitle>
          <FaQuestionCircle /> Frequently Asked Questions
        </SectionTitle>
        
        {faqs.map((faq, index) => (
          <FAQItem key={index}>
            <FAQQuestion onClick={() => toggleFAQ(index)}>
              <QuestionText>{faq.question}</QuestionText>
              {openFAQ === index ? <FaChevronUp /> : <FaChevronDown />}
            </FAQQuestion>
            <FAQAnswer isOpen={openFAQ === index}>
              {faq.answer}
            </FAQAnswer>
          </FAQItem>
        ))}
      </Section>

      <Section>
        <SectionTitle>
          <FaExclamationTriangle /> Troubleshooting
        </SectionTitle>
        
        <TipBox type="warning">
          <FaExclamationTriangle />
          <span>If you encounter "Connection Refused" errors, ensure both the API server and Celery worker are running.</span>
        </TipBox>
        
        <QuickStartGrid>
          <QuickStartCard>
            <h3>Upload Fails</h3>
            <p>Check file size (max 500MB), file type support, and ensure all backend services are running.</p>
          </QuickStartCard>
          
          <QuickStartCard>
            <h3>Jobs Stuck in Pending</h3>
            <p>Verify Celery worker is running. Check Redis connection and restart services if needed.</p>
          </QuickStartCard>
          
          <QuickStartCard>
            <h3>Hash Verification Fails</h3>
            <p>The file may have been modified. Compare timestamps and check chain of custody logs.</p>
          </QuickStartCard>
          
          <QuickStartCard>
            <h3>Report Generation Error</h3>
            <p>Ensure all evidence files exist and metadata is complete. Check server logs for details.</p>
          </QuickStartCard>
        </QuickStartGrid>
      </Section>
    </PageContainer>
  );
};

export default HelpPage;
