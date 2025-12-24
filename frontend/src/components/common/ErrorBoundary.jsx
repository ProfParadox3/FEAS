import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.error}40;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.error};
  margin-bottom: 1.5rem;
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.error};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  margin-bottom: 1.5rem;
  max-width: 600px;
  line-height: 1.6;
`;

const ErrorDetails = styled.pre`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 1rem;
  margin: 1.5rem 0;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  text-align: left;
  max-width: 800px;
  overflow: auto;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.error};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: ${({ theme }) => theme.error}dd;
    transform: translateY(-2px);
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to your error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>
            <FaExclamationTriangle />
          </ErrorIcon>
          <ErrorTitle>SYSTEM ERROR DETECTED</ErrorTitle>
          <ErrorMessage>
            The forensic acquisition system encountered an unexpected error. 
            This incident has been logged for investigation.
          </ErrorMessage>
          
          {this.state.error && (
            <ErrorDetails>
              Error: {this.state.error.toString()}
              {this.state.errorInfo && `\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
            </ErrorDetails>
          )}
          
          <RetryButton onClick={this.handleRetry}>
            <FaRedo /> REINITIALIZE SYSTEM
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;