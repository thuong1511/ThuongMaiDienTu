package com.exed.be.service;

import com.exed.be.dto.WithdrawRequest;
import com.exed.be.model.NguoiDung;
import com.exed.be.model.Wallet;
import com.exed.be.model.WalletTransaction;
import com.exed.be.repository.NguoiDungRepository;
import com.exed.be.repository.WalletRepository;
import com.exed.be.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class WalletService {

    private static final BigDecimal MIN_WITHDRAW = new BigDecimal("50000");

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    public Wallet getOrCreateWallet(String maNguoiDung) {
        Optional<Wallet> walletOpt = walletRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);

        if (walletOpt.isPresent()) {
            return walletOpt.get();
        }

        // Create new wallet if not exists
        Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findById(maNguoiDung);
        if (!nguoiDungOpt.isPresent()) {
            throw new RuntimeException("Người dùng không tồn tại");
        }

        Wallet wallet = new Wallet();
        wallet.setNguoiDung(nguoiDungOpt.get());
        wallet.setSoDu(BigDecimal.ZERO);
        return walletRepository.save(wallet);
    }

    public List<WalletTransaction> getTransactionHistory(Integer maVi) {
        return walletTransactionRepository.findByWallet_MaViOrderByNgayGiaoDichDesc(maVi);
    }

    /**
     * Thực hiện rút tiền khỏi ví sau khi xác thực OTP giao dịch.
     */
    @Transactional
    public WalletTransaction withdraw(WithdrawRequest request) {
        String maNguoiDung = request.getMaNguoiDung();

        // 1. Lấy thông tin người dùng
        NguoiDung nguoiDung = nguoiDungRepository.findById(maNguoiDung)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // 2. Xác thực OTP giao dịch
        String otpLuu = nguoiDung.getOtpGiaoDich();
        if (otpLuu == null || otpLuu.isBlank()) {
            throw new RuntimeException("Bạn chưa thiết lập mã OTP giao dịch. Vui lòng thiết lập trong trang hồ sơ.");
        }
        if (!otpLuu.equals(request.getOtpCode())) {
            throw new RuntimeException("Mã OTP không đúng. Vui lòng kiểm tra lại.");
        }

        // 3. Validate số tiền
        BigDecimal soTien = request.getSoTien();
        if (soTien == null || soTien.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền rút phải lớn hơn 0.");
        }
        if (soTien.compareTo(MIN_WITHDRAW) < 0) {
            throw new RuntimeException("Số tiền rút tối thiểu là 50.000 đ.");
        }

        // 4. Kiểm tra ví và số dư
        Wallet wallet = walletRepository.findByNguoiDung_MaNguoiDung(maNguoiDung)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người dùng"));

        if (wallet.getSoDu().compareTo(soTien) < 0) {
            throw new RuntimeException("Số dư ví không đủ. Số dư hiện tại: "
                    + String.format("%,.0f", wallet.getSoDu()) + " đ.");
        }

        // 5. Trừ số dư
        wallet.setSoDu(wallet.getSoDu().subtract(soTien));
        walletRepository.save(wallet);

        // 6. Tạo mô tả giao dịch
        String phuongThuc = request.getPhuongThuc();
        String moTa;
        if ("MOMO".equalsIgnoreCase(phuongThuc)) {
            moTa = "Rút tiền qua MoMo - SĐT: " + request.getSoTaiKhoan()
                    + " - Chủ TK: " + request.getChuTaiKhoan();
        } else {
            moTa = "Rút tiền qua " + request.getTenNganHang()
                    + " - STK: " + request.getSoTaiKhoan()
                    + " - Chủ TK: " + request.getChuTaiKhoan();
        }

        // 7. Tạo WalletTransaction
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setLoaiGiaoDich("Rút tiền");
        transaction.setSoTien(soTien);
        transaction.setMoTa(moTa);

        return walletTransactionRepository.save(transaction);
    }
}
