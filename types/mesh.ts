export interface Peer {
  id: string;
  name: string;
  distance: number;
  signal: number;
  lastSeen: Date;
  color: string;
  x: number;
  y: number;
  values: string[];
  title?: string;
  company?: string;
  bio?: string;
  connectionStatus: 'connected' | 'pending' | 'new';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  hops: number;
  peerId?: string;
}

export interface Conversation {
  peerId: string;
  messages: Message[];
}
