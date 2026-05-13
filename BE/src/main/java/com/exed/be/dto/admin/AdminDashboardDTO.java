package com.exed.be.dto.admin;

import java.math.BigDecimal;

public class AdminDashboardDTO {

    private BigDecimal doanhThuThangNay;
    private BigDecimal doanhThuThangTruoc;
    private Double phanTramDoanhThu;

    private Integer tongChienDich;
    private Integer chienDichThanhCong;
    private Double tyLeChienDich;

    private Integer tongKhachHang;
    private Integer khachHangCuocDung;
    private Double tyLeKhachHang;

    private BigDecimal tongHoanTien;

    // Getters & Setters
    public BigDecimal getDoanhThuThangNay() { return doanhThuThangNay; }
    public void setDoanhThuThangNay(BigDecimal doanhThuThangNay) { this.doanhThuThangNay = doanhThuThangNay; }

    public BigDecimal getDoanhThuThangTruoc() { return doanhThuThangTruoc; }
    public void setDoanhThuThangTruoc(BigDecimal doanhThuThangTruoc) { this.doanhThuThangTruoc = doanhThuThangTruoc; }

    public Double getPhanTramDoanhThu() { return phanTramDoanhThu; }
    public void setPhanTramDoanhThu(Double phanTramDoanhThu) { this.phanTramDoanhThu = phanTramDoanhThu; }

    public Integer getTongChienDich() { return tongChienDich; }
    public void setTongChienDich(Integer tongChienDich) { this.tongChienDich = tongChienDich; }

    public Integer getChienDichThanhCong() { return chienDichThanhCong; }
    public void setChienDichThanhCong(Integer chienDichThanhCong) { this.chienDichThanhCong = chienDichThanhCong; }

    public Double getTyLeChienDich() { return tyLeChienDich; }
    public void setTyLeChienDich(Double tyLeChienDich) { this.tyLeChienDich = tyLeChienDich; }

    public Integer getTongKhachHang() { return tongKhachHang; }
    public void setTongKhachHang(Integer tongKhachHang) { this.tongKhachHang = tongKhachHang; }

    public Integer getKhachHangCuocDung() { return khachHangCuocDung; }
    public void setKhachHangCuocDung(Integer khachHangCuocDung) { this.khachHangCuocDung = khachHangCuocDung; }

    public Double getTyLeKhachHang() { return tyLeKhachHang; }
    public void setTyLeKhachHang(Double tyLeKhachHang) { this.tyLeKhachHang = tyLeKhachHang; }

    public BigDecimal getTongHoanTien() { return tongHoanTien; }
    public void setTongHoanTien(BigDecimal tongHoanTien) { this.tongHoanTien = tongHoanTien; }
}
