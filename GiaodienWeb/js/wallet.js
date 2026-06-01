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

// Helper to convert numbers to Vietnamese words
function convertNumberToVietnameseWords(number) {
    if (number === 0) return 'Không đồng';
    
    const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
    const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    
    function readGroup(group) {
        let read = '';
        const hundreds = Math.floor(group / 100);
        const tens = Math.floor((group % 100) / 10);
        const ones = group % 10;
        
        if (hundreds > 0) {
            read += digits[hundreds] + ' trăm ';
        } else if (read) {
            read += 'không trăm ';
        }
        
        if (tens > 1) {
            read += digits[tens] + ' mươi ';
            if (ones === 1) read += 'mốt ';
            else if (ones === 5) read += 'lăm ';
            else if (ones > 0) read += digits[ones] + ' ';
        } else if (tens === 1) {
            read += 'mười ';
            if (ones === 5) read += 'lăm ';
            else if (ones > 0) read += digits[ones] + ' ';
        } else if (tens === 0 && ones > 0) {
            if (hundreds > 0 || read) read += 'lẻ ';
            read += digits[ones] + ' ';
        }
        
        return read;
    }
    
    let str = '';
    let i = 0;
    let temp = number;
    
    if (temp < 0) {
        str = 'Âm ';
        temp = Math.abs(temp);
    }
    
    do {
        const group = temp % 1000;
        if (group > 0) {
            const groupRead = readGroup(group);
            str = groupRead + units[i] + ' ' + str;
        }
        i++;
        temp = Math.floor(temp / 1000);
    } while (temp > 0);
    
    str = str.trim();
    if (str) {
        str = str.charAt(0).toUpperCase() + str.slice(1);
        return str + ' đồng';
    }
    return '';
}

// ─── State ────────────────────────────────────────────────
let _currentWalletBalance = 0; // Keep track of balance for validation

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
            _currentWalletBalance = wallet.soDu || 0;
            
            // Update balance display
            const balanceAmount = document.querySelector('.balance-amount');
            if (balanceAmount) {
                balanceAmount.textContent = _currentWalletBalance.toLocaleString('vi-VN') + ' đ';
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
        iconSVG = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
        `;
        // Determine sub-title from moTa
        if (description.includes('MoMo')) {
            title = 'Rút tiền qua MoMo';
        } else {
            title = 'Rút tiền về tài khoản ngân hàng';
        }
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

// ─── WITHDRAW MODAL ────────────────────────────────────────

function openWithdrawModal() {
    if (_currentWalletBalance <= 0) {
        showPremiumAlert('Số dư ví của bạn hiện tại là 0 đ. Không thể thực hiện rút tiền.', false);
        return;
    }

    // State
    let selectedMethod = 'MOMO'; // 'MOMO' or 'BANK'
    let step = 1; // 1 = nhập thông tin, 2 = xác nhận OTP
    let withdrawData = {};

    const user = getCurrentUser();
    const userPhone = user ? (user.soDienThoai || '') : '';
    const userName = user ? (user.tenDangNhap || '').toUpperCase() : '';

    // Build overlay
    const overlay = document.createElement('div');
    overlay.className = 'withdraw-overlay';
    overlay.id = 'withdrawOverlay';

    overlay.innerHTML = buildStep1HTML();
    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeWithdrawModal();
    });

    bindStep1Events();

    // ── helpers ──────────────────────────────────────────
    function buildStep1HTML() {
        return `
        <div class="withdraw-modal">
            <div class="withdraw-header">
                <h3>🏦 Rút tiền</h3>
                <button class="withdraw-close" onclick="closeWithdrawModal()">×</button>
            </div>

            <div class="withdraw-steps">
                <div class="w-step active" id="wStep1">
                    <span class="step-num">1</span>
                    <span>Thông tin</span>
                </div>
                <div class="w-step-divider"></div>
                <div class="w-step" id="wStep2">
                    <span class="step-num">2</span>
                    <span>Xác nhận OTP</span>
                </div>
            </div>

            <div class="withdraw-body">
                <!-- Method tabs -->
                <div class="withdraw-tabs">
                    <button class="w-tab active" id="tabMomo" onclick="switchMethod('MOMO')">
                        <svg class="w-tab-icon" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="20" fill="#ae2070"/>
                            <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle"
                                  font-size="14" font-weight="bold" fill="white" font-family="sans-serif">M</text>
                        </svg>
                        MoMo
                    </button>
                    <button class="w-tab" id="tabBank" onclick="switchMethod('BANK')">
                        <svg class="w-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        Ngân hàng
                    </button>
                </div>

                <!-- MoMo fields -->
                <div id="momoFields">
                    <div class="w-info-card">
                        <div class="w-info-row">
                            <span class="w-info-label">Số điện thoại MoMo</span>
                            <span class="w-info-val">${userPhone}</span>
                        </div>
                        <div class="w-info-row">
                            <span class="w-info-label">Tên chủ tài khoản</span>
                            <span class="w-info-val">${userName}</span>
                        </div>
                    </div>
                    <input type="hidden" id="wMomoPhone" value="${userPhone}">
                    <input type="hidden" id="wMomoName" value="${userName}">
                </div>

                <!-- Bank fields -->
                <div id="bankFields" style="display:none;">
                    <div class="w-form-group">
                        <label>Ngân hàng</label>
                        <select id="wBankName">
                            <option value="">-- Chọn ngân hàng --</option>
                            <option>Vietcombank</option>
                            <option>Vietinbank</option>
                            <option>BIDV</option>
                            <option>Agribank</option>
                            <option>Techcombank</option>
                            <option>MB Bank</option>
                            <option>ACB</option>
                            <option>Sacombank</option>
                            <option>TPBank</option>
                            <option>VPBank</option>
                            <option>SHB</option>
                            <option>HDBank</option>
                            <option>OCB</option>
                            <option>NCB</option>
                        </select>
                    </div>
                    <div class="w-form-group">
                        <label>Số tài khoản</label>
                        <input type="text" id="wBankAccount" placeholder="Nhập số tài khoản" maxlength="20">
                    </div>
                    <div class="w-form-group">
                        <label>Tên chủ tài khoản</label>
                        <input type="text" id="wBankName2" value="${userName}" readonly class="w-readonly-input" placeholder="Tên chủ tài khoản">
                    </div>
                </div>

                <!-- Amount -->
                <div class="w-form-group">
                    <label>Số tiền rút</label>
                    <div class="w-amount-wrap">
                        <input type="text" id="wAmount" placeholder="Nhập số tiền" inputmode="numeric">
                        <span class="w-amount-unit">đ</span>
                    </div>
                    <div id="wAmountWord" class="w-amount-word"></div>
                    <p class="w-balance-hint">
                        Số dư hiện tại: <strong>${_currentWalletBalance.toLocaleString('vi-VN')} đ</strong>
                        &nbsp;|&nbsp; Tối thiểu: <strong>50.000 đ</strong>
                    </p>
                </div>

                <div class="withdraw-actions">
                    <button class="w-btn-back" onclick="closeWithdrawModal()">Hủy</button>
                    <button class="w-btn-next" id="btnNextStep">
                        Tiếp tục
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </div>`;
    }

    function buildStep2HTML(data) {
        const destLabel = data.phuongThuc === 'MOMO'
            ? `MoMo — ${data.soTaiKhoan}`
            : `${data.tenNganHang} — ${data.soTaiKhoan}`;

        return `
        <div class="withdraw-modal">
            <div class="withdraw-header">
                <h3>🔐 Xác nhận OTP</h3>
                <button class="withdraw-close" onclick="closeWithdrawModal()">×</button>
            </div>

            <div class="withdraw-steps">
                <div class="w-step" id="wStep1">
                    <span class="step-num">1</span>
                    <span>Thông tin</span>
                </div>
                <div class="w-step-divider" style="background: var(--accent-gold);"></div>
                <div class="w-step active" id="wStep2">
                    <span class="step-num">2</span>
                    <span>Xác nhận OTP</span>
                </div>
            </div>

            <div class="withdraw-body">
                <!-- Summary -->
                <div class="w-summary">
                    <div><strong>Phương thức:</strong> ${data.phuongThuc === 'MOMO' ? '🟣 MoMo' : '🏦 Ngân hàng'}</div>
                    <div><strong>Tài khoản:</strong> ${destLabel}</div>
                    <div><strong>Chủ tài khoản:</strong> ${data.chuTaiKhoan}</div>
                    <div><strong>Số tiền:</strong> <span class="w-sum-amount">-${Number(data.soTien).toLocaleString('vi-VN')} đ</span></div>
                </div>

                <!-- OTP input -->
                <div class="w-form-group">
                    <label style="text-align:center; display:block;">Nhập mã OTP giao dịch (6 số)</label>
                    <div class="otp-boxes" id="otpBoxes">
                        <input class="otp-box" type="text" maxlength="1" inputmode="numeric" autocomplete="one-time-code" id="otpB0">
                        <input class="otp-box" type="text" maxlength="1" inputmode="numeric" autocomplete="one-time-code" id="otpB1">
                        <input class="otp-box" type="text" maxlength="1" inputmode="numeric" autocomplete="one-time-code" id="otpB2">
                        <input class="otp-box" type="text" maxlength="1" inputmode="numeric" autocomplete="one-time-code" id="otpB3">
                        <input class="otp-box" type="text" maxlength="1" inputmode="numeric" autocomplete="one-time-code" id="otpB4">
                        <input class="otp-box" type="text" maxlength="1" inputmode="numeric" autocomplete="one-time-code" id="otpB5">
                    </div>
                    <p class="w-otp-hint">Mã OTP đã được thiết lập trong trang <strong>Hồ sơ → Bảo mật</strong></p>
                </div>

                <div class="withdraw-actions">
                    <button class="w-btn-back" id="btnBackStep">← Quay lại</button>
                    <button class="w-btn-next" id="btnConfirmWithdraw">
                        Xác nhận rút tiền
                    </button>
                </div>
            </div>
        </div>`;
    }

    function switchMethod(method) {
        selectedMethod = method;
        const tabMomo = overlay.querySelector('#tabMomo');
        const tabBank = overlay.querySelector('#tabBank');
        const momoFields = overlay.querySelector('#momoFields');
        const bankFields = overlay.querySelector('#bankFields');

        if (method === 'MOMO') {
            tabMomo.classList.add('active');
            tabBank.classList.remove('active');
            momoFields.style.display = 'block';
            bankFields.style.display = 'none';
        } else {
            tabBank.classList.add('active');
            tabMomo.classList.remove('active');
            bankFields.style.display = 'block';
            momoFields.style.display = 'none';
        }
    }

    // Expose to inline onclick
    window.switchMethod = switchMethod;

    function bindStep1Events() {
        overlay.querySelector('#btnNextStep').addEventListener('click', goToStep2);

        const amountInput = overlay.querySelector('#wAmount');
        const amountWord = overlay.querySelector('#wAmountWord');

        if (amountInput) {
            amountInput.addEventListener('input', () => {
                let val = amountInput.value.replace(/\D/g, '');
                if (val) {
                    const num = parseInt(val, 10);
                    amountInput.value = num.toLocaleString('vi-VN');
                    if (amountWord) {
                        amountWord.textContent = convertNumberToVietnameseWords(num);
                        amountWord.style.display = 'block';
                    }
                } else {
                    amountInput.value = '';
                    if (amountWord) {
                        amountWord.textContent = '';
                        amountWord.style.display = 'none';
                    }
                }
            });
        }
    }

    function goToStep2() {
        // Validate
        let soTaiKhoan, chuTaiKhoan, tenNganHang = '';

        if (selectedMethod === 'MOMO') {
            soTaiKhoan = overlay.querySelector('#wMomoPhone').value.trim();
            chuTaiKhoan = overlay.querySelector('#wMomoName').value.trim();
            if (!soTaiKhoan) return showPremiumAlert('Vui lòng nhập số điện thoại MoMo.', false);
            if (!chuTaiKhoan) return showPremiumAlert('Vui lòng nhập tên chủ tài khoản MoMo.', false);
        } else {
            tenNganHang = overlay.querySelector('#wBankName').value;
            soTaiKhoan = overlay.querySelector('#wBankAccount').value.trim();
            chuTaiKhoan = overlay.querySelector('#wBankName2').value.trim();
            if (!tenNganHang) return showPremiumAlert('Vui lòng chọn ngân hàng.', false);
            if (!soTaiKhoan) return showPremiumAlert('Vui lòng nhập số tài khoản ngân hàng.', false);
            if (!chuTaiKhoan) return showPremiumAlert('Vui lòng nhập tên chủ tài khoản.', false);
        }

        const rawAmountStr = overlay.querySelector('#wAmount').value.replace(/\D/g, '');
        const soTien = parseFloat(rawAmountStr);
        if (!soTien || soTien <= 0) return showPremiumAlert('Vui lòng nhập số tiền muốn rút.', false);
        if (soTien < 50000) return showPremiumAlert('Số tiền rút tối thiểu là 50.000 đ.', false);
        if (soTien > _currentWalletBalance) {
            return showPremiumAlert(`Số dư không đủ. Số dư hiện tại: ${_currentWalletBalance.toLocaleString('vi-VN')} đ.`, false);
        }

        // Save data
        withdrawData = { phuongThuc: selectedMethod, soTaiKhoan, chuTaiKhoan, tenNganHang, soTien };
        step = 2;

        // Re-render step 2
        overlay.innerHTML = buildStep2HTML(withdrawData);
        setupOTPBoxes();
        overlay.querySelector('#btnBackStep').addEventListener('click', backToStep1);
        overlay.querySelector('#btnConfirmWithdraw').addEventListener('click', confirmWithdraw);
    }

    function backToStep1() {
        step = 1;
        overlay.innerHTML = buildStep1HTML();
        // Restore selected method
        switchMethod(withdrawData.phuongThuc || 'MOMO');
        // Restore values
        if (withdrawData.phuongThuc === 'MOMO') {
            overlay.querySelector('#wMomoPhone').value = withdrawData.soTaiKhoan || '';
            overlay.querySelector('#wMomoName').value = withdrawData.chuTaiKhoan || '';
        } else {
            overlay.querySelector('#wBankName').value = withdrawData.tenNganHang || '';
            overlay.querySelector('#wBankAccount').value = withdrawData.soTaiKhoan || '';
            overlay.querySelector('#wBankName2').value = withdrawData.chuTaiKhoan || '';
        }
        
        if (withdrawData.soTien) {
            const amountInput = overlay.querySelector('#wAmount');
            if (amountInput) {
                amountInput.value = Number(withdrawData.soTien).toLocaleString('vi-VN');
            }
            const amountWord = overlay.querySelector('#wAmountWord');
            if (amountWord) {
                amountWord.textContent = convertNumberToVietnameseWords(withdrawData.soTien);
                amountWord.style.display = 'block';
            }
        }
        bindStep1Events();
    }

    function setupOTPBoxes() {
        const boxes = overlay.querySelectorAll('.otp-box');
        boxes.forEach((box, i) => {
            box.addEventListener('input', () => {
                box.value = box.value.replace(/\D/g, '');
                if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
            });
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    if (box.value) {
                        box.value = '';
                    } else if (i > 0) {
                        boxes[i - 1].value = '';
                        boxes[i - 1].focus();
                    }
                    e.preventDefault(); // Prevent standard backspace to avoid double actions in some browsers
                }
            });
            box.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
                boxes.forEach((b, idx) => { b.value = pasted[idx] || ''; });
                const lastIdx = Math.min(pasted.length, boxes.length) - 1;
                if (lastIdx >= 0) boxes[lastIdx].focus();
            });
        });
        boxes[0].focus();
    }

    async function confirmWithdraw() {
        const boxes = overlay.querySelectorAll('.otp-box');
        const otpCode = Array.from(boxes).map(b => b.value).join('');
        if (otpCode.length !== 6) {
            return showPremiumAlert('Vui lòng nhập đủ 6 chữ số mã OTP.', false);
        }

        const btn = overlay.querySelector('#btnConfirmWithdraw');
        btn.disabled = true;
        btn.innerHTML = '<div class="w-spinner"></div> Đang xử lý...';

        const user = getCurrentUser();
        if (!user) return;

        try {
            const body = {
                phuongThuc: withdrawData.phuongThuc,
                soTaiKhoan: withdrawData.soTaiKhoan,
                chuTaiKhoan: withdrawData.chuTaiKhoan,
                tenNganHang: withdrawData.tenNganHang,
                soTien: withdrawData.soTien,
                otpCode: otpCode
            };

            const res = await fetch(`${API_BASE_URL}/wallet/nguoidung/${user.maNguoiDung}/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            closeWithdrawModal();

            if (data.success) {
                await showPremiumAlert(
                    `Rút tiền thành công! <br>Số tiền <strong>${Number(withdrawData.soTien).toLocaleString('vi-VN')} đ</strong> đã được xử lý.`,
                    true
                );
                // Reload wallet data to refresh balance + transactions
                loadWalletData();
            } else {
                showPremiumAlert(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.', false);
            }
        } catch (err) {
            console.error('❌ Withdraw error:', err);
            closeWithdrawModal();
            showPremiumAlert('Không thể kết nối máy chủ. Vui lòng thử lại sau.', false);
        }
    }
}

function closeWithdrawModal() {
    const overlay = document.getElementById('withdrawOverlay');
    if (overlay) overlay.remove();
}

// ─── Initialize ───────────────────────────────────────────

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
    
    // Withdraw button → open modal
    const withdrawBtn = document.querySelector('.btn-withdraw');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', openWithdrawModal);
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

