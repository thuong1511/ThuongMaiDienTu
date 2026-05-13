package com.exed.be.repository;

import com.exed.be.model.BangGiaBacThang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BangGiaBacThangRepository extends JpaRepository<BangGiaBacThang, Integer> {
    List<BangGiaBacThang> findByMaChienDich(String maChienDich);
    void deleteByMaChienDich(String maChienDich);
}
