package com.exed.be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "SoDiaChi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SoDiaChi {
    
    @Id
    @Column(name = "maSo", length = 5)
    private String maSo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNguoiDung")
    @JsonIgnore
    private NguoiDung nguoiDung;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maPhuongXa")
    @JsonIgnore
    private PhuongXa phuongXa;
    
    @Column(name = "hoTen", nullable = false, length = 100)
    private String hoTen;
    
    @Column(name = "soDienThoai", nullable = false, length = 15)
    private String soDienThoai;
    
    @Column(name = "diaChiChiTiet", nullable = false, length = 100)
    private String diaChiChiTiet;
    
    @Column(name = "macDinh")
    private Boolean macDinh = false;
    
    // Transient fields for easier JSON response
    @Transient
    private String maPhuongXa;
    
    @Transient
    private String tenPhuongXa;
    
    @Transient
    private String tenTinhThanh;
    
    @Transient
    private String maTinhThanh;
    
    @PostLoad
    private void onLoad() {
        if (phuongXa != null) {
            this.maPhuongXa = phuongXa.getMaPhuongXa();
            this.tenPhuongXa = phuongXa.getTenPhuongXa();
            if (phuongXa.getTinhThanh() != null) {
                this.tenTinhThanh = phuongXa.getTinhThanh().getTenTinhThanh();
                this.maTinhThanh = phuongXa.getTinhThanh().getMaTinhThanh();
            }
        }
    }
}
