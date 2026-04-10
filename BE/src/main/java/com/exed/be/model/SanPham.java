package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "SanPham")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SanPham {
    
    @Id
    @Column(name = "maSanPham", length = 5)
    private String maSanPham;
    
    @Column(name = "maDanhMuc", length = 5, nullable = false, insertable = false, updatable = false)
    private String maDanhMuc;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maDanhMuc", nullable = false)
    private DanhMuc danhMuc;
    
    @Column(name = "tenSanPham", length = 200)
    private String tenSanPham;
    
    @Column(name = "moTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;
    
    @OneToMany(mappedBy = "sanPham", fetch = FetchType.EAGER)
    @OrderBy("thuTu ASC")
    private List<HinhAnhSanPham> hinhAnhSanPhams;
    
    @OneToMany(mappedBy = "sanPham", fetch = FetchType.EAGER)
    private List<SanPhamMauSac> sanPhamMauSacs;
    
    @OneToMany(mappedBy = "sanPham", fetch = FetchType.EAGER)
    private List<SanPhamKichThuoc> sanPhamKichThuocs;
    
    // Getters and Setters
    public String getMaSanPham() {
        return maSanPham;
    }
    
    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }
    
    public String getMaDanhMuc() {
        return maDanhMuc;
    }
    
    public void setMaDanhMuc(String maDanhMuc) {
        this.maDanhMuc = maDanhMuc;
    }
    
    public DanhMuc getDanhMuc() {
        return danhMuc;
    }
    
    public void setDanhMuc(DanhMuc danhMuc) {
        this.danhMuc = danhMuc;
    }
    
    public String getTenSanPham() {
        return tenSanPham;
    }
    
    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }
    
    public String getMoTa() {
        return moTa;
    }
    
    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
    
    public List<HinhAnhSanPham> getHinhAnhSanPhams() {
        return hinhAnhSanPhams;
    }
    
    public void setHinhAnhSanPhams(List<HinhAnhSanPham> hinhAnhSanPhams) {
        this.hinhAnhSanPhams = hinhAnhSanPhams;
    }
    
    public List<SanPhamMauSac> getSanPhamMauSacs() {
        return sanPhamMauSacs;
    }
    
    public void setSanPhamMauSacs(List<SanPhamMauSac> sanPhamMauSacs) {
        this.sanPhamMauSacs = sanPhamMauSacs;
    }
    
    public List<SanPhamKichThuoc> getSanPhamKichThuocs() {
        return sanPhamKichThuocs;
    }
    
    public void setSanPhamKichThuocs(List<SanPhamKichThuoc> sanPhamKichThuocs) {
        this.sanPhamKichThuocs = sanPhamKichThuocs;
    }
}
