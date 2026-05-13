package com.exed.be.service.admin;

import com.exed.be.dto.admin.ChienDichRequest;
import com.exed.be.model.*;
import com.exed.be.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminChienDichService {

    @Autowired
    private ChienDichRepository chienDichRepository;

    @Autowired
    private BangGiaBacThangRepository bangGiaBacThangRepository;

    @Autowired
    private NgheSiRepository ngheSiRepository;

    @Autowired
    private SanPhamRepository sanPhamRepository;

    @Autowired
    private DangKyChienDichRepository dangKyChienDichRepository;

    public List<ChienDich> getAllChienDich() {
        List<ChienDich> list = chienDichRepository.findAll(Sort.by(Sort.Direction.DESC, "ngayTao"));
        // Force initialize tất cả lazy collections
        list.forEach(cd -> {
            if (cd.getHinhAnhChienDichs() != null) cd.getHinhAnhChienDichs().size();
            if (cd.getNgheSi() != null && cd.getNgheSi().getHinhAnhNgheSis() != null)
                cd.getNgheSi().getHinhAnhNgheSis().size();
            if (cd.getSanPham() != null && cd.getSanPham().getHinhAnhSanPhams() != null)
                cd.getSanPham().getHinhAnhSanPhams().size();
            if (cd.getBangGiaBacThangs() != null) cd.getBangGiaBacThangs().size();
        });
        return list;
    }

    public Optional<ChienDich> getChienDichById(String id) {
        Optional<ChienDich> opt = chienDichRepository.findById(id);
        opt.ifPresent(cd -> {
            if (cd.getHinhAnhChienDichs() != null) cd.getHinhAnhChienDichs().size();
            if (cd.getNgheSi() != null && cd.getNgheSi().getHinhAnhNgheSis() != null)
                cd.getNgheSi().getHinhAnhNgheSis().size();
        });
        return opt;
    }

    public List<ChienDich> getChienDichByThoiDiem(String thoiDiem) {
        List<ChienDich> list = chienDichRepository.findByThoiDiem(thoiDiem);
        list.forEach(cd -> {
            if (cd.getHinhAnhChienDichs() != null) cd.getHinhAnhChienDichs().size();
        });
        return list;
    }

    /**
     * Lấy thống kê đăng ký của một chiến dịch
     */
    public List<DangKyChienDich> getDangKyByChienDich(String maChienDich) {
        return dangKyChienDichRepository.findByChienDich_MaChienDich(maChienDich);
    }

    @Transactional
    public ChienDich createChienDich(ChienDichRequest request) {
        // Validate nghệ sĩ
        if (!ngheSiRepository.existsById(request.getMaNgheSi())) {
            throw new RuntimeException("Nghệ sĩ không tồn tại: " + request.getMaNgheSi());
        }
        // Validate sản phẩm
        if (!sanPhamRepository.existsById(request.getMaSanPham())) {
            throw new RuntimeException("Sản phẩm không tồn tại: " + request.getMaSanPham());
        }
        // Kiểm tra mã chiến dịch trùng
        if (chienDichRepository.existsById(request.getMaChienDich())) {
            throw new RuntimeException("Mã chiến dịch đã tồn tại: " + request.getMaChienDich());
        }

        ChienDich cd = new ChienDich();
        cd.setMaChienDich(request.getMaChienDich());
        cd.setMaSanPham(request.getMaSanPham());
        cd.setMaNgheSi(request.getMaNgheSi());
        cd.setTenChienDich(request.getTenChienDich());
        cd.setThoiDiem(request.getThoiDiem() != null ? request.getThoiDiem() : "Sắp bắt đầu");
        cd.setTrangThai(request.getTrangThai());
        cd.setNgayBatDau(request.getNgayBatDau());
        cd.setNgayKetThuc(request.getNgayKetThuc());
        cd.setNguongMOQ(request.getNguongMOQ());
        cd.setNguongToiDa(request.getNguongToiDa());
        cd.setNguoiThamGia(request.getNguoiThamGia() != null ? request.getNguoiThamGia() : 0);
        cd.setPhiThamGia(request.getPhiThamGia());
        cd.setGiaGoc(request.getGiaGoc());
        cd.setTongSoLuongHienTai(0);
        cd.setNgayTao(LocalDateTime.now());

        ChienDich saved = chienDichRepository.save(cd);

        // Lưu bảng giá bậc thang nếu có
        if (request.getBangGiaBacThangs() != null) {
            for (ChienDichRequest.BangGiaBacThangRequest bgr : request.getBangGiaBacThangs()) {
                BangGiaBacThang bg = new BangGiaBacThang();
                bg.setMaChienDich(saved.getMaChienDich());
                bg.setSoLuongToiThieu(bgr.getSoLuongToiThieu());
                bg.setSoLuongToiDa(bgr.getSoLuongToiDa());
                bg.setDonGia(bgr.getDonGia());
                bangGiaBacThangRepository.save(bg);
            }
        }

        return chienDichRepository.findById(saved.getMaChienDich()).orElse(saved);
    }

    @Transactional
    public ChienDich updateChienDich(String maChienDich, ChienDichRequest request) {
        ChienDich cd = chienDichRepository.findById(maChienDich)
                .orElseThrow(() -> new RuntimeException("Chiến dịch không tồn tại: " + maChienDich));

        if (request.getMaSanPham() != null) {
            if (!sanPhamRepository.existsById(request.getMaSanPham())) {
                throw new RuntimeException("Sản phẩm không tồn tại: " + request.getMaSanPham());
            }
            cd.setMaSanPham(request.getMaSanPham());
        }
        if (request.getMaNgheSi() != null) {
            if (!ngheSiRepository.existsById(request.getMaNgheSi())) {
                throw new RuntimeException("Nghệ sĩ không tồn tại: " + request.getMaNgheSi());
            }
            cd.setMaNgheSi(request.getMaNgheSi());
        }
        if (request.getTenChienDich() != null) cd.setTenChienDich(request.getTenChienDich());
        if (request.getThoiDiem() != null) cd.setThoiDiem(request.getThoiDiem());
        if (request.getTrangThai() != null) cd.setTrangThai(request.getTrangThai());
        if (request.getNgayBatDau() != null) cd.setNgayBatDau(request.getNgayBatDau());
        if (request.getNgayKetThuc() != null) cd.setNgayKetThuc(request.getNgayKetThuc());
        if (request.getNguongMOQ() != null) cd.setNguongMOQ(request.getNguongMOQ());
        if (request.getNguongToiDa() != null) cd.setNguongToiDa(request.getNguongToiDa());
        if (request.getNguoiThamGia() != null) cd.setNguoiThamGia(request.getNguoiThamGia());
        if (request.getPhiThamGia() != null) cd.setPhiThamGia(request.getPhiThamGia());
        if (request.getGiaGoc() != null) cd.setGiaGoc(request.getGiaGoc());

        ChienDich saved = chienDichRepository.save(cd);

        // Cập nhật bảng giá bậc thang nếu có
        if (request.getBangGiaBacThangs() != null) {
            bangGiaBacThangRepository.deleteByMaChienDich(maChienDich);
            for (ChienDichRequest.BangGiaBacThangRequest bgr : request.getBangGiaBacThangs()) {
                BangGiaBacThang bg = new BangGiaBacThang();
                bg.setMaChienDich(maChienDich);
                bg.setSoLuongToiThieu(bgr.getSoLuongToiThieu());
                bg.setSoLuongToiDa(bgr.getSoLuongToiDa());
                bg.setDonGia(bgr.getDonGia());
                bangGiaBacThangRepository.save(bg);
            }
        }

        return chienDichRepository.findById(saved.getMaChienDich()).orElse(saved);
    }

    /**
     * Cập nhật trạng thái / thời điểm chiến dịch
     */
    @Transactional
    public ChienDich updateTrangThai(String maChienDich, String thoiDiem, String trangThai) {
        ChienDich cd = chienDichRepository.findById(maChienDich)
                .orElseThrow(() -> new RuntimeException("Chiến dịch không tồn tại"));
        if (thoiDiem != null) cd.setThoiDiem(thoiDiem);
        if (trangThai != null) cd.setTrangThai(trangThai);
        return chienDichRepository.save(cd);
    }

    @Transactional
    public boolean deleteChienDich(String maChienDich) {
        if (!chienDichRepository.existsById(maChienDich)) return false;
        // Xóa bảng giá trước
        bangGiaBacThangRepository.deleteByMaChienDich(maChienDich);
        chienDichRepository.deleteById(maChienDich);
        return true;
    }
}
