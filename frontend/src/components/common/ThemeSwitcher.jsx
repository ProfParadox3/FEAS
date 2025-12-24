import React from 'react';
import styled from 'styled-components';
import { 
  FaSun, 
  FaMoon, 
  FaRobot,
  FaDesktop 
} from 'react-icons/fa';
import { useThemeStore } from '../../store/themeStore';

const ThemeSwitcherContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
`;

const ThemeLabel = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ThemeButtons = styled.div`
  display: flex;
  gap: 0.25rem;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.25rem;
`;

const ThemeButton = styled.button`
  background: ${({ active, theme }) => 
    active ? theme.primary : 'transparent'};
  border: none;
  color: ${({ active, theme }) => 
    active ? theme.cardBackground : theme.text};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  
  &:hover {
    background: ${({ theme, active }) => 
      active ? theme.primary : theme.primary}20;
    color: ${({ theme, active }) => 
      active ? theme.cardBackground : theme.primary};
  }
`;

const themes = [
  { id: 'cyber', icon: <FaRobot />, label: 'Cyber' },
  { id: 'dark', icon: <FaMoon />, label: 'Dark' },
  { id: 'light', icon: <FaSun />, label: 'Light' },
  { id: 'system', icon: <FaDesktop />, label: 'System' },
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <ThemeSwitcherContainer>
      <ThemeLabel>THEME:</ThemeLabel>
      <ThemeButtons>
        {themes.map((t) => (
          <ThemeButton
            key={t.id}
            active={theme === t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            aria-label={`Switch to ${t.label} theme`}
          >
            {t.icon}
          </ThemeButton>
        ))}
      </ThemeButtons>
    </ThemeSwitcherContainer>
  );
};

export default ThemeSwitcher;