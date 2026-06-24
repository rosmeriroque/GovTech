const API_BASE_URL = "https://clasificadoria.ddns.net";

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
    let errMsg = '';
    if (error && error.detail) {
      if (typeof error.detail === 'string') {
        errMsg = error.detail;
      } else if (Array.isArray(error.detail)) {
        errMsg = error.detail.map((err: any) => {
          let msg = err.msg || JSON.stringify(err);
          const isPassword = err.loc && (err.loc.includes('contrasena') || err.loc.includes('password'));
          if (isPassword) {
            if (msg.includes('at least 8 characters')) {
              msg = 'La contraseña debe tener al menos 8 caracteres';
            }
          }
          return msg;
        }).join(', ');
      } else if (typeof error.detail === 'object') {
        let msg = error.detail.msg || JSON.stringify(error.detail);
        const isPassword = error.detail.loc && (error.detail.loc.includes('contrasena') || error.detail.loc.includes('password'));
        if (isPassword) {
          if (msg.includes('at least 8 characters')) {
            msg = 'La contraseña debe tener al menos 8 caracteres';
          }
        }
        errMsg = msg;
      }
    }
    throw new Error(errMsg || `HTTP error! status: ${response.status}`);
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

  getProfile: () =>
    request('/usuario/perfil'),

  createRequest: async (data: any) => {
    const res = await request('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
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
