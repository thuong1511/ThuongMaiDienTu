package com.exed.be.dto.admin;

import java.math.BigDecimal;

/**
 * Doanh thu theo tháng (cho biểu đồ dashboard)
 */
public class DoanhThuThangDTO {

    private Integer thang;          // 1..12
    private Integer nam;
    private String nhan;            // VD: "03/2026"
    private BigDecimal doanhThu;
    private Integer soDon;

    public DoanhThuThangDTO() {}

    public DoanhThuThangDTO(Integer thang, Integer nam, BigDecimal doanhThu, Integer soDon) {
        this.thang = thang;
        this.nam = nam;
        this.nhan = String.format("%02d/%d", thang, nam);
        this.doanhThu = doanhThu;
        this.soDon = soDon;
    }

    public Integer getThang() { return thang; }
    public void setThang(Integer thang) { this.thang = thang; }

    public Integer getNam() { return nam; }
    public void setNam(Integer nam) { this.nam = nam; }

    public String getNhan() { return nhan; }
    public void setNhan(String nhan) { this.nhan = nhan; }

    public BigDecimal getDoanhThu() { return doanhThu; }
    public void setDoanhThu(BigDecimal doanhThu) { this.doanhThu = doanhThu; }

    public Integer getSoDon() { return soDon; }
    public void setSoDon(Integer soDon) { this.soDon = soDon; }
}
