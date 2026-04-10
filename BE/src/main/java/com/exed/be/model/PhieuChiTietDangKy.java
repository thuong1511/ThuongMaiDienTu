package com.exed.be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PhieuChiTietDangKy")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuChiTietDangKy {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maChiTietDangKy")
    private Integer maChiTietDangKy;
    
    @ManyToOne
    @JoinColumn(name = "maDangKy", nullable = false)
    private DangKyChienDich dangKyChienDich;
    
    @ManyToOne
    @JoinColumn(name = "maSanPham", nullable = false)
    private SanPham sanPham;
    
    @ManyToOne
    @JoinColumn(name = "maMau", nullable = false)
    private MauSac mauSac;
    
    @ManyToOne
    @JoinColumn(name = "maSize", nullable = false)
    private KichThuoc kichThuoc;
    
    @Column(name = "soLuong", nullable = false)
    private Integer soLuong = 1;
    
    @PrePersist
    protected void onCreate() {
        if (soLuong == null || soLuong < 1) {
            soLuong = 1;
        }
    }
}
