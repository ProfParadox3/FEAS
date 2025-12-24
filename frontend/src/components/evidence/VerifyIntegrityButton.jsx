import React, { useState } from 'react';
import styled from 'styled-components';
import { FaShieldAlt, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { forensicAPI } from '../../services/api';

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-mono);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.primary}20;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

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

export default VerifyIntegrityButton;
