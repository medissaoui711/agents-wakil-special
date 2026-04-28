/**
 * API Client for Wakalat Backend
 * Connects React frontend to Python FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types matching backend schemas
export interface HandleCheckResponse {
  available: boolean;
  handle: string;
  message?: string;
}

export interface HandleReserveResponse {
  success: boolean;
  handle: string;
  expires_at?: string;
  message: string;
}

export interface HandleClaimRequest {
  handle: string;
  email: string;
  password: string;
}

export interface HandleResponse {
  id: number;
  handle: string;
  status: string;
  created_at: string;
}

export interface StatsResponse {
  total_handles: number;
  claimed_handles: number;
  available_handles: number;
  total_agents: number;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// API client
class WakalatAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ===== Handles API =====
  
  /**
   * Check if a handle is available
   */
  async checkHandle(handle: string): Promise<HandleCheckResponse> {
    return this.fetch(`/api/handles/check/${handle}`);
  }

  /**
   * Reserve a handle for 10 minutes
   */
  async reserveHandle(handle: string, email: string): Promise<HandleReserveResponse> {
    return this.fetch('/api/handles/reserve', {
      method: 'POST',
      body: JSON.stringify({ handle, email }),
    });
  }

  /**
   * Claim a handle (creates user account)
   */
  async claimHandle(data: HandleClaimRequest): Promise<HandleResponse> {
    return this.fetch('/api/handles/claim', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get handle statistics
   */
  async getStats(): Promise<StatsResponse> {
    return this.fetch('/api/handles/stats');
  }

  // ===== Auth API =====

  /**
   * Register new user
   */
  async register(email: string, password: string): Promise<{ id: number; email: string }> {
    return this.fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Login and get access token
   */
  async login(email: string, password: string): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<any> {
    return this.fetch('/api/auth/me');
  }

  // ===== Agents API =====

  /**
   * Get network agents (for visualization)
   */
  async getNetworkAgents(): Promise<any[]> {
    return this.fetch('/api/agents/network');
  }

  /**
   * Get single agent by handle
   */
  async getAgent(handle: string): Promise<any> {
    return this.fetch(`/api/agents/${handle}`);
  }

  /**
   * Search agents by query, role, country, or tag
   */
  async searchAgents(params: { q?: string; role?: string; country?: string; tag?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.role) queryParams.append('role', params.role);
    if (params.country) queryParams.append('country', params.country);
    if (params.tag) queryParams.append('tag', params.tag);
    
    return this.fetch(`/api/agents/search?${queryParams.toString()}`);
  }

  // ===== Chat API =====

  /**
   * Get chat history with another agent
   */
  async getChatHistory(agentId: number): Promise<any> {
    return this.fetch(`/api/chat/history/${agentId}`);
  }

  /**
   * Get chat rooms for current agent
   */
  async getChatRooms(): Promise<any[]> {
    return this.fetch('/api/chat/rooms');
  }

  /**
   * Send a message in a room
   */
  async sendMessage(roomId: number, content: string): Promise<any> {
    return this.fetch(`/api/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  /**
   * Create or get chat room with another agent
   */
  async createOrGetRoom(agentId: number): Promise<any> {
    return this.fetch(`/api/chat/rooms/${agentId}`, {
      method: 'POST',
    });
  }

  // ===== Dashboard API =====

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<any> {
    return this.fetch('/api/dashboard/stats');
  }

  /**
   * Get list of agents user is following
   */
  async getFollowing(): Promise<any[]> {
    return this.fetch('/api/dashboard/following');
  }

  /**
   * Get current user profile
   */
  async getMyProfile(): Promise<any> {
    return this.fetch('/api/dashboard/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: any): Promise<any> {
    return this.fetch('/api/dashboard/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(): Promise<any> {
    return this.fetch('/api/dashboard/recent-activity');
  }

  // ===== AI API =====

  /**
   * Get AI-recommended matches for an agent
   */
  async getAgentMatches(agentId: number): Promise<any> {
    return this.fetch(`/api/ai/matches/${agentId}`);
  }

  /**
   * Get network-wide potential matches
   */
  async getNetworkMatches(): Promise<any> {
    return this.fetch('/api/ai/network-match');
  }

  /**
   * Generate AI response for an agent
   */
  async generateAIResponse(agentId: number, message: string, history?: any[]): Promise<any> {
    return this.fetch('/api/ai/respond', {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId, message, conversation_history: history }),
    });
  }

  /**
   * Check compatibility between two agents
   */
  async checkCompatibility(agent1Id: number, agent2Id: number): Promise<any> {
    return this.fetch(`/api/ai/compatibility/${agent1Id}/${agent2Id}`);
  }
}

// Export singleton instance
export const api = new WakalatAPI();

// Export class for custom instances
export { WakalatAPI };
