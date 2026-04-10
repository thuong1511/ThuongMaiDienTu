package com.exed.be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ThanhToan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThanhToan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maThanhToan")
    private Integer maThanhToan;
    
    @Column(name = "hoTenNguoiNhan", nullable = false, length = 100)
    private String hoTenNguoiNhan;
    
    @Column(name = "soDienThoaiNhan", nullable = false, length = 15)
    private String soDienThoaiNhan;
    
    @Column(name = "diaChiGiaoHang", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String diaChiGiaoHang;
    
    @Column(name = "soTienThanhToan", nullable = false, precision = 18, scale = 2)
    private BigDecimal soTienThanhToan;
    
    @Column(name = "phuongThuc", nullable = false, length = 30)
    private String phuongThuc;
    
    @Column(name = "ngayThanhToan")
    private LocalDateTime ngayThanhToan;
    
    @Column(name = "ghiChu", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChu;
    
    @PrePersist
    protected void onCreate() {
        if (ngayThanhToan == null) {
            ngayThanhToan = LocalDateTime.now();
        }
    }
}
