package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "HinhAnhSanPham")
public class HinhAnhSanPham {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maHinhAnh")
    private Integer maHinhAnh;
    
    @Column(name = "maSanPham", length = 5, nullable = false)
    private String maSanPham;
    
    @Column(name = "duongDan", length = 255, nullable = false)
    private String duongDan;
    
    @Column(name = "thuTu")
    private Integer thuTu = 1;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maSanPham", insertable = false, updatable = false)
    @JsonIgnore
    private SanPham sanPham;
    
    // Getters and Setters
    public Integer getMaHinhAnh() {
        return maHinhAnh;
    }
    
    public void setMaHinhAnh(Integer maHinhAnh) {
        this.maHinhAnh = maHinhAnh;
    }
    
    public String getMaSanPham() {
        return maSanPham;
    }
    
    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
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
    
    public SanPham getSanPham() {
        return sanPham;
    }
    
    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }
}
