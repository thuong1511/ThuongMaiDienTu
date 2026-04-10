package com.exed.be.dto;

import lombok.Data;

@Data
public class PhieuChiTietDangKyRequest {
    private Integer maDangKy;
    private String maSanPham;
    private Integer maMau;
    private Integer maSize;
    private Integer soLuong;
}
