package com.exed.be.repository;

import com.exed.be.model.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, String> {
    List<SanPham> findByDanhMuc_MaDanhMuc(String maDanhMuc);
}
