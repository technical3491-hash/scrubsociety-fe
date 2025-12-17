import { getAuthHeaders } from './auth';
import { env } from '@/config/env';

export interface Conversation {
  _id: string;
  otherParticipant: {
    _id: string;
    name: string;
    email: string;
    userType?: string;
    degree?: string;
    specialization?: string;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    senderName?: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  senderId: string;
  senderName?: string;
  content: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface CreateConversationParams {
  participantId: string;
}

export interface SendMessageParams {
  content: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const API_BASE_URL = `${env.apiUrl}/api/chat`;

/**
 * Get or create a conversation with a participant
 */
export async function getOrCreateConversation(
  participantId: string
): Promise<ConversationWithMessages> {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ participantId }),
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to get or create conversation: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<ConversationWithMessages> = await response.json();
  return apiResponse.data;
}

/**
 * Get all conversations for the current user
 */
export async function getUserConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to fetch conversations: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<Conversation[]> = await response.json();
  return apiResponse.data;
}

/**
 * Get a specific conversation with messages
 */
export async function getConversationById(
  conversationId: string
): Promise<ConversationWithMessages> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to fetch conversation: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<ConversationWithMessages> = await response.json();
  return apiResponse.data;
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to send message: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<Message> = await response.json();
  return apiResponse.data;
}

/**
 * Mark messages as read in a conversation
 */
export async function markMessagesAsRead(conversationId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to mark messages as read: ${response.status} ${text}`);
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to delete conversation: ${response.status} ${text}`);
  }
}

