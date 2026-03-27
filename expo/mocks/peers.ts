import { Peer } from '@/types/mesh';
import { CORE_VALUES } from '@/constants/values';

const NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Iris', 'Jack', 'Kate', 'Leo', 'Maya', 'Noah', 'Olivia', 'Paul',
  'Quinn', 'Rose', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zane', 'Aria', 'Blake', 'Chloe', 'Dylan', 'Emma', 'Felix',
  'Gia', 'Hugo', 'Ivy', 'James', 'Kira', 'Liam', 'Mia', 'Nora',
  'Oscar', 'Piper', 'Quincy', 'Ruby', 'Sage', 'Tyler', 'Violet', 'Will',
  'Zara', 'Aiden', 'Bella', 'Cole', 'Daisy', 'Eli', 'Fiona', 'Gabe',
  'Hana', 'Ian', 'Julia', 'Kyle', 'Luna', 'Mason', 'Nina', 'Owen',
];

const TITLES = [
  'Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist',
  'Blockchain Developer', 'Marketing Director', 'Sales Executive', 'CTO',
  'Founder & CEO', 'Business Analyst', 'DevOps Engineer', 'Content Creator',
  'Financial Advisor', 'HR Manager', 'Legal Consultant', 'Strategy Lead',
  'Growth Hacker', 'AI Researcher', 'Security Specialist', 'Creative Director',
];

const COMPANIES = [
  'TechCorp', 'Innovate Labs', 'Digital Ventures', 'FutureStack',
  'MetaMesh', 'Decentralize Inc', 'CloudNine', 'DataFlow',
  'WebWeave', 'CryptoConnect', 'NeuralNet Co', 'BlockHub',
  'Freelancer', 'StartupX', 'Quantum Labs', 'SocialMesh',
];

const SAMPLE_MESSAGES = [
  'Hey! Saw we share similar interests. Would love to connect!',
  'Great to meet someone in the mesh network',
  'Looking forward to collaborating',
  'Interesting profile! Let\'s chat sometime',
  'Thanks for connecting!',
  'Would love to discuss opportunities',
];

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#FFD93D', '#6BCF7F',
  '#A8E6CF', '#FFB6B9', '#FEC8D8', '#957DAD', '#D291BC', '#F9A826',
  '#5DADE2', '#58D68D', '#F4D03F', '#EC7063', '#AF7AC5', '#5499C7',
  '#52BE80', '#F8B739', '#EB984E', '#85929E', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DFE6E9', '#FF7675', '#6C5CE7', '#FDCB6E', '#00B894',
];

function generateRandomPeers(count: number): Peer[] {
  const peers: Peer[] = [];
  const usedNames = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let name = NAMES[Math.floor(Math.random() * NAMES.length)];
    let uniqueName = name;
    let counter = 1;
    
    while (usedNames.has(uniqueName)) {
      uniqueName = `${name}${counter}`;
      counter++;
    }
    usedNames.add(uniqueName);
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 500;
    
    const numValues = 3;
    const shuffledValues = [...CORE_VALUES].sort(() => Math.random() - 0.5);
    const peerValues = shuffledValues.slice(0, numValues);
    
    const isConnected = i < 5;
    const isPending = !isConnected && i < 10;
    const hasMessage = isConnected && Math.random() > 0.3;
    
    peers.push({
      id: `peer-${i + 1}`,
      name: uniqueName,
      distance: Math.round(distance),
      signal: Math.round(40 + Math.random() * 60),
      lastSeen: new Date(),
      color: COLORS[i % COLORS.length],
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      values: peerValues,
      title: TITLES[Math.floor(Math.random() * TITLES.length)],
      company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
      connectionStatus: isConnected ? 'connected' : isPending ? 'pending' : 'new',
      lastMessage: hasMessage ? SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)] : undefined,
      lastMessageTime: hasMessage ? new Date(Date.now() - Math.random() * 86400000) : undefined,
      unreadCount: hasMessage && Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0,
    });
  }
  
  return peers;
}

export const MOCK_PEERS: Peer[] = generateRandomPeers(150);
