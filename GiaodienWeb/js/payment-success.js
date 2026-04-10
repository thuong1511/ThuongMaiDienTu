// Payment Success Page JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎉 Payment success page loaded');
    
    // Get checkout data from sessionStorage
    const checkoutData = JSON.parse(sessionStorage.getItem('checkoutData'));
    const campaignData = JSON.parse(sessionStorage.getItem('campaignData'));
    
    if (!checkoutData || !campaignData) {
        console.error('❌ No checkout data found');
        alert('Không tìm thấy thông tin đơn hàng!');
        window.location.href = 'campaigns.html';
        return;
    }
    
    console.log('📦 Checkout data:', checkoutData);
    console.log('🎯 Campaign data:', campaignData);
    
    // Update page content
    updateOrderInfo(checkoutData, campaignData);
    updateProgressAlert(campaignData, checkoutData);
    startDecisionCountdown();
});

// Update order information
function updateOrderInfo(checkoutData, campaignData) {
    // Update campaign name in subtitle
    const subtitle = document.querySelector('.success-subtitle');
    if (subtitle) {
        subtitle.textContent = `Bạn đã tham gia chiến dịch ${campaignData.tenChienDich}`;
    }
    
    // Update order ID
    const orderIdEl = document.getElementById('order-id');
    if (orderIdEl) {
        orderIdEl.textContent = `#${checkoutData.maDangKy || 'N/A'}`;
    }
    
    // Update product name
    const productNameEl = document.getElementById('product-name');
    if (productNameEl) {
        const productText = checkoutData.quantity > 1 
            ? `${campaignData.sanPham?.tenSanPham || 'N/A'} (${checkoutData.quantity} đôi)`
            : campaignData.sanPham?.tenSanPham || 'N/A';
        productNameEl.textContent = productText;
    }
    
    // Update product details (colors and sizes)
    const productDetailsEl = document.getElementById('product-details');
    if (productDetailsEl && checkoutData.products) {
        let detailsHTML = '<div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 10px 0;">';
        detailsHTML += '<h4 style="color: var(--primary-dark); margin: 0 0 10px 0; font-size: 14px;">Chi tiết sản phẩm:</h4>';
        
        checkoutData.products.forEach((product, index) => {
            detailsHTML += `
                <div style="display: flex; align-items: center; padding: 8px 0; ${index > 0 ? 'border-top: 1px solid #e0e0e0; margin-top: 8px; padding-top: 8px;' : ''}">
                    <span style="background: var(--accent-gold); color: var(--primary-dark); padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; margin-right: 12px;">
                        Đôi ${index + 1}
                    </span>
                    <div style="flex: 1;">
                        <span style="color: #666; font-size: 13px;">
                            <strong style="color: var(--primary-dark);">Màu:</strong> ${product.colorName || 'N/A'}
                        </span>
                        <span style="color: #666; font-size: 13px; margin-left: 15px;">
                            <strong style="color: var(--primary-dark);">Size:</strong> ${product.sizeName || 'N/A'}
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
    if (betTierEl) {
        betTierEl.textContent = `${checkoutData.betTier} sản phẩm`;
    }
    
    // Update total payment
    const totalPaymentEl = document.getElementById('total-payment');
    if (totalPaymentEl) {
        totalPaymentEl.textContent = formatCurrency(checkoutData.totalPayment);
    }
    
    // Update refund amount
    const refundAmountEl = document.getElementById('refund-amount');
    if (refundAmountEl) {
        const basePrice = campaignData.giaGoc || 0;
        const [min, max] = checkoutData.betTier.split('-').map(Number);
        const selectedTier = campaignData.bangGiaBacThangs?.find(
            t => t.soLuongToiThieu === min && t.soLuongToiDa === max
        );
        
        if (selectedTier) {
            const tierPrice = selectedTier.donGia || 0;
            const refundAmount = (basePrice - tierPrice) * checkoutData.quantity;
            refundAmountEl.textContent = formatCurrency(refundAmount);
        }
    }
}

// Update progress alert
function updateProgressAlert(campaignData, checkoutData) {
    const progressAlert = document.querySelector('.progress-alert div');
    if (!progressAlert) return;
    
    const currentFromDB = campaignData.tongSoLuongHienTai || 0;
    const justRegistered = checkoutData?.quantity || 0;
    const currentTotal = currentFromDB + justRegistered; // Cộng thêm số lượng vừa đăng ký
    
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
            const campaignData = JSON.parse(sessionStorage.getItem('campaignData'));
            const campaignUrl = `${window.location.origin}/pages/campaign-detail.html?id=${campaignData?.maChienDich || ''}`;
            
            navigator.clipboard.writeText(campaignUrl).then(function() {
                const originalText = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Đã sao chép!';
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
            const campaignData = JSON.parse(sessionStorage.getItem('campaignData'));
            const campaignUrl = `${window.location.origin}/pages/campaign-detail.html?id=${campaignData?.maChienDich || ''}`;
            const shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(campaignUrl);
            window.open(shareUrl, '_blank', 'width=600,height=400');
        });
    }
    
    // Share to Zalo
    const zaloBtn = document.querySelector('.share-btn.zalo');
    if (zaloBtn) {
        zaloBtn.addEventListener('click', function() {
            const campaignData = JSON.parse(sessionStorage.getItem('campaignData'));
            const campaignUrl = `${window.location.origin}/pages/campaign-detail.html?id=${campaignData?.maChienDich || ''}`;
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
