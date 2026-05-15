package com.exed.be.dto.admin;

import java.math.BigDecimal;

/**
 * Thống kê 1 nghệ sĩ (cho card admin-artists + detail)
 */
public class NgheSiThongKeDTO {

    private Integer tongChienDich;
    private Integer chienDichThanhCong;
    private Integer tongDon;
    private BigDecimal doanhThu;

    public Integer getTongChienDich() { return tongChienDich; }
    public void setTongChienDich(Integer tongChienDich) { this.tongChienDich = tongChienDich; }

    public Integer getChienDichThanhCong() { return chienDichThanhCong; }
    public void setChienDichThanhCong(Integer chienDichThanhCong) { this.chienDichThanhCong = chienDichThanhCong; }

    public Integer getTongDon() { return tongDon; }
    public void setTongDon(Integer tongDon) { this.tongDon = tongDon; }

    public BigDecimal getDoanhThu() { return doanhThu; }
    public void setDoanhThu(BigDecimal doanhThu) { this.doanhThu = doanhThu; }
}
