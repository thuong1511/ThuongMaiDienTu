// Profile Page JavaScript

let currentUser = null;
let allTinhThanh = [];
let allPhuongXa = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    currentUser = authManager.getCurrentUser();
    
    if (!currentUser) {
        showToast('Vui lòng đăng nhập để xem trang này!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Check if user data is missing soDienThoai or gioiTinh
    if (!currentUser.soDienThoai || !currentUser.gioiTinh) {
        console.warn('User data is incomplete, refreshing from API...');
        await refreshUserData();
    }
    
    // Load user profile
    await loadUserProfile();
    
    // Load address data
    await loadTinhThanh();
    await loadUserAddresses();
    
    // Setup event listeners
    setupTabSwitching();
    setupFormHandlers();
});

// Refresh user data from API
async function refreshUserData() {
    try {
        if (!currentUser || !currentUser.maNguoiDung) {
            console.error('No user ID found');
            return;
        }
        
        const response = await fetch(`http://localhost:8080/api/nguoidung/${currentUser.maNguoiDung}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            // Update localStorage with complete data
            const updatedUser = {
                ...currentUser,
                soDienThoai: data.data.soDienThoai,
                gioiTinh: data.data.gioiTinh
            };
            authManager.saveUser(updatedUser);
            currentUser = updatedUser;
            console.log('User data refreshed successfully:', currentUser);
        }
    } catch (error) {
        console.error('Error refreshing user data:', error);
    }
}

// Load user profile from API
async function loadUserProfile() {
    try {
        // Display user info from authManager
        console.log('Current user data:', currentUser);
        
        document.getElementById('displayName').textContent = currentUser.tenDangNhap || 'Người dùng';
        document.getElementById('displayEmail').textContent = currentUser.email || '';
        
        // Fill form fields
        document.getElementById('tenDangNhap').value = currentUser.tenDangNhap || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('soDienThoai').value = currentUser.soDienThoai || '';
        document.getElementById('gioiTinh').value = currentUser.gioiTinh || 'Nam';
        
        console.log('Số điện thoại:', currentUser.soDienThoai);
        console.log('Giới tính:', currentUser.gioiTinh);
        
        // TODO: Load stats from API when available
        // For now, use placeholder values
        document.getElementById('totalCampaigns').textContent = '0';
        document.getElementById('successfulBets').textContent = '0';
        document.getElementById('successRate').textContent = '0%';
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Không thể tải thông tin người dùng!', 'error');
    }
}

// Setup tab switching
function setupTabSwitching() {
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all menu items
            menuItems.forEach(menu => menu.classList.remove('active'));
            
            // Add active class to clicked menu item
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show target tab content
            document.getElementById(targetTab).classList.add('active');
            
            // Load addresses when switching to address tab
            if (targetTab === 'address') {
                loadUserAddresses();
            }
        });
    });
}

// Setup form handlers
function setupFormHandlers() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Security form
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', handlePasswordChange);
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Get form values
    const soDienThoai = document.getElementById('soDienThoai').value.trim();
    const gioiTinh = document.getElementById('gioiTinh').value;
    
    // Validate phone number
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (soDienThoai && !phoneRegex.test(soDienThoai)) {
        showToast('Số điện thoại không hợp lệ!', 'error');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Đang lưu...</span>';
    
    try {
        // TODO: Call API to update profile when available
        // For now, update localStorage
        currentUser.soDienThoai = soDienThoai;
        currentUser.gioiTinh = gioiTinh;
        
        authManager.updateUser(currentUser);
        
        // Update display
        document.getElementById('displayName').textContent = currentUser.tenDangNhap;
        
        showToast('Cập nhật thông tin thành công!', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Get form values
    const matKhauHienTai = document.getElementById('matKhauHienTai').value;
    const matKhauMoi = document.getElementById('matKhauMoi').value;
    const xacNhanMatKhauMoi = document.getElementById('xacNhanMatKhauMoi').value;
    
    // Validate
    if (!matKhauHienTai || !matKhauMoi || !xacNhanMatKhauMoi) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    if (matKhauMoi.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    if (matKhauMoi !== xacNhanMatKhauMoi) {
        showToast('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Đang xử lý...</span>';
    
    try {
        // TODO: Call API to change password when available
        // For now, just show success message
        
        showToast('Đổi mật khẩu thành công!', 'success');
        
        // Clear form
        document.getElementById('matKhauHienTai').value = '';
        document.getElementById('matKhauMoi').value = '';
        document.getElementById('xacNhanMatKhauMoi').value = '';
        
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Show toast notification
function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ========== ADDRESS BOOK FUNCTIONS ==========

// Load all Tinh Thanh
async function loadTinhThanh() {
    try {
        const response = await fetch(`${API_BASE_URL}/tinhthanh`);
        const data = await response.json();
        
        if (data.success) {
            allTinhThanh = data.data;
            populateTinhThanhDropdown();
        }
    } catch (error) {
        console.error('Error loading tinh thanh:', error);
    }
}

// Populate Tinh Thanh dropdown
function populateTinhThanhDropdown() {
    const select = document.getElementById('addrTinhThanh');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Chọn Tỉnh/Thành --</option>' +
        allTinhThanh.map(tt => `<option value="${tt.maTinhThanh}">${tt.tenTinhThanh}</option>`).join('');
}

// Load Phuong Xa by Tinh Thanh
async function loadPhuongXa() {
    const maTinhThanh = document.getElementById('addrTinhThanh').value;
    const select = document.getElementById('addrPhuongXa');
    
    if (!maTinhThanh) {
        select.innerHTML = '<option value="">-- Chọn Phường/Xã --</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/phuongxa/tinhthanh/${maTinhThanh}`);
        const data = await response.json();
        
        if (data.success) {
            allPhuongXa = data.data;
            select.innerHTML = '<option value="">-- Chọn Phường/Xã --</option>' +
                data.data.map(px => `<option value="${px.maPhuongXa}">${px.tenPhuongXa}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading phuong xa:', error);
    }
}

// Load user addresses
async function loadUserAddresses() {
    const addressList = document.getElementById('addressList');
    if (!addressList) return;
    
    addressList.innerHTML = '<p style="text-align: center; color: #999;">Đang tải...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/sodiachi/nguoidung/${currentUser.maNguoiDung}`);
        const data = await response.json();
        
        if (data.success) {
            if (data.data.length === 0) {
                addressList.innerHTML = '<p style="text-align: center; color: #999;">Chưa có địa chỉ nào. Hãy thêm địa chỉ mới!</p>';
                return;
            }
            
            addressList.innerHTML = data.data.map(addr => {
                const isDefault = addr.macDinh === true;
                return `
                <div class="address-item ${isDefault ? 'default-address' : ''}">
                    <div class="address-info">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <h4 style="margin: 0;">${addr.hoTen}</h4>
                            ${isDefault ? '<span class="default-badge">Mặc định</span>' : ''}
                        </div>
                        <p><strong>SĐT:</strong> ${addr.soDienThoai}</p>
                        <p><strong>Địa chỉ:</strong> ${addr.diaChiChiTiet}</p>
                        <p><strong>Phường/Xã:</strong> ${addr.tenPhuongXa || 'N/A'}</p>
                        <p><strong>Tỉnh/Thành:</strong> ${addr.tenTinhThanh || 'N/A'}</p>
                    </div>
                    <div class="address-actions">
                        ${!isDefault ? `
                            <button class="btn-set-default" onclick="setDefaultAddress('${addr.maSo}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Đặt mặc định
                            </button>
                        ` : ''}
                        <button class="btn-edit" onclick="editAddress('${addr.maSo}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Sửa
                        </button>
                        <button class="btn-delete" onclick="deleteAddress('${addr.maSo}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Xóa
                        </button>
                    </div>
                </div>
            `}).join('');
        } else {
            addressList.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Không thể tải địa chỉ!</p>';
        }
    } catch (error) {
        console.error('Error loading addresses:', error);
        addressList.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Lỗi khi tải địa chỉ!</p>';
    }
}

// Show add address modal
function showAddAddressModal() {
    document.getElementById('modalTitle').textContent = 'Thêm địa chỉ mới';
    document.getElementById('editAddressId').value = '';
    document.getElementById('addressForm').reset();
    populateTinhThanhDropdown();
    document.getElementById('addressModal').style.display = 'flex';
}

// Close address modal
function closeAddressModal() {
    document.getElementById('addressModal').style.display = 'none';
}

// Edit address
async function editAddress(maSo) {
    try {
        const response = await fetch(`${API_BASE_URL}/sodiachi/nguoidung/${currentUser.maNguoiDung}`);
        const data = await response.json();
        
        if (data.success) {
            const address = data.data.find(addr => addr.maSo === maSo);
            if (!address) {
                showToast('Không tìm thấy địa chỉ!', 'error');
                return;
            }
            
            // Fill form with address data
            document.getElementById('modalTitle').textContent = 'Sửa địa chỉ';
            document.getElementById('editAddressId').value = maSo;
            document.getElementById('addrHoTen').value = address.hoTen;
            document.getElementById('addrSoDienThoai').value = address.soDienThoai;
            document.getElementById('addrChiTiet').value = address.diaChiChiTiet;
            
            // Populate dropdowns
            populateTinhThanhDropdown();
            
            // Set tinh thanh value
            const tinhThanh = allTinhThanh.find(tt => tt.tenTinhThanh === address.tenTinhThanh);
            if (tinhThanh) {
                document.getElementById('addrTinhThanh').value = tinhThanh.maTinhThanh;
                await loadPhuongXa();
                
                // Set phuong xa value
                const phuongXa = allPhuongXa.find(px => px.tenPhuongXa === address.tenPhuongXa);
                if (phuongXa) {
                    document.getElementById('addrPhuongXa').value = phuongXa.maPhuongXa;
                }
            }
            
            document.getElementById('addressModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading address:', error);
        showToast('Không thể tải thông tin địa chỉ!', 'error');
    }
}

// Delete address
async function deleteAddress(maSo) {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/sodiachi/${maSo}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Xóa địa chỉ thành công!', 'success');
            loadUserAddresses();
        } else {
            showToast(data.message || 'Không thể xóa địa chỉ!', 'error');
        }
    } catch (error) {
        console.error('Error deleting address:', error);
        showToast('Có lỗi xảy ra khi xóa địa chỉ!', 'error');
    }
}

// Handle address form submit
async function handleAddressSubmit(event) {
    event.preventDefault();
    
    const maSo = document.getElementById('editAddressId').value;
    const addressData = {
        maNguoiDung: currentUser.maNguoiDung,
        maPhuongXa: document.getElementById('addrPhuongXa').value,
        hoTen: document.getElementById('addrHoTen').value.trim(),
        soDienThoai: document.getElementById('addrSoDienThoai').value.trim(),
        diaChiChiTiet: document.getElementById('addrChiTiet').value.trim()
    };
    
    // Validate
    if (!addressData.maPhuongXa) {
        showToast('Vui lòng chọn Phường/Xã!', 'error');
        return;
    }
    
    if (!addressData.hoTen || !addressData.soDienThoai || !addressData.diaChiChiTiet) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    try {
        let response;
        if (maSo) {
            // Update existing address
            response = await fetch(`${API_BASE_URL}/sodiachi/${maSo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressData)
            });
        } else {
            // Create new address
            response = await fetch(`${API_BASE_URL}/sodiachi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressData)
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            showToast(maSo ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ thành công!', 'success');
            closeAddressModal();
            loadUserAddresses();
        } else {
            showToast(data.message || 'Không thể lưu địa chỉ!', 'error');
        }
    } catch (error) {
        console.error('Error saving address:', error);
        showToast('Có lỗi xảy ra khi lưu địa chỉ!', 'error');
    }
}

// Set default address (call API)
async function setDefaultAddress(maSo) {
    try {
        const response = await fetch(`${API_BASE_URL}/sodiachi/${maSo}/set-default`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Đã đặt làm địa chỉ mặc định!', 'success');
            loadUserAddresses();
        } else {
            showToast(data.message || 'Không thể đặt địa chỉ mặc định!', 'error');
        }
    } catch (error) {
        console.error('Error setting default address:', error);
        showToast('Có lỗi xảy ra khi đặt địa chỉ mặc định!', 'error');
    }
}
