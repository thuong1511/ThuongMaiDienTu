package com.exed.be.repository;

import com.exed.be.model.HinhAnhChienDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HinhAnhChienDichRepository extends JpaRepository<HinhAnhChienDich, Integer> {

    List<HinhAnhChienDich> findByMaChienDichOrderByThuTuAsc(String maChienDich);

    void deleteByMaChienDich(String maChienDich);
}
