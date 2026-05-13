package com.exed.be.service.admin;

import com.exed.be.dto.admin.AdminDashboardDTO;
import com.exed.be.model.ChienDich;
import com.exed.be.model.DangKyChienDich;
import com.exed.be.model.NguoiDung;
import com.exed.be.model.ThanhToan;
import com.exed.be.repository.ChienDichRepository;
import com.exed.be.repository.DangKyChienDichRepository;
import com.exed.be.repository.NguoiDungRepository;
import com.exed.be.repository.ThanhToanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminDashboardService {

    @Autowired
    private ThanhToanRepository thanhToanRepository;

    @Autowired
    private ChienDichRepository chienDichRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private DangKyChienDichRepository dangKyChienDichRepository;

    public AdminDashboardDTO getDashboard() {
        AdminDashboardDTO dto = new AdminDashboardDTO();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        // Doanh thu tháng này: tổng tiền các thanh toán trong tháng (đơn không bị hủy)
        List<ThanhToan> allThanhToan = thanhToanRepository.findAll();
        List<DangKyChienDich> allDangKy = dangKyChienDichRepository.findAll();

        BigDecimal doanhThuThangNay = BigDecimal.ZERO;
        BigDecimal doanhThuThangTruoc = BigDecimal.ZERO;
        BigDecimal tongHoanTien = BigDecimal.ZERO;

        for (DangKyChienDich dk : allDangKy) {
            if (dk.getThanhToan() == null) continue;
            ThanhToan tt = dk.getThanhToan();
            LocalDateTime ngay = tt.getNgayThanhToan();
            if (ngay == null) continue;

            if (!dk.getDaHuy()) {
                if (!ngay.isBefore(startOfMonth)) {
                    doanhThuThangNay = doanhThuThangNay.add(tt.getSoTienThanhToan());
                } else if (!ngay.isBefore(startOfLastMonth) && !ngay.isAfter(endOfLastMonth)) {
                    doanhThuThangTruoc = doanhThuThangTruoc.add(tt.getSoTienThanhToan());
                }
            }

            // Hoàn tiền: đơn bị hủy trong tháng này
            if (dk.getDaHuy() && dk.getTrangThaiHoanTien() && !ngay.isBefore(startOfMonth)) {
                tongHoanTien = tongHoanTien.add(tt.getSoTienThanhToan());
            }
        }

        dto.setDoanhThuThangNay(doanhThuThangNay);
        dto.setDoanhThuThangTruoc(doanhThuThangTruoc);

        // % tăng trưởng doanh thu
        if (doanhThuThangTruoc.compareTo(BigDecimal.ZERO) > 0) {
            double pct = doanhThuThangNay.subtract(doanhThuThangTruoc)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(doanhThuThangTruoc, 1, RoundingMode.HALF_UP)
                    .doubleValue();
            dto.setPhanTramDoanhThu(pct);
        } else {
            dto.setPhanTramDoanhThu(0.0);
        }

        // Chiến dịch
        List<ChienDich> allChienDich = chienDichRepository.findAll();
        int tongCD = allChienDich.size();
        long cdThanhCong = allChienDich.stream()
                .filter(cd -> "Đã kết thúc".equals(cd.getThoiDiem()) || "Thành công".equals(cd.getTrangThai()))
                .count();
        dto.setTongChienDich(tongCD);
        dto.setChienDichThanhCong((int) cdThanhCong);
        dto.setTyLeChienDich(tongCD > 0
                ? Math.round(cdThanhCong * 1000.0 / tongCD) / 10.0
                : 0.0);

        // Khách hàng
        List<NguoiDung> allKhachHang = nguoiDungRepository.findByVaiTro("Khách hàng");
        int tongKH = allKhachHang.size();
        // Khách hàng "cược đúng": đã đăng ký ít nhất 1 chiến dịch và không hủy
        long khCuocDung = allDangKy.stream()
                .filter(dk -> !dk.getDaHuy())
                .map(dk -> dk.getNguoiDung().getMaNguoiDung())
                .distinct()
                .count();
        dto.setTongKhachHang(tongKH);
        dto.setKhachHangCuocDung((int) khCuocDung);
        dto.setTyLeKhachHang(tongKH > 0
                ? Math.round(khCuocDung * 1000.0 / tongKH) / 10.0
                : 0.0);

        dto.setTongHoanTien(tongHoanTien);

        return dto;
    }
}
