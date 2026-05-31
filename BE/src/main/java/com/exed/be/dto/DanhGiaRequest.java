package com.exed.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanhGiaRequest {
    private String maDonHang;
    private Integer diemDanhGia;
    private String binhLuan;
    private Boolean anDanh; // true = ẩn danh, false = không ẩn danh
    private List<String> hinhAnhs; // List of image paths
}
