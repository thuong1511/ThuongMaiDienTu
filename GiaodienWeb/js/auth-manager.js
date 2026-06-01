// Authentication Manager
const authManager = {
    // Lưu thông tin người dùng vào localStorage
    saveUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    },

    // Lấy thông tin người dùng hiện tại
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Kiểm tra đã đăng nhập chưa
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // Kiểm tra có phải admin không
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.vaiTro === 'Admin';
    },

    // Đăng xuất
    logout() {
        localStorage.removeItem('currentUser');
        // Kiểm tra xem đang ở trang nào để redirect đúng
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    },

    // Đăng nhập
    async login(tenDangNhap, matKhau) {
        try {
            const response = await api.login(tenDangNhap, matKhau);
            
            if (response.success) {
                this.saveUser(response.data);
                sessionStorage.setItem('justLoggedIn', 'true');
                
                // Chuyển hướng dựa trên vai trò
                if (response.data.vaiTro === 'Admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
                
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    // Đăng nhập bằng email
    async loginByEmail(email, matKhau) {
        try {
            const response = await api.login(email, matKhau);
            
            if (response.success) {
                this.saveUser(response.data);
                sessionStorage.setItem('justLoggedIn', 'true');
                
                // Chuyển hướng dựa trên vai trò
                if (response.data.vaiTro === 'Admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
                
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    // Đăng ký
    async register(userData) {
        try {
            const response = await api.register(userData);
            
            if (response.success) {
                this.saveUser(response.data);
                sessionStorage.setItem('justLoggedIn', 'true');
                window.location.href = '../index.html';
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    // Cập nhật thông tin người dùng
    updateUser(userData) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            // Merge new data with existing data
            const updatedUser = { ...currentUser, ...userData };
            this.saveUser(updatedUser);
        }
    },

    // Cập nhật header UI
    updateHeaderUI() {
        const user = this.getCurrentUser();
        const userBtn = document.querySelector('.user-btn');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        
        if (!userBtn) return;
        
        // Kiểm tra xem đang ở thư mục nào để tạo đường dẫn đúng
        const currentPath = window.location.pathname;
        const isInPagesFolder = currentPath.includes('/pages/');
        const pathPrefix = isInPagesFolder ? '' : 'pages/';
        
        if (user) {
            // Đã đăng nhập - hiển thị icon người dùng trước, tên sau
            userBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span style="font-weight: 600;">${user.tenDangNhap}</span>
                <svg class="arrow-down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;
            userBtn.onclick = null; // Remove onclick để dropdown hoạt động
            
            // Cập nhật dropdown menu
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <div class="dropdown-item user-info">
                        <small>${user.email}</small>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="${pathPrefix}profile.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Hồ sơ cá nhân</span>
                    </a>
                    <a href="${pathPrefix}order-history.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Đơn hàng của tôi</span>
                    </a>
                    <a href="${pathPrefix}wallet.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        <span>Ví của tôi</span>
                    </a>
                    <a href="${pathPrefix}notifications.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span>Thông báo</span>
                    </a>
                    ${user.vaiTro === 'Admin' ? `
                    <a href="${pathPrefix}admin-dashboard.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Quản trị</span>
                    </a>
                    ` : ''}
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item logout" onclick="authManager.logout()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Đăng xuất</span>
                    </div>
                `;
            }
        } else {
            // Chưa đăng nhập - hiển thị icon người dùng và mũi tên
            userBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <svg class="arrow-down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;
            userBtn.onclick = null; // Remove onclick để dropdown hoạt động
            
            // Hiển thị dropdown menu với Đăng nhập và Đăng ký
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <a href="${pathPrefix}login.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        <span>Đăng nhập</span>
                    </a>
                    <a href="${pathPrefix}signup.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        <span>Đăng ký</span>
                    </a>
                `;
            }
        }
    }
};

// Export
window.authManager = authManager;
window.AuthManager = authManager; // Alias for compatibility

// Tự động kiểm tra cài đặt OTP giao dịch cho người dùng
async function checkUserOTP() {
    const user = authManager.getCurrentUser();
    if (!user) return; // Bỏ qua nếu chưa đăng nhập
    if (user.vaiTro === 'Admin') return; // Bỏ qua admin

    // CHỈ kiểm tra khi người dùng vừa mới đăng nhập thành công
    if (sessionStorage.getItem('justLoggedIn') !== 'true') return;
    
    // Xóa cờ ngay lập tức để không lặp lại ở các trang khác
    sessionStorage.removeItem('justLoggedIn');

    try {
        const response = await api.checkTransactionOTP(user.maNguoiDung);
        if (response.success && response.data === false) {
            // Hiển thị thông báo thân thiện và trực tiếp mở modal thiết lập OTP giao dịch
            alert('Chào mừng bạn! Tài khoản của bạn chưa được thiết lập mã OTP bảo mật giao dịch. Vui lòng thiết lập ngay để bảo vệ số dư tài khoản.');
            openOTPSetupModal();
        }
    } catch (e) {
        console.error('Lỗi kiểm tra OTP giao dịch:', e);
    }
}

function openOTPSetupModal() {
    if (document.getElementById('otp-setup-modal')) return;
    
    // Inject style to hide default password reveal buttons and force geometric centering
    if (!document.getElementById('otp-reveal-hide-style')) {
        const style = document.createElement('style');
        style.id = 'otp-reveal-hide-style';
        style.innerHTML = `
            #otp-setup-modal input[type="password"]::-ms-reveal,
            #otp-setup-modal input[type="password"]::-ms-clear,
            #checkout-otp-verify-modal input[type="password"]::-ms-reveal,
            #checkout-otp-verify-modal input[type="password"]::-ms-clear {
                display: none !important;
            }
            #otp-setup-modal input[type="password"]::-webkit-contacts-auto-fill-button,
            #otp-setup-modal input[type="password"]::-webkit-credentials-auto-fill-button,
            #checkout-otp-verify-modal input[type="password"]::-webkit-contacts-auto-fill-button,
            #checkout-otp-verify-modal input[type="password"]::-webkit-credentials-auto-fill-button {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    const modal = document.createElement('div');
    modal.id = 'otp-setup-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: #470200;
            border: 2px solid var(--accent-gold);
            border-radius: 16px;
            padding: 35px 30px;
            width: 460px;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 15px 35px rgba(0,0,0,0.6);
            color: var(--primary-light);
            font-family: 'Nunito', sans-serif;
            position: relative;
        ">
            <h2 style="color: var(--accent-gold); margin-bottom: 12px; font-weight: 800; font-size: 22px; letter-spacing: 1px; text-transform: uppercase;">Thiết lập OTP Giao dịch</h2>
            <p style="color: rgba(236, 234, 229, 0.8); font-size: 14px; margin-bottom: 25px; line-height: 1.5;">
                Thiết lập mã khóa OTP gồm 6 chữ số để bảo mật tài khoản. Mã này sẽ được yêu cầu khi bạn thực hiện bất kỳ giao dịch thanh toán nào.
            </p>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; text-align: left; color: var(--accent-gold); font-size: 13px; margin-bottom: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Nhập mã OTP mới (6 số):</label>
                <input type="password" id="otp-setup-code" maxlength="6" style="
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1.5px solid var(--accent-gold);
                    border-radius: 8px;
                    padding: 12px;
                    color: #fff;
                    font-size: 22px;
                    letter-spacing: 6px;
                    text-indent: 6px;
                    text-align: center;
                    font-weight: 700;
                    margin-bottom: 20px;
                    transition: border-color 0.2s;
                " placeholder="••••••">
                
                <label style="display: block; text-align: left; color: var(--accent-gold); font-size: 13px; margin-bottom: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Xác nhận mã OTP mới:</label>
                <input type="password" id="otp-setup-confirm" maxlength="6" style="
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1.5px solid var(--accent-gold);
                    border-radius: 8px;
                    padding: 12px;
                    color: #fff;
                    font-size: 22px;
                    letter-spacing: 6px;
                    text-indent: 6px;
                    text-align: center;
                    font-weight: 700;
                " placeholder="••••••">
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
                <button onclick="submitOTPSetup()" style="
                    background: var(--accent-gold);
                    color: var(--primary-dark);
                    border: none;
                    padding: 12px 18px;
                    border-radius: 30px;
                    font-family: 'Nunito', sans-serif;
                    font-weight: 800;
                    font-size: 13px;
                    cursor: pointer;
                    flex: 1.2;
                    white-space: nowrap;
                    transition: all 0.3s;
                    text-transform: uppercase;
                    box-shadow: 0 4px 15px rgba(196, 168, 127, 0.3);
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(196, 168, 127, 0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(196, 168, 127, 0.3)';">Xác nhận Thiết lập</button>
                <button onclick="closeOTPSetupModal()" style="
                    background: rgba(236, 234, 229, 0.1);
                    color: var(--primary-light);
                    border: 1px solid rgba(236, 234, 229, 0.3);
                    padding: 12px 18px;
                    border-radius: 30px;
                    font-family: 'Nunito', sans-serif;
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    flex: 0.8;
                    white-space: nowrap;
                    transition: all 0.3s;
                    text-transform: uppercase;
                " onmouseover="this.style.background='rgba(236, 234, 229, 0.2)';" onmouseout="this.style.background='rgba(236, 234, 229, 0.1)';">Hủy</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-focus the first OTP input
    const setupInput = document.getElementById('otp-setup-code');
    const confirmInput = document.getElementById('otp-setup-confirm');
    
    if (setupInput) setupInput.focus();
    
    // Pressing Enter in the confirm input submits the form
    if (confirmInput) {
        confirmInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitOTPSetup();
            }
        });
    }
    if (setupInput) {
        setupInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && confirmInput) {
                confirmInput.focus();
            }
        });
    }
}

async function submitOTPSetup() {
    const code = document.getElementById('otp-setup-code').value;
    const confirm = document.getElementById('otp-setup-confirm').value;
    const user = authManager.getCurrentUser();
    
    if (!code || !/^\d{6}$/.test(code)) {
        alert('Mã OTP phải chứa đúng 6 chữ số!');
        return;
    }
    
    if (code !== confirm) {
        alert('Mã OTP xác nhận không trùng khớp!');
        return;
    }
    
    try {
        const response = await api.setTransactionOTP(user.maNguoiDung, code);
        if (response.success) {
            alert('Thiết lập mã OTP giao dịch bảo mật thành công! Khóa bảo vệ đã có hiệu lực.');
            closeOTPSetupModal();
        } else {
            alert('Thiết lập thất bại: ' + response.message);
        }
    } catch (e) {
        alert('Lỗi kết nối đến máy chủ.');
    }
}

function closeOTPSetupModal() {
    const modal = document.getElementById('otp-setup-modal');
    if (modal) modal.remove();
}

window.openOTPSetupModal = openOTPSetupModal;
window.submitOTPSetup = submitOTPSetup;
window.closeOTPSetupModal = closeOTPSetupModal;

// Tự động cập nhật UI khi trang load
document.addEventListener('DOMContentLoaded', async () => {
    authManager.updateHeaderUI();
    // Chờ Header render xong rồi kiểm tra OTP
    setTimeout(checkUserOTP, 500);
});
