package com.exed.be.repository;

import com.exed.be.model.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    Optional<DanhGia> findByMaDonHang(String maDonHang);
    List<DanhGia> findAllByOrderByNgayDanhGiaDesc();
    boolean existsByMaDonHang(String maDonHang);

    @Query("SELECT DISTINCT dg FROM DanhGia dg LEFT JOIN FETCH dg.hinhAnhDanhGias JOIN dg.donHang dh JOIN dh.dangKyChienDich dk WHERE dk.chienDich.maChienDich = :maChienDich ORDER BY dg.ngayDanhGia DESC")
    List<DanhGia> findByMaChienDich(@Param("maChienDich") String maChienDich);
}

