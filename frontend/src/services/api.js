/**
 * LeetGoal API Service Client
 * Handles communication with the FastAPI backend
 */

const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function getApiBaseUrl() {
  return localStorage.getItem('leetgoal_api_url') || import.meta.env.VITE_API_URL || 'http://localhost:8000';
}

export function setApiBaseUrl(url) {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  localStorage.setItem('leetgoal_api_url', cleanUrl);
  return cleanUrl;
}

export function getToken() {
  return localStorage.getItem('leetgoal_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('leetgoal_token', token);
  } else {
    localStorage.removeItem('leetgoal_token');
  }
}

async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  // Attach Bearer token if available
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        (data && typeof data === 'object' && (data.detail || data.message)) ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${baseUrl}. Is FastAPI running on port 8000?`);
    }
    throw error;
  }
}

export const api = {
  // Authentication
  async register(username, password) {
    return request('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  },

  async login(username, password) {
    // FastAPI OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const data = await request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (data.access_token) {
      setToken(data.access_token);
    }
    return data;
  },

  logout() {
    setToken(null);
  },

  async getCurrentUser() {
    return request('/users/me');
  },

  // Problems Management
  async getProblems() {
    return request('/problems/');
  },

  async getProblem(id) {
    return request(`/problems/${id}`);
  },

  async createProblem({ name, difficulty, link, topic }) {
    return request('/problems/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, difficulty, link, topic }),
    });
  },

  async updateProblem(id, { name, difficulty, link, topic }) {
    return request(`/problems/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, difficulty, link, topic }),
    });
  },

  async deleteProblem(id) {
    return request(`/problems/${id}`, {
      method: 'DELETE',
    });
  },

  // Spaced Repetition (SM-2 Algorithm)
  async getDueCards() {
    return request('/cards/due');
  },

  async reviewCard(cardId, quality) {
    // quality is passed as a query param (0 to 5)
    return request(`/cards/${cardId}/review?quality=${encodeURIComponent(quality)}`, {
      method: 'POST',
    });
  },

  // Backend Health Ping
  async checkHealth() {
    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/docs`, { method: 'HEAD', mode: 'no-cors' });
      return true;
    } catch {
      return false;
    }
  },
};

export default api;
