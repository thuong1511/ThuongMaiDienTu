// Review Page JavaScript
let overallRating = 0;
let detailedRatings = {
    quality: 0,
    description: 0,
    shipping: 0,
    support: 0
};
let selectedTags = [];
let uploadedImages = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeRatingStars();
    initializeQuickTags();
    initializeImageUpload();
    initializeTextarea();
    initializeSubmitButton();
});

// Initialize overall rating stars
function initializeRatingStars() {
    const stars = document.querySelectorAll('.star-rating-large .star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            overallRating = rating;
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            
            // Update text
            const ratingText = document.querySelector('.rating-text');
            const ratingLabels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'];
            ratingText.textContent = ratingLabels[rating];
            ratingText.style.color = 'var(--accent-gold)';
            ratingText.style.fontWeight = '700';
        });
        
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.color = '#FFD700';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
    
    // Reset on mouse leave
    const starContainer = document.querySelector('.star-rating-large');
    starContainer.addEventListener('mouseleave', function() {
        stars.forEach((s, index) => {
            if (index < overallRating) {
                s.style.color = '#FFD700';
            } else {
                s.style.color = '#ddd';
            }
        });
    });
}

// Initialize detailed rating stars
function initializeDetailedRatings() {
    const categories = ['quality', 'description', 'shipping', 'support'];
    
    categories.forEach(category => {
        const stars = document.querySelectorAll(`.star-small[data-category="${category}"]`);
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                detailedRatings[category] = rating;
                
                // Update star display
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
            
            // Hover effect
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.style.color = '#FFD700';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        });
        
        // Reset on mouse leave
        const ratingItem = stars[0].closest('.rating-item');
        ratingItem.addEventListener('mouseleave', function() {
            stars.forEach((s, index) => {
                if (index < detailedRatings[category]) {
                    s.style.color = '#FFD700';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
}

// Initialize quick tags
function initializeQuickTags() {
    const tagButtons = document.querySelectorAll('.tag-btn');
    
    tagButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tag = this.textContent;
            
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                selectedTags = selectedTags.filter(t => t !== tag);
            } else {
                this.classList.add('active');
                selectedTags.push(tag);
            }
        });
    });
}

// Initialize image upload
function initializeImageUpload() {
    const fileInput = document.getElementById('imageUpload');
    const previewContainer = document.querySelector('.image-preview-container');
    
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        // Limit to 5 images
        const remainingSlots = 5 - uploadedImages.length;
        const filesToAdd = files.slice(0, remainingSlots);
        
        filesToAdd.forEach(file => {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} quá lớn. Kích thước tối đa là 5MB.`);
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert(`File ${file.name} không phải là hình ảnh.`);
                return;
            }
            
            uploadedImages.push(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.createElement('div');
                preview.className = 'image-preview';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-image" data-index="${uploadedImages.length - 1}">×</button>
                `;
                previewContainer.appendChild(preview);
                
                // Add remove handler
                preview.querySelector('.remove-image').addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    removeImage(index, preview);
                });
            };
            reader.readAsDataURL(file);
        });
        
        // Reset input
        fileInput.value = '';
        
        // Show warning if limit reached
        if (uploadedImages.length >= 5) {
            alert('Bạn đã đạt giới hạn 5 ảnh.');
        }
    });
}

// Remove image
function removeImage(index, previewElement) {
    uploadedImages.splice(index, 1);
    previewElement.remove();
    
    // Update indices
    const previews = document.querySelectorAll('.image-preview');
    previews.forEach((preview, i) => {
        const removeBtn = preview.querySelector('.remove-image');
        removeBtn.setAttribute('data-index', i);
    });
}

// Initialize textarea character count
function initializeTextarea() {
    const textarea = document.querySelector('.review-textarea');
    const charCount = document.querySelector('.char-count');
    
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/5000 ký tự`;
        
        if (length > 4900) {
            charCount.style.color = '#d32f2f';
        } else {
            charCount.style.color = 'rgba(95, 7, 4, 0.5)';
        }
    });
}

// Initialize submit button
function initializeSubmitButton() {
    const submitBtn = document.querySelector('.btn-submit');
    
    submitBtn.addEventListener('click', function() {
        // Validate
        if (overallRating === 0) {
            alert('Vui lòng chọn đánh giá tổng thể!');
            return;
        }
        
        const textarea = document.querySelector('.review-textarea');
        if (textarea.value.trim().length < 10) {
            alert('Vui lòng nhập nội dung đánh giá (tối thiểu 10 ký tự)!');
            return;
        }
        
        // Collect data
        const reviewData = {
            overallRating: overallRating,
            detailedRatings: detailedRatings,
            tags: selectedTags,
            content: textarea.value.trim(),
            images: uploadedImages,
            anonymous: document.getElementById('anonymousReview').checked
        };
        
        console.log('Review data:', reviewData);
        
        // Show success message
        alert('Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được gửi thành công.');
        
        // Redirect back to order history
        window.location.href = 'order-history.html';
    });
}

// Initialize detailed ratings on load
initializeDetailedRatings();
