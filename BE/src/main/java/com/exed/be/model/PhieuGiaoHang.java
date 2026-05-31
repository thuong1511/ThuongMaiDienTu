package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "PhieuGiaoHang")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiaoHang {
    
    @Id
    @Column(name = "maVanDon", length = 50)
    private String maVanDon;
    
    @ManyToOne
    @JoinColumn(name = "maDonHang", nullable = false)
    @JsonIgnore
    private DonHang donHang;
    
    @Column(name = "donViVanChuyen", length = 50, nullable = false)
    private String donViVanChuyen;
    
    @Column(name = "nguoiNhan", length = 100)
    private String nguoiNhan;
    
    @Column(name = "ngayDangKy", nullable = false)
    private LocalDateTime ngayDangKy;
    
    @Column(name = "ngayChuanBi")
    private LocalDateTime ngayChuanBi;
    
    @Column(name = "ngayGiao")
    private LocalDateTime ngayGiao;
    
    @Column(name = "ngayNhan")
    private LocalDateTime ngayNhan;
    
    @Column(name = "ghiChu", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChu;
}
