package com.exed.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SoDiaChiRequest {
    private String maNguoiDung;
    private String maPhuongXa;
    private String hoTen;
    private String soDienThoai;
    private String diaChiChiTiet;
    private Boolean macDinh;
}
