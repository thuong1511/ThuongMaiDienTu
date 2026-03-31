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

// Real-time Countdown Timer
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
    updateCountdown();
});

// Artist Slider
const artistsList = document.querySelector('.artists-list');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');

if (prevBtn && nextBtn && artistsList) {
    const artists = document.querySelectorAll('.artist');
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

    prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
        } else {
            // Loop to last page
            currentPage = totalPages - 1;
        }
        showPage(currentPage);
    });

    nextBtn.addEventListener('click', () => {
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

// User button functionality
const userBtn = document.querySelector('.user-btn');
const dropdownItems = document.querySelectorAll('.dropdown-item');

if (dropdownItems.length > 0) {
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const text = item.querySelector('span').textContent;
            
            if (text === 'Đăng xuất') {
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    alert('Đã đăng xuất thành công!');
                }
            } else {
                alert(`Chức năng "${text}" đang được phát triển!`);
            }
        });
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
