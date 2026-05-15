package com.exed.be.dto.admin;

import java.math.BigDecimal;

/**
 * Top chiến dịch theo doanh thu cao nhất
 */
public class TopChienDichDTO {

    private Integer xepHang;
    private String maChienDich;
    private String tenChienDich;
    private String tenNgheSi;
    private Integer soLuongBan;
    private BigDecimal doanhThu;

    public TopChienDichDTO() {}

    public TopChienDichDTO(Integer xepHang, String maChienDich, String tenChienDich,
                            String tenNgheSi, Integer soLuongBan, BigDecimal doanhThu) {
        this.xepHang = xepHang;
        this.maChienDich = maChienDich;
        this.tenChienDich = tenChienDich;
        this.tenNgheSi = tenNgheSi;
        this.soLuongBan = soLuongBan;
        this.doanhThu = doanhThu;
    }

    public Integer getXepHang() { return xepHang; }
    public void setXepHang(Integer xepHang) { this.xepHang = xepHang; }

    public String getMaChienDich() { return maChienDich; }
    public void setMaChienDich(String maChienDich) { this.maChienDich = maChienDich; }

    public String getTenChienDich() { return tenChienDich; }
    public void setTenChienDich(String tenChienDich) { this.tenChienDich = tenChienDich; }

    public String getTenNgheSi() { return tenNgheSi; }
    public void setTenNgheSi(String tenNgheSi) { this.tenNgheSi = tenNgheSi; }

    public Integer getSoLuongBan() { return soLuongBan; }
    public void setSoLuongBan(Integer soLuongBan) { this.soLuongBan = soLuongBan; }

    public BigDecimal getDoanhThu() { return doanhThu; }
    public void setDoanhThu(BigDecimal doanhThu) { this.doanhThu = doanhThu; }
}
