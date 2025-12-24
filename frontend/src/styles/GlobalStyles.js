import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    
    /* Status Colors */
    --status-pending: #fbbf24;
    --status-processing: #3b82f6;
    --status-completed: #10b981;
    --status-failed: #ef4444;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-xxl: 3rem;
    
    /* Transitions */
    --transition-fast: 150ms ease-in-out;
    --transition-normal: 300ms ease-in-out;
    --transition-slow: 500ms ease-in-out;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: var(--font-sans);
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: background var(--transition-normal), color var(--transition-normal);
    overflow-x: hidden;
    min-height: 100vh;
  }
  
  code, pre {
    font-family: var(--font-mono);
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.cardBackground};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.primary};
    border-radius: 5px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
  
  /* Selection */
  ::selection {
    background: ${({ theme }) => theme.primary}40;
    color: ${({ theme }) => theme.text};
  }
  
  /* Focus outline */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }
  
  /* Utility classes */
  .text-gradient {
    background: ${({ theme }) => theme.gradient};
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  .glow {
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  .pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes glow {
    from {
      text-shadow: 0 0 5px ${({ theme }) => theme.glowColor};
    }
    to {
      text-shadow: 0 0 10px ${({ theme }) => theme.glowColor},
                   0 0 20px ${({ theme }) => theme.glowColor};
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

export default GlobalStyles;