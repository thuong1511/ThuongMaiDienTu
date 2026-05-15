package com.exed.be.repository;

import com.exed.be.model.CauHinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CauHinhRepository extends JpaRepository<CauHinh, String> {
    List<CauHinh> findByNhom(String nhom);
}
