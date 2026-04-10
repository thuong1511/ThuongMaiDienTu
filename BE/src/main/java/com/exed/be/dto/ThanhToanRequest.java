package com.exed.be.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ThanhToanRequest {
    private String hoTenNguoiNhan;
    private String soDienThoaiNhan;
    private String diaChiGiaoHang;
    private BigDecimal soTienThanhToan;
    private String phuongThuc;
    private String ghiChu;
}
