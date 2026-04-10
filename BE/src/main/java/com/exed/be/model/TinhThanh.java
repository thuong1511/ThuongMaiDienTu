package com.exed.be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "TinhThanh")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TinhThanh {
    
    @Id
    @Column(name = "maTinhThanh", length = 5)
    private String maTinhThanh;
    
    @Column(name = "tenTinhThanh", nullable = false, length = 100)
    private String tenTinhThanh;
    
    @OneToMany(mappedBy = "tinhThanh", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PhuongXa> phuongXas;
}
