import React from 'react';
import styled from 'styled-components';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import { useThemeStore } from '../../store/themeStore';
import ThemeSwitcher from '../common/ThemeSwitcher';

const HeaderContainer = styled.header`
  height: 64px;
  background: ${({ theme }) => theme.cardBackground};
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.background};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  width: 400px;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  
  input {
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.text};
    margin-left: 0.5rem;
    width: 100%;
    &:focus { outline: none; }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  font-size: 1.2rem;
  position: relative;
  &:hover { color: ${({ theme }) => theme.primary}; }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  span.name { font-weight: 600; font-size: 0.9rem; color: ${({ theme }) => theme.text}; }
  span.role { font-size: 0.75rem; color: ${({ theme }) => theme.textSecondary}; }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <SearchBar>
        <FaSearch color="#666" />
        <input placeholder="Search evidence, cases, or hash..." />
      </SearchBar>
      
      <RightSection>
        <ThemeSwitcher />
        
        <IconButton>
          <FaBell />
          {/* Notification badge removed for cleanliness */}
        </IconButton>
        
        <UserProfile>
          <UserInfo>
            <span className="name">Investigator</span>
            <span className="role">Admin Access</span>
          </UserInfo>
          <FaUserCircle size={32} color="#3b82f6" />
        </UserProfile>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;