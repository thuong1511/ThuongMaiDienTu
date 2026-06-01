package com.exed.be.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NguoiDung")
public class NguoiDung {
    
    @Id
    @Column(name = "maNguoiDung", length = 5)
    private String maNguoiDung;
    
    @Column(name = "tenDangNhap", length = 50, unique = true, nullable = false)
    private String tenDangNhap;
    
    @Column(name = "matKhau", length = 255, nullable = false)
    private String matKhau;
    
    @Column(name = "email", length = 100, unique = true, nullable = false)
    private String email;
    
    @Column(name = "soDienThoai", length = 15, unique = true, nullable = false)
    private String soDienThoai;
    
    @Column(name = "gioiTinh", length = 10)
    private String gioiTinh;
    
    @Column(name = "vaiTro", length = 20, nullable = false)
    private String vaiTro;
    
    @Column(name = "trangThai", length = 20, nullable = false)
    private String trangThai;
    
    @Column(name = "ngayTao")
    private LocalDateTime ngayTao;
    
    @Column(name = "otp", length = 6)
    private String otpGiaoDich;
    
    // Getters and Setters
    public String getOtpGiaoDich() {
        return otpGiaoDich;
    }
    
    public void setOtpGiaoDich(String otpGiaoDich) {
        this.otpGiaoDich = otpGiaoDich;
    }
    
    public String getMaNguoiDung() {
        return maNguoiDung;
    }
    
    public void setMaNguoiDung(String maNguoiDung) {
        this.maNguoiDung = maNguoiDung;
    }
    
    public String getTenDangNhap() {
        return tenDangNhap;
    }
    
    public void setTenDangNhap(String tenDangNhap) {
        this.tenDangNhap = tenDangNhap;
    }
    
    public String getMatKhau() {
        return matKhau;
    }
    
    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getSoDienThoai() {
        return soDienThoai;
    }
    
    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }
    
    public String getGioiTinh() {
        return gioiTinh;
    }
    
    public void setGioiTinh(String gioiTinh) {
        this.gioiTinh = gioiTinh;
    }
    
    public String getVaiTro() {
        return vaiTro;
    }
    
    public void setVaiTro(String vaiTro) {
        this.vaiTro = vaiTro;
    }
    
    public String getTrangThai() {
        return trangThai;
    }
    
    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
    
    public LocalDateTime getNgayTao() {
        return ngayTao;
    }
    
    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }
}
