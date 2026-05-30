package com.exed.be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "DangKyChienDich")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DangKyChienDich {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maDangKy")
    private Integer maDangKy;
    
    @OneToOne
    @JoinColumn(name = "maThanhToan", nullable = false, unique = true)
    private ThanhToan thanhToan;
    
    @ManyToOne
    @JoinColumn(name = "maMucGia", nullable = false)
    private BangGiaBacThang bangGiaBacThang;
    
    @ManyToOne
    @JoinColumn(name = "maNguoiDung", nullable = false)
    private NguoiDung nguoiDung;
    
    @ManyToOne
    @JoinColumn(name = "maChienDich", nullable = false)
    private ChienDich chienDich;
    
    @Column(name = "daHuy", nullable = false)
    private Boolean daHuy = false;
    
    @Column(name = "tongSoLuong", nullable = false)
    private Integer tongSoLuong;
    
    @Column(name = "daHoanTien", nullable = false)
    private Boolean daHoanTien = false;
    
    @Column(name = "soTienHoanLai")
    private java.math.BigDecimal soTienHoanLai = java.math.BigDecimal.ZERO;
    
    @Column(name = "ngayHoanTien")
    private LocalDateTime ngayHoanTien;
    
    @Column(name = "ngayDangKy")
    private LocalDateTime ngayDangKy;
    
    @PrePersist
    protected void onCreate() {
        if (ngayDangKy == null) {
            ngayDangKy = LocalDateTime.now();
        }
        if (daHuy == null) {
            daHuy = false;
        }
        if (daHoanTien == null) {
            daHoanTien = false;
        }
        if (soTienHoanLai == null) {
            soTienHoanLai = java.math.BigDecimal.ZERO;
        }
    }
}
