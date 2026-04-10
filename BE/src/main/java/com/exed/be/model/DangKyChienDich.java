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
    
    @Column(name = "trangThaiHoanTien", nullable = false)
    private Boolean trangThaiHoanTien = false;
    
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
        if (trangThaiHoanTien == null) {
            trangThaiHoanTien = false;
        }
    }
}
