// Wallet JavaScript
// API_BASE_URL is already defined in api.js

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userStr);
}

// Load wallet data
async function loadWalletData() {
    const user = getCurrentUser();
    if (!user) return;

    console.log('🔍 Loading wallet for user:', user.maNguoiDung);

    try {
        // Get wallet info
        const walletResponse = await fetch(`${API_BASE_URL}/wallet/nguoidung/${user.maNguoiDung}`);
        const walletData = await walletResponse.json();

        console.log('📊 Wallet API response:', walletData);

        if (walletData.success && walletData.data) {
            const wallet = walletData.data;
            
            console.log('✅ Wallet loaded:', wallet);
            
            // Update balance display
            const balanceAmount = document.querySelector('.balance-amount');
            if (balanceAmount) {
                balanceAmount.textContent = (wallet.soDu || 0).toLocaleString('vi-VN') + ' đ';
            }

            // Load transactions
            await loadTransactions(wallet.maVi);
        } else {
            console.error('❌ Failed to load wallet:', walletData.message);
            showError('Không thể tải thông tin ví. Vui lòng thử lại sau.');
        }
    } catch (error) {
        console.error('❌ Error loading wallet data:', error);
        showError('Có lỗi xảy ra khi tải thông tin ví.');
    }
}

// Load transaction history
async function loadTransactions(maVi) {
    const container = document.querySelector('.transaction-list');
    if (!container) return;

    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Đang tải giao dịch...</p>';

    console.log('🔍 Loading transactions for wallet:', maVi);

    try {
        const response = await fetch(`${API_BASE_URL}/wallet/${maVi}/transactions`);
        const data = await response.json();

        console.log('📊 Transactions API response:', data);

        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = '';
            
            console.log('✅ Found', data.data.length, 'transactions');
            
            // Sort transactions by date (newest first)
            const transactions = data.data.sort((a, b) => {
                return new Date(b.ngayGiaoDich) - new Date(a.ngayGiaoDich);
            });

            transactions.forEach(transaction => {
                const card = createTransactionCard(transaction);
                container.appendChild(card);
            });
        } else {
            console.warn('⚠️ No transactions found');
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom: 20px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 style="color: #666; margin: 0;">Chưa có giao dịch nào</h3>
                    <p style="color: #999; margin: 10px 0;">Lịch sử giao dịch sẽ hiển thị tại đây</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error loading transactions:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #d32f2f;">
                <p>❌ Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

// Create transaction card HTML
function createTransactionCard(transaction) {
    const card = document.createElement('div');
    card.className = 'transaction-item';
    
    // Determine transaction type and details
    const loaiGiaoDich = transaction.loaiGiaoDich || '';
    let transactionType = 'refund'; // default
    let iconSVG = '';
    let title = '';
    let description = transaction.moTa || '';
    let amountClass = 'positive';
    
    // Map transaction types
    if (loaiGiaoDich.includes('Hoàn tiền')) {
        transactionType = 'refund';
        amountClass = 'positive';
        iconSVG = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
        `;
        
        // Determine refund reason from description
        if (loaiGiaoDich.includes('Hủy đơn') || description.includes('Hủy đơn') || description.includes('hủy đơn')) {
            title = 'Hoàn tiền - Hủy đơn đăng ký';
        } else if (loaiGiaoDich.includes('Cược đúng') || description.includes('Cược đúng')) {
            title = 'Hoàn tiền - Cược đúng';
        } else if (loaiGiaoDich.includes('Chiến dịch thất bại') || description.includes('thất bại')) {
            title = 'Hoàn tiền - Chiến dịch thất bại';
        } else {
            title = 'Hoàn tiền';
        }
    } else if (loaiGiaoDich.includes('Thanh toán') || loaiGiaoDich.includes('Trừ tiền')) {
        transactionType = 'payment';
        amountClass = 'negative';
        title = 'Thanh toán đơn hàng';
        iconSVG = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
        `;
    } else if (loaiGiaoDich.includes('Rút tiền')) {
        transactionType = 'withdraw';
        amountClass = 'negative';
        title = 'Rút tiền về tài khoản ngân hàng';
        iconSVG = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
        `;
    } else if (loaiGiaoDich.includes('Nạp tiền')) {
        transactionType = 'deposit';
        amountClass = 'positive';
        title = 'Nạp tiền vào ví';
        iconSVG = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
        `;
    } else {
        // Default case
        title = loaiGiaoDich || 'Giao dịch';
        iconSVG = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    }
    
    // Set data attribute for filtering
    card.setAttribute('data-type', transactionType);
    
    // Format date
    const transactionDate = transaction.ngayGiaoDich 
        ? new Date(transaction.ngayGiaoDich).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'N/A';
    
    // Format amount
    const amount = transaction.soTien || 0;
    const amountText = (amountClass === 'positive' ? '+' : '-') + Math.abs(amount).toLocaleString('vi-VN') + ' đ';
    
    card.innerHTML = `
        <div class="transaction-icon ${transactionType}">
            ${iconSVG}
        </div>
        <div class="transaction-content">
            <h4>${title}</h4>
            <p>${description}</p>
            <span class="transaction-date">${transactionDate}</span>
        </div>
        <div class="transaction-amount ${amountClass}">${amountText}</div>
    `;
    
    return card;
}

// Filter transactions
function filterTransactions(filterType) {
    const transactionItems = document.querySelectorAll('.transaction-item');
    
    transactionItems.forEach(item => {
        const itemType = item.getAttribute('data-type');
        
        if (filterType === 'all') {
            item.style.display = 'flex';
        } else {
            item.style.display = itemType === filterType ? 'flex' : 'none';
        }
    });
}

// Show error message
function showError(message) {
    const balanceAmount = document.querySelector('.balance-amount');
    if (balanceAmount) {
        balanceAmount.textContent = '0 đ';
        balanceAmount.style.color = '#d32f2f';
    }
    
    const container = document.querySelector('.transaction-list');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #d32f2f;">
                <p>❌ ${message}</p>
            </div>
        `;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load wallet data
    loadWalletData();
    
    // Add filter button functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter type and apply filter
            const filterType = button.getAttribute('data-filter');
            filterTransactions(filterType);
        });
    });
    
    // Withdraw button (placeholder - not implemented yet)
    const withdrawBtn = document.querySelector('.btn-withdraw');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
            alert('Chức năng rút tiền đang được phát triển. Vui lòng liên hệ bộ phận hỗ trợ để được hỗ trợ rút tiền.');
        });
    }
    
    // History button (scroll to transaction list)
    const historyBtn = document.querySelector('.btn-history');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            const transactionList = document.querySelector('.transaction-list');
            if (transactionList) {
                transactionList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
});
