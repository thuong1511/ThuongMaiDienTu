// Campaign Detail Page JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Campaign Detail page loaded');
    
    // Get campaign ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('id');
    
    console.log('Campaign ID from URL:', campaignId);
    
    if (!campaignId) {
        console.error('❌ No campaign ID provided');
        alert('Không tìm thấy thông tin chiến dịch!');
        window.location.href = '../index.html';
        return;
    }
    
    try {
        await loadCampaignDetail(campaignId);
    } catch (error) {
        console.error('❌ Error loading campaign detail:', error);
        alert('Không thể tải thông tin chiến dịch!');
    }
});

// Load campaign detail from API
async function loadCampaignDetail(campaignId) {
    console.log('Loading campaign detail for ID:', campaignId);
    
    const response = await api.getChienDichById(campaignId);
    
    if (!response.success || !response.data) {
        throw new Error('Failed to load campaign data');
    }
    
    const campaign = response.data;
    console.log('✅ Campaign data loaded:', campaign);
    
    // Update all sections
    updateCampaignHeader(campaign);
    updateGallery(campaign);
    updateArtistInfo(campaign);
    updateCountdown(campaign);
    updateProgress(campaign);
    updateMOQStatus(campaign);
    updatePricingTable(campaign);
    updateProductVariants(campaign);
    updateProductDescription(campaign);
    
    // Start countdown timer
    startCountdownTimer(campaign.ngayKetThuc);
}

// Update campaign header
function updateCampaignHeader(campaign) {
    const statusBadge = document.querySelector('.status-badge');
    const campaignTitle = document.querySelector('.campaign-header h1');
    const productName = document.querySelector('.product-name');
    
    if (statusBadge) {
        statusBadge.textContent = campaign.thoiDiem.toUpperCase();
        statusBadge.className = `status-badge ${getStatusClass(campaign.thoiDiem)}`;
    }
    
    if (campaignTitle) {
        campaignTitle.textContent = campaign.tenChienDich;
    }
    
    if (productName && campaign.sanPham) {
        productName.textContent = campaign.sanPham.tenSanPham || 'Limited Edition Sneaker - Premium Collection';
    }
}

// Update gallery with images (2 from HinhAnhChienDich + 2 from HinhAnhSanPham)
function updateGallery(campaign) {
    const mainImg = document.getElementById('mainImg');
    const thumbnailList = document.querySelector('.thumbnail-list');
    const badgeDiscount = document.querySelector('.badge-discount');
    
    // Collect images: 2 from campaign + 2 from product
    const images = [];
    
    // Add campaign images first (max 2)
    if (campaign.hinhAnhChienDichs && campaign.hinhAnhChienDichs.length > 0) {
        campaign.hinhAnhChienDichs.slice(0, 2).forEach(img => {
            images.push(fixImagePath(img.duongDan));
        });
    }
    
    // Add product images (max 2)
    if (campaign.sanPham?.hinhAnhSanPhams && campaign.sanPham.hinhAnhSanPhams.length > 0) {
        campaign.sanPham.hinhAnhSanPhams.slice(0, 2).forEach(img => {
            images.push(fixImagePath(img.duongDan));
        });
    }
    
    // Fallback if no images
    if (images.length === 0) {
        images.push('../images/chiendich1.jpg');
    }
    
    console.log('Gallery images:', images);
    
    // Update main image
    if (mainImg) {
        mainImg.src = images[0];
    }
    
    // Update thumbnails
    if (thumbnailList) {
        thumbnailList.innerHTML = images.map((img, index) => 
            `<img src="${img}" alt="Thumb ${index + 1}" class="thumb ${index === 0 ? 'active' : ''}">`
        ).join('');
        
        // Re-attach thumbnail click handlers
        initThumbnailGallery();
    }
    
    // Update discount badge
    if (badgeDiscount) {
        const currentPrice = getCurrentPrice(campaign);
        const discountPercent = ((campaign.giaGoc - currentPrice) / campaign.giaGoc * 100).toFixed(1);
        badgeDiscount.textContent = `-${discountPercent}%`;
    }
}

// Initialize thumbnail gallery
function initThumbnailGallery() {
    const thumbs = document.querySelectorAll('.thumb');
    const mainImg = document.getElementById('mainImg');
    
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            mainImg.src = thumb.src;
        });
    });
}

// Update artist info
function updateArtistInfo(campaign) {
    const artistProfile = document.querySelector('.artist-profile');
    
    if (!artistProfile || !campaign.ngheSi) return;
    
    const artistImg = artistProfile.querySelector('img');
    const artistName = artistProfile.querySelector('h4');
    const artistBio = artistProfile.querySelector('p');
    
    // Get artist image
    const artistImage = campaign.ngheSi.hinhAnhNgheSis?.[0]?.duongDan || '../images/default-artist.jpg';
    
    if (artistImg) artistImg.src = fixImagePath(artistImage);
    if (artistName) artistName.textContent = campaign.ngheSi.tenNgheSi;
    if (artistBio) artistBio.textContent = campaign.ngheSi.moTa || 'Nghệ sĩ nổi tiếng với phong cách độc đáo.';
}

// Update countdown
function updateCountdown(campaign) {
    const countdownLabel = document.querySelector('.countdown-label span');
    if (countdownLabel) {
        countdownLabel.textContent = campaign.thoiDiem === 'Đang diễn ra' ? 'Kết thúc sau:' : 'Đã kết thúc';
    }
}

// Start countdown timer
function startCountdownTimer(endDate) {
    const timeUnits = document.querySelectorAll('.time-unit .time-value');
    
    if (timeUnits.length !== 4) return;
    
    function update() {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;
        
        if (diff <= 0) {
            timeUnits[0].textContent = '00';
            timeUnits[1].textContent = '00';
            timeUnits[2].textContent = '00';
            timeUnits[3].textContent = '00';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        timeUnits[0].textContent = String(days).padStart(2, '0');
        timeUnits[1].textContent = String(hours).padStart(2, '0');
        timeUnits[2].textContent = String(minutes).padStart(2, '0');
        timeUnits[3].textContent = String(seconds).padStart(2, '0');
    }
    
    update();
    setInterval(update, 1000);
}

// Update progress
function updateProgress(campaign) {
    const progressCount = document.querySelector('.progress-count');
    const progressFill = document.querySelector('.progress-fill-detail');
    
    const current = campaign.tongSoLuongHienTai;
    const max = campaign.nguongToiDa;
    const percentage = Math.min((current / max * 100), 100);
    
    if (progressCount) {
        progressCount.innerHTML = `<strong>${current}</strong> / ${max} sản phẩm`;
    }
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
}

// Update MOQ status
function updateMOQStatus(campaign) {
    const moqBadge = document.querySelector('.moq-badge span');
    const moqStatus = document.querySelector('.moq-status');
    
    const moq = campaign.nguongMOQ || 0;
    const current = campaign.tongSoLuongHienTai || 0;
    
    console.log('MOQ Status:', { moq, current });
    
    if (moqBadge) {
        moqBadge.textContent = `MOQ: ${moq} sản phẩm`;
    }
    
    if (moqStatus) {
        if (current >= moq) {
            moqStatus.className = 'moq-status success';
            moqStatus.textContent = '✓ Đã đạt ngưỡng sản xuất tối thiểu';
        } else {
            moqStatus.className = 'moq-status warning';
            moqStatus.textContent = `⚠ Còn thiếu ${moq - current} sản phẩm để đạt MOQ`;
        }
    }
}

// Update pricing table
function updatePricingTable(campaign) {
    const priceNote = document.querySelector('.price-note');
    const priceTiers = document.querySelector('.price-tiers');
    const betWarningBox = document.querySelector('.bet-warning-box p');
    
    // Update price note
    if (priceNote) {
        priceNote.innerHTML = `<strong>Giá gốc:</strong> ${formatCurrency(campaign.giaGoc)} | <strong>Phí tham gia:</strong> ${formatCurrency(campaign.phiThamGia)} (không hoàn lại)`;
    }
    
    // Update warning box with correct highest price
    if (betWarningBox) {
        betWarningBox.textContent = `Sau khi chọn mốc, bạn có 2 ngày (48 giờ) để quyết định. Nếu hết thời gian mà mốc chưa đạt đủ số lượng, bạn sẽ tự động bị xem là cược sai và phải thanh toán giá cao nhất (${formatCurrency(campaign.giaGoc)}).`;
    }
    
    // Update price tiers
    if (priceTiers && campaign.bangGiaBacThangs) {
        priceTiers.innerHTML = campaign.bangGiaBacThangs.map(tier => {
            const discountPercent = ((campaign.giaGoc - tier.donGia) / campaign.giaGoc * 100).toFixed(1);
            return `
                <div class="tier-row" data-tier="${tier.soLuongToiThieu}-${tier.soLuongToiDa}">
                    <div class="tier-range">${tier.soLuongToiThieu} - ${tier.soLuongToiDa}</div>
                    <div class="tier-price">${formatCurrency(tier.donGia)}</div>
                    <div class="tier-discount">-${discountPercent}%</div>
                </div>
            `;
        }).join('');
        
        // Re-attach tier selection handlers
        initTierSelection();
    }
}

// Initialize tier selection
function initTierSelection() {
    const tierRows = document.querySelectorAll('.tier-row');
    
    tierRows.forEach(row => {
        row.addEventListener('click', () => {
            tierRows.forEach(r => r.classList.remove('highlight'));
            row.classList.add('highlight');
        });
    });
}

// Update product description
function updateProductDescription(campaign) {
    const descSection = document.querySelector('.product-description');
    
    if (!descSection || !campaign.sanPham) return;
    
    const descTitle = descSection.querySelector('h2');
    const descText = descSection.querySelector('p');
    const descList = descSection.querySelector('ul');
    
    if (descTitle) {
        descTitle.textContent = 'MÔ TẢ SẢN PHẨM';
    }
    
    if (descText) {
        descText.textContent = campaign.sanPham.moTa || campaign.moTa || 'Sản phẩm phiên bản giới hạn được thiết kế độc quyền.';
    }
    
    // Keep the default list or customize based on product data
    // For now, keeping the static list as requested
}

function updateProductVariants(campaign) {
    if (!campaign.sanPham) return;
    
    const colorList = document.getElementById('colorList');
    const sizeList = document.getElementById('sizeList');
    
    // Color mapping for visual display
    const colorMap = {
        'Đen': '#000000',
        'Trắng': '#FFFFFF',
        'Xanh Navy': '#001f3f',
        'Đỏ': '#DC143C',
        'Xám': '#808080',
        'Xanh Dương': '#0074D9',
        'Xanh Lá': '#2ECC40',
        'Vàng': '#FFDC00',
        'Cam': '#FF851B',
        'Hồng': '#FF69B4',
        'Nâu': '#8B4513',
        'Tím': '#9370DB'
    };
    
    // Update colors
    if (colorList && campaign.sanPham.sanPhamMauSacs) {
        const colors = campaign.sanPham.sanPhamMauSacs;
        
        if (colors.length === 0) {
            colorList.innerHTML = '<p style="color: #666;">Chưa có thông tin màu sắc</p>';
        } else {
            colorList.innerHTML = colors.map(color => {
                const remaining = color.soLuongToiDa - color.soLuongDaDat;
                const percentage = (color.soLuongDaDat / color.soLuongToiDa) * 100;
                
                let stockClass = '';
                let badgeClass = '';
                let badgeText = `${remaining} đôi`;
                
                if (remaining === 0) {
                    stockClass = 'out-of-stock';
                    badgeClass = 'out';
                    badgeText = 'Hết hàng';
                } else if (percentage >= 80) {
                    stockClass = 'low-stock';
                    badgeClass = 'low';
                }
                
                const colorName = color.mauSac?.tenMau || 'N/A';
                const colorHex = colorMap[colorName] || '#cccccc';
                const swatchStyle = colorName === 'Trắng' 
                    ? `background: ${colorHex}; box-shadow: inset 0 0 0 1px #ddd;`
                    : `background: ${colorHex};`;
                
                return `
                    <div class="color-item">
                        <div class="color-info">
                            <div class="color-swatch" style="${swatchStyle}"></div>
                            <div class="color-details">
                                <span class="color-name">${colorName}</span>
                                <span class="color-stock ${stockClass}">
                                    Đã đặt: ${color.soLuongDaDat}/${color.soLuongToiDa}
                                </span>
                            </div>
                        </div>
                        <span class="stock-badge ${badgeClass}">${badgeText}</span>
                    </div>
                `;
            }).join('');
        }
    }
    
    // Update sizes
    if (sizeList && campaign.sanPham.sanPhamKichThuocs) {
        const sizes = campaign.sanPham.sanPhamKichThuocs;
        
        if (sizes.length === 0) {
            sizeList.innerHTML = '<p style="color: #666;">Chưa có thông tin kích thước</p>';
        } else {
            sizeList.innerHTML = sizes.map(size => {
                return `
                    <div class="size-item">
                        ${size.kichThuoc?.tenSize || 'N/A'}
                    </div>
                `;
            }).join('');
        }
    }
}


// Helper: Get current price
function getCurrentPrice(campaign) {
    const bangGia = campaign.bangGiaBacThangs || [];
    const soLuong = campaign.tongSoLuongHienTai;
    
    for (let i = bangGia.length - 1; i >= 0; i--) {
        if (soLuong >= bangGia[i].soLuongToiThieu) {
            return parseFloat(bangGia[i].donGia);
        }
    }
    
    return parseFloat(campaign.giaGoc);
}

// Helper: Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' đ';
}

// Helper: Get status class
function getStatusClass(thoiDiem) {
    switch(thoiDiem) {
        case 'Đang diễn ra': return 'active';
        case 'Đã kết thúc': return 'ended';
        case 'Sắp bắt đầu': return 'upcoming';
        default: return '';
    }
}

// Helper: Fix image path for pages subfolder
function fixImagePath(path) {
    if (!path) return '../images/default.jpg';
    
    // If path already starts with ../ or http, return as is
    if (path.startsWith('../') || path.startsWith('http')) {
        return path;
    }
    
    // If path starts with images/, add ../
    if (path.startsWith('images/')) {
        return '../' + path;
    }
    
    // Otherwise return as is
    return path;
}

