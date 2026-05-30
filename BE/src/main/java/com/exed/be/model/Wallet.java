package com.exed.be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "Wallet")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maVi")
    private Integer maVi;
    
    @OneToOne
    @JoinColumn(name = "maNguoiDung", unique = true, nullable = false)
    private NguoiDung nguoiDung;
    
    @Column(name = "soDu", precision = 18, scale = 2)
    private BigDecimal soDu = BigDecimal.ZERO;
    
    @PrePersist
    protected void onCreate() {
        if (soDu == null) {
            soDu = BigDecimal.ZERO;
        }
    }
}
