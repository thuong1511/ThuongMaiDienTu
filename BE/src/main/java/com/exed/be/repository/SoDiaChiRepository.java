package com.exed.be.repository;

import com.exed.be.model.SoDiaChi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoDiaChiRepository extends JpaRepository<SoDiaChi, String> {
    
    @Query("SELECT s FROM SoDiaChi s WHERE s.nguoiDung.maNguoiDung = :maNguoiDung")
    List<SoDiaChi> findByMaNguoiDung(@Param("maNguoiDung") String maNguoiDung);
    
    @Query("SELECT MAX(s.maSo) FROM SoDiaChi s")
    String findMaxMaSo();
}
