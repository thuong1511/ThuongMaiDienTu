package com.exed.be.service;

import com.exed.be.dto.PhieuChiTietDangKyRequest;
import com.exed.be.model.*;
import com.exed.be.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PhieuChiTietDangKyService {
    
    @Autowired
    private PhieuChiTietDangKyRepository phieuChiTietDangKyRepository;
    
    @Autowired
    private DangKyChienDichRepository dangKyChienDichRepository;
    
    @Autowired
    private SanPhamRepository sanPhamRepository;
    
    @Autowired
    private MauSacRepository mauSacRepository;
    
    @Autowired
    private KichThuocRepository kichThuocRepository;
    
    public List<PhieuChiTietDangKy> getAllChiTiet() {
        return phieuChiTietDangKyRepository.findAll();
    }
    
    public Optional<PhieuChiTietDangKy> getChiTietById(Integer maChiTietDangKy) {
        return phieuChiTietDangKyRepository.findById(maChiTietDangKy);
    }
    
    public List<PhieuChiTietDangKy> getChiTietByDangKy(Integer maDangKy) {
        return phieuChiTietDangKyRepository.findByDangKyChienDich_MaDangKy(maDangKy);
    }
    
    public PhieuChiTietDangKy createChiTiet(PhieuChiTietDangKyRequest request) {
        // Validate đăng ký
        Optional<DangKyChienDich> dangKy = dangKyChienDichRepository.findById(request.getMaDangKy());
        if (!dangKy.isPresent()) {
            throw new RuntimeException("Đăng ký không tồn tại");
        }
        
        // Validate sản phẩm
        Optional<SanPham> sanPham = sanPhamRepository.findById(request.getMaSanPham());
        if (!sanPham.isPresent()) {
            throw new RuntimeException("Sản phẩm không tồn tại");
        }
        
        // Validate màu sắc
        Optional<MauSac> mauSac = mauSacRepository.findById(request.getMaMau());
        if (!mauSac.isPresent()) {
            throw new RuntimeException("Màu sắc không tồn tại");
        }
        
        // Validate kích thước
        Optional<KichThuoc> kichThuoc = kichThuocRepository.findById(request.getMaSize());
        if (!kichThuoc.isPresent()) {
            throw new RuntimeException("Kích thước không tồn tại");
        }
        
        // Validate số lượng
        if (request.getSoLuong() < 1) {
            throw new RuntimeException("Số lượng phải >= 1");
        }
        
        PhieuChiTietDangKy chiTiet = new PhieuChiTietDangKy();
        chiTiet.setDangKyChienDich(dangKy.get());
        chiTiet.setSanPham(sanPham.get());
        chiTiet.setMauSac(mauSac.get());
        chiTiet.setKichThuoc(kichThuoc.get());
        chiTiet.setSoLuong(request.getSoLuong());
        
        return phieuChiTietDangKyRepository.save(chiTiet);
    }
    
    public PhieuChiTietDangKy updateChiTiet(Integer maChiTietDangKy, PhieuChiTietDangKyRequest request) {
        Optional<PhieuChiTietDangKy> existing = phieuChiTietDangKyRepository.findById(maChiTietDangKy);
        if (existing.isPresent()) {
            PhieuChiTietDangKy chiTiet = existing.get();
            
            // Update màu sắc nếu có
            if (request.getMaMau() != null) {
                Optional<MauSac> mauSac = mauSacRepository.findById(request.getMaMau());
                if (mauSac.isPresent()) {
                    chiTiet.setMauSac(mauSac.get());
                }
            }
            
            // Update kích thước nếu có
            if (request.getMaSize() != null) {
                Optional<KichThuoc> kichThuoc = kichThuocRepository.findById(request.getMaSize());
                if (kichThuoc.isPresent()) {
                    chiTiet.setKichThuoc(kichThuoc.get());
                }
            }
            
            // Update số lượng
            if (request.getSoLuong() != null && request.getSoLuong() >= 1) {
                chiTiet.setSoLuong(request.getSoLuong());
            }
            
            return phieuChiTietDangKyRepository.save(chiTiet);
        }
        return null;
    }
    
    public boolean deleteChiTiet(Integer maChiTietDangKy) {
        if (phieuChiTietDangKyRepository.existsById(maChiTietDangKy)) {
            phieuChiTietDangKyRepository.deleteById(maChiTietDangKy);
            return true;
        }
        return false;
    }
}
