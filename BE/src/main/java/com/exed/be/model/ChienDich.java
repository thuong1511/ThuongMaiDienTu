package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ChienDich")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChienDich {
    
    @Id
    @Column(name = "maChienDich", length = 5)
    private String maChienDich;
    
    @Column(name = "maSanPham", length = 5, nullable = false)
    private String maSanPham;
    
    @Column(name = "maNgheSi", length = 5, nullable = false)
    private String maNgheSi;
    
    @Column(name = "tenChienDich", length = 200, nullable = false)
    private String tenChienDich;
    
    @Column(name = "thoiDiem", length = 50, nullable = false)
    private String thoiDiem = "Sắp bắt đầu";
    
    @Column(name = "trangThai", length = 50)
    private String trangThai;
    
    @Column(name = "ngayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;
    
    @Column(name = "ngayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;
    
    @Column(name = "nguongMOQ", nullable = false)
    private Integer nguongMOQ;
    
    @Column(name = "nguongToiDa", nullable = false)
    private Integer nguongToiDa;
    
    @Column(name = "nguoiThamGia", nullable = false)
    private Integer nguoiThamGia;
    
    @Column(name = "phiThamGia", precision = 18, scale = 2)
    private BigDecimal phiThamGia = BigDecimal.ZERO;
    
    @Column(name = "giaGoc", precision = 18, scale = 2)
    private BigDecimal giaGoc = BigDecimal.ZERO;
    
    @Column(name = "tongSoLuongHienTai")
    private Integer tongSoLuongHienTai = 0;
    
    @Column(name = "ngayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maNgheSi", insertable = false, updatable = false)
    private NgheSi ngheSi;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maSanPham", insertable = false, updatable = false)
    private SanPham sanPham;
    
    @OneToMany(mappedBy = "chienDich", fetch = FetchType.EAGER)
    @OrderBy("soLuongToiThieu ASC")
    private List<BangGiaBacThang> bangGiaBacThangs;
    
    @OneToMany(mappedBy = "chienDich", fetch = FetchType.EAGER)
    @OrderBy("thuTu ASC")
    private List<HinhAnhChienDich> hinhAnhChienDichs;
    
    // Getters and Setters
    public String getMaChienDich() {
        return maChienDich;
    }
    
    public void setMaChienDich(String maChienDich) {
        this.maChienDich = maChienDich;
    }
    
    public String getMaSanPham() {
        return maSanPham;
    }
    
    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }
    
    public String getMaNgheSi() {
        return maNgheSi;
    }
    
    public void setMaNgheSi(String maNgheSi) {
        this.maNgheSi = maNgheSi;
    }
    
    public String getTenChienDich() {
        return tenChienDich;
    }
    
    public void setTenChienDich(String tenChienDich) {
        this.tenChienDich = tenChienDich;
    }
    
    public String getThoiDiem() {
        return thoiDiem;
    }
    
    public void setThoiDiem(String thoiDiem) {
        this.thoiDiem = thoiDiem;
    }
    
    public String getTrangThai() {
        return trangThai;
    }
    
    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
    
    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }
    
    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }
    
    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }
    
    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }
    
    public Integer getNguongMOQ() {
        return nguongMOQ;
    }
    
    public void setNguongMOQ(Integer nguongMOQ) {
        this.nguongMOQ = nguongMOQ;
    }
    
    public Integer getNguongToiDa() {
        return nguongToiDa;
    }
    
    public void setNguongToiDa(Integer nguongToiDa) {
        this.nguongToiDa = nguongToiDa;
    }
    
    public Integer getNguoiThamGia() {
        return nguoiThamGia;
    }
    
    public void setNguoiThamGia(Integer nguoiThamGia) {
        this.nguoiThamGia = nguoiThamGia;
    }
    
    public BigDecimal getPhiThamGia() {
        return phiThamGia;
    }
    
    public void setPhiThamGia(BigDecimal phiThamGia) {
        this.phiThamGia = phiThamGia;
    }
    
    public BigDecimal getGiaGoc() {
        return giaGoc;
    }
    
    public void setGiaGoc(BigDecimal giaGoc) {
        this.giaGoc = giaGoc;
    }
    
    public Integer getTongSoLuongHienTai() {
        return tongSoLuongHienTai;
    }
    
    public void setTongSoLuongHienTai(Integer tongSoLuongHienTai) {
        this.tongSoLuongHienTai = tongSoLuongHienTai;
    }
    
    public LocalDateTime getNgayTao() {
        return ngayTao;
    }
    
    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }
    
    public NgheSi getNgheSi() {
        return ngheSi;
    }
    
    public void setNgheSi(NgheSi ngheSi) {
        this.ngheSi = ngheSi;
    }
    
    public SanPham getSanPham() {
        return sanPham;
    }
    
    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }
    
    public List<BangGiaBacThang> getBangGiaBacThangs() {
        return bangGiaBacThangs;
    }
    
    public void setBangGiaBacThangs(List<BangGiaBacThang> bangGiaBacThangs) {
        this.bangGiaBacThangs = bangGiaBacThangs;
    }
    
    public List<HinhAnhChienDich> getHinhAnhChienDichs() {
        return hinhAnhChienDichs;
    }
    
    public void setHinhAnhChienDichs(List<HinhAnhChienDich> hinhAnhChienDichs) {
        this.hinhAnhChienDichs = hinhAnhChienDichs;
    }
}
