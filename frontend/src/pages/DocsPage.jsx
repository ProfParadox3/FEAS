import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaBook, 
  FaCode, 
  FaDatabase, 
  FaServer,
  FaLock,
  FaCopy,
  FaCheck,
  FaFileAlt,
  FaNetworkWired
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

const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
`;

const Tab = styled.button`
  background: transparent;
  border: none;
  color: ${({ active, theme }) => active ? theme.primary : theme.textSecondary};
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid ${({ active, theme }) => active ? theme.primary : 'transparent'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
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

const SubTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 1.5rem 0 1rem;
`;

const Text = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const CodeBlock = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  position: relative;
  overflow-x: auto;
  
  pre {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.text};
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

const CopyButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  
  th, td {
    text-align: left;
    padding: 0.75rem 1rem;
    border: 1px solid ${({ theme }) => theme.cardBorder};
    font-size: 0.875rem;
  }
  
  th {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-weight: 600;
  }
  
  td {
    color: ${({ theme }) => theme.textSecondary};
  }
  
  code {
    background: ${({ theme }) => theme.background};
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.primary};
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ type }) => 
    type === 'GET' ? '#10b981' : 
    type === 'POST' ? '#3b82f6' : 
    type === 'DELETE' ? '#ef4444' : 
    '#f59e0b'};
  color: white;
`;

const EndpointCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const EndpointHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const EndpointPath = styled.code`
  color: ${({ theme }) => theme.text};
  font-family: monospace;
  font-size: 0.875rem;
`;

const EndpointDesc = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
  margin: 0;
`;

const DocsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      // Fallback for browsers without clipboard API support
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy text:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const endpoints = [
    { method: 'POST', path: '/api/v1/jobs/upload', desc: 'Upload local file for forensic acquisition' },
    { method: 'POST', path: '/api/v1/jobs/url', desc: 'Submit URL for web content acquisition' },
    { method: 'GET', path: '/api/v1/jobs', desc: 'List all acquisition jobs' },
    { method: 'GET', path: '/api/v1/jobs/{job_id}/status', desc: 'Get job status by ID' },
    { method: 'GET', path: '/api/v1/jobs/{job_id}/details', desc: 'Get detailed job information' },
    { method: 'GET', path: '/api/v1/jobs/{job_id}/report', desc: 'Download forensic report PDF' },
    { method: 'POST', path: '/api/v1/jobs/{job_id}/verify', desc: 'Verify evidence integrity' },
    { method: 'GET', path: '/api/v1/analytics', desc: 'Get system analytics and statistics' },
    { method: 'POST', path: '/api/v1/auth/login', desc: 'Authenticate user and get token' },
    { method: 'POST', path: '/api/v1/auth/register', desc: 'Register new user account' },
    { method: 'GET', path: '/api/v1/profile', desc: 'Get current user profile' },
    { method: 'PUT', path: '/api/v1/profile', desc: 'Update user profile' }
  ];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FaBook /> API <span>Documentation</span>
        </PageTitle>
        <PageDescription>
          Technical documentation and API reference for the Forensic Evidence Acquisition System
        </PageDescription>
      </PageHeader>

      <TabsContainer>
        <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          <FaFileAlt /> Overview
        </Tab>
        <Tab active={activeTab === 'api'} onClick={() => setActiveTab('api')}>
          <FaCode /> API Reference
        </Tab>
        <Tab active={activeTab === 'database'} onClick={() => setActiveTab('database')}>
          <FaDatabase /> Data Models
        </Tab>
        <Tab active={activeTab === 'architecture'} onClick={() => setActiveTab('architecture')}>
          <FaNetworkWired /> Architecture
        </Tab>
      </TabsContainer>

      {activeTab === 'overview' && (
        <>
          <Section>
            <SectionTitle>
              <FaServer /> System Overview
            </SectionTitle>
            <Text>
              FEAS (Forensic Evidence Acquisition System) is a comprehensive platform for acquiring, 
              managing, and verifying digital evidence. It provides automated evidence collection from 
              various sources while maintaining a complete chain of custody.
            </Text>
            
            <SubTitle>Key Features</SubTitle>
            <Table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Evidence Acquisition</td>
                  <td>Upload files or acquire from URLs (Twitter, YouTube)</td>
                </tr>
                <tr>
                  <td>Hash Verification</td>
                  <td>SHA-256 hashing for integrity verification</td>
                </tr>
                <tr>
                  <td>Chain of Custody</td>
                  <td>Immutable logging of all evidence operations</td>
                </tr>
                <tr>
                  <td>Metadata Extraction</td>
                  <td>EXIF, media info, and file metadata extraction</td>
                </tr>
                <tr>
                  <td>Report Generation</td>
                  <td>Professional PDF reports for legal proceedings</td>
                </tr>
              </tbody>
            </Table>
          </Section>

          <Section>
            <SectionTitle>
              <FaLock /> Authentication
            </SectionTitle>
            <Text>
              FEAS uses JWT (JSON Web Token) based authentication. All API requests (except login/register) 
              require a valid access token in the Authorization header.
            </Text>
            
            <CodeBlock>
              <CopyButton onClick={() => copyToClipboard('Authorization: Bearer <your_token>', 0)}>
                {copiedIndex === 0 ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
              </CopyButton>
              <pre>Authorization: Bearer {'<your_token>'}</pre>
            </CodeBlock>
            
            <SubTitle>Token Lifecycle</SubTitle>
            <Table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Token Type</td>
                  <td>JWT (HS256)</td>
                </tr>
                <tr>
                  <td>Expiration</td>
                  <td>8 days (configurable)</td>
                </tr>
                <tr>
                  <td>Refresh</td>
                  <td>Re-authenticate to get new token</td>
                </tr>
              </tbody>
            </Table>
          </Section>
        </>
      )}

      {activeTab === 'api' && (
        <>
          <Section>
            <SectionTitle>
              <FaCode /> API Endpoints
            </SectionTitle>
            <Text>
              Base URL: <code>{'{YOUR_API_URL}'}/api/v1</code> (default: <code>http://localhost:8000/api/v1</code>)
            </Text>
            
            {endpoints.map((ep, index) => (
              <EndpointCard key={index}>
                <EndpointHeader>
                  <Badge type={ep.method}>{ep.method}</Badge>
                  <EndpointPath>{ep.path}</EndpointPath>
                </EndpointHeader>
                <EndpointDesc>{ep.desc}</EndpointDesc>
              </EndpointCard>
            ))}
          </Section>

          <Section>
            <SectionTitle>
              <FaCode /> Example: Upload File
            </SectionTitle>
            <CodeBlock>
              <CopyButton onClick={() => copyToClipboard(`curl -X POST "{YOUR_API_URL}/api/v1/jobs/upload" \\
  -H "Authorization: Bearer <token>" \\
  -F "file=@evidence.jpg" \\
  -F "investigator_id=INV001" \\
  -F "case_number=CASE-2024-001"`, 1)}>
                {copiedIndex === 1 ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
              </CopyButton>
              <pre>{`curl -X POST "{YOUR_API_URL}/api/v1/jobs/upload" \\
  -H "Authorization: Bearer <token>" \\
  -F "file=@evidence.jpg" \\
  -F "investigator_id=INV001" \\
  -F "case_number=CASE-2024-001"`}</pre>
            </CodeBlock>
            
            <SubTitle>Response</SubTitle>
            <CodeBlock>
              <pre>{`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "source": "local_upload",
  "filename": "evidence.jpg",
  "created_at": "2024-01-15T10:30:00Z"
}`}</pre>
            </CodeBlock>
          </Section>

          <Section>
            <SectionTitle>
              <FaCode /> Example: URL Acquisition
            </SectionTitle>
            <CodeBlock>
              <CopyButton onClick={() => copyToClipboard(`curl -X POST "{YOUR_API_URL}/api/v1/jobs/url" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://twitter.com/user/status/123", "investigator_id": "INV001"}'`, 2)}>
                {copiedIndex === 2 ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
              </CopyButton>
              <pre>{`curl -X POST "{YOUR_API_URL}/api/v1/jobs/url" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://twitter.com/user/status/123", "investigator_id": "INV001"}'`}</pre>
            </CodeBlock>
          </Section>
        </>
      )}

      {activeTab === 'database' && (
        <>
          <Section>
            <SectionTitle>
              <FaDatabase /> Job Model
            </SectionTitle>
            <Table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>id</code></td>
                  <td>UUID</td>
                  <td>Unique job identifier</td>
                </tr>
                <tr>
                  <td><code>status</code></td>
                  <td>String</td>
                  <td>pending, processing, completed, failed</td>
                </tr>
                <tr>
                  <td><code>source</code></td>
                  <td>String</td>
                  <td>local_upload or url</td>
                </tr>
                <tr>
                  <td><code>filename</code></td>
                  <td>String</td>
                  <td>Original filename</td>
                </tr>
                <tr>
                  <td><code>sha256_hash</code></td>
                  <td>String</td>
                  <td>SHA-256 hash of evidence</td>
                </tr>
                <tr>
                  <td><code>investigator_id</code></td>
                  <td>String</td>
                  <td>ID of the investigator</td>
                </tr>
                <tr>
                  <td><code>case_number</code></td>
                  <td>String</td>
                  <td>Case reference number</td>
                </tr>
                <tr>
                  <td><code>created_at</code></td>
                  <td>DateTime</td>
                  <td>Job creation timestamp</td>
                </tr>
              </tbody>
            </Table>
          </Section>

          <Section>
            <SectionTitle>
              <FaDatabase /> Chain of Custody Model
            </SectionTitle>
            <Table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>id</code></td>
                  <td>Integer</td>
                  <td>Log entry ID</td>
                </tr>
                <tr>
                  <td><code>job_id</code></td>
                  <td>UUID</td>
                  <td>Reference to job</td>
                </tr>
                <tr>
                  <td><code>event</code></td>
                  <td>String</td>
                  <td>Event type (ACQUISITION, VERIFICATION, etc.)</td>
                </tr>
                <tr>
                  <td><code>timestamp</code></td>
                  <td>DateTime</td>
                  <td>Event timestamp</td>
                </tr>
                <tr>
                  <td><code>investigator_id</code></td>
                  <td>String</td>
                  <td>Who performed the action</td>
                </tr>
                <tr>
                  <td><code>details</code></td>
                  <td>JSON</td>
                  <td>Additional event details</td>
                </tr>
              </tbody>
            </Table>
          </Section>
        </>
      )}

      {activeTab === 'architecture' && (
        <>
          <Section>
            <SectionTitle>
              <FaNetworkWired /> System Architecture
            </SectionTitle>
            <Text>
              FEAS follows a modern microservices architecture with the following components:
            </Text>
            
            <Table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Technology</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Frontend</td>
                  <td>React, styled-components</td>
                  <td>User interface and experience</td>
                </tr>
                <tr>
                  <td>Backend API</td>
                  <td>FastAPI (Python)</td>
                  <td>REST API and business logic</td>
                </tr>
                <tr>
                  <td>Task Queue</td>
                  <td>Celery</td>
                  <td>Background job processing</td>
                </tr>
                <tr>
                  <td>Message Broker</td>
                  <td>Redis</td>
                  <td>Task queue messaging</td>
                </tr>
                <tr>
                  <td>Database</td>
                  <td>PostgreSQL</td>
                  <td>Data persistence</td>
                </tr>
                <tr>
                  <td>Storage</td>
                  <td>Local/S3</td>
                  <td>Evidence file storage</td>
                </tr>
              </tbody>
            </Table>
          </Section>

          <Section>
            <SectionTitle>
              <FaServer /> Running Services
            </SectionTitle>
            <Text>
              To run FEAS locally, you need to start the following services:
            </Text>
            
            <SubTitle>1. Start Redis</SubTitle>
            <CodeBlock>
              <CopyButton onClick={() => copyToClipboard('redis-server', 3)}>
                {copiedIndex === 3 ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
              </CopyButton>
              <pre>redis-server</pre>
            </CodeBlock>
            
            <SubTitle>2. Start PostgreSQL</SubTitle>
            <CodeBlock>
              <CopyButton onClick={() => copyToClipboard('sudo systemctl start postgresql', 4)}>
                {copiedIndex === 4 ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
              </CopyButton>
              <pre>sudo systemctl start postgresql</pre>
            </CodeBlock>
            
            <SubTitle>3. Start Celery Worker</SubTitle>
            <CodeBlock>
              <CopyButton onClick={() => copyToClipboard('celery -A app.workers.celery_app worker --loglevel=info', 5)}>
                {copiedIndex === 5 ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
              </CopyButton>
              <pre>celery -A app.workers.celery_app worker --loglevel=info</pre>
            </CodeBlock>
            
            <SubTitle>4. Start Backend API</SubTitle>
            <CodeBlock>
              <CopyButton onClick={() => copyToClipboard('uvicorn app.main:app --reload', 6)}>
                {copiedIndex === 6 ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
              </CopyButton>
              <pre>uvicorn app.main:app --reload</pre>
            </CodeBlock>
            
            <SubTitle>5. Start Frontend</SubTitle>
            <CodeBlock>
              <CopyButton onClick={() => copyToClipboard('npm start', 7)}>
                {copiedIndex === 7 ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
              </CopyButton>
              <pre>npm start</pre>
            </CodeBlock>
          </Section>
        </>
      )}
    </PageContainer>
  );
};

export default DocsPage;
