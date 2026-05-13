package com.exed.be.service.admin;

import com.exed.be.model.SanPham;
import com.exed.be.repository.DanhMucRepository;
import com.exed.be.repository.SanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminSanPhamService {

    @Autowired
    private SanPhamRepository sanPhamRepository;

    @Autowired
    private DanhMucRepository danhMucRepository;

    public List<SanPham> getAllSanPham() {
        return sanPhamRepository.findAll();
    }

    public Optional<SanPham> getSanPhamById(String maSanPham) {
        return sanPhamRepository.findById(maSanPham);
    }

    public List<SanPham> getSanPhamByDanhMuc(String maDanhMuc) {
        return sanPhamRepository.findByDanhMuc_MaDanhMuc(maDanhMuc);
    }

    @Transactional
    public SanPham createSanPham(SanPham sanPham) {
        if (sanPhamRepository.existsById(sanPham.getMaSanPham())) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + sanPham.getMaSanPham());
        }
        if (!danhMucRepository.existsById(sanPham.getMaDanhMuc())) {
            throw new RuntimeException("Danh mục không tồn tại: " + sanPham.getMaDanhMuc());
        }
        return sanPhamRepository.save(sanPham);
    }

    @Transactional
    public SanPham updateSanPham(String maSanPham, SanPham request) {
        SanPham sp = sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + maSanPham));
        if (request.getTenSanPham() != null) sp.setTenSanPham(request.getTenSanPham());
        if (request.getMoTa() != null) sp.setMoTa(request.getMoTa());
        if (request.getMaDanhMuc() != null) {
            if (!danhMucRepository.existsById(request.getMaDanhMuc())) {
                throw new RuntimeException("Danh mục không tồn tại: " + request.getMaDanhMuc());
            }
            sp.setMaDanhMuc(request.getMaDanhMuc());
        }
        return sanPhamRepository.save(sp);
    }

    @Transactional
    public boolean deleteSanPham(String maSanPham) {
        if (!sanPhamRepository.existsById(maSanPham)) return false;
        sanPhamRepository.deleteById(maSanPham);
        return true;
    }
}
