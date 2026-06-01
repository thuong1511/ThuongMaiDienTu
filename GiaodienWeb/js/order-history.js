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
    
    // Get price from bangGia - use donGia instead of giaGoc
    const giaBacThang = bangGia?.donGia || bangGia?.giaGoc || 0;
    
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
    
    // Calculate refund amount for ended campaigns
    let soTienHoanLai = 0;
    let isRefunded = false;
    
    if (registration.daHuy) {
        // For cancelled registrations, use the value from database (set by trigger)
        soTienHoanLai = registration.soTienHoanLai || 0;
        isRefunded = registration.daHoanTien || false;
    } else if (isCampaignEnded) {
        // For ended campaigns, calculate refund based on bet result
        const soTienThanhToan = thanhToan?.soTienThanhToan || 0;
        const phiThamGia = chienDich?.phiThamGia || 0;
        
        // Check if bet is correct first (will be calculated below)
        // We'll update this after calculating isBetCorrect
        
        // Check if refund has been processed (from backend)
        isRefunded = registration.daHoanTien || false;
    }
    
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
        
        // Check if user's bet is achieved:
        // - If current quantity is within user's bet range, OR
        // - If current quantity is ABOVE user's bet range (milestone achieved)
        if (bangGia && currentQty >= bangGia.soLuongToiThieu) {
            isBetCorrect = true;
        }
    }
    
    // Create bet status text
    let betStatusText = '';
    let betStatusColor = '#e65100';
    if (isCampaignEnded) {
        betStatusText = isBetCorrect ? ' ✓ Đúng' : ' ✗ Sai';
        betStatusColor = isBetCorrect ? '#2e7d32' : '#d32f2f';
        
        // Calculate refund amount for ended campaigns (if not already set)
        if (!registration.daHuy && soTienHoanLai === 0) {
            const soTienThanhToan = thanhToan?.soTienThanhToan || 0;
            const phiThamGia = chienDich?.phiThamGia || 0;
            const soLuong = registration.tongSoLuong || 1;
            
            if (isBetCorrect) {
                // Correct bet: Refund = Total payment - (Price per item × Quantity + Participation fee)
                const giaSanPham = giaBacThang * soLuong;
                const thucTePhaiTra = giaSanPham + phiThamGia;
                soTienHoanLai = soTienThanhToan - thucTePhaiTra;
                
                // Fallback: if calculation doesn't work, use participation fee
                if (soTienHoanLai <= 0 || isNaN(soTienHoanLai)) {
                    soTienHoanLai = phiThamGia;
                }
            } else {
                // Wrong bet: No refund
                soTienHoanLai = 0;
            }
        }
    } else if (!registration.daHuy) {
        if (isBetCorrect) {
            betStatusText = ' ✓ Đang đạt';
            betStatusColor = '#2e7d32';
        } else {
            betStatusText = ' ✗ Chưa đạt';
            betStatusColor = '#d32f2f';
        }
    }

    // Store details and registration attributes for later use in detail popup
    card.dataset.details = JSON.stringify(details);
    card.dataset.registration = JSON.stringify(registration);
    card.dataset.isBetCorrect = isBetCorrect;
    card.dataset.betStatusText = betStatusText || '';
    card.dataset.betStatusColor = betStatusColor;
    card.dataset.userTierText = userTierText;
    card.dataset.giaBacThang = giaBacThang;
    card.dataset.currentTierText = currentTierText;
    card.dataset.soTienHoanLai = soTienHoanLai;
    card.dataset.registrationDate = registrationDate;

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
                </div>
            </div>
            <div class="order-payment">
                <div class="payment-row">
                    <span>Tổng thanh toán:</span>
                    <span class="amount">${(thanhToan?.soTienThanhToan || 0).toLocaleString('vi-VN')} đ</span>
                </div>
                <div class="payment-row pending" style="margin-top: 8px;">
                    <span>Kết quả:</span>
                    <span class="amount" style="color: ${registration.daHuy ? '#777' : (isCampaignEnded ? (isBetCorrect ? '#2e7d32' : '#d32f2f') : '#e65100')}; font-weight: 700;">
                        ${registration.daHuy ? 'Đã hủy' : (isCampaignEnded ? (isBetCorrect ? 'Cược đúng ✓' : 'Cược sai ✗') : 'Đang chờ')}
                    </span>
                </div>
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
    const registration = JSON.parse(card.dataset.registration || '{}');
    
    if (details.length === 0) {
        alert('Chưa có chi tiết sản phẩm cho đơn đăng ký này.');
        return;
    }
    
    const chienDich = registration.chienDich;
    const thanhToan = registration.thanhToan;
    const sanPham = chienDich?.sanPham;
    
    const registrationDate = card.dataset.registrationDate;
    const userTierText = card.dataset.userTierText;
    const betStatusText = card.dataset.betStatusText;
    const betStatusColor = card.dataset.betStatusColor;
    const currentTierText = card.dataset.currentTierText;
    const giaBacThang = parseFloat(card.dataset.giaBacThang || 0);
    const soTienHoanLai = parseFloat(card.dataset.soTienHoanLai || 0);
    const isBetCorrect = card.dataset.isBetCorrect === 'true';
    
    // Determine campaign status
    const now = new Date();
    const campaignEndDate = chienDich?.ngayKetThuc ? new Date(chienDich.ngayKetThuc) : null;
    const isCampaignEnded = campaignEndDate && campaignEndDate < now;
    
    const detailsHTML = details.map((detail, index) => `
        <div style="background: #fdfbf7; padding: 15px; margin: 10px 0; border-radius: 10px; border: 1px solid rgba(196, 168, 127, 0.3); display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong style="color: #5f0704; font-size: 15px;">Phân loại #${index + 1}</strong>
                <div style="margin-top: 5px; font-size: 14px; color: #555;">
                    Màu sắc: <strong style="color: #111;">${detail.mauSac?.tenMau || 'N/A'}</strong> | 
                    Kích thước: <strong style="color: #111;">${detail.kichThuoc?.tenSize || 'N/A'}</strong>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="font-size: 13px; color: #666;">Số lượng</span>
                <div style="font-size: 16px; font-weight: 800; color: #5f0704;">${detail.soLuong} đôi</div>
            </div>
        </div>
    `).join('');

    let betBadge = '';
    if (registration.daHuy) {
        betBadge = '<span style="color: #777; font-weight: 700;">Đơn đã hủy</span>';
    } else {
        betBadge = `${userTierText} ${betStatusText ? `<span style="color: ${betStatusColor}; font-weight: 700;">(${betStatusText.trim()})</span>` : ''}`;
    }

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'Nunito', sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 24px; border: 3px solid #d4af37; max-width: 600px; width: 92%; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(95, 7, 4, 0.15); animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden;">
            <style>
                @keyframes modalFadeIn {
                    from { transform: translateY(15px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .modal-body::-webkit-scrollbar {
                    width: 6px;
                }
                .modal-body::-webkit-scrollbar-track {
                    background: #fdfbf7;
                }
                .modal-body::-webkit-scrollbar-thumb {
                    background: #c4a87f;
                    border-radius: 10px;
                }
                .modal-body::-webkit-scrollbar-thumb:hover {
                    background: #5f0704;
                }
                .modal-card {
                    background: #fdfbf7;
                    border: 1px solid rgba(196, 168, 127, 0.3);
                    border-radius: 16px;
                    padding: 18px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(95, 7, 4, 0.02);
                }
                .modal-card-title {
                    font-size: 13px;
                    font-weight: 800;
                    color: #5f0704;
                    margin-bottom: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-left: 3px solid #d4af37;
                    padding-left: 8px;
                }
                .modal-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px dashed rgba(196, 168, 127, 0.2);
                    font-size: 14px;
                }
                .modal-row:last-child {
                    border-bottom: none;
                }
                .modal-label {
                    color: #666;
                    font-weight: 600;
                }
                .modal-value {
                    color: #111;
                    font-weight: 700;
                    text-align: right;
                }
                .modal-badge {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }
            </style>
            
            <!-- Header -->
            <div style="background: #5f0704; padding: 22px 30px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; border-bottom: 1px solid rgba(196, 168, 127, 0.2);">
                <h3 style="margin: 0; color: #fff; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">Chi Tiết Đơn Đăng Ký</h3>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="background: none; border: none; font-size: 32px; cursor: pointer; color: #d4af37; line-height: 1; transition: transform 0.2s; display: flex; align-items: center;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">&times;</button>
            </div>
            
            <!-- Scrollable Body -->
            <div class="modal-body" style="padding: 30px; overflow-y: auto; flex: 1;">
                <!-- Registration ID & Date -->
                <div style="display: flex; justify-content: space-between; background: linear-gradient(135deg, #5f0704, #870b07); padding: 18px 24px; border-radius: 16px; margin-bottom: 24px; color: white; box-shadow: 0 4px 15px rgba(95, 7, 4, 0.15);">
                    <div>
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.7); font-weight: 700;">Mã đơn đăng ký</span>
                        <div style="font-size: 22px; font-weight: 800; color: #d4af37; margin-top: 4px;">#${registration.maDangKy}</div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.7); font-weight: 700;">Ngày tham gia</span>
                        <div style="font-size: 16px; font-weight: 700; color: white; margin-top: 8px;">${registrationDate}</div>
                    </div>
                </div>

                <!-- Campaign Info Card -->
                <div class="modal-card">
                    <div class="modal-card-title">Thông tin chiến dịch</div>
                    <div class="modal-row">
                        <span class="modal-label">Chiến dịch:</span>
                        <span class="modal-value" style="color: #5f0704;">${chienDich?.tenChienDich || 'N/A'}</span>
                    </div>
                    <div class="modal-row">
                        <span class="modal-label">Sản phẩm:</span>
                        <span class="modal-value">${sanPham?.tenSanPham || 'N/A'}</span>
                    </div>
                    <div class="modal-row">
                        <span class="modal-label">Tổng số lượng đặt mua:</span>
                        <span class="modal-value">${registration.tongSoLuong} sản phẩm</span>
                    </div>
                </div>

                <!-- Bet & Progress Card -->
                <div class="modal-card">
                    <div class="modal-card-title">Tiến độ &amp; Đặt cược</div>
                    <div class="modal-row">
                        <span class="modal-label">Mốc cược của bạn:</span>
                        <span class="modal-value">${betBadge}</span>
                    </div>
                    ${!registration.daHuy && chienDich ? `
                    <div class="modal-row">
                        <span class="modal-label">Trạng thái MOQ chiến dịch:</span>
                        <span class="modal-value" style="color: ${chienDich.tongSoLuongHienTai >= (chienDich.nguongMOQ || 0) ? '#2e7d32' : '#e65100'}; font-weight: 800;">
                            ${chienDich.tongSoLuongHienTai >= (chienDich.nguongMOQ || 0) ? '✓ Đã đạt MOQ sản xuất (Chắc chắn sản xuất)' : '⏳ Đang gom số lượng đạt MOQ'}
                        </span>
                    </div>
                    ` : ''}
                </div>

                <!-- Product Variation Card -->
                <div class="modal-card">
                    <div class="modal-card-title">Chi tiết phân loại sản phẩm</div>
                    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
                        ${detailsHTML}
                    </div>
                </div>

                <!-- Financial Card -->
                <div class="modal-card" style="margin-bottom: 5px;">
                    <div class="modal-card-title">Thông tin thanh toán</div>
                    <div class="modal-row">
                        <span class="modal-label">Giá gốc của sản phẩm:</span>
                        <span class="modal-value">${(chienDich?.giaGoc || 0).toLocaleString('vi-VN')} đ/sp</span>
                    </div>
                    <div class="modal-row">
                        <span class="modal-label">Giá bậc thang đặt cược:</span>
                        <span class="modal-value">${giaBacThang.toLocaleString('vi-VN')} đ/sp</span>
                    </div>
                    <div class="modal-row">
                        <span class="modal-label">Phí tham gia chiến dịch:</span>
                        <span class="modal-value">${(chienDich?.phiThamGia || 0).toLocaleString('vi-VN')} đ</span>
                    </div>
                    
                    <div style="background: rgba(95, 7, 4, 0.03); border: 1px solid rgba(95, 7, 4, 0.1); border-radius: 10px; padding: 12px; margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; color: #5f0704; font-size: 14px;">Tổng thanh toán đặt cọc:</span>
                        <span style="font-size: 18px; color: #5f0704; font-weight: 800;">${(thanhToan?.soTienThanhToan || 0).toLocaleString('vi-VN')} đ</span>
                    </div>
                    
                    ${registration.daHuy ? `
                    <div style="background: rgba(158, 158, 158, 0.08); border: 1px dashed #9e9e9e; border-radius: 10px; padding: 12px; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666; font-weight: 600;">Trạng thái:</span>
                            <span style="color: #d32f2f; font-weight: 700;">Đã hủy &amp; hoàn tiền</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 8px;">
                            <span style="color: #2e7d32; font-weight: 700;">Số tiền hoàn lại:</span>
                            <span style="color: #2e7d32; font-weight: 800; font-size: 16px;">${soTienHoanLai.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>
                    ` : isCampaignEnded ? `
                    <div style="background: rgba(76, 175, 80, 0.05); border: 1px dashed #4caf50; border-radius: 10px; padding: 12px; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666; font-weight: 600;">Kết quả cược:</span>
                            <span style="color: ${isBetCorrect ? '#2e7d32' : '#d32f2f'}; font-weight: 700;">${isBetCorrect ? 'Cược đúng ✓' : 'Cược sai ✗'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666; font-weight: 600;">Thực tế phải trả:</span>
                            <span style="color: #111; font-weight: 700;">${((giaBacThang * (registration.tongSoLuong || 1)) + (chienDich?.phiThamGia || 0)).toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(76, 175, 80, 0.15); padding-top: 8px;">
                            <span style="color: #2e7d32; font-weight: 700;">Số tiền hoàn lại:</span>
                            <span style="color: #2e7d32; font-weight: 800; font-size: 16px;">${soTienHoanLai.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>
                    ` : `
                    <div style="background: rgba(255, 152, 0, 0.05); border: 1px dashed #ff9800; border-radius: 10px; padding: 12px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 14px;">
                        <span style="color: #e65100; font-weight: 700;">Kết quả chiến dịch:</span>
                        <span style="color: #e65100; font-weight: 800;">Đang chờ kết quả</span>
                    </div>
                    `}
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #fdfbf7; padding: 20px 30px; border-top: 1px solid rgba(196, 168, 127, 0.3); text-align: right; flex-shrink: 0; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
                <button onclick="this.closest('div[style*=fixed]').remove()" style="padding: 12px 30px; background: #5f0704; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 14px; box-shadow: 0 4px 10px rgba(95, 7, 4, 0.2);" onmouseover="this.style.background='#be9d4a'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='#5f0704'; this.style.transform='none';">Đóng</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}


// Cancel registration
function cancelRegistration(maDangKy) {
    showPremiumConfirm('Bạn có chắc chắn muốn hủy đơn đăng ký này?', async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/dangkychiendich/${maDangKy}/huy`, {
                method: 'PUT'
            });

            const data = await response.json();

            if (data.success) {
                showPremiumAlert('Hủy đơn đăng ký thành công!', true);
                loadRegisteredCampaigns(); // Reload list
            } else {
                // Remove prefix "Lỗi: " if present in data.message for cleaner custom display
                let cleanMessage = data.message || 'Không thể hủy đơn đăng ký';
                if (cleanMessage.startsWith('Lỗi: ')) {
                    cleanMessage = cleanMessage.substring(5);
                }
                showPremiumAlert(cleanMessage, false);
            }
        } catch (error) {
            console.error('Error canceling registration:', error);
            showPremiumAlert('Có lỗi xảy ra. Vui lòng thử lại sau.', false);
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load registered campaigns (tab 1)
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
    
    // Add main tab switching functionality
    const mainTabs = document.querySelectorAll('.main-tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    let ordersLoaded = false; // Track if orders have been loaded
    
    mainTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all main tabs
            mainTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const mainTab = tab.getAttribute('data-main-tab');

            // Show/hide panels
            tabPanels.forEach(panel => {
                if (panel.id === mainTab + '-panel') {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
            
            // If switching to orders tab and not loaded yet, load it
            if (mainTab === 'orders' && !ordersLoaded) {
                loadOrders();
                ordersLoaded = true;
            }
        });
    });

    // Order filter functionality (for "Đơn hàng của tôi" tab)
    const filterTabs = document.querySelectorAll('#orders-panel .tab-btn[data-filter]');
    const subFilterContainer = document.getElementById('success-sub-filters');
    const subFilterTabs = document.querySelectorAll('.sub-tab-btn');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');

            // Show/hide sub-filters
            if (filter === 'success') {
                subFilterContainer.style.display = 'flex';
                // Reset to "Tất cả" sub-filter
                subFilterTabs.forEach(st => st.classList.remove('active'));
                subFilterTabs[0].classList.add('active');
            } else {
                subFilterContainer.style.display = 'none';
            }

            // Show/hide orders based on filter
            const orderCards = document.querySelectorAll('#orders-panel .order-card');
            orderCards.forEach(card => {
                const status = card.getAttribute('data-status');
                
                if (filter === 'all') {
                    card.style.display = 'block';
                } else if (filter === status) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Sub-filter functionality for "Chiến dịch thành công"
    subFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all sub-tabs
            subFilterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const subFilter = tab.getAttribute('data-sub-filter');

            // Show/hide orders based on sub-filter
            const orderCards = document.querySelectorAll('#orders-panel .order-card');
            orderCards.forEach(card => {
                const status = card.getAttribute('data-status');
                const shipping = card.getAttribute('data-shipping');
                
                // Only filter success orders
                if (status === 'success') {
                    if (subFilter === 'all-success') {
                        card.style.display = 'block';
                    } else if (subFilter === shipping) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
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

// ═══════════════════════════════════════════════════════════════
// ĐƠN HÀNG CỦA TÔI (Orders Tab)
// ═══════════════════════════════════════════════════════════════


// ============================================
// LOAD ĐƠN HÀNG (Orders Tab)
// ============================================

// Load orders for current user
async function loadOrders() {
    const user = getCurrentUser();
    if (!user) return;

    const container = document.querySelector('#orders-panel .order-list');
    container.innerHTML = '<p style="text-align: center; padding: 40px;">Đang tải đơn hàng...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/donhang/nguoidung/${user.maNguoiDung}`);
        const data = await response.json();

        console.log('Orders API response:', data);

        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = '';
            
            data.data.forEach(order => {
                const card = createOrderCard(order);
                container.appendChild(card);
            });
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom: 20px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 style="color: #666; margin: 0;">Chưa có đơn hàng nào</h3>
                    <p style="color: #999; margin: 10px 0;">Đơn hàng sẽ được tạo sau khi chiến dịch kết thúc</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #d32f2f;">
                <p>❌ Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

// Create order card HTML
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    const registration = order.dangKyChienDich;
    const chienDich = registration?.chienDich;
    const sanPham = chienDich?.sanPham;
    const thanhToan = registration?.thanhToan;
    const phieuGiao = order.phieuGiaoHang;
    const bangGia = registration?.bangGiaBacThang;
    
    // Determine campaign status (success/failed)
    const campaignStatus = chienDich?.trangThai || 'Đang xử lý';
    const isSuccess = campaignStatus === 'Thành công';
    
    // Set data attributes for filtering
    card.setAttribute('data-status', isSuccess ? 'success' : 'failed');
    
    // Determine shipping status for sub-filtering
    let shippingStatus = 'preparing';
    let shippingStatusText = '📦 Đang chuẩn bị';
    let shippingStatusClass = 'preparing';
    
    if (order.trangThaiGiaoHang === 'Đã giao') {
        shippingStatus = 'delivered';
        shippingStatusText = '✓ Đã giao hàng';
        shippingStatusClass = 'delivered';
    } else if (order.trangThaiGiaoHang === 'Đang giao') {
        shippingStatus = 'shipping';
        shippingStatusText = '🚚 Đang giao hàng';
        shippingStatusClass = 'shipping';
    }
    card.setAttribute('data-shipping', shippingStatus);
    
    // Get campaign image
    const campaignImage = chienDich?.hinhAnhChienDichs && chienDich.hinhAnhChienDichs.length > 0
        ? '../' + chienDich.hinhAnhChienDichs[0].duongDan
        : '../images/banner.jpg';
    
    // Format dates
    const orderDate = order.ngayTaoDon ? new Date(order.ngayTaoDon).toLocaleDateString('vi-VN') : 'N/A';
    
    // Calculate total quantity
    const totalQuantity = registration?.tongSoLuong || 0;
    
    // Get refund info
    const daHoanTien = order.daHoanTien;
    const soTienHoanLai = order.soTienHoanLai || 0;
    const giaChotCuoiCung = order.giaChotCuoiCung || 0;
    const soTienThanhToan = thanhToan?.soTienThanhToan || 0;
    
    card.innerHTML = `
        <div class="order-header">
            <div class="order-id">
                <span class="label">Mã đơn hàng:</span>
                <span class="value">#${order.maDonHang}</span>
            </div>
            <span class="order-status ${shippingStatusClass}">${shippingStatusText}</span>
        </div>

        <div class="order-body">
            <div class="order-image">
                <img src="${campaignImage}" alt="${chienDich?.tenChienDich || 'Campaign'}" 
                     onerror="this.src='../images/banner.jpg'">
            </div>
            <div class="order-info">
                <h3>${chienDich?.tenChienDich || 'Đang cập nhật'}</h3>
                <div class="order-details">
                    <div class="detail-row">
                        <span class="detail-label">Sản phẩm:</span>
                        <span class="detail-value">${sanPham?.tenSanPham || 'Đang cập nhật'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Ngày tạo đơn:</span>
                        <span class="detail-value">${orderDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Số lượng:</span>
                        <span class="detail-value">${totalQuantity} sản phẩm</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Giá chốt cuối cùng:</span>
                        <span class="detail-value">${giaChotCuoiCung.toLocaleString('vi-VN')} đ/sp</span>
                    </div>
                    ${phieuGiao ? `
                    <div class="detail-row">
                        <span class="detail-label">Đơn vị vận chuyển:</span>
                        <span class="detail-value">${phieuGiao.donViVanChuyen}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Mã vận đơn:</span>
                        <span class="detail-value tracking">${phieuGiao.maVanDon}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="order-payment">
                <div class="payment-row">
                    <span>Tổng thanh toán:</span>
                    <span class="amount">${soTienThanhToan.toLocaleString('vi-VN')} đ</span>
                </div>
                ${daHoanTien ? `
                <div class="payment-row refund">
                    <span>Đã hoàn tiền:</span>
                    <span class="amount">-${soTienHoanLai.toLocaleString('vi-VN')} đ</span>
                </div>
                <div class="payment-row total">
                    <span>Thực trả:</span>
                    <span class="amount">${(soTienThanhToan - soTienHoanLai).toLocaleString('vi-VN')} đ</span>
                </div>
                ` : `
                <div class="payment-row total">
                    <span>Thực trả:</span>
                    <span class="amount">${soTienThanhToan.toLocaleString('vi-VN')} đ</span>
                </div>
                `}
            </div>
        </div>

        <div class="order-footer">
            <div class="order-actions">
                <button class="btn-detail" onclick="viewOrderDetail('${order.maDonHang}')">Xem chi tiết</button>
                ${shippingStatus === 'delivered' ? `
                <button class="btn-review" onclick="window.location.href='review.html?orderId=${order.maDonHang}'">Đánh giá</button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// View order detail
function viewOrderDetail(maDonHang) {
    window.location.href = `order-detail.html?orderId=${maDonHang}`;
}
