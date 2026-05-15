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

    @Autowired
    private com.exed.be.repository.HinhAnhChienDichRepository hinhAnhChienDichRepository;

    @Autowired
    private AdminUploadService adminUploadService;

    @Autowired
    private com.exed.be.repository.PhieuChiTietDangKyRepository phieuChiTietDangKyRepository;

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
     * Sinh mã chiến dịch tiếp theo (CD001, CD002, ...)
     */
    public String generateNextMaChienDich() {
        List<ChienDich> all = chienDichRepository.findAll();
        int max = 0;
        for (ChienDich cd : all) {
            String ma = cd.getMaChienDich();
            if (ma != null && ma.startsWith("CD")) {
                try {
                    int n = Integer.parseInt(ma.substring(2));
                    if (n > max) max = n;
                } catch (NumberFormatException ignored) {}
            }
        }
        return String.format("CD%03d", max + 1);
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
        // Xóa ảnh + bảng giá trước
        List<com.exed.be.model.HinhAnhChienDich> anhs =
                hinhAnhChienDichRepository.findByMaChienDichOrderByThuTuAsc(maChienDich);
        for (com.exed.be.model.HinhAnhChienDich a : anhs) {
            adminUploadService.deleteFile(a.getDuongDan());
        }
        hinhAnhChienDichRepository.deleteByMaChienDich(maChienDich);
        bangGiaBacThangRepository.deleteByMaChienDich(maChienDich);
        chienDichRepository.deleteById(maChienDich);
        return true;
    }

    // ────────────────────────────────────────────────────────────
    // QUẢN LÝ ẢNH CHIẾN DỊCH
    // ────────────────────────────────────────────────────────────

    public List<com.exed.be.model.HinhAnhChienDich> getHinhAnh(String maChienDich) {
        return hinhAnhChienDichRepository.findByMaChienDichOrderByThuTuAsc(maChienDich);
    }

    @Transactional
    public com.exed.be.model.HinhAnhChienDich themHinhAnh(
            String maChienDich, String duongDan, Integer thuTu) {
        if (!chienDichRepository.existsById(maChienDich)) {
            throw new RuntimeException("Chiến dịch không tồn tại: " + maChienDich);
        }
        com.exed.be.model.HinhAnhChienDich anh = new com.exed.be.model.HinhAnhChienDich();
        anh.setMaChienDich(maChienDich);
        anh.setDuongDan(duongDan);
        anh.setThuTu(thuTu != null ? thuTu : 1);
        return hinhAnhChienDichRepository.save(anh);
    }

    @Transactional
    public boolean xoaHinhAnh(String maChienDich, Integer maHinhAnh) {
        var opt = hinhAnhChienDichRepository.findById(maHinhAnh);
        if (opt.isEmpty()) return false;
        var anh = opt.get();
        if (!anh.getMaChienDich().equals(maChienDich)) {
            throw new RuntimeException("Ảnh không thuộc chiến dịch: " + maChienDich);
        }
        adminUploadService.deleteFile(anh.getDuongDan());
        hinhAnhChienDichRepository.deleteById(maHinhAnh);
        return true;
    }

    @Transactional
    public com.exed.be.model.HinhAnhChienDich capNhatThuTu(
            String maChienDich, Integer maHinhAnh, Integer thuTu) {
        var anh = hinhAnhChienDichRepository.findById(maHinhAnh)
                .orElseThrow(() -> new RuntimeException("Ảnh không tồn tại"));
        if (!anh.getMaChienDich().equals(maChienDich)) {
            throw new RuntimeException("Ảnh không thuộc chiến dịch: " + maChienDich);
        }
        anh.setThuTu(thuTu);
        return hinhAnhChienDichRepository.save(anh);
    }

    // ────────────────────────────────────────────────────────────
    // THỐNG KÊ CHI TIẾT 1 CHIẾN DỊCH
    // ────────────────────────────────────────────────────────────
    public com.exed.be.dto.admin.ChienDichThongKeDTO getThongKe(String maChienDich) {
        ChienDich cd = chienDichRepository.findById(maChienDich)
                .orElseThrow(() -> new RuntimeException("Chiến dịch không tồn tại: " + maChienDich));

        var dto = new com.exed.be.dto.admin.ChienDichThongKeDTO();

        List<com.exed.be.model.DangKyChienDich> all = dangKyChienDichRepository
                .findByChienDich_MaChienDich(maChienDich);

        // Tách hợp lệ / hủy
        List<com.exed.be.model.DangKyChienDich> hopLe = new java.util.ArrayList<>();
        int donHuy = 0;
        for (var dk : all) {
            if (Boolean.TRUE.equals(dk.getDaHuy())) donHuy++;
            else hopLe.add(dk);
        }

        // Tổng quan
        int tongSoLuong = 0;
        java.math.BigDecimal doanhThu = java.math.BigDecimal.ZERO;
        java.util.Set<String> nguoiThamGia = new java.util.HashSet<>();
        for (var dk : hopLe) {
            tongSoLuong += dk.getTongSoLuong() != null ? dk.getTongSoLuong() : 0;
            if (dk.getThanhToan() != null && dk.getThanhToan().getSoTienThanhToan() != null) {
                doanhThu = doanhThu.add(dk.getThanhToan().getSoTienThanhToan());
            }
            if (dk.getNguoiDung() != null) nguoiThamGia.add(dk.getNguoiDung().getMaNguoiDung());
        }

        dto.setTongDon(all.size());
        dto.setDonHuy(donHuy);
        dto.setDonHopLe(hopLe.size());
        dto.setTongNguoiThamGia(nguoiThamGia.size());
        dto.setTongSoLuong(tongSoLuong);
        dto.setNguongMOQ(cd.getNguongMOQ());
        dto.setNguongToiDa(cd.getNguongToiDa());
        dto.setDoanhThu(doanhThu);

        // Tiến độ (theo tổng số lượng / ngưỡng tối đa)
        if (cd.getNguongToiDa() != null && cd.getNguongToiDa() > 0) {
            double pct = tongSoLuong * 100.0 / cd.getNguongToiDa();
            dto.setTienDoPhanTram(Math.round(pct * 10.0) / 10.0);
        } else dto.setTienDoPhanTram(0.0);

        // Giá trị trung bình / đơn
        if (hopLe.size() > 0) {
            dto.setGiaTriTrungBinh(doanhThu.divide(
                    java.math.BigDecimal.valueOf(hopLe.size()), 0, java.math.RoundingMode.HALF_UP));
        } else dto.setGiaTriTrungBinh(java.math.BigDecimal.ZERO);

        // Tỷ lệ chuyển đổi (đơn hợp lệ / tổng đơn)
        if (all.size() > 0) {
            dto.setTyLeChuyenDoi(Math.round(hopLe.size() * 1000.0 / all.size()) / 10.0);
        } else dto.setTyLeChuyenDoi(0.0);

        // Thời gian còn lại
        if (cd.getNgayKetThuc() != null) {
            long sec = java.time.Duration.between(java.time.LocalDateTime.now(), cd.getNgayKetThuc()).getSeconds();
            dto.setThoiGianConLaiSeconds(sec);
            dto.setThoiGianConLaiNhan(formatDuration(sec));
        } else {
            dto.setThoiGianConLaiSeconds(0L);
            dto.setThoiGianConLaiNhan("—");
        }

        // Thống kê mốc cược
        var listMucGia = bangGiaBacThangRepository.findByMaChienDichOrderBySoLuongToiThieuAsc(maChienDich);
        java.util.Map<Integer, Integer> nguoiChonMap = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> sluongMap = new java.util.HashMap<>();
        for (var dk : hopLe) {
            if (dk.getBangGiaBacThang() == null) continue;
            int ma = dk.getBangGiaBacThang().getMaMucGia();
            nguoiChonMap.merge(ma, 1, Integer::sum);
            sluongMap.merge(ma, dk.getTongSoLuong() != null ? dk.getTongSoLuong() : 0, Integer::sum);
        }
        java.util.List<com.exed.be.dto.admin.ChienDichThongKeDTO.MocCuocItem> mocItems = new java.util.ArrayList<>();
        for (var bg : listMucGia) {
            int sn = nguoiChonMap.getOrDefault(bg.getMaMucGia(), 0);
            int sl = sluongMap.getOrDefault(bg.getMaMucGia(), 0);
            double tyLe = hopLe.size() > 0 ? Math.round(sn * 1000.0 / hopLe.size()) / 10.0 : 0.0;
            java.math.BigDecimal dt = bg.getDonGia() == null
                    ? java.math.BigDecimal.ZERO
                    : bg.getDonGia().multiply(java.math.BigDecimal.valueOf(sl));
            mocItems.add(new com.exed.be.dto.admin.ChienDichThongKeDTO.MocCuocItem(
                    bg.getMaMucGia(), bg.getSoLuongToiThieu(), bg.getSoLuongToiDa(),
                    bg.getDonGia(), sn, sl, tyLe, dt));
        }
        dto.setThongKeMocCuoc(mocItems);

        // Thống kê màu / size — gom từ PhieuChiTietDangKy của các đăng ký hợp lệ
        java.util.Map<Integer, Integer> mauMap = new java.util.HashMap<>();
        java.util.Map<Integer, String>  mauName = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> sizeMap = new java.util.HashMap<>();
        java.util.Map<Integer, String>  sizeName = new java.util.HashMap<>();
        int tongSlChiTiet = 0;
        for (var dk : hopLe) {
            var chitiets = phieuChiTietDangKyRepository.findByDangKyChienDich_MaDangKy(dk.getMaDangKy());
            for (var ct : chitiets) {
                int sl = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
                tongSlChiTiet += sl;
                if (ct.getMauSac() != null) {
                    int m = ct.getMauSac().getMaMau();
                    mauMap.merge(m, sl, Integer::sum);
                    mauName.put(m, ct.getMauSac().getTenMau());
                }
                if (ct.getKichThuoc() != null) {
                    int s = ct.getKichThuoc().getMaSize();
                    sizeMap.merge(s, sl, Integer::sum);
                    sizeName.put(s, ct.getKichThuoc().getTenSize());
                }
            }
        }
        java.util.List<com.exed.be.dto.admin.ChienDichThongKeDTO.VariantItem> mauItems = new java.util.ArrayList<>();
        int total = tongSlChiTiet;
        mauMap.forEach((m, sl) -> {
            double tl = total > 0 ? Math.round(sl * 1000.0 / total) / 10.0 : 0.0;
            mauItems.add(new com.exed.be.dto.admin.ChienDichThongKeDTO.VariantItem(m, mauName.get(m), sl, tl));
        });
        mauItems.sort((a, b) -> Integer.compare(b.getSoLuong(), a.getSoLuong()));
        dto.setThongKeMau(mauItems);

        java.util.List<com.exed.be.dto.admin.ChienDichThongKeDTO.VariantItem> sizeItems = new java.util.ArrayList<>();
        sizeMap.forEach((s, sl) -> {
            double tl = total > 0 ? Math.round(sl * 1000.0 / total) / 10.0 : 0.0;
            sizeItems.add(new com.exed.be.dto.admin.ChienDichThongKeDTO.VariantItem(s, sizeName.get(s), sl, tl));
        });
        sizeItems.sort((a, b) -> Integer.compare(b.getSoLuong(), a.getSoLuong()));
        dto.setThongKeSize(sizeItems);

        return dto;
    }

    private String formatDuration(long seconds) {
        if (seconds <= 0) return "Đã kết thúc";
        long days = seconds / 86400;
        long hours = (seconds % 86400) / 3600;
        long mins = (seconds % 3600) / 60;
        if (days > 0) return days + " ngày " + hours + " giờ";
        if (hours > 0) return hours + " giờ " + mins + " phút";
        return mins + " phút";
    }
}
