// Authentication & Authorization System

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Load user from localStorage
        const savedUser = localStorage.getItem('exped_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    // Login function
    login(email, password) {
        // Check admin
        if (email === USERS.admin.email && password === USERS.admin.password) {
            this.currentUser = USERS.admin;
            localStorage.setItem('exped_user', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser, redirect: '../pages/admin-dashboard.html' };
        }

        // Check customers
        const customer = USERS.customers.find(u => u.email === email && u.password === password);
        if (customer) {
            this.currentUser = customer;
            localStorage.setItem('exped_user', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser, redirect: '../index.html' };
        }

        return { success: false, message: 'Email hoặc mật khẩu không đúng!' };
    }

    // Register function
    register(userData) {
        // Check if email exists
        const emailExists = USERS.customers.some(u => u.email === userData.email);
        if (emailExists) {
            return { success: false, message: 'Email đã được sử dụng!' };
        }

        // Create new user
        const newUser = {
            id: USERS.customers.length + 1,
            email: userData.email,
            password: userData.password,
            fullname: userData.fullname,
            phone: userData.phone,
            role: 'customer',
            avatar: '../images/rose.jpg',
            createdAt: new Date().toISOString().split('T')[0]
        };

        USERS.customers.push(newUser);
        return { success: true, message: 'Đăng ký thành công!' };
    }

    // Logout function
    logout() {
        this.currentUser = null;
        localStorage.removeItem('exped_user');
        window.location.href = '../pages/login.html';
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Check if user is customer
    isCustomer() {
        return this.currentUser && this.currentUser.role === 'customer';
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Require login (redirect if not logged in)
    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = '../pages/login.html';
            return false;
        }
        return true;
    }

    // Require admin (redirect if not admin)
    requireAdmin() {
        if (!this.isAdmin()) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = '../index.html';
            return false;
        }
        return true;
    }

    // Update header UI based on login status
    updateHeaderUI() {
        const userDropdown = document.querySelector('.user-dropdown');
        if (!userDropdown) return;

        if (this.isLoggedIn()) {
            // User is logged in - show profile menu
            const dropdownMenu = userDropdown.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <a href="../pages/profile.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Hồ sơ cá nhân</span>
                    </a>
                    <a href="../pages/order-history.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Đơn hàng của tôi</span>
                    </a>
                    <a href="#" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>Yêu thích</span>
                    </a>
                    ${this.isAdmin() ? `
                    <div class="dropdown-divider"></div>
                    <a href="../pages/admin-dashboard.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Admin Dashboard</span>
                    </a>
                    ` : ''}
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item logout" onclick="auth.logout()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Đăng xuất</span>
                    </a>
                `;
            }
        } else {
            // User not logged in - show login/register
            const dropdownMenu = userDropdown.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <a href="../pages/login.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        <span>Đăng nhập</span>
                    </a>
                    <a href="../pages/signup.html" class="dropdown-item">
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
}

// Initialize auth system
const auth = new AuthSystem();

// Auto-update header on page load
document.addEventListener('DOMContentLoaded', function() {
    auth.updateHeaderUI();
});
