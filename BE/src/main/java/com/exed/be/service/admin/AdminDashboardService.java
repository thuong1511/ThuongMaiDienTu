package com.exed.be.service.admin;

import com.exed.be.dto.admin.AdminDashboardDTO;
import com.exed.be.dto.admin.DoanhThuThangDTO;
import com.exed.be.dto.admin.DonHangGanDayDTO;
import com.exed.be.dto.admin.TopChienDichDTO;
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
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    /**
     * Doanh thu theo tháng (mặc định 12 tháng gần nhất)
     */
    public List<DoanhThuThangDTO> getDoanhThuTheoThang(int soThang) {
        if (soThang <= 0 || soThang > 36) soThang = 12;

        LocalDateTime now = LocalDateTime.now();
        YearMonth thangHienTai = YearMonth.from(now);

        // Khởi tạo map các tháng trong khoảng (kể cả tháng không có dữ liệu)
        Map<YearMonth, BigDecimal> doanhThuMap = new HashMap<>();
        Map<YearMonth, Integer> soDonMap = new HashMap<>();
        for (int i = soThang - 1; i >= 0; i--) {
            YearMonth ym = thangHienTai.minusMonths(i);
            doanhThuMap.put(ym, BigDecimal.ZERO);
            soDonMap.put(ym, 0);
        }

        // Mốc thời gian sớm nhất
        YearMonth mocSomNhat = thangHienTai.minusMonths(soThang - 1L);
        LocalDateTime mocBatDau = mocSomNhat.atDay(1).atStartOfDay();

        List<DangKyChienDich> allDangKy = dangKyChienDichRepository.findAll();
        for (DangKyChienDich dk : allDangKy) {
            if (dk.getDaHuy()) continue;
            ThanhToan tt = dk.getThanhToan();
            if (tt == null || tt.getNgayThanhToan() == null) continue;
            LocalDateTime ngay = tt.getNgayThanhToan();
            if (ngay.isBefore(mocBatDau)) continue;

            YearMonth ym = YearMonth.from(ngay);
            if (!doanhThuMap.containsKey(ym)) continue;

            doanhThuMap.put(ym, doanhThuMap.get(ym).add(tt.getSoTienThanhToan()));
            soDonMap.put(ym, soDonMap.get(ym) + 1);
        }

        // Build list theo thứ tự tháng tăng dần
        List<DoanhThuThangDTO> result = new ArrayList<>();
        for (int i = soThang - 1; i >= 0; i--) {
            YearMonth ym = thangHienTai.minusMonths(i);
            result.add(new DoanhThuThangDTO(
                    ym.getMonthValue(), ym.getYear(),
                    doanhThuMap.get(ym),
                    soDonMap.get(ym)
            ));
        }
        return result;
    }

    /**
     * Top chiến dịch theo doanh thu cao nhất
     */
    public List<TopChienDichDTO> getTopChienDich(int limit) {
        if (limit <= 0 || limit > 50) limit = 5;

        List<ChienDich> allCD = chienDichRepository.findAll();
        List<DangKyChienDich> allDangKy = dangKyChienDichRepository.findAll();

        // Tính doanh thu + số lượng bán cho từng chiến dịch
        Map<String, BigDecimal> doanhThuMap = new HashMap<>();
        Map<String, Integer> soLuongMap = new HashMap<>();

        for (DangKyChienDich dk : allDangKy) {
            if (dk.getDaHuy()) continue;
            if (dk.getChienDich() == null) continue;
            String maCD = dk.getChienDich().getMaChienDich();

            BigDecimal soTien = dk.getThanhToan() != null
                    ? dk.getThanhToan().getSoTienThanhToan()
                    : BigDecimal.ZERO;

            doanhThuMap.merge(maCD, soTien, BigDecimal::add);
            soLuongMap.merge(maCD, dk.getTongSoLuong() != null ? dk.getTongSoLuong() : 0, Integer::sum);
        }

        // Build và sort
        List<TopChienDichDTO> all = new ArrayList<>();
        for (ChienDich cd : allCD) {
            BigDecimal dt = doanhThuMap.getOrDefault(cd.getMaChienDich(), BigDecimal.ZERO);
            int sl = soLuongMap.getOrDefault(cd.getMaChienDich(), 0);
            if (dt.compareTo(BigDecimal.ZERO) <= 0 && sl <= 0) continue;

            String tenNS = cd.getNgheSi() != null ? cd.getNgheSi().getTenNgheSi() : cd.getMaNgheSi();
            all.add(new TopChienDichDTO(0, cd.getMaChienDich(), cd.getTenChienDich(), tenNS, sl, dt));
        }

        all.sort(Comparator.comparing(TopChienDichDTO::getDoanhThu).reversed());

        List<TopChienDichDTO> result = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, all.size()); i++) {
            TopChienDichDTO row = all.get(i);
            row.setXepHang(i + 1);
            result.add(row);
        }
        return result;
    }

    /**
     * Đơn hàng gần đây (sort theo ngày đăng ký mới nhất)
     */
    public List<DonHangGanDayDTO> getDonHangGanDay(int limit) {
        if (limit <= 0 || limit > 100) limit = 10;

        List<DangKyChienDich> all = dangKyChienDichRepository.findAll();
        all.sort(Comparator.comparing(
                DangKyChienDich::getNgayDangKy,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));

        List<DonHangGanDayDTO> result = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, all.size()); i++) {
            DangKyChienDich dk = all.get(i);
            String tenKH = dk.getNguoiDung() != null
                    ? dk.getNguoiDung().getTenDangNhap()
                    : "—";
            String tenCD = dk.getChienDich() != null ? dk.getChienDich().getTenChienDich() : "—";
            BigDecimal soTien = dk.getThanhToan() != null
                    ? dk.getThanhToan().getSoTienThanhToan()
                    : BigDecimal.ZERO;

            String trangThai;
            if (dk.getDaHuy()) {
                trangThai = dk.getTrangThaiHoanTien() ? "Đã hoàn tiền" : "Đã hủy";
            } else {
                trangThai = "Đang xử lý";
            }

            result.add(new DonHangGanDayDTO(
                    dk.getMaDangKy(), tenKH, tenCD, soTien, dk.getNgayDangKy(), trangThai
            ));
        }
        return result;
    }
}
