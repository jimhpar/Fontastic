const API_BASE = 'http://localhost:4000/api';

export const api = {
  getToken(): string | null {
    return localStorage.getItem('fontastic_user_token');
  },

  setToken(token: string) {
    localStorage.setItem('fontastic_user_token', token);
  },

  clearToken() {
    localStorage.removeItem('fontastic_user_token');
  },

  getGeminiApiKey(): string | null {
    return localStorage.getItem('fontastic_gemini_key');
  },

  setGeminiApiKey(key: string) {
    if (!key) {
      localStorage.removeItem('fontastic_gemini_key');
    } else {
      localStorage.setItem('fontastic_gemini_key', key.trim());
    }
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const geminiKey = this.getGeminiApiKey();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (geminiKey) {
      headers['x-gemini-api-key'] = geminiKey;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  }
};
