// Checkout Page JavaScript - Version 2 with Multiple Products Support
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Checkout page loaded (v2)');
    
    // Check authentication
    currentUser = AuthManager.getCurrentUser();
    if (!currentUser) {
        alert('Vui lòng đăng nhập để tiếp tục!');
        window.location.href = 'login.html';
        return;
    }
    
    // Get campaign ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('id');
    
    if (!campaignId) {
        alert('Không tìm thấy thông tin chiến dịch!');
        window.location.href = 'campaigns.html';
        return;
    }
    
    try {
        await loadCheckoutData(campaignId, currentUser.maNguoiDung);
    } catch (error) {
        console.error('❌ Error loading checkout data:', error);
        alert('Không thể tải thông tin đăng ký!');
    }
});

// Global variables
let currentUser = null;
let currentCampaign = null;
let userAddresses = [];
let selectedProducts = [
    { color: null, size: null, colorName: '', sizeName: '' }, // Đôi 1
    { color: null, size: null, colorName: '', sizeName: '' }  // Đôi 2
];

// Load all checkout data
async function loadCheckoutData(campaignId, userId) {
    console.log('Loading checkout data for campaign:', campaignId);
    
    // Load campaign details
    const campaignResponse = await api.getChienDichById(campaignId);
    if (!campaignResponse.success || !campaignResponse.data) {
        throw new Error('Failed to load campaign data');
    }
    
    currentCampaign = campaignResponse.data;
    console.log('✅ Campaign loaded:', currentCampaign);
    
    // Load user addresses
    await loadUserAddresses(userId);
    
    // Initialize page
    updateCampaignInfo();
    renderProductSelectionForms();
    updatePricingTiers();
    updateAddressList();
    initializeEventHandlers();
    updateOrderSummary();
    
    // Load address form data
    await loadAddressFormData();
}

// Load user addresses
async function loadUserAddresses(userId) {
    try {
        console.log('Loading addresses for user:', userId);
        const addressResponse = await fetch(`http://localhost:8080/api/sodiachi/nguoidung/${userId}`);
        const addressData = await addressResponse.json();
        
        if (addressData.success && addressData.data) {
            userAddresses = addressData.data;
            console.log('✅ Addresses loaded:', userAddresses.length, 'addresses');
            updateAddressList(); // Update UI after loading
        } else {
            userAddresses = [];
        }
    } catch (error) {
        console.error('❌ Error loading addresses:', error);
        userAddresses = [];
    }
}

// Update campaign information
function updateCampaignInfo() {
    console.log('📋 Updating campaign info...');
    
    const productPreview = document.querySelector('.product-preview');
    if (!productPreview) return;
    
    const productInfo = productPreview.querySelector('.product-info');
    if (!productInfo) return;
    
    const campaignImage = currentCampaign.hinhAnhChienDichs?.[0]?.duongDan || '../images/chiendich1.jpg';
    
    const imgElement = productPreview.querySelector('img');
    const h3Element = productInfo.querySelector('h3');
    const h4Element = productInfo.querySelector('h4.product-name');
    const pElement = productInfo.querySelector('p');
    
    if (imgElement) imgElement.src = fixImagePath(campaignImage);
    if (h3Element) h3Element.textContent = currentCampaign.tenChienDich;
    if (h4Element) h4Element.textContent = currentCampaign.sanPham?.tenSanPham || 'Limited Edition Sneaker';
    if (pElement) pElement.textContent = currentCampaign.sanPham?.moTa || 'Premium Collection';
    
    // Update progress alert
    const progressAlert = document.querySelector('.bet-progress-alert p');
    if (progressAlert) {
        const current = currentCampaign.tongSoLuongHienTai || 0;
        const nextTier = getNextTier(current);
        
        if (nextTier) {
            const remaining = nextTier.soLuongToiThieu - current;
            progressAlert.innerHTML = `Chiến dịch hiện có <strong>${current} người tham gia</strong>. Chỉ còn thiếu <strong>${remaining} người</strong> để đạt mốc ${nextTier.soLuongToiThieu}!`;
        } else {
            progressAlert.innerHTML = `Chiến dịch hiện có <strong>${current} người tham gia</strong>. Đã đạt mốc cao nhất!`;
        }
    }
}

// Render product selection forms based on quantity
function renderProductSelectionForms() {
    const quantity = parseInt(document.querySelector('.qty-input')?.value || 1);
    
    // Ensure selectedProducts array has enough elements
    while (selectedProducts.length < quantity) {
        selectedProducts.push({ color: null, size: null, colorName: '', sizeName: '' });
    }
    
    // Find or create container
    let container = document.querySelector('.product-selection-container');
    if (!container) {
        // Insert before the quantity selector
        const qtyGroup = document.querySelector('.form-group:has(.quantity-selector)');
        if (qtyGroup) {
            container = document.createElement('div');
            container.className = 'product-selection-container';
            qtyGroup.parentNode.insertBefore(container, qtyGroup);
        } else {
            console.error('Cannot find quantity selector');
            return;
        }
    }
    
    // Clear container
    container.innerHTML = '';
    
    const colorMap = {
        'Đen': 'linear-gradient(135deg, #000, #333)',
        'Trắng': 'linear-gradient(135deg, #f5f5f5, #fff)',
        'Trắng Kem': 'linear-gradient(135deg, #f5f5dc, #fff)',
        'Xanh Navy': 'linear-gradient(135deg, #001f3f, #003366)',
        'Đỏ': 'linear-gradient(135deg, #DC143C, #FF6B6B)',
        'Xám': 'linear-gradient(135deg, #808080, #A9A9A9)',
        'Vàng Gold': 'linear-gradient(135deg, #C4A87F, #D4AF6A)',
        'Xanh Dương': 'linear-gradient(135deg, #0074D9, #4DA6FF)',
        'Xanh Lá': 'linear-gradient(135deg, #2ECC40, #5FE870)',
        'Vàng': 'linear-gradient(135deg, #FFDC00, #FFE74C)',
        'Cam': 'linear-gradient(135deg, #FF851B, #FFB366)',
        'Hồng': 'linear-gradient(135deg, #FF69B4, #FFB6D9)',
        'Nâu': 'linear-gradient(135deg, #8B4513, #A0522D)',
        'Tím': 'linear-gradient(135deg, #9370DB, #B19CD9)'
    };
    
    const colors = currentCampaign.sanPham?.sanPhamMauSacs || [];
    const sizes = currentCampaign.sanPham?.sanPhamKichThuocs || [];
    
    // Find first available color and default size
    const firstAvailableColorIndex = colors.findIndex(c => (c.soLuongToiDa - c.soLuongDaDat) > 0);
    let defaultSizeIndex = sizes.findIndex(s => s.kichThuoc?.tenSize === '38');
    // If size 38 not found, use first size
    if (defaultSizeIndex === -1) {
        defaultSizeIndex = 0;
    }
    
    console.log('🎨 First available color index:', firstAvailableColorIndex);
    console.log('📏 Default size index:', defaultSizeIndex);
    
    // Render forms for each pair
    for (let i = 0; i < quantity; i++) {
        const pairNum = i + 1;
        
        // Set default values if not already set
        if (!selectedProducts[i].color && firstAvailableColorIndex >= 0) {
            const defaultColor = colors[firstAvailableColorIndex];
            selectedProducts[i].color = String(defaultColor.maMau);
            selectedProducts[i].colorName = defaultColor.mauSac?.tenMau || 'N/A';
            console.log(`   Set default color for pair ${pairNum}:`, selectedProducts[i].color, selectedProducts[i].colorName);
        }
        
        if (!selectedProducts[i].size && defaultSizeIndex >= 0 && sizes[defaultSizeIndex]) {
            const defaultSize = sizes[defaultSizeIndex];
            selectedProducts[i].size = String(defaultSize.maSize); // Changed from maKichThuoc to maSize
            selectedProducts[i].sizeName = defaultSize.kichThuoc?.tenSize || 'N/A';
            console.log(`   Set default size for pair ${pairNum}:`, selectedProducts[i].size, selectedProducts[i].sizeName);
        }
        
        const pairDiv = document.createElement('div');
        pairDiv.className = 'pair-selection';
        pairDiv.id = `pair-${pairNum}`;
        pairDiv.style.cssText = 'margin-bottom: 25px; padding: 20px; background: rgba(236, 234, 229, 0.3); border-radius: 12px; border: 2px solid var(--accent-gold);';
        
        pairDiv.innerHTML = `
            <h4 style="color: var(--primary-dark); margin-bottom: 15px; font-size: 16px;">
                ${quantity > 1 ? `Đôi ${pairNum}` : 'Lựa chọn của bạn'}
            </h4>
            
            <div class="form-group">
                <label>Màu sắc</label>
                <div class="color-options" data-pair="${pairNum}">
                    ${colors.map((c, index) => {
                        const colorName = c.mauSac?.tenMau || 'N/A';
                        const colorGradient = colorMap[colorName] || 'linear-gradient(135deg, #ccc, #eee)';
                        const remaining = c.soLuongToiDa - c.soLuongDaDat;
                        const isOutOfStock = remaining <= 0;
                        // Check if this is the selected color for this pair
                        const isActive = String(c.maMau) === selectedProducts[i].color;
                        
                        return `
                            <div class="color-option ${isActive ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}" 
                                 data-color-id="${c.maMau}"
                                 data-color-name="${colorName}"
                                 ${isOutOfStock ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                                <div class="color-swatch" style="background: ${colorGradient}"></div>
                                <span>${colorName}</span>
                                <small style="display: block; font-size: 11px; color: ${isOutOfStock ? '#ff6b6b' : '#999'};">
                                    ${isOutOfStock ? 'Hết hàng' : `Còn ${remaining} đôi`}
                                </small>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="form-group">
                <label>Kích thước (EU)</label>
                <div class="size-options" data-pair="${pairNum}">
                    ${sizes.map((s, index) => {
                        const sizeName = s.kichThuoc?.tenSize || 'N/A';
                        // Check if this is the selected size for this pair
                        const isActive = String(s.maSize) === selectedProducts[i].size;
                        
                        return `
                            <button class="size-btn ${isActive ? 'active' : ''}" 
                                    data-size-id="${s.maSize}"
                                    data-size-name="${sizeName}">
                                ${sizeName}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        container.appendChild(pairDiv);
    }
    
    console.log(`✅ Rendered ${quantity} pair selection form(s)`);
    console.log('Default selections:', selectedProducts.slice(0, quantity));
}

// Update pricing tiers
function updatePricingTiers() {
    const betOptions = document.querySelector('.bet-options');
    const betWarning = document.querySelector('.bet-timer-warning p');
    
    if (!currentCampaign.bangGiaBacThangs) return;
    
    const tiers = currentCampaign.bangGiaBacThangs;
    const basePrice = currentCampaign.giaGoc;
    
    if (betWarning) {
        betWarning.innerHTML = `Sau khi chọn mốc, bạn có <strong>2 ngày (48 giờ)</strong> để xác nhận. Nếu hết thời gian mà mốc chưa đạt đủ số lượng, bạn sẽ tự động bị xem là cược sai và phải trả <strong>giá cao nhất</strong> <strong>(${formatCurrency(basePrice)})</strong>.`;
    }
    
    betOptions.innerHTML = tiers.map((tier, index) => {
        const discountPercent = ((basePrice - tier.donGia) / basePrice * 100).toFixed(1);
        
        return `
            <div class="bet-card">
                <input type="radio" name="bet" id="bet${index + 1}" value="${tier.soLuongToiThieu}-${tier.soLuongToiDa}" data-tier-id="${tier.maMucGia}" ${index === 1 ? 'checked' : ''}>
                <label for="bet${index + 1}">
                    <div class="bet-range">${tier.soLuongToiThieu} - ${tier.soLuongToiDa}</div>
                    <div class="bet-price">${formatCurrency(tier.donGia)}</div>
                    <div class="bet-discount">Giảm ${discountPercent}%</div>
                </label>
            </div>
        `;
    }).join('');
}

// Update address list
function updateAddressList() {
    const savedAddressList = document.querySelector('.saved-address-list');
    if (!savedAddressList) return;
    
    if (userAddresses.length === 0) {
        savedAddressList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #999;">
                <p>Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.</p>
            </div>
        `;
        return;
    }
    
    // Find default address from backend (macDinh field)
    let defaultAddress = userAddresses.find(addr => addr.macDinh === true);
    
    // If no default set, use first address
    if (!defaultAddress && userAddresses.length > 0) {
        defaultAddress = userAddresses[0];
    }
    
    // Sort addresses: default first
    const sortedAddresses = [...userAddresses].sort((a, b) => {
        if (a.macDinh === true) return -1;
        if (b.macDinh === true) return 1;
        return 0;
    });
    
    savedAddressList.innerHTML = sortedAddresses.map((addr, index) => {
        const phuongXa = addr.tenPhuongXa || '';
        const tinhThanh = addr.tenTinhThanh || '';
        const isDefault = addr.macDinh === true;
        
        return `
            <div class="address-card ${index === 0 ? 'active' : ''}">
                <input type="radio" name="address" id="addr${index + 1}" ${index === 0 ? 'checked' : ''} data-address-id="${addr.maSo}">
                <label for="addr${index + 1}">
                    <div class="address-header">
                        <span class="address-name">${addr.hoTen}</span>
                        ${isDefault ? '<span class="address-badge default">Mặc định</span>' : ''}
                    </div>
                    <div class="address-phone">${addr.soDienThoai}</div>
                    <div class="address-detail">${addr.diaChiChiTiet}, ${phuongXa}, ${tinhThanh}</div>
                    ${!isDefault ? `
                        <button class="set-default-btn" data-address-id="${addr.maSo}" style="margin-top: 10px; padding: 5px 10px; background: var(--accent-gold); border: none; border-radius: 5px; cursor: pointer; font-size: 12px; color: var(--primary-dark);">
                            Đặt làm mặc định
                        </button>
                    ` : ''}
                </label>
            </div>
        `;
    }).join('');
    
    // Add event listeners for "Set as default" buttons
    document.querySelectorAll('.set-default-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const addressId = btn.dataset.addressId;
            
            try {
                const response = await fetch(`${API_BASE_URL}/sodiachi/${addressId}/set-default`, {
                    method: 'PUT'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    console.log('✅ Set default address:', addressId);
                    // Reload addresses from backend
                    if (currentUser && currentUser.maNguoiDung) {
                        await loadUserAddresses(currentUser.maNguoiDung);
                    }
                } else {
                    console.error('❌ Failed to set default address:', data.message);
                    alert('Không thể đặt địa chỉ mặc định. Vui lòng thử lại!');
                }
            } catch (error) {
                console.error('❌ Error setting default address:', error);
                alert('Có lỗi xảy ra. Vui lòng thử lại!');
            }
        });
    });
}

// Initialize event handlers
function initializeEventHandlers() {
    // Quantity controls
    const qtyInput = document.querySelector('.qty-input');
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    
    minusBtn.addEventListener('click', () => {
        let value = parseInt(qtyInput.value);
        if (value > 1) {
            qtyInput.value = value - 1;
            renderProductSelectionForms();
            attachProductSelectionHandlers();
            updateOrderSummary();
        }
    });
    
    plusBtn.addEventListener('click', () => {
        let value = parseInt(qtyInput.value);
        if (value < 2) {
            qtyInput.value = value + 1;
            renderProductSelectionForms();
            attachProductSelectionHandlers();
            updateOrderSummary();
        } else {
            alert('Mỗi người chỉ được đăng ký tối đa 2 sản phẩm!');
        }
    });
    
    qtyInput.addEventListener('change', () => {
        let value = parseInt(qtyInput.value);
        if (value < 1) qtyInput.value = 1;
        if (value > 2) {
            qtyInput.value = 2;
            alert('Mỗi người chỉ được đăng ký tối đa 2 sản phẩm!');
        }
        renderProductSelectionForms();
        attachProductSelectionHandlers();
        updateOrderSummary();
    });
    
    // Attach handlers for product selection
    attachProductSelectionHandlers();
    
    // Bet selection
    document.querySelectorAll('.bet-card input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', updateOrderSummary);
    });
    
    // Address tabs
    document.querySelectorAll('.address-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            document.querySelectorAll('.address-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.address-content').forEach(content => {
                if (content.id === tabName + '-addresses' || content.id === tabName + '-address') {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // Address card selection - ensure only one can be selected
    document.querySelectorAll('.address-card').forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        
        // Click on card
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on "Set default" button
            if (e.target.classList.contains('set-default-btn')) {
                return;
            }
            
            // Remove active from all cards
            document.querySelectorAll('.address-card').forEach(c => c.classList.remove('active'));
            // Add active to clicked card
            card.classList.add('active');
            // Check the radio
            if (radio) radio.checked = true;
        });
        
        // Click on radio directly
        if (radio) {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    document.querySelectorAll('.address-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                }
            });
        }
    });
    
    // Checkout button
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

// Attach handlers for product selection (colors and sizes)
function attachProductSelectionHandlers() {
    // Color selection for each pair
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            if (option.classList.contains('out-of-stock')) {
                alert('Màu này đã hết hàng. Vui lòng chọn màu khác!');
                return;
            }
            
            const pairNum = option.closest('.color-options').dataset.pair;
            const colorOptions = document.querySelector(`.color-options[data-pair="${pairNum}"]`);
            colorOptions.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Save selection
            const pairIndex = parseInt(pairNum) - 1;
            selectedProducts[pairIndex].color = option.dataset.colorId;
            selectedProducts[pairIndex].colorName = option.dataset.colorName;
            
            updateOrderSummary();
        });
    });
    
    // Size selection for each pair
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pairNum = btn.closest('.size-options').dataset.pair;
            const sizeOptions = document.querySelector(`.size-options[data-pair="${pairNum}"]`);
            sizeOptions.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Save selection
            const pairIndex = parseInt(pairNum) - 1;
            selectedProducts[pairIndex].size = btn.dataset.sizeId;
            selectedProducts[pairIndex].sizeName = btn.dataset.sizeName;
            
            updateOrderSummary();
        });
    });
}

// Update order summary
function updateOrderSummary() {
    if (!currentCampaign) return;
    
    const quantity = parseInt(document.querySelector('.qty-input')?.value || 1);
    const selectedBet = document.querySelector('input[name="bet"]:checked')?.value || '';
    
    if (!selectedBet) return;
    
    const [min, max] = selectedBet.split('-').map(Number);
    const selectedTier = currentCampaign.bangGiaBacThangs?.find(
        t => t.soLuongToiThieu === min && t.soLuongToiDa === max
    );
    
    if (!selectedTier) return;
    
    const basePrice = currentCampaign.giaGoc || 0;
    const tierPrice = selectedTier.donGia || 0;
    const participationFee = currentCampaign.phiThamGia || 0; // Phí tham gia tính 1 lần
    const discountPercent = basePrice > 0 ? ((basePrice - tierPrice) / basePrice * 100).toFixed(1) : 0;
    
    // Calculate prices
    const totalBasePrice = basePrice * quantity; // Giá gốc tính theo số đôi
    const totalBetPrice = tierPrice * quantity;
    const totalPayment = totalBasePrice + participationFee; // Phí tham gia chỉ tính 1 lần
    const refundAmount = totalBasePrice - totalBetPrice;
    
    const summarySections = document.querySelectorAll('.order-summary .summary-section');
    
    // Section 1: Product info
    if (summarySections[0]) {
        const productNameSpan = summarySections[0].querySelector('.summary-item span:first-child');
        const productQtySpan = summarySections[0].querySelector('.summary-item span:last-child');
        const summaryDetail = summarySections[0].querySelector('.summary-detail span');
        
        if (productNameSpan) {
            productNameSpan.textContent = currentCampaign.sanPham?.tenSanPham || 'Sản phẩm';
        }
        if (productQtySpan) {
            productQtySpan.textContent = `${quantity}x`;
        }
        if (summaryDetail) {
            if (quantity === 1) {
                const pair1 = selectedProducts[0];
                summaryDetail.textContent = `Màu: ${pair1.colorName || 'N/A'} | Size: ${pair1.sizeName || 'N/A'}`;
            } else {
                const pair1 = selectedProducts[0];
                const pair2 = selectedProducts[1];
                summaryDetail.innerHTML = `
                    Đôi 1: ${pair1.colorName || 'N/A'} - Size ${pair1.sizeName || 'N/A'}<br>
                    Đôi 2: ${pair2.colorName || 'N/A'} - Size ${pair2.sizeName || 'N/A'}
                `;
            }
        }
    }
    
    // Section 2: Bet info
    if (summarySections[1]) {
        const betRangeSpan = summarySections[1].querySelector('.summary-item.highlight span:first-child');
        const discountTag = summarySections[1].querySelector('.discount-tag');
        
        if (betRangeSpan) {
            betRangeSpan.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 14px; color: #666;">${selectedBet} sản phẩm</span>
                    <span style="font-size: 16px; font-weight: 700; color: var(--primary-dark);">${formatCurrency(tierPrice)}/đôi</span>
                </div>
            `;
        }
        if (discountTag) {
            discountTag.textContent = `-${discountPercent}%`;
        }
    }
    
    // Section 3: Prices
    if (summarySections[2]) {
        const priceItems = summarySections[2].querySelectorAll('.summary-item:not(.total)');
        
        if (priceItems[0]) {
            const priceSpan = priceItems[0].querySelector('span:last-child');
            if (priceSpan) {
                priceSpan.textContent = formatCurrency(totalBasePrice);
            }
            // Update label
            const labelSpan = priceItems[0].querySelector('span:first-child');
            if (labelSpan) {
                labelSpan.textContent = `Giá gốc (${quantity} sản phẩm)`;
            }
        }
        
        if (priceItems[1]) {
            const feeSpan = priceItems[1].querySelector('span:last-child');
            if (feeSpan) {
                feeSpan.textContent = formatCurrency(participationFee);
            }
        }
        
        const totalItem = summarySections[2].querySelector('.summary-item.total span:last-child');
        if (totalItem) {
            totalItem.textContent = formatCurrency(totalPayment);
        }
    }
    
    // Update refund note
    const refundNote = document.querySelector('.refund-note p');
    if (refundNote) {
        refundNote.innerHTML = `<strong>Cơ chế hoàn tiền:</strong> Bạn thanh toán theo giá gốc (${formatCurrency(totalBasePrice)}). Nếu cược đúng (mốc đạt đủ số lượng trong thời gian quyết định), hệ thống sẽ tự động hoàn lại <strong>${formatCurrency(refundAmount)}</strong> sau khi chiến dịch kết thúc.`;
    }
}

// Handle checkout
async function handleCheckout(e) {
    e.preventDefault();
    
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
        alert('Vui lòng đồng ý với Điều khoản và Điều kiện!');
        return;
    }
    
    const quantity = parseInt(document.querySelector('.qty-input').value);
    const selectedBet = document.querySelector('input[name="bet"]:checked')?.value;
    const selectedBetRadio = document.querySelector('input[name="bet"]:checked');
    const selectedAddressId = document.querySelector('input[name="address"]:checked')?.dataset.addressId;
    const selectedPaymentRadio = document.querySelector('input[name="payment"]:checked');
    
    // Validate and ensure all pairs have color and size selected (use defaults if not)
    for (let i = 0; i < quantity; i++) {
        // If color not selected, use the active color option
        if (!selectedProducts[i].color || selectedProducts[i].color === 'undefined') {
            const activeColor = document.querySelector(`.color-options[data-pair="${i + 1}"] .color-option.active`);
            if (activeColor) {
                selectedProducts[i].color = activeColor.dataset.colorId;
                selectedProducts[i].colorName = activeColor.dataset.colorName;
            }
        }
        
        // If size not selected, use the active size button
        if (!selectedProducts[i].size || selectedProducts[i].size === 'undefined') {
            const activeSize = document.querySelector(`.size-options[data-pair="${i + 1}"] .size-btn.active`);
            if (activeSize) {
                selectedProducts[i].size = activeSize.dataset.sizeId;
                selectedProducts[i].sizeName = activeSize.dataset.sizeName;
            }
        }
        
        // Final validation - ensure values are valid
        if (!selectedProducts[i].color || selectedProducts[i].color === 'undefined' || 
            !selectedProducts[i].size || selectedProducts[i].size === 'undefined') {
            alert(`Vui lòng chọn đầy đủ màu sắc và kích thước cho đôi ${i + 1}!`);
            console.error('Invalid product selection:', selectedProducts[i]);
            return;
        }
    }
    
    console.log('✅ Validated products:', selectedProducts.slice(0, quantity));
    
    if (!selectedBet) {
        alert('Vui lòng chọn mốc đặt cược!');
        return;
    }
    
    if (!selectedAddressId) {
        alert('Vui lòng chọn địa chỉ giao hàng!');
        return;
    }
    
    // Get tier ID from selected bet
    const maMucGia = parseInt(selectedBetRadio.dataset.tierId);
    if (!maMucGia) {
        alert('Không tìm thấy thông tin mức giá!');
        return;
    }
    
    // Get payment method name
    const paymentMethodMap = {
        'momo': 'Ví điện tử',
        'vnpay': 'Ví điện tử',
        'card': 'Chuyển khoản'
    };
    const paymentMethod = paymentMethodMap[selectedPaymentRadio.id] || 'Chuyển khoản';
    
    // Get selected address details
    const selectedAddress = userAddresses.find(addr => addr.maSo === selectedAddressId);
    if (!selectedAddress) {
        alert('Không tìm thấy thông tin địa chỉ!');
        return;
    }
    
    // Calculate total payment
    const basePrice = currentCampaign.giaGoc || 0;
    const participationFee = currentCampaign.phiThamGia || 0;
    const totalBasePrice = basePrice * quantity;
    const totalPayment = totalBasePrice + participationFee;
    
    // Disable checkout button to prevent double submission
    const checkoutBtn = e.target;
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'ĐANG XỬ LÝ...';
    
    try {
        console.log('🚀 Starting checkout process...');
        
        // STEP 1: Create ThanhToan (Payment)
        console.log('📝 Step 1: Creating payment record...');
        const thanhToanData = {
            hoTenNguoiNhan: selectedAddress.hoTen,
            soDienThoaiNhan: selectedAddress.soDienThoai,
            diaChiGiaoHang: `${selectedAddress.diaChiChiTiet}, ${selectedAddress.tenPhuongXa || ''}, ${selectedAddress.tenTinhThanh || ''}`,
            soTienThanhToan: totalPayment,
            phuongThuc: paymentMethod,
            ghiChu: `Thanh toán đăng ký chiến dịch ${currentCampaign.tenChienDich}`
        };
        
        const thanhToanResponse = await fetch(`${API_BASE_URL}/thanhtoan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(thanhToanData)
        });
        
        const thanhToanResult = await thanhToanResponse.json();
        
        if (!thanhToanResult.success) {
            throw new Error(thanhToanResult.message || 'Không thể tạo thanh toán');
        }
        
        const maThanhToan = thanhToanResult.data.maThanhToan;
        console.log('✅ Payment created successfully. ID:', maThanhToan);
        
        // STEP 2: Create DangKyChienDich (Campaign Registration)
        console.log('📝 Step 2: Creating campaign registration...');
        const dangKyData = {
            maThanhToan: maThanhToan,
            maMucGia: maMucGia,
            maNguoiDung: currentUser.maNguoiDung,
            maChienDich: currentCampaign.maChienDich,
            tongSoLuong: quantity
        };
        
        const dangKyResponse = await fetch(`${API_BASE_URL}/dangkychiendich`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dangKyData)
        });
        
        const dangKyResult = await dangKyResponse.json();
        
        if (!dangKyResult.success) {
            throw new Error(dangKyResult.message || 'Không thể tạo đăng ký chiến dịch');
        }
        
        const maDangKy = dangKyResult.data.maDangKy;
        console.log('✅ Campaign registration created successfully. ID:', maDangKy);
        
        // STEP 3: Create PhieuChiTietDangKy (Registration Details) for each pair
        console.log('📝 Step 3: Creating registration details for each pair...');
        
        for (let i = 0; i < quantity; i++) {
            const product = selectedProducts[i];
            const pairNum = i + 1;
            
            console.log(`   Creating detail for pair ${pairNum}:`, product);
            
            // Ensure IDs are integers
            const maMau = parseInt(product.color);
            const maSize = parseInt(product.size);
            
            // Validate IDs
            if (isNaN(maMau) || isNaN(maSize) || !maMau || !maSize) {
                console.error(`Invalid data for pair ${pairNum}:`, {
                    originalColor: product.color,
                    originalSize: product.size,
                    parsedMaMau: maMau,
                    parsedMaSize: maSize
                });
                throw new Error(`Dữ liệu không hợp lệ cho đôi ${pairNum}. Vui lòng chọn lại màu sắc và kích thước!`);
            }
            
            const chiTietData = {
                maDangKy: maDangKy,
                maSanPham: currentCampaign.sanPham.maSanPham,
                maMau: maMau,
                maSize: maSize,
                soLuong: 1 // Mỗi chi tiết = 1 đôi
            };
            
            console.log(`   Sending data:`, chiTietData);
            
            const chiTietResponse = await fetch(`${API_BASE_URL}/phieuchitietdangky`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chiTietData)
            });
            
            const chiTietResult = await chiTietResponse.json();
            
            if (!chiTietResult.success) {
                throw new Error(`Không thể tạo chi tiết đôi ${pairNum}: ${chiTietResult.message}`);
            }
            
            console.log(`   ✅ Detail for pair ${pairNum} created successfully`);
        }
        
        console.log('🎉 All steps completed successfully!');
        
        // Store checkout data for payment success page
        const checkoutData = {
            campaignId: currentCampaign.maChienDich,
            products: selectedProducts.slice(0, quantity),
            quantity: quantity,
            betTier: selectedBet,
            addressId: selectedAddressId,
            paymentMethod: paymentMethod,
            maThanhToan: maThanhToan,
            maDangKy: maDangKy,
            totalPayment: totalPayment
        };
        
        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        sessionStorage.setItem('campaignData', JSON.stringify(currentCampaign));
        
        // Redirect to payment success page
        window.location.href = 'payment-success.html';
        
    } catch (error) {
        console.error('❌ Checkout error:', error);
        alert(`Có lỗi xảy ra: ${error.message}\n\nVui lòng thử lại!`);
        
        // Re-enable checkout button
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'XÁC NHẬN THANH TOÁN';
    }
}

// Helper functions
function getNextTier(currentQuantity) {
    const tiers = currentCampaign.bangGiaBacThangs || [];
    return tiers.find(tier => tier.soLuongToiThieu > currentQuantity);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' đ';
}

function fixImagePath(path) {
    if (!path) return '../images/default.jpg';
    if (path.startsWith('../') || path.startsWith('http')) return path;
    if (path.startsWith('images/')) return '../' + path;
    return path;
}

// Load address form data (provinces and districts)
async function loadAddressFormData() {
    try {
        // Load provinces
        const provinceResponse = await fetch(`${API_BASE_URL}/tinhthanh`);
        const provinceData = await provinceResponse.json();
        
        if (provinceData.success) {
            const provinceSelect = document.getElementById('new-tinhThanh');
            if (provinceSelect) {
                provinceSelect.innerHTML = '<option value="">-- Chọn Tỉnh/Thành --</option>' +
                    provinceData.data.map(tt => `<option value="${tt.maTinhThanh}">${tt.tenTinhThanh}</option>`).join('');
                
                // Add event listener for province change
                provinceSelect.addEventListener('change', loadDistrictsForProvince);
            }
        }
    } catch (error) {
        console.error('❌ Error loading address form data:', error);
    }
}

// Load districts when province changes
async function loadDistrictsForProvince() {
    const provinceSelect = document.getElementById('new-tinhThanh');
    const districtSelect = document.getElementById('new-phuongXa');
    
    if (!provinceSelect || !districtSelect) return;
    
    const maTinhThanh = provinceSelect.value;
    
    if (!maTinhThanh) {
        districtSelect.innerHTML = '<option value="">-- Chọn Phường/Xã --</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/phuongxa/tinhthanh/${maTinhThanh}`);
        const data = await response.json();
        
        if (data.success) {
            districtSelect.innerHTML = '<option value="">-- Chọn Phường/Xã --</option>' +
                data.data.map(px => `<option value="${px.maPhuongXa}">${px.tenPhuongXa}</option>`).join('');
        }
    } catch (error) {
        console.error('❌ Error loading districts:', error);
        districtSelect.innerHTML = '<option value="">-- Lỗi tải dữ liệu --</option>';
    }
}

// Save new address to database
async function saveNewAddress() {
    const hoTen = document.getElementById('new-hoTen').value.trim();
    const soDienThoai = document.getElementById('new-soDienThoai').value.trim();
    const diaChiChiTiet = document.getElementById('new-diaChiChiTiet').value.trim();
    const maPhuongXa = document.getElementById('new-phuongXa').value;
    const macDinh = document.getElementById('new-macDinh').checked;
    
    // Validation
    if (!hoTen || !soDienThoai || !diaChiChiTiet || !maPhuongXa) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }
    
    if (!currentUser || !currentUser.maNguoiDung) {
        alert('Vui lòng đăng nhập để lưu địa chỉ!');
        return;
    }
    
    const addressData = {
        maNguoiDung: currentUser.maNguoiDung,
        maPhuongXa: maPhuongXa,
        hoTen: hoTen,
        soDienThoai: soDienThoai,
        diaChiChiTiet: diaChiChiTiet,
        macDinh: macDinh
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/sodiachi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Lưu địa chỉ thành công!');
            
            // Clear form
            document.getElementById('new-hoTen').value = '';
            document.getElementById('new-soDienThoai').value = '';
            document.getElementById('new-diaChiChiTiet').value = '';
            document.getElementById('new-tinhThanh').value = '';
            document.getElementById('new-phuongXa').innerHTML = '<option value="">-- Chọn Phường/Xã --</option>';
            document.getElementById('new-macDinh').checked = false;
            
            // Reload addresses and switch to saved addresses tab
            await loadUserAddresses(currentUser.maNguoiDung);
            
            // Switch to saved addresses tab
            const savedTab = document.querySelector('[data-tab="saved"]');
            const newTab = document.querySelector('[data-tab="new"]');
            const savedContent = document.getElementById('saved-addresses');
            const newContent = document.getElementById('new-address');
            
            if (savedTab && newTab && savedContent && newContent) {
                savedTab.classList.add('active');
                newTab.classList.remove('active');
                savedContent.classList.add('active');
                newContent.classList.remove('active');
            }
        } else {
            alert(data.message || 'Không thể lưu địa chỉ!');
        }
    } catch (error) {
        console.error('❌ Error saving address:', error);
        alert('Có lỗi xảy ra khi lưu địa chỉ!');
    }
}

// Make saveNewAddress available globally
window.saveNewAddress = saveNewAddress;
