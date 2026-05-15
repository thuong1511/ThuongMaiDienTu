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

    @Autowired
    private com.exed.be.repository.SoDiaChiRepository soDiaChiRepository;

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

    /**
     * Thống kê tổng hợp 1 khách hàng (cho trang admin-customer-detail)
     */
    public com.exed.be.dto.admin.KhachHangThongKeDTO getThongKe(String maNguoiDung) {
        if (!nguoiDungRepository.existsById(maNguoiDung)) {
            throw new RuntimeException("Người dùng không tồn tại: " + maNguoiDung);
        }

        var dto = new com.exed.be.dto.admin.KhachHangThongKeDTO();
        var list = dangKyChienDichRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);

        java.time.LocalDateTime startOfMonth = java.time.LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        int tongDon = list.size(), donHuy = 0, donHopLe = 0, donThangNay = 0;
        java.math.BigDecimal tongChiTieu = java.math.BigDecimal.ZERO;
        java.math.BigDecimal tongHoanTien = java.math.BigDecimal.ZERO;

        for (var dk : list) {
            boolean huy = Boolean.TRUE.equals(dk.getDaHuy());
            java.math.BigDecimal soTien = (dk.getThanhToan() != null && dk.getThanhToan().getSoTienThanhToan() != null)
                    ? dk.getThanhToan().getSoTienThanhToan() : java.math.BigDecimal.ZERO;

            if (huy) {
                donHuy++;
                if (Boolean.TRUE.equals(dk.getTrangThaiHoanTien())) {
                    tongHoanTien = tongHoanTien.add(soTien);
                }
            } else {
                donHopLe++;
                tongChiTieu = tongChiTieu.add(soTien);
            }

            if (dk.getNgayDangKy() != null && !dk.getNgayDangKy().isBefore(startOfMonth)) {
                donThangNay++;
            }
        }

        dto.setTongDon(tongDon);
        dto.setDonHopLe(donHopLe);
        dto.setDonHuy(donHuy);
        dto.setDonThangNay(donThangNay);
        dto.setTongChiTieu(tongChiTieu);
        dto.setTongHoanTien(tongHoanTien);
        dto.setTyLeCuocDung(tongDon > 0
                ? Math.round(donHopLe * 1000.0 / tongDon) / 10.0 : 0.0);
        return dto;
    }

    /**
     * Danh sách địa chỉ giao hàng của khách
     */
    public List<com.exed.be.model.SoDiaChi> getDiaChi(String maNguoiDung) {
        if (!nguoiDungRepository.existsById(maNguoiDung)) {
            throw new RuntimeException("Người dùng không tồn tại: " + maNguoiDung);
        }
        return soDiaChiRepository.findByMaNguoiDung(maNguoiDung);
    }
}
