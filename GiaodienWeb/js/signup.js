// Signup Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const messageBox = document.getElementById('messageBox');
    
    signupForm.addEventListener('submit', handleSignup);
});

async function handleSignup(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Get form values
    const tenDangNhap = document.getElementById('tenDangNhap').value.trim();
    const email = document.getElementById('email').value.trim();
    const soDienThoai = document.getElementById('soDienThoai').value.trim();
    const gioiTinh = document.getElementById('gioiTinh').value;
    const matKhau = document.getElementById('matKhau').value;
    const xacNhanMatKhau = document.getElementById('xacNhanMatKhau').value;
    
    // Validate
    if (!tenDangNhap || !email || !soDienThoai || !gioiTinh || !matKhau || !xacNhanMatKhau) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Email không hợp lệ!', 'error');
        return;
    }
    
    // Validate phone number (Vietnamese format)
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(soDienThoai)) {
        showToast('Số điện thoại không hợp lệ!', 'error');
        return;
    }
    
    // Validate password length
    if (matKhau.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    // Validate password match
    if (matKhau !== xacNhanMatKhau) {
        showToast('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang xử lý...';
    
    try {
        // Call API
        const response = await api.register({
            tenDangNhap,
            email,
            soDienThoai,
            gioiTinh,
            matKhau
        });
        
        if (response.success) {
            showToast('Đăng ký thành công! Đang chuyển đến trang đăng nhập...', 'success');
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showToast(response.message || 'Đăng ký thất bại!', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Signup error:', error);
        
        // Check if error message contains specific info
        if (error.message && error.message.includes('Email đã tồn tại')) {
            showToast('Email này đã được đăng ký. Vui lòng sử dụng email khác!', 'error');
        } else if (error.message && error.message.includes('Tên đăng nhập đã tồn tại')) {
            showToast('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác!', 'error');
        } else {
            showToast('Có lỗi xảy ra. Vui lòng thử lại sau!', 'error');
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

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
