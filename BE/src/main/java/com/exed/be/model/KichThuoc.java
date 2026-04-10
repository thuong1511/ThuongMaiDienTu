package com.exed.be.model;

import jakarta.persistence.*;

@Entity
@Table(name = "KichThuoc")
public class KichThuoc {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maSize")
    private Integer maSize;
    
    @Column(name = "tenSize", length = 20, nullable = false)
    private String tenSize;
    
    @Column(name = "loaiKichThuoc", length = 20)
    private String loaiKichThuoc;
    
    // Getters and Setters
    public Integer getMaSize() {
        return maSize;
    }
    
    public void setMaSize(Integer maSize) {
        this.maSize = maSize;
    }
    
    public String getTenSize() {
        return tenSize;
    }
    
    public void setTenSize(String tenSize) {
        this.tenSize = tenSize;
    }
    
    public String getLoaiKichThuoc() {
        return loaiKichThuoc;
    }
    
    public void setLoaiKichThuoc(String loaiKichThuoc) {
        this.loaiKichThuoc = loaiKichThuoc;
    }
}
