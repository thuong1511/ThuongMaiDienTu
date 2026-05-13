package com.exed.be.service;

import com.exed.be.dto.DangKyChienDichRequest;
import com.exed.be.model.*;
import com.exed.be.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DangKyChienDichService {
    
    @Autowired
    private DangKyChienDichRepository dangKyChienDichRepository;
    
    @Autowired
    private ThanhToanRepository thanhToanRepository;
    
    @Autowired
    private BangGiaBacThangRepository bangGiaBacThangRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @Autowired
    private ChienDichRepository chienDichRepository;
    
    public List<DangKyChienDich> getAllDangKy() {
        return dangKyChienDichRepository.findAll();
    }
    
    public Optional<DangKyChienDich> getDangKyById(Integer maDangKy) {
        return dangKyChienDichRepository.findById(maDangKy);
    }
    
    public List<DangKyChienDich> getDangKyByNguoiDung(String maNguoiDung) {
        return dangKyChienDichRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
    }
    
    public List<DangKyChienDich> getDangKyByChienDich(String maChienDich) {
        return dangKyChienDichRepository.findByChienDich_MaChienDich(maChienDich);
    }
    
    public DangKyChienDich createDangKy(DangKyChienDichRequest request) {
        // Validate thanh toán
        Optional<ThanhToan> thanhToan = thanhToanRepository.findById(request.getMaThanhToan());
        if (!thanhToan.isPresent()) {
            throw new RuntimeException("Thanh toán không tồn tại");
        }
        
        // Validate bảng giá
        Optional<BangGiaBacThang> bangGia = bangGiaBacThangRepository.findById(request.getMaMucGia());
        if (!bangGia.isPresent()) {
            throw new RuntimeException("Mức giá không tồn tại");
        }
        
        // Validate người dùng
        Optional<NguoiDung> nguoiDung = nguoiDungRepository.findById(request.getMaNguoiDung());
        if (!nguoiDung.isPresent()) {
            throw new RuntimeException("Người dùng không tồn tại");
        }
        
        // Validate chiến dịch
        Optional<ChienDich> chienDich = chienDichRepository.findById(request.getMaChienDich());
        if (!chienDich.isPresent()) {
            throw new RuntimeException("Chiến dịch không tồn tại");
        }
        
        // Validate số lượng (1-2)
        if (request.getTongSoLuong() < 1 ) {
            throw new RuntimeException("Số lượng phải từ 1 sản phẩm trở lên");
        }
        
        DangKyChienDich dangKy = new DangKyChienDich();
        dangKy.setThanhToan(thanhToan.get());
        dangKy.setBangGiaBacThang(bangGia.get());
        dangKy.setNguoiDung(nguoiDung.get());
        dangKy.setChienDich(chienDich.get());
        dangKy.setTongSoLuong(request.getTongSoLuong());
        
        return dangKyChienDichRepository.save(dangKy);
    }
    
    public DangKyChienDich huyDangKy(Integer maDangKy) {
        Optional<DangKyChienDich> existing = dangKyChienDichRepository.findById(maDangKy);
        if (existing.isPresent()) {
            DangKyChienDich dangKy = existing.get();
            dangKy.setDaHuy(true);
            return dangKyChienDichRepository.save(dangKy);
        }
        return null;
    }
    
    public boolean deleteDangKy(Integer maDangKy) {
        if (dangKyChienDichRepository.existsById(maDangKy)) {
            dangKyChienDichRepository.deleteById(maDangKy);
            return true;
        }
        return false;
    }
}
