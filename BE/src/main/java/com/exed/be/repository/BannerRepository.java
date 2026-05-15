package com.exed.be.repository;

import com.exed.be.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Integer> {
    List<Banner> findAllByOrderByThuTuAsc();
    List<Banner> findByDangHienThiTrueOrderByThuTuAsc();
}
