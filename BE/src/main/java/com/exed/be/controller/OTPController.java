package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
@CrossOrigin(origins = "*")
public class OTPController {

    @Autowired
    private OTPService otpService;

    /**
     * Kiểm tra xem người dùng đã cài đặt OTP giao dịch chưa
     */
    @GetMapping("/nguoidung/{maNguoiDung}/check")
    public ResponseEntity<ApiResponse<Boolean>> checkOTP(@PathVariable String maNguoiDung) {
        try {
            boolean hasOTP = otpService.hasTransactionOTP(maNguoiDung);
            return ResponseEntity.ok(new ApiResponse<>(true, "Kiểm tra OTP thành công", hasOTP));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }

    /**
     * Thiết lập mã OTP giao dịch cho người dùng
     */
    @PostMapping("/set")
    public ResponseEntity<ApiResponse<Boolean>> setOTP(@RequestBody Map<String, String> payload) {
        try {
            String maNguoiDung = payload.get("maNguoiDung");
            String otpCode = payload.get("otpCode");

            if (maNguoiDung == null || maNguoiDung.isBlank() || otpCode == null || otpCode.isBlank()) {
                return ResponseEntity.ok(new ApiResponse<>(false, "Thiếu thông tin maNguoiDung hoặc otpCode", false));
            }

            otpService.setTransactionOTP(maNguoiDung, otpCode);
            return ResponseEntity.ok(new ApiResponse<>(true, "Thiết lập mã OTP giao dịch thành công", true));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), false));
        }
    }

    /**
     * Xác thực mã OTP giao dịch
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyOTP(@RequestBody Map<String, String> payload) {
        try {
            String maNguoiDung = payload.get("maNguoiDung");
            String otpCode = payload.get("otpCode");

            if (maNguoiDung == null || maNguoiDung.isBlank() || otpCode == null || otpCode.isBlank()) {
                return ResponseEntity.ok(new ApiResponse<>(false, "Thiếu thông tin maNguoiDung hoặc otpCode", false));
            }

            boolean isValid = otpService.verifyTransactionOTP(maNguoiDung, otpCode);
            if (isValid) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Mã OTP hợp lệ", true));
            } else {
                return ResponseEntity.ok(new ApiResponse<>(false, "Mã OTP không đúng hoặc đã hết hạn", false));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), false));
        }
    }
}
