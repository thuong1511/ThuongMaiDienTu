package com.exed.be.repository;

import com.exed.be.model.HinhAnhNgheSi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HinhAnhNgheSiRepository extends JpaRepository<HinhAnhNgheSi, Integer> {
    List<HinhAnhNgheSi> findByMaNgheSiOrderByThuTuAsc(String maNgheSi);
    void deleteByMaNgheSi(String maNgheSi);
}
