package com.exed.be.repository;

import com.exed.be.model.SanPhamMauSac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamMauSacRepository
        extends JpaRepository<SanPhamMauSac, SanPhamMauSac.SanPhamMauSacId> {

    List<SanPhamMauSac> findByMaSanPham(String maSanPham);

    Optional<SanPhamMauSac> findByMaSanPhamAndMaMau(String maSanPham, Integer maMau);

    void deleteByMaSanPham(String maSanPham);
}
