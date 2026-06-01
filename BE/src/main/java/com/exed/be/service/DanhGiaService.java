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
            
            // Lấy danh sách ảnh
            List<String> images = new ArrayList<>();
            if (dg.getHinhAnhDanhGias() != null) {
                for (HinhAnhDanhGia img : dg.getHinhAnhDanhGias()) {
                    // Trả về đường dẫn khớp tương đối với frontend (ví dụ: ../images/...)
                    String path = img.getDuongDan();
                    if (path != null) {
                        // Nếu là đường dẫn ảo reviews không tồn tại, thay thế bằng ảnh hợp lệ
                        if (path.contains("images/reviews/")) {
                            int order = img.getThuTu() != null ? img.getThuTu() : 1;
                            if (order == 1) path = "images/review1.jpg";
                            else if (order == 2) path = "images/review1.1.jpg";
                            else if (order == 3) path = "images/review2.png";
                            else if (order == 4) path = "images/review2.1.jpg";
                            else path = "images/review1.jpg";
                        }
                        
                        // Nếu là ảnh thật được upload bởi khách hàng lên thư mục uploads
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
            map.put("rating", dg.getDiemDanhGia());
            map.put("comment", dg.getBinhLuan());
            map.put("images", images);
            map.put("createdAt", createdAt);
            map.put("replies", new ArrayList<>()); // Trống cho replies mẫu
            
            result.add(map);
        }
        return result;
    }
}
