package com.exed.be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "WalletTransaction")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maGiaoDich")
    private Integer maGiaoDich;
    
    @ManyToOne
    @JoinColumn(name = "maVi", nullable = false)
    private Wallet wallet;
    
    @Column(name = "loaiGiaoDich", nullable = false, length = 30)
    private String loaiGiaoDich; // "Hoàn tiền", "Thanh toán", "Rút tiền"
    
    @Column(name = "soTien", nullable = false, precision = 18, scale = 2)
    private BigDecimal soTien;
    
    @Column(name = "moTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;
    
    @ManyToOne
    @JoinColumn(name = "maDangKy")
    private DangKyChienDich dangKyChienDich;
    
    @Column(name = "ngayGiaoDich")
    private LocalDateTime ngayGiaoDich;
    
    @PrePersist
    protected void onCreate() {
        if (ngayGiaoDich == null) {
            ngayGiaoDich = LocalDateTime.now();
        }
    }
}
