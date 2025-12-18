import { env } from '@/config/env';

export interface LoginCredentials {
  email: string;
  password: string;
}

export type UserType = 'student' | 'doctor' | 'pharmacist' | 'nurse' | 'therapist' | 'researcher' | 'other';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  userType: UserType;
  specialization?: string;
  degree: string;
  licenseNo?: string;
  institution?: string;
  yearOfStudy?: string;
  pharmacyName?: string;
  experience?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string;
    userType?: UserType;
    specialization?: string;
    degree?: string;
    licenseNo?: string;
    institution?: string;
    yearOfStudy?: string;
    pharmacyName?: string;
    experience?: string;
  };
  token?: string;
  message?: string;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required');
  }

  const url = `${env.apiUrl}/api/users/login`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    const error: AuthError = {
      message: errorData.message || `Login failed: ${response.status}`,
      errors: errorData.errors,
    };
    throw error;
  }

  return await response.json();
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  // Validate required fields
  if (!data.name || !data.email || !data.password) {
    throw new Error('Name, email, and password are required');
  }
  if (!data.mobileNumber) {
    throw new Error('Mobile number is required');
  }
  if (!data.userType) {
    throw new Error('User type is required');
  }
  if (!data.degree) {
    throw new Error('Degree/Qualification is required');
  }
  
  // Conditional validation based on user type
  if (data.userType === 'student') {
    if (!data.institution) {
      throw new Error('Institution/College name is required for students');
    }
  } else if (data.userType === 'doctor' || data.userType === 'pharmacist' || data.userType === 'nurse' || data.userType === 'therapist') {
    if (!data.licenseNo) {
      throw new Error('License number is required for medical professionals');
    }
  }
  
  if (data.userType === 'pharmacist' && !data.pharmacyName) {
    // Pharmacy name is optional but can be validated if needed
  }

  const url = `${env.apiUrl}/api/users/register`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    const error: AuthError = {
      message: errorData.message || `Registration failed: ${response.status}`,
      errors: errorData.errors,
    };
    throw error;
  }

  return await response.json();
}

/**
 * Get authenticated headers with token
 */
export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const url = `${env.apiUrl}/api/users/logout`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Logout failed: ${response.status} ${text}`);
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<AuthResponse['user'] | null> {
  const url = `${env.apiUrl}/api/users/me`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to get current user: ${response.status}`);
  }

  const data = await response.json();
  return data.user || null;
}

