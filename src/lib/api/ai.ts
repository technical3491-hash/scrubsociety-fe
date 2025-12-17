import { env } from '@/config/env';
import { getAuthHeaders } from './auth';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIQueryRequest {
  query: string;
  context?: string;
  messages?: ChatMessage[]; // Conversation history
}

export interface AIQueryResponse {
  success: boolean;
  suggestions: string[];
  message?: string;
  response?: string; // Full AI response for chat
  error?: string;
}

/**
 * Query AI for medical suggestions, case insights, or drug information
 * This function first tries to use the backend API endpoint, 
 * and falls back to direct OpenAI integration if needed
 */
export async function queryAI(request: AIQueryRequest): Promise<AIQueryResponse> {
  const { query } = request;
  
  if (!query || !query.trim()) {
    throw new Error('Query is required');
  }

  // Try backend API endpoint first
  try {
    const backendUrl = `${env.apiUrl}/api/ai/query`;
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ query: query.trim(), context: request.context }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        suggestions: data.suggestions || data.data?.suggestions || [],
        message: data.message,
      };
    }
  } catch (error) {
    console.warn('Backend AI endpoint not available, trying direct OpenAI integration:', error);
  }

  // Fallback to direct OpenAI integration (requires API key)
  return await queryOpenAI(request);
}

/**
 * Direct OpenAI API integration
 * Requires NEXT_PUBLIC_OPENAI_API_KEY environment variable
 */
async function queryOpenAI(request: AIQueryRequest): Promise<AIQueryResponse> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Return helpful suggestions based on query keywords if no API key
    return generateFallbackSuggestions(request.query);
  }

  try {
    // Build messages array with conversation history
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a medical AI assistant for ScrubSocietyAI, a platform for verified healthcare professionals. 
        Provide helpful, accurate medical information, case insights, drug information, and CME course suggestions.
        Always emphasize that users should consult with qualified healthcare professionals for medical decisions.
        Be conversational, helpful, and provide detailed responses. Format your responses naturally with clear explanations.`,
      },
    ];

    // Add conversation history if available
    if (request.messages && request.messages.length > 0) {
      // Filter out system messages and add user/assistant messages
      const conversationMessages = request.messages.filter(
        msg => msg.role === 'user' || msg.role === 'assistant'
      );
      messages.push(...conversationMessages);
    }

    // Add current user query
    messages.push({
      role: 'user',
      content: request.query,
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using cost-effective model, can be changed to gpt-4 for better results
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000, // Increased for better responses
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // For chat mode, return the full response
    // Also extract suggestions if needed
    let suggestions: string[] = [];
    const lines = content.split('\n').filter((line: string) => line.trim().length > 0);
    
    // Try to extract bullet points or numbered items as suggestions
    const bulletPoints = lines
      .filter((line: string) => /^[-•*•]\s+|^\d+[.)]\s+/.test(line))
      .map((line: string) => line.replace(/^[-•*•]\s+|^\d+[.)]\s+/, '').trim())
      .slice(0, 5);
    
    if (bulletPoints.length > 0) {
      suggestions = bulletPoints;
    } else {
      // If no clear suggestions, use the full response
      suggestions = [content];
    }

    return {
      success: true,
      suggestions: suggestions,
      response: content, // Full response for chat display
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to keyword-based suggestions
    return generateFallbackSuggestions(request.query);
  }
}

/**
 * Generate fallback suggestions based on query keywords
 * Used when API is not available
 */
function generateFallbackSuggestions(query: string): AIQueryResponse {
  const lowerQuery = query.toLowerCase();
  const suggestions: string[] = [];

  // Medical specialties
  if (lowerQuery.includes('cardio') || lowerQuery.includes('heart')) {
    suggestions.push(`Explore cardiology case discussions related to "${query}"`);
    suggestions.push(`Find CME courses covering cardiovascular topics`);
    suggestions.push(`Check drug interactions for cardiovascular medications`);
  } else if (lowerQuery.includes('neuro') || lowerQuery.includes('brain')) {
    suggestions.push(`Browse neurology case studies related to "${query}"`);
    suggestions.push(`Access neurological treatment protocols and guidelines`);
    suggestions.push(`Find research papers on neurological conditions`);
  } else if (lowerQuery.includes('pulmo') || lowerQuery.includes('lung') || lowerQuery.includes('respiratory')) {
    suggestions.push(`View pulmonology case discussions about "${query}"`);
    suggestions.push(`Explore respiratory medication interactions`);
    suggestions.push(`Find CME credits for pulmonary medicine`);
  } else if (lowerQuery.includes('drug') || lowerQuery.includes('medication') || lowerQuery.includes('medicine')) {
    suggestions.push(`Search drug information database for "${query}"`);
    suggestions.push(`Check drug-drug interactions and contraindications`);
    suggestions.push(`Find case discussions involving medication management`);
  } else if (lowerQuery.includes('case') || lowerQuery.includes('patient') || lowerQuery.includes('diagnosis')) {
    suggestions.push(`Browse relevant case discussions related to "${query}"`);
    suggestions.push(`Connect with specialists who have handled similar cases`);
    suggestions.push(`Access clinical decision support resources`);
  } else {
    // Generic suggestions
    suggestions.push(`Based on "${query}", here are relevant case discussions...`);
    suggestions.push(`AI suggests exploring medical topics related to ${query}`);
    suggestions.push(`Find CME courses covering ${query} topics`);
    suggestions.push(`Search for drug information related to ${query}`);
  }

  const fallbackResponse = suggestions.slice(0, 5).join('\n\n');
  
  return {
    success: true,
    suggestions: suggestions.slice(0, 5),
    response: fallbackResponse,
    message: 'AI suggestions (fallback mode - configure API key for enhanced results)',
  };
}

/**
 * Summarize case content using AI
 */
export async function summarizeCase(content: string, title?: string): Promise<string> {
  if (!content || !content.trim()) {
    throw new Error('Content is required for summarization');
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Return a simple summary if no API key
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join('. ').trim();
    return summary + (summary ? '.' : '');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant. Summarize medical case content concisely while preserving key clinical information, symptoms, diagnosis, and treatment details. Keep the summary professional and medically accurate.`,
          },
          {
            role: 'user',
            content: title 
              ? `Summarize this medical case:\n\nTitle: ${title}\n\nContent: ${content}\n\nProvide a concise summary that captures the essential clinical information.`
              : `Summarize this medical case content:\n\n${content}\n\nProvide a concise summary that captures the essential clinical information.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || content;
  } catch (error) {
    console.error('AI summarize error:', error);
    // Fallback to simple truncation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join('. ').trim();
    return summary + (summary ? '.' : content.substring(0, 200));
  }
}

