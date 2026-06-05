package com.exed.be.service;

import com.exed.be.dto.DanhGiaRequest;
import com.exed.be.model.DanhGia;
import com.exed.be.model.HinhAnhDanhGia;
import com.exed.be.repository.DanhGiaRepository;
import com.exed.be.repository.HinhAnhDanhGiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DanhGiaService {

    @Autowired
    private DanhGiaRepository danhGiaRepository;

    @Autowired
    private HinhAnhDanhGiaRepository hinhAnhDanhGiaRepository;

    @Autowired
    private com.exed.be.repository.DonHangRepository donHangRepository;

    @Transactional
    public DanhGia createDanhGia(DanhGiaRequest request) {
        // Check if review already exists for this order
        if (danhGiaRepository.existsByMaDonHang(request.getMaDonHang())) {
            throw new RuntimeException("Đơn hàng này đã được đánh giá");
        }

        // Create DanhGia
        DanhGia danhGia = new DanhGia();
        danhGia.setMaDonHang(request.getMaDonHang());
        danhGia.setDiemDanhGia(request.getDiemDanhGia());
        danhGia.setBinhLuan(request.getBinhLuan());
        danhGia.setNgayDanhGia(LocalDateTime.now());
        
        // Set anDanh: convert Boolean to Integer (true -> 1, false -> 0)
        if (request.getAnDanh() != null && request.getAnDanh()) {
            danhGia.setAnDanh(1);
        } else {
            danhGia.setAnDanh(0);
        }

        // Save DanhGia
        DanhGia savedDanhGia = danhGiaRepository.save(danhGia);

        // Create HinhAnhDanhGia if images provided
        if (request.getHinhAnhs() != null && !request.getHinhAnhs().isEmpty()) {
            List<HinhAnhDanhGia> hinhAnhs = new ArrayList<>();
            for (int i = 0; i < request.getHinhAnhs().size(); i++) {
                HinhAnhDanhGia hinhAnh = new HinhAnhDanhGia();
                hinhAnh.setMaDanhGia(savedDanhGia.getMaDanhGia());
                hinhAnh.setDuongDan(request.getHinhAnhs().get(i));
                hinhAnh.setThuTu(i + 1);
                hinhAnhs.add(hinhAnh);
            }
            hinhAnhDanhGiaRepository.saveAll(hinhAnhs);
            savedDanhGia.setHinhAnhDanhGias(hinhAnhs);
        }

        return savedDanhGia;
    }

    public List<DanhGia> getAllDanhGia() {
        return danhGiaRepository.findAllByOrderByNgayDanhGiaDesc();
    }

    public DanhGia getDanhGiaByMaDonHang(String maDonHang) {
        return danhGiaRepository.findByMaDonHang(maDonHang).orElse(null);
    }

    public boolean hasReviewed(String maDonHang) {
        return danhGiaRepository.existsByMaDonHang(maDonHang);
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getDanhGiaByMaChienDichDTO(String maChienDich) {
        List<DanhGia> list = danhGiaRepository.findByMaChienDich(maChienDich);
        List<java.util.Map<String, Object>> result = new ArrayList<>();
        for (DanhGia dg : list) {
            result.add(convertToDTOMap(dg));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getAllDanhGiaDTO() {
        List<DanhGia> list = danhGiaRepository.findAllByOrderByNgayDanhGiaDesc();
        List<java.util.Map<String, Object>> result = new ArrayList<>();
        for (DanhGia dg : list) {
            result.add(convertToDTOMap(dg));
        }
        return result;
    }

    private java.util.Map<String, Object> convertToDTOMap(DanhGia dg) {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        
        // Lấy tên reviewer (Ẩn danh hoặc Username)
        String reviewerName = "Khách hàng";
        if (dg.getAnDanh() != null && dg.getAnDanh() == 1) {
            reviewerName = "Người dùng ẩn danh";
        } else {
            Optional<com.exed.be.model.DonHang> dhOpt = donHangRepository.findById(dg.getMaDonHang());
            if (dhOpt.isPresent()) {
                com.exed.be.model.DonHang dh = dhOpt.get();
                if (dh.getDangKyChienDich() != null && dh.getDangKyChienDich().getNguoiDung() != null) {
                    reviewerName = dh.getDangKyChienDich().getNguoiDung().getTenDangNhap();
                }
            }
        }
        
        // Lấy tên chiến dịch, tên sản phẩm, giá chốt cuối và số lượng từ DonHang
        String campaignName = "Chiến dịch";
        String productName = "Sản phẩm";
        java.math.BigDecimal productPrice = java.math.BigDecimal.ZERO;
        int quantity = 1;
        
        Optional<com.exed.be.model.DonHang> dhOpt = donHangRepository.findById(dg.getMaDonHang());
        if (dhOpt.isPresent()) {
            com.exed.be.model.DonHang dh = dhOpt.get();
            productPrice = dh.getGiaChotCuoiCung() != null ? dh.getGiaChotCuoiCung() : java.math.BigDecimal.ZERO;
            
            if (dh.getDangKyChienDich() != null) {
                com.exed.be.model.DangKyChienDich dk = dh.getDangKyChienDich();
                quantity = dk.getTongSoLuong() != null ? dk.getTongSoLuong() : 1;
                
                if (dk.getChienDich() != null) {
                    com.exed.be.model.ChienDich cd = dk.getChienDich();
                    campaignName = cd.getTenChienDich() != null ? cd.getTenChienDich() : "Chiến dịch";
                    if (cd.getSanPham() != null) {
                        productName = cd.getSanPham().getTenSanPham() != null ? cd.getSanPham().getTenSanPham() : "Sản phẩm";
                    }
                }
            }
        }
        
        // Lấy danh sách ảnh
        List<String> images = new ArrayList<>();
        if (dg.getHinhAnhDanhGias() != null) {
            for (HinhAnhDanhGia img : dg.getHinhAnhDanhGias()) {
                String path = img.getDuongDan();
                if (path != null) {
                    if (path.contains("images/reviews/")) {
                        int order = img.getThuTu() != null ? img.getThuTu() : 1;
                        if (order == 1) path = "images/review1.jpg";
                        else if (order == 2) path = "images/review1.1.jpg";
                        else if (order == 3) path = "images/review2.png";
                        else if (order == 4) path = "images/review2.1.jpg";
                        else path = "images/review1.jpg";
                    }
                    
                    if (path.startsWith("uploads/")) {
                        path = "http://localhost:8080/" + path;
                    } else if (path.startsWith("/uploads/")) {
                        path = "http://localhost:8080" + path;
                    }
                    
                    if (!path.startsWith("http") && !path.startsWith("../")) {
                        path = "../" + path;
                    }
                    images.add(path);
                }
            }
        }
        
        String createdAt = dg.getNgayDanhGia() != null ? dg.getNgayDanhGia().toLocalDate().toString() : "";
        
        map.put("id", dg.getMaDanhGia());
        map.put("name", reviewerName);
        map.put("campaignName", campaignName);
        map.put("productName", productName);
        map.put("productPrice", productPrice);
        map.put("quantity", quantity);
        map.put("rating", dg.getDiemDanhGia());
        map.put("comment", dg.getBinhLuan());
        map.put("images", images);
        map.put("createdAt", createdAt);
        map.put("replies", new ArrayList<>()); // Trống cho replies mẫu
        
        return map;
    }
}
