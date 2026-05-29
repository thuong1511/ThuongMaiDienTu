package com.exed.be.model;

import jakarta.persistence.*;

@Entity
@Table(name = "MauSac")
public class MauSac {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maMau")
    private Integer maMau;
    
    @Column(name = "tenMau", length = 50, nullable = false)
    private String tenMau;
    
    @Column(name = "maHexa", length = 7)
    private String maHexa;
    
    // Getters and Setters
    public Integer getMaMau() {
        return maMau;
    }
    
    public void setMaMau(Integer maMau) {
        this.maMau = maMau;
    }
    
    public String getTenMau() {
        return tenMau;
    }
    
    public void setTenMau(String tenMau) {
        this.tenMau = tenMau;
    }
    
    public String getMaHexa() {
        return maHexa;
    }
    
    public void setMaHexa(String maHexa) {
        this.maHexa = maHexa;
    }
}
