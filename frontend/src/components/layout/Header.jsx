import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaUserCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
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
  position: relative;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.background};
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  span.name { font-weight: 600; font-size: 0.9rem; color: ${({ theme }) => theme.text}; }
  span.role { font-size: 0.75rem; color: ${({ theme }) => theme.textSecondary}; }
`;

const Dropdown = styled.div`
  display: ${({ isOpen }) => isOpen ? 'block' : 'none'};
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.primary};
  }
  
  svg {
    font-size: 1rem;
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const displayName = user?.name || 'Investigator';
  const displayRole = user?.role || 'Admin Access';

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
        </IconButton>
        
        <UserProfile ref={dropdownRef} onClick={toggleDropdown}>
          <UserInfo>
            <span className="name">{displayName}</span>
            <span className="role">{displayRole}</span>
          </UserInfo>
          <FaUserCircle size={32} color="#3b82f6" />
          
          <Dropdown isOpen={dropdownOpen}>
            <DropdownItem onClick={handleProfileClick}>
              <FaUser />
              View Profile
            </DropdownItem>
            {isAuthenticated && (
              <DropdownItem onClick={handleLogout}>
                <FaSignOutAlt />
                Logout
              </DropdownItem>
            )}
          </Dropdown>
        </UserProfile>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;