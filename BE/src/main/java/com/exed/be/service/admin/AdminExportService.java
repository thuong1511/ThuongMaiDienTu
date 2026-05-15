package com.exed.be.service.admin;

import com.exed.be.dto.admin.AdminDashboardDTO;
import com.exed.be.dto.admin.DoanhThuThangDTO;
import com.exed.be.dto.admin.DonHangGanDayDTO;
import com.exed.be.dto.admin.TopChienDichDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Xuất báo cáo dashboard
 *  - Excel: CSV UTF-8 BOM (Excel mở native)
 *  - PDF:   HTML có style sẵn, FE mở tab mới rồi window.print() để lưu PDF
 */
@Service
public class AdminExportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Autowired
    private com.exed.be.repository.DangKyChienDichRepository dangKyChienDichRepository;

    // ────────────────────────────────────────────────────────────
    // EXCEL (CSV UTF-8 BOM)
    // ────────────────────────────────────────────────────────────
    public byte[] exportDashboardCsv() {
        AdminDashboardDTO ds = adminDashboardService.getDashboard();
        List<DoanhThuThangDTO> doanhThu = adminDashboardService.getDoanhThuTheoThang(12);
        List<TopChienDichDTO> topCD = adminDashboardService.getTopChienDich(10);
        List<DonHangGanDayDTO> donGanDay = adminDashboardService.getDonHangGanDay(20);

        StringBuilder sb = new StringBuilder();
        // BOM cho Excel hiểu UTF-8
        sb.append('\uFEFF');

        sb.append("BÁO CÁO DASHBOARD - EXED\n\n");

        sb.append("[1] CHỈ SỐ TỔNG QUAN\n");
        sb.append("Chỉ tiêu,Giá trị\n");
        sb.append("Doanh thu tháng này,").append(money(ds.getDoanhThuThangNay())).append("\n");
        sb.append("Doanh thu tháng trước,").append(money(ds.getDoanhThuThangTruoc())).append("\n");
        sb.append("% Tăng trưởng,").append(ds.getPhanTramDoanhThu()).append("%\n");
        sb.append("Tổng chiến dịch,").append(ds.getTongChienDich()).append("\n");
        sb.append("Chiến dịch thành công,").append(ds.getChienDichThanhCong()).append("\n");
        sb.append("Tỷ lệ chiến dịch,").append(ds.getTyLeChienDich()).append("%\n");
        sb.append("Tổng khách hàng,").append(ds.getTongKhachHang()).append("\n");
        sb.append("Khách hàng cược đúng,").append(ds.getKhachHangCuocDung()).append("\n");
        sb.append("Tỷ lệ khách hàng,").append(ds.getTyLeKhachHang()).append("%\n");
        sb.append("Tổng hoàn tiền,").append(money(ds.getTongHoanTien())).append("\n\n");

        sb.append("[2] DOANH THU 12 THÁNG GẦN NHẤT\n");
        sb.append("Tháng,Doanh thu (VNĐ),Số đơn\n");
        for (DoanhThuThangDTO d : doanhThu) {
            sb.append(d.getNhan()).append(",")
              .append(money(d.getDoanhThu())).append(",")
              .append(d.getSoDon()).append("\n");
        }
        sb.append("\n");

        sb.append("[3] TOP CHIẾN DỊCH DOANH THU CAO NHẤT\n");
        sb.append("Xếp hạng,Mã CD,Tên chiến dịch,Nghệ sĩ,Số lượng bán,Doanh thu\n");
        for (TopChienDichDTO t : topCD) {
            sb.append(t.getXepHang()).append(",")
              .append(escape(t.getMaChienDich())).append(",")
              .append(escape(t.getTenChienDich())).append(",")
              .append(escape(t.getTenNgheSi())).append(",")
              .append(t.getSoLuongBan()).append(",")
              .append(money(t.getDoanhThu())).append("\n");
        }
        sb.append("\n");

        sb.append("[4] ĐƠN HÀNG GẦN ĐÂY\n");
        sb.append("Mã đơn,Khách hàng,Chiến dịch,Số tiền,Ngày đăng ký,Trạng thái\n");
        for (DonHangGanDayDTO o : donGanDay) {
            sb.append("DK").append(o.getMaDangKy()).append(",")
              .append(escape(o.getTenKhachHang())).append(",")
              .append(escape(o.getTenChienDich())).append(",")
              .append(money(o.getSoTienThanhToan())).append(",")
              .append(o.getNgayDangKy() != null ? o.getNgayDangKy().format(DATE_FMT) : "—").append(",")
              .append(escape(o.getTrangThai())).append("\n");
        }

        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    // ────────────────────────────────────────────────────────────
    // PDF (HTML để FE in)
    // ────────────────────────────────────────────────────────────
    public String exportDashboardHtml() {
        AdminDashboardDTO ds = adminDashboardService.getDashboard();
        List<DoanhThuThangDTO> doanhThu = adminDashboardService.getDoanhThuTheoThang(12);
        List<TopChienDichDTO> topCD = adminDashboardService.getTopChienDich(10);
        List<DonHangGanDayDTO> donGanDay = adminDashboardService.getDonHangGanDay(20);

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html lang='vi'><head><meta charset='UTF-8'>");
        sb.append("<title>Báo cáo Dashboard - EXED</title>");
        sb.append("<style>")
          .append("body{font-family:Arial,sans-serif;padding:30px;color:#222;}")
          .append("h1{color:#222;border-bottom:3px solid #c8a96a;padding-bottom:8px;}")
          .append("h2{color:#c8a96a;margin-top:30px;}")
          .append("table{width:100%;border-collapse:collapse;margin-bottom:20px;}")
          .append("th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;font-size:13px;}")
          .append("th{background:#f3eddd;color:#222;}")
          .append("tr:nth-child(even){background:#fafafa;}")
          .append(".stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;}")
          .append(".stat{border:1px solid #ddd;padding:14px;border-radius:6px;background:#fff;}")
          .append(".stat .label{font-size:12px;color:#888;text-transform:uppercase;}")
          .append(".stat .value{font-size:20px;font-weight:700;color:#c8a96a;margin-top:4px;}")
          .append(".meta{color:#666;font-size:12px;margin-bottom:20px;}")
          .append("@media print{body{padding:0;}.no-print{display:none;}}")
          .append("</style></head><body>");

        sb.append("<button class='no-print' onclick='window.print()' style='float:right;padding:8px 16px;background:#c8a96a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;'>In / Lưu PDF</button>");
        sb.append("<h1>Báo cáo Dashboard - EXED</h1>");
        sb.append("<p class='meta'>Xuất ngày: ").append(java.time.LocalDateTime.now().format(DATE_FMT)).append("</p>");

        // Section 1: Stats
        sb.append("<h2>1. Chỉ số tổng quan</h2>");
        sb.append("<div class='stat-grid'>");
        sb.append(stat("Doanh thu tháng này", money(ds.getDoanhThuThangNay()) + " đ"));
        sb.append(stat("Tăng trưởng so với tháng trước", ds.getPhanTramDoanhThu() + " %"));
        sb.append(stat("Chiến dịch thành công", ds.getChienDichThanhCong() + " / " + ds.getTongChienDich()
                        + " (" + ds.getTyLeChienDich() + "%)"));
        sb.append(stat("Khách hàng cược đúng", ds.getKhachHangCuocDung() + " / " + ds.getTongKhachHang()
                        + " (" + ds.getTyLeKhachHang() + "%)"));
        sb.append(stat("Tổng hoàn tiền tháng này", money(ds.getTongHoanTien()) + " đ"));
        sb.append("</div>");

        // Section 2: Doanh thu theo tháng
        sb.append("<h2>2. Doanh thu 12 tháng gần nhất</h2>");
        sb.append("<table><thead><tr><th>Tháng</th><th>Doanh thu (VNĐ)</th><th>Số đơn</th></tr></thead><tbody>");
        for (DoanhThuThangDTO d : doanhThu) {
            sb.append("<tr><td>").append(d.getNhan()).append("</td><td>")
              .append(money(d.getDoanhThu())).append("</td><td>")
              .append(d.getSoDon()).append("</td></tr>");
        }
        sb.append("</tbody></table>");

        // Section 3: Top chiến dịch
        sb.append("<h2>3. Top chiến dịch doanh thu cao nhất</h2>");
        sb.append("<table><thead><tr><th>#</th><th>Mã CD</th><th>Tên chiến dịch</th><th>Nghệ sĩ</th><th>SL bán</th><th>Doanh thu</th></tr></thead><tbody>");
        for (TopChienDichDTO t : topCD) {
            sb.append("<tr><td>").append(t.getXepHang()).append("</td><td>")
              .append(safe(t.getMaChienDich())).append("</td><td>")
              .append(safe(t.getTenChienDich())).append("</td><td>")
              .append(safe(t.getTenNgheSi())).append("</td><td>")
              .append(t.getSoLuongBan()).append("</td><td>")
              .append(money(t.getDoanhThu())).append("</td></tr>");
        }
        sb.append("</tbody></table>");

        // Section 4: Đơn gần đây
        sb.append("<h2>4. Đơn hàng gần đây</h2>");
        sb.append("<table><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Chiến dịch</th><th>Số tiền</th><th>Ngày đăng ký</th><th>Trạng thái</th></tr></thead><tbody>");
        for (DonHangGanDayDTO o : donGanDay) {
            sb.append("<tr><td>DK").append(o.getMaDangKy()).append("</td><td>")
              .append(safe(o.getTenKhachHang())).append("</td><td>")
              .append(safe(o.getTenChienDich())).append("</td><td>")
              .append(money(o.getSoTienThanhToan())).append("</td><td>")
              .append(o.getNgayDangKy() != null ? o.getNgayDangKy().format(DATE_FMT) : "—").append("</td><td>")
              .append(safe(o.getTrangThai())).append("</td></tr>");
        }
        sb.append("</tbody></table>");

        sb.append("</body></html>");
        return sb.toString();
    }

    private String stat(String label, String value) {
        return "<div class='stat'><div class='label'>" + safe(label)
                + "</div><div class='value'>" + safe(value) + "</div></div>";
    }

    private String money(BigDecimal n) {
        if (n == null) return "0";
        return String.format("%,.0f", n.doubleValue()).replace(',', '.');
    }

    private String safe(String s) {
        if (s == null) return "—";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    /** Escape giá trị CSV: nếu chứa "," hoặc dấu nháy kép hoặc xuống dòng, bao trong "..." */
    private String escape(String s) {
        if (s == null) return "";
        boolean needQuote = s.contains(",") || s.contains("\"") || s.contains("\n");
        String v = s.replace("\"", "\"\"");
        return needQuote ? "\"" + v + "\"" : v;
    }

    // ────────────────────────────────────────────────────────────
    // XUẤT DANH SÁCH ĐƠN HÀNG (CSV)
    // ────────────────────────────────────────────────────────────
    public byte[] exportDonHangCsv() {
        var list = dangKyChienDichRepository.findAll();
        list.sort((a, b) -> {
            var x = a.getNgayDangKy(); var y = b.getNgayDangKy();
            if (x == null && y == null) return 0;
            if (x == null) return 1;
            if (y == null) return -1;
            return y.compareTo(x);
        });

        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF');
        sb.append("DANH SÁCH ĐƠN HÀNG - EXED\n\n");
        sb.append("Mã đơn,Khách hàng,Chiến dịch,Mốc cược,Số lượng,Số tiền,Trạng thái,Ngày đặt\n");
        for (var dk : list) {
            String tenKH = dk.getNguoiDung() != null ? dk.getNguoiDung().getTenDangNhap() : "";
            String tenCD = dk.getChienDich() != null ? dk.getChienDich().getTenChienDich() : "";
            String moc = "";
            if (dk.getBangGiaBacThang() != null) {
                moc = dk.getBangGiaBacThang().getSoLuongToiThieu()
                        + "-" + dk.getBangGiaBacThang().getSoLuongToiDa();
            }
            BigDecimal soTien = (dk.getThanhToan() != null && dk.getThanhToan().getSoTienThanhToan() != null)
                    ? dk.getThanhToan().getSoTienThanhToan() : BigDecimal.ZERO;
            String tt = Boolean.TRUE.equals(dk.getDaHuy())
                    ? (Boolean.TRUE.equals(dk.getTrangThaiHoanTien()) ? "Đã hoàn tiền" : "Đã hủy")
                    : "Đang xử lý";

            sb.append("DK").append(dk.getMaDangKy()).append(",")
              .append(escape(tenKH)).append(",")
              .append(escape(tenCD)).append(",")
              .append(moc).append(",")
              .append(dk.getTongSoLuong() != null ? dk.getTongSoLuong() : 0).append(",")
              .append(money(soTien)).append(",")
              .append(escape(tt)).append(",")
              .append(dk.getNgayDangKy() != null ? dk.getNgayDangKy().format(DATE_FMT) : "").append("\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
