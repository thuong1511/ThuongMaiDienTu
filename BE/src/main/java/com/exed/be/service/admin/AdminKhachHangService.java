package com.exed.be.service.admin;

import com.exed.be.dto.admin.KhachHangUpdateRequest;
import com.exed.be.model.DangKyChienDich;
import com.exed.be.model.NguoiDung;
import com.exed.be.repository.DangKyChienDichRepository;
import com.exed.be.repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminKhachHangService {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private DangKyChienDichRepository dangKyChienDichRepository;

    public List<NguoiDung> getAllKhachHang() {
        return nguoiDungRepository.findAll();
    }

    public List<NguoiDung> getKhachHangByVaiTro(String vaiTro) {
        return nguoiDungRepository.findByVaiTro(vaiTro);
    }

    public Optional<NguoiDung> getKhachHangById(String maNguoiDung) {
        return nguoiDungRepository.findById(maNguoiDung);
    }

    public List<DangKyChienDich> getLichSuDangKy(String maNguoiDung) {
        return dangKyChienDichRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
    }

    @Transactional
    public NguoiDung updateKhachHang(String maNguoiDung, KhachHangUpdateRequest request) {
        NguoiDung nd = nguoiDungRepository.findById(maNguoiDung)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại: " + maNguoiDung));

        if (request.getEmail() != null && !request.getEmail().equals(nd.getEmail())) {
            if (nguoiDungRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email đã được sử dụng");
            }
            nd.setEmail(request.getEmail());
        }
        if (request.getSoDienThoai() != null && !request.getSoDienThoai().equals(nd.getSoDienThoai())) {
            if (nguoiDungRepository.existsBySoDienThoai(request.getSoDienThoai())) {
                throw new RuntimeException("Số điện thoại đã được sử dụng");
            }
            nd.setSoDienThoai(request.getSoDienThoai());
        }
        if (request.getGioiTinh() != null) nd.setGioiTinh(request.getGioiTinh());
        if (request.getTrangThai() != null) nd.setTrangThai(request.getTrangThai());
        if (request.getVaiTro() != null) nd.setVaiTro(request.getVaiTro());

        return nguoiDungRepository.save(nd);
    }

    /**
     * Khóa / mở khóa tài khoản
     */
    @Transactional
    public NguoiDung toggleTrangThai(String maNguoiDung) {
        NguoiDung nd = nguoiDungRepository.findById(maNguoiDung)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        nd.setTrangThai("Hoạt động".equals(nd.getTrangThai()) ? "Bị khóa" : "Hoạt động");
        return nguoiDungRepository.save(nd);
    }
}
