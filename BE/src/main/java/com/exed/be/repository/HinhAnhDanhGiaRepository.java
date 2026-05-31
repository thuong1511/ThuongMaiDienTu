package com.exed.be.repository;

import com.exed.be.model.HinhAnhDanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HinhAnhDanhGiaRepository extends JpaRepository<HinhAnhDanhGia, Integer> {
    List<HinhAnhDanhGia> findByMaDanhGiaOrderByThuTu(Integer maDanhGia);
}
