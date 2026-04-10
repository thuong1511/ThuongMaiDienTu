package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "HinhAnhChienDich")
public class HinhAnhChienDich {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maHinhAnh")
    private Integer maHinhAnh;
    
    @Column(name = "maChienDich", length = 5, nullable = false)
    private String maChienDich;
    
    @Column(name = "duongDan", length = 255, nullable = false)
    private String duongDan;
    
    @Column(name = "thuTu")
    private Integer thuTu = 1;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maChienDich", insertable = false, updatable = false)
    @JsonIgnore
    private ChienDich chienDich;
    
    // Getters and Setters
    public Integer getMaHinhAnh() {
        return maHinhAnh;
    }
    
    public void setMaHinhAnh(Integer maHinhAnh) {
        this.maHinhAnh = maHinhAnh;
    }
    
    public String getMaChienDich() {
        return maChienDich;
    }
    
    public void setMaChienDich(String maChienDich) {
        this.maChienDich = maChienDich;
    }
    
    public String getDuongDan() {
        return duongDan;
    }
    
    public void setDuongDan(String duongDan) {
        this.duongDan = duongDan;
    }
    
    public Integer getThuTu() {
        return thuTu;
    }
    
    public void setThuTu(Integer thuTu) {
        this.thuTu = thuTu;
    }
    
    public ChienDich getChienDich() {
        return chienDich;
    }
    
    public void setChienDich(ChienDich chienDich) {
        this.chienDich = chienDich;
    }
}
