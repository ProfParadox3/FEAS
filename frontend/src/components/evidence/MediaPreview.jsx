import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaImage,
  FaVideo,
  FaMusic,
  FaFile
} from 'react-icons/fa';

const Container = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Icon = styled.div`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.primary};
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const MimeType = styled.span`
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  background: ${({ theme }) => theme.background};
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.cardBorder};
`;

const PreviewArea = styled.div`
  position: relative;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
`;

const VideoPlayer = styled.video`
  width: 100%;
  max-height: 600px;
  background: #000;
`;

const AudioPlayer = styled.div`
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const AudioVisualizer = styled.div`
  width: 100%;
  height: 100px;
  background: linear-gradient(180deg, 
    ${({ theme }) => theme.background} 0%, 
    ${({ theme }) => theme.cardBackground} 100%);
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  position: relative;
  overflow: hidden;
`;

const AudioControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
`;

const PlayButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.cardBackground};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 30px ${({ theme }) => theme.primary}40;
  }
`;

const ControlButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  color: ${({ theme }) => theme.text};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary}10;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: ${({ theme }) => theme.cardBorder};
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.primary};
  border-radius: 3px;
  width: ${({ progress }) => progress}%;
  transition: width 0.1s linear;
`;

const TimeDisplay = styled.div`
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  min-width: 100px;
  text-align: center;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 120px;
`;

const VolumeSlider = styled.input`
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: ${({ theme }) => theme.cardBorder};
  border-radius: 3px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.primary};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.primary};
    cursor: pointer;
    border: none;
  }
`;

const FullscreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const FullscreenControls = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${FullscreenOverlay}:hover & {
    opacity: 1;
  }
`;

const EmptyPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
  max-width: 300px;
`;

const MediaPreview = ({ fileUrl, mimeType, filename }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const mediaRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  const isAudio = mimeType.startsWith('audio/');
  
  const handlePlayPause = () => {
    if (isVideo || isAudio) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      setDuration(mediaRef.current.duration || 0);
    }
  };
  
  const handleProgressClick = (e) => {
    if (mediaRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      mediaRef.current.currentTime = percent * duration;
    }
  };
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
  };
  
  const handleVolumeToggle = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getMediaIcon = () => {
    if (isImage) return <FaImage />;
    if (isVideo) return <FaVideo />;
    if (isAudio) return <FaMusic />;
    return <FaFile />;
  };
  
  if (!fileUrl) {
    return (
      <Container>
        <Header>
          <TitleSection>
            <Icon>
              <FaImage />
            </Icon>
            <Title>Media Preview</Title>
          </TitleSection>
        </Header>
        
        <PreviewArea>
          <EmptyPreview>
            <EmptyIcon>
              <FaImage />
            </EmptyIcon>
            <EmptyText>No media available for preview</EmptyText>
          </EmptyPreview>
        </PreviewArea>
      </Container>
    );
  }
  
  if (isFullscreen) {
    return (
      <FullscreenOverlay onClick={() => setIsFullscreen(false)}>
        {isImage && (
          <ImagePreview 
            src={fileUrl} 
            alt={filename}
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
          />
        )}
        
        {isVideo && (
          <VideoPlayer
            ref={mediaRef}
            src={fileUrl}
            controls={false}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
          />
        )}
        
        {isAudio && (
          <AudioPlayer style={{ width: '80%', maxWidth: '600px' }}>
            <AudioVisualizer />
            <AudioControls>
              <PlayButton onClick={handlePlayPause}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </PlayButton>
              <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
              <ProgressBar ref={progressBarRef} onClick={handleProgressClick}>
                <ProgressFill progress={(currentTime / duration) * 100} />
              </ProgressBar>
              <TimeDisplay>{formatTime(duration)}</TimeDisplay>
              <ControlButton onClick={handleVolumeToggle}>
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </ControlButton>
              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </AudioControls>
          </AudioPlayer>
        )}
        
        <FullscreenControls>
          <ControlButton onClick={handleFullscreen}>
            <FaCompress />
          </ControlButton>
          {(isVideo || isAudio) && (
            <PlayButton onClick={handlePlayPause}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </PlayButton>
          )}
        </FullscreenControls>
      </FullscreenOverlay>
    );
  }
  
  return (
    <Container>
      <Header>
        <TitleSection>
          <Icon>
            {getMediaIcon()}
          </Icon>
          <Title>Media Preview</Title>
          <MimeType>{mimeType}</MimeType>
        </TitleSection>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(isVideo || isAudio) && (
            <ControlButton onClick={handlePlayPause}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </ControlButton>
          )}
          
          <ControlButton onClick={handleFullscreen}>
            <FaExpand />
          </ControlButton>
        </div>
      </Header>
      
      <PreviewArea>
        {isImage && (
          <ImagePreview 
            src={fileUrl} 
            alt={filename}
            onClick={handleFullscreen}
            style={{ cursor: 'pointer' }}
          />
        )}
        
        {isVideo && (
          <>
            <VideoPlayer
              ref={mediaRef}
              src={fileUrl}
              controls={false}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onClick={handlePlayPause}
              style={{ cursor: 'pointer' }}
            />
            
            <AudioControls style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '4px',
              opacity: isPlaying ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}>
              <PlayButton onClick={handlePlayPause} style={{ width: '40px', height: '40px' }}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </PlayButton>
              <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
              <ProgressBar ref={progressBarRef} onClick={handleProgressClick}>
                <ProgressFill progress={(currentTime / duration) * 100} />
              </ProgressBar>
              <TimeDisplay>{formatTime(duration)}</TimeDisplay>
              <ControlButton onClick={handleVolumeToggle} style={{ border: 'none' }}>
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </ControlButton>
              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{ width: '80px' }}
              />
            </AudioControls>
          </>
        )}
        
        {isAudio && (
          <AudioPlayer>
            <AudioVisualizer />
            <AudioControls>
              <PlayButton onClick={handlePlayPause}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </PlayButton>
              <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
              <ProgressBar ref={progressBarRef} onClick={handleProgressClick}>
                <ProgressFill progress={(currentTime / duration) * 100} />
              </ProgressBar>
              <TimeDisplay>{formatTime(duration)}</TimeDisplay>
              <ControlButton onClick={handleVolumeToggle}>
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </ControlButton>
              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </AudioControls>
          </AudioPlayer>
        )}
        
        {!isImage && !isVideo && !isAudio && (
          <EmptyPreview>
            <EmptyIcon>
              <FaFile />
            </EmptyIcon>
            <EmptyText>
              Preview not available for this file type
            </EmptyText>
          </EmptyPreview>
        )}
      </PreviewArea>
    </Container>
  );
};

export default MediaPreview;