// Order History JavaScript
// API_BASE_URL is already defined in api.js

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userStr);
}

// Load registered campaigns for current user
async function loadRegisteredCampaigns() {
    const user = getCurrentUser();
    if (!user) return;

    const container = document.querySelector('#registered-panel .order-list');
    container.innerHTML = '<p style="text-align: center; padding: 40px;">Đang tải...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/dangkychiendich/nguoidung/${user.maNguoiDung}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            container.innerHTML = '';
            
            for (const registration of data.data) {
                // Fetch chi tiết for each registration
                const detailResponse = await fetch(`${API_BASE_URL}/phieuchitietdangky/dangky/${registration.maDangKy}`);
                const detailData = await detailResponse.json();
                
                const card = createRegistrationCard(registration, detailData.success ? detailData.data : []);
                container.appendChild(card);
            }
            
            // Start countdowns after all cards are rendered
            startCountdowns();
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom: 20px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 style="color: #666; margin: 0;">Chưa có đơn đăng ký nào</h3>
                    <p style="color: #999; margin: 10px 0 20px 0;">Hãy tham gia các chiến dịch để bắt đầu!</p>
                    <a href="campaigns.html" style="display: inline-block; background: #5f0704; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none;">
                        Khám phá chiến dịch
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading registrations:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #d32f2f;">
                <p>❌ Không thể tải danh sách đăng ký. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

// Create registration card HTML
function createRegistrationCard(registration, details) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.setAttribute('data-type', 'registered');
    card.setAttribute('data-registration-id', registration.maDangKy);

    const chienDich = registration.chienDich;
    const thanhToan = registration.thanhToan;
    const sanPham = chienDich?.sanPham;
    const bangGia = registration.bangGiaBacThang;
    
    // Create tier text from bangGia (soLuongToiThieu - soLuongToiDa)
    let userTierText = 'Đang cập nhật';
    if (bangGia) {
        const min = bangGia.soLuongToiThieu || 0;
        const max = bangGia.soLuongToiDa || 0;
        userTierText = `${min} - ${max}`;
    }
    
    // Get campaign image (first image from HinhAnhChienDichs) - FIX PATH
    const campaignImage = chienDich?.hinhAnhChienDichs && chienDich.hinhAnhChienDichs.length > 0
        ? '../' + chienDich.hinhAnhChienDichs[0].duongDan
        : '../images/banner.jpg';

    // Determine campaign status
    const now = new Date();
    const campaignEndDate = chienDich?.ngayKetThuc ? new Date(chienDich.ngayKetThuc) : null;
    const isCampaignEnded = campaignEndDate && campaignEndDate < now;
    
    // Determine refund status (only for ended campaigns, not cancelled)
    const isRefunded = thanhToan?.daHoanTien || false;
    
    // Determine status - Simple status without refund info on badge
    let statusText = '';
    let statusClass = '';
    
    if (registration.daHuy) {
        statusText = '❌ Đã hủy';
        statusClass = 'cancelled';
    } else if (isCampaignEnded) {
        statusText = '✓ Đã kết thúc';
        statusClass = 'success';
    } else {
        statusText = '⏳ Đang diễn ra';
        statusClass = 'ongoing';
    }
    
    // Set data attributes for filtering
    // For filter: "success" means not cancelled (both ongoing and ended campaigns)
    // "cancelled" means cancelled
    if (registration.daHuy) {
        card.setAttribute('data-registered-status', 'cancelled');
    } else {
        card.setAttribute('data-registered-status', 'success'); // Both ongoing and ended are considered "success" (not cancelled)
    }

    // Format date
    const registrationDate = new Date(registration.ngayDangKy).toLocaleDateString('vi-VN');

    // Calculate decision deadline (2 days after registration)
    const decisionDeadline = new Date(registration.ngayDangKy);
    decisionDeadline.setDate(decisionDeadline.getDate() + 2);
    
    // If campaign ends before decision deadline, use campaign end date
    let finalDecisionDeadline = decisionDeadline;
    if (campaignEndDate && campaignEndDate < decisionDeadline) {
        finalDecisionDeadline = campaignEndDate;
    }

    // Calculate current tier based on tongSoLuongHienTai
    let currentTierText = 'Chưa xác định';
    let isBetCorrect = false; // Check if user's bet is correct
    
    if (chienDich && chienDich.bangGiaBacThangs && chienDich.bangGiaBacThangs.length > 0) {
        const currentQty = chienDich.tongSoLuongHienTai || 0;
        const tiers = [...chienDich.bangGiaBacThangs].sort((a, b) => a.soLuongToiThieu - b.soLuongToiThieu);
        
        for (let i = tiers.length - 1; i >= 0; i--) {
            if (currentQty >= tiers[i].soLuongToiThieu) {
                const min = tiers[i].soLuongToiThieu || 0;
                const max = tiers[i].soLuongToiDa || 0;
                currentTierText = `${min} - ${max}`;
                
                // Check if this matches user's bet
                if (bangGia && bangGia.soLuongToiThieu === min && bangGia.soLuongToiDa === max) {
                    isBetCorrect = true;
                }
                break;
            }
        }
        
        // If still not found, use the first tier
        if (currentTierText === 'Chưa xác định' && tiers.length > 0) {
            const min = tiers[0].soLuongToiThieu || 0;
            const max = tiers[0].soLuongToiDa || 0;
            currentTierText = `Dưới ${min}`;
        }
        
        // Check if current quantity is within user's bet range
        if (bangGia && currentQty >= bangGia.soLuongToiThieu && currentQty <= bangGia.soLuongToiDa) {
            isBetCorrect = true;
        }
    }
    
    // Create bet status text
    let betStatusText = '';
    let betStatusColor = '#e65100';
    if (isCampaignEnded) {
        betStatusText = isBetCorrect ? ' ✓ Đúng' : ' ✗ Sai';
        betStatusColor = isBetCorrect ? '#2e7d32' : '#d32f2f';
    } else if (!registration.daHuy) {
        if (isBetCorrect) {
            betStatusText = ' ✓ Đang đạt';
            betStatusColor = '#2e7d32';
        } else {
            betStatusText = ' ✗ Chưa đạt';
            betStatusColor = '#d32f2f';
        }
    }

    // Store details in data attribute for later use
    card.dataset.details = JSON.stringify(details);

    card.innerHTML = `
        <div class="order-header">
            <div class="order-id">
                <span class="label">Mã đơn đăng ký:</span>
                <span class="value">#${registration.maDangKy}</span>
            </div>
            <span class="order-status ${statusClass}">${statusText}</span>
        </div>

        <div class="order-body">
            <div class="order-image">
                <img src="${campaignImage}" alt="${chienDich?.tenChienDich || 'Campaign'}" 
                     onerror="this.src='../images/banner.jpg'">
            </div>
            <div class="order-info">
                <h3>${chienDich?.tenChienDich || 'Chiến dịch'}</h3>
                <div class="order-details">
                    <div class="detail-row">
                        <span class="detail-label">Sản phẩm:</span>
                        <span class="detail-value">${sanPham?.tenSanPham || 'Đang cập nhật'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Ngày tham gia:</span>
                        <span class="detail-value">${registrationDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Số lượng:</span>
                        <span class="detail-value">${registration.tongSoLuong} sản phẩm</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Mốc đặt cược của bạn:</span>
                        <span class="detail-value bet-pending">${userTierText}${betStatusText ? `<span style="color: ${betStatusColor}; font-weight: 700;">${betStatusText}</span>` : ''}</span>
                    </div>
                    ${!registration.daHuy && chienDich ? `
                    <div class="detail-row">
                        <span class="detail-label">Mốc hiện tại:</span>
                        <span class="detail-value" style="color: #e65100; font-weight: 700;">${currentTierText}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tiến độ hiện tại:</span>
                        <span class="detail-value">${chienDich.tongSoLuongHienTai || 0} / ${chienDich.nguongToiDa || 0} sản phẩm</span>
                    </div>
                    ` : ''}
                </div>
                ${!registration.daHuy && campaignEndDate && !isCampaignEnded ? `
                <div class="countdown-mini">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Kết thúc sau: <span class="campaign-countdown" data-deadline="${campaignEndDate.toISOString()}">Đang tính...</span></span>
                </div>
                ` : ''}
            </div>
            <div class="order-payment">
                ${!registration.daHuy && !isCampaignEnded ? `
                <div class="decision-countdown-box">
                    <div class="decision-countdown-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span>Thời gian quyết định:</span>
                    </div>
                    <div class="decision-countdown-time">
                        <strong class="decision-countdown" data-deadline="${finalDecisionDeadline.toISOString()}">Đang tính...</strong>
                    </div>
                </div>
                ` : ''}
                <div class="payment-row">
                    <span>Đã thanh toán:</span>
                    <span class="amount">${(thanhToan?.soTienThanhToan || 0).toLocaleString('vi-VN')} đ</span>
                </div>
                ${registration.daHuy ? `
                <div class="payment-row" style="color: #d32f2f;">
                    <span>Trạng thái:</span>
                    <span class="amount">Đã hủy</span>
                </div>
                ` : isCampaignEnded ? `
                <div class="payment-row refund-status ${isRefunded ? 'refunded' : 'not-refunded'}">
                    <span>${isRefunded ? '✓ Đã hoàn tiền' : '⏳ Chưa hoàn tiền'}</span>
                    <span class="amount">${isRefunded ? (thanhToan?.soTienHoanLai || 0).toLocaleString('vi-VN') + ' đ' : 'Đang xử lý'}</span>
                </div>
                ` : `
                <div class="payment-row pending">
                    <span>Chờ kết quả:</span>
                    <span class="amount">Đang chờ</span>
                </div>
                `}
            </div>
        </div>

        <div class="order-footer">
            <div class="order-actions">
                <button class="btn-detail" onclick="viewRegistrationDetail(${registration.maDangKy})">Xem chi tiết</button>
                ${!registration.daHuy && !isCampaignEnded ? `
                <button class="btn-cancel" onclick="cancelRegistration(${registration.maDangKy})">Hủy đơn</button>
                ` : ''}
            </div>
        </div>
    `;

    // Debug log to check data
    console.log('Registration data:', {
        maDangKy: registration.maDangKy,
        bangGia: bangGia,
        tenBac: bangGia?.tenBac,
        chienDich: chienDich,
        bangGiaBacThangs: chienDich?.bangGiaBacThangs,
        tongSoLuongHienTai: chienDich?.tongSoLuongHienTai,
        currentTierText: currentTierText,
        isCampaignEnded: isCampaignEnded,
        isRefunded: isRefunded
    });

    return card;
}

// Countdown functions
function startCountdowns() {
    // Campaign countdown
    const campaignCountdowns = document.querySelectorAll('.campaign-countdown');
    campaignCountdowns.forEach(countdown => {
        const deadline = new Date(countdown.getAttribute('data-deadline')).getTime();
        updateCampaignCountdown(countdown, deadline);
        setInterval(() => updateCampaignCountdown(countdown, deadline), 1000);
    });

    // Decision countdown
    const decisionCountdowns = document.querySelectorAll('.decision-countdown');
    decisionCountdowns.forEach(countdown => {
        const deadline = new Date(countdown.getAttribute('data-deadline')).getTime();
        updateDecisionCountdown(countdown, deadline);
        setInterval(() => updateDecisionCountdown(countdown, deadline), 1000);
    });
}

function updateCampaignCountdown(element, deadline) {
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance < 0) {
        element.textContent = 'Đã kết thúc';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    element.textContent = `${String(days).padStart(2, '0')} ngày ${String(hours).padStart(2, '0')} giờ`;
}

function updateDecisionCountdown(element, deadline) {
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance < 0) {
        element.textContent = 'Đã hết hạn';
        element.style.color = '#d32f2f';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    
    element.textContent = `${String(days).padStart(2, '0')} ngày ${String(hours).padStart(2, '0')} giờ ${String(minutes).padStart(2, '0')} phút`;
}

// View registration detail - Show modal with product details
function viewRegistrationDetail(maDangKy) {
    const card = document.querySelector(`[data-registration-id="${maDangKy}"]`);
    if (!card) return;
    
    const details = JSON.parse(card.dataset.details || '[]');
    
    if (details.length === 0) {
        alert('Chưa có chi tiết sản phẩm cho đơn đăng ký này.');
        return;
    }
    
    const detailsHTML = details.map((detail, index) => `
        <div style="background: #f9f9f9; padding: 12px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #d4af37;">
            <strong style="color: #5f0704; font-size: 15px;">Đôi ${index + 1}:</strong>
            <div style="margin-top: 8px; font-size: 14px;">
                <div style="margin: 5px 0;">
                    <span style="color: #666;">Màu sắc:</span> 
                    <strong>${detail.mauSac?.tenMau || 'N/A'}</strong>
                </div>
                <div style="margin: 5px 0;">
                    <span style="color: #666;">Kích thước:</span> 
                    <strong>${detail.kichThuoc?.tenSize || 'N/A'}</strong>
                </div>
                <div style="margin: 5px 0;">
                    <span style="color: #666;">Số lượng:</span> 
                    <strong>${detail.soLuong} đôi</strong>
                </div>
            </div>
        </div>
    `).join('');
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 15px;">
                <h3 style="margin: 0; color: #5f0704; font-size: 20px;">Chi tiết sản phẩm</h3>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #999; line-height: 1;">&times;</button>
            </div>
            <div style="margin-bottom: 15px;">
                <strong style="color: #5f0704;">Mã đơn đăng ký:</strong> #${maDangKy}
            </div>
            ${detailsHTML}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Cancel registration
async function cancelRegistration(maDangKy) {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn đăng ký này?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/dangkychiendich/${maDangKy}/huy`, {
            method: 'PUT'
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Hủy đơn đăng ký thành công!');
            loadRegisteredCampaigns(); // Reload list
        } else {
            alert('✗ ' + (data.message || 'Không thể hủy đơn đăng ký'));
        }
    } catch (error) {
        console.error('Error canceling registration:', error);
        alert('✗ Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadRegisteredCampaigns();
    
    // Add filter functionality for registered orders (tab buttons)
    const registeredFilterTabs = document.querySelectorAll('[data-registered-filter]');
    registeredFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            registeredFilterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            const filterValue = tab.getAttribute('data-registered-filter');
            filterRegisteredOrders(filterValue);
        });
    });
});

// Filter registered orders based on selected status
function filterRegisteredOrders(filterValue) {
    const orderCards = document.querySelectorAll('#registered-panel .order-card');
    
    orderCards.forEach(card => {
        const status = card.getAttribute('data-registered-status');
        
        let shouldShow = false;
        
        switch(filterValue) {
            case 'all':
                shouldShow = true;
                break;
            case 'success':
                shouldShow = status === 'success';
                break;
            case 'cancelled':
                shouldShow = status === 'cancelled';
                break;
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
    });
}
