import React from 'react';
import styled from 'styled-components';
import { FaTools } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
`;

const Icon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1.5rem;
  opacity: 0.5;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
`;

const PlaceholderPage = ({ title }) => {
  return (
    <Container>
      <Icon><FaTools /></Icon>
      <Title>{title}</Title>
      <p>This module is currently under development.</p>
    </Container>
  );
};

export default PlaceholderPage;
