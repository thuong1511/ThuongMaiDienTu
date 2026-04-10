package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "SanPham_MauSac")
@IdClass(SanPhamMauSac.SanPhamMauSacId.class)
public class SanPhamMauSac {
    
    @Id
    @Column(name = "maSanPham", length = 5)
    private String maSanPham;
    
    @Id
    @Column(name = "maMau")
    private Integer maMau;
    
    @Column(name = "soLuongToiDa", nullable = false)
    private Integer soLuongToiDa;
    
    @Column(name = "soLuongDaDat")
    private Integer soLuongDaDat = 0;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maMau", insertable = false, updatable = false)
    private MauSac mauSac;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maSanPham", insertable = false, updatable = false)
    @JsonIgnore
    private SanPham sanPham;
    
    // Getters and Setters
    public String getMaSanPham() {
        return maSanPham;
    }
    
    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }
    
    public Integer getMaMau() {
        return maMau;
    }
    
    public void setMaMau(Integer maMau) {
        this.maMau = maMau;
    }
    
    public Integer getSoLuongToiDa() {
        return soLuongToiDa;
    }
    
    public void setSoLuongToiDa(Integer soLuongToiDa) {
        this.soLuongToiDa = soLuongToiDa;
    }
    
    public Integer getSoLuongDaDat() {
        return soLuongDaDat;
    }
    
    public void setSoLuongDaDat(Integer soLuongDaDat) {
        this.soLuongDaDat = soLuongDaDat;
    }
    
    public MauSac getMauSac() {
        return mauSac;
    }
    
    public void setMauSac(MauSac mauSac) {
        this.mauSac = mauSac;
    }
    
    public SanPham getSanPham() {
        return sanPham;
    }
    
    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }
    
    // Composite Key Class
    public static class SanPhamMauSacId implements Serializable {
        private String maSanPham;
        private Integer maMau;
        
        public SanPhamMauSacId() {}
        
        public SanPhamMauSacId(String maSanPham, Integer maMau) {
            this.maSanPham = maSanPham;
            this.maMau = maMau;
        }
        
        // Getters, Setters, equals, hashCode
        public String getMaSanPham() {
            return maSanPham;
        }
        
        public void setMaSanPham(String maSanPham) {
            this.maSanPham = maSanPham;
        }
        
        public Integer getMaMau() {
            return maMau;
        }
        
        public void setMaMau(Integer maMau) {
            this.maMau = maMau;
        }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            SanPhamMauSacId that = (SanPhamMauSacId) o;
            return maSanPham.equals(that.maSanPham) && maMau.equals(that.maMau);
        }
        
        @Override
        public int hashCode() {
            return maSanPham.hashCode() + maMau.hashCode();
        }
    }
}
