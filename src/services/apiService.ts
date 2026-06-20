const API_BASE_URL = "clasificadoria.ddns.net";

const getToken = () => localStorage.getItem('token');

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) return null;
  
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.blob();
};

export const apiService = {
  login: (correo: string, contrasena: string) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena })
    }),

  register: (data: any) =>
    request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  createRequest: async (data: any) => {
    const res = await request('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    window.location.reload();
    return res;
  },

  getMyRequests: () =>
    request('/solicitudes/mis-solicitudes'),

  getRequestById: (id: number) =>
    request(`/solicitudes/${id}`),

  getAdminRequests: (query: string = '') =>
    request(`/admin/solicitudes${query ? `?${query}` : ''}`),

  updateRequestStatus: async (id: number, estado: string) => {
    const res = await request(`/admin/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado })
    });
    window.location.reload();
    return res;
  },

  getAttachments: (id: number) =>
    request(`/admin/solicitudes/${id}/anexos`),

  downloadAttachment: async (id: number, filename: string) => {
    const blob = await request(`/admin/anexos/${id}/descargar`);
    const url = window.URL.createObjectURL(blob as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
