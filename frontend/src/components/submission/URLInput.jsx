import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaGlobe, 
  FaTwitter, 
  FaYoutube, 
  FaLink,
  FaSpinner,
  FaShieldAlt 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { forensicAPI } from '../../services/api';

const Container = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
  
  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Hint = styled.span`
  font-size: 0.75rem;
  font-weight: 400;
  color: ${({ theme }) => theme.textSecondary};
  margin-left: auto;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const Textarea = styled.textarea`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const URLInputWrapper = styled.div`
  position: relative;
`;

const PlatformIndicator = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: ${({ platform, theme }) => 
    platform === 'twitter' ? '#1DA1F2' : 
    platform === 'youtube' ? '#FF0000' : theme.primary}20;
  border: 1px solid ${({ platform, theme }) => 
    platform === 'twitter' ? '#1DA1F2' : 
    platform === 'youtube' ? '#FF0000' : theme.primary}40;
  border-radius: 4px;
  color: ${({ platform, theme }) => 
    platform === 'twitter' ? '#1DA1F2' : 
    platform === 'youtube' ? '#FF0000' : theme.primary};
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.error};
  font-size: 0.875rem;
  margin-top: 0.25rem;
  padding: 0.5rem;
  background: ${({ theme }) => theme.error}10;
  border: 1px solid ${({ theme }) => theme.error}20;
  border-radius: 4px;
  font-family: var(--font-mono);
`;

const FormActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.cardBackground};
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px ${({ theme }) => theme.primary}40;
  }
`;

const SupportedPlatforms = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  small {
    color: ${({ theme }) => theme.textSecondary};
    font-size: 0.75rem;
  }
`;

const PlatformTags = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PlatformTag = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: ${({ platform, theme }) => 
    platform === 'twitter' ? '#1DA1F2' : '#FF0000'}20;
  border: 1px solid ${({ platform, theme }) => 
    platform === 'twitter' ? '#1DA1F2' : '#FF0000'}40;
  border-radius: 4px;
  color: ${({ platform, theme }) => 
    platform === 'twitter' ? '#1DA1F2' : '#FF0000'};
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
`;

const Spinner = styled.div`
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const SecurityNotice = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.success}10;
  border: 1px solid ${({ theme }) => theme.success}20;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: ${({ theme }) => theme.success};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const URLInput = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [investigatorId, setInvestigatorId] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState(null);

  const detectPlatform = (url) => {
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    return 'web';
  };

  const validateURL = (url) => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      const allowedDomains = ['twitter.com', 'x.com', 'youtube.com', 'youtu.be'];
      if (!allowedDomains.some(d => domain.includes(d))) {
        return 'Only Twitter/X and YouTube URLs are supported';
      }
      
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleURLChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    
    if (value) {
      const platform = detectPlatform(value);
      setDetectedPlatform(platform);
      
      const validationError = validateURL(value);
      if (validationError) {
        setError(validationError);
      } else {
        setError('');
      }
    } else {
      setDetectedPlatform(null);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!investigatorId.trim()) {
      setError('Investigator ID is required');
      return;
    }
    
    const validationError = validateURL(url);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    
    try {
      const response = await forensicAPI.submitURLJob({
        url,
        investigator_id: investigatorId,
        case_number: caseNumber || undefined,
        notes: notes || undefined
      });
      
      toast.success('Evidence acquisition job submitted successfully!');
      onSubmit(response);
      
      // Reset form
      setUrl('');
      setCaseNumber('');
      setNotes('');
      setDetectedPlatform(null);
    } catch (err) {
      toast.error(`Submission failed: ${err.message}`);
      setError(err.message);
    }
  };

  const getPlatformIcon = () => {
    switch (detectedPlatform) {
      case 'twitter':
        return <FaTwitter />;
      case 'youtube':
        return <FaYoutube />;
      default:
        return <FaGlobe />;
    }
  };

  const getPlatformName = () => {
    switch (detectedPlatform) {
      case 'twitter':
        return 'Twitter/X';
      case 'youtube':
        return 'YouTube';
      default:
        return 'Web';
    }
  };

  return (
    <Container>
      <Header>
        <Title>URL <span>Acquisition</span></Title>
        <Subtitle>Enter URL from supported social media platforms for forensic acquisition</Subtitle>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label>
              <FaShieldAlt /> Investigator ID
              <Hint>Your unique identifier</Hint>
            </Label>
            <Input
              type="text"
              value={investigatorId}
              onChange={(e) => setInvestigatorId(e.target.value)}
              placeholder="e.g., INV-2023-001"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>
              <FaShieldAlt /> Case Number
              <Hint>Optional case reference</Hint>
            </Label>
            <Input
              type="text"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="e.g., CASE-2023-456"
            />
          </FormGroup>
        </FormRow>
        
        <FormGroup>
          <Label>
            <FaLink /> Evidence URL
            <Hint>Supported: Twitter/X, YouTube</Hint>
          </Label>
          <URLInputWrapper>
            <Input
              type="url"
              value={url}
              onChange={handleURLChange}
              placeholder="https://twitter.com/user/status/1234567890"
              required
            />
            {detectedPlatform && (
              <PlatformIndicator platform={detectedPlatform}>
                {getPlatformIcon()}
                {getPlatformName()}
              </PlatformIndicator>
            )}
          </URLInputWrapper>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any relevant notes about this evidence acquisition..."
          />
        </FormGroup>
        
        <FormActions>
          <SubmitButton 
            type="submit" 
            disabled={isLoading || !url || !investigatorId || !!error}
          >
            {isLoading ? (
              <>
                <Spinner />
                Acquiring Evidence...
              </>
            ) : (
              'Acquire Evidence'
            )}
          </SubmitButton>
          
          <SupportedPlatforms>
            <small>Supported Platforms:</small>
            <PlatformTags>
              <PlatformTag platform="twitter">
                <FaTwitter /> Twitter/X
              </PlatformTag>
              <PlatformTag platform="youtube">
                <FaYoutube /> YouTube
              </PlatformTag>
            </PlatformTags>
          </SupportedPlatforms>
        </FormActions>
        
        <SecurityNotice>
          <FaShieldAlt />
          <span>
            All acquisitions are logged in the chain of custody. 
            SHA-256 hashing and metadata extraction are performed server-side.
          </span>
        </SecurityNotice>
      </Form>
    </Container>
  );
};

export default URLInput;