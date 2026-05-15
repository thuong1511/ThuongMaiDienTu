package com.exed.be.dto.admin;

public class DoiMatKhauRequest {

    private String maNguoiDung;        // optional - nếu null sẽ bắt buộc gửi qua header / param
    private String matKhauCu;
    private String matKhauMoi;
    private String xacNhanMatKhauMoi;

    public String getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(String maNguoiDung) { this.maNguoiDung = maNguoiDung; }

    public String getMatKhauCu() { return matKhauCu; }
    public void setMatKhauCu(String matKhauCu) { this.matKhauCu = matKhauCu; }

    public String getMatKhauMoi() { return matKhauMoi; }
    public void setMatKhauMoi(String matKhauMoi) { this.matKhauMoi = matKhauMoi; }

    public String getXacNhanMatKhauMoi() { return xacNhanMatKhauMoi; }
    public void setXacNhanMatKhauMoi(String xacNhanMatKhauMoi) { this.xacNhanMatKhauMoi = xacNhanMatKhauMoi; }
}
