package com.exed.be.repository;

import com.exed.be.model.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Integer> {

    List<ThongBao> findByMaNguoiDungOrderByNgayTaoDesc(String maNguoiDung);

    long countByMaNguoiDungAndDaDocFalse(String maNguoiDung);

    @Modifying
    @Query("UPDATE ThongBao tb SET tb.daDoc = true WHERE tb.maNguoiDung = :maNguoiDung AND tb.daDoc = false")
    int markAllAsRead(@Param("maNguoiDung") String maNguoiDung);
}
