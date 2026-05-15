package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "ChiTietDonHang")
public class ChiTietDonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maChiTietDonHang")
    private Integer maChiTietDonHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maDonHang", nullable = false)
    @JsonIgnore
    private DonHang donHang;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maMau", nullable = false)
    private MauSac mauSac;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maSize", nullable = false)
    private KichThuoc kichThuoc;

    @Column(name = "soLuong", nullable = false)
    private Integer soLuong;

    public Integer getMaChiTietDonHang() { return maChiTietDonHang; }
    public void setMaChiTietDonHang(Integer maChiTietDonHang) { this.maChiTietDonHang = maChiTietDonHang; }

    public DonHang getDonHang() { return donHang; }
    public void setDonHang(DonHang donHang) { this.donHang = donHang; }

    public MauSac getMauSac() { return mauSac; }
    public void setMauSac(MauSac mauSac) { this.mauSac = mauSac; }

    public KichThuoc getKichThuoc() { return kichThuoc; }
    public void setKichThuoc(KichThuoc kichThuoc) { this.kichThuoc = kichThuoc; }

    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }
}
