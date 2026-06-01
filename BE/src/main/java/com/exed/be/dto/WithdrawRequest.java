package com.exed.be.dto;

public class WithdrawRequest {

    private String maNguoiDung;
    private java.math.BigDecimal soTien;

    // Phương thức: "MOMO" hoặc "BANK"
    private String phuongThuc;

    // Thông tin tài khoản đích
    private String soTaiKhoan;   // Số tài khoản ngân hàng hoặc SĐT MoMo
    private String chuTaiKhoan;  // Tên chủ tài khoản
    private String tenNganHang;  // Tên ngân hàng (chỉ dùng khi phuongThuc = BANK)

    // OTP xác nhận giao dịch
    private String otpCode;

    // Getters & Setters
    public String getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(String maNguoiDung) { this.maNguoiDung = maNguoiDung; }

    public java.math.BigDecimal getSoTien() { return soTien; }
    public void setSoTien(java.math.BigDecimal soTien) { this.soTien = soTien; }

    public String getPhuongThuc() { return phuongThuc; }
    public void setPhuongThuc(String phuongThuc) { this.phuongThuc = phuongThuc; }

    public String getSoTaiKhoan() { return soTaiKhoan; }
    public void setSoTaiKhoan(String soTaiKhoan) { this.soTaiKhoan = soTaiKhoan; }

    public String getChuTaiKhoan() { return chuTaiKhoan; }
    public void setChuTaiKhoan(String chuTaiKhoan) { this.chuTaiKhoan = chuTaiKhoan; }

    public String getTenNganHang() { return tenNganHang; }
    public void setTenNganHang(String tenNganHang) { this.tenNganHang = tenNganHang; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
}
