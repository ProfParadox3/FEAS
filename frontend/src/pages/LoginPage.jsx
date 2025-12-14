import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaFingerprint } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background};
  padding: 2rem;
`;

const LoginBox = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 16px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  svg {
    font-size: 4rem;
    color: ${({ theme }) => theme.primary};
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  
  &:focus-within {
    border-color: ${({ theme }) => theme.primary};
  }
  
  svg {
    color: ${({ theme }) => theme.textSecondary};
    margin-right: 0.75rem;
  }
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const FooterText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 1.5rem;
  font-size: 0.875rem;
  
  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

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
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginBox>
        <Logo>
          <FaFingerprint />
        </Logo>
        <Title>FEAS Login</Title>
        <Subtitle>Forensic Evidence Acquisition System</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <InputGroup>
            <Label>Email Address</Label>
            <InputWrapper>
              <FaUser />
              <Input
                type="email"
                placeholder="investigator@agency.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputWrapper>
          </InputGroup>
          
          <InputGroup>
            <Label>Password</Label>
            <InputWrapper>
              <FaLock />
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputWrapper>
          </InputGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
        
        <FooterText>
          Don't have an account? <Link to="/register">Register here</Link>
        </FooterText>
      </LoginBox>
    </Container>
  );
};

export default LoginPage;
