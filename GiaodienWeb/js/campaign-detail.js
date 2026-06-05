// Campaign Detail Page JavaScript
document.addEventListener('DOMContentLoaded', async function () {
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

    // Start countdown timer - use start date for upcoming campaigns
    if (campaign.thoiDiem === 'Sắp bắt đầu') {
        startCountdownTimer(campaign.ngayBatDau, true);
    } else if (campaign.thoiDiem === 'Đã kết thúc') {
        startCountdownTimer(new Date(0), false);
    } else {
        startCountdownTimer(campaign.ngayKetThuc, false);
    }

    // Check if user already has a registration for this campaign
    await checkUserRegistration(campaignId);

    // Handle status-based UI changes
    handleStatusBasedUI(campaign.thoiDiem);
}

// Handle UI changes based on campaign status
function handleStatusBasedUI(status) {
    const reviewsSection = document.getElementById('reviewsSection');
    const joinBtn = document.getElementById('joinBtn');
    const betWarningBox = document.querySelector('.bet-warning-box');

    console.log('Handling status-based UI for:', status);

    // Show reviews only for completed campaigns
    if (status === 'Đã kết thúc') {
        console.log('Showing reviews section');
        if (reviewsSection) {
            reviewsSection.style.display = 'block';
            // Initialize review filters
            if (typeof filterReviews === 'function') {
                filterReviews();
            }
        }

        // Hide warning box for completed campaigns
        if (betWarningBox) {
            betWarningBox.style.display = 'none';
        }
    }

    // Hide join button for upcoming and completed campaigns
    if (status === 'Sắp bắt đầu' || status === 'Đã kết thúc') {
        console.log('Hiding join button');
        if (joinBtn) {
            joinBtn.style.display = 'none';
        }
    }

    // Change button for upcoming campaigns
    if (status === 'Sắp bắt đầu' && joinBtn) {
        joinBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            NHẮC NHỞ TÔI
        `;
        joinBtn.style.display = 'flex';
        joinBtn.onclick = function (e) {
            e.preventDefault();
            alert('Chúng tôi sẽ gửi thông báo cho bạn khi chiến dịch bắt đầu!');
        };
    }

    // Setup join button click handler for active campaigns
    if (joinBtn && status === 'Đang diễn ra') {
        joinBtn.addEventListener('click', function (e) {
            e.preventDefault();

            if (!AuthManager.isLoggedIn()) {
                alert('Vui lòng đăng nhập để tham gia chiến dịch!');
                window.location.href = 'login.html';
                return;
            }

            // Get campaign ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const campaignId = urlParams.get('id');

            if (campaignId) {
                window.location.href = `checkout.html?id=${campaignId}`;
            } else {
                alert('Không tìm thấy thông tin chiến dịch!');
            }
        });
    }
}

// Update campaign header
function updateCampaignHeader(campaign) {
    const statusBadge = document.querySelector('.status-badge');
    const campaignTitle = document.querySelector('.campaign-header h1');
    const productName = document.querySelector('.product-name');

    if (statusBadge) {
        statusBadge.textContent = campaign.thoiDiem;
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
        if (campaign.thoiDiem === 'Sắp bắt đầu') {
            countdownLabel.textContent = 'Thời gian bắt đầu:';
        } else if (campaign.thoiDiem === 'Đang diễn ra') {
            countdownLabel.textContent = 'Kết thúc sau:';
        } else {
            countdownLabel.textContent = 'Đã kết thúc';
        }
    }
}

// Start countdown timer
function startCountdownTimer(targetDate, isStartDate = false) {
    const timeUnits = document.querySelectorAll('.time-unit .time-value');

    if (timeUnits.length !== 4) return;

    function update() {
        const now = new Date();
        const target = new Date(targetDate);
        const diff = target - now;

        if (diff <= 0) {
            timeUnits[0].textContent = '00';
            timeUnits[1].textContent = '00';
            timeUnits[2].textContent = '00';
            timeUnits[3].textContent = '00';
            
            // Real-time status transition when countdown reaches 0
            if (!isStartDate) {
                const statusBadge = document.querySelector('.status-badge');
                if (statusBadge && statusBadge.textContent === 'Đang diễn ra') {
                    statusBadge.textContent = 'Đã kết thúc';
                    statusBadge.className = 'status-badge ended';
                    handleStatusBasedUI('Đã kết thúc');
                    
                    const countdownLabel = document.querySelector('.countdown-label span');
                    if (countdownLabel) {
                        countdownLabel.textContent = 'Đã kết thúc';
                    }
                }
            } else {
                // If it was "Sắp bắt đầu", reload the campaign detail to show "Đang diễn ra"
                const urlParams = new URLSearchParams(window.location.search);
                const campaignId = urlParams.get('id');
                if (campaignId) {
                    loadCampaignDetail(campaignId).catch(console.error);
                }
            }
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

    const current = campaign.tongSoLuongHienTai || 0;
    const moq = campaign.nguongMOQ || 0;

    if (progressCount) {
        if (current >= moq) {
            progressCount.innerHTML = `<span class="moq-badge-status reached"><span class="badge-icon">✓</span> Đã đạt MOQ</span>`;
        } else {
            progressCount.innerHTML = `<span class="moq-badge-status pending"><span class="badge-icon">⏳</span> Đang gom đăng ký</span>`;
        }
    }

    if (progressFill) {
        // Progress bar represents progress towards MOQ (minimum needed to manufacture)
        const percentage = Math.min((current / moq * 100), 100);
        progressFill.style.width = `${percentage}%`;
    }
}

// Update MOQ status
function updateMOQStatus(campaign) {
    const moqSection = document.querySelector('.moq-section');
    const moqBadge = document.querySelector('.moq-badge span');
    const moqStatus = document.querySelector('.moq-status');

    const moq = campaign.nguongMOQ || 0;
    const current = campaign.tongSoLuongHienTai || 0;

    console.log('MOQ Status:', { moq, current });

    if (moqBadge) {
        moqBadge.textContent = `MOQ tối thiểu: ${moq} sản phẩm`;
    }

    if (moqSection) {
        if (current >= moq) {
            moqSection.className = 'moq-section success';
        } else {
            moqSection.className = 'moq-section warning';
        }
    }

    if (moqStatus) {
        if (current >= moq) {
            moqStatus.className = 'moq-status success';
            moqStatus.textContent = '✓ Đã đạt ngưỡng sản xuất tối thiểu (Đủ điều kiện sản xuất)';
        } else {
            moqStatus.className = 'moq-status warning';
            moqStatus.textContent = `⏳ Đang gom số lượng đăng ký để đạt ngưỡng sản xuất tối thiểu (${moq} sản phẩm)`;
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

    // Check if campaign is completed
    const isCompleted = campaign.thoiDiem === 'Đã kết thúc';

    // Update colors
    if (colorList && campaign.sanPham.sanPhamMauSacs) {
        const colors = campaign.sanPham.sanPhamMauSacs;

        if (colors.length === 0) {
            colorList.innerHTML = '<p style="color: #666;">Chưa có thông tin màu sắc</p>';
        } else {
            colorList.innerHTML = colors.map(color => {
                const colorName = color.mauSac?.tenMau || 'N/A';
                // Use maHexa from database, fallback to #cccccc if not available
                const colorHex = color.mauSac?.maHexa || '#cccccc';
                // Add border for light colors (white, light gray, etc.)
                const isLightColor = colorHex.toLowerCase() === '#ffffff' || colorHex.toLowerCase() === '#fff' || colorHex.toLowerCase() === '#f5f5f5';
                const swatchStyle = isLightColor
                    ? `background: ${colorHex}; box-shadow: inset 0 0 0 1px #ddd;`
                    : `background: ${colorHex};`;

                return `
                    <div class="color-item">
                        <div class="color-info">
                            <div class="color-swatch" style="${swatchStyle}"></div>
                            <div class="color-details">
                                <span class="color-name">${colorName}</span>
                            </div>
                        </div>
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
    switch (thoiDiem) {
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



// Check if user already has a registration for this campaign
async function checkUserRegistration(campaignId) {
    // Only check if user is logged in
    if (!AuthManager.isLoggedIn()) {
        return;
    }

    const currentUser = AuthManager.getCurrentUser();
    if (!currentUser || !currentUser.maNguoiDung) {
        return;
    }

    try {
        console.log('Checking if user has existing registration for campaign:', campaignId);
        
        // Fetch all user registrations
        const response = await fetch(`${API_BASE_URL}/dangkychiendich/nguoidung/${currentUser.maNguoiDung}`);
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            // Check if any registration matches this campaign (including cancelled ones)
            const existingRegistration = data.data.find(reg => 
                reg.chienDich && reg.chienDich.maChienDich == campaignId
            );

            if (existingRegistration) {
                console.log('User already has a registration for this campaign:', existingRegistration);
                disableJoinButton(existingRegistration.daHuy);
            }
        }
    } catch (error) {
        console.error('Error checking user registration:', error);
        // Don't block the UI if check fails
    }
}

// Disable the join button and show message
function disableJoinButton(isCancelled) {
    const joinBtn = document.getElementById('joinBtn');
    const actionButtons = document.getElementById('actionButtons');
    
    if (!joinBtn || !actionButtons) return;

    // Hide the join button completely
    joinBtn.style.display = 'none';

    // Update action buttons container to display items on same row
    actionButtons.style.display = 'flex';
    actionButtons.style.flexDirection = 'row';
    actionButtons.style.justifyContent = 'space-between';
    actionButtons.style.alignItems = 'center';
    actionButtons.style.gap = '15px';

    // Add a note next to the share button (if not already added)
    if (!document.getElementById('registration-note')) {
        const note = document.createElement('div');
        note.id = 'registration-note';
        note.style.cssText = `
            color: ${isCancelled ? '#d32f2f' : '#2e7d32'};
            font-size: 14px;
            font-weight: 600;
            padding: 12px 16px;
            background: ${isCancelled ? 'rgba(211, 47, 47, 0.1)' : 'rgba(46, 125, 50, 0.1)'};
            border-radius: 8px;
            border: 1px solid ${isCancelled ? 'rgba(211, 47, 47, 0.3)' : 'rgba(46, 125, 50, 0.3)'};
            flex: 1;
            text-align: left;
        `;
        note.innerHTML = isCancelled 
            ? '⚠️ Bạn đã có đơn đăng ký bị hủy cho chiến dịch này. Không thể đăng ký lại.'
            : '✓ Bạn đã tham gia chiến dịch này. Xem chi tiết tại <a href="order-history.html" style="color: #5f0704; text-decoration: underline; font-weight: 700;">Lịch sử đơn hàng</a>.';
        
        // Insert the note as the first child of action buttons
        actionButtons.insertBefore(note, actionButtons.firstChild);
    }
}
