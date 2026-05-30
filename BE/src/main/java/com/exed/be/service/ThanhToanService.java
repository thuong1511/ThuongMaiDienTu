package com.exed.be.service;

import com.exed.be.dto.ThanhToanRequest;
import com.exed.be.model.ThanhToan;
import com.exed.be.model.Wallet;
import com.exed.be.model.WalletTransaction;
import com.exed.be.repository.ThanhToanRepository;
import com.exed.be.repository.WalletRepository;
import com.exed.be.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ThanhToanService {
    
    @Autowired
    private ThanhToanRepository thanhToanRepository;
    
    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private WalletTransactionRepository walletTransactionRepository;
    
    public List<ThanhToan> getAllThanhToan() {
        return thanhToanRepository.findAll();
    }
    
    public Optional<ThanhToan> getThanhToanById(Integer maThanhToan) {
        return thanhToanRepository.findById(maThanhToan);
    }
    
    public List<ThanhToan> getThanhToanByPhuongThuc(String phuongThuc) {
        return thanhToanRepository.findByPhuongThuc(phuongThuc);
    }
    
    @Transactional
    public ThanhToan createThanhToan(ThanhToanRequest request) {
        // Check if payment method is "Ví EXED"
        if ("Ví EXED".equals(request.getPhuongThuc())) {
            // Extract user ID from ghiChu or another field
            // For now, we'll need to pass maNguoiDung in the request
            // This will be handled in the controller
            
            // Validation will be done in controller before calling this method
        }
        
        ThanhToan thanhToan = new ThanhToan();
        thanhToan.setHoTenNguoiNhan(request.getHoTenNguoiNhan());
        thanhToan.setSoDienThoaiNhan(request.getSoDienThoaiNhan());
        thanhToan.setDiaChiGiaoHang(request.getDiaChiGiaoHang());
        thanhToan.setSoTienThanhToan(request.getSoTienThanhToan());
        thanhToan.setPhuongThuc(request.getPhuongThuc());
        thanhToan.setGhiChu(request.getGhiChu());
        
        return thanhToanRepository.save(thanhToan);
    }
    
    // New method to handle wallet payment
    @Transactional
    public ThanhToan createThanhToanWithWallet(ThanhToanRequest request, String maNguoiDung) {
        // Get user wallet
        Optional<Wallet> walletOpt = walletRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
        
        if (!walletOpt.isPresent()) {
            throw new RuntimeException("Người dùng chưa có ví");
        }
        
        Wallet wallet = walletOpt.get();
        BigDecimal currentBalance = wallet.getSoDu() != null ? wallet.getSoDu() : BigDecimal.ZERO;
        BigDecimal paymentAmount = request.getSoTienThanhToan();
        
        // Check if balance is sufficient
        if (currentBalance.compareTo(paymentAmount) < 0) {
            throw new RuntimeException("Số dư ví không đủ. Số dư hiện tại: " + currentBalance + " đ");
        }
        
        // Deduct from wallet
        wallet.setSoDu(currentBalance.subtract(paymentAmount));
        walletRepository.save(wallet);
        
        // Extract campaign name from ghiChu (format: "Thanh toán đăng ký chiến dịch [TÊN CHIẾN DỊCH]")
        String campaignName = "chiến dịch";
        if (request.getGhiChu() != null && request.getGhiChu().contains("chiến dịch ")) {
            String[] parts = request.getGhiChu().split("chiến dịch ");
            if (parts.length > 1) {
                campaignName = "chiến dịch " + parts[1];
            }
        }
        
        // Create transaction record with detailed description
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setLoaiGiaoDich("Thanh toán");
        transaction.setSoTien(paymentAmount.negate()); // Negative for deduction
        transaction.setMoTa("Thanh toán bằng ví EXED - " + campaignName);
        walletTransactionRepository.save(transaction);
        
        // Create payment record
        ThanhToan thanhToan = new ThanhToan();
        thanhToan.setHoTenNguoiNhan(request.getHoTenNguoiNhan());
        thanhToan.setSoDienThoaiNhan(request.getSoDienThoaiNhan());
        thanhToan.setDiaChiGiaoHang(request.getDiaChiGiaoHang());
        thanhToan.setSoTienThanhToan(request.getSoTienThanhToan());
        thanhToan.setPhuongThuc(request.getPhuongThuc());
        thanhToan.setGhiChu(request.getGhiChu());
        
        return thanhToanRepository.save(thanhToan);
    }
    
    public ThanhToan updateThanhToan(Integer maThanhToan, ThanhToanRequest request) {
        Optional<ThanhToan> existing = thanhToanRepository.findById(maThanhToan);
        if (existing.isPresent()) {
            ThanhToan thanhToan = existing.get();
            thanhToan.setHoTenNguoiNhan(request.getHoTenNguoiNhan());
            thanhToan.setSoDienThoaiNhan(request.getSoDienThoaiNhan());
            thanhToan.setDiaChiGiaoHang(request.getDiaChiGiaoHang());
            thanhToan.setSoTienThanhToan(request.getSoTienThanhToan());
            thanhToan.setPhuongThuc(request.getPhuongThuc());
            thanhToan.setGhiChu(request.getGhiChu());
            
            return thanhToanRepository.save(thanhToan);
        }
        return null;
    }
    
    public boolean deleteThanhToan(Integer maThanhToan) {
        if (thanhToanRepository.existsById(maThanhToan)) {
            thanhToanRepository.deleteById(maThanhToan);
            return true;
        }
        return false;
    }
}
