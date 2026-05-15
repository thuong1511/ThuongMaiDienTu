package com.exed.be.dto.admin;

import java.util.List;

/**
 * Request gửi thông báo từ admin.
 *
 * Đối tượng nhận, ưu tiên theo thứ tự:
 *   1. Nếu có maNguoiDungs → gửi cho danh sách user
 *   2. Nếu có vaiTro      → gửi cho tất cả user thuộc vai trò đó (vd "Khách hàng")
 *   3. Còn lại            → throw lỗi
 */
public class ThongBaoRequest {

    private List<String> maNguoiDungs;
    private String vaiTro;
    private String tieuDe;
    private String noiDung;
    private String loaiThongBao;       // optional: "Hệ Thống" (mặc định) | "Khuyến mãi" | ...

    public List<String> getMaNguoiDungs() { return maNguoiDungs; }
    public void setMaNguoiDungs(List<String> maNguoiDungs) { this.maNguoiDungs = maNguoiDungs; }

    public String getVaiTro() { return vaiTro; }
    public void setVaiTro(String vaiTro) { this.vaiTro = vaiTro; }

    public String getTieuDe() { return tieuDe; }
    public void setTieuDe(String tieuDe) { this.tieuDe = tieuDe; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public String getLoaiThongBao() { return loaiThongBao; }
    public void setLoaiThongBao(String loaiThongBao) { this.loaiThongBao = loaiThongBao; }
}
