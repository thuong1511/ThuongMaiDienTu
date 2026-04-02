// Admin Page Guard - Protect admin pages from unauthorized access

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
        alert('Vui lòng đăng nhập để tiếp tục!');
        window.location.href = '../pages/login.html';
        return;
    }
    
    // Check if user is admin
    if (!auth.isAdmin()) {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = '../index.html';
        return;
    }
});
