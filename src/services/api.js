const API_URL = 'https://imobiliaria.fly.dev';

const defaultHeaders = { 'Content-Type': 'application/json' };

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erro na requisição');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: defaultHeaders,
    });
    return handleResponse(response);
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    return handleResponse(response);
  },
  
  upload: async (endpoint, formData) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
    return handleResponse(response);
  }
};

export default api;
