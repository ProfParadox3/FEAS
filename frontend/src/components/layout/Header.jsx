import React from 'react';
import styled from 'styled-components';
import { 
  FaBars, 
  FaSearch, 
  FaBell, 
  FaUserCircle,
  FaFingerprint,
  FaShieldAlt 
} from 'react-icons/fa';
import { useThemeStore } from '../../store/themeStore';
import ThemeSwitcher from '../common/ThemeSwitcher';

const HeaderContainer = styled.header`
  background: ${({ theme }) => theme.cardBackground};
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.primary}20;
    color: ${({ theme }) => theme.primary};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

const LogoIcon = styled.div`
  color: ${({ theme }) => theme.primary};
  font-size: 1.5rem;
`;

const LogoText = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  background: ${({ theme }) => theme.gradient};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 200px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
`;

const NotificationButton = styled.button`
  position: relative;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary}20;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: ${({ theme }) => theme.error};
  color: white;
  font-size: 0.625rem;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  color: ${({ theme }) => theme.text};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`;

const SystemStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.success}20;
  border: 1px solid ${({ theme }) => theme.success}40;
  border-radius: 4px;
  color: ${({ theme }) => theme.success};
  font-family: var(--font-mono);
  font-size: 0.75rem;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.success};
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
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

const Header = ({ toggleSidebar }) => {
  const { theme } = useThemeStore();
  const [notifications, setNotifications] = React.useState(3);

  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={toggleSidebar}>
          <FaBars />
        </MenuButton>
        
        <Logo>
          <LogoIcon>
            <FaShieldAlt />
          </LogoIcon>
          <LogoText>
            FORENSIC<span style={{ color: theme === 'cyber' ? '#00ffff' : theme.primary }}>ACQUISITION</span>
          </LogoText>
        </Logo>
        
        <SystemStatus>
          <FaFingerprint /> SYSTEM ONLINE
        </SystemStatus>
      </LeftSection>
      
      <RightSection>
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder="Search evidence, jobs, cases..." 
          />
        </SearchContainer>
        
        <ThemeSwitcher />
        
        <NotificationButton>
          <FaBell />
          {notifications > 0 && (
            <NotificationBadge>{notifications}</NotificationBadge>
          )}
        </NotificationButton>
        
        <UserButton>
          <FaUserCircle />
          INVESTIGATOR
        </UserButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;