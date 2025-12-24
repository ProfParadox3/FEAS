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
    0% {
      transform: rotate(0deg) scale(1);
    }
    50% {
      transform: rotate(180deg) scale(1.1);
    }
    100% {
      transform: rotate(360deg) scale(1);
    }
  }
`;

const SpinnerText = styled.div`
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 1rem;
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

export default LoadingSpinner;