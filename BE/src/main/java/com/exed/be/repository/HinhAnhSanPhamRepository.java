package com.exed.be.repository;

import com.exed.be.model.HinhAnhSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HinhAnhSanPhamRepository extends JpaRepository<HinhAnhSanPham, Integer> {
    List<HinhAnhSanPham> findByMaSanPhamOrderByThuTuAsc(String maSanPham);
    void deleteByMaSanPham(String maSanPham);
}
