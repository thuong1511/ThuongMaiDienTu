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
    const imageUrl = hasImages 
      ? ngheSi.hinhAnhNgheSis[0].duongDan 
      : 'images/default-artist.jpg';
    
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
    
    // Calculate discount percentage
    const giaHienTai = getCurrentPrice(chienDich);
    const discountPercent = ((chienDich.giaGoc - giaHienTai) / chienDich.giaGoc * 100).toFixed(1);
    
    // Get campaign image from HinhAnhChienDich (thuTu = 1) or fallback to product image
    const imageUrl = chienDich.hinhAnhChienDichs?.[0]?.duongDan || 
                     chienDich.sanPham?.hinhAnhSanPhams?.[0]?.duongDan || 
                     'images/default-campaign.jpg';
    
    // Calculate time remaining
    const timeRemaining = calculateTimeRemaining(chienDich.ngayKetThuc);
    const isActive = chienDich.thoiDiem === 'Đang diễn ra';
    
    const isMOQMet = chienDich.tongSoLuongHienTai >= (chienDich.nguongMOQ || 0);
    
    campaignElement.innerHTML = `
      <div class="campaign-image-wrapper">
        <img src="${imageUrl}" alt="${chienDich.tenChienDich}">
        <div class="campaign-badge-discount">-${discountPercent}%</div>
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
            <span class="price-label">Giá hiện tại:</span>
            <div class="price-value">${formatCurrency(giaHienTai)}</div>
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
    const response = await api.getActiveChienDich();
    
    if (response.success && response.data && response.data.length > 0) {
      console.log(`✅ Loaded ${response.data.length} active campaign(s)`);
      
      // Ưu tiên chiến dịch đang diễn ra có ngày bắt đầu gần với ngày hiện tại nhất
      // Sort by ngayBatDau descending (chiến dịch bắt đầu gần đây nhất sẽ hiển thị trước)
      const sortedCampaigns = response.data.sort((a, b) => {
        return new Date(b.ngayBatDau) - new Date(a.ngayBatDau);
      });
      
      console.log('📊 Campaigns sorted by start date (most recent first):');
      sortedCampaigns.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.tenChienDich} - Bắt đầu: ${c.ngayBatDau}`);
      });
      
      // Initialize hero banner slider with all active campaigns
      initHeroBannerSlider(sortedCampaigns);
      
      // Update info section with first campaign
      updateInfoPriceSection(sortedCampaigns[0]);
    } else {
      console.warn('⚠️ No active campaigns found. Fetching most recent campaign as fallback...');
      // Fallback: Fetch all campaigns to display the most recent ended campaign
      const allResponse = await api.getAllChienDich();
      if (allResponse.success && allResponse.data && allResponse.data.length > 0) {
        // Sort by ngayBatDau descending
        const sortedAll = allResponse.data.sort((a, b) => new Date(b.ngayBatDau) - new Date(a.ngayBatDau));
        const latestCampaign = sortedAll[0];
        
        console.log('📋 Displaying latest campaign as fallback:', latestCampaign.tenChienDich);
        
        // Update hero banner
        updateHeroBanner(latestCampaign);
        
        // Update info section
        updateInfoPriceSection(latestCampaign);
        
        // Update button text for ended campaigns
        const heroButton = document.querySelector('.hero-content .btn-primary');
        if (heroButton) {
          heroButton.textContent = 'XEM CHI TIẾT';
        }
      } else {
        const countdownElement = document.getElementById('countdown-banner');
        if (countdownElement) {
          countdownElement.textContent = '00 ngày : 00 giờ : 00 phút : 00 giây';
        }
        const statusRow = document.querySelectorAll('.info-left-box .info-row-compact')[1];
        if (statusRow) {
          const span = statusRow.querySelector('span');
          if (span) {
            span.textContent = 'Không có chiến dịch nào đang diễn ra';
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error loading hero campaign:', error.message);
  }
}

// Initialize hero banner slider
let currentBannerIndex = 0;
let heroBannerInterval;
let activeCampaigns = [];

function initHeroBannerSlider(campaigns) {
  if (!campaigns || campaigns.length === 0) return;
  
  // Store campaigns globally
  activeCampaigns = campaigns;
  
  // Update banner with first campaign
  updateHeroBanner(campaigns[0]);
  updateInfoPriceSection(campaigns[0]);
  
  // Update dots
  updateBannerDots(campaigns.length, 0);
  
  // Auto slide every 15 seconds if multiple campaigns
  if (campaigns.length > 1) {
    startAutoSlide();
  }
  
  // Add click handlers to dots
  setupDotClickHandlers();
  
  // Add keyboard navigation
  setupKeyboardNavigation();
}

// Start auto slide
function startAutoSlide() {
  clearInterval(heroBannerInterval);
  heroBannerInterval = setInterval(() => {
    currentBannerIndex = (currentBannerIndex + 1) % activeCampaigns.length;
    updateHeroBanner(activeCampaigns[currentBannerIndex]);
    updateBannerDots(activeCampaigns.length, currentBannerIndex);
    updateInfoPriceSection(activeCampaigns[currentBannerIndex]);
  }, 15000); // 15 seconds
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
        updateHeroBanner(activeCampaigns[currentBannerIndex]);
        updateBannerDots(activeCampaigns.length, currentBannerIndex);
        updateInfoPriceSection(activeCampaigns[currentBannerIndex]);
        
        // Reset auto slide timer
        if (activeCampaigns.length > 1) {
          startAutoSlide();
        }
      }
    }
  });
}

// Setup keyboard navigation
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    if (activeCampaigns.length <= 1) return;
    
    if (e.key === 'ArrowLeft') {
      // Previous slide
      currentBannerIndex = (currentBannerIndex - 1 + activeCampaigns.length) % activeCampaigns.length;
      updateHeroBanner(activeCampaigns[currentBannerIndex]);
      updateBannerDots(activeCampaigns.length, currentBannerIndex);
      updateInfoPriceSection(activeCampaigns[currentBannerIndex]);
      startAutoSlide();
    } else if (e.key === 'ArrowRight') {
      // Next slide
      currentBannerIndex = (currentBannerIndex + 1) % activeCampaigns.length;
      updateHeroBanner(activeCampaigns[currentBannerIndex]);
      updateBannerDots(activeCampaigns.length, currentBannerIndex);
      updateInfoPriceSection(activeCampaigns[currentBannerIndex]);
      startAutoSlide();
    }
  });
}

// Update hero banner with campaign data
function updateHeroBanner(campaign) {
  const heroSection = document.querySelector('.hero');
  const heroTitle = document.querySelector('.hero-title');
  const heroPrice = document.querySelector('.hero-price');
  const heroButton = document.querySelector('.hero-content .btn-primary');
  
  // Get banner image (first image from HinhAnhChienDich)
  const bannerImage = campaign.hinhAnhChienDichs && campaign.hinhAnhChienDichs.length > 0
    ? campaign.hinhAnhChienDichs[0].duongDan
    : 'images/banner.jpg';
  
  // Update background image with contain to show full image without cropping
  if (heroSection) {
    heroSection.style.backgroundImage = `linear-gradient(rgba(95, 7, 4, 0.3), rgba(95, 7, 4, 0.3)), url('${bannerImage}')`;
    heroSection.style.backgroundSize = 'contain';
    heroSection.style.backgroundPosition = 'center';
    heroSection.style.backgroundRepeat = 'no-repeat';
    heroSection.style.backgroundColor = '#1a1a1a';
  }
  
  // Update title
  if (heroTitle) {
    heroTitle.textContent = campaign.tenChienDich;
  }
  
  // Update price
  if (heroPrice) {
    heroPrice.textContent = `Chỉ với ${formatCurrency(campaign.phiThamGia)}`;
  }
  
  // Update button link
  if (heroButton) {
    heroButton.onclick = () => {
      window.location.href = `pages/campaign-detail.html?id=${campaign.maChienDich}`;
    };
  }
}

// Update banner dots
function updateBannerDots(totalDots, activeIndex) {
  const dotsContainer = document.querySelector('.slider-dots');
  if (!dotsContainer) return;
  
  // Clear existing dots
  dotsContainer.innerHTML = '';
  
  // Create dots
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
  updateHeroBanner(campaign);
}

// Update info-price section with active campaign
function updateInfoPriceSection(campaign) {
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
