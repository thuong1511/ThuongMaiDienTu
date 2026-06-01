// Progress Bar Animation with Current Position
function animateMainProgressBar() {
    const progressBar = document.getElementById('mainProgress');
    const currentMarker = document.getElementById('currentMarker');
    
    if (!progressBar || !currentMarker) return;
    
    const current = parseInt(progressBar.getAttribute('data-current'));
    const max = parseInt(progressBar.getAttribute('data-max'));
    const percentage = (current / max) * 100;
    
    setTimeout(() => {
        progressBar.style.width = percentage + '%';
        currentMarker.style.left = percentage + '%';
    }, 500);
    
    // Animate the number
    const valueElement = currentMarker.querySelector('.current-value');
    let count = 0;
    const increment = current / 100;
    
    const counter = setInterval(() => {
        count += increment;
        if (count >= current) {
            valueElement.textContent = current;
            clearInterval(counter);
        } else {
            valueElement.textContent = Math.floor(count);
        }
    }, 20);
}

// Real-time Countdown Timer - DISABLED (sử dụng countdown từ index.js thay thế)
/*
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    const countdownFullElement = document.getElementById('countdown-full');
    
    if (!countdownElement && !countdownFullElement) return;
    
    // Set end date (3 days, 14 hours from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    endDate.setHours(endDate.getHours() + 14);
    endDate.setMinutes(endDate.getMinutes() + 24);
    endDate.setSeconds(endDate.getSeconds() + 55);
    
    function update() {
        const now = new Date();
        const diff = endDate - now;
        
        if (diff <= 0) {
            if (countdownElement) countdownElement.textContent = '0 ngày 0 giờ 0 phút 0 giây';
            if (countdownFullElement) countdownFullElement.textContent = '00 ngày : 00 giờ : 00 phút : 00 giây';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysStr = String(days).padStart(2, '0');
        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');
        
        if (countdownElement) {
            countdownElement.textContent = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
        }
        
        if (countdownFullElement) {
            countdownFullElement.textContent = `${daysStr} ngày : ${hoursStr} giờ : ${minutesStr} phút : ${secondsStr} giây`;
        }
    }
    
    update();
    setInterval(update, 1000);
}
*/

// Animate Participant Count
function animateParticipantCount() {
    const countElement = document.getElementById('participant-count');
    if (!countElement) return;
    
    const target = 911;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCount = () => {
        current += increment;
        if (current < target) {
            countElement.textContent = Math.floor(current);
            requestAnimationFrame(updateCount);
        } else {
            countElement.textContent = target;
        }
    };
    
    setTimeout(updateCount, 500);
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    animateMainProgressBar();
    animateVoteNumbers();
    animateParticipantCount();
    // updateCountdown(); // DISABLED - sử dụng countdown từ index.js
});

// Artist Slider
function initArtistSlider() {
    const artistsList = document.querySelector('.artists-list');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    if (!prevBtn || !nextBtn || !artistsList) {
        console.warn('Artist slider elements not found');
        return;
    }
    
    const artists = document.querySelectorAll('.artist');
    console.log(`Initializing artist slider with ${artists.length} artists`);
    
    if (artists.length === 0) {
        console.warn('No artists found to initialize slider');
        return;
    }
    
    const artistsPerPage = 6;
    let currentPage = 0;
    const totalPages = Math.ceil(artists.length / artistsPerPage);

    function showPage(page) {
        // Hide all artists first with fade out
        artists.forEach((artist) => {
            artist.classList.remove('show');
        });

        // Wait for fade out, then show new page with staggered animation
        setTimeout(() => {
            const startIndex = page * artistsPerPage;
            const endIndex = startIndex + artistsPerPage;
            
            artists.forEach((artist, index) => {
                if (index >= startIndex && index < endIndex) {
                    artist.style.display = 'flex';
                    // Staggered animation
                    setTimeout(() => {
                        artist.classList.add('show');
                    }, (index - startIndex) * 80);
                } else {
                    artist.style.display = 'none';
                }
            });
        }, 200);
    }

    // Remove old event listeners by cloning buttons
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

    newPrevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
        } else {
            // Loop to last page
            currentPage = totalPages - 1;
        }
        showPage(currentPage);
    });

    newNextBtn.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
        } else {
            // Loop back to first page
            currentPage = 0;
        }
        showPage(currentPage);
    });

    // Show first page initially with animation
    setTimeout(() => {
        showPage(currentPage);
    }, 100);
}

// Export for use in other scripts
window.initArtistSlider = initArtistSlider;

// Initialize on DOM load
const artistsList = document.querySelector('.artists-list');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
if (prevBtn && nextBtn && artistsList) {
    initArtistSlider();
}

// Reviews Slider
const reviewsGrid = document.querySelector('.bidding-grid');
const prevReviewBtn = document.querySelector('.review-btn.prev-review');
const nextReviewBtn = document.querySelector('.review-btn.next-review');

if (prevReviewBtn && nextReviewBtn && reviewsGrid) {
    const reviews = document.querySelectorAll('.bidding-card');
    const reviewsPerPage = 2;
    let currentReviewPage = 0;
    const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);

    function showReviewPage(page) {
        // Hide all reviews first with fade out
        reviews.forEach((review) => {
            review.classList.remove('show');
        });

        // Wait for fade out, then show new page with staggered animation
        setTimeout(() => {
            const startIndex = page * reviewsPerPage;
            const endIndex = startIndex + reviewsPerPage;
            
            reviews.forEach((review, index) => {
                if (index >= startIndex && index < endIndex) {
                    review.style.display = 'block';
                    // Staggered animation
                    setTimeout(() => {
                        review.classList.add('show');
                    }, (index - startIndex) * 150);
                } else {
                    review.style.display = 'none';
                }
            });
        }, 200);
    }

    prevReviewBtn.addEventListener('click', () => {
        if (currentReviewPage > 0) {
            currentReviewPage--;
        } else {
            // Loop to last page
            currentReviewPage = totalReviewPages - 1;
        }
        showReviewPage(currentReviewPage);
    });

    nextReviewBtn.addEventListener('click', () => {
        if (currentReviewPage < totalReviewPages - 1) {
            currentReviewPage++;
        } else {
            // Loop back to first page
            currentReviewPage = 0;
        }
        showReviewPage(currentReviewPage);
    });

    // Show first page initially with animation
    setTimeout(() => {
        showReviewPage(currentReviewPage);
    }, 100);
}


// Animate Vote Numbers
function animateVoteNumbers() {
    const voteValues = document.querySelectorAll('.vote-value');
    
    voteValues.forEach(element => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateNumber = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = target;
            }
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateNumber();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(element);
    });
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe campaign cards and other elements
document.querySelectorAll('.campaign-card, .artist, .bidding-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardObserver.observe(el);
});

// Search functionality
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            console.log('Searching for:', searchTerm);
            alert(`Đang tìm kiếm: ${searchTerm}`);
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                console.log('Searching for:', searchTerm);
                alert(`Đang tìm kiếm: ${searchTerm}`);
            }
        }
    });
}

// Add pulse effect to HOT badges
setInterval(() => {
    document.querySelectorAll('.campaign-badge.hot').forEach(badge => {
        badge.style.transform = 'scale(1.1)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 300);
    });
}, 3000);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    }
});

// ==========================================
// EXED PREMIUM GLASSMORPHIC DIALOGS
// ==========================================
window.showPremiumAlert = function(message, isSuccess = false) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            font-family: 'Nunito', sans-serif;
        `;
        
        const iconSvg = isSuccess 
            ? `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c4a87f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
            : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c4a87f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

        overlay.innerHTML = `
            <div style="background: #470200; border: 2px solid #c4a87f; border-radius: 16px; max-width: 440px; width: 90%; padding: 35px 30px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.6); animation: alertPop 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative;">
                <style>
                    @keyframes alertPop {
                        from { transform: translateY(20px) scale(0.96); opacity: 0; }
                        to { transform: translateY(0) scale(1); opacity: 1; }
                    }
                    .btn-alert-ok {
                        width: 100%;
                        padding: 12px 18px;
                        background: #c4a87f;
                        color: #0c0c0e;
                        border: none;
                        border-radius: 30px;
                        font-weight: 800;
                        cursor: pointer;
                        font-size: 13px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(196, 168, 127, 0.3);
                        font-family: 'Nunito', sans-serif;
                    }
                    .btn-alert-ok:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(196, 168, 127, 0.5);
                    }
                    .btn-alert-ok:active {
                        transform: translateY(0);
                    }
                </style>
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(196, 168, 127, 0.08); border-radius: 50%; border: 1px solid rgba(196, 168, 127, 0.15); margin-bottom: 24px;">
                    ${iconSvg}
                </div>
                <h2 style="color: #c4a87f; margin: 0 0 12px 0; font-weight: 800; font-size: 22px; letter-spacing: 1px; text-transform: uppercase; font-family: 'Nunito', sans-serif;">
                    ${isSuccess ? 'Thành công' : 'Thông báo'}
                </h2>
                <p style="color: rgba(236, 234, 229, 0.8); font-size: 14px; margin-bottom: 25px; line-height: 1.5; font-family: 'Nunito', sans-serif;">
                    ${message}
                </p>
                <button class="btn-alert-ok" id="btnAlertOk">Xác nhận</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const close = () => {
            overlay.remove();
            resolve();
        };

        overlay.querySelector('#btnAlertOk').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close();
            }
        });
    });
};

window.showPremiumConfirm = function(message, onConfirm) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            font-family: 'Nunito', sans-serif;
        `;

        const iconSvg = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c4a87f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;

        const isCancelAction = message.toLowerCase().includes('hủy') || message.toLowerCase().includes('huy');
        const titleText = isCancelAction ? 'Xác nhận hủy đơn hàng' : 'Xác nhận';
        const okButtonText = isCancelAction ? 'Xác nhận hủy' : 'Đồng ý';

        overlay.innerHTML = `
            <div style="background: #470200; border: 2px solid #c4a87f; border-radius: 16px; max-width: 440px; width: 90%; padding: 35px 30px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.6); animation: alertPop 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative;">
                <style>
                    @keyframes alertPop {
                        from { transform: translateY(20px) scale(0.96); opacity: 0; }
                        to { transform: translateY(0) scale(1); opacity: 1; }
                    }
                    .btn-confirm-no {
                        flex: 0.8;
                        padding: 12px 18px;
                        background: rgba(236, 234, 229, 0.1);
                        color: #eceae5;
                        border: 1px solid rgba(236, 234, 229, 0.3);
                        border-radius: 30px;
                        font-weight: 700;
                        cursor: pointer;
                        font-size: 13px;
                        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                        text-transform: uppercase;
                        font-family: 'Nunito', sans-serif;
                        white-space: nowrap;
                    }
                    .btn-confirm-no:hover {
                        background: rgba(236, 234, 229, 0.2);
                    }
                    .btn-confirm-yes {
                        flex: 1.2;
                        padding: 12px 18px;
                        background: #c4a87f;
                        color: #0c0c0e;
                        border: none;
                        border-radius: 30px;
                        font-weight: 800;
                        cursor: pointer;
                        font-size: 13px;
                        text-transform: uppercase;
                        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                        box-shadow: 0 4px 15px rgba(196, 168, 127, 0.3);
                        font-family: 'Nunito', sans-serif;
                        white-space: nowrap;
                    }
                    .btn-confirm-yes:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(196, 168, 127, 0.5);
                    }
                    .btn-confirm-yes:active {
                        transform: translateY(0);
                    }
                </style>
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(196, 168, 127, 0.08); border-radius: 50%; border: 1px solid rgba(196, 168, 127, 0.15); margin-bottom: 24px;">
                    ${iconSvg}
                </div>
                <h2 style="color: #c4a87f; margin: 0 0 12px 0; font-weight: 800; font-size: 22px; letter-spacing: 1px; text-transform: uppercase; font-family: 'Nunito', sans-serif;">
                    ${titleText}
                </h2>
                <p style="color: rgba(236, 234, 229, 0.8); font-size: 14px; margin-bottom: 25px; line-height: 1.5; font-family: 'Nunito', sans-serif;">
                    ${message}
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="btn-confirm-no" id="btnConfirmCancel">Quay lại</button>
                    <button class="btn-confirm-yes" id="btnConfirmOk">${okButtonText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const close = (confirmed) => {
            overlay.remove();
            resolve(confirmed);
            if (confirmed && onConfirm) onConfirm();
        };

        overlay.querySelector('#btnConfirmCancel').addEventListener('click', () => close(false));
        overlay.querySelector('#btnConfirmOk').addEventListener('click', () => close(true));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close(false);
            }
        });
    });
};

