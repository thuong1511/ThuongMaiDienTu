// Order Detail JavaScript
// API_BASE_URL is already defined in api.js

// Get order ID from URL
function getOrderIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('orderId');
}

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userStr);
}

// Load order detail
async function loadOrderDetail() {
    const user = getCurrentUser();
    if (!user) return;

    const orderId = getOrderIdFromURL();
    if (!orderId) {
        alert('Không tìm thấy mã đơn hàng');
        window.location.href = 'order-history.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/donhang/${orderId}`);
        const data = await response.json();

        console.log('Order detail API response:', data);

        if (data.success && data.data) {
            renderOrderDetail(data.data);
        } else {
            alert('Không tìm thấy đơn hàng');
            window.location.href = 'order-history.html';
        }
    } catch (error) {
        console.error('Error loading order detail:', error);
        alert('Có lỗi xảy ra khi tải chi tiết đơn hàng');
    }
}

// Render order detail
function renderOrderDetail(order) {
    const registration = order.dangKyChienDich;
    const chienDich = registration?.chienDich;
    const sanPham = chienDich?.sanPham;
    const thanhToan = registration?.thanhToan;
    const phieuGiao = order.phieuGiaoHang;
    const bangGia = registration?.bangGiaBacThang;
    const chiTietDangKy = registration?.phieuChiTietDangKys || [];
    
    // Update page title
    document.title = `Chi tiết đơn hàng #${order.maDonHang} - EXED`;
    
    // Update order header
    document.querySelector('.order-detail-header h1').textContent = `Chi tiết đơn hàng #${order.maDonHang}`;
    
    // Update status badge
    const statusBadge = document.querySelector('.order-status-badge');
    if (order.trangThaiGiaoHang === 'Đã giao') {
        statusBadge.className = 'order-status-badge delivered';
        statusBadge.textContent = '✓ Đã giao hàng';
    } else if (order.trangThaiGiaoHang === 'Đang giao') {
        statusBadge.className = 'order-status-badge shipping';
        statusBadge.textContent = '🚚 Đang giao hàng';
    } else {
        statusBadge.className = 'order-status-badge preparing';
        statusBadge.textContent = '📦 Đang chuẩn bị';
    }
    
    // Update order date
    const orderDate = registration?.ngayDangKy ? new Date(registration.ngayDangKy).toLocaleDateString('vi-VN') : 'N/A';
    document.querySelector('.order-date').textContent = `Ngày đặt: ${orderDate}`;
    
    // Update timeline
    if (phieuGiao) {
        updateTimeline(phieuGiao);
    }
    
    // Update campaign info
    updateCampaignInfo(chienDich, sanPham);
    
    // Update product info
    updateProductInfo(sanPham, chiTietDangKy);
    
    // Update betting info
    updateBettingInfo(chienDich, bangGia, registration);
    
    // Update shipping info
    updateShippingInfo(thanhToan, phieuGiao);
    
    // Update payment info
    updatePaymentInfo(thanhToan, registration, order, bangGia);
}

// Update timeline
function updateTimeline(phieuGiao) {
    const timeline = document.querySelector('.timeline');
    
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const items = [
        {
            title: 'Đơn hàng đã đặt',
            date: formatDate(phieuGiao.ngayDangKy),
            completed: true
        },
        {
            title: 'Đang chuẩn bị hàng',
            date: formatDate(phieuGiao.ngayChuanBi),
            completed: !!phieuGiao.ngayChuanBi
        },
        {
            title: 'Đang giao hàng',
            date: formatDate(phieuGiao.ngayGiao),
            note: phieuGiao.ngayGiao ? `Đơn vị vận chuyển: ${phieuGiao.donViVanChuyen}` : null,
            completed: !!phieuGiao.ngayGiao
        },
        {
            title: 'Đã giao hàng',
            date: formatDate(phieuGiao.ngayNhan),
            note: phieuGiao.ngayNhan ? `Người nhận: ${phieuGiao.nguoiNhan}` : null,
            completed: !!phieuGiao.ngayNhan
        }
    ];
    
    timeline.innerHTML = items.map(item => `
        <div class="timeline-item ${item.completed ? 'completed' : ''}">
            <div class="timeline-icon">${item.completed ? '✓' : ''}</div>
            <div class="timeline-content">
                <h3>${item.title}</h3>
                ${item.date ? `<p>${item.date}</p>` : '<p class="pending">Đang chờ xử lý</p>'}
                ${item.note ? `<p class="timeline-note">${item.note}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Update campaign info
function updateCampaignInfo(chienDich, sanPham) {
    if (!chienDich) return;
    
    const campaignImg = document.querySelector('.campaign-img');
    const campaignImage = chienDich.hinhAnhChienDichs && chienDich.hinhAnhChienDichs.length > 0
        ? '../' + chienDich.hinhAnhChienDichs[0].duongDan
        : '../images/banner.jpg';
    campaignImg.src = campaignImage;
    
    document.querySelector('.campaign-details h3').textContent = chienDich.tenChienDich;
    
    const ngheSi = chienDich.ngheSi;
    const metaItems = document.querySelectorAll('.meta-item');
    metaItems[0].querySelector('.meta-value').textContent = ngheSi?.tenNgheSi || 'Đang cập nhật';
    
    const startDate = chienDich.ngayBatDau ? new Date(chienDich.ngayBatDau).toLocaleDateString('vi-VN') : '';
    const endDate = chienDich.ngayKetThuc ? new Date(chienDich.ngayKetThuc).toLocaleDateString('vi-VN') : '';
    metaItems[1].querySelector('.meta-value').textContent = `${startDate} - ${endDate}`;
    
    const statusSpan = metaItems[2].querySelector('.status-success, .status-failed');
    if (chienDich.trangThai === 'Thành công') {
        statusSpan.className = 'status-success';
        statusSpan.textContent = '✓ Thành công';
    } else {
        statusSpan.className = 'status-failed';
        statusSpan.textContent = '✗ Thất bại';
    }
}

// Update product info
function updateProductInfo(sanPham, chiTietDangKy) {
    if (!sanPham) return;
    
    const productImg = document.querySelector('.product-img');
    const productImage = sanPham.hinhAnhSanPhams && sanPham.hinhAnhSanPhams.length > 0
        ? '../' + sanPham.hinhAnhSanPhams[0].duongDan
        : '../images/product-placeholder.jpg';
    productImg.src = productImage;
    
    document.querySelector('.product-info h3').textContent = sanPham.tenSanPham;
    
    // Update product specs from chiTietDangKy
    if (chiTietDangKy && chiTietDangKy.length > 0) {
        const firstItem = chiTietDangKy[0];
        const specs = document.querySelectorAll('.spec-item');
        
        specs[0].querySelector('span:last-child').textContent = firstItem.mauSac?.tenMau || 'Đang cập nhật';
        specs[1].querySelector('span:last-child').textContent = firstItem.kichThuoc?.tenSize || 'Đang cập nhật';
        
        const totalQty = chiTietDangKy.reduce((sum, item) => sum + (item.soLuong || 0), 0);
        specs[2].querySelector('span:last-child').textContent = totalQty;
    }
}

// Update betting info
function updateBettingInfo(chienDich, bangGia, registration) {
    if (!chienDich || !bangGia) return;
    
    const tongSoLuongHienTai = chienDich.tongSoLuongHienTai || 0;
    const userMin = bangGia.soLuongToiThieu || 0;
    const userMax = bangGia.soLuongToiDa || 0;
    
    // Check if bet is correct
    const isBetCorrect = tongSoLuongHienTai >= userMin && tongSoLuongHienTai <= userMax;
    
    const bettingResult = document.querySelector('.betting-result');
    if (isBetCorrect) {
        bettingResult.className = 'betting-result success';
        bettingResult.querySelector('span').textContent = 'Cược đúng - Bạn đã nhận được giá ưu đãi!';
    } else {
        bettingResult.className = 'betting-result failed';
        bettingResult.querySelector('span').textContent = 'Cược sai - Không nhận được giá ưu đãi';
    }
    
    const bettingRows = document.querySelectorAll('.betting-row');
    bettingRows[0].querySelector('.value').textContent = `${userMin} - ${userMax} sản phẩm`;
    bettingRows[1].querySelector('.value').textContent = `${tongSoLuongHienTai} sản phẩm`;
    bettingRows[2].querySelector('.value').textContent = (chienDich.giaGoc || 0).toLocaleString('vi-VN') + ' đ';
    bettingRows[3].querySelector('.value').textContent = (bangGia.donGia || 0).toLocaleString('vi-VN') + ' đ';
    
    const savings = (chienDich.giaGoc || 0) - (bangGia.donGia || 0);
    const savingsPercent = chienDich.giaGoc > 0 ? ((savings / chienDich.giaGoc) * 100).toFixed(1) : 0;
    bettingRows[4].querySelector('.value').textContent = `${savings.toLocaleString('vi-VN')} đ (${savingsPercent}%)`;
}

// Update shipping info
function updateShippingInfo(thanhToan, phieuGiao) {
    if (!thanhToan) return;
    
    const shippingRows = document.querySelectorAll('.shipping-info .info-row');
    shippingRows[0].querySelector('.info-value').textContent = thanhToan.hoTenNguoiNhan || 'Đang cập nhật';
    shippingRows[1].querySelector('.info-value').textContent = thanhToan.soDienThoaiNhan || 'Đang cập nhật';
    shippingRows[2].querySelector('.info-value').textContent = thanhToan.diaChiGiaoHang || 'Đang cập nhật';
    
    if (phieuGiao) {
        shippingRows[3].querySelector('.info-value').textContent = phieuGiao.donViVanChuyen;
        shippingRows[4].querySelector('.info-value').textContent = phieuGiao.maVanDon;
    }
}

// Update payment info
function updatePaymentInfo(thanhToan, registration, order, bangGia) {
    if (!thanhToan || !registration) return;
    
    const phiThamGia = registration.chienDich?.phiThamGia || 0;
    const soTienThanhToan = thanhToan.soTienThanhToan || 0;
    const giaChotCuoiCung = order.giaChotCuoiCung || 0;
    const soTienHoanLai = order.soTienHoanLai || 0;
    
    const paymentRows = document.querySelectorAll('.payment-breakdown .payment-row');
    paymentRows[0].querySelector('.amount').textContent = phiThamGia.toLocaleString('vi-VN') + ' đ';
    paymentRows[1].querySelector('.amount').textContent = (soTienThanhToan - phiThamGia).toLocaleString('vi-VN') + ' đ';
    paymentRows[2].querySelector('.amount').textContent = soTienThanhToan.toLocaleString('vi-VN') + ' đ';
    paymentRows[3].querySelector('.amount').textContent = '-' + soTienHoanLai.toLocaleString('vi-VN') + ' đ';
    
    const thucTra = soTienThanhToan - soTienHoanLai;
    paymentRows[4].querySelector('.amount').textContent = thucTra.toLocaleString('vi-VN') + ' đ';
    
    document.querySelector('.payment-method .method-value').textContent = thanhToan.phuongThuc || 'Đang cập nhật';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadOrderDetail();
});
