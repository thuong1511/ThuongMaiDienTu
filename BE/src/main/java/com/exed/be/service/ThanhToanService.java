package com.exed.be.service;

import com.exed.be.dto.ThanhToanRequest;
import com.exed.be.model.ThanhToan;
import com.exed.be.repository.ThanhToanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ThanhToanService {
    
    @Autowired
    private ThanhToanRepository thanhToanRepository;
    
    public List<ThanhToan> getAllThanhToan() {
        return thanhToanRepository.findAll();
    }
    
    public Optional<ThanhToan> getThanhToanById(Integer maThanhToan) {
        return thanhToanRepository.findById(maThanhToan);
    }
    
    public List<ThanhToan> getThanhToanByPhuongThuc(String phuongThuc) {
        return thanhToanRepository.findByPhuongThuc(phuongThuc);
    }
    
    public ThanhToan createThanhToan(ThanhToanRequest request) {
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
