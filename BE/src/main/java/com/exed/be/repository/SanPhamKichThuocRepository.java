package com.exed.be.repository;

import com.exed.be.model.SanPhamKichThuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamKichThuocRepository
        extends JpaRepository<SanPhamKichThuoc, SanPhamKichThuoc.SanPhamKichThuocId> {

    List<SanPhamKichThuoc> findByMaSanPham(String maSanPham);

    Optional<SanPhamKichThuoc> findByMaSanPhamAndMaSize(String maSanPham, Integer maSize);

    void deleteByMaSanPham(String maSanPham);
}
