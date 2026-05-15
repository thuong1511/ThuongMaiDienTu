package com.exed.be.dto.admin;

import java.util.List;

/**
 * Request tạo / sửa sản phẩm với đầy đủ thông tin biến thể.
 *
 *  - mauSacs / kichThuocs / hinhAnhs là tùy chọn
 *  - Khi update, nếu truyền null sẽ giữ nguyên; nếu truyền list rỗng [] sẽ xóa hết
 */
public class SanPhamRequest {

    private String maSanPham;
    private String tenSanPham;
    private String moTa;
    private String maDanhMuc;

    private List<MauSacItem> mauSacs;
    private List<Integer> kichThuocs;        // danh sách maSize
    private List<HinhAnhItem> hinhAnhs;

    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }

    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public String getMaDanhMuc() { return maDanhMuc; }
    public void setMaDanhMuc(String maDanhMuc) { this.maDanhMuc = maDanhMuc; }

    public List<MauSacItem> getMauSacs() { return mauSacs; }
    public void setMauSacs(List<MauSacItem> mauSacs) { this.mauSacs = mauSacs; }

    public List<Integer> getKichThuocs() { return kichThuocs; }
    public void setKichThuocs(List<Integer> kichThuocs) { this.kichThuocs = kichThuocs; }

    public List<HinhAnhItem> getHinhAnhs() { return hinhAnhs; }
    public void setHinhAnhs(List<HinhAnhItem> hinhAnhs) { this.hinhAnhs = hinhAnhs; }

    public static class MauSacItem {
        /** Mã màu nếu đã có; null nếu cần tạo mới (sẽ dùng tenMau) */
        private Integer maMau;
        private String tenMau;
        private Integer soLuongToiDa;

        public Integer getMaMau() { return maMau; }
        public void setMaMau(Integer maMau) { this.maMau = maMau; }

        public String getTenMau() { return tenMau; }
        public void setTenMau(String tenMau) { this.tenMau = tenMau; }

        public Integer getSoLuongToiDa() { return soLuongToiDa; }
        public void setSoLuongToiDa(Integer soLuongToiDa) { this.soLuongToiDa = soLuongToiDa; }
    }

    public static class HinhAnhItem {
        private String duongDan;
        private Integer thuTu;

        public String getDuongDan() { return duongDan; }
        public void setDuongDan(String duongDan) { this.duongDan = duongDan; }

        public Integer getThuTu() { return thuTu; }
        public void setThuTu(Integer thuTu) { this.thuTu = thuTu; }
    }
}
