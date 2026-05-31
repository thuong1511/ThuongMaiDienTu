package com.exed.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "HinhAnhDanhGia")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HinhAnhDanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maHinhAnh")
    private Integer maHinhAnh;

    @Column(name = "maDanhGia", nullable = false)
    private Integer maDanhGia;

    @Column(name = "duongDan", length = 225, nullable = false)
    private String duongDan;

    @Column(name = "thuTu")
    private Integer thuTu;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maDanhGia", insertable = false, updatable = false)
    @JsonIgnore
    private DanhGia danhGia;
}
