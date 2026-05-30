package com.exed.be.repository;

import com.exed.be.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Integer> {
    Optional<Wallet> findByNguoiDung_MaNguoiDung(String maNguoiDung);
}
