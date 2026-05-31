package com.exed.be.repository;

import com.exed.be.model.PhieuGiaoHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhieuGiaoHangRepository extends JpaRepository<PhieuGiaoHang, String> {
    
    Optional<PhieuGiaoHang> findByDonHang_MaDonHang(String maDonHang);
}
