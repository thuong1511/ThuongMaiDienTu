package com.exed.be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "DanhMuc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanhMuc {
    @Id
    @Column(name = "maDanhMuc", length = 5)
    private String maDanhMuc;

    @Column(name = "tenDanhMuc", length = 50)
    private String tenDanhMuc;

    @Column(name = "loaiKichThuoc", length = 20)
    private String loaiKichThuoc;
}
