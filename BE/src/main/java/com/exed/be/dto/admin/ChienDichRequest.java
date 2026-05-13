package com.exed.be.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ChienDichRequest {

    private String maChienDich;
    private String maSanPham;
    private String maNgheSi;
    private String tenChienDich;
    private String thoiDiem;
    private String trangThai;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Integer nguongMOQ;
    private Integer nguongToiDa;
    private Integer nguoiThamGia;
    private BigDecimal phiThamGia;
    private BigDecimal giaGoc;
    private List<BangGiaBacThangRequest> bangGiaBacThangs;

    // Getters & Setters
    public String getMaChienDich() { return maChienDich; }
    public void setMaChienDich(String maChienDich) { this.maChienDich = maChienDich; }

    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }

    public String getMaNgheSi() { return maNgheSi; }
    public void setMaNgheSi(String maNgheSi) { this.maNgheSi = maNgheSi; }

    public String getTenChienDich() { return tenChienDich; }
    public void setTenChienDich(String tenChienDich) { this.tenChienDich = tenChienDich; }

    public String getThoiDiem() { return thoiDiem; }
    public void setThoiDiem(String thoiDiem) { this.thoiDiem = thoiDiem; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public LocalDateTime getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDateTime ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDateTime getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDateTime ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }

    public Integer getNguongMOQ() { return nguongMOQ; }
    public void setNguongMOQ(Integer nguongMOQ) { this.nguongMOQ = nguongMOQ; }

    public Integer getNguongToiDa() { return nguongToiDa; }
    public void setNguongToiDa(Integer nguongToiDa) { this.nguongToiDa = nguongToiDa; }

    public Integer getNguoiThamGia() { return nguoiThamGia; }
    public void setNguoiThamGia(Integer nguoiThamGia) { this.nguoiThamGia = nguoiThamGia; }

    public BigDecimal getPhiThamGia() { return phiThamGia; }
    public void setPhiThamGia(BigDecimal phiThamGia) { this.phiThamGia = phiThamGia; }

    public BigDecimal getGiaGoc() { return giaGoc; }
    public void setGiaGoc(BigDecimal giaGoc) { this.giaGoc = giaGoc; }

    public List<BangGiaBacThangRequest> getBangGiaBacThangs() { return bangGiaBacThangs; }
    public void setBangGiaBacThangs(List<BangGiaBacThangRequest> bangGiaBacThangs) { this.bangGiaBacThangs = bangGiaBacThangs; }

    public static class BangGiaBacThangRequest {
        private Integer soLuongToiThieu;
        private Integer soLuongToiDa;
        private BigDecimal donGia;

        public Integer getSoLuongToiThieu() { return soLuongToiThieu; }
        public void setSoLuongToiThieu(Integer soLuongToiThieu) { this.soLuongToiThieu = soLuongToiThieu; }

        public Integer getSoLuongToiDa() { return soLuongToiDa; }
        public void setSoLuongToiDa(Integer soLuongToiDa) { this.soLuongToiDa = soLuongToiDa; }

        public BigDecimal getDonGia() { return donGia; }
        public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }
    }
}
