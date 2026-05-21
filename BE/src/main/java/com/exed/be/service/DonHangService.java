package com.exed.be.service;

import com.exed.be.model.DonHang;
import com.exed.be.repository.DonHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service xử lý đơn hàng cho user
 */
@Service
public class DonHangService {
    
    @Autowired
    private DonHangRepository donHangRepository;
    
    /**
     * Lấy tất cả đơn hàng của một người dùng
     */
    public List<DonHang> getDonHangByNguoiDung(String maNguoiDung) {
        return donHangRepository.findByNguoiDung(maNguoiDung);
    }
    
    /**
     * Lấy chi tiết một đơn hàng
     */
    public Optional<DonHang> getDonHangById(String maDonHang) {
        return donHangRepository.findById(maDonHang);
    }
}
