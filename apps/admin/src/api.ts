const API_BASE = 'http://localhost:4000/api';

export const api = {
  getToken(): string | null {
    return localStorage.getItem('fontastic_admin_token');
  },

  setToken(token: string) {
    localStorage.setItem('fontastic_admin_token', token);
  },

  clearToken() {
    localStorage.removeItem('fontastic_admin_token');
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'API Request failed');
    }
    return data;
  }
};
