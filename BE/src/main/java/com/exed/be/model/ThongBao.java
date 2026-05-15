package com.exed.be.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ThongBao")
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maThongBao")
    private Integer maThongBao;

    @Column(name = "maNguoiDung", length = 5, nullable = false)
    private String maNguoiDung;

    @Column(name = "tieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "noiDung", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String noiDung;

    @Column(name = "loaiThongBao", length = 30)
    private String loaiThongBao = "Hệ Thống";

    @Column(name = "daDoc", nullable = false)
    private Boolean daDoc = false;

    @Column(name = "ngayTao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        if (ngayTao == null) ngayTao = LocalDateTime.now();
        if (daDoc == null) daDoc = false;
        if (loaiThongBao == null || loaiThongBao.isBlank()) loaiThongBao = "Hệ Thống";
    }

    public Integer getMaThongBao() { return maThongBao; }
    public void setMaThongBao(Integer maThongBao) { this.maThongBao = maThongBao; }

    public String getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(String maNguoiDung) { this.maNguoiDung = maNguoiDung; }

    public String getTieuDe() { return tieuDe; }
    public void setTieuDe(String tieuDe) { this.tieuDe = tieuDe; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public String getLoaiThongBao() { return loaiThongBao; }
    public void setLoaiThongBao(String loaiThongBao) { this.loaiThongBao = loaiThongBao; }

    public Boolean getDaDoc() { return daDoc; }
    public void setDaDoc(Boolean daDoc) { this.daDoc = daDoc; }

    public LocalDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; }
}
