package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "DanhGia")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maDanhGia")
    private Integer maDanhGia;

    @Column(name = "maDonHang", length = 5, nullable = false)
    private String maDonHang;

    @Column(name = "diemDanhGia")
    private Integer diemDanhGia;

    @Column(name = "binhLuan", columnDefinition = "NVARCHAR(MAX)")
    private String binhLuan;

    @Column(name = "ngayDanhGia")
    private LocalDateTime ngayDanhGia;

    @Column(name = "anDanh")
    private Integer anDanh; // 0 = không ẩn danh, 1 = ẩn danh

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maDonHang", insertable = false, updatable = false)
    @JsonIgnore
    private DonHang donHang;

    @OneToMany(mappedBy = "danhGia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HinhAnhDanhGia> hinhAnhDanhGias;

    @PrePersist
    protected void onCreate() {
        if (ngayDanhGia == null) {
            ngayDanhGia = LocalDateTime.now();
        }
        if (anDanh == null) {
            anDanh = 0; // Default: không ẩn danh
        }
    }
}
