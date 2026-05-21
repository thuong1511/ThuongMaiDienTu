package com.exed.be.repository;

import com.exed.be.model.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, String> {

    Optional<DonHang> findByDangKyChienDich_MaDangKy(Integer maDangKy);

    boolean existsByDangKyChienDich_MaDangKy(Integer maDangKy);
    
    /**
     * Lấy tất cả đơn hàng của một người dùng
     */
    @Query("SELECT dh FROM DonHang dh WHERE dh.dangKyChienDich.nguoiDung.maNguoiDung = :maNguoiDung ORDER BY dh.ngayTaoDon DESC")
    List<DonHang> findByNguoiDung(@Param("maNguoiDung") String maNguoiDung);
}
