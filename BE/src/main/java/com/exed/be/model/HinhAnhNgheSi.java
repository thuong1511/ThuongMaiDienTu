package com.exed.be.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "HinhAnhNgheSi")
public class HinhAnhNgheSi {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maHinhAnh")
    private Integer maHinhAnh;
    
    @Column(name = "maNgheSi", length = 5, nullable = false)
    private String maNgheSi;
    
    @Column(name = "duongDan", length = 255, nullable = false)
    private String duongDan;
    
    @Column(name = "thuTu")
    private Integer thuTu = 1;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNgheSi", insertable = false, updatable = false)
    @JsonIgnore
    private NgheSi ngheSi;
    
    // Getters and Setters
    public Integer getMaHinhAnh() {
        return maHinhAnh;
    }
    
    public void setMaHinhAnh(Integer maHinhAnh) {
        this.maHinhAnh = maHinhAnh;
    }
    
    public String getMaNgheSi() {
        return maNgheSi;
    }
    
    public void setMaNgheSi(String maNgheSi) {
        this.maNgheSi = maNgheSi;
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
    
    public NgheSi getNgheSi() {
        return ngheSi;
    }
    
    public void setNgheSi(NgheSi ngheSi) {
        this.ngheSi = ngheSi;
    }
}
