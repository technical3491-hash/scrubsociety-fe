import { env } from '@/config/env';
import { apiRequest } from '../queryClient';
import { getAuthHeaders, getAuthToken } from './auth';

export interface Case {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  timeAgo?: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  image?: string;
}

export interface GetCasesParams {
  filter?: string;
  page?: number;
  limit?: number;
  userId?: string;
}

export interface GetCasesResponse {
  cases: Case[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * API response structure from backend
 */
interface ApiCaseResponse {
  _id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  timeAgo?: string;
  title: string;
  content: string;
  tags: string[];
  likes?: number;
  comments?: number;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  photos?: string[];
}

interface ApiGetCasesResponse {
  success: boolean;
  data: ApiCaseResponse[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

interface ApiLikeResponse {
  success?: boolean;
  data?: {
    likes: number;
    liked: boolean;
  };
  likes?: number;
  liked?: boolean;
}

interface ApiCommentResponse {
  _id?: string;
  id?: string;
  userId?: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    avatar?: string;
    profilePicture?: string;
  };
  userName?: string;
  userAvatar?: string;
  content?: string;
  text?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiCommentsResponse {
  success?: boolean;
  data?: ApiCommentResponse[];
  comments?: ApiCommentResponse[];
}

/**
 * Transform API case response to Case interface
 */
function transformApiCase(apiCase: ApiCaseResponse): Case {
  // Construct full image URL if image path is provided
  let imageUrl: string | undefined;
  if (apiCase.image) {
    // If it's already a full URL, use it as is
    if (apiCase.image.startsWith('http://') || apiCase.image.startsWith('https://')) {
      imageUrl = apiCase.image;
    } else {
      // Otherwise, construct the full URL with the API base URL
      const baseUrl = 'http://localhost:3001';
      imageUrl = `${baseUrl}${apiCase.image.startsWith('/') ? '' : '/'}${apiCase.image}`;
    }
  }
  
  // Extract likes and comments, handling different response formats
  const likes = (apiCase as any).likes ?? apiCase.likes ?? 0;
  const comments = (apiCase as any).comments ?? apiCase.comments ?? 0;
  
  return {
    id: apiCase._id,
    doctorName: apiCase.doctorName || (apiCase as any).username || 'Unknown User',
    doctorSpecialty: apiCase.doctorSpecialty || (apiCase as any).specialty || 'Unknown Specialty',
    doctorAvatar: apiCase.doctorAvatar,
    timeAgo: apiCase.timeAgo,
    title: apiCase.title || 'Untitled Case',
    content: apiCase.content || '',
    tags: apiCase.tags || [],
    likes: typeof likes === 'number' ? likes : 0,
    comments: typeof comments === 'number' ? comments : 0,
    image: imageUrl,
  };
}

/**
 * Fetch cases from the API
 */
export async function getCases(params: GetCasesParams = {}): Promise<GetCasesResponse> {
  const { filter, page = 1, limit = 10 } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (filter && filter !== 'all') {
    queryParams.append('specialty', filter);
  }
  
  if (params.userId) {
    queryParams.append('userId', params.userId);
  }
  
  const url = `http://localhost:3001/api/case-disc?${queryParams.toString()}`;
  // const url = `${env.apiUrl}/api/cases?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to fetch cases: ${response.status} ${text}`);
  }

  const apiResponse: ApiGetCasesResponse = await response.json();
  
  // Transform the API response to match expected structure
  if (apiResponse.success && Array.isArray(apiResponse.data)) {
    const cases = apiResponse.data.map(transformApiCase);
    const total = apiResponse.total ?? cases.length;
    const hasMore = apiResponse.hasMore ?? (cases.length >= limit);
    
    return {
      cases,
      total,
      page: apiResponse.page ?? page,
      limit: apiResponse.limit ?? limit,
      hasMore,
    };
  }
  
  // Fallback if response structure is unexpected
  throw new Error('Invalid API response structure');
}

/**
 * Get a single case by ID
 */
export async function getCaseById(id: string): Promise<Case> {
  const url = `http://localhost:3001/api/case-disc/${id}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to fetch case: ${response.status} ${text}`);
  }

  const apiResponse: { success: boolean; data: ApiCaseResponse } = await response.json();
  
  if (apiResponse.success && apiResponse.data) {
    return transformApiCase(apiResponse.data);
  }
  
  throw new Error('Invalid API response structure');
}

export interface CaseFormData {
  doctorName?: string;
  doctorSpecialty?: string;
  timeAgo?: string;
  title?: string;
  content?: string;
  tags?: string[];
  likes?: number;
  comments?: number;
  image?: File | string;
}

// For backwards compatibility, type aliases can be used if needed
export type CreateCaseData = CaseFormData;
export type UpdateCaseData = CaseFormData;

/**
 * Create a new case
 */
export async function createCase(data: CaseFormData): Promise<Case> {
  // Validate required fields according to backend schema
  if (!data.title || !data.content) {
    throw new Error('Title and content are required');
  }
  
  const url = `http://localhost:3001/api/case-disc`;
  // const url = `${env.apiUrl}/api/cases`;
  
  // If image is present, use FormData; otherwise use JSON
  const hasImage = data.image instanceof File;
  
  let body: FormData | string;
  let headers: HeadersInit;
  
  if (hasImage && data.image) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    formData.append('image', data.image);
    
    body = formData;
    // Don't set Content-Type for FormData - browser will set it with boundary
    const token = getAuthToken();
    headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    body = JSON.stringify(data);
    headers = getAuthHeaders();
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body,
  });

  if (!response.ok) {
    let errorMessage = `Failed to create case: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    }
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  const apiResponse: { success: boolean; data: ApiCaseResponse } = await response.json();
  
  if (apiResponse.success && apiResponse.data) {
    return transformApiCase(apiResponse.data);
  }
  
  throw new Error('Invalid API response structure');
}

/**
 * Update an existing case
 */
export async function updateCase(id: string, data: CaseFormData): Promise<Case> {
  const url = `http://localhost:3001/api/case-disc/${id}`;
  // const url = `${env.apiUrl}/api/cases/${id}`;
  
  // If image is present, use FormData; otherwise use JSON
  const hasImage = data.image instanceof File;
  
  let body: FormData | string;
  let headers: HeadersInit;
  
  if (hasImage && data.image) {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    formData.append('image', data.image);
    
    body = formData;
    // Don't set Content-Type for FormData - browser will set it with boundary
    const token = getAuthToken();
    headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    body = JSON.stringify(data);
    headers = getAuthHeaders();
  }
  
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body,
  });

  if (!response.ok) {
    let errorMessage = `Failed to update case: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    }
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  const apiResponse: { success: boolean; data: ApiCaseResponse } = await response.json();
  
  if (apiResponse.success && apiResponse.data) {
    return transformApiCase(apiResponse.data);
  }
  
  throw new Error('Invalid API response structure');
}

/**
 * Delete a case
 */
export async function deleteCase(id: string): Promise<void> {
  const url = `http://localhost:3001/api/case-disc/${id}`;
  // const url = `${env.apiUrl}/api/cases/${id}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to delete case: ${response.status} ${text}`);
  }
}

/**
 * Like or unlike a case
 */
export async function toggleLike(caseId: string): Promise<{ likes: number; liked: boolean }> {
  const url = `http://localhost:3001/api/case-disc/${caseId}/like`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMessage = `Failed to toggle like: ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = text;
        }
      }
    } catch {
      // If we can't read the response, use status text
      errorMessage = response.statusText || errorMessage;
    }
    const error = new Error(errorMessage);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const responseText = await response.text();
  let apiResponse: ApiLikeResponse;
  try {
    apiResponse = JSON.parse(responseText);
  } catch {
    throw new Error('Invalid JSON response from server');
  }
  // Handle different response formats
  const responseData = apiResponse.data || apiResponse;
  return {
    likes: responseData.likes ?? apiResponse.likes ?? 0,
    liked: responseData.liked ?? apiResponse.liked ?? false,
  };
}

/**
 * Get like status for a case
 */
export async function getLikeStatus(caseId: string): Promise<{ likes: number; liked: boolean }> {
  const url = `http://localhost:3001/api/case-disc/${caseId}/like`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  // Return default values for unauthenticated users
  if (response.status === 401 || response.status === 403) {
    return { likes: 0, liked: false };
  }

  if (!response.ok) {
    let errorMessage = `Failed to get like status: ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = text;
        }
      }
    } catch {
      // If we can't read the response, use status text
      errorMessage = response.statusText || errorMessage;
    }
    const error = new Error(errorMessage);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const responseText = await response.text();
  let apiResponse: ApiLikeResponse;
  try {
    apiResponse = JSON.parse(responseText);
  } catch {
    throw new Error('Invalid JSON response from server');
  }
  // Handle different response formats
  const responseData = apiResponse.data || apiResponse;
  return {
    likes: responseData.likes ?? apiResponse.likes ?? 0,
    liked: responseData.liked ?? apiResponse.liked ?? false,
  };
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentData {
  content: string;
}

/**
 * Get comments for a case
 */
export async function getComments(caseId: string): Promise<Comment[]> {
  const url = `http://localhost:3001/api/case-disc/${caseId}/comments`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  // Return empty array for unauthenticated users
  if (response.status === 401 || response.status === 403) {
    return [];
  }

  if (!response.ok) {
    let errorMessage = `Failed to get comments: ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = text;
        }
      }
    } catch {
      // If we can't read the response, use status text
      errorMessage = response.statusText || errorMessage;
    }
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  const responseText = await response.text();
  let apiResponse: ApiCommentsResponse | ApiCommentResponse[];
  try {
    apiResponse = JSON.parse(responseText);
  } catch {
    throw new Error('Invalid JSON response from server');
  }
  // Handle different response formats
  const comments = Array.isArray(apiResponse) 
    ? apiResponse 
    : (apiResponse.data || apiResponse.comments || []);
  
  // Ensure each comment has required fields
  return comments.map((comment: ApiCommentResponse) => ({
    id: comment._id || comment.id || '',
    userId: comment.userId || comment.user?._id || comment.user?.id || '',
    userName: comment.userName || comment.user?.name || comment.user?.username || 'Unknown User',
    userAvatar: comment.userAvatar || comment.user?.avatar || comment.user?.profilePicture,
    content: comment.content || comment.text || '',
    createdAt: comment.createdAt || comment.created_at || new Date().toISOString(),
    updatedAt: comment.updatedAt || comment.updated_at,
  }));
}

/**
 * Add a comment to a case
 */
export async function addComment(caseId: string, data: CommentData): Promise<Comment> {
  const url = `http://localhost:3001/api/case-disc/${caseId}/comments`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to add comment: ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = text;
        }
      }
    } catch {
      // If we can't read the response, use status text
      errorMessage = response.statusText || errorMessage;
    }
    const error = new Error(errorMessage);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const responseText = await response.text();
  let apiResponse: ApiCommentResponse | { data?: ApiCommentResponse; comment?: ApiCommentResponse };
  try {
    apiResponse = JSON.parse(responseText);
  } catch {
    throw new Error('Invalid JSON response from server');
  }
  // Handle different response formats
  const comment = (apiResponse as { data?: ApiCommentResponse; comment?: ApiCommentResponse }).data 
    || (apiResponse as { data?: ApiCommentResponse; comment?: ApiCommentResponse }).comment 
    || (apiResponse as ApiCommentResponse);
  
  // Ensure the comment has required fields
  return {
    id: comment._id || comment.id || '',
    userId: comment.userId || comment.user?._id || comment.user?.id || '',
    userName: comment.userName || comment.user?.name || comment.user?.username || 'Unknown User',
    userAvatar: comment.userAvatar || comment.user?.avatar || comment.user?.profilePicture,
    content: comment.content || comment.text || data.content,
    createdAt: comment.createdAt || comment.created_at || new Date().toISOString(),
    updatedAt: comment.updatedAt || comment.updated_at,
  };
}

