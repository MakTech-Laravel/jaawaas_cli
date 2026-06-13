import { apiClient } from "./client"
import { formatDistanceToNow } from "date-fns"

// Types based on the ChatView component
export interface ChatParticipant {
  id: string
  name: string
  avatar?: string
  role: "buyer" | "manufacturer" | "admin"
  company?: string
  country?: string
}

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  timestamp: string
  isRead: boolean
  attachments?: string[]
}

export interface ChatConversation {
  id: string
  participants: ChatParticipant[]
  lastMessage?: ChatMessage
  unreadCount: number
  updatedAt: string
}

/**
 * Raw API Response Types
 */
interface ApiUser {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  company_name?: string
  country?: string
}

interface ApiConversation {
  id: number
  name: string | null
  created_by: number
  created_at: string
  updated_at: string
  is_unread: boolean
  last_message_sent_at: string | null
  creator: ApiUser
  participants: ApiUser[]
}

/**
 * Normalizes an API user to the frontend ChatParticipant type
 */
function normalizeParticipant(user: ApiUser): ChatParticipant {
  return {
    id: user.id.toString(),
    name: `${user.first_name} ${user.last_name}`.trim(),
    role: user.role as any,
    company: user.company_name,
    country: user.country
  }
}

/**
 * Normalizes an API conversation to the frontend ChatConversation type
 */
function normalizeConversation(conv: ApiConversation): ChatConversation {
  const lastActivity = conv.last_message_sent_at || conv.updated_at
  let formattedTime = "Recently"
  
  try {
    if (lastActivity) {
      formattedTime = formatDistanceToNow(new Date(lastActivity.replace(' ', 'T')), { addSuffix: true })
    }
  } catch (e) {
    console.error("Date formatting error:", e)
  }

  return {
    id: conv.id.toString(),
    participants: (conv.participants || []).map(normalizeParticipant),
    unreadCount: conv.is_unread ? 1 : 0,
    updatedAt: formattedTime,
    lastMessage: undefined 
  }
}

// Initialize from localStorage if available
function getStoredConversations(): ChatConversation[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mock_conversations')
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
  }
  return [
    {
      id: "conv-1",
      participants: [
        { id: "1", name: "TechVision Electronics", role: "manufacturer", company: "TechVision Electronics Co., Ltd." },
        { id: "buyer-1", name: "Current Buyer", role: "buyer" }
      ],
      unreadCount: 0,
      updatedAt: "2 hours ago",
      lastMessage: {
        id: "msg-1",
        senderId: "1",
        text: "Hello! We have received your inquiry. How can we help?",
        timestamp: "2 hours ago",
        isRead: true
      }
    }
  ]
}

function getStoredMessages(): Record<string, ChatMessage[]> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mock_messages')
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
  }
  return {
    "conv-1": [
      {
        id: "msg-1",
        senderId: "1",
        text: "Hello! We have received your inquiry. How can we help?",
        timestamp: "2 hours ago",
        isRead: true
      }
    ]
  }
}

let dummyConversations: ChatConversation[] = getStoredConversations();
let dummyMessages: Record<string, ChatMessage[]> = getStoredMessages();

function saveToStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_conversations', JSON.stringify(dummyConversations))
    localStorage.setItem('mock_messages', JSON.stringify(dummyMessages))
  }
}

/**
 * Fetch all conversations for the current user
 */
export async function getConversations(params?: Record<string, any>): Promise<ChatConversation[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Actively sync from localStorage to avoid SSR/HMR stale state
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mock_conversations')
      if (stored) dummyConversations = JSON.parse(stored)
    } catch (e) {}
  }

  return [...dummyConversations].sort((a, b) => {
    // Basic sorting so newest is first
    return a.updatedAt === "Just now" ? -1 : 1;
  });
}

/**
 * Create a new conversation
 */
export async function createConversation(participantIds: (string|number)[], name?: string): Promise<ChatConversation | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const id = `conv-${Date.now()}`;
  const conv: ChatConversation = {
    id,
    participants: participantIds.map(pid => ({
      id: pid.toString(),
      name: `User ${pid}`,
      role: pid.toString() === "buyer-1" ? "buyer" : "manufacturer"
    })),
    unreadCount: 0,
    updatedAt: "Just now",
  };
  
  dummyConversations = [conv, ...dummyConversations];
  dummyMessages[id] = [];
  saveToStorage();
  
  return conv;
}

/**
 * Fetch messages for a specific conversation
 */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mock_messages')
      if (stored) dummyMessages = JSON.parse(stored)
    } catch (e) {}
  }

  return dummyMessages[conversationId] || [];
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId: string, text: string, files?: File[]): Promise<ChatMessage | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const msg: ChatMessage = {
    id: `msg-${Date.now()}`,
    senderId: "buyer-1", // Assume current user is sending
    text,
    timestamp: "Just now",
    isRead: true,
  };
  
  if (!dummyMessages[conversationId]) {
    dummyMessages[conversationId] = [];
  }
  
  dummyMessages[conversationId] = [...dummyMessages[conversationId], msg];
  
  // Update conversation
  dummyConversations = dummyConversations.map(c => {
    if (c.id === conversationId) {
      return { ...c, lastMessage: msg, updatedAt: "Just now" };
    }
    return c;
  });
  
  saveToStorage();
  
  return msg;
}

/**
 * Mark a conversation as read
 */
export async function markAsRead(conversationId: string): Promise<boolean> {
  dummyConversations = dummyConversations.map(c => 
    c.id === conversationId ? { ...c, unreadCount: 0 } : c
  );
  saveToStorage();
  return true;
}
