package com.exed.be.dto.admin;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request tạo phiếu giao hàng từ 1 đăng ký chiến dịch
 */
public class DonHangRequest {

    private String  maDonHang;          // optional, nếu null sẽ auto-gen "DH001"...
    private Integer maDangKy;
    private BigDecimal giaChotCuoiCung; // optional, nếu null lấy từ thanhToan
    private BigDecimal soTienHoanLai;
    private String  trangThaiGiaoHang;  // optional
    private List<ChiTietItem> chiTiet;  // chi tiết màu/size/SL

    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }

    public Integer getMaDangKy() { return maDangKy; }
    public void setMaDangKy(Integer maDangKy) { this.maDangKy = maDangKy; }

    public BigDecimal getGiaChotCuoiCung() { return giaChotCuoiCung; }
    public void setGiaChotCuoiCung(BigDecimal giaChotCuoiCung) { this.giaChotCuoiCung = giaChotCuoiCung; }

    public BigDecimal getSoTienHoanLai() { return soTienHoanLai; }
    public void setSoTienHoanLai(BigDecimal soTienHoanLai) { this.soTienHoanLai = soTienHoanLai; }

    public String getTrangThaiGiaoHang() { return trangThaiGiaoHang; }
    public void setTrangThaiGiaoHang(String trangThaiGiaoHang) { this.trangThaiGiaoHang = trangThaiGiaoHang; }

    public List<ChiTietItem> getChiTiet() { return chiTiet; }
    public void setChiTiet(List<ChiTietItem> chiTiet) { this.chiTiet = chiTiet; }

    public static class ChiTietItem {
        private Integer maMau;
        private Integer maSize;
        private Integer soLuong;

        public Integer getMaMau() { return maMau; }
        public void setMaMau(Integer maMau) { this.maMau = maMau; }

        public Integer getMaSize() { return maSize; }
        public void setMaSize(Integer maSize) { this.maSize = maSize; }

        public Integer getSoLuong() { return soLuong; }
        public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }
    }
}
