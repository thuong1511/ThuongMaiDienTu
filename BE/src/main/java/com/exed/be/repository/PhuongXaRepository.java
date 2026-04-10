package com.exed.be.repository;

import com.exed.be.model.PhuongXa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhuongXaRepository extends JpaRepository<PhuongXa, String> {
    
    @Query("SELECT p FROM PhuongXa p WHERE p.tinhThanh.maTinhThanh = :maTinhThanh")
    List<PhuongXa> findByMaTinhThanh(@Param("maTinhThanh") String maTinhThanh);
}
