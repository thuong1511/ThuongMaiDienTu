package com.exed.be.repository;

import com.exed.be.model.KichThuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KichThuocRepository extends JpaRepository<KichThuoc, Integer> {
    List<KichThuoc> findByLoaiKichThuoc(String loaiKichThuoc);
}
