// Checkout Page JavaScript - Version 3 with Product Matrix Support
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Checkout page loaded (v3 - Matrix)');
    
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
let productMatrix = {}; // { colorId: { sizeId: quantity } }
let userWallet = null; // Store user wallet info

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
    
    // Load user wallet
    await loadUserWallet(userId);
    
    // Initialize page
    updateCampaignInfo();
    renderProductSelectionForms();
    updatePricingTiers();
    updateAddressList();
    initializeEventHandlers();
    updateOrderSummary();
    
    // Start countdown timer based on campaign end time
    startDecisionCountdown();
    
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

// Load user wallet
async function loadUserWallet(userId) {
    try {
        console.log('Loading wallet for user:', userId);
        const walletResponse = await fetch(`http://localhost:8080/api/wallet/nguoidung/${userId}`);
        const walletData = await walletResponse.json();
        
        if (walletData.success && walletData.data) {
            userWallet = walletData.data;
            console.log('✅ Wallet loaded:', userWallet);
            
            // Update wallet balance display
            const walletBalanceDisplay = document.getElementById('wallet-balance-display');
            if (walletBalanceDisplay) {
                const balance = userWallet.soDu || 0;
                walletBalanceDisplay.textContent = `(Số dư: ${balance.toLocaleString('vi-VN')} đ)`;
            }
        } else {
            userWallet = null;
            const walletBalanceDisplay = document.getElementById('wallet-balance-display');
            if (walletBalanceDisplay) {
                walletBalanceDisplay.textContent = '(Chưa có ví)';
            }
        }
    } catch (error) {
        console.error('❌ Error loading wallet:', error);
        userWallet = null;
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
        const moq = currentCampaign.nguongMOQ || 0;
        const isMOQMet = current >= moq;
        
        if (isMOQMet) {
            progressAlert.innerHTML = `Chiến dịch đã đạt ngưỡng MOQ sản xuất tối thiểu và đang tiếp tục gom số lượng để mở khóa các mốc giá ưu đãi tiếp theo!`;
        } else {
            progressAlert.innerHTML = `Chiến dịch đang thu thập lượt đăng ký để đạt ngưỡng MOQ sản xuất tối thiểu. Hãy chia sẻ chiến dịch để nhanh chóng đạt mốc sản xuất!`;
        }
    }
}

// Render product matrix table
function renderProductSelectionForms() {
    console.log('📊 Rendering product matrix table...');
    
    const matrixBody = document.getElementById('product-matrix-body');
    const matrixTable = document.querySelector('.product-matrix-table');
    
    if (!matrixBody || !matrixTable) {
        console.error('Cannot find matrix table elements');
        return;
    }
    
    const colors = currentCampaign.sanPham?.sanPhamMauSacs || [];
    const sizes = currentCampaign.sanPham?.sanPhamKichThuocs || [];
    
    if (colors.length === 0 || sizes.length === 0) {
        console.error('No colors or sizes available');
        return;
    }
    
    // Update table header with actual sizes from database
    const thead = matrixTable.querySelector('thead tr');
    if (thead) {
        thead.innerHTML = `
            <th class="color-column">Màu sắc</th>
            ${sizes.map(size => `<th class="size-column">Size ${size.kichThuoc?.tenSize || 'N/A'}</th>`).join('')}
            <th class="total-column">Tổng</th>
        `;
    }
    
    // Update table footer with actual sizes from database
    const tfoot = matrixTable.querySelector('tfoot tr');
    if (tfoot) {
        tfoot.innerHTML = `
            <td><strong>TỔNG CỘNG</strong></td>
            ${sizes.map(size => `<td><span id="total-size-${size.maSize}">0</span></td>`).join('')}
            <td><strong id="grand-total">0</strong></td>
        `;
    }
    
    // Initialize product matrix if empty
    colors.forEach(color => {
        if (!productMatrix[color.maMau]) {
            productMatrix[color.maMau] = {};
            sizes.forEach(size => {
                productMatrix[color.maMau][size.maSize] = 0;
            });
        }
    });
    
    // Render table rows
    const campaignRemaining = (currentCampaign.nguongToiDa || 999999) - (currentCampaign.tongSoLuongHienTai || 0);
    const maxCampaignStock = Math.max(0, campaignRemaining);
    
    matrixBody.innerHTML = colors.map(color => {
        const colorName = color.mauSac?.tenMau || 'N/A';
        // Use maHexa from database, fallback to #cccccc if not available
        const colorHex = color.mauSac?.maHexa || '#cccccc';
        // Add border for light colors (white, light gray, etc.)
        const isLightColor = colorHex.toLowerCase() === '#ffffff' || colorHex.toLowerCase() === '#fff' || colorHex.toLowerCase() === '#f5f5f5';
        const colorPreviewStyle = isLightColor
            ? `background: ${colorHex}; box-shadow: inset 0 0 0 1px #ddd;`
            : `background: ${colorHex};`;
        
        return `
            <tr data-color-id="${color.maMau}">
                <td class="color-cell">
                    <div class="color-info">
                        <div class="color-preview" style="${colorPreviewStyle}"></div>
                        <div class="color-details">
                            <span class="color-name">${colorName}</span>
                        </div>
                    </div>
                </td>
                ${sizes.map(size => {
                    const sizeName = size.kichThuoc?.tenSize || 'N/A';
                    const currentValue = productMatrix[color.maMau]?.[size.maSize] || 0;
                    
                    return `
                        <td class="size-cell">
                            <input type="number" 
                                   class="matrix-input" 
                                   data-color-id="${color.maMau}" 
                                   data-size-id="${size.maSize}"
                                   data-color-name="${colorName}"
                                   data-size-name="${sizeName}"
                                   data-max-stock="${maxCampaignStock}"
                                   min="0" 
                                   max="${maxCampaignStock}" 
                                   value="${currentValue}" 
                                   placeholder="0">
                        </td>
                    `;
                }).join('')}
                <td class="total-cell">
                    <span class="row-total" data-color-id="${color.maMau}">0</span>
                </td>
            </tr>
        `;
    }).join('');
    
    // Attach event listeners to inputs
    attachMatrixInputHandlers();
    
    // Calculate initial totals
    calculateTotals();
    
    console.log('✅ Product matrix rendered');
}

// Attach event handlers to matrix inputs
function attachMatrixInputHandlers() {
    document.querySelectorAll('.matrix-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const colorId = e.target.dataset.colorId;
            const sizeId = e.target.dataset.sizeId;
            const maxStock = parseInt(e.target.dataset.maxStock) || 999999;
            let value = parseInt(e.target.value) || 0;
            
            // Validate value
            if (value < 0) {
                value = 0;
                e.target.value = 0;
            }
            
            // Check if grand total of all colors and sizes exceeds campaign stock
            const currentGrandTotal = getGrandTotalExcluding(colorId, sizeId, value);
            if (currentGrandTotal > maxStock) {
                const allowedValue = Math.max(0, maxStock - (currentGrandTotal - value));
                value = allowedValue;
                e.target.value = allowedValue;
                showStockWarning(`Chiến dịch chỉ còn tối đa ${maxStock} sản phẩm để đăng ký!`);
            }
            
            // Update matrix
            if (!productMatrix[colorId]) productMatrix[colorId] = {};
            productMatrix[colorId][sizeId] = value;
            
            // Recalculate totals
            calculateTotals();
            
            // Update order summary
            updateOrderSummary();
        });
        
        // Prevent negative values and invalid characters
        input.addEventListener('keydown', (e) => {
            if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                e.preventDefault();
            }
        });
        
        // Validate on blur
        input.addEventListener('blur', (e) => {
            const value = parseInt(e.target.value) || 0;
            if (value < 0) {
                e.target.value = 0;
                const colorId = e.target.dataset.colorId;
                const sizeId = e.target.dataset.sizeId;
                productMatrix[colorId][sizeId] = 0;
                calculateTotals();
                updateOrderSummary();
            }
        });
    });
}

// Get current grand total of selection excluding/replacing a specific input being changed
function getGrandTotalExcluding(excludeColorId, excludeSizeId, newValue) {
    let total = 0;
    Object.keys(productMatrix).forEach(colorId => {
        if (productMatrix[colorId]) {
            Object.keys(productMatrix[colorId]).forEach(sizeId => {
                if (colorId === excludeColorId && sizeId === excludeSizeId) {
                    total += newValue;
                } else {
                    total += productMatrix[colorId][sizeId] || 0;
                }
            });
        }
    });
    return total;
}

// Calculate all totals
function calculateTotals() {
    const sizes = currentCampaign.sanPham?.sanPhamKichThuocs || [];
    
    // Calculate row totals (total for each color)
    document.querySelectorAll('.row-total').forEach(totalSpan => {
        const colorId = totalSpan.dataset.colorId;
        let rowTotal = 0;
        
        if (productMatrix[colorId]) {
            Object.values(productMatrix[colorId]).forEach(qty => {
                rowTotal += qty || 0;
            });
        }
        
        totalSpan.textContent = rowTotal;
    });
    
    // Calculate column totals (total for each size)
    sizes.forEach(size => {
        const sizeId = size.maSize;
        let columnTotal = 0;
        
        Object.keys(productMatrix).forEach(colorId => {
            if (productMatrix[colorId] && productMatrix[colorId][sizeId]) {
                columnTotal += productMatrix[colorId][sizeId] || 0;
            }
        });
        
        const totalSpan = document.getElementById(`total-size-${sizeId}`);
        if (totalSpan) {
            totalSpan.textContent = columnTotal;
        }
    });
    
    // Calculate grand total
    let grandTotal = 0;
    Object.keys(productMatrix).forEach(colorId => {
        if (productMatrix[colorId]) {
            Object.values(productMatrix[colorId]).forEach(qty => {
                grandTotal += qty || 0;
            });
        }
    });
    
    const grandTotalSpan = document.getElementById('grand-total');
    if (grandTotalSpan) {
        grandTotalSpan.textContent = grandTotal;
    }
}

// Show stock warning with toast notification
function showStockWarning(message = 'Một số màu/size đã hết hàng hoặc không đủ số lượng') {
    const toast = document.getElementById('stock-warning-toast');
    const messageSpan = document.getElementById('stock-warning-message');
    
    if (toast && messageSpan) {
        messageSpan.textContent = message;
        toast.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Clear all selections
function clearAllSelections() {
    // Reset matrix
    Object.keys(productMatrix).forEach(colorId => {
        Object.keys(productMatrix[colorId]).forEach(sizeId => {
            productMatrix[colorId][sizeId] = 0;
        });
    });
    
    // Reset inputs
    document.querySelectorAll('.matrix-input').forEach(input => {
        if (!input.disabled) {
            input.value = 0;
        }
    });
    
    // Recalculate totals
    calculateTotals();
    
    // Update order summary
    updateOrderSummary();
    
    console.log('🧹 All selections cleared');
}

// Make clearAllSelections available globally
window.clearAllSelections = clearAllSelections;

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

// Update order summary
function updateOrderSummary() {
    if (!currentCampaign) return;
    
    // Calculate total quantity from matrix
    let totalQuantity = 0;
    Object.keys(productMatrix).forEach(colorId => {
        Object.values(productMatrix[colorId]).forEach(qty => {
            totalQuantity += qty;
        });
    });
    
    const selectedBet = document.querySelector('input[name="bet"]:checked')?.value || '';
    
    if (!selectedBet) return;
    
    const [min, max] = selectedBet.split('-').map(Number);
    const selectedTier = currentCampaign.bangGiaBacThangs?.find(
        t => t.soLuongToiThieu === min && t.soLuongToiDa === max
    );
    
    if (!selectedTier) return;
    
    const basePrice = currentCampaign.giaGoc || 0;
    const tierPrice = selectedTier.donGia || 0;
    const participationFee = currentCampaign.phiThamGia || 0;
    const discountPercent = basePrice > 0 ? ((basePrice - tierPrice) / basePrice * 100).toFixed(1) : 0;
    
    // Calculate prices
    const totalBasePrice = basePrice * totalQuantity;
    const totalBetPrice = tierPrice * totalQuantity;
    const totalPayment = totalBasePrice + participationFee;
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
            productQtySpan.textContent = `${totalQuantity}x`;
        }
        if (summaryDetail) {
            // Build detail string from matrix
            const details = [];
            Object.keys(productMatrix).forEach(colorId => {
                Object.keys(productMatrix[colorId]).forEach(sizeId => {
                    const qty = productMatrix[colorId][sizeId];
                    if (qty > 0) {
                        const input = document.querySelector(`.matrix-input[data-color-id="${colorId}"][data-size-id="${sizeId}"]`);
                        if (input) {
                            const colorName = input.dataset.colorName;
                            const sizeName = input.dataset.sizeName;
                            details.push(`${colorName} - Size ${sizeName}: ${qty} đôi`);
                        }
                    }
                });
            });
            
            if (details.length > 0) {
                summaryDetail.innerHTML = details.join('<br>');
            } else {
                summaryDetail.textContent = 'Chưa chọn sản phẩm';
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
            const labelSpan = priceItems[0].querySelector('span:first-child');
            if (labelSpan) {
                labelSpan.textContent = `Giá gốc (${totalQuantity} sản phẩm)`;
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
    
    // Calculate total quantity from product matrix
    let totalQuantity = 0;
    const selectedProducts = []; // Array to store {colorId, sizeId, quantity, colorName, sizeName}
    
    Object.keys(productMatrix).forEach(colorId => {
        Object.keys(productMatrix[colorId]).forEach(sizeId => {
            const qty = productMatrix[colorId][sizeId] || 0;
            if (qty > 0) {
                totalQuantity += qty;
                const input = document.querySelector(`.matrix-input[data-color-id="${colorId}"][data-size-id="${sizeId}"]`);
                if (input) {
                    selectedProducts.push({
                        colorId: colorId,
                        sizeId: sizeId,
                        quantity: qty,
                        colorName: input.dataset.colorName,
                        sizeName: input.dataset.sizeName
                    });
                }
            }
        });
    });
    
    console.log('📦 Selected products:', selectedProducts);
    console.log('📊 Total quantity:', totalQuantity);
    
    // Validation
    if (totalQuantity === 0) {
        alert('Vui lòng chọn ít nhất 1 sản phẩm!');
        return;
    }
    
    const selectedBet = document.querySelector('input[name="bet"]:checked')?.value;
    const selectedBetRadio = document.querySelector('input[name="bet"]:checked');
    
    if (!selectedBet) {
        alert('Vui lòng chọn mốc đặt cược!');
        return;
    }
    
    const selectedAddressId = document.querySelector('input[name="address"]:checked')?.dataset.addressId;
    
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
    
    // Get payment method name from selected radio button
    const selectedPaymentRadio = document.querySelector('input[name="payment"]:checked');
    if (!selectedPaymentRadio) {
        alert('Vui lòng chọn phương thức thanh toán!');
        return;
    }
    
    const paymentMethod = selectedPaymentRadio.value; // Get value directly (Ví EXED, MoMo, VNPay, Thẻ tín dụng)
    
    // Check wallet balance if paying with EXED Wallet
    if (paymentMethod === 'Ví EXED') {
        if (!userWallet) {
            alert('Bạn chưa có ví EXED!');
            return;
        }
        
        const walletBalance = userWallet.soDu || 0;
        if (walletBalance < totalPayment) {
            alert(`Số dư ví không đủ!\nSố dư hiện tại: ${walletBalance.toLocaleString('vi-VN')} đ\nSố tiền cần thanh toán: ${totalPayment.toLocaleString('vi-VN')} đ\nThiếu: ${(totalPayment - walletBalance).toLocaleString('vi-VN')} đ`);
            return;
        }
    }
    
    // Get selected address details
    const selectedAddress = userAddresses.find(addr => addr.maSo === selectedAddressId);
    if (!selectedAddress) {
        alert('Không tìm thấy thông tin địa chỉ!');
        return;
    }
    
    // Calculate total payment
    const basePrice = currentCampaign.giaGoc || 0;
    const participationFee = currentCampaign.phiThamGia || 0;
    const totalBasePrice = basePrice * totalQuantity;
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
            ghiChu: `Thanh toán đăng ký chiến dịch ${currentCampaign.tenChienDich}`,
            maNguoiDung: currentUser.maNguoiDung // Add user ID for wallet payment
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
            tongSoLuong: totalQuantity
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
        
        // STEP 3: Create PhieuChiTietDangKy (Registration Details) for each color-size combination
        console.log('📝 Step 3: Creating registration details...');
        
        for (let i = 0; i < selectedProducts.length; i++) {
            const product = selectedProducts[i];
            
            console.log(`   Creating detail ${i + 1}/${selectedProducts.length}:`, product);
            
            // Ensure IDs are integers
            const maMau = parseInt(product.colorId);
            const maSize = parseInt(product.sizeId);
            const soLuong = parseInt(product.quantity);
            
            // Validate IDs
            if (isNaN(maMau) || isNaN(maSize) || isNaN(soLuong) || !maMau || !maSize || soLuong <= 0) {
                console.error(`Invalid data for product ${i + 1}:`, {
                    originalColorId: product.colorId,
                    originalSizeId: product.sizeId,
                    originalQuantity: product.quantity,
                    parsedMaMau: maMau,
                    parsedMaSize: maSize,
                    parsedSoLuong: soLuong
                });
                throw new Error(`Dữ liệu không hợp lệ cho sản phẩm ${product.colorName} - Size ${product.sizeName}!`);
            }
            
            const chiTietData = {
                maDangKy: maDangKy,
                maSanPham: currentCampaign.sanPham.maSanPham,
                maMau: maMau,
                maSize: maSize,
                soLuong: soLuong
            };
            
            console.log(`   Sending data:`, chiTietData);
            
            const chiTietResponse = await fetch(`${API_BASE_URL}/phieuchitietdangky`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chiTietData)
            });
            
            const chiTietResult = await chiTietResponse.json();
            
            if (!chiTietResult.success) {
                throw new Error(`Không thể tạo chi tiết cho ${product.colorName} - Size ${product.sizeName}: ${chiTietResult.message}`);
            }
            
            console.log(`   ✅ Detail ${i + 1} created successfully`);
        }
        
        console.log('🎉 All steps completed successfully!');
        
        // Redirect to payment success page with maDangKy
        window.location.href = `payment-success.html?maDangKy=${maDangKy}`;
        
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

// Start decision countdown timer
function startDecisionCountdown() {
    if (!currentCampaign || !currentCampaign.ngayKetThuc) {
        console.warn('⚠️ No campaign end date available');
        return;
    }
    
    const endDate = new Date(currentCampaign.ngayKetThuc);
    const now = new Date();
    
    // Calculate time remaining in milliseconds
    let timeRemaining = endDate - now;
    
    // If campaign has ended, show zeros
    if (timeRemaining <= 0) {
        updateCountdownDisplay(0, 0, 0, 0);
        return;
    }
    
    // Calculate if more than 2 days remaining
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    
    if (timeRemaining > twoDaysInMs) {
        // Show fixed 2 days
        updateCountdownDisplay(2, 0, 0, 0);
        console.log('⏰ Campaign has more than 2 days remaining - showing fixed 2 days');
        return;
    }
    
    // Less than or equal to 2 days - start real countdown
    console.log('⏰ Starting real countdown - time remaining:', timeRemaining);
    
    function updateTimer() {
        const now = new Date();
        timeRemaining = endDate - now;
        
        if (timeRemaining <= 0) {
            updateCountdownDisplay(0, 0, 0, 0);
            clearInterval(timerInterval);
            return;
        }
        
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        updateCountdownDisplay(days, hours, minutes, seconds);
    }
    
    // Update immediately
    updateTimer();
    
    // Update every second
    const timerInterval = setInterval(updateTimer, 1000);
}

// Update countdown display
function updateCountdownDisplay(days, hours, minutes, seconds) {
    const timeBoxes = document.querySelectorAll('.decision-countdown .time-box');
    
    if (timeBoxes.length >= 4) {
        // Days
        const daysValue = timeBoxes[0].querySelector('.time-value');
        if (daysValue) daysValue.textContent = String(days).padStart(2, '0');
        
        // Hours
        const hoursValue = timeBoxes[1].querySelector('.time-value');
        if (hoursValue) hoursValue.textContent = String(hours).padStart(2, '0');
        
        // Minutes
        const minutesValue = timeBoxes[2].querySelector('.time-value');
        if (minutesValue) minutesValue.textContent = String(minutes).padStart(2, '0');
        
        // Seconds
        const secondsValue = timeBoxes[3].querySelector('.time-value');
        if (secondsValue) secondsValue.textContent = String(seconds).padStart(2, '0');
    }
}
