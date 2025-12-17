import { getAuthHeaders } from './auth';
import { env } from '@/config/env';

export interface User {
  _id: string;
  name: string;
  email: string;
  userType?: string;
  specialization?: string;
  degree?: string;
  institution?: string;
  connectionStatus?: {
    status: 'pending' | 'accepted' | 'rejected';
    isRequester: boolean;
    requestId: string;
  } | null;
}

export interface ConnectionRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    userType?: string;
    specialization?: string;
    degree?: string;
  };
  recipient: {
    _id: string;
    name: string;
    email: string;
    userType?: string;
    specialization?: string;
    degree?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  isRequester: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    email: string;
    userType?: string;
    specialization?: string;
    degree?: string;
  };
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const API_BASE_URL = `${env.apiUrl}/api/connections`;

/**
 * Get all users (for connection requests)
 */
export async function getAllUsers(searchQuery?: string): Promise<User[]> {
  const url = new URL(`${API_BASE_URL}/users`);
  if (searchQuery) {
    url.searchParams.append('search', searchQuery);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch users: ${response.status}`;
    try {
      const text = await response.text();
      // Check if it's an HTML error page (like 404 from Express)
      if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
        if (response.status === 404) {
          errorMessage = `Failed to fetch users: 404 - The endpoint /api/connections/users is not available. Please ensure the backend API is running and the endpoint is implemented.`;
        } else {
          errorMessage = `Failed to fetch users: ${response.status} - Server returned an error page`;
        }
      } else if (text) {
        errorMessage = `Failed to fetch users: ${response.status} ${text}`;
      }
    } catch (e) {
      // If we can't read the response, use the status
      errorMessage = `Failed to fetch users: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const apiResponse: ApiResponse<User[]> = await response.json();
  return apiResponse.data;
}

/**
 * Send a connection request
 */
export async function sendConnectionRequest(recipientId: string): Promise<ConnectionRequest> {
  const response = await fetch(`${API_BASE_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ recipientId }),
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to send connection request: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<ConnectionRequest> = await response.json();
  return apiResponse.data;
}

/**
 * Get connection requests (sent, received, or all)
 */
export async function getConnectionRequests(
  type: 'sent' | 'received' | 'all' = 'all'
): Promise<ConnectionRequest[]> {
  const url = new URL(`${API_BASE_URL}/requests`);
  if (type !== 'all') {
    url.searchParams.append('type', type);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to fetch connection requests: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<ConnectionRequest[]> = await response.json();
  return apiResponse.data;
}

/**
 * Accept or reject a connection request
 */
export async function updateConnectionRequest(
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<ConnectionRequest> {
  const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to update connection request: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<ConnectionRequest> = await response.json();
  return apiResponse.data;
}

/**
 * Get all accepted connections
 */
export async function getConnections(): Promise<Connection[]> {
  const response = await fetch(`${API_BASE_URL}/connections`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to fetch connections: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<Connection[]> = await response.json();
  return apiResponse.data;
}

/**
 * Cancel a connection request
 */
export async function cancelConnectionRequest(requestId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to cancel connection request: ${response.status} ${text}`);
  }
}

