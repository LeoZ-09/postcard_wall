const API_BASE = '/api';

const api = {
  async getPostcards(page = 1, perPage = 20, platformType = '') {
    let url = `${API_BASE}/postcards?page=${page}&per_page=${perPage}`;
    if (platformType) url += `&platform_type=${platformType}`;
    const res = await fetch(url);
    return res.json();
  },

  async getPostcard(id) {
    const res = await fetch(`${API_BASE}/postcards/${id}`);
    return res.json();
  },

  async createPostcard(formData) {
    const res = await fetch(`${API_BASE}/postcards`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async updatePostcard(id, formData) {
    const res = await fetch(`${API_BASE}/postcards/${id}`, {
      method: 'PUT',
      body: formData
    });
    return res.json();
  },

  async deletePostcard(id) {
    const res = await fetch(`${API_BASE}/postcards/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/postcards/stats`);
    return res.json();
  },

  async getImages() {
    const res = await fetch(`${API_BASE}/images`);
    return res.json();
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/images`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async deleteImage(id) {
    const res = await fetch(`${API_BASE}/images/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getRules() {
    const res = await fetch(`${API_BASE}/rules`);
    return res.json();
  },

  async createRule(data) {
    const res = await fetch(`${API_BASE}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateRule(id, data) {
    const res = await fetch(`${API_BASE}/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteRule(id) {
    const res = await fetch(`${API_BASE}/rules/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  getImageUrl(imageId) {
    return `${API_BASE}/images/${imageId}`;
  }
};

window.api = api;