

export interface Suggestion {
  label: string;
  type: 'message' | 'action';
  payload: string; // Can be a message string or an action identifier e.g., 'ACTION_CLEAR_CHAT'
}

export interface GroundingSource {
    title: string;
    uri: string;
}

export interface Message {
  id: string;
  timestamp: number;
  sender: 'user' | 'ai';
  senderId?: string; // ID of the member who sent it
  senderName?: string; // Name of the sender, for groups
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  isLoading?: boolean;
  loadingText?: string;
  suggestions?: Suggestion[];
  groundingSources?: GroundingSource[];
  audioData?: string; // base64 encoded audio for TTS, or data URI for voice message
  isPlayingAudio?: boolean;
  duration?: number; // duration of audio in seconds
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  deletedForEveryone?: boolean;
  isDeleting?: boolean;
  replyTo?: {
    id: string;
    sender: string;
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    audioData?: boolean;
  };
}

export interface Member {
    id: string;
    name: string;
    avatarUrl: string;
    systemInstruction: string;
    isUser?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatarUrl: string;
  systemInstruction: string; // For 1-on-1 chats or as a default for groups
  messages: Message[];
  isGroup?: boolean;
  members?: Member[];
  lastResponderIndex?: number;
}

export interface StatusUpdate {
  id: string;
  type: 'text' | 'image';
  content: string;
  backgroundColor?: string;
  timestamp: number;
  viewed?: boolean;
  duration?: number;
}

export interface ContactStatus {
  contactId: string;
  contactName: string;

  contactAvatarUrl: string;
  updates: StatusUpdate[];
}

export interface Theme {
  name: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryLightest: string;
}

export interface Call {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatarUrl: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed' | 'declined';
  timestamp: number;
  duration?: number; // in seconds
}

export interface UserContact {
  id: string;
  name: string;
}

export const THEMES: Theme[] = [
    { name: 'Default Green', primary: '#008069', primaryDark: '#005c4b', primaryLight: '#00A884', primaryLightest: '#e6f2f0' },
    { name: 'Ocean Blue', primary: '#0077B6', primaryDark: '#005F9A', primaryLight: '#0096C7', primaryLightest: '#e0f7fa' },
    { name: 'Royal Purple', primary: '#6A0DAD', primaryDark: '#4B0082', primaryLight: '#800080', primaryLightest: '#f3e5f5' },
    { name: 'Sunset Orange', primary: '#E76F51', primaryDark: '#D05C4F',  primaryLight: '#F4A261', primaryLightest: '#fff3e0' },
    { name: 'Dark Teal', primary: '#075E54', primaryDark: '#064C42', primaryLight: '#087063', primaryLightest: '#e0f2f1' },
];