import React from 'react';
import styled from 'styled-components';
import { 
  FaInfoCircle, 
  FaCamera, 
  FaVideo,
  FaMusic,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCog 
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
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
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

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ active, theme }) => active ? theme.primary : 'transparent'};
  color: ${({ active, theme }) => active ? theme.cardBackground : theme.text};
  border: none;
  border-bottom: 3px solid ${({ active, theme }) => active ? theme.primary : 'transparent'};
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.primary}20;
    color: ${({ theme }) => theme.primary};
  }
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const MetadataGroup = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 8px;
  padding: 1.25rem;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorder};
`;

const GroupIcon = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.primary};
`;

const GroupTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 500;
  flex: 1;
`;

const ItemValue = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  text-align: right;
  flex: 1;
  font-family: var(--font-mono);
  word-break: break-word;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.875rem;
`;

const MetadataTable = ({ metadata, type = 'image' }) => {
  const [activeTab, setActiveTab] = React.useState('basic');
  
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <FaInfoCircle /> },
    { id: 'exif', label: 'EXIF Data', icon: <FaCamera /> },
    { id: 'media', label: 'Media Info', icon: type === 'video' ? <FaVideo /> : <FaMusic /> },
    { id: 'platform', label: 'Platform', icon: <FaCog /> }
  ];
  
  const getIconForGroup = (groupId) => {
    switch(groupId) {
      case 'basic':
        return <FaInfoCircle />;
      case 'exif':
        return <FaCamera />;
      case 'media':
        return type === 'video' ? <FaVideo /> : <FaMusic />;
      case 'platform':
        return <FaCog />;
      default:
        return <FaInfoCircle />;
    }
  };
  
  const formatValue = (key, value) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    // Format dates
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }
    
    // Format GPS coordinates
    if (key.toLowerCase().includes('gps') || key.toLowerCase().includes('latitude') || key.toLowerCase().includes('longitude')) {
      return `${value}°`;
    }
    
    return String(value);
  };
  
  const getGroupedMetadata = () => {
    const groups = {
      basic: [],
      exif: [],
      media: [],
      platform: []
    };
    
    if (!metadata) return groups;
    
    // Basic info
    if (metadata.basic) {
      groups.basic = Object.entries(metadata.basic).map(([key, value]) => ({
        key,
        value: formatValue(key, value)
      }));
    }
    
    // EXIF data
    if (metadata.exif) {
      groups.exif = Object.entries(metadata.exif).slice(0, 20).map(([key, value]) => ({
        key,
        value: formatValue(key, value)
      }));
    }
    
    // Media info
    if (metadata.media) {
      // Flatten media data
      const mediaItems = [];
      Object.entries(metadata.media).forEach(([category, data]) => {
        if (typeof data === 'object') {
          Object.entries(data).forEach(([key, value]) => {
            mediaItems.push({
              key: `${category}.${key}`,
              value: formatValue(key, value)
            });
          });
        } else {
          mediaItems.push({
            key: category,
            value: formatValue(category, data)
          });
        }
      });
      groups.media = mediaItems.slice(0, 20);
    }
    
    // Platform info
    if (metadata.platform) {
      groups.platform = Object.entries(metadata.platform).map(([key, value]) => ({
        key,
        value: formatValue(key, value)
      }));
    }
    
    return groups;
  };
  
  const groupedMetadata = getGroupedMetadata();
  const activeMetadata = groupedMetadata[activeTab];
  
  const hasMetadata = Object.values(groupedMetadata).some(group => group.length > 0);
  
  if (!hasMetadata) {
    return (
      <Container>
        <Header>
          <Icon>
            <FaInfoCircle />
          </Icon>
          <Title>Metadata</Title>
        </Header>
        
        <EmptyState>
          <EmptyIcon>
            <FaInfoCircle />
          </EmptyIcon>
          <EmptyText>No metadata available for this evidence</EmptyText>
        </EmptyState>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Icon>
          <FaInfoCircle />
        </Icon>
        <Title>Metadata Analysis</Title>
      </Header>
      
      <Tabs>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Tab>
        ))}
      </Tabs>
      
      <MetadataGrid>
        {activeMetadata.map((item, index) => (
          <MetadataItem key={index}>
            <ItemLabel>{item.key}</ItemLabel>
            <ItemValue>{item.value}</ItemValue>
          </MetadataItem>
        ))}
        
        {activeTab === 'exif' && groupedMetadata.exif.length > 20 && (
          <MetadataItem>
            <ItemLabel>...</ItemLabel>
            <ItemValue>
              +{groupedMetadata.exif.length - 20} more EXIF fields
            </ItemValue>
          </MetadataItem>
        )}
      </MetadataGrid>
      
      {Object.keys(groupedMetadata).map(groupId => (
        groupedMetadata[groupId].length > 0 && groupId !== activeTab && (
          <MetadataGroup key={groupId} style={{ marginTop: '1.5rem' }}>
            <GroupHeader>
              <GroupIcon>
                {getIconForGroup(groupId)}
              </GroupIcon>
              <GroupTitle>
                {groupId.charAt(0).toUpperCase() + groupId.slice(1)} Metadata
              </GroupTitle>
            </GroupHeader>
            
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {groupedMetadata[groupId].slice(0, 5).map((item, index) => (
                <MetadataItem key={index}>
                  <ItemLabel>{item.key}</ItemLabel>
                  <ItemValue>{item.value}</ItemValue>
                </MetadataItem>
              ))}
              
              {groupedMetadata[groupId].length > 5 && (
                <MetadataItem>
                  <ItemLabel>...</ItemLabel>
                  <ItemValue>
                    +{groupedMetadata[groupId].length - 5} more items
                  </ItemValue>
                </MetadataItem>
              )}
            </div>
          </MetadataGroup>
        )
      ))}
    </Container>
  );
};

export default MetadataTable;