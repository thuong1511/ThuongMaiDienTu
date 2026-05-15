package com.exed.be.dto.admin;

import java.math.BigDecimal;
import java.util.List;

/**
 * Thống kê chi tiết của 1 chiến dịch (cho trang admin-campaign-detail)
 */
public class ChienDichThongKeDTO {

    // Thông tin tổng quan
    private Integer tongNguoiThamGia;        // số khách hàng đăng ký (không tính đơn hủy)
    private Integer tongSoLuong;             // tổng số lượng đã đặt
    private Integer nguongMOQ;
    private Integer nguongToiDa;
    private Double  tienDoPhanTram;          // tongSoLuong / nguongToiDa * 100

    private BigDecimal doanhThu;             // tổng tiền các thanh toán hợp lệ
    private BigDecimal giaTriTrungBinh;      // doanhThu / tongDonHopLe
    private Integer tongDon;
    private Integer donHopLe;
    private Integer donHuy;
    private Double  tyLeChuyenDoi;           // donHopLe / tongDon * 100

    // Thời gian còn lại
    private Long thoiGianConLaiSeconds;      // có thể âm nếu đã kết thúc
    private String thoiGianConLaiNhan;       // "3 ngày 14 giờ" / "Đã kết thúc"

    // Thống kê theo mốc cược (BangGiaBacThang)
    private List<MocCuocItem> thongKeMocCuoc;

    // Thống kê theo màu (PhieuChiTietDangKy)
    private List<VariantItem> thongKeMau;

    // Thống kê theo size
    private List<VariantItem> thongKeSize;

    // Getters & Setters
    public Integer getTongNguoiThamGia() { return tongNguoiThamGia; }
    public void setTongNguoiThamGia(Integer tongNguoiThamGia) { this.tongNguoiThamGia = tongNguoiThamGia; }

    public Integer getTongSoLuong() { return tongSoLuong; }
    public void setTongSoLuong(Integer tongSoLuong) { this.tongSoLuong = tongSoLuong; }

    public Integer getNguongMOQ() { return nguongMOQ; }
    public void setNguongMOQ(Integer nguongMOQ) { this.nguongMOQ = nguongMOQ; }

    public Integer getNguongToiDa() { return nguongToiDa; }
    public void setNguongToiDa(Integer nguongToiDa) { this.nguongToiDa = nguongToiDa; }

    public Double getTienDoPhanTram() { return tienDoPhanTram; }
    public void setTienDoPhanTram(Double tienDoPhanTram) { this.tienDoPhanTram = tienDoPhanTram; }

    public BigDecimal getDoanhThu() { return doanhThu; }
    public void setDoanhThu(BigDecimal doanhThu) { this.doanhThu = doanhThu; }

    public BigDecimal getGiaTriTrungBinh() { return giaTriTrungBinh; }
    public void setGiaTriTrungBinh(BigDecimal giaTriTrungBinh) { this.giaTriTrungBinh = giaTriTrungBinh; }

    public Integer getTongDon() { return tongDon; }
    public void setTongDon(Integer tongDon) { this.tongDon = tongDon; }

    public Integer getDonHopLe() { return donHopLe; }
    public void setDonHopLe(Integer donHopLe) { this.donHopLe = donHopLe; }

    public Integer getDonHuy() { return donHuy; }
    public void setDonHuy(Integer donHuy) { this.donHuy = donHuy; }

    public Double getTyLeChuyenDoi() { return tyLeChuyenDoi; }
    public void setTyLeChuyenDoi(Double tyLeChuyenDoi) { this.tyLeChuyenDoi = tyLeChuyenDoi; }

    public Long getThoiGianConLaiSeconds() { return thoiGianConLaiSeconds; }
    public void setThoiGianConLaiSeconds(Long thoiGianConLaiSeconds) { this.thoiGianConLaiSeconds = thoiGianConLaiSeconds; }

    public String getThoiGianConLaiNhan() { return thoiGianConLaiNhan; }
    public void setThoiGianConLaiNhan(String thoiGianConLaiNhan) { this.thoiGianConLaiNhan = thoiGianConLaiNhan; }

    public List<MocCuocItem> getThongKeMocCuoc() { return thongKeMocCuoc; }
    public void setThongKeMocCuoc(List<MocCuocItem> thongKeMocCuoc) { this.thongKeMocCuoc = thongKeMocCuoc; }

    public List<VariantItem> getThongKeMau() { return thongKeMau; }
    public void setThongKeMau(List<VariantItem> thongKeMau) { this.thongKeMau = thongKeMau; }

    public List<VariantItem> getThongKeSize() { return thongKeSize; }
    public void setThongKeSize(List<VariantItem> thongKeSize) { this.thongKeSize = thongKeSize; }

    // ── Inner DTOs ──────────────────────────────────────────────
    public static class MocCuocItem {
        private Integer maMucGia;
        private Integer soLuongToiThieu;
        private Integer soLuongToiDa;
        private BigDecimal donGia;
        private Integer soNguoiChon;        // số đăng ký rơi vào mốc này
        private Integer tongSoLuong;        // tổng số sản phẩm rơi vào mốc
        private Double tyLe;                // số người chọn / tổng số đăng ký hợp lệ
        private BigDecimal doanhThuDuKien;  // donGia * tongSoLuong

        public MocCuocItem() {}

        public MocCuocItem(Integer maMucGia, Integer min, Integer max, BigDecimal donGia,
                            Integer soNguoiChon, Integer tongSoLuong, Double tyLe, BigDecimal doanhThuDuKien) {
            this.maMucGia = maMucGia;
            this.soLuongToiThieu = min;
            this.soLuongToiDa = max;
            this.donGia = donGia;
            this.soNguoiChon = soNguoiChon;
            this.tongSoLuong = tongSoLuong;
            this.tyLe = tyLe;
            this.doanhThuDuKien = doanhThuDuKien;
        }

        public Integer getMaMucGia() { return maMucGia; }
        public void setMaMucGia(Integer maMucGia) { this.maMucGia = maMucGia; }

        public Integer getSoLuongToiThieu() { return soLuongToiThieu; }
        public void setSoLuongToiThieu(Integer soLuongToiThieu) { this.soLuongToiThieu = soLuongToiThieu; }

        public Integer getSoLuongToiDa() { return soLuongToiDa; }
        public void setSoLuongToiDa(Integer soLuongToiDa) { this.soLuongToiDa = soLuongToiDa; }

        public BigDecimal getDonGia() { return donGia; }
        public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }

        public Integer getSoNguoiChon() { return soNguoiChon; }
        public void setSoNguoiChon(Integer soNguoiChon) { this.soNguoiChon = soNguoiChon; }

        public Integer getTongSoLuong() { return tongSoLuong; }
        public void setTongSoLuong(Integer tongSoLuong) { this.tongSoLuong = tongSoLuong; }

        public Double getTyLe() { return tyLe; }
        public void setTyLe(Double tyLe) { this.tyLe = tyLe; }

        public BigDecimal getDoanhThuDuKien() { return doanhThuDuKien; }
        public void setDoanhThuDuKien(BigDecimal doanhThuDuKien) { this.doanhThuDuKien = doanhThuDuKien; }
    }

    public static class VariantItem {
        private Integer ma;
        private String ten;
        private Integer soLuong;
        private Double tyLe;

        public VariantItem() {}
        public VariantItem(Integer ma, String ten, Integer soLuong, Double tyLe) {
            this.ma = ma; this.ten = ten; this.soLuong = soLuong; this.tyLe = tyLe;
        }

        public Integer getMa() { return ma; }
        public void setMa(Integer ma) { this.ma = ma; }

        public String getTen() { return ten; }
        public void setTen(String ten) { this.ten = ten; }

        public Integer getSoLuong() { return soLuong; }
        public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }

        public Double getTyLe() { return tyLe; }
        public void setTyLe(Double tyLe) { this.tyLe = tyLe; }
    }
}
