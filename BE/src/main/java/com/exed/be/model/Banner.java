package com.exed.be.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Banner")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maBanner")
    private Integer maBanner;

    @Column(name = "duongDan", length = 255, nullable = false)
    private String duongDan;

    @Column(name = "tieuDe", length = 150)
    private String tieuDe;

    @Column(name = "thuTu", nullable = false)
    private Integer thuTu = 1;

    @Column(name = "dangHienThi", nullable = false)
    private Boolean dangHienThi = false;

    @Column(name = "ngayTao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        if (ngayTao == null) ngayTao = LocalDateTime.now();
        if (dangHienThi == null) dangHienThi = false;
        if (thuTu == null) thuTu = 1;
    }

    public Integer getMaBanner() { return maBanner; }
    public void setMaBanner(Integer maBanner) { this.maBanner = maBanner; }

    public String getDuongDan() { return duongDan; }
    public void setDuongDan(String duongDan) { this.duongDan = duongDan; }

    public String getTieuDe() { return tieuDe; }
    public void setTieuDe(String tieuDe) { this.tieuDe = tieuDe; }

    public Integer getThuTu() { return thuTu; }
    public void setThuTu(Integer thuTu) { this.thuTu = thuTu; }

    public Boolean getDangHienThi() { return dangHienThi; }
    public void setDangHienThi(Boolean dangHienThi) { this.dangHienThi = dangHienThi; }

    public LocalDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; }
}
