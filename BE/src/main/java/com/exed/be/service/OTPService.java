package com.exed.be.service;

import com.exed.be.model.NguoiDung;
import com.exed.be.repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OTPService {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    /**
     * Kiểm tra xem người dùng đã thiết lập OTP giao dịch chưa
     */
    public boolean hasTransactionOTP(String maNguoiDung) {
        return nguoiDungRepository.findById(maNguoiDung)
                .map(user -> user.getOtpGiaoDich() != null && !user.getOtpGiaoDich().isBlank())
                .orElse(false);
    }

    /**
     * Thiết lập mã OTP giao dịch cho người dùng
     */
    @Transactional
    public NguoiDung setTransactionOTP(String maNguoiDung, String otpCode) {
        if (otpCode == null || otpCode.length() != 6 || !otpCode.matches("\\d+")) {
            throw new RuntimeException("Mã OTP giao dịch phải chứa đúng 6 chữ số");
        }

        NguoiDung user = nguoiDungRepository.findById(maNguoiDung)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + maNguoiDung));

        // Lưu trực tiếp mã OTP vào cột otpGiaoDich của bảng NguoiDung
        user.setOtpGiaoDich(otpCode);
        return nguoiDungRepository.save(user);
    }

    /**
     * Xác thực mã OTP giao dịch của người dùng
     */
    public boolean verifyTransactionOTP(String maNguoiDung, String otpCode) {
        if (otpCode == null || otpCode.isBlank()) return false;
        
        return nguoiDungRepository.findById(maNguoiDung)
                .map(user -> otpCode.equals(user.getOtpGiaoDich()))
                .orElse(false);
    }
}
