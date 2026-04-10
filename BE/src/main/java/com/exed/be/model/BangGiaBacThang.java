package com.exed.be.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "BangGiaBacThang")
public class BangGiaBacThang {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maMucGia")
    private Integer maMucGia;
    
    @Column(name = "maChienDich", length = 5, nullable = false)
    private String maChienDich;
    
    @Column(name = "soLuongToiThieu", nullable = false)
    private Integer soLuongToiThieu;
    
    @Column(name = "soLuongToiDa", nullable = false)
    private Integer soLuongToiDa;
    
    @Column(name = "donGia", precision = 18, scale = 2, nullable = false)
    private BigDecimal donGia;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maChienDich", insertable = false, updatable = false)
    @JsonIgnore
    private ChienDich chienDich;
    
    // Getters and Setters
    public Integer getMaMucGia() {
        return maMucGia;
    }
    
    public void setMaMucGia(Integer maMucGia) {
        this.maMucGia = maMucGia;
    }
    
    public String getMaChienDich() {
        return maChienDich;
    }
    
    public void setMaChienDich(String maChienDich) {
        this.maChienDich = maChienDich;
    }
    
    public Integer getSoLuongToiThieu() {
        return soLuongToiThieu;
    }
    
    public void setSoLuongToiThieu(Integer soLuongToiThieu) {
        this.soLuongToiThieu = soLuongToiThieu;
    }
    
    public Integer getSoLuongToiDa() {
        return soLuongToiDa;
    }
    
    public void setSoLuongToiDa(Integer soLuongToiDa) {
        this.soLuongToiDa = soLuongToiDa;
    }
    
    public BigDecimal getDonGia() {
        return donGia;
    }
    
    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }
    
    public ChienDich getChienDich() {
        return chienDich;
    }
    
    public void setChienDich(ChienDich chienDich) {
        this.chienDich = chienDich;
    }
}
