package com.exed.be.dto.admin;

import java.util.List;

/**
 * Thống kê 1 sản phẩm cho trang admin-product-detail
 */
public class SanPhamThongKeDTO {

    private List<MauItem> mauSacs;
    private Integer tongChienDich;     // số CD đang dùng SP

    public List<MauItem> getMauSacs() { return mauSacs; }
    public void setMauSacs(List<MauItem> mauSacs) { this.mauSacs = mauSacs; }

    public Integer getTongChienDich() { return tongChienDich; }
    public void setTongChienDich(Integer tongChienDich) { this.tongChienDich = tongChienDich; }

    public static class MauItem {
        private Integer maMau;
        private String tenMau;
        private Integer soLuongToiDa;
        private Integer daDat;
        private Integer conLai;

        public MauItem() {}
        public MauItem(Integer maMau, String tenMau, Integer soLuongToiDa, Integer daDat, Integer conLai) {
            this.maMau = maMau; this.tenMau = tenMau;
            this.soLuongToiDa = soLuongToiDa; this.daDat = daDat; this.conLai = conLai;
        }

        public Integer getMaMau() { return maMau; }
        public void setMaMau(Integer maMau) { this.maMau = maMau; }

        public String getTenMau() { return tenMau; }
        public void setTenMau(String tenMau) { this.tenMau = tenMau; }

        public Integer getSoLuongToiDa() { return soLuongToiDa; }
        public void setSoLuongToiDa(Integer soLuongToiDa) { this.soLuongToiDa = soLuongToiDa; }

        public Integer getDaDat() { return daDat; }
        public void setDaDat(Integer daDat) { this.daDat = daDat; }

        public Integer getConLai() { return conLai; }
        public void setConLai(Integer conLai) { this.conLai = conLai; }
    }
}
