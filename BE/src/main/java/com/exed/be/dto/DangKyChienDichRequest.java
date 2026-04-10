package com.exed.be.dto;

import lombok.Data;

@Data
public class DangKyChienDichRequest {
    private Integer maThanhToan;
    private Integer maMucGia;
    private String maNguoiDung;
    private String maChienDich;
    private Integer tongSoLuong;
}
