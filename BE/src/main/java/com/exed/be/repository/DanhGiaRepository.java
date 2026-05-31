package com.exed.be.repository;

import com.exed.be.model.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    Optional<DanhGia> findByMaDonHang(String maDonHang);
    List<DanhGia> findAllByOrderByNgayDanhGiaDesc();
    boolean existsByMaDonHang(String maDonHang);
}
