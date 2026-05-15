package com.exed.be.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Đơn hàng gần đây (cho dashboard)
 * Trả flat-data, không lazy-load nested entity
 */
public class DonHangGanDayDTO {

    private Integer maDangKy;
    private String tenKhachHang;
    private String tenChienDich;
    private BigDecimal soTienThanhToan;
    private LocalDateTime ngayDangKy;
    private String trangThai;       // "Đã hủy" / "Hoàn tiền" / "Đang xử lý"

    public DonHangGanDayDTO() {}

    public DonHangGanDayDTO(Integer maDangKy, String tenKhachHang, String tenChienDich,
                             BigDecimal soTienThanhToan, LocalDateTime ngayDangKy, String trangThai) {
        this.maDangKy = maDangKy;
        this.tenKhachHang = tenKhachHang;
        this.tenChienDich = tenChienDich;
        this.soTienThanhToan = soTienThanhToan;
        this.ngayDangKy = ngayDangKy;
        this.trangThai = trangThai;
    }

    public Integer getMaDangKy() { return maDangKy; }
    public void setMaDangKy(Integer maDangKy) { this.maDangKy = maDangKy; }

    public String getTenKhachHang() { return tenKhachHang; }
    public void setTenKhachHang(String tenKhachHang) { this.tenKhachHang = tenKhachHang; }

    public String getTenChienDich() { return tenChienDich; }
    public void setTenChienDich(String tenChienDich) { this.tenChienDich = tenChienDich; }

    public BigDecimal getSoTienThanhToan() { return soTienThanhToan; }
    public void setSoTienThanhToan(BigDecimal soTienThanhToan) { this.soTienThanhToan = soTienThanhToan; }

    public LocalDateTime getNgayDangKy() { return ngayDangKy; }
    public void setNgayDangKy(LocalDateTime ngayDangKy) { this.ngayDangKy = ngayDangKy; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}
