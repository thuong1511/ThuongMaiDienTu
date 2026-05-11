// Payment Success Page JavaScript
let registrationData = null;
let campaignData = null;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎉 Payment success page loaded');
    
    // Get maDangKy from URL
    const urlParams = new URLSearchParams(window.location.search);
    const maDangKy = urlParams.get('maDangKy');
    
    if (!maDangKy) {
        console.error('❌ No registration ID found in URL');
        console.error('Current URL:', window.location.href);
        console.error('URL Params:', urlParams.toString());
        alert('Không tìm thấy thông tin đơn hàng!\n\nVui lòng kiểm tra Console (F12) để xem chi tiết lỗi.');
        // Don't redirect - stay on page for debugging
        return;
    }
    
    try {
        // Load registration data from API
        await loadRegistrationData(maDangKy);
        
        // Update page content
        updateOrderInfo();
        updateProgressAlert();
        startDecisionCountdown();
    } catch (error) {
        console.error('❌ Error loading registration data:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            maDangKy: maDangKy
        });
        alert('Không thể tải thông tin đơn hàng!\n\nVui lòng kiểm tra Console (F12) để xem chi tiết lỗi.');
        // Don't redirect - stay on page for debugging
    }
});

// Load registration data from API
async function loadRegistrationData(maDangKy) {
    console.log('📡 Loading registration data for ID:', maDangKy);
    
    try {
        // Get registration details
        const regResponse = await fetch(`${API_BASE_URL}/dangkychiendich/${maDangKy}`);
        
        if (!regResponse.ok) {
            throw new Error(`HTTP error! status: ${regResponse.status}`);
        }
        
        const regResult = await regResponse.json();
        
        if (!regResult.success || !regResult.data) {
            throw new Error(regResult.message || 'Failed to load registration data');
        }
        
        registrationData = regResult.data;
        console.log('✅ Registration data loaded:', registrationData);
        console.log('📋 Registration data keys:', Object.keys(registrationData));
        console.log('📋 chienDich object:', registrationData.chienDich);
        
        // Check if chienDich object exists in response
        if (registrationData.chienDich) {
            // Use chienDich from registration data
            campaignData = registrationData.chienDich;
            console.log('✅ Campaign data loaded from registration:', campaignData);
        } else {
            // Fallback: fetch campaign separately if not included
            const maChienDich = registrationData.maChienDich;
            console.log('📋 maChienDich:', maChienDich);
            
            if (!maChienDich) {
                throw new Error('maChienDich is missing from registration data');
            }
            
            const campaignResponse = await fetch(`${API_BASE_URL}/chiendich/${maChienDich}`);
            
            if (!campaignResponse.ok) {
                throw new Error(`HTTP error! status: ${campaignResponse.status}`);
            }
            
            const campaignResult = await campaignResponse.json();
            
            if (!campaignResult.success || !campaignResult.data) {
                throw new Error(campaignResult.message || 'Failed to load campaign data');
            }
            
            campaignData = campaignResult.data;
            console.log('✅ Campaign data loaded from API:', campaignData);
        }
        
        // Get registration details (product matrix)
        const detailsResponse = await fetch(`${API_BASE_URL}/phieuchitietdangky/dangky/${maDangKy}`);
        
        if (detailsResponse.ok) {
            const detailsResult = await detailsResponse.json();
            
            if (detailsResult.success && detailsResult.data) {
                registrationData.chiTietList = detailsResult.data;
                console.log('✅ Registration details loaded:', registrationData.chiTietList);
            }
        }
    } catch (error) {
        console.error('❌ Error in loadRegistrationData:', error);
        throw error;
    }
}

// Update order information
function updateOrderInfo() {
    if (!registrationData || !campaignData) return;
    
    // Update campaign name in subtitle
    const subtitle = document.querySelector('.success-subtitle');
    if (subtitle) {
        subtitle.textContent = `Bạn đã tham gia chiến dịch ${campaignData.tenChienDich}`;
    }
    
    // Update order ID
    const orderIdEl = document.getElementById('order-id');
    if (orderIdEl) {
        orderIdEl.textContent = `#EXED-${String(registrationData.maDangKy).padStart(6, '0')}`;
    }
    
    // Update product name
    const productNameEl = document.getElementById('product-name');
    if (productNameEl) {
        const totalQty = registrationData.tongSoLuong || 0;
        const productText = totalQty > 1 
            ? `${campaignData.sanPham?.tenSanPham || 'N/A'} (${totalQty} đôi)`
            : campaignData.sanPham?.tenSanPham || 'N/A';
        productNameEl.textContent = productText;
    }
    
    // Update product details (colors and sizes from matrix)
    const productDetailsEl = document.getElementById('product-details');
    if (productDetailsEl && registrationData.chiTietList && registrationData.chiTietList.length > 0) {
        let detailsHTML = '<div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 10px 0;">';
        detailsHTML += '<h4 style="color: var(--primary-dark); margin: 0 0 10px 0; font-size: 14px;">Chi tiết sản phẩm:</h4>';
        
        registrationData.chiTietList.forEach((detail, index) => {
            const colorName = detail.mauSac?.tenMau || 'N/A';
            const sizeName = detail.kichThuoc?.tenSize || 'N/A';
            const quantity = detail.soLuong || 1;
            
            detailsHTML += `
                <div style="display: flex; align-items: center; padding: 8px 0; ${index > 0 ? 'border-top: 1px solid #e0e0e0; margin-top: 8px; padding-top: 8px;' : ''}">
                    <span style="background: var(--accent-gold); color: var(--primary-dark); padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; margin-right: 12px;">
                        ${quantity}x
                    </span>
                    <div style="flex: 1;">
                        <span style="color: #666; font-size: 13px;">
                            <strong style="color: var(--primary-dark);">Màu:</strong> ${colorName}
                        </span>
                        <span style="color: #666; font-size: 13px; margin-left: 15px;">
                            <strong style="color: var(--primary-dark);">Size:</strong> ${sizeName}
                        </span>
                    </div>
                </div>
            `;
        });
        
        detailsHTML += '</div>';
        productDetailsEl.innerHTML = detailsHTML;
    }
    
    // Update bet tier
    const betTierEl = document.getElementById('bet-tier');
    if (betTierEl && registrationData.bangGiaBacThang) {
        const tier = registrationData.bangGiaBacThang;
        betTierEl.textContent = `${tier.soLuongToiThieu} - ${tier.soLuongToiDa} sản phẩm`;
    }
    
    // Update total payment
    const totalPaymentEl = document.getElementById('total-payment');
    if (totalPaymentEl && registrationData.thanhToan) {
        totalPaymentEl.textContent = formatCurrency(registrationData.thanhToan.soTienThanhToan);
    }
    
    // Update refund amount
    const refundAmountEl = document.getElementById('refund-amount');
    if (refundAmountEl && registrationData.bangGiaBacThang) {
        const basePrice = campaignData.giaGoc || 0;
        const tierPrice = registrationData.bangGiaBacThang.donGia || 0;
        const totalQty = registrationData.tongSoLuong || 0;
        const refundAmount = (basePrice - tierPrice) * totalQty;
        refundAmountEl.textContent = formatCurrency(refundAmount);
    }
}

// Update progress alert
function updateProgressAlert() {
    if (!campaignData || !registrationData) return;
    
    const progressAlert = document.querySelector('.progress-alert div');
    if (!progressAlert) return;
    
    const currentTotal = campaignData.tongSoLuongHienTai || 0;
    const tiers = campaignData.bangGiaBacThangs || [];
    
    // Find next tier
    const nextTier = tiers.find(tier => tier.soLuongToiThieu > currentTotal);
    
    if (nextTier) {
        const remaining = nextTier.soLuongToiThieu - currentTotal;
        progressAlert.innerHTML = `
            <strong>Chỉ còn thiếu ${remaining} sản phẩm nữa để đạt mốc ${nextTier.soLuongToiThieu}!</strong>
            <p>Chia sẻ ngay để tăng cơ hội nhận giá tốt nhất</p>
        `;
    } else {
        progressAlert.innerHTML = `
            <strong>Chiến dịch đã đạt mốc cao nhất với ${currentTotal} sản phẩm được đăng ký!</strong>
            <p>Cảm ơn bạn đã tham gia</p>
        `;
    }
}

// Countdown Timer for Decision Time (2 days from now)
function startDecisionCountdown() {
    // Set deadline to 2 days from now (48 hours)
    const deadline = new Date().getTime() + (2 * 24 * 60 * 60 * 1000);
    
    const countdownInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = deadline - now;
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update display
        const timeValues = document.querySelectorAll('.countdown-display .time-value');
        if (timeValues.length >= 4) {
            timeValues[0].textContent = String(days).padStart(2, '0');
            timeValues[1].textContent = String(hours).padStart(2, '0');
            timeValues[2].textContent = String(minutes).padStart(2, '0');
            timeValues[3].textContent = String(seconds).padStart(2, '0');
        }
        
        // If countdown finished
        if (distance < 0) {
            clearInterval(countdownInterval);
            timeValues.forEach(val => val.textContent = '00');
            const timerWarning = document.querySelector('.timer-warning');
            if (timerWarning) {
                timerWarning.textContent = 'Thời gian quyết định đã hết!';
            }
            const timerBox = document.querySelector('.decision-timer-box');
            if (timerBox) {
                timerBox.style.background = 'linear-gradient(135deg, #ffebee, #ffcdd2)';
            }
        }
    }, 1000);
}

// Share functionality
document.addEventListener('DOMContentLoaded', function() {
    // Copy link functionality
    const copyLinkBtn = document.querySelector('.share-btn.copy-link');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            if (!campaignData) return;
            const campaignUrl = `${window.location.origin}/pages/campaign-detail.html?id=${campaignData.maChienDich}`;
            
            navigator.clipboard.writeText(campaignUrl).then(function() {
                const originalText = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Đã sao chép!';
                setTimeout(function() {
                    copyLinkBtn.innerHTML = originalText;
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy:', err);
                alert('Không thể sao chép link!');
            });
        });
    }
    
    // Share to Facebook
    const facebookBtn = document.querySelector('.share-btn.facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            if (!campaignData) return;
            const campaignUrl = `${window.location.origin}/pages/campaign-detail.html?id=${campaignData.maChienDich}`;
            const shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(campaignUrl);
            window.open(shareUrl, '_blank', 'width=600,height=400');
        });
    }
    
    // Share to Zalo
    const zaloBtn = document.querySelector('.share-btn.zalo');
    if (zaloBtn) {
        zaloBtn.addEventListener('click', function() {
            if (!campaignData) return;
            const campaignUrl = `${window.location.origin}/pages/campaign-detail.html?id=${campaignData.maChienDich}`;
            const shareUrl = 'https://zalo.me/share?url=' + encodeURIComponent(campaignUrl);
            window.open(shareUrl, '_blank', 'width=600,height=400');
        });
    }
});

// Helper function
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' đ';
}
