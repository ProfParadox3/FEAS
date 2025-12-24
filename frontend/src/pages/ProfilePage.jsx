import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaBriefcase, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { profileAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  font-weight: 700;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const Name = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
`;

const Role = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0.5rem;
`;

const Email = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const Input = styled.input`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  background: ${({ variant, theme }) => variant === 'secondary' ? 'transparent' : theme.primary};
  color: ${({ variant, theme }) => variant === 'secondary' ? theme.text : 'white'};
  border: 1px solid ${({ variant, theme }) => variant === 'secondary' ? theme.cardBorder : theme.primary};
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.primary};
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const Message = styled.div`
  background: ${({ type }) => type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${({ type }) => type === 'success' ? '#10b981' : '#ef4444'};
  color: ${({ type }) => type === 'success' ? '#10b981' : '#ef4444'};
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    bio: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileAPI.getProfile();
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        role: profile.role || '',
        bio: profile.bio || ''
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Use user data from auth store as fallback
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          bio: user.bio || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await profileAPI.updateProfile(formData);
      updateUser(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfile();
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  const initials = formData.name
    .split(' ')
    .filter(n => n)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Container>
      <Header>
        <Avatar>{initials}</Avatar>
        <HeaderInfo>
          <Name>{formData.name}</Name>
          <Role>{formData.role}</Role>
          <Email>
            <FaEnvelope />
            {formData.email}
          </Email>
        </HeaderInfo>
      </Header>

      <Card>
        <CardTitle>
          Profile Information
          {!editing && (
            <IconButton onClick={() => setEditing(true)}>
              <FaEdit />
            </IconButton>
          )}
        </CardTitle>

        {message.text && (
          <Message type={message.type}>{message.text}</Message>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Full Name</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              disabled={true}
              title="Email cannot be changed"
            />
          </InputGroup>

          <InputGroup>
            <Label>Role / Title</Label>
            <Input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Bio</Label>
            <TextArea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Tell us about yourself..."
            />
          </InputGroup>

          {editing && (
            <ButtonGroup>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                <FaTimes />
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <FaSave />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </ButtonGroup>
          )}
        </Form>
      </Card>
    </Container>
  );
};

export default ProfilePage;
