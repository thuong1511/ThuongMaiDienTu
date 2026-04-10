package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "SanPham_KichThuoc")
@IdClass(SanPhamKichThuoc.SanPhamKichThuocId.class)
public class SanPhamKichThuoc {
    
    @Id
    @Column(name = "maSanPham", length = 5)
    private String maSanPham;
    
    @Id
    @Column(name = "maSize")
    private Integer maSize;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maSize", insertable = false, updatable = false)
    private KichThuoc kichThuoc;
    
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
    
    public Integer getMaSize() {
        return maSize;
    }
    
    public void setMaSize(Integer maSize) {
        this.maSize = maSize;
    }
    
    public KichThuoc getKichThuoc() {
        return kichThuoc;
    }
    
    public void setKichThuoc(KichThuoc kichThuoc) {
        this.kichThuoc = kichThuoc;
    }
    
    public SanPham getSanPham() {
        return sanPham;
    }
    
    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }
    
    // Composite Key Class
    public static class SanPhamKichThuocId implements Serializable {
        private String maSanPham;
        private Integer maSize;
        
        public SanPhamKichThuocId() {}
        
        public SanPhamKichThuocId(String maSanPham, Integer maSize) {
            this.maSanPham = maSanPham;
            this.maSize = maSize;
        }
        
        // Getters, Setters, equals, hashCode
        public String getMaSanPham() {
            return maSanPham;
        }
        
        public void setMaSanPham(String maSanPham) {
            this.maSanPham = maSanPham;
        }
        
        public Integer getMaSize() {
            return maSize;
        }
        
        public void setMaSize(Integer maSize) {
            this.maSize = maSize;
        }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            SanPhamKichThuocId that = (SanPhamKichThuocId) o;
            return maSanPham.equals(that.maSanPham) && maSize.equals(that.maSize);
        }
        
        @Override
        public int hashCode() {
            return maSanPham.hashCode() + maSize.hashCode();
        }
    }
}
