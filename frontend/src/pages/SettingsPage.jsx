import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaCog, 
  FaMoon, 
  FaServer, 
  FaShieldAlt, 
  FaSave,
  FaRedo,
  FaLock,
  FaKey,
  FaUserShield,
  FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import ThemeSwitcher from '../components/common/ThemeSwitcher';

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

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
`;

const Tab = styled.button`
  background: transparent;
  border: none;
  color: ${({ active, theme }) => active ? theme.primary : theme.textSecondary};
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid ${({ active, theme }) => active ? theme.primary : 'transparent'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const SettingsSection = styled.div`
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  display: none;
`;

const SwitchSlider = styled.div`
  width: 48px;
  height: 24px;
  background: ${({ theme, checked }) => 
    checked ? theme.primary : theme.cardBorder};
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ checked }) => checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
`;

const Button = styled.button`
  background: ${({ theme, variant }) => variant === 'secondary' ? 'transparent' : theme.primary};
  color: ${({ theme, variant }) => variant === 'secondary' ? theme.text : theme.cardBackground};
  border: ${({ theme, variant }) => variant === 'secondary' ? `1px solid ${theme.cardBorder}` : 'none'};
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.primary}40;
  }
`;

const SecurityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SecurityLabel = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`;

const SecurityDesc = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
`;

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ status }) => status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${({ status }) => status === 'active' ? '#10b981' : '#ef4444'};
`;

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [retentionDays, setRetentionDays] = useState(30);
  const [apiUrl, setApiUrl] = useState(process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1');
  const user = useAuthStore((state) => state.user);
  
  // Memoize login time to prevent re-rendering on every render
  const [loginTime] = useState(() => new Date().toLocaleString());

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('feas_settings', JSON.stringify({
      autoRefresh,
      retentionDays,
      apiUrl
    }));
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setAutoRefresh(true);
    setRetentionDays(30);
    setApiUrl('http://localhost:8000/api/v1');
    toast.info('Settings reset to defaults');
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FaCog /> System <span>Settings</span>
        </PageTitle>
      </PageHeader>

      <TabsContainer>
        <Tab active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
          <FaCog /> General
        </Tab>
        <Tab active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
          <FaShieldAlt /> Security
        </Tab>
      </TabsContainer>

      {activeTab === 'general' && (
        <>
          <SettingsSection>
            <SectionTitle>
              <FaMoon /> Appearance
            </SectionTitle>
            <FormGroup>
              <Label>Interface Theme</Label>
              <ThemeSwitcher />
            </FormGroup>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <FaServer /> Connection
            </SectionTitle>
            <FormGroup>
              <Label>API Endpoint URL</Label>
              <Input 
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000/api/v1"
              />
            </FormGroup>
            <FormGroup>
              <ToggleSwitch>
                <SwitchInput 
                  type="checkbox" 
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <SwitchSlider checked={autoRefresh} theme={useThemeStore.getState()} />
                <span style={{ color: '#fff' }}>Enable Auto-refresh for Job Monitor</span>
              </ToggleSwitch>
            </FormGroup>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <FaShieldAlt /> Data Retention
            </SectionTitle>
            <FormGroup>
              <Label>Local Evidence Retention (Days)</Label>
              <Input 
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                min="1"
                max="365"
              />
            </FormGroup>
          </SettingsSection>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="secondary" onClick={handleReset}>
              <FaRedo /> Reset Defaults
            </Button>
            <Button onClick={handleSave}>
              <FaSave /> Save Changes
            </Button>
          </div>
        </>
      )}

      {activeTab === 'security' && (
        <>
          <SettingsSection>
            <SectionTitle>
              <FaUserShield /> Account Security
            </SectionTitle>
            
            <SecurityItem>
              <SecurityInfo>
                <SecurityLabel>Two-Factor Authentication</SecurityLabel>
                <SecurityDesc>Add an extra layer of security to your account</SecurityDesc>
              </SecurityInfo>
              <StatusBadge status="inactive">Not Enabled</StatusBadge>
            </SecurityItem>
            
            <SecurityItem>
              <SecurityInfo>
                <SecurityLabel>Session Timeout</SecurityLabel>
                <SecurityDesc>Automatically log out after 8 days of inactivity</SecurityDesc>
              </SecurityInfo>
              <StatusBadge status="active"><FaCheckCircle /> Active</StatusBadge>
            </SecurityItem>
            
            <SecurityItem>
              <SecurityInfo>
                <SecurityLabel>Account Status</SecurityLabel>
                <SecurityDesc>
                  {user?.email ? `Logged in as ${user.email}` : 'Account active'}
                </SecurityDesc>
              </SecurityInfo>
              <StatusBadge status="active"><FaCheckCircle /> Active</StatusBadge>
            </SecurityItem>
            
            <SecurityItem>
              <SecurityInfo>
                <SecurityLabel>User Role</SecurityLabel>
                <SecurityDesc>
                  {user?.role || 'Analyst'} {user?.is_admin && '(Administrator)'}
                </SecurityDesc>
              </SecurityInfo>
              <StatusBadge status="active"><FaCheckCircle /> Verified</StatusBadge>
            </SecurityItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <FaKey /> API Access
            </SectionTitle>
            
            <SecurityItem>
              <SecurityInfo>
                <SecurityLabel>API Token</SecurityLabel>
                <SecurityDesc>Your authentication token is securely stored in browser</SecurityDesc>
              </SecurityInfo>
              <StatusBadge status="active"><FaCheckCircle /> Valid</StatusBadge>
            </SecurityItem>
            
            <SecurityItem>
              <SecurityInfo>
                <SecurityLabel>Last Login</SecurityLabel>
                <SecurityDesc>Current session started at {loginTime}</SecurityDesc>
              </SecurityInfo>
              <StatusBadge status="active"><FaCheckCircle /> Active</StatusBadge>
            </SecurityItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <FaLock /> Data Protection
            </SectionTitle>
            
            <SecurityItem>
              <SecurityInfo>
                <SecurityLabel>SHA-256 Hashing</SecurityLabel>
                <SecurityDesc>All evidence is cryptographically hashed for integrity verification</SecurityDesc>
              </SecurityInfo>
              <StatusBadge status="active"><FaCheckCircle /> Enabled</StatusBadge>
            </SecurityItem>
            
            <SecurityItem>
              <SecurityInfo>
                <SecurityLabel>Chain of Custody Logging</SecurityLabel>
                <SecurityDesc>Immutable audit trail for all evidence operations</SecurityDesc>
              </SecurityInfo>
              <StatusBadge status="active"><FaCheckCircle /> Enabled</StatusBadge>
            </SecurityItem>
            
            <SecurityItem>
              <SecurityInfo>
                <SecurityLabel>Secure File Storage</SecurityLabel>
                <SecurityDesc>Evidence files are stored securely with restricted access</SecurityDesc>
              </SecurityInfo>
              <StatusBadge status="active"><FaCheckCircle /> Enabled</StatusBadge>
            </SecurityItem>
          </SettingsSection>
        </>
      )}
    </PageContainer>
  );
};

export default SettingsPage;
