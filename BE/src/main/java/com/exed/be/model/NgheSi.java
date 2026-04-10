package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "NgheSi")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NgheSi {
    
    @Id
    @Column(name = "maNgheSi", length = 5)
    private String maNgheSi;
    
    @Column(name = "tenNgheSi", length = 200)
    private String tenNgheSi;
    
    @Column(name = "moTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;
    
    @Column(name = "ngheNghiep", length = 50)
    private String ngheNghiep;
    
    @Column(name = "linkMXH", length = 255)
    private String linkMXH;
    
    @OneToMany(mappedBy = "ngheSi", fetch = FetchType.EAGER)
    private List<HinhAnhNgheSi> hinhAnhNgheSis;
    
    // Getters and Setters
    public String getMaNgheSi() {
        return maNgheSi;
    }
    
    public void setMaNgheSi(String maNgheSi) {
        this.maNgheSi = maNgheSi;
    }
    
    public String getTenNgheSi() {
        return tenNgheSi;
    }
    
    public void setTenNgheSi(String tenNgheSi) {
        this.tenNgheSi = tenNgheSi;
    }
    
    public String getMoTa() {
        return moTa;
    }
    
    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
    
    public String getNgheNghiep() {
        return ngheNghiep;
    }
    
    public void setNgheNghiep(String ngheNghiep) {
        this.ngheNghiep = ngheNghiep;
    }
    
    public String getLinkMXH() {
        return linkMXH;
    }
    
    public void setLinkMXH(String linkMXH) {
        this.linkMXH = linkMXH;
    }
    
    public List<HinhAnhNgheSi> getHinhAnhNgheSis() {
        return hinhAnhNgheSis;
    }
    
    public void setHinhAnhNgheSis(List<HinhAnhNgheSi> hinhAnhNgheSis) {
        this.hinhAnhNgheSis = hinhAnhNgheSis;
    }
}
