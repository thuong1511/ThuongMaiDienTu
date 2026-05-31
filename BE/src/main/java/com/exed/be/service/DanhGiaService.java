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

@Service
public class DanhGiaService {

    @Autowired
    private DanhGiaRepository danhGiaRepository;

    @Autowired
    private HinhAnhDanhGiaRepository hinhAnhDanhGiaRepository;

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
}
