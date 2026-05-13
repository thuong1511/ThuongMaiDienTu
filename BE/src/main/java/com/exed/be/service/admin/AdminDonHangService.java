package com.exed.be.service.admin;

import com.exed.be.model.DangKyChienDich;
import com.exed.be.model.PhieuChiTietDangKy;
import com.exed.be.model.ThanhToan;
import com.exed.be.repository.DangKyChienDichRepository;
import com.exed.be.repository.PhieuChiTietDangKyRepository;
import com.exed.be.repository.ThanhToanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminDonHangService {

    @Autowired
    private DangKyChienDichRepository dangKyChienDichRepository;

    @Autowired
    private PhieuChiTietDangKyRepository phieuChiTietDangKyRepository;

    @Autowired
    private ThanhToanRepository thanhToanRepository;

    public List<DangKyChienDich> getAllDonHang() {
        return dangKyChienDichRepository.findAll();
    }

    public Optional<DangKyChienDich> getDonHangById(Integer maDangKy) {
        return dangKyChienDichRepository.findById(maDangKy);
    }

    public List<DangKyChienDich> getDonHangByKhachHang(String maNguoiDung) {
        return dangKyChienDichRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
    }

    public List<DangKyChienDich> getDonHangByChienDich(String maChienDich) {
        return dangKyChienDichRepository.findByChienDich_MaChienDich(maChienDich);
    }

    public List<PhieuChiTietDangKy> getChiTietDonHang(Integer maDangKy) {
        return phieuChiTietDangKyRepository.findByDangKyChienDich_MaDangKy(maDangKy);
    }

    /**
     * Admin hủy đơn hàng (đặt daHuy = true)
     */
    @Transactional
    public DangKyChienDich huyDonHang(Integer maDangKy) {
        DangKyChienDich dk = dangKyChienDichRepository.findById(maDangKy)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + maDangKy));
        if (dk.getDaHuy()) {
            throw new RuntimeException("Đơn hàng đã bị hủy trước đó");
        }
        dk.setDaHuy(true);
        return dangKyChienDichRepository.save(dk);
    }

    /**
     * Admin xác nhận hoàn tiền
     */
    @Transactional
    public DangKyChienDich xacNhanHoanTien(Integer maDangKy) {
        DangKyChienDich dk = dangKyChienDichRepository.findById(maDangKy)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + maDangKy));
        if (!dk.getDaHuy()) {
            throw new RuntimeException("Chỉ hoàn tiền cho đơn đã hủy");
        }
        dk.setTrangThaiHoanTien(true);
        return dangKyChienDichRepository.save(dk);
    }

    /**
     * Thống kê đơn hàng theo chiến dịch
     */
    public java.util.Map<String, Object> thongKeDonHangChienDich(String maChienDich) {
        List<DangKyChienDich> danhSach = dangKyChienDichRepository.findByChienDich_MaChienDich(maChienDich);
        long tongDon = danhSach.size();
        long donHuy = danhSach.stream().filter(DangKyChienDich::getDaHuy).count();
        long donHopLe = tongDon - donHuy;
        int tongSoLuong = danhSach.stream()
                .filter(dk -> !dk.getDaHuy())
                .mapToInt(DangKyChienDich::getTongSoLuong)
                .sum();
        java.math.BigDecimal tongTien = danhSach.stream()
                .filter(dk -> !dk.getDaHuy() && dk.getThanhToan() != null)
                .map(dk -> dk.getThanhToan().getSoTienThanhToan())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("maChienDich", maChienDich);
        result.put("tongDon", tongDon);
        result.put("donHuy", donHuy);
        result.put("donHopLe", donHopLe);
        result.put("tongSoLuong", tongSoLuong);
        result.put("tongTien", tongTien);
        return result;
    }
}
