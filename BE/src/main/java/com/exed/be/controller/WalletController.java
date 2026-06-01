package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.dto.WithdrawRequest;
import com.exed.be.model.Wallet;
import com.exed.be.model.WalletTransaction;
import com.exed.be.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    @Autowired
    private WalletService walletService;

    // Get wallet by user ID
    @GetMapping("/nguoidung/{maNguoiDung}")
    public ResponseEntity<ApiResponse<Wallet>> getWalletByUser(@PathVariable String maNguoiDung) {
        try {
            Wallet wallet = walletService.getOrCreateWallet(maNguoiDung);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin ví thành công", wallet));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }

    // Get transaction history
    @GetMapping("/{maVi}/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransaction>>> getTransactions(@PathVariable Integer maVi) {
        try {
            List<WalletTransaction> transactions = walletService.getTransactionHistory(maVi);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy lịch sử giao dịch thành công", transactions));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }

    // Withdraw money from wallet (requires OTP verification)
    @PostMapping("/nguoidung/{maNguoiDung}/withdraw")
    public ResponseEntity<ApiResponse<WalletTransaction>> withdraw(
            @PathVariable String maNguoiDung,
            @RequestBody WithdrawRequest request) {
        try {
            request.setMaNguoiDung(maNguoiDung);
            WalletTransaction transaction = walletService.withdraw(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Rút tiền thành công", transaction));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

