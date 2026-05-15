package com.exed.be.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Cấu hình hệ thống dạng key/value, gom theo nhóm.
 * Dùng cho trang admin-settings.html
 */
@Entity
@Table(name = "CauHinh")
public class CauHinh {

    @Id
    @Column(name = "khoa", length = 60)
    private String khoa;

    @Column(name = "nhom", length = 40, nullable = false)
    private String nhom;

    @Column(name = "giaTri", columnDefinition = "NVARCHAR(MAX)")
    private String giaTri;

    @Column(name = "loai", length = 20, nullable = false)
    private String loai = "string";   // string | number | boolean

    @Column(name = "moTa", length = 255)
    private String moTa;

    @Column(name = "ngayCapNhat")
    private LocalDateTime ngayCapNhat;

    @PrePersist
    @PreUpdate
    protected void touch() {
        this.ngayCapNhat = LocalDateTime.now();
    }

    public CauHinh() {}

    public String getKhoa() { return khoa; }
    public void setKhoa(String khoa) { this.khoa = khoa; }

    public String getNhom() { return nhom; }
    public void setNhom(String nhom) { this.nhom = nhom; }

    public String getGiaTri() { return giaTri; }
    public void setGiaTri(String giaTri) { this.giaTri = giaTri; }

    public String getLoai() { return loai; }
    public void setLoai(String loai) { this.loai = loai; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public LocalDateTime getNgayCapNhat() { return ngayCapNhat; }
    public void setNgayCapNhat(LocalDateTime ngayCapNhat) { this.ngayCapNhat = ngayCapNhat; }
}
