package com.exed.be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "PhuongXa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhuongXa {
    
    @Id
    @Column(name = "maPhuongXa", length = 5)
    private String maPhuongXa;
    
    @Column(name = "tenPhuongXa", nullable = false, length = 100)
    private String tenPhuongXa;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maTinhThanh")
    @JsonIgnore
    private TinhThanh tinhThanh;
    
    @OneToMany(mappedBy = "phuongXa", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SoDiaChi> soDiaChis;
    
    // Transient field for JSON response
    @Transient
    private String maTinhThanh;
    
    @Transient
    private String tenTinhThanh;
    
    @PostLoad
    private void onLoad() {
        if (tinhThanh != null) {
            this.maTinhThanh = tinhThanh.getMaTinhThanh();
            this.tenTinhThanh = tinhThanh.getTenTinhThanh();
        }
    }
}
