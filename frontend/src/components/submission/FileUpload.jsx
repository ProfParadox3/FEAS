import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { 
  FaUpload, 
  FaFileImage, 
  FaFileVideo, 
  FaFileAudio,
  FaTimes,
  FaShieldAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { forensicAPI } from '../../services/api';

const Container = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
  
  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Hint = styled.span`
  font-size: 0.75rem;
  font-weight: 400;
  color: ${({ theme }) => theme.textSecondary};
  margin-left: auto;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const Textarea = styled.textarea`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const UploadArea = styled.div`
  border: 2px dashed ${({ theme, isDragActive }) =>
    isDragActive ? theme.primary : theme.cardBorder};
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${({ theme, isDragActive }) =>
    isDragActive ? `${theme.primary}10` : `${theme.cardBorder}10`};
  transition: all 0.2s ease;
  cursor: pointer;
`;


const UploadIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme, isDragActive }) => 
    isDragActive ? theme.primary : theme.textSecondary};
  margin-bottom: 1rem;
  transition: all 0.2s ease;
`;

const UploadText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const UploadHint = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.5;
`;

const FilePreview = styled.div`
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FileIcon = styled.div`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.primary};
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FileName = styled.div`
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const FileSize = styled.div`
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.error};
    background: ${({ theme }) => theme.error}10;
  }
`;

const ImagePreview = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: center;
  background: ${({ theme }) => theme.background};
  
  img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.cardBorder};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.error};
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.error}10;
  border: 1px solid ${({ theme }) => theme.error}20;
  border-radius: 4px;
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.cardBackground};
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px ${({ theme }) => theme.primary}40;
  }
`;

const Spinner = styled.div`
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const SecurityNotice = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.success}10;
  border: 1px solid ${({ theme }) => theme.success}20;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: ${({ theme }) => theme.success};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

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
        setError('File type not supported. Allowed: JPG, PNG, HEIC, MP4, MOV, AVI, MP3, WAV');
      }
      return;
    }
    
    const validatedFiles = acceptedFiles.map(file => {
      const preview = URL.createObjectURL(file);
      return {
        file,
        preview,
        type: file.type,
        size: file.size
      };
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
    maxSize: 500 * 1024 * 1024,
    multiple: false
  });

  const removeFile = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setError('');
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FaFileImage />;
    if (fileType.startsWith('video/')) return <FaFileVideo />;
    if (fileType.startsWith('audio/')) return <FaFileAudio />;
    return <FaFileImage />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!investigatorId.trim()) {
      setError('Investigator ID is required');
      return;
    }
    
    if (files.length === 0) {
      setError('Please select a file to upload');
      return;
    }
    
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', files[0].file);
      formData.append('investigator_id', investigatorId);
      if (caseNumber) formData.append('case_number', caseNumber);
      if (notes) formData.append('notes', notes);
      
      const response = await forensicAPI.submitUploadJob(formData);
      
      toast.success('Evidence upload job submitted successfully!');
      onSubmit(response);
      
      // Cleanup
      removeFile();
      setInvestigatorId('');
      setCaseNumber('');
      setNotes('');
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`);
      setError(err.message);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Local Forensic <span>Upload</span></Title>
        <Subtitle>Upload files from your device for forensic analysis</Subtitle>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label>
              <FaShieldAlt /> Investigator ID
              <Hint>Your unique identifier</Hint>
            </Label>
            <Input
              type="text"
              value={investigatorId}
              onChange={(e) => setInvestigatorId(e.target.value)}
              placeholder="e.g., INV-2023-001"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>
              <FaShieldAlt /> Case Number
              <Hint>Optional case reference</Hint>
            </Label>
            <Input
              type="text"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="e.g., CASE-2023-456"
            />
          </FormGroup>
        </FormRow>
        
        <FormGroup>
          <Label>Evidence File</Label>
          {files.length === 0 ? (
            <UploadArea {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
              <UploadIcon isDragActive={isDragActive}>
                <FaUpload />
              </UploadIcon>
              <UploadText>
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Drag & drop a file here, or click to select'}
              </UploadText>
              <UploadHint>
                Supports: JPG, PNG, HEIC, MP4, MOV, AVI, MP3, WAV
                <br />
                Max size: 500MB
              </UploadHint>
            </UploadArea>
          ) : (
            <FilePreview>
              <PreviewHeader>
                <FileInfo>
                  <FileIcon>
                    {getFileIcon(files[0].type)}
                  </FileIcon>
                  <FileDetails>
                    <FileName>{files[0].file.name}</FileName>
                    <FileSize>{formatFileSize(files[0].size)}</FileSize>
                  </FileDetails>
                </FileInfo>
                <RemoveButton
                  type="button"
                  onClick={removeFile}
                  aria-label="Remove file"
                >
                  <FaTimes />
                </RemoveButton>
              </PreviewHeader>
              
              {files[0].type.startsWith('image/') && (
                <ImagePreview>
                  <img
                    src={files[0].preview}
                    alt="Preview"
                    onLoad={() => URL.revokeObjectURL(files[0].preview)}
                  />
                </ImagePreview>
              )}
            </FilePreview>
          )}
          
          {error && (
            <ErrorMessage>
              <FaExclamationTriangle />
              {error}
            </ErrorMessage>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any relevant notes about this evidence..."
          />
        </FormGroup>
        
        <FormActions>
          <SubmitButton
            type="submit"
            disabled={isLoading || files.length === 0 || !investigatorId}
          >
            {isLoading ? (
              <>
                <Spinner />
                Processing Evidence...
              </>
            ) : (
              'Process Evidence'
            )}
          </SubmitButton>
        </FormActions>
        
        <SecurityNotice>
          <FaShieldAlt />
          <span>
            Security Notice: All processing occurs server-side.
            No file analysis is performed in your browser.
            SHA-256 hashing and metadata extraction are performed on secure servers.
          </span>
        </SecurityNotice>
      </Form>
    </Container>
  );
};

export default FileUpload;