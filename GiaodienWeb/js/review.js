// Review Page JavaScript
// API_BASE_URL is already defined in api.js

let overallRating = 0;
let detailedRatings = {
    quality: 0,
    description: 0,
    shipping: 0,
    support: 0
};
let selectedTags = [];
let uploadedImages = [];
let orderData = null;

// Get order ID from URL
function getOrderIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('orderId');
}

// Load order data
async function loadOrderData() {
    const orderId = getOrderIdFromURL();
    if (!orderId) {
        console.log('No orderId in URL, using default data');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/donhang/${orderId}`);
        const data = await response.json();

        if (data.success && data.data) {
            orderData = data.data;
            updateCampaignInfo(orderData);
            updateProductInfo(orderData);
        } else {
            console.error('Failed to load order data');
        }
    } catch (error) {
        console.error('Error loading order data:', error);
    }
}

// Update campaign info
function updateCampaignInfo(order) {
    const registration = order.dangKyChienDich;
    const chienDich = registration?.chienDich;
    
    if (!chienDich) return;
    
    // Update campaign image
    const campaignThumb = document.getElementById('campaignThumb');
    if (chienDich.hinhAnhChienDichs && chienDich.hinhAnhChienDichs.length > 0) {
        campaignThumb.src = '../' + chienDich.hinhAnhChienDichs[0].duongDan;
    }
    
    // Update campaign name
    document.getElementById('campaignName').textContent = chienDich.tenChienDich;
    
    // Update order code
    document.getElementById('orderCode').textContent = `Đơn: #${order.maDonHang}`;
    
    // Update dates
    const startDate = chienDich.ngayBatDau ? new Date(chienDich.ngayBatDau).toLocaleDateString('vi-VN') : '';
    const endDate = chienDich.ngayKetThuc ? new Date(chienDich.ngayKetThuc).toLocaleDateString('vi-VN') : '';
    
    document.getElementById('startDate').textContent = `Bắt đầu: ${startDate}`;
    document.getElementById('endDate').textContent = `Kết thúc: ${endDate}`;
}

// Update product info
function updateProductInfo(order) {
    const chiTietDonHangs = order.chiTietDonHangs || [];
    const sanPham = order.dangKyChienDich?.chienDich?.sanPham;
    
    if (!sanPham || chiTietDonHangs.length === 0) return;
    
    const productList = document.getElementById('productList');
    
    // Calculate total quantity
    const totalQuantity = chiTietDonHangs.reduce((sum, item) => sum + (item.soLuong || 1), 0);
    
    // Create product HTML
    const productHTML = `
        <div class="product-summary">
            <div class="product-name-row">
                <strong>${sanPham.tenSanPham}</strong>
                <span class="total-quantity">Tổng: ${totalQuantity} đôi</span>
            </div>
            <div class="product-variants-list">
                ${chiTietDonHangs.map(item => `
                    <div class="variant-item">
                        <span class="variant-color">Màu ${item.mauSac?.tenMau || 'N/A'}</span>
                        <span class="variant-separator">-</span>
                        <span class="variant-size">Size ${item.kichThuoc?.tenSize || 'N/A'}</span>
                        <span class="variant-separator">:</span>
                        <span class="variant-qty">${item.soLuong || 1} đôi</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    productList.innerHTML = productHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    loadOrderData(); // Load order data first
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
                showPremiumAlert(`File ${file.name} quá lớn. Kích thước tối đa là 5MB.`, false);
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showPremiumAlert(`File ${file.name} không phải là hình ảnh.`, false);
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
            showPremiumAlert('Bạn đã đạt giới hạn 5 ảnh.', false);
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
    
    submitBtn.addEventListener('click', async function() {
        // Validate
        if (overallRating === 0) {
            showPremiumAlert('Vui lòng chọn đánh giá tổng thể!', false);
            return;
        }
        
        const textarea = document.querySelector('.review-textarea');
        if (textarea.value.trim().length < 10) {
            showPremiumAlert('Vui lòng nhập nội dung đánh giá (tối thiểu 10 ký tự)!', false);
            return;
        }

        // Check if we have order data
        if (!orderData || !orderData.maDonHang) {
            showPremiumAlert('Không tìm thấy thông tin đơn hàng!', false);
            return;
        }
        // Disable button to prevent double submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang tải ảnh lên...';

        let imagePaths = [];
        if (uploadedImages.length > 0) {
            const formData = new FormData();
            uploadedImages.forEach(file => {
                formData.append('files', file);
            });
            
            try {
                // Call public upload endpoint for review images
                const uploadResponse = await fetch(`${API_BASE_URL}/upload/danhgia/multi`, {
                    method: 'POST',
                    body: formData
                });
                const uploadResult = await uploadResponse.json();
                if (uploadResult.success && uploadResult.data) {
                    imagePaths = uploadResult.data.map(item => item.duongDan);
                    console.log('✅ Uploaded images:', imagePaths);
                } else {
                    console.error('File upload failed:', uploadResult.message);
                    showPremiumAlert('Lỗi khi tải ảnh lên: ' + uploadResult.message, false);
                    submitBtn.disabled = false;
                    submitBtn.textContent = '✓ Gửi đánh giá';
                    return;
                }
            } catch (err) {
                console.error('Error uploading files:', err);
                showPremiumAlert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại!', false);
                submitBtn.disabled = false;
                submitBtn.textContent = '✓ Gửi đánh giá';
                return;
            }
        }
        
        // Collect data
        const reviewData = {
            maDonHang: orderData.maDonHang,
            diemDanhGia: overallRating,
            binhLuan: textarea.value.trim(),
            anDanh: document.getElementById('anonymousReview').checked, // true or false
            hinhAnhs: imagePaths.length > 0 ? imagePaths : null
        };
        
        console.log('Sending review data:', reviewData);
        
        try {
            submitBtn.textContent = 'Đang gửi...';
            
            // Send to API
            const response = await fetch(`${API_BASE_URL}/danhgia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                await showPremiumAlert('Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được gửi thành công.', true);
                // Redirect back to order history
                window.location.href = 'order-history.html';
            } else {
                showPremiumAlert('Lỗi: ' + result.message, false);
                submitBtn.disabled = false;
                submitBtn.textContent = '✓ Gửi đánh giá';
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showPremiumAlert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!', false);
            submitBtn.disabled = false;
            submitBtn.textContent = '✓ Gửi đánh giá';
        }
    });
}

// Initialize detailed ratings on load
initializeDetailedRatings();
