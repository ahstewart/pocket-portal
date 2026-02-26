// src/api/client.js
import axios from 'axios';

// The base URL now explicitly includes the /api/v1 prefix
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to inject Token (Call this on app load or login)
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const ApiService = {
  // --- USERS ---
  getMe: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  // --- MODELS ---
  getModels: async (authorId = null) => {
    const params = authorId ? { author_id: authorId } : {};
    const response = await api.get("/models", { params });
    return response.data;
  },

  getModel: async (modelId) => {
    const response = await api.get(`/models/${modelId}`);
    return response.data;
  },

  createModel: async (modelId, data) => {
    const response = await api.post(`/models/${modelId}`, data);
    return response.data;
  },

  updateModel: async (modelId, data) => {
    const response = await api.patch(`/models/${modelId}`, data);
    return response.data;
  },

  // --- MODEL VERSIONS ---
  getModelVersions: async (modelId) => {
    const response = await api.get(`/models/${modelId}/versions`);
    return response.data;
  },

  createModelVersion: async (modelId, versionId, data) => {
    const response = await api.post(`/models/${modelId}/versions/${versionId}`, data);
    return response.data;
  },

  updateModelVersion: async (modelId, versionId, data) => {
    // Note: ensure this matches your Python API path (version vs versions)
    const response = await api.patch(`/models/${modelId}/version/${versionId}`, data);
    return response.data;
  },

  // --- HUGGING FACE ---
  searchHuggingFace: async (query) => {
    const response = await api.get("/search/huggingface", { params: { query } });
    return response.data;
  },

  importFromHuggingFace: async (hfId) => {
    const response = await api.post("/import/huggingface", { hf_id: hfId });
    return response.data;
  }
};