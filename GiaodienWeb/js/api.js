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
        try {
          const errorData = await response.json();
          if (errorData && errorData.success === false) {
            return errorData; // Return custom backend JSON error directly
          }
        } catch (jsonErr) {
          // Fallback to throw standard error if response is not JSON
        }
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
  },

  // Đơn hàng APIs
  async getDonHangByUserId(userId) {
    return this.fetchData(`/donhang/nguoidung/${userId}`);
  },

  async getDonHangById(maDonHang) {
    return this.fetchData(`/donhang/${maDonHang}`);
  },

  // Đánh giá APIs
  async getDanhGiaByChienDich(campaignId) {
    return this.fetchData(`/danhgia/chiendich/${campaignId}`);
  },

  // Thông báo APIs
  async getNotificationsByUserId(userId) {
    return this.fetchData(`/thongbao/nguoidung/${userId}`);
  },

  async getUnreadNotificationsCount(userId) {
    return this.fetchData(`/thongbao/nguoidung/${userId}/unread-count`);
  },

  async markNotificationAsRead(id) {
    return this.fetchData(`/thongbao/${id}/read`, {
      method: 'PATCH'
    });
  },

  async markAllNotificationsAsRead(userId) {
    return this.fetchData(`/thongbao/nguoidung/${userId}/read-all`, {
      method: 'PATCH'
    });
  },

  async deleteNotification(id) {
    return this.fetchData(`/thongbao/${id}`, {
      method: 'DELETE'
    });
  },

  // OTP APIs
  async checkTransactionOTP(userId) {
    return this.fetchData(`/otp/nguoidung/${userId}/check`);
  },

  async setTransactionOTP(userId, otpCode) {
    return this.fetchData('/otp/set', {
      method: 'POST',
      body: JSON.stringify({ maNguoiDung: userId, otpCode })
    });
  },

  async verifyTransactionOTP(userId, otpCode) {
    return this.fetchData('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ maNguoiDung: userId, otpCode })
    });
  },

  // ── Admin APIs ──────────────────────────────────────────────
  async adminGetDashboard() {
    return this.fetchData('/admin/dashboard');
  },
  async adminGetAllChienDich() {
    return this.fetchData('/admin/chiendich');
  },
  async adminGetAllKhachHang() {
    return this.fetchData('/admin/khachhang');
  },
  async adminGetAllDonHang() {
    return this.fetchData('/admin/donhang');
  },
  async adminGetAllNgheSi() {
    return this.fetchData('/admin/nghesi');
  },
  async adminGetAllSanPham() {
    return this.fetchData('/admin/sanpham');
  }
};

// Export for use in other files
window.api = api;
