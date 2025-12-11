import React from 'react';
import styled from 'styled-components';
import { 
  FaServer, 
  FaNetworkWired, 
  FaDatabase,
  FaShieldAlt,
  FaLock
} from 'react-icons/fa';

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.cardBackground};
  border-top: 1px solid ${({ theme }) => theme.cardBorder};
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const StatusIcon = styled.div`
  color: ${({ theme, status }) => 
    status === 'online' ? theme.success : 
    status === 'warning' ? theme.warning : theme.error};
  font-size: 0.75rem;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background: ${({ theme, status }) => 
      status === 'online' ? theme.success : 
      status === 'warning' ? theme.warning : theme.error};
    border-radius: 50%;
    margin-right: 4px;
    animation: ${({ status }) => 
      status === 'online' ? 'pulse 2s ease-in-out infinite' : 'none'};
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const Copyright = styled.div`
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  
  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: ${({ theme }) => theme.success}20;
  border: 1px solid ${({ theme }) => theme.success}40;
  border-radius: 4px;
  color: ${({ theme }) => theme.success};
  font-family: var(--font-mono);
  font-size: 0.75rem;
`;

const Footer = () => {
  const systemStatus = [
    { name: 'API Server', status: 'online', icon: <FaServer /> },
    { name: 'Database', status: 'online', icon: <FaDatabase /> },
    { name: 'Storage', status: 'warning', icon: <FaNetworkWired /> },
    { name: 'Security', status: 'online', icon: <FaShieldAlt /> },
  ];

  return (
    <FooterContainer>
      <StatusSection>
        {systemStatus.map((item, idx) => (
          <StatusItem key={idx}>
            {item.icon}
            <StatusIcon status={item.status}>
              {item.name}
            </StatusIcon>
          </StatusItem>
        ))}
      </StatusSection>
      
      <SecurityBadge>
        <FaLock /> ENCRYPTED CONNECTION
      </SecurityBadge>
      
      <Copyright>
        © 2024 <span>FORENSIC ACQUISITION SYSTEM</span> v1.0.0
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;