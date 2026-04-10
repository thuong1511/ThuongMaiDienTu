package com.exed.be.repository;

import com.exed.be.model.DangKyChienDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DangKyChienDichRepository extends JpaRepository<DangKyChienDich, Integer> {
    List<DangKyChienDich> findByNguoiDung_MaNguoiDung(String maNguoiDung);
    List<DangKyChienDich> findByChienDich_MaChienDich(String maChienDich);
    Optional<DangKyChienDich> findByThanhToan_MaThanhToan(Integer maThanhToan);
}
