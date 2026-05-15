package com.exed.be.repository;

import com.exed.be.model.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, String> {

    Optional<DonHang> findByDangKyChienDich_MaDangKy(Integer maDangKy);

    boolean existsByDangKyChienDich_MaDangKy(Integer maDangKy);
}
