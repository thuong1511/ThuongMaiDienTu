// Index page specific JavaScript
document.addEventListener('DOMContentLoaded', async function() {
  console.log('========================================');
  console.log('🚀 DOMContentLoaded event fired!');
  console.log('========================================');
  
  try {
    // Load nghệ sĩ data
    console.log('Step 1: Loading nghệ sĩ data...');
    await loadNgheSiData();
    console.log('✅ Step 1 complete');
    
    // Load chiến dịch data
    console.log('Step 2: Loading chiến dịch data...');
    await loadChienDichData();
    console.log('✅ Step 2 complete');
    
    // Load active campaign for hero section
    console.log('Step 3: Loading active campaign for hero section...');
    await loadHeroCampaign();
    console.log('✅ Step 3 complete');
    
    // Load recent reviews for homepage
    console.log('Step 4: Loading recent reviews...');
    await loadRecentReviews();
    console.log('✅ Step 4 complete');
    
    console.log('========================================');
    console.log('✅ All page data loaded successfully!');
    console.log('========================================');
  } catch (error) {
    console.error('❌ Error loading page data:', error);
    console.error('Error stack:', error.stack);
  }
});

// Load nghệ sĩ data for artists section
async function loadNgheSiData() {
  try {
    console.log('Loading ngheSi data...');
    const response = await api.getAllNgheSi();
    console.log('NgheSi API response:', response);
    
    if (response.success) {
      console.log(`Rendering ${response.data.length} nghệ sĩ`);
      renderNgheSiList(response.data);
    } else {
      console.error('API returned success=false:', response.message);
    }
  } catch (error) {
    console.error('Error loading ngheSi data:', error);
    // Fallback to existing static data if API fails
  }
}

// Render nghệ sĩ list
function renderNgheSiList(ngheSiList) {
  console.log('=== renderNgheSiList called ===');
  console.log('ngheSiList:', ngheSiList);
  
  const artistsContainer = document.querySelector('.artists-list');
  console.log('artistsContainer found:', !!artistsContainer);
  
  if (!artistsContainer) {
    console.error('❌ Artists container not found!');
    return;
  }
  
  // Only clear if we have data to show
  if (!ngheSiList || ngheSiList.length === 0) {
    console.warn('⚠️ No ngheSi data to render');
    return;
  }
  
  console.log(`📝 Clearing container and rendering ${ngheSiList.length} artists...`);
  artistsContainer.innerHTML = '';
  
  ngheSiList.forEach((ngheSi, index) => {
    console.log(`\n--- Artist ${index + 1} ---`);
    console.log('Full ngheSi object:', ngheSi);
    console.log('tenNgheSi:', ngheSi.tenNgheSi);
    console.log('hinhAnhNgheSis:', ngheSi.hinhAnhNgheSis);
    
    const artistElement = document.createElement('div');
    artistElement.className = 'artist';
    
    // Get first image or use default - MUST match artists.js format
    const hasImages = ngheSi.hinhAnhNgheSis && ngheSi.hinhAnhNgheSis.length > 0;
    const imageUrl = fixImagePath(hasImages 
      ? ngheSi.hinhAnhNgheSis[0].duongDan 
      : 'images/default-artist.jpg');
    
    console.log(`✅ Nghệ sĩ: ${ngheSi.tenNgheSi}`);
    console.log(`   hasImages: ${hasImages}`);
    console.log(`   imageUrl: ${imageUrl}`);
    
    artistElement.innerHTML = `
      <img src="${imageUrl}" alt="${ngheSi.tenNgheSi}">
      <p>${ngheSi.tenNgheSi}</p>
    `;
    
    artistsContainer.appendChild(artistElement);
    
    console.log(`   ✓ Added to container`);
  });
  
  console.log(`\n✅ Rendered ${ngheSiList.length} nghệ sĩ successfully`);
  console.log('Final artistsContainer.children.length:', artistsContainer.children.length);
  
  // Trigger artist slider re-initialization
  if (window.initArtistSlider) {
    console.log('🔄 Re-initializing artist slider...');
    window.initArtistSlider();
  } else {
    console.warn('⚠️ window.initArtistSlider not found');
  }
  
  console.log('=== renderNgheSiList complete ===\n');
}

// Load chiến dịch data for campaigns section
async function loadChienDichData() {
  try {
    const response = await api.getAllChienDich();
    if (response.success) {
      // Lọc chỉ lấy các chiến dịch đang diễn ra
      const activeCampaigns = response.data.filter(cd => cd.thoiDiem === 'Đang diễn ra');
      
      // Sắp xếp theo ngày bắt đầu giảm dần (gần nhất trước)
      const sortedCampaigns = activeCampaigns.sort((a, b) => {
        return new Date(b.ngayBatDau) - new Date(a.ngayBatDau);
      });
      
      console.log('📊 Active campaigns sorted by start date (most recent first):');
      sortedCampaigns.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.tenChienDich} - Bắt đầu: ${c.ngayBatDau}`);
      });
      
      // Hiển thị 2 chiến dịch đầu tiên
      renderChienDichList(sortedCampaigns.slice(0, 2));
    }
  } catch (error) {
    console.error('Error loading chiến dịch data:', error);
    // Fallback to existing static data if API fails
  }
}

// Render chiến dịch list
function renderChienDichList(chienDichList) {
  const campaignsContainer = document.querySelector('.campaign-grid');
  if (!campaignsContainer) return;
  
  campaignsContainer.innerHTML = '';
  
  chienDichList.forEach((chienDich, index) => {
    const campaignElement = document.createElement('div');
    campaignElement.className = 'campaign-card';
    
    // Get lowest price from tier table (highest tier = best price)
    const bangGia = chienDich.bangGiaBacThangs || [];
    const giaThapNhat = bangGia.length > 0 
      ? parseFloat(bangGia[bangGia.length - 1].donGia) 
      : parseFloat(chienDich.giaGoc);
    
    // Calculate discount percentage based on lowest possible price
    const discountPercent = ((chienDich.giaGoc - giaThapNhat) / chienDich.giaGoc * 100).toFixed(1);
    
    const imageUrl = fixImagePath(window.getCampaignCoverImage?.(chienDich) || 
                     chienDich.hinhAnhChienDichs?.[0]?.duongDan || 
                     chienDich.sanPham?.hinhAnhSanPhams?.[0]?.duongDan || 
                     'images/default-campaign.jpg');
    
    // Calculate time remaining
    const timeRemaining = calculateTimeRemaining(chienDich.ngayKetThuc);
    const isActive = chienDich.thoiDiem === 'Đang diễn ra';
    
    const isMOQMet = chienDich.tongSoLuongHienTai >= (chienDich.nguongMOQ || 0);
    
    campaignElement.innerHTML = `
      <div class="campaign-image-wrapper">
        <img src="${imageUrl}" alt="${chienDich.tenChienDich}">
      </div>
      <div class="campaign-info">
        <div class="campaign-header-block">
          <h3>${chienDich.tenChienDich}</h3>
        </div>
        <div class="campaign-middle-block">
          <div class="campaign-details-left">
            <p class="campaign-status">Trạng thái: <span class="status-${getStatusClass(chienDich.thoiDiem)}">${chienDich.thoiDiem}</span></p>
            <p class="campaign-participants" style="font-weight: 700; color: ${isMOQMet ? '#81c784' : '#ffb74d'}; font-size: 14px;">
              ${isMOQMet ? '✓ Đã vượt MOQ sản xuất' : '⏳ Đang gom số lượng đạt MOQ'}
            </p>
          </div>
          <div class="campaign-price-right">
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
              <div style="text-decoration: line-through; color: #999; font-size: 13px;">
                ${formatCurrency(chienDich.giaGoc)}
              </div>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span class="price-label" style="font-size: 14px; color: #ffffff;">Giá tốt nhất:</span>
                <div class="price-value" style="color: #b27933; font-weight: 700; font-size: 18px;">${formatCurrency(giaThapNhat)}</div>
              </div>
              <div style="font-size: 12px; color: #81c784; font-weight: 600;">
                Giảm lên đến ${discountPercent}%
              </div>
            </div>
          </div>
        </div>
        <div class="campaign-actions">
          <div class="campaign-time ${!isActive ? 'empty' : ''}" data-campaign-id="${chienDich.maChienDich}">
            ${isActive ? `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="countdown-timer" data-end-date="${chienDich.ngayKetThuc}">${timeRemaining}</span>
            ` : ''}
          </div>
          <button class="btn-view" onclick="window.location.href='pages/campaign-detail.html?id=${chienDich.maChienDich}'">Xem ngay</button>
        </div>
      </div>
    `;
    
    campaignsContainer.appendChild(campaignElement);
  });
  
  // Start countdown timers for active campaigns
  startCampaignCountdowns();
}

// Load active campaign for hero section
async function loadHeroCampaign() {
  try {
    console.log('Step 3: Loading banners and campaigns for hero section...');
    const bannerResponse = await api.getActiveBanners();
    const campaignResponse = await api.getAllChienDich();
    
    if (bannerResponse.success && bannerResponse.data && bannerResponse.data.length > 0) {
      const banners = bannerResponse.data;
      const campaigns = campaignResponse.success ? campaignResponse.data : [];
      
      console.log(`✅ Loaded ${banners.length} active banner(s)`);
      initHeroBannerSlider(banners, campaigns);
    } else {
      console.warn('⚠️ No active banners found.');
      const countdownElement = document.getElementById('countdown-banner');
      if (countdownElement) {
        countdownElement.textContent = '00 ngày : 00 giờ : 00 phút : 00 giây';
      }
    }
  } catch (error) {
    console.error('❌ Error loading hero campaign:', error.message);
  }
}

// Find campaign associated with a banner
function findCampaignForBanner(banner, campaigns) {
  if (!campaigns || campaigns.length === 0) return null;
  const path = (banner.duongDan || '').toLowerCase();
  const title = (banner.tieuDe || '').toLowerCase();
  
  const artistKeywords = [
    { id: 'NS001', keywords: ['rose', 'rosé'] },
    { id: 'NS002', keywords: ['lisa'] },
    { id: 'NS003', keywords: ['jisoo'] },
    { id: 'NS004', keywords: ['jennie', 'jen'] },
    { id: 'NS005', keywords: ['jichangwook', 'ji chang wook'] },
    { id: 'NS006', keywords: ['parkbogum', 'park bo gum'] },
    { id: 'NS007', keywords: ['goyounjung', 'go youn jung'] },
    { id: 'NS008', keywords: ['kimjiwon', 'kim ji won'] },
    { id: 'NS009', keywords: ['namtan'] },
    { id: 'NS010', keywords: ['sieun'] },
    { id: 'NS011', keywords: ['chuongnhuocnam', 'chương nhược nam'] },
    { id: 'NS012', keywords: ['martin', 'cortis'] }
  ];
  
  for (const artist of artistKeywords) {
    if (artist.keywords.some(kw => path.includes(kw) || title.includes(kw))) {
      return campaigns.find(c => c.maNgheSi === artist.id);
    }
  }
  return null;
}

// Initialize hero banner slider
let currentBannerIndex = 0;
let heroBannerInterval;
let activeBanners = [];
let allCampaigns = [];

function initHeroBannerSlider(banners, campaigns) {
  if (!banners || banners.length === 0) return;
  
  activeBanners = banners;
  allCampaigns = campaigns;
  
  const initialCampaign = findCampaignForBanner(banners[0], campaigns);
  updateHeroBanner(banners[0], initialCampaign);
  updateInfoPriceSection(initialCampaign);
  updateBannerDots(banners.length, 0);
  
  if (banners.length > 1) {
    startAutoSlide();
  }
  
  setupDotClickHandlers();
  setupKeyboardNavigation();
}

// Start auto slide
function startAutoSlide() {
  clearInterval(heroBannerInterval);
  heroBannerInterval = setInterval(() => {
    currentBannerIndex = (currentBannerIndex + 1) % activeBanners.length;
    const banner = activeBanners[currentBannerIndex];
    const campaign = findCampaignForBanner(banner, allCampaigns);
    updateHeroBanner(banner, campaign);
    updateBannerDots(activeBanners.length, currentBannerIndex);
    updateInfoPriceSection(campaign);
  }, 15000);
}

// Setup dot click handlers
function setupDotClickHandlers() {
  const dotsContainer = document.querySelector('.slider-dots');
  if (!dotsContainer) return;
  
  dotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('dot')) {
      const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
      const index = dots.indexOf(e.target);
      
      if (index !== -1) {
        currentBannerIndex = index;
        const banner = activeBanners[currentBannerIndex];
        const campaign = findCampaignForBanner(banner, allCampaigns);
        updateHeroBanner(banner, campaign);
        updateBannerDots(activeBanners.length, currentBannerIndex);
        updateInfoPriceSection(campaign);
        
        if (activeBanners.length > 1) {
          startAutoSlide();
        }
      }
    }
  });
}

// Setup keyboard navigation
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    if (activeBanners.length <= 1) return;
    
    if (e.key === 'ArrowLeft') {
      currentBannerIndex = (currentBannerIndex - 1 + activeBanners.length) % activeBanners.length;
      const banner = activeBanners[currentBannerIndex];
      const campaign = findCampaignForBanner(banner, allCampaigns);
      updateHeroBanner(banner, campaign);
      updateBannerDots(activeBanners.length, currentBannerIndex);
      updateInfoPriceSection(campaign);
      startAutoSlide();
    } else if (e.key === 'ArrowRight') {
      currentBannerIndex = (currentBannerIndex + 1) % activeBanners.length;
      const banner = activeBanners[currentBannerIndex];
      const campaign = findCampaignForBanner(banner, allCampaigns);
      updateHeroBanner(banner, campaign);
      updateBannerDots(activeBanners.length, currentBannerIndex);
      updateInfoPriceSection(campaign);
      startAutoSlide();
    }
  });
}

// Update hero banner with campaign data
function updateHeroBanner(banner, campaign) {
  const heroSection = document.querySelector('.hero');
  const heroImg = document.getElementById('hero-banner-img');
  const bannerImage = fixImagePath(banner.duongDan || 'images/banner.png');
  
  if (heroImg) {
    heroImg.src = bannerImage;
  }
  
  if (heroSection) {
    // Make the entire banner clickable
    heroSection.onclick = () => {
      if (campaign) {
        window.location.href = `pages/campaign-detail.html?id=${campaign.maChienDich}`;
      } else {
        window.location.href = 'pages/campaigns.html';
      }
    };
  }
}

// Update banner dots
function updateBannerDots(totalDots, activeIndex) {
  const dotsContainer = document.querySelector('.slider-dots');
  if (!dotsContainer) return;
  
  dotsContainer.innerHTML = '';
  
  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    if (i === activeIndex) {
      dot.classList.add('active');
    }
    dotsContainer.appendChild(dot);
  }
}

// Update hero section with active campaign (legacy function - kept for compatibility)
function updateHeroSection(campaign) {
  // Legacy support
}

// Update info-price section with active campaign
function updateInfoPriceSection(campaign) {
  const infoPriceSection = document.querySelector('.info-price-combined');
  if (!campaign) {
    if (infoPriceSection) infoPriceSection.style.display = 'none';
    return;
  }
  if (infoPriceSection) infoPriceSection.style.display = 'block';

  // Update countdown - MUST be called first
  if (campaign.thoiDiem === 'Đã kết thúc') {
    updateCountdown(new Date(0));
  } else if (campaign.ngayKetThuc) {
    updateCountdown(campaign.ngayKetThuc);
  } else {
    console.error('❌ Campaign has no ngayKetThuc!');
  }
  
  const currentQty = campaign.tongSoLuongHienTai || 0;
  const moq = campaign.nguongMOQ || 0;
  const isMOQMet = currentQty >= moq;

  // Calculate lowest price and discount
  const bangGia = campaign.bangGiaBacThangs || [];
  const giaThapNhat = bangGia.length > 0 
    ? parseFloat(bangGia[bangGia.length - 1].donGia) 
    : parseFloat(campaign.giaGoc);
  const discountPercent = ((campaign.giaGoc - giaThapNhat) / campaign.giaGoc * 100).toFixed(1);

  // Update MOQ status row (second row in info bar)
  const infoRows = document.querySelectorAll('.info-left-box .info-row-compact');
  if (infoRows.length >= 2) {
    const statusRow = infoRows[1];
    const span = statusRow.querySelector('span');
    if (span) {
      if (isMOQMet) {
        statusRow.classList.add('moq-met');
        statusRow.classList.remove('moq-pending');
        span.innerHTML = `<strong>✓ Đã vượt MOQ (Chiến dịch chắc chắn sản xuất)</strong>`;
      } else {
        statusRow.classList.add('moq-pending');
        statusRow.classList.remove('moq-met');
        span.innerHTML = `<strong>⏳ Đang gom số lượng đạt MOQ sản xuất (${moq} sp)</strong>`;
      }
    }
  }

  // Add or update price info row (after status row)
  let priceInfoRow = document.querySelector('.info-row-compact.price-info');
  console.log('🔍 Price info row exists:', !!priceInfoRow);
  
  if (!priceInfoRow) {
    // Create new row if it doesn't exist
    console.log('📝 Creating new price info row...');
    priceInfoRow = document.createElement('div');
    priceInfoRow.className = 'info-row-compact price-info';
    priceInfoRow.style.display = 'flex';
    priceInfoRow.style.flexDirection = 'column';
    priceInfoRow.style.gap = '8px';
    priceInfoRow.style.alignItems = 'flex-start';
    
    // Insert after status row
    const infoLeftBox = document.querySelector('.info-left-box');
    console.log('📦 infoLeftBox found:', !!infoLeftBox);
    console.log('📊 infoRows.length:', infoRows.length);
    
    if (infoLeftBox && infoRows.length >= 2) {
      infoRows[1].after(priceInfoRow);
      console.log('✅ Price info row inserted after status row');
    } else {
      console.error('❌ Could not insert price info row');
    }
  }
  
  // Update price info content
  console.log('📝 Updating price info content...');
  console.log('  Giá thấp nhất:', giaThapNhat);
  console.log('  Discount:', discountPercent + '%');
  
  priceInfoRow.innerHTML = `
    <div style="display: flex; align-items: baseline; gap: 8px;">
      <span style="font-size: 14px; color: #ffffff;">Giá tốt nhất:</span>
      <strong style="color: #b27933; font-size: 16px;">${formatCurrency(giaThapNhat)}</strong>
    </div>
    <div style="font-size: 12px; color: #81c784; font-weight: 600;">
      Giảm lên đến ${discountPercent}%
    </div>
  `;
  
  console.log('✅ Price info row updated successfully');

  // Update progress bar
  updateProgressBar(campaign);
  
  // Hide participants row to prevent leaking numbers
  if (infoRows.length >= 3) {
    infoRows[2].style.display = 'none';
  }
  
  // Update price table
  updatePriceTable(campaign);
}

// Update progress bar with accurate tier divisions
function updateProgressBar(campaign) {
  const progressContainer = document.querySelector('.progress-container-compact');
  if (progressContainer) {
    progressContainer.style.display = 'none';
  }
}

// Update price table
function updatePriceTable(campaign) {
  const priceHeader = document.querySelector('.header-col1');
  if (priceHeader) {
    priceHeader.textContent = `GIÁ GỐC: ${formatCurrency(campaign.giaGoc)}`;
  }
  
  const priceRows = document.querySelectorAll('.price-data-row');
  const bangGia = campaign.bangGiaBacThangs || [];
  
  bangGia.forEach((gia, index) => {
    if (priceRows[index]) {
      const col1 = priceRows[index].querySelector('.col1');
      const col2 = priceRows[index].querySelector('.col2');
      
      if (col1) col1.textContent = `${gia.soLuongToiThieu} - ${gia.soLuongToiDa}:`;
      if (col2) col2.textContent = formatCurrency(gia.donGia);
    }
  });
}

// Helper: Get current price based on quantity
function getCurrentPrice(chienDich) {
  const bangGia = chienDich.bangGiaBacThangs || [];
  const soLuong = chienDich.tongSoLuongHienTai;
  
  for (let i = bangGia.length - 1; i >= 0; i--) {
    if (soLuong >= bangGia[i].soLuongToiThieu) {
      return parseFloat(bangGia[i].donGia);
    }
  }
  
  return parseFloat(chienDich.giaGoc);
}

// Helper: Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' đ';
}

// Helper: Calculate time remaining with minutes and seconds
function calculateTimeRemaining(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  
  if (diff <= 0) return '00 ngày : 00 giờ : 00 phút : 00 giây';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${days.toString().padStart(2, '0')} ngày : ${hours.toString().padStart(2, '0')} giờ : ${minutes.toString().padStart(2, '0')} phút : ${seconds.toString().padStart(2, '0')} giây`;
}

// Start countdown timers for campaign cards
function startCampaignCountdowns() {
  const countdownTimers = document.querySelectorAll('.countdown-timer');
  
  countdownTimers.forEach(timer => {
    const endDate = timer.getAttribute('data-end-date');
    
    function updateTimer() {
      const timeRemaining = calculateTimeRemaining(endDate);
      timer.textContent = timeRemaining;
      
      if (timeRemaining === 'Đã kết thúc') {
        // Stop updating when campaign ends
        return;
      }
    }
    
    // Update immediately
    updateTimer();
    
    // Update every second
    setInterval(updateTimer, 1000);
  });
}

// Helper: Update countdown timer
let countdownInterval = null;

function updateCountdown(endDate) {
    console.log('✅ Countdown initialized for:', endDate);
    
    function update() {
        const countdownElement = document.getElementById('countdown-banner');
        if (!countdownElement) return;
        
        const timeRemaining = calculateTimeRemaining(endDate);
        countdownElement.textContent = timeRemaining;
        
        // If the countdown timer hits 0 on the banner, update the status in the info bar to "Đã kết thúc"
        if (timeRemaining === '00 ngày : 00 giờ : 00 phút : 00 giây') {
            const infoRows = document.querySelectorAll('.info-left-box .info-row-compact');
            if (infoRows.length >= 2) {
                const statusRow = infoRows[1];
                const span = statusRow.querySelector('span');
                if (span && !span.textContent.includes('Đã kết thúc')) {
                    statusRow.classList.remove('moq-pending');
                    statusRow.classList.add('moq-met');
                    span.innerHTML = `<strong>Đã kết thúc</strong>`;
                }
            }
        }
    }

    // Update ngay lập tức
    update();
    
    // Xóa interval cũ nếu có
    if (window.heroCountdownInterval) {
        clearInterval(window.heroCountdownInterval);
    }
    
    // Update mỗi giây
    window.heroCountdownInterval = setInterval(update, 1000);
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


// Artist Slider Functionality
let artistSliderPosition = 0;
const artistsPerView = 6;

function initArtistSlider() {
  console.log('=== initArtistSlider called ===');
  
  const prevBtn = document.querySelector('.artists .slider-btn.prev');
  const nextBtn = document.querySelector('.artists .slider-btn.next');
  const artistsList = document.querySelector('.artists-list');
  
  console.log('prevBtn found:', !!prevBtn);
  console.log('nextBtn found:', !!nextBtn);
  console.log('artistsList found:', !!artistsList);
  
  if (!prevBtn || !nextBtn || !artistsList) {
    console.warn('⚠️ Artist slider elements not found');
    return;
  }
  
  const artists = artistsList.querySelectorAll('.artist');
  console.log(`Found ${artists.length} artist elements`);
  
  if (artists.length === 0) {
    console.warn('⚠️ No artist elements found in artistsList');
    return;
  }
  
  // Remove old event listeners by cloning
  const newPrevBtn = prevBtn.cloneNode(true);
  const newNextBtn = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
  nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
  
  console.log('✅ Buttons cloned and replaced');
  
  // Add new event listeners
  newPrevBtn.addEventListener('click', () => {
    console.log('⬅️ Prev button clicked');
    const artists = artistsList.querySelectorAll('.artist');
    const maxPosition = Math.max(0, Math.ceil(artists.length / artistsPerView) - 1);
    
    console.log(`Current position: ${artistSliderPosition}, Max position: ${maxPosition}`);
    
    // Loop back to end if at start
    if (artistSliderPosition > 0) {
      artistSliderPosition--;
    } else {
      artistSliderPosition = maxPosition;
    }
    
    console.log(`Moving to position: ${artistSliderPosition}`);
    updateArtistSliderPosition();
  });
  
  newNextBtn.addEventListener('click', () => {
    console.log('➡️ Next button clicked');
    const artists = artistsList.querySelectorAll('.artist');
    const maxPosition = Math.max(0, Math.ceil(artists.length / artistsPerView) - 1);
    
    console.log(`Current position: ${artistSliderPosition}, Max position: ${maxPosition}`);
    
    // Loop back to start if at end
    if (artistSliderPosition < maxPosition) {
      artistSliderPosition++;
    } else {
      artistSliderPosition = 0;
    }
    
    console.log(`Moving to position: ${artistSliderPosition}`);
    updateArtistSliderPosition();
  });
  
  console.log('✅ Event listeners added');
  
  // Initialize position - show first 6 artists
  updateArtistSliderPosition();
  
  console.log('=== initArtistSlider complete ===\n');
}

function updateArtistSliderPosition() {
  console.log('=== updateArtistSliderPosition called ===');
  
  const artistsList = document.querySelector('.artists-list');
  if (!artistsList) {
    console.error('❌ artistsList not found');
    return;
  }
  
  const artists = artistsList.querySelectorAll('.artist');
  console.log(`Artists count: ${artists.length}`);
  
  if (artists.length === 0) {
    console.warn('⚠️ No artists to position');
    return;
  }
  
  // Hide all artists first
  artists.forEach(artist => {
    artist.style.display = 'none';
    artist.classList.remove('show');
  });
  
  // Show only the artists for current position
  const startIndex = artistSliderPosition * artistsPerView;
  const endIndex = Math.min(startIndex + artistsPerView, artists.length);
  
  console.log(`Showing artists from index ${startIndex} to ${endIndex - 1}`);
  
  for (let i = startIndex; i < endIndex; i++) {
    artists[i].style.display = 'flex';
    // Add show class with delay for animation
    setTimeout(() => {
      artists[i].classList.add('show');
    }, (i - startIndex) * 50);
  }
  
  console.log('✅ Artists visibility updated');
  console.log('=== updateArtistSliderPosition complete ===\n');
}

// Initialize slider on page load
window.initArtistSlider = initArtistSlider;

// Call it after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArtistSlider);
} else {
  initArtistSlider();
}

// ============================================
// REVIEW LOADING FUNCTIONALITY
// ============================================

// Load recent reviews from database
async function loadRecentReviews() {
  try {
    console.log('Loading recent reviews...');
    const response = await api.getAllDanhGia();
    
    console.log('Reviews API response:', response);
    
    if (response.success && response.data && response.data.length > 0) {
      // Limit to 6 most recent reviews for homepage
      const recentReviews = response.data.slice(0, 6);
      console.log(`Rendering ${recentReviews.length} recent reviews`);
      renderRecentReviews(recentReviews);
    } else {
      console.warn('⚠️ No reviews found or API returned error');
      // Keep existing static reviews as fallback
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
    // Keep existing static reviews as fallback
  }
}

// Render recent reviews
function renderRecentReviews(reviews) {
  const reviewsContainer = document.querySelector('.bidding-grid');
  if (!reviewsContainer) {
    console.error('❌ Reviews container (.bidding-grid) not found');
    return;
  }
  
  // Clear existing content
  reviewsContainer.innerHTML = '';
  
  reviews.forEach(review => {
    const reviewCard = createReviewCard(review);
    reviewsContainer.appendChild(reviewCard);
  });
  
  console.log(`✅ Rendered ${reviews.length} reviews successfully`);
  
  // Re-initialize review slider
  initReviewSlider();
}

// Create a single review card element
function createReviewCard(review) {
  const card = document.createElement('div');
  card.className = 'bidding-card';
  
  // Get campaign name
  const campaignName = review.campaignName || review.donHang?.dangKyChienDich?.chienDich?.tenChienDich || 'Chiến dịch';
  
  // Get reviewer name (handle anonymous reviews)
  let reviewerName = 'Khách hàng';
  if (review.name) {
    reviewerName = review.name;
  } else if (review.anDanh === 1) {
    reviewerName = 'Người dùng ẩn danh';
  } else if (review.donHang?.dangKyChienDich?.nguoiDung?.tenDangNhap) {
    reviewerName = review.donHang.dangKyChienDich.nguoiDung.tenDangNhap;
  }
  
  // Generate star rating HTML
  const starsHTML = generateStarsHTML(review.rating || review.diemDanhGia || 0);
  
  // Format date
  const reviewDate = review.createdAt || (review.ngayDanhGia 
    ? new Date(review.ngayDanhGia).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '');
  
  // Get review images (limit to 2 for display)
  const images = review.images || review.hinhAnhDanhGias || [];
  let imagesHTML = '';
  if (images.length > 0) {
    imagesHTML = '<div class="bidding-images">';
    images.slice(0, 2).forEach(img => {
      let imagePath = typeof img === 'string' ? img : (img.duongDan || '');
      
      // Convert backend path to frontend path
      if (imagePath.startsWith('uploads/')) {
        imagePath = `http://localhost:8080/${imagePath}`;
      } else if (!imagePath.startsWith('http') && !imagePath.startsWith('../')) {
        imagePath = `../${imagePath}`;
      }
      
      imagesHTML += `<img src="${imagePath}" alt="Review image">`;
    });
    imagesHTML += '</div>';
  }
  
  // Get product info
  const productName = review.productName || review.donHang?.phieuChiTietDangKys?.[0]?.sanPhamKichThuocMauSac?.sanPham?.tenSanPham || 'Sản phẩm';
  const productPrice = review.productPrice !== undefined ? review.productPrice : (review.donHang?.tongTien || 0);
  const quantity = review.quantity || review.donHang?.phieuChiTietDangKys?.reduce((sum, item) => sum + (item.soLuong || 0), 0) || 1;
  
  card.innerHTML = `
    <h3>Chiến dịch ${campaignName}</h3>
    <p class="bidding-time">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: #999;">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
      Người tham gia: <strong>${reviewerName}</strong>
    </p>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="display: flex; gap: 3px;">
          ${starsHTML}
        </div>
        <span style="color: #FFD700; font-size: 20px; font-weight: 700;">${(review.rating || review.diemDanhGia || 0).toFixed(1)}</span>
      </div>
      <span style="color: #999; font-size: 13px;">${reviewDate}</span>
    </div>
    <p class="bidding-desc">${review.binhLuan || ''}</p>
    ${imagesHTML}
    <p class="bidding-price">Đã mua: <strong>${productName} - ${formatCurrency(productPrice)}</strong></p>
    <p class="bidding-votes">Số lượng: <strong>${quantity} ${quantity > 1 ? 'sản phẩm' : 'sản phẩm'}</strong></p>
  `;
  
  return card;
}

// Generate star rating HTML
function generateStarsHTML(rating) {
  let starsHTML = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `;
  }
  
  // Half star
  if (hasHalfStar) {
    starsHTML += `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `;
  }
  
  // Empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `;
  }
  
  return starsHTML;
}

// ============================================
// REVIEW SLIDER FUNCTIONALITY
// ============================================

// Review Slider Functionality
let reviewSliderPosition = 0;
const reviewsPerView = 2;

function initReviewSlider() {
  console.log('=== initReviewSlider called ===');
  
  const prevBtn = document.querySelector('.bidding .review-btn.prev-review');
  const nextBtn = document.querySelector('.bidding .review-btn.next-review');
  const reviewCards = document.querySelectorAll('.bidding-card');
  
  console.log('prevBtn found:', !!prevBtn);
  console.log('nextBtn found:', !!nextBtn);
  console.log(`Found ${reviewCards.length} review cards`);
  
  if (!prevBtn || !nextBtn || reviewCards.length === 0) {
    console.warn('⚠️ Review slider elements not found');
    return;
  }
  
  // Remove old event listeners by cloning
  const newPrevBtn = prevBtn.cloneNode(true);
  const newNextBtn = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
  nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
  
  console.log('✅ Review buttons cloned and replaced');
  
  // Add new event listeners
  newPrevBtn.addEventListener('click', () => {
    console.log('⬅️ Review Prev button clicked');
    const maxPosition = Math.max(0, Math.ceil(reviewCards.length / reviewsPerView) - 1);
    
    console.log(`Current position: ${reviewSliderPosition}, Max position: ${maxPosition}`);
    
    // Loop back to end if at start
    if (reviewSliderPosition > 0) {
      reviewSliderPosition--;
    } else {
      reviewSliderPosition = maxPosition;
    }
    
    console.log(`Moving to position: ${reviewSliderPosition}`);
    updateReviewSliderPosition();
  });
  
  newNextBtn.addEventListener('click', () => {
    console.log('➡️ Review Next button clicked');
    const maxPosition = Math.max(0, Math.ceil(reviewCards.length / reviewsPerView) - 1);
    
    console.log(`Current position: ${reviewSliderPosition}, Max position: ${maxPosition}`);
    
    // Loop back to start if at end
    if (reviewSliderPosition < maxPosition) {
      reviewSliderPosition++;
    } else {
      reviewSliderPosition = 0;
    }
    
    console.log(`Moving to position: ${reviewSliderPosition}`);
    updateReviewSliderPosition();
  });
  
  console.log('✅ Review event listeners added');
  
  // Initialize position - show first 2 reviews
  updateReviewSliderPosition();
  
  console.log('=== initReviewSlider complete ===\n');
}

function updateReviewSliderPosition() {
  console.log('=== updateReviewSliderPosition called ===');
  
  const reviewCards = document.querySelectorAll('.bidding-card');
  console.log(`Review cards count: ${reviewCards.length}`);
  
  if (reviewCards.length === 0) {
    console.warn('⚠️ No review cards to position');
    return;
  }
  
  // Hide all cards first
  reviewCards.forEach(card => {
    card.classList.remove('show');
  });
  
  // Show only the cards for current position
  const startIndex = reviewSliderPosition * reviewsPerView;
  const endIndex = Math.min(startIndex + reviewsPerView, reviewCards.length);
  
  console.log(`Showing cards from index ${startIndex} to ${endIndex - 1}`);
  
  for (let i = startIndex; i < endIndex; i++) {
    reviewCards[i].classList.add('show');
  }
  
  console.log('✅ Review cards updated');
  console.log('=== updateReviewSliderPosition complete ===\n');
}

// Initialize review slider on page load
window.initReviewSlider = initReviewSlider;

// Call it after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReviewSlider);
} else {
  initReviewSlider();
}

// Helper: Fix image path
function fixImagePath(path) {
  if (!path) return 'images/default-campaign.jpg';
  if (path.startsWith('http')) {
    return path;
  }
  if (path.startsWith('uploads/') || path.startsWith('/uploads/')) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `http://localhost:8080/${cleanPath}`;
  }
  if (path.startsWith('../')) {
    return path.replace(/^\.\.\//, '');
  }
  return path;
}
