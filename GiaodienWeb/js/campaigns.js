// Campaigns Page JavaScript
let allCampaigns = [];
let filteredCampaigns = [];
let allArtists = [];
let allCategories = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 6;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Campaigns page loaded');
    
    try {
        await Promise.all([
            loadAllCampaigns(),
            loadAllArtists(),
            loadAllCategories()
        ]);
        setupEventListeners();
    } catch (error) {
        console.error('❌ Error loading campaigns:', error);
    }
});

// Load all campaigns from API
async function loadAllCampaigns() {
    console.log('Loading all campaigns...');
    
    const response = await api.getAllChienDich();
    
    if (!response.success || !response.data) {
        throw new Error('Failed to load campaigns');
    }
    
    allCampaigns = response.data;
    filteredCampaigns = [...allCampaigns];
    
    console.log(`✅ Loaded ${allCampaigns.length} campaigns`);
    
    // Áp dụng sắp xếp mặc định (Đang diễn ra → Sắp diễn ra → Đã kết thúc)
    sortCampaigns(filteredCampaigns, 'newest');
    
    console.log('📊 Campaigns sorted by priority:');
    filteredCampaigns.slice(0, 5).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.tenChienDich} - ${c.thoiDiem} - Bắt đầu: ${c.ngayBatDau}`);
    });
    
    renderCampaignsWithPagination();
    updateResultsCount(filteredCampaigns.length);
}

// Load all artists from API
async function loadAllArtists() {
    console.log('Loading all artists...');
    
    const response = await api.getAllNgheSi();
    
    if (!response.success || !response.data) {
        console.warn('Failed to load artists');
        return;
    }
    
    allArtists = response.data;
    console.log(`✅ Loaded ${allArtists.length} artists`);
    
    renderArtistFilter();
}

// Load all categories from API
async function loadAllCategories() {
    console.log('Loading all categories...');
    
    const response = await api.getAllDanhMuc();
    
    if (!response.success || !response.data) {
        console.warn('Failed to load categories');
        return;
    }
    
    allCategories = response.data;
    console.log(`✅ Loaded ${allCategories.length} categories`);
    
    renderCategoryFilter();
}

// Render artist filter options
function renderArtistFilter() {
    const artistFilter = document.getElementById('artistFilter');
    if (!artistFilter) return;
    
    // Keep "Tất cả" option
    artistFilter.innerHTML = '<option value="">Tất cả</option>';
    
    allArtists.forEach(artist => {
        const option = document.createElement('option');
        option.value = artist.maNgheSi;
        option.textContent = artist.tenNgheSi;
        artistFilter.appendChild(option);
    });
}

// Render category filter options
function renderCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Keep "Tất cả" option
    categoryFilter.innerHTML = '<option value="">Tất cả</option>';
    
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.maDanhMuc;
        option.textContent = category.tenDanhMuc;
        categoryFilter.appendChild(option);
    });
}

// Render campaigns with pagination
function renderCampaignsWithPagination() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const campaignsToShow = filteredCampaigns.slice(startIndex, endIndex);
    
    renderCampaigns(campaignsToShow);
    renderPagination();
}

// Render campaigns
function renderCampaigns(campaigns) {
    const campaignGrid = document.querySelector('.campaign-grid');
    
    if (!campaignGrid) return;
    
    if (campaigns.length === 0) {
        campaignGrid.innerHTML = '<div class="empty-state">Không tìm thấy chiến dịch nào phù hợp.</div>';
        return;
    }
    
    campaignGrid.innerHTML = campaigns.map(campaign => createCampaignCard(campaign)).join('');
    
    // Start countdown timers
    startAllCountdowns();
}

// Render pagination
function renderPagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
    
    // Hide pagination if only 1 page or no campaigns
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    pagination.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCampaignsWithPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    pagination.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn';
        if (i === currentPage) pageBtn.classList.add('active');
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderCampaignsWithPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    `;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderCampaignsWithPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    pagination.appendChild(nextBtn);
}

// Create campaign card HTML
function createCampaignCard(campaign) {
    const currentPrice = getCurrentPrice(campaign);
    const discountPercent = ((campaign.giaGoc - currentPrice) / campaign.giaGoc * 100).toFixed(1);
    const moq = campaign.nguongMOQ || 0;
    const current = campaign.tongSoLuongHienTai || 0;
    const isMOQMet = current >= moq;
    const progressPercent = moq > 0 ? Math.min((current / moq * 100), 100) : 0;
    
    // Get campaign image
    const imageUrl = fixImagePath(
        campaign.hinhAnhChienDichs?.[0]?.duongDan || 
        campaign.sanPham?.hinhAnhSanPhams?.[0]?.duongDan || 
        '../images/chiendich1.jpg'
    );
    
    // Get artist image
    const artistImageUrl = fixImagePath(
        campaign.ngheSi?.hinhAnhNgheSis?.[0]?.duongDan || 
        '../images/default-artist.jpg'
    );
    
    // Get status info
    const statusInfo = getStatusInfo(campaign.thoiDiem);
    const timeRemaining = calculateTimeRemaining(campaign.ngayKetThuc);
    
    // Get lowest price from tiers
    const lowestPrice = getLowestPrice(campaign);
    
    return `
        <div class="campaign-card" data-status="${statusInfo.class}" data-artist="${campaign.ngheSi?.tenNgheSi || ''}" data-category="sneaker">
            <div class="campaign-image-wrapper">
                <img src="${imageUrl}" alt="${campaign.tenChienDich}">
                <div class="campaign-badge-discount">-${discountPercent}%</div>
                <div class="campaign-badge-status ${statusInfo.class}">${statusInfo.text}</div>
            </div>
            <div class="campaign-info">
                <div class="campaign-artist">
                    <img src="${artistImageUrl}" alt="${campaign.ngheSi?.tenNgheSi || 'Artist'}">
                    <span>${campaign.ngheSi?.tenNgheSi || 'Unknown'}</span>
                </div>
                <h3>${campaign.tenChienDich}</h3>
                <p class="campaign-category">${campaign.sanPham?.tenSanPham || 'Sản phẩm'}</p>
                
                <div class="campaign-progress">
                    <div class="progress-bar-small">
                        <div class="progress-fill-small ${isMOQMet ? 'completed' : ''}" style="width: ${progressPercent}%${isMOQMet ? '; background: #81c784;' : ''}"></div>
                    </div>
                    <span class="progress-text-small" style="font-weight: 700; color: ${isMOQMet ? '#81c784' : '#ffb74d'};">
                        ${isMOQMet ? '✓ Đã đạt MOQ sản xuất' : '⏳ Đang gom số lượng đạt MOQ'}
                    </span>
                </div>

                <div class="campaign-price-info">
                    <div class="price-range">
                        ${campaign.thoiDiem === 'Đã kết thúc' 
                            ? `<span class="price-final">${formatCurrency(currentPrice)}</span>`
                            : `<span class="price-from">Từ ${formatCurrency(lowestPrice)}</span>`
                        }
                        <span class="price-original">${formatCurrency(campaign.giaGoc)}</span>
                    </div>
                </div>

                <div class="campaign-footer">
                    <div class="campaign-time ${campaign.thoiDiem === 'Đã kết thúc' ? 'empty' : ''} ${isEndingSoon(campaign.ngayKetThuc) ? 'urgent' : ''}" data-end-date="${campaign.ngayKetThuc}">
                        ${campaign.thoiDiem === 'Đã kết thúc' 
                            ? '<span>Đã kết thúc</span>'
                            : `
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span class="countdown-text">${timeRemaining}</span>
                            `
                        }
                    </div>
                    <a href="campaign-detail.html?id=${campaign.maChienDich}" class="btn-view-campaign">Xem ngay</a>
                </div>
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyFilters();
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', applyFilters);
    }
    
    // Filters
    const statusFilter = document.getElementById('statusFilter');
    const artistFilter = document.getElementById('artistFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (artistFilter) artistFilter.addEventListener('change', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
    
    // Reset button
    const resetBtn = document.querySelector('.btn-reset-filter');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const artistFilter = document.getElementById('artistFilter')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const sortFilter = document.getElementById('sortFilter')?.value || 'newest';
    
    // Filter campaigns
    filteredCampaigns = allCampaigns.filter(campaign => {
        // Search filter
        const matchesSearch = !searchTerm || 
            campaign.tenChienDich.toLowerCase().includes(searchTerm) ||
            campaign.ngheSi?.tenNgheSi.toLowerCase().includes(searchTerm) ||
            campaign.sanPham?.tenSanPham.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = !statusFilter || getStatusClass(campaign.thoiDiem, campaign.ngayKetThuc) === statusFilter;
        
        // Artist filter (by maNgheSi)
        const matchesArtist = !artistFilter || campaign.ngheSi?.maNgheSi === artistFilter;
        
        // Category filter (by maDanhMuc)
        const matchesCategory = !categoryFilter || campaign.sanPham?.maDanhMuc === categoryFilter;
        
        return matchesSearch && matchesStatus && matchesArtist && matchesCategory;
    });
    
    // Sort campaigns
    sortCampaigns(filteredCampaigns, sortFilter);
    
    // Reset to page 1 when filtering
    currentPage = 1;
    
    // Render
    renderCampaignsWithPagination();
    updateResultsCount(filteredCampaigns.length);
}

// Sort campaigns
function sortCampaigns(campaigns, sortBy) {
    switch(sortBy) {
        case 'newest':
            // Ưu tiên: Đang diễn ra (ngày bắt đầu gần nhất) → Sắp diễn ra → Đã kết thúc
            campaigns.sort((a, b) => {
                // Get status priority (lower number = higher priority)
                const getPriority = (campaign) => {
                    if (campaign.thoiDiem === 'Đang diễn ra') return 1;
                    if (campaign.thoiDiem === 'Sắp bắt đầu') return 2;
                    if (campaign.thoiDiem === 'Đã kết thúc') return 3;
                    return 4;
                };
                
                const priorityA = getPriority(a);
                const priorityB = getPriority(b);
                
                // First sort by status priority
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                
                // Within same status, sort by start date (most recent first)
                return new Date(b.ngayBatDau) - new Date(a.ngayBatDau);
            });
            break;
        case 'ending':
            campaigns.sort((a, b) => new Date(a.ngayKetThuc) - new Date(b.ngayKetThuc));
            break;
        case 'popular':
            campaigns.sort((a, b) => b.tongSoLuongHienTai - a.tongSoLuongHienTai);
            break;
        case 'price-low':
            campaigns.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
            break;
        case 'price-high':
            campaigns.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
            break;
    }
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('artistFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortFilter').value = 'newest';
    
    applyFilters();
}

// Update results count
function updateResultsCount(count) {
    const resultsInfo = document.querySelector('.results-info strong');
    if (resultsInfo) {
        resultsInfo.textContent = `${count} chiến dịch`;
    }
}

// Start all countdown timers
function startAllCountdowns() {
    const countdownElements = document.querySelectorAll('.campaign-time[data-end-date]');
    
    countdownElements.forEach(element => {
        const endDate = element.getAttribute('data-end-date');
        const textElement = element.querySelector('.countdown-text');
        
        if (!textElement) return;
        
        function update() {
            const timeRemaining = calculateTimeRemaining(endDate);
            textElement.textContent = timeRemaining;
        }
        
        update();
        setInterval(update, 60000); // Update every minute
    });
}

// Helper: Get status info
function getStatusInfo(thoiDiem) {
    switch(thoiDiem) {
        case 'Đang diễn ra':
            return { class: 'ongoing', text: 'Đang diễn ra' };
        case 'Đã kết thúc':
            return { class: 'ended', text: 'Đã kết thúc' };
        case 'Sắp bắt đầu':
            return { class: 'upcoming', text: 'Sắp bắt đầu' };
        default:
            return { class: 'ongoing', text: thoiDiem };
    }
}

// Helper: Get status class for filtering
function getStatusClass(thoiDiem, ngayKetThuc) {
    if (thoiDiem === 'Đã kết thúc') return 'ended';
    if (thoiDiem === 'Sắp bắt đầu') return 'upcoming';
    if (isEndingSoon(ngayKetThuc)) return 'ending-soon';
    return 'ongoing';
}

// Helper: Check if ending soon (less than 24 hours)
function isEndingSoon(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    const hoursRemaining = diff / (1000 * 60 * 60);
    return hoursRemaining > 0 && hoursRemaining <= 24;
}

// Helper: Calculate time remaining (short format)
function calculateTimeRemaining(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Đã kết thúc';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days} ngày ${hours} giờ`;
    } else {
        return `${hours} giờ`;
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

// Helper: Get lowest price from tiers
function getLowestPrice(campaign) {
    const bangGia = campaign.bangGiaBacThangs || [];
    
    if (bangGia.length === 0) {
        return parseFloat(campaign.giaGoc);
    }
    
    // Get the last tier (highest quantity = lowest price)
    return parseFloat(bangGia[bangGia.length - 1].donGia);
}

// Helper: Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' đ';
}

// Helper: Fix image path
function fixImagePath(path) {
    if (!path) return '../images/default.jpg';
    if (path.startsWith('../') || path.startsWith('http')) return path;
    if (path.startsWith('images/')) return '../' + path;
    return path;
}

// Helper: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
