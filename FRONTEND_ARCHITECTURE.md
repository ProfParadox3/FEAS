# FEAS Frontend Architecture Documentation

## Forensic Evidence Acquisition System - Frontend

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Technology Stack:** React 18, Styled Components, Zustand, React Query, React Router v6

---

## Table of Contents

1. [High-Level System Overview](#1-high-level-system-overview)
2. [Directory Structure](#2-directory-structure)
3. [Entry Points & Initialization](#3-entry-points--initialization)
4. [Application Flow & Navigation](#4-application-flow--navigation)
5. [Components](#5-components)
6. [Pages](#6-pages)
7. [Services and API Integration](#7-services-and-api-integration)
8. [State Management](#8-state-management)
9. [Styling and Theming](#9-styling-and-theming)
10. [Utilities and Helpers](#10-utilities-and-helpers)
11. [Data Flow Examples](#11-data-flow-examples)
12. [Feature Walkthroughs](#12-feature-walkthroughs)
13. [Third-Party Libraries](#13-third-party-libraries)

---

## 1. High-Level System Overview

### Technical Explanation

The FEAS frontend is a **Single Page Application (SPA)** built with React 18. It implements a component-based architecture with the following key patterns:

- **Component Composition**: UI is built from reusable, self-contained components
- **CSS-in-JS**: Styled Components for scoped, themeable styling
- **Global State**: Zustand for lightweight, hook-based state management
- **Server State**: React Query for API data fetching, caching, and synchronization
- **Client-side Routing**: React Router v6 for navigation without page reloads

The architecture follows a **feature-based organization** where related components, pages, and logic are grouped together:

```
App
├── Layout (Header, Sidebar, Footer)
│   └── Protected Routes
│       ├── Dashboard
│       ├── Evidence Submission
│       ├── Job Monitor
│       ├── Evidence Details
│       └── Settings/Profile
└── Auth Routes (Login, Register)
```

### Plain-English Explanation

Think of the FEAS frontend as a digital control center for investigators. It's like a specialized web browser that:

1. **Shows a dashboard** with system statistics and quick actions
2. **Lets you submit evidence** via URL or file upload
3. **Monitors processing jobs** in real-time
4. **Displays evidence details** with hash verification
5. **Generates PDF reports** for court use
6. **Manages user accounts** and settings

The application never needs to reload the entire page - clicking links just updates the visible content, making it feel fast and responsive.

### Why This Architecture Was Chosen

**Tradeoffs:**

| Decision | Benefit | Cost |
|----------|---------|------|
| React | Component reuse, large ecosystem | Learning curve for JSX |
| Styled Components | Scoped CSS, dynamic styling | Bundle size, runtime cost |
| Zustand | Simple, hooks-based | Less tooling than Redux |
| React Query | Auto-caching, refetch | Additional abstraction layer |
| Create React App | Quick setup, zero config | Ejection required for customization |

---

## 2. Directory Structure

```
frontend/
├── public/
│   ├── index.html              # HTML template
│   └── favicon.ico             # Browser tab icon
│
├── src/
│   ├── index.js                # Application entry point
│   ├── index.css               # Global CSS reset
│   ├── App.jsx                 # Root component & routing
│   │
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Shared utility components
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ThemeSwitcher.jsx
│   │   │
│   │   ├── evidence/           # Evidence-specific components
│   │   │   ├── MediaPreview.jsx
│   │   │   ├── MetadataTable.jsx
│   │   │   ├── SHA256Display.jsx
│   │   │   └── VerifyIntegrityButton.jsx
│   │   │
│   │   ├── layout/             # Page structure components
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── monitoring/         # Job monitoring components
│   │   │   └── JobMonitorTable.jsx
│   │   │
│   │   └── submission/         # Evidence submission forms
│   │       ├── FileUpload.jsx
│   │       ├── SubmissionTabs.jsx
│   │       └── URLInput.jsx
│   │
│   ├── pages/                  # Page-level components
│   │   ├── AnalyticsPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DocsPage.jsx
│   │   ├── EvidenceDetailPage.jsx
│   │   ├── HelpPage.jsx
│   │   ├── JobMonitorPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── PlaceholderPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── SubmissionPage.jsx
│   │
│   ├── services/               # API and utility services
│   │   ├── api.js              # Axios API client
│   │   ├── theme.js            # Theme utilities
│   │   └── validation.js       # Form validation
│   │
│   ├── store/                  # Zustand state stores
│   │   ├── authStore.js        # Authentication state
│   │   ├── jobStore.js         # Job management state
│   │   └── themeStore.js       # Theme preference state
│   │
│   └── styles/                 # Global styles and themes
│       ├── GlobalStyles.js     # Styled-components global
│       ├── components.css      # Legacy CSS styles
│       └── theme.js            # Theme definitions
│
├── package.json                # Dependencies & scripts
├── package-lock.json           # Locked dependency versions
└── .env                        # Environment variables
```

### File-by-File Explanation

#### `src/index.js` - Application Entry Point

**Responsibility:** Bootstraps the React application, sets up providers, and mounts to DOM.

**Why It Exists:** Every React application needs an entry point that connects the React component tree to the HTML document.

```javascript
[Lines 1-8]
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
```

**Technical:** Imports React 18's `createRoot` API, global CSS, the root App component, React Query for server state management, and react-toastify for notifications.

**Plain English:** Brings in all the essential pieces needed to start the application - the React framework, styling, data fetching tools, and notification system.

```javascript
[Lines 9-17]
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

**Technical:** Creates a React Query client with custom defaults:
- `refetchOnWindowFocus: false` - Don't re-fetch when user returns to tab
- `retry: 1` - Only retry failed requests once
- `staleTime: 5 minutes` - Cache data for 5 minutes before considering it stale

**Plain English:** Configures how the application fetches and caches data from the server. Data is considered "fresh" for 5 minutes before automatically checking for updates.

```javascript
[Lines 19-37]
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </QueryClientProvider>
  </React.StrictMode>
);
```

**Technical:** Uses React 18's concurrent rendering mode via `createRoot`. Wraps the app in `QueryClientProvider` for React Query context and adds a global `ToastContainer` for notifications.

**Plain English:** Starts the application and wraps it with data fetching capabilities and a notification system that shows popup messages.

---

## 3. Entry Points & Initialization

### Boot Sequence

```
1. Browser loads index.html
         │
         ▼
2. index.html loads bundle.js
         │
         ▼
3. index.js executes
   ├── Creates QueryClient
   ├── Calls ReactDOM.createRoot()
   └── Renders <App />
         │
         ▼
4. App.jsx loads
   ├── Reads theme from Zustand store
   ├── Applies ThemeProvider
   └── Sets up React Router
         │
         ▼
5. React Router evaluates URL
   ├── /login → LoginPage
   ├── /register → RegisterPage
   └── /* → ProtectedRoute → Layout → Page
         │
         ▼
6. ProtectedRoute checks auth
   ├── Not authenticated → Redirect to /login
   └── Authenticated → Render children
         │
         ▼
7. Layout renders
   ├── Sidebar
   ├── Header
   ├── {Page Content}
   └── Footer
```

### Provider Hierarchy

```jsx
<React.StrictMode>
  <QueryClientProvider>      // Server state (React Query)
    <ThemeProvider>          // Styling context (Styled Components)
      <Router>               // Navigation (React Router)
        <ToastContainer />   // Notifications (react-toastify)
        <App />
      </Router>
    </ThemeProvider>
  </QueryClientProvider>
</React.StrictMode>
```

---

## 4. Application Flow & Navigation

### Routing Configuration (`src/App.jsx`)

```javascript
[Lines 1-29]
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from './store/themeStore';

// Layout
import Layout from './components/layout/Layout';

// Auth
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import SubmissionPage from './pages/SubmissionPage';
import JobMonitorPage from './pages/JobMonitorPage';
import EvidenceDetailPage from './pages/EvidenceDetailPage';
import SettingsPage from './pages/SettingsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import HelpPage from './pages/HelpPage';
import DocsPage from './pages/DocsPage';

// Styles
import GlobalStyles from './styles/GlobalStyles';
import { cyberTheme, darkTheme, lightTheme } from './styles/theme';
```

**Technical:** Imports all route components and layouts. Uses named imports for tree-shaking optimization.

**Plain English:** Brings in all the pages and components needed to build the application's navigation.

```javascript
[Lines 30-40]
function App() {
  const { theme } = useThemeStore();

  const getTheme = () => {
    switch (theme) {
      case 'cyber': return cyberTheme;
      case 'dark': return darkTheme;
      case 'light': return lightTheme;
      default: return cyberTheme;
    }
  };
```

**Technical:** Reads theme preference from Zustand store and maps to theme object. The `useThemeStore` hook triggers re-render on theme changes.

**Plain English:** Checks which visual theme the user has selected (cyber/dark/light) and loads the appropriate color scheme.

```javascript
[Lines 42-78]
return (
  <ThemeProvider theme={getTheme()}>
    <GlobalStyles />
    <Router>
      <Routes>
        {/* Auth Routes (without Layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Main App Routes (with Layout and Protected) */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Navigate to="/dashboard" replace /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/submit" element={
          <ProtectedRoute>
            <Layout><SubmissionPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/evidence/:jobId" element={
          <ProtectedRoute>
            <Layout><EvidenceDetailPage /></Layout>
          </ProtectedRoute>
        } />
        
        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </ThemeProvider>
);
```

**Technical:** React Router v6 declarative routing. Public routes (login/register) render without Layout. Protected routes wrap pages in `ProtectedRoute` + `Layout` HOCs. The `:jobId` segment creates a dynamic route parameter.

**Plain English:** Defines which page shows for each URL:
- `/login` and `/register` show without the sidebar/header
- All other pages require login and show with full layout
- Unknown URLs redirect to login

### Route Table

| Path | Component | Protected | Layout |
|------|-----------|-----------|--------|
| `/login` | LoginPage | No | No |
| `/register` | RegisterPage | No | No |
| `/` | Redirect to /dashboard | Yes | Yes |
| `/dashboard` | Dashboard | Yes | Yes |
| `/submit` | SubmissionPage | Yes | Yes |
| `/monitor` | JobMonitorPage | Yes | Yes |
| `/database` | JobMonitorPage | Yes | Yes |
| `/evidence/:jobId` | EvidenceDetailPage | Yes | Yes |
| `/settings` | SettingsPage | Yes | Yes |
| `/profile` | ProfilePage | Yes | Yes |
| `/analytics` | AnalyticsPage | Yes | Yes |
| `/help` | HelpPage | Yes | Yes |
| `/docs` | DocsPage | Yes | Yes |
| `*` | Redirect to /login | No | No |

---

## 5. Components

### 5.1 Layout Components

#### Layout (`src/components/layout/Layout.jsx`)

**Role:** Main page wrapper providing consistent structure

**Responsibilities:**
- Render sidebar navigation
- Render header with user info
- Render footer with system status
- Manage sidebar open/close state
- Apply background visual effects

```javascript
[Lines 7-48]
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  position: relative;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${({ sidebarOpen }) => (sidebarOpen ? '250px' : '0')};
  transition: margin-left 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const GridPattern = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: ${({ theme }) => theme.gridPattern};
  background-size: 60px 60px;
  opacity: 0.1;
  pointer-events: none;
  z-index: 0;
`;
```

**Technical:** Uses CSS Grid/Flexbox for responsive layout. The `GridPattern` creates a subtle background effect. `pointer-events: none` ensures background doesn't interfere with clicks.

**Plain English:** Creates the page structure with a sidebar, header, main content area, and footer. The grid pattern in the background is purely decorative.

```javascript
[Lines 50-72]
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutContainer>
      <GridPattern />
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <MainContent sidebarOpen={sidebarOpen}>
        <Header toggleSidebar={toggleSidebar} />
        <ContentArea>
          {children}
        </ContentArea>
        <Footer />
      </MainContent>
    </LayoutContainer>
  );
};
```

**Technical:** Uses React's `useState` for sidebar toggle. The `children` prop allows any page content to be rendered within the layout structure.

**Plain English:** The layout "wraps around" page content. You can toggle the sidebar on/off, and whatever page you're viewing appears in the middle.

#### Sidebar (`src/components/layout/Sidebar.jsx`)

**Role:** Navigation menu with real-time statistics

```javascript
[Lines 172-209]
const Sidebar = ({ isOpen, toggleSidebar }) => {
  // Fetch real-time stats for sidebar footer
  const { data: stats } = useQuery('sidebarStats', () => forensicAPI.getAnalytics('7d'), {
    refetchInterval: 30000,
    placeholderData: { pending_jobs: 0, total_jobs: 0 }
  });

  const navItems = [
    {
      section: 'Main',
      items: [
        { path: '/dashboard', icon: <FaHome />, title: 'Dashboard' },
        { path: '/submit', icon: <FaUpload />, title: 'Acquire Evidence', badge: 'NEW' },
        { path: '/monitor', icon: <FaListAlt />, title: 'Job Monitor' },
        { path: '/database', icon: <FaSearch />, title: 'Evidence Browser' },
      ]
    },
    {
      section: 'Analysis',
      items: [
        { path: '/analytics', icon: <FaChartLine />, title: 'Analytics' },
        { path: '/chain-of-custody', icon: <FaHistory />, title: 'Chain of Custody' },
      ]
    },
    {
      section: 'System',
      items: [
        { path: '/settings', icon: <FaCog />, title: 'Settings' },
        { path: '/security', icon: <FaShieldAlt />, title: 'Security' },
        { path: '/help', icon: <FaQuestionCircle />, title: 'Help' },
        { path: '/docs', icon: <FaBook />, title: 'Documentation' },
      ]
    }
  ];
```

**Technical:** Uses React Query to fetch analytics with 30-second polling. Navigation items are defined as data structure for easy modification.

**Plain English:** The sidebar shows navigation links organized into sections. It also fetches live statistics every 30 seconds to show active job counts.

#### Header (`src/components/layout/Header.jsx`)

**Role:** Top navigation bar with search, notifications, and user menu

```javascript
[Lines 113-156]
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

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };
```

**Technical:** Uses `useRef` for dropdown click-outside detection. Event listeners are cleaned up in the effect return function to prevent memory leaks.

**Plain English:** Shows the user's name and profile picture in the header. Clicking opens a dropdown menu with profile and logout options. Clicking elsewhere or pressing Escape closes it.

### 5.2 Common Components

#### ProtectedRoute (`src/components/common/ProtectedRoute.jsx`)

**Role:** Authentication guard for protected pages

```javascript
[Lines 1-16]
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  
  // Check if user is authenticated
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
```

**Technical:** Reads authentication state from Zustand store. Uses React Router's `Navigate` component for declarative redirects. The `replace` prop prevents login from appearing in browser history.

**Plain English:** Acts like a security guard - if you're not logged in, you get sent to the login page. If you are logged in, you can see the page.

#### LoadingSpinner (`src/components/common/LoadingSpinner.jsx`)

**Role:** Animated loading indicator

```javascript
[Lines 1-50]
import React from 'react';
import styled from 'styled-components';
import { FaFingerprint } from 'react-icons/fa';

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
`;

const SpinnerIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
  }
`;

const LoadingSpinner = ({ text = 'Processing forensic evidence...' }) => {
  return (
    <SpinnerContainer>
      <SpinnerIcon>
        <FaFingerprint />
      </SpinnerIcon>
      <SpinnerText>{text}</SpinnerText>
    </SpinnerContainer>
  );
};
```

**Technical:** CSS keyframe animation with transform for smooth rotation. The fingerprint icon is thematically appropriate for a forensics application.

**Plain English:** Shows a spinning fingerprint icon with customizable loading text while waiting for data.

### 5.3 Evidence Components

#### SHA256Display (`src/components/evidence/SHA256Display.jsx`)

**Role:** Displays cryptographic hash with copy functionality

```javascript
[Lines 193-260]
const SHA256Display = ({ hash, jobId }) => {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      toast.success('Hash copied to clipboard');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy hash');
    }
  };

  const formatHash = (hash) => {
    if (!hash) return 'No hash available';
    
    if (!visible) {
      return '•'.repeat(64);  // Masked display
    }
    
    // Format as groups of 8 characters
    const groups = [];
    for (let i = 0; i < hash.length; i += 8) {
      groups.push(hash.substring(i, i + 8));
    }
    return groups.join(' ');
  };
```

**Technical:** Uses Clipboard API for copy functionality. Hash is hidden by default for privacy, shown in 8-character groups for readability.

**Plain English:** Displays the evidence's unique digital fingerprint. You can show/hide it and copy it to your clipboard with one click.

#### VerifyIntegrityButton (`src/components/evidence/VerifyIntegrityButton.jsx`)

**Role:** Triggers server-side hash verification

```javascript
[Lines 35-64]
const VerifyIntegrityButton = ({ jobId, onVerifyComplete }) => {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await forensicAPI.verifyIntegrity(jobId);
      
      if (result.matches) {
        toast.success('Integrity Verified: Hash matches original chain of custody record.');
      } else {
        toast.error('Integrity Check Failed: Hash mismatch detected!');
      }
      
      if (onVerifyComplete) {
        onVerifyComplete(result);
      }
    } catch (error) {
      toast.error(`Verification failed: ${error.message}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Button onClick={handleVerify} disabled={verifying}>
      {verifying ? <FaSpinner className="spin" /> : <FaShieldAlt />}
      {verifying ? 'Verifying...' : 'Verify Integrity'}
    </Button>
  );
};
```

**Technical:** Async function with loading state management. Calls backend API and displays appropriate toast based on result.

**Plain English:** Button that checks if evidence has been tampered with by comparing the current file's fingerprint to the original.

### 5.4 Submission Components

#### SubmissionTabs (`src/components/submission/SubmissionTabs.jsx`)

**Role:** Tab container for URL and file upload options

```javascript
[Lines 17-70]
const SubmissionTabs = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [submissionResult, setSubmissionResult] = useState(null);
  const navigate = useNavigate();

  const handleSubmissionSuccess = (response) => {
    setSubmissionResult(response);
  };

  const handleReset = () => {
    setSubmissionResult(null);
  };

  return (
    <Container>
      {!submissionResult ? (
        <>
          <TabsHeader>
            <Tab active={activeTab === 'url'} onClick={() => setActiveTab('url')}>
              <FaGlobe /> URL Acquisition
            </Tab>
            <Tab active={activeTab === 'upload'} onClick={() => setActiveTab('upload')}>
              <FaUpload /> Local Upload
            </Tab>
          </TabsHeader>
          <TabContent>
            {activeTab === 'url' ? (
              <URLInput onSubmit={handleSubmissionSuccess} />
            ) : (
              <FileUpload onSubmit={handleSubmissionSuccess} />
            )}
          </TabContent>
        </>
      ) : (
        <SuccessMessage>
          <FaCheckCircle size={50} color="#10b981" />
          <SuccessTitle>Evidence Submitted Successfully</SuccessTitle>
          <JobInfo>
            <div>Job ID: <strong>{submissionResult.job_id}</strong></div>
            <div>Status: {submissionResult.status.toUpperCase()}</div>
          </JobInfo>
          <Button onClick={() => navigate('/monitor')}>Monitor Job</Button>
          <Button onClick={handleReset}>Submit New Evidence</Button>
        </SuccessMessage>
      )}
    </Container>
  );
};
```

**Technical:** Conditional rendering based on submission state. Child components call `onSubmit` callback with response data.

**Plain English:** Shows two tabs - one for submitting URLs, one for uploading files. After submission, shows a success message with the job ID.

#### URLInput (`src/components/submission/URLInput.jsx`)

**Role:** Form for submitting social media URLs

```javascript
[Lines 280-350]
const URLInput = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [investigatorId, setInvestigatorId] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState(null);

  // Secure domain matching helper - checks exact match or valid subdomain
  const isDomainMatch = (hostname, allowedDomain) => {
    let domain = hostname.toLowerCase();
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    // Exact match
    if (domain === allowedDomain) return true;
    
    // Subdomain match (must end with .allowedDomain)
    if (domain.endsWith('.' + allowedDomain)) return true;
    
    return false;
  };

  const detectPlatform = (inputUrl) => {
    try {
      const urlObj = new URL(inputUrl);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (isDomainMatch(hostname, 'twitter.com') || isDomainMatch(hostname, 'x.com')) {
        return 'twitter';
      }
      if (isDomainMatch(hostname, 'youtube.com') || isDomainMatch(hostname, 'youtu.be')) {
        return 'youtube';
      }
      // ... more platforms
    } catch {
      return 'web';
    }
  };
```

**Technical:** Real-time URL validation with secure domain matching. The `isDomainMatch` function prevents subdomain spoofing attacks (e.g., `twitter.com.malicious.com`).

**Plain English:** As you type a URL, it automatically detects which platform it's from (Twitter, YouTube, etc.) and validates that it's from an allowed domain.

```javascript
[Lines 368-404]
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
```

**Technical:** Prevents default form submission, validates inputs, calls API, shows toast notification, resets form on success.

**Plain English:** When you click submit, it checks your inputs are valid, sends them to the server, and shows you a success or error message.

#### FileUpload (`src/components/submission/FileUpload.jsx`)

**Role:** Drag-and-drop file upload with preview

```javascript
[Lines 316-358]
const FileUpload = ({ onSubmit, isLoading }) => {
  const [files, setFiles] = useState([]);
  const [investigatorId, setInvestigatorId] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError('File exceeds maximum size of 500MB');
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('File type not supported');
      }
      return;
    }
    
    const validatedFiles = acceptedFiles.map(file => {
      const preview = URL.createObjectURL(file);
      return { file, preview, type: file.type, size: file.size };
    });
    
    setFiles(validatedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.heif'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav']
    },
    maxSize: 500 * 1024 * 1024,  // 500MB
    multiple: false
  });
```

**Technical:** Uses react-dropzone for drag-and-drop functionality. `URL.createObjectURL` creates a local preview URL. MIME type filtering ensures only allowed file types are accepted.

**Plain English:** Lets you drag files onto the page or click to browse. It checks the file type and size, shows a preview for images, and displays an error if something's wrong.

---

## 6. Pages

### 6.1 Dashboard (`src/pages/Dashboard.jsx`)

**Role:** Main landing page with system overview

**Features:**
- Statistics cards (total jobs, completed, pending, failed)
- Success rate visualization
- System status indicators
- Quick action links
- Feature overview cards

```javascript
[Lines 271-288]
const Dashboard = () => {
  const { data: stats, isLoading } = useQuery('analytics', () => forensicAPI.getAnalytics('7d'), {
    refetchInterval: 30000,
    onError: () => {
      return { total_jobs: 0, completed_jobs: 0, pending_jobs: 0, failed_jobs: 0 };
    }
  });

  if (isLoading) return <LoadingSpinner text="Loading system analytics..." />;

  const totalJobs = stats?.total_jobs || 0;
  const completedJobs = stats?.completed_jobs || 0;
  const pendingJobs = stats?.pending_jobs || 0;
  const failedJobs = stats?.failed_jobs || 0;
  const successRate = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : 0;
```

**Technical:** Uses React Query with 30-second polling for live updates. Calculates derived metrics (success rate) from raw data.

**Plain English:** Shows a summary of system activity - how many jobs have been processed, success rates, and quick links to common actions.

### 6.2 EvidenceDetailPage (`src/pages/EvidenceDetailPage.jsx`)

**Role:** Detailed view of a single evidence item

**Features:**
- SHA-256 hash display
- File metadata (name, size, type)
- Timeline (created, completed)
- Download PDF report button
- Verify integrity button

```javascript
[Lines 151-171]
const EvidenceDetailPage = () => {
  const { jobId } = useParams();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: job, isLoading, error } = useQuery(
    ['jobDetails', jobId],
    () => forensicAPI.getJobDetails(jobId),
    { enabled: !!jobId, refetchInterval: 10000 }
  );

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      await forensicAPI.downloadReport(jobId);
    } catch (err) {
      alert("Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };
```

**Technical:** Uses `useParams` hook to extract job ID from URL. React Query with `enabled` option prevents query from running until jobId is available. 10-second polling for live status updates.

**Plain English:** Shows all the details about a specific piece of evidence - its unique fingerprint, file information, and lets you download the PDF report or verify the file hasn't been changed.

### 6.3 LoginPage (`src/pages/LoginPage.jsx`)

**Role:** User authentication form

```javascript
[Lines 152-174]
const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      login(response.user, response.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
```

**Technical:** Form with controlled inputs. Calls auth API, stores response in Zustand, navigates on success.

**Plain English:** Simple login form with email and password fields. Shows errors if login fails, redirects to dashboard on success.

---

## 7. Services and API Integration

### API Client (`src/services/api.js`)

**Role:** Centralized HTTP client for backend communication

```javascript
[Lines 1-39]
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const { state } = JSON.parse(authData);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error('Error parsing auth token:', e);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response || error.message);
    if (error.message === 'Network Error') {
      alert("Cannot connect to server. Is Backend running on port 8000?");
    }
    return Promise.reject(error);
  }
);
```

**Technical:** Axios instance with base URL, default headers, and 30-second timeout. Request interceptor adds JWT from localStorage. Response interceptor extracts `data` property and handles network errors.

**Plain English:** Sets up a reusable HTTP client that automatically includes your login token with every request and handles common errors.

```javascript
[Lines 41-89]
export const authAPI = {
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const forensicAPI = {
  submitURLJob: (data) => api.post('/jobs/url', data),
  
  submitUploadJob: (formData) => api.post('/jobs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  getAllJobs: () => api.get('/jobs'),
  getJobStatus: (id) => api.get(`/jobs/${id}/status`),
  getJobDetails: (id) => api.get(`/jobs/${id}/details`),
  verifyIntegrity: (id) => api.post(`/jobs/${id}/verify`),
  getAnalytics: (period) => api.get(`/analytics?period=${period}`),
  
  downloadReport: async (jobId) => {
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}/report`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Forensic_Report_${jobId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
```

**Technical:** API functions organized by domain (auth, forensic). Login uses FormData for OAuth2 password flow. Download creates a blob URL and triggers browser download.

**Plain English:** Provides easy-to-use functions for all API calls - logging in, submitting evidence, checking job status, and downloading reports.

---

## 8. State Management

### Auth Store (`src/store/authStore.js`)

**Role:** Manages authentication state with persistence

```javascript
[Lines 1-34]
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (userData, token) => set({ 
        user: userData, 
        token: token,
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null,
        isAuthenticated: false 
      }),
      
      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData }
      })),
      
      getUser: () => get().user,
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

**Technical:** Zustand store with persist middleware. State is automatically saved to localStorage under key `auth-storage`. The `set` function triggers re-renders in consuming components.

**Plain English:** Keeps track of who's logged in. Even if you refresh the page or close the browser, you stay logged in because the information is saved locally.

### Theme Store (`src/store/themeStore.js`)

**Role:** Manages theme preference with persistence

```javascript
[Lines 1-17]
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'cyber',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'cyber' ? 'dark' : 
               state.theme === 'dark' ? 'light' : 'cyber'
      }))
    }),
    {
      name: 'theme-storage',
    }
  )
);
```

**Technical:** Simple store with three themes that cycle: cyber → dark → light → cyber.

**Plain English:** Remembers which color theme you prefer (cyber/dark/light) and keeps it even after you close the browser.

### Job Store (`src/store/jobStore.js`)

**Role:** Client-side job management (optional cache)

```javascript
[Lines 1-24]
import { create } from 'zustand';

export const useJobStore = create((set, get) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,
  
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (jobId, updates) => set((state) => ({
    jobs: state.jobs.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    )
  })),
  setSelectedJob: (job) => set({ selectedJob: job }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  getJobById: (jobId) => {
    return get().jobs.find(job => job.id === jobId);
  },
}));
```

**Technical:** Non-persisted store for transient job state. Provides CRUD operations and selector for job lookup.

**Plain English:** Temporary storage for job data while you're using the app. Unlike auth/theme, this doesn't persist between sessions.

---

## 9. Styling and Theming

### Theme Definitions (`src/styles/theme.js`)

```javascript
[Lines 1-68]
export const cyberTheme = {
  name: 'cyber',
  background: 'linear-gradient(135deg, #0a0e17 0%, #001122 100%)',
  cardBackground: 'rgba(16, 23, 41, 0.8)',
  cardBorder: '1px solid rgba(0, 255, 255, 0.2)',
  text: '#e5e7eb',
  textSecondary: '#9ca3af',
  primary: '#00ffff',       // Cyan
  primaryHover: '#00cccc',
  secondary: '#0088ff',
  accent: '#ff00ff',        // Magenta
  success: '#00ff88',       // Green
  warning: '#ffaa00',       // Orange
  error: '#ff4444',         // Red
  gradient: 'linear-gradient(90deg, #00ffff 0%, #0088ff 100%)',
  glowColor: '#00ffff',
  gridPattern: `url("data:image/svg+xml,...")`,
};

export const darkTheme = {
  name: 'dark',
  background: '#111827',
  cardBackground: '#1f2937',
  // ... more professional colors
};

export const lightTheme = {
  name: 'light',
  background: '#f9fafb',
  cardBackground: '#ffffff',
  // ... light mode colors
};
```

**Technical:** Three theme objects with consistent property names. The cyber theme uses a gradient background and semi-transparent cards for a futuristic look.

**Plain English:** Defines three visual styles - a cyberpunk-style theme with neon colors, a standard dark theme, and a light theme for daytime use.

### Global Styles (`src/styles/GlobalStyles.js`)

```javascript
[Lines 1-112]
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
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 10px; }
  ::-webkit-scrollbar-track { background: ${({ theme }) => theme.cardBackground}; }
  ::-webkit-scrollbar-thumb { 
    background: ${({ theme }) => theme.primary}; 
    border-radius: 5px;
  }
`;
```

**Technical:** CSS-in-JS global styles that respond to theme changes. Uses CSS custom properties for consistent values and themed scrollbars.

**Plain English:** Sets up the basic look of the entire application - fonts, colors, and even customizes the scrollbar to match the theme.

---

## 10. Utilities and Helpers

### Validation (`src/services/validation.js`)

**Role:** Client-side input validation

```javascript
[Lines 1-44]
export const validateURL = (url) => {
  try {
    const urlObj = new URL(url);
    
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        message: 'URL must use HTTP or HTTPS protocol'
      };
    }
    
    const allowedDomains = ['twitter.com', 'x.com', 'youtube.com', 'youtu.be'];
    const domain = urlObj.hostname.toLowerCase();
    const isAllowed = allowedDomains.some(allowed => domain.includes(allowed));
    
    if (!isAllowed) {
      return {
        isValid: false,
        message: `Domain not allowed`
      };
    }
    
    return { isValid: true, domain, platform: detectPlatform(domain) };
  } catch (error) {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
};

export const validateFile = (file) => {
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    return { isValid: false, message: 'File size exceeds maximum' };
  }
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.mov', '.mp3', '.wav'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, message: 'File extension not allowed' };
  }
  
  return { isValid: true, fileSize: file.size, mimeType: file.type };
};
```

**Technical:** Pure validation functions that return structured results with isValid flag and error messages.

**Plain English:** Checks that URLs are from allowed websites and files aren't too big or the wrong type, before you try to submit them.

### Theme Utilities (`src/services/theme.js`)

**Role:** Theme management functions

```javascript
[Lines 23-51]
export const applyTheme = (themeName) => {
  const theme = getTheme(themeName);
  
  // Apply CSS variables
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    if (typeof value === 'string' && !key.includes('Pattern')) {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    }
  });
  
  // Store theme preference
  localStorage.setItem('theme', themeName);
  
  return theme;
};

export const cycleTheme = (currentTheme) => {
  const themes = ['cyber', 'dark', 'light'];
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  
  return themes[nextIndex];
};
```

**Technical:** Applies theme as CSS custom properties on document root. Uses regex to convert camelCase to kebab-case for CSS property names.

**Plain English:** Helper functions for switching between themes and remembering your preference.

---

## 11. Data Flow Examples

### Example: Evidence Submission Flow

**Step 1: User fills form**
```jsx
// URLInput.jsx
<Input
  type="url"
  value={url}
  onChange={handleURLChange}
  placeholder="https://twitter.com/user/status/123"
/>
```

**Step 2: Real-time validation**
```javascript
// URLInput.jsx lines 348-366
const handleURLChange = (e) => {
  const value = e.target.value;
  setUrl(value);
  
  if (value) {
    const platform = detectPlatform(value);
    setDetectedPlatform(platform);  // Updates platform badge
    
    const validationError = validateURL(value);
    if (validationError) {
      setError(validationError);
    } else {
      setError('');
    }
  }
};
```

**Step 3: Form submission**
```javascript
// URLInput.jsx lines 384-393
const response = await forensicAPI.submitURLJob({
  url,
  investigator_id: investigatorId,
  case_number: caseNumber || undefined,
  notes: notes || undefined
});
```

**Step 4: API call**
```javascript
// api.js line 64
submitURLJob: (data) => api.post('/jobs/url', data),
```

**Step 5: Success handling**
```javascript
// URLInput.jsx lines 395-400
toast.success('Evidence acquisition job submitted successfully!');
onSubmit(response);  // Triggers parent state update

// SubmissionTabs.jsx
const handleSubmissionSuccess = (response) => {
  setSubmissionResult(response);  // Shows success message
};
```

**Step 6: User redirects to monitor**
```jsx
// SubmissionTabs.jsx
<Button onClick={() => navigate('/monitor')}>
  Monitor Job
</Button>
```

---

## 12. Feature Walkthroughs

### Feature: Theme Switching

**What It Does:** Allows users to switch between cyber/dark/light themes with persistence.

**Key Files:**
- `src/store/themeStore.js` - State management
- `src/components/common/ThemeSwitcher.jsx` - UI component
- `src/styles/theme.js` - Theme definitions
- `src/App.jsx` - Theme provider

**How It Works:**

1. User clicks theme button in header
2. `ThemeSwitcher` calls `toggleTheme()` from store
3. Zustand updates state and persists to localStorage
4. `App.jsx` re-renders with new theme object
5. `ThemeProvider` propagates new theme to all styled components

```javascript
// ThemeSwitcher.jsx
const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <Button onClick={toggleTheme}>
      {theme === 'cyber' && <FaDesktop />}
      {theme === 'dark' && <FaMoon />}
      {theme === 'light' && <FaSun />}
    </Button>
  );
};
```

### Feature: Job Monitoring

**What It Does:** Real-time table of all evidence processing jobs with filtering.

**Key Files:**
- `src/components/monitoring/JobMonitorTable.jsx` - Main component
- `src/services/api.js` - API calls
- `src/pages/JobMonitorPage.jsx` - Page wrapper

**How It Works:**

1. Component mounts and fetches jobs via React Query
2. Auto-refresh every 5 seconds (configurable)
3. Filter dropdown updates local state
4. Filtered jobs rendered in table
5. Click job row navigates to detail page

```javascript
// JobMonitorTable.jsx lines 462-468
const { data: jobs, isLoading, error } = useQuery(
  ['jobs'],
  () => forensicAPI.getAllJobs(),
  {
    refetchInterval: autoRefresh ? 5000 : false,
  }
);
```

---

## 13. Third-Party Libraries

| Library | Version | Purpose | Why Chosen |
|---------|---------|---------|------------|
| `react` | 18.x | UI framework | Industry standard, large ecosystem |
| `react-dom` | 18.x | DOM rendering | Required for React web apps |
| `react-router-dom` | 6.x | Client routing | Declarative, nested routes |
| `styled-components` | 5.x | CSS-in-JS | Scoped styles, theming support |
| `zustand` | 4.x | State management | Simple, hooks-based, small bundle |
| `react-query` | 3.x | Server state | Auto-caching, refetch, devtools |
| `axios` | 1.x | HTTP client | Interceptors, request cancellation |
| `react-icons` | 4.x | Icon library | Large icon set, tree-shakeable |
| `react-toastify` | 9.x | Notifications | Easy to use, customizable |
| `react-dropzone` | 14.x | File upload | Drag-and-drop, validation |
| `date-fns` | 2.x | Date formatting | Modular, immutable |

---

## Appendix: Component Prop Reference

### ProtectedRoute
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | ReactNode | Yes | Content to render if authenticated |

### LoadingSpinner
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | "Processing forensic evidence..." | Loading message |

### SHA256Display
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `hash` | string | Yes | 64-character SHA-256 hash |
| `jobId` | string | No | Job reference for display |

### VerifyIntegrityButton
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `jobId` | string | Yes | Job ID to verify |
| `onVerifyComplete` | function | No | Callback with verification result |

### URLInput / FileUpload
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSubmit` | function | Yes | Callback with API response |
| `isLoading` | boolean | No | Disable form during submission |

---

*This documentation was generated for FEAS Frontend v1.0.0. For questions or updates, please contact the development team.*
