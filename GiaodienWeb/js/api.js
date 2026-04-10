// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API Helper functions
const api = {
  // Generic fetch function
  async fetchData(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Nghệ sĩ APIs
  async getAllNgheSi() {
    return this.fetchData('/nghesi');
  },

  async getNgheSiById(id) {
    return this.fetchData(`/nghesi/${id}`);
  },

  // Danh mục APIs
  async getAllDanhMuc() {
    return this.fetchData('/danhmuc');
  },

  // Chiến dịch APIs
  async getAllChienDich() {
    return this.fetchData('/chiendich');
  },

  async getActiveChienDich() {
    return this.fetchData('/chiendich/active');
  },

  async getChienDichById(id) {
    return this.fetchData(`/chiendich/${id}`);
  },

  // Auth APIs
  async login(tenDangNhap, matKhau) {
    return this.fetchData('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ tenDangNhap, matKhau })
    });
  },

  async register(userData) {
    return this.fetchData('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Địa chỉ APIs
  async getSoDiaChiByUserId(userId) {
    return this.fetchData(`/sodiachi/nguoidung/${userId}`);
  },

  // Sản phẩm APIs
  async getSanPhamById(id) {
    return this.fetchData(`/sanpham/${id}`);
  }
};

// Export for use in other files
window.api = api;
