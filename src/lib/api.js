import { supabase } from './supabase';

const API_BASE = "http://localhost:8000"; // Your Python Backend

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json'
  };

  // Only attach the badge if we actually have one
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

export const api = {
  // 1. GET ALL MODELS (The Store)
  async getModels() {
    const res = await fetch(`${API_BASE}/models`, { headers: await getAuthHeaders() });
    return res.json();
  },

  // 2. CREATE MODEL (Step 1 of Upload)
  async createModel(modelData) {
    const res = await fetch(`${API_BASE}/models`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(modelData)
    });
    if (!res.ok) throw new Error("Failed to create model");
    return res.json();
  },

  // 3. CREATE VERSION (Step 2 of Upload - The Pipeline)
  async createVersion(modelId, versionData) {
    const res = await fetch(`${API_BASE}/models/${modelId}/versions`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(versionData)
    });
    if (!res.ok) throw new Error("Failed to create version");
    return res.json();
  },
  
  // 4. INFERENCE PREVIEW (The "Try It Out")
  // Note: Your Python backend needs a POST /inference endpoint for this to work
  async runInference(modelId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    // We assume your Python backend has a "Quick Run" endpoint for web previews
    const res = await fetch(`${API_BASE}/models/${modelId}/preview`, {
        method: 'POST',
        headers: { 'Authorization': (await getAuthHeaders()).Authorization }, // No Content-Type for FormData
        body: formData
    });
    return res.json();
  }
};