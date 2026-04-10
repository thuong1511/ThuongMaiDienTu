package com.exed.be.repository;

import com.exed.be.model.ChienDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChienDichRepository extends JpaRepository<ChienDich, String> {
    List<ChienDich> findByThoiDiem(String thoiDiem);
}
