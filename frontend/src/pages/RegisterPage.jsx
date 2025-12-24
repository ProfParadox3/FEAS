import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaFingerprint, FaBriefcase } from 'react-icons/fa';
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

const RegisterBox = styled.div`
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

const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid #10b981;
  color: #10b981;
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

const RegisterPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Analyst'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      setSuccess(true);
      login(response.user, response.access_token);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <RegisterBox>
        <Logo>
          <FaFingerprint />
        </Logo>
        <Title>Create Account</Title>
        <Subtitle>Join the Forensic Investigation Team</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>Account created successfully! Redirecting...</SuccessMessage>}
          
          <InputGroup>
            <Label>Full Name</Label>
            <InputWrapper>
              <FaUser />
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </InputGroup>
          
          <InputGroup>
            <Label>Email Address</Label>
            <InputWrapper>
              <FaEnvelope />
              <Input
                type="email"
                name="email"
                placeholder="investigator@agency.gov"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </InputGroup>
          
          <InputGroup>
            <Label>Role</Label>
            <InputWrapper>
              <FaBriefcase />
              <Input
                type="text"
                name="role"
                placeholder="Analyst, Investigator, etc."
                value={formData.role}
                onChange={handleChange}
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
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </InputGroup>
          
          <InputGroup>
            <Label>Confirm Password</Label>
            <InputWrapper>
              <FaLock />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </InputGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </Form>
        
        <FooterText>
          Already have an account? <Link to="/login">Login here</Link>
        </FooterText>
      </RegisterBox>
    </Container>
  );
};

export default RegisterPage;
