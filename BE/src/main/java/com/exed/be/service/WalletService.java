package com.exed.be.service;

import com.exed.be.model.NguoiDung;
import com.exed.be.model.Wallet;
import com.exed.be.model.WalletTransaction;
import com.exed.be.repository.NguoiDungRepository;
import com.exed.be.repository.WalletRepository;
import com.exed.be.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class WalletService {
    
    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private WalletTransactionRepository walletTransactionRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    public Wallet getOrCreateWallet(String maNguoiDung) {
        Optional<Wallet> walletOpt = walletRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
        
        if (walletOpt.isPresent()) {
            return walletOpt.get();
        }
        
        // Create new wallet if not exists
        Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findById(maNguoiDung);
        if (!nguoiDungOpt.isPresent()) {
            throw new RuntimeException("Người dùng không tồn tại");
        }
        
        Wallet wallet = new Wallet();
        wallet.setNguoiDung(nguoiDungOpt.get());
        wallet.setSoDu(BigDecimal.ZERO);
        return walletRepository.save(wallet);
    }
    
    public List<WalletTransaction> getTransactionHistory(Integer maVi) {
        return walletTransactionRepository.findByWallet_MaViOrderByNgayGiaoDichDesc(maVi);
    }
}
