package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Đơn giao hàng — tạo từ DangKyChienDich sau khi chiến dịch thành công.
 */
@Entity
@Table(name = "DonHang")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DonHang {

    @Id
    @Column(name = "maDonHang", length = 5)
    private String maDonHang;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maDangKy", nullable = false, unique = true)
    private DangKyChienDich dangKyChienDich;

    @Column(name = "giaChotCuoiCung", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaChotCuoiCung;

    @Column(name = "daHoanTien", nullable = false)
    private Boolean daHoanTien = false;

    @Column(name = "soTienHoanLai", precision = 18, scale = 2)
    private BigDecimal soTienHoanLai = BigDecimal.ZERO;

    @Column(name = "ngayHoanTien")
    private LocalDateTime ngayHoanTien;

    @Column(name = "trangThaiGiaoHang", length = 50)
    private String trangThaiGiaoHang = "Đang chuẩn bị";

    @Column(name = "ngayTaoDon")
    private LocalDateTime ngayTaoDon = LocalDateTime.now();

    @OneToMany(mappedBy = "donHang", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChiTietDonHang> chiTietDonHangs;

    @PrePersist
    protected void onCreate() {
        if (ngayTaoDon == null) ngayTaoDon = LocalDateTime.now();
        if (trangThaiGiaoHang == null || trangThaiGiaoHang.isBlank())
            trangThaiGiaoHang = "Đang chuẩn bị";
        if (soTienHoanLai == null) soTienHoanLai = BigDecimal.ZERO;
        if (daHoanTien == null) daHoanTien = false;
    }

    // Getters & Setters
    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }

    public DangKyChienDich getDangKyChienDich() { return dangKyChienDich; }
    public void setDangKyChienDich(DangKyChienDich dk) { this.dangKyChienDich = dk; }

    public BigDecimal getGiaChotCuoiCung() { return giaChotCuoiCung; }
    public void setGiaChotCuoiCung(BigDecimal giaChotCuoiCung) { this.giaChotCuoiCung = giaChotCuoiCung; }

    public Boolean getDaHoanTien() { return daHoanTien; }
    public void setDaHoanTien(Boolean daHoanTien) { this.daHoanTien = daHoanTien; }

    public BigDecimal getSoTienHoanLai() { return soTienHoanLai; }
    public void setSoTienHoanLai(BigDecimal soTienHoanLai) { this.soTienHoanLai = soTienHoanLai; }

    public LocalDateTime getNgayHoanTien() { return ngayHoanTien; }
    public void setNgayHoanTien(LocalDateTime ngayHoanTien) { this.ngayHoanTien = ngayHoanTien; }

    public String getTrangThaiGiaoHang() { return trangThaiGiaoHang; }
    public void setTrangThaiGiaoHang(String trangThaiGiaoHang) { this.trangThaiGiaoHang = trangThaiGiaoHang; }

    public LocalDateTime getNgayTaoDon() { return ngayTaoDon; }
    public void setNgayTaoDon(LocalDateTime ngayTaoDon) { this.ngayTaoDon = ngayTaoDon; }

    public List<ChiTietDonHang> getChiTietDonHangs() { return chiTietDonHangs; }
    public void setChiTietDonHangs(List<ChiTietDonHang> chiTietDonHangs) { this.chiTietDonHangs = chiTietDonHangs; }
}
