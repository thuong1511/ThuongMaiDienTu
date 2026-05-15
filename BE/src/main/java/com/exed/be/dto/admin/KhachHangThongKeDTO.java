package com.exed.be.dto.admin;

import java.math.BigDecimal;

/**
 * Thống kê 1 khách hàng (cho trang admin-customer-detail)
 */
public class KhachHangThongKeDTO {

    private Integer tongDon;             // tất cả đăng ký
    private Integer donHopLe;            // đăng ký chưa hủy
    private Integer donHuy;
    private Integer donThangNay;         // đăng ký trong tháng hiện tại
    private BigDecimal tongChiTieu;      // tổng tiền đã thanh toán (đơn không hủy)
    private BigDecimal tongHoanTien;     // tổng tiền hoàn (đơn hủy + trangThaiHoanTien=true)
    private Double tyLeCuocDung;         // donHopLe / tongDon * 100

    public Integer getTongDon() { return tongDon; }
    public void setTongDon(Integer tongDon) { this.tongDon = tongDon; }

    public Integer getDonHopLe() { return donHopLe; }
    public void setDonHopLe(Integer donHopLe) { this.donHopLe = donHopLe; }

    public Integer getDonHuy() { return donHuy; }
    public void setDonHuy(Integer donHuy) { this.donHuy = donHuy; }

    public Integer getDonThangNay() { return donThangNay; }
    public void setDonThangNay(Integer donThangNay) { this.donThangNay = donThangNay; }

    public BigDecimal getTongChiTieu() { return tongChiTieu; }
    public void setTongChiTieu(BigDecimal tongChiTieu) { this.tongChiTieu = tongChiTieu; }

    public BigDecimal getTongHoanTien() { return tongHoanTien; }
    public void setTongHoanTien(BigDecimal tongHoanTien) { this.tongHoanTien = tongHoanTien; }

    public Double getTyLeCuocDung() { return tyLeCuocDung; }
    public void setTyLeCuocDung(Double tyLeCuocDung) { this.tyLeCuocDung = tyLeCuocDung; }
}
