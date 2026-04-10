package com.exed.be.service;

import com.exed.be.dto.SoDiaChiRequest;
import com.exed.be.model.NguoiDung;
import com.exed.be.model.PhuongXa;
import com.exed.be.model.SoDiaChi;
import com.exed.be.repository.NguoiDungRepository;
import com.exed.be.repository.PhuongXaRepository;
import com.exed.be.repository.SoDiaChiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SoDiaChiService {
    
    @Autowired
    private SoDiaChiRepository soDiaChiRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @Autowired
    private PhuongXaRepository phuongXaRepository;
    
    public List<SoDiaChi> getAllSoDiaChi() {
        return soDiaChiRepository.findAll();
    }
    
    public Optional<SoDiaChi> getSoDiaChiById(String maSo) {
        return soDiaChiRepository.findById(maSo);
    }
    
    public List<SoDiaChi> getSoDiaChiByMaNguoiDung(String maNguoiDung) {
        return soDiaChiRepository.findByMaNguoiDung(maNguoiDung);
    }
    
    @Transactional
    public SoDiaChi createSoDiaChi(SoDiaChiRequest request) {
        // Generate new maSo
        String maxMaSo = soDiaChiRepository.findMaxMaSo();
        int nextNumber = 1;
        if (maxMaSo != null && maxMaSo.startsWith("DC")) {
            nextNumber = Integer.parseInt(maxMaSo.substring(2)) + 1;
        }
        String newMaSo = String.format("DC%03d", nextNumber);
        
        // Find NguoiDung
        NguoiDung nguoiDung = nguoiDungRepository.findById(request.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        
        // Find PhuongXa
        PhuongXa phuongXa = phuongXaRepository.findById(request.getMaPhuongXa())
                .orElseThrow(() -> new RuntimeException("Phường/Xã không tồn tại"));
        
        // Nếu địa chỉ mới là mặc định, bỏ mặc định của các địa chỉ cũ
        if (Boolean.TRUE.equals(request.getMacDinh())) {
            List<SoDiaChi> existingAddresses = soDiaChiRepository.findByMaNguoiDung(request.getMaNguoiDung());
            for (SoDiaChi addr : existingAddresses) {
                addr.setMacDinh(false);
                soDiaChiRepository.save(addr);
            }
        }
        
        SoDiaChi soDiaChi = new SoDiaChi();
        soDiaChi.setMaSo(newMaSo);
        soDiaChi.setNguoiDung(nguoiDung);
        soDiaChi.setPhuongXa(phuongXa);
        soDiaChi.setHoTen(request.getHoTen());
        soDiaChi.setSoDienThoai(request.getSoDienThoai());
        soDiaChi.setDiaChiChiTiet(request.getDiaChiChiTiet());
        soDiaChi.setMacDinh(request.getMacDinh() != null ? request.getMacDinh() : false);
        
        return soDiaChiRepository.save(soDiaChi);
    }
    
    @Transactional
    public SoDiaChi updateSoDiaChi(String maSo, SoDiaChiRequest request) {
        SoDiaChi soDiaChi = soDiaChiRepository.findById(maSo)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));
        
        // Nếu địa chỉ được đặt làm mặc định, bỏ mặc định của các địa chỉ khác
        if (Boolean.TRUE.equals(request.getMacDinh())) {
            List<SoDiaChi> existingAddresses = soDiaChiRepository.findByMaNguoiDung(soDiaChi.getNguoiDung().getMaNguoiDung());
            for (SoDiaChi addr : existingAddresses) {
                if (!addr.getMaSo().equals(maSo)) {
                    addr.setMacDinh(false);
                    soDiaChiRepository.save(addr);
                }
            }
        }
        
        // Update PhuongXa if changed (only if not empty)
        if (request.getMaPhuongXa() != null && !request.getMaPhuongXa().trim().isEmpty()) {
            PhuongXa phuongXa = phuongXaRepository.findById(request.getMaPhuongXa())
                    .orElseThrow(() -> new RuntimeException("Phường/Xã không tồn tại"));
            soDiaChi.setPhuongXa(phuongXa);
        }
        
        if (request.getHoTen() != null && !request.getHoTen().trim().isEmpty()) {
            soDiaChi.setHoTen(request.getHoTen());
        }
        if (request.getSoDienThoai() != null && !request.getSoDienThoai().trim().isEmpty()) {
            soDiaChi.setSoDienThoai(request.getSoDienThoai());
        }
        if (request.getDiaChiChiTiet() != null && !request.getDiaChiChiTiet().trim().isEmpty()) {
            soDiaChi.setDiaChiChiTiet(request.getDiaChiChiTiet());
        }
        if (request.getMacDinh() != null) {
            soDiaChi.setMacDinh(request.getMacDinh());
        }
        
        return soDiaChiRepository.save(soDiaChi);
    }
    
    @Transactional
    public void deleteSoDiaChi(String maSo) {
        if (!soDiaChiRepository.existsById(maSo)) {
            throw new RuntimeException("Địa chỉ không tồn tại");
        }
        soDiaChiRepository.deleteById(maSo);
    }
    
    @Transactional
    public SoDiaChi setDefaultAddress(String maSo) {
        SoDiaChi soDiaChi = soDiaChiRepository.findById(maSo)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));
        
        // Bỏ mặc định của tất cả địa chỉ khác của người dùng này
        List<SoDiaChi> existingAddresses = soDiaChiRepository.findByMaNguoiDung(soDiaChi.getNguoiDung().getMaNguoiDung());
        for (SoDiaChi addr : existingAddresses) {
            if (!addr.getMaSo().equals(maSo)) {
                addr.setMacDinh(false);
                soDiaChiRepository.save(addr);
            }
        }
        
        // Đặt địa chỉ này làm mặc định
        soDiaChi.setMacDinh(true);
        return soDiaChiRepository.save(soDiaChi);
    }
}
