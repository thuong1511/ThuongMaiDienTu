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
            // After render, check review status and setup button
            await checkAndSetupReviewButton(data.data);
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
    const chiTietDonHangs = order.chiTietDonHangs || [];
    
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
    
    // Update product info - pass chiTietDonHangs instead of chiTietDangKy
    updateProductInfo(sanPham, chiTietDonHangs);
    
    // Update betting info
    updateBettingInfo(chienDich, bangGia, registration);
    
    // Update shipping info
    updateShippingInfo(thanhToan, phieuGiao);
    
    updatePaymentInfo(thanhToan, registration, order, bangGia);
    
    // Store order info for review button usage
    window._currentOrderId = order.maDonHang;
    window._currentCampaignId = chienDich?.maChienDich || '';
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
    
    // Update campaign images - show all images
    const campaignImgContainer = document.querySelector('.campaign-info-detail');
    if (chienDich.hinhAnhChienDichs && chienDich.hinhAnhChienDichs.length > 0) {
        const imagesHTML = chienDich.hinhAnhChienDichs.map(img => 
            `<img src="../${img.duongDan}" alt="Campaign" class="campaign-img" onerror="this.src='../images/banner.jpg'">`
        ).join('');
        
        campaignImgContainer.innerHTML = `
            <div class="campaign-images">
                ${imagesHTML}
            </div>
            <div class="campaign-details">
                <h3>${chienDich.tenChienDich}</h3>
                <div class="campaign-meta">
                    <div class="meta-item">
                        <span class="meta-label">Nghệ sĩ:</span>
                        <span class="meta-value">${chienDich.ngheSi?.tenNgheSi || 'Đang cập nhật'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Thời gian:</span>
                        <span class="meta-value">${chienDich.ngayBatDau ? new Date(chienDich.ngayBatDau).toLocaleDateString('vi-VN') : ''} - ${chienDich.ngayKetThuc ? new Date(chienDich.ngayKetThuc).toLocaleDateString('vi-VN') : ''}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Trạng thái:</span>
                        <span class="${chienDich.trangThai === 'Thành công' ? 'status-success' : 'status-failed'}">${chienDich.trangThai === 'Thành công' ? '✓ Thành công' : '✗ Thất bại'}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        const campaignImg = document.querySelector('.campaign-img');
        campaignImg.src = '../images/banner.jpg';
        
        document.querySelector('.campaign-details h3').textContent = chienDich.tenChienDich;
        
        const metaItems = document.querySelectorAll('.meta-item');
        const ngheSi = chienDich.ngheSi;
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
}

// Update product info
function updateProductInfo(sanPham, chiTietDonHangs) {
    if (!sanPham || !chiTietDonHangs || chiTietDonHangs.length === 0) return;
    
    const productContainer = document.querySelector('.info-card:has(.product-item)');
    
    // Get all product images
    const productImages = sanPham.hinhAnhSanPhams && sanPham.hinhAnhSanPhams.length > 0
        ? sanPham.hinhAnhSanPhams.map(img => '../' + img.duongDan)
        : ['../images/product-placeholder.jpg'];
    
    // Create images HTML
    const imagesHTML = productImages.map(imgSrc => 
        `<img src="${imgSrc}" alt="Product" class="product-img" onerror="this.src='../images/product-placeholder.jpg'">`
    ).join('');
    
    // Calculate total quantity
    const totalQuantity = chiTietDonHangs.reduce((sum, chiTiet) => sum + (chiTiet.soLuong || 1), 0);
    
    // Group items by color and size - using table format for alignment
    const groupedItems = chiTietDonHangs.map(chiTiet => {
        const color = chiTiet.mauSac?.tenMau || 'Đang cập nhật';
        const size = chiTiet.kichThuoc?.tenSize || 'Đang cập nhật';
        const quantity = chiTiet.soLuong || 1;
        return `
            <div class="product-variant">
                <span class="variant-color">Màu ${color}</span>
                <span class="variant-separator">-</span>
                <span class="variant-size">Size ${size}</span>
                <span class="variant-separator">:</span>
                <span class="variant-quantity">${quantity} đôi</span>
            </div>
        `;
    }).join('');
    
    productContainer.innerHTML = `
        <h2>Thông tin sản phẩm</h2>
        <div class="product-display">
            <h3 class="product-name">${sanPham.tenSanPham}</h3>
            <div class="product-total-quantity">Tổng số lượng: <strong>${totalQuantity} đôi</strong></div>
            <div class="product-content">
                <div class="product-images-row">
                    ${imagesHTML}
                </div>
                <div class="product-variants">
                    ${groupedItems}
                </div>
            </div>
        </div>
    `;
}

// Update betting info
// Update betting info
function updateBettingInfo(chienDich, bangGia, registration) {
    if (!chienDich || !bangGia) return;
    
    const tongSoLuongHienTai = chienDich.tongSoLuongHienTai || 0;
    const userMin = bangGia.soLuongToiThieu || 0;
    const userMax = bangGia.soLuongToiDa || 0;
    
    // Check if bet is correct
    const isBetCorrect = tongSoLuongHienTai >= userMin && tongSoLuongHienTai <= userMax;
    const isCampaignOngoing = chienDich.thoiDiem === 'Đang diễn ra' || chienDich.thoiDiem === 'Sắp diễn ra';
    
    const bettingResult = document.querySelector('.betting-result');
    if (isCampaignOngoing) {
        bettingResult.className = 'betting-result warning';
        bettingResult.style.background = '#fff9f0';
        bettingResult.style.color = '#e65100';
        bettingResult.style.border = '2px dashed #ffe0b2';
        bettingResult.querySelector('span').textContent = 'Chiến dịch đang diễn ra - Kết quả đặt cược sẽ có khi chiến dịch kết thúc.';
        bettingResult.querySelector('svg').innerHTML = `
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        `;
    } else if (isBetCorrect) {
        bettingResult.className = 'betting-result success';
        bettingResult.style.background = '#e8f5e9';
        bettingResult.style.color = '#2e7d32';
        bettingResult.style.border = '1px solid #c8e6c9';
        bettingResult.querySelector('span').textContent = 'Cược đúng - Bạn đã nhận được giá ưu đãi!';
        bettingResult.querySelector('svg').innerHTML = `
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        `;
    } else {
        bettingResult.className = 'betting-result failed';
        bettingResult.style.background = '#ffebee';
        bettingResult.style.color = '#c62828';
        bettingResult.style.border = '1px solid #ffcdd2';
        bettingResult.querySelector('span').textContent = 'Cược sai - Không nhận được giá ưu đãi';
        bettingResult.querySelector('svg').innerHTML = `
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        `;
    }
    
    const bettingRows = document.querySelectorAll('.betting-row');
    bettingRows[0].querySelector('.value').textContent = `${userMin} - ${userMax} sản phẩm`;
    
    if (isCampaignOngoing) {
        bettingRows[1].querySelector('.value').textContent = 'Chờ chiến dịch kết thúc';
        bettingRows[1].querySelector('.value').style.color = '#e65100';
    } else {
        bettingRows[1].querySelector('.value').textContent = `${tongSoLuongHienTai} sản phẩm`;
        bettingRows[1].querySelector('.value').style.color = '';
    }
    
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
    const daHoanTien = order.daHoanTien || false;
    
    const paymentBreakdown = document.querySelector('.payment-breakdown');
    
    paymentBreakdown.innerHTML = `
        <div class="payment-row">
            <span>Phí tham gia chiến dịch:</span>
            <span class="amount">${phiThamGia.toLocaleString('vi-VN')} đ</span>
        </div>
        <div class="payment-row">
            <span>Tiền đặt cọc ban đầu:</span>
            <span class="amount">${(soTienThanhToan - phiThamGia).toLocaleString('vi-VN')} đ</span>
        </div>
        <div class="payment-row subtotal">
            <span>Tổng đã thanh toán:</span>
            <span class="amount">${soTienThanhToan.toLocaleString('vi-VN')} đ</span>
        </div>
        <div class="divider"></div>
        ${soTienHoanLai > 0 ? `
        <div class="payment-row refund">
            <span>Hoàn lại (cược đúng):</span>
            <span class="amount">-${soTienHoanLai.toLocaleString('vi-VN')} đ</span>
        </div>
        <div class="payment-row refund-status ${daHoanTien ? 'refunded' : 'pending'}">
            <span>Trạng thái hoàn tiền:</span>
            <span class="amount">${daHoanTien ? '✓ Đã hoàn tiền' : '⏳ Đang xử lý'}</span>
        </div>
        ${daHoanTien && order.ngayHoanTien ? `
        <div class="payment-row refund-date">
            <span>Ngày hoàn tiền:</span>
            <span class="amount">${new Date(order.ngayHoanTien).toLocaleString('vi-VN')}</span>
        </div>
        ` : ''}
        <div class="divider"></div>
        ` : ''}
        <div class="payment-row total">
            <span>Thực trả:</span>
            <span class="amount">${(soTienThanhToan - soTienHoanLai).toLocaleString('vi-VN')} đ</span>
        </div>
    `;
    
    document.querySelector('.payment-method .method-value').textContent = thanhToan.phuongThuc || 'Đang cập nhật';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadOrderDetail();
});

// ─────────────────────────────────────────────
// REVIEW BUTTON SETUP
// ─────────────────────────────────────────────

async function checkAndSetupReviewButton(order) {
    const btn = document.getElementById('reviewActionBtn');
    if (!btn) return;

    // Only show review button when order is delivered
    if (order.trangThaiGiaoHang !== 'Đã giao') {
        btn.style.display = 'none';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/danhgia/check/${order.maDonHang}`);
        const result = await res.json();
        const daDanhGia = result.success && result.data === true;

        const chienDich = order.dangKyChienDich?.chienDich;
        window._currentOrderId = order.maDonHang;
        window._currentCampaignId = chienDich?.maChienDich || '';
        window._daDanhGia = daDanhGia;
        window._currentOrder = order;

        if (daDanhGia) {
            // Change to "Xem đánh giá"
            btn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Xem đánh giá
            `;
            btn.style.background = '#5f0704';
        } else {
            // Keep "Đánh giá sản phẩm"
            btn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                Đánh giá sản phẩm
            `;
        }
    } catch (e) {
        console.error('Error checking review status:', e);
    }
}

function handleReviewBtnClick() {
    if (window._daDanhGia) {
        viewReview(window._currentOrderId, window._currentCampaignId);
    } else {
        window.location.href = `review.html?orderId=${window._currentOrderId}`;
    }
}

// ─────────────────────────────────────────────
// REVIEW DIALOG (same pattern as order-history.js)
// ─────────────────────────────────────────────

async function viewReview(orderId, campaignId) {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!user) { alert('Vui lòng đăng nhập để xem đánh giá'); return; }

        const response = await fetch(`${API_BASE_URL}/danhgia/donhang/${orderId}`);
        const result = await response.json();
        if (!result.success || !result.data) { alert('Không tìm thấy đánh giá'); return; }

        const review = result.data;

        // Fetch campaign name
        let campaignName = 'Chiến dịch';
        if (campaignId) {
            const cr = await fetch(`${API_BASE_URL}/chiendich/${campaignId}`);
            const cd = await cr.json();
            if (cd.success) campaignName = cd.data.tenChienDich;
        }

        // Freeze scroll
        document.body.classList.add('no-scroll');

        // Stars + rating desc
        const starsHTML = generateStars(review.diemDanhGia);
        const ratingDescMap = { 5: 'Tuyệt vời', 4: 'Rất tốt', 3: 'Hài lòng', 2: 'Chưa hài lòng', 1: 'Tệ' };
        const desc = ratingDescMap[review.diemDanhGia] || '';

        // Format date + time
        const reviewDate = new Date(review.ngayDanhGia);
        const formattedDate = reviewDate.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
        const hh = String(reviewDate.getHours()).padStart(2, '0');
        const mm = String(reviewDate.getMinutes()).padStart(2, '0');

        // Avatar
        const firstLetter = (user.tenDangNhap || 'U').charAt(0).toUpperCase();
        const displayName = review.anDanh === 1 ? 'Người dùng ẩn danh' : (user.hoTen || user.tenDangNhap || 'Khách hàng');

        // Product info
        const order = window._currentOrder;
        const sanPham = order?.dangKyChienDich?.chienDich?.sanPham;

        // Load variants async
        const regId = order?.dangKyChienDich?.maDangKy;
        let variantHTML = '<span class="review-product-val" style="color:#888;font-style:italic;">Đang tải...</span>';

        // Images
        let imagesHTML = '';
        if (review.hinhAnhDanhGias && review.hinhAnhDanhGias.length > 0) {
            imagesHTML = review.hinhAnhDanhGias.map(img => {
                let src = img.duongDan;
                if (src.startsWith('uploads/')) src = 'http://localhost:8080/' + src;
                else if (src.startsWith('/uploads/')) src = 'http://localhost:8080' + src;
                return `
                    <div class="review-image-wrapper" onclick="openLightbox('${src}')">
                        <img src="${src}" alt="Review image">
                        <div class="review-image-overlay-zoom">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                        </div>
                    </div>`;
            }).join('');
        }

        // Populate dialog body
        document.querySelector('.review-dialog-body').innerHTML = `
            <div class="review-user-header">
                <div class="review-avatar-circle">${firstLetter}</div>
                <div class="review-user-info-meta">
                    <div class="review-user-name-wrapper">
                        <span class="review-username">${displayName}</span>
                        ${review.anDanh === 1
                            ? '<span class="review-anonymous-badge">Ẩn danh</span>'
                            : '<span class="review-verified-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>Đã mua hàng</span>'}
                    </div>
                    <div class="review-date">Đánh giá vào ${formattedDate} lúc ${hh}:${mm}</div>
                </div>
            </div>

            <div class="review-rating-block">
                <div class="review-rating">
                    <div class="stars">${starsHTML}</div>
                    <span class="rating-number">${review.diemDanhGia}.0</span>
                    <span class="review-rating-desc">| ${desc}</span>
                </div>
            </div>

            <div class="review-product-info">
                <div><span class="review-product-label">Chiến dịch:</span> <strong class="review-product-val">${campaignName}</strong></div>
                <div><span class="review-product-label">Sản phẩm:</span> <span class="review-product-val">${sanPham?.tenSanPham || 'N/A'}</span></div>
                <div id="reviewProductVariant"><span class="review-product-label">Phân loại:</span> ${variantHTML}</div>
            </div>

            <div class="review-content">${review.binhLuan ? review.binhLuan.replace(/\n/g, '<br>') : 'Không có nội dung đánh giá'}</div>

            <div class="review-images">${imagesHTML}</div>
        `;

        // Load variants
        if (regId) {
            fetch(`${API_BASE_URL}/phieuchitietdangky/dangky/${regId}`)
                .then(r => r.json())
                .then(res => {
                    const el = document.getElementById('reviewProductVariant');
                    if (!el) return;
                    if (res.success && res.data && res.data.length > 0) {
                        const txt = res.data.map(d => `${d.mauSac?.tenMau || 'N/A'} - Size ${d.kichThuoc?.tenSize || 'N/A'} (${d.soLuong} đôi)`).join(', ');
                        el.innerHTML = `<span class="review-product-label">Phân loại:</span> <span class="review-product-val">${txt}</span>`;
                    } else {
                        el.remove();
                    }
                })
                .catch(() => { const el = document.getElementById('reviewProductVariant'); if (el) el.remove(); });
        }

        document.getElementById('reviewDialog').style.display = 'flex';
    } catch (error) {
        console.error('Error fetching review:', error);
        alert('Có lỗi khi tải đánh giá');
    }
}

function closeReviewDialog() {
    document.getElementById('reviewDialog').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function generateStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= rating
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    return html;
}

function openLightbox(src) {
    const lb = document.getElementById('imageLightbox');
    const img = document.getElementById('lightboxImage');
    if (lb && img) { img.src = src; lb.style.display = 'flex'; document.body.classList.add('no-scroll'); }
}

function closeLightbox() {
    const lb = document.getElementById('imageLightbox');
    if (lb) lb.style.display = 'none';
    const dlg = document.getElementById('reviewDialog');
    if (!dlg || dlg.style.display === 'none') document.body.classList.remove('no-scroll');
}

// Close dialogs when clicking outside
document.addEventListener('click', function(e) {
    const dlg = document.getElementById('reviewDialog');
    if (e.target === dlg) closeReviewDialog();
    const lb = document.getElementById('imageLightbox');
    if (e.target === lb) closeLightbox();
});
