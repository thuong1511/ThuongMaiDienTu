package com.exed.be.repository;

import com.exed.be.model.PhieuChiTietDangKy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuChiTietDangKyRepository extends JpaRepository<PhieuChiTietDangKy, Integer> {
    List<PhieuChiTietDangKy> findByDangKyChienDich_MaDangKy(Integer maDangKy);
}
