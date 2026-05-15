package com.exed.be.service.admin;

import com.exed.be.dto.admin.DonHangRequest;
import com.exed.be.model.ChiTietDonHang;
import com.exed.be.model.DangKyChienDich;
import com.exed.be.model.DonHang;
import com.exed.be.model.PhieuChiTietDangKy;
import com.exed.be.model.ThanhToan;
import com.exed.be.repository.DangKyChienDichRepository;
import com.exed.be.repository.DonHangRepository;
import com.exed.be.repository.KichThuocRepository;
import com.exed.be.repository.MauSacRepository;
import com.exed.be.repository.PhieuChiTietDangKyRepository;
import com.exed.be.repository.ThanhToanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class AdminDonHangService {

    private static final Set<String> TRANG_THAI_GIAO_HANG = Set.of(
            "Đang chuẩn bị", "Đang giao", "Đã giao");

    @Autowired
    private DangKyChienDichRepository dangKyChienDichRepository;

    @Autowired
    private PhieuChiTietDangKyRepository phieuChiTietDangKyRepository;

    @Autowired
    private ThanhToanRepository thanhToanRepository;

    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private MauSacRepository mauSacRepository;

    @Autowired
    private KichThuocRepository kichThuocRepository;

    public List<DangKyChienDich> getAllDonHang() {
        return dangKyChienDichRepository.findAll();
    }

    public Optional<DangKyChienDich> getDonHangById(Integer maDangKy) {
        return dangKyChienDichRepository.findById(maDangKy);
    }

    public List<DangKyChienDich> getDonHangByKhachHang(String maNguoiDung) {
        return dangKyChienDichRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
    }

    public List<DangKyChienDich> getDonHangByChienDich(String maChienDich) {
        return dangKyChienDichRepository.findByChienDich_MaChienDich(maChienDich);
    }

    public List<PhieuChiTietDangKy> getChiTietDonHang(Integer maDangKy) {
        return phieuChiTietDangKyRepository.findByDangKyChienDich_MaDangKy(maDangKy);
    }

    /**
     * Admin hủy đơn hàng (đặt daHuy = true)
     */
    @Transactional
    public DangKyChienDich huyDonHang(Integer maDangKy) {
        DangKyChienDich dk = dangKyChienDichRepository.findById(maDangKy)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + maDangKy));
        if (dk.getDaHuy()) {
            throw new RuntimeException("Đơn hàng đã bị hủy trước đó");
        }
        dk.setDaHuy(true);
        return dangKyChienDichRepository.save(dk);
    }

    /**
     * Admin xác nhận hoàn tiền
     */
    @Transactional
    public DangKyChienDich xacNhanHoanTien(Integer maDangKy) {
        DangKyChienDich dk = dangKyChienDichRepository.findById(maDangKy)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + maDangKy));
        if (!dk.getDaHuy()) {
            throw new RuntimeException("Chỉ hoàn tiền cho đơn đã hủy");
        }
        dk.setTrangThaiHoanTien(true);
        return dangKyChienDichRepository.save(dk);
    }

    /**
     * Thống kê đơn hàng theo chiến dịch
     */
    public java.util.Map<String, Object> thongKeDonHangChienDich(String maChienDich) {
        List<DangKyChienDich> danhSach = dangKyChienDichRepository.findByChienDich_MaChienDich(maChienDich);
        long tongDon = danhSach.size();
        long donHuy = danhSach.stream().filter(DangKyChienDich::getDaHuy).count();
        long donHopLe = tongDon - donHuy;
        int tongSoLuong = danhSach.stream()
                .filter(dk -> !dk.getDaHuy())
                .mapToInt(DangKyChienDich::getTongSoLuong)
                .sum();
        java.math.BigDecimal tongTien = danhSach.stream()
                .filter(dk -> !dk.getDaHuy() && dk.getThanhToan() != null)
                .map(dk -> dk.getThanhToan().getSoTienThanhToan())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("maChienDich", maChienDich);
        result.put("tongDon", tongDon);
        result.put("donHuy", donHuy);
        result.put("donHopLe", donHopLe);
        result.put("tongSoLuong", tongSoLuong);
        result.put("tongTien", tongTien);
        return result;
    }

    // ────────────────────────────────────────────────────────────
    // GIAO HÀNG (DonHang + ChiTietDonHang)
    // ────────────────────────────────────────────────────────────

    /** Lấy phiếu giao hàng gắn với 1 đăng ký (nếu có) */
    public Optional<DonHang> getGiaoHangByDangKy(Integer maDangKy) {
        return donHangRepository.findByDangKyChienDich_MaDangKy(maDangKy);
    }

    /** Lấy phiếu giao hàng theo mã */
    public Optional<DonHang> getGiaoHangById(String maDonHang) {
        return donHangRepository.findById(maDonHang);
    }

    /** Tất cả phiếu giao hàng */
    public List<DonHang> getAllGiaoHang() {
        return donHangRepository.findAll();
    }

    /**
     * Tạo phiếu giao hàng từ 1 đăng ký đã thanh toán + chiến dịch thành công.
     * Chi tiết màu/size mặc định lấy từ PhieuChiTietDangKy (nếu request không truyền).
     */
    @Transactional
    public DonHang taoPhieuGiao(DonHangRequest req) {
        if (req.getMaDangKy() == null) {
            throw new RuntimeException("Thiếu mã đăng ký");
        }
        if (donHangRepository.existsByDangKyChienDich_MaDangKy(req.getMaDangKy())) {
            throw new RuntimeException("Đăng ký này đã có phiếu giao hàng");
        }
        DangKyChienDich dk = dangKyChienDichRepository.findById(req.getMaDangKy())
                .orElseThrow(() -> new RuntimeException("Đăng ký không tồn tại: " + req.getMaDangKy()));
        if (Boolean.TRUE.equals(dk.getDaHuy())) {
            throw new RuntimeException("Không thể tạo phiếu giao cho đơn đã hủy");
        }

        DonHang dh = new DonHang();
        dh.setMaDonHang(req.getMaDonHang() != null && !req.getMaDonHang().isBlank()
                ? req.getMaDonHang() : generateNextMaDonHang());

        if (donHangRepository.existsById(dh.getMaDonHang())) {
            throw new RuntimeException("Mã đơn hàng đã tồn tại: " + dh.getMaDonHang());
        }

        dh.setDangKyChienDich(dk);

        // Giá chốt cuối: ưu tiên request, nếu null lấy từ thanhToan, fallback giaGoc * SL
        BigDecimal giaChot = req.getGiaChotCuoiCung();
        if (giaChot == null && dk.getThanhToan() != null) {
            giaChot = dk.getThanhToan().getSoTienThanhToan();
        }
        if (giaChot == null) giaChot = BigDecimal.ZERO;
        dh.setGiaChotCuoiCung(giaChot);

        dh.setSoTienHoanLai(req.getSoTienHoanLai() != null ? req.getSoTienHoanLai() : BigDecimal.ZERO);

        String tt = req.getTrangThaiGiaoHang();
        if (tt != null && !TRANG_THAI_GIAO_HANG.contains(tt)) {
            throw new RuntimeException("Trạng thái giao hàng không hợp lệ: " + tt);
        }
        dh.setTrangThaiGiaoHang(tt != null ? tt : "Đang chuẩn bị");
        dh.setNgayTaoDon(LocalDateTime.now());

        // Build chi tiết
        List<ChiTietDonHang> items = new ArrayList<>();
        List<DonHangRequest.ChiTietItem> source = req.getChiTiet();
        if (source == null || source.isEmpty()) {
            // fallback: copy từ PhieuChiTietDangKy
            List<PhieuChiTietDangKy> phieus = phieuChiTietDangKyRepository
                    .findByDangKyChienDich_MaDangKy(req.getMaDangKy());
            for (PhieuChiTietDangKy p : phieus) {
                if (p.getMauSac() == null || p.getKichThuoc() == null) continue;
                ChiTietDonHang ct = new ChiTietDonHang();
                ct.setDonHang(dh);
                ct.setMauSac(p.getMauSac());
                ct.setKichThuoc(p.getKichThuoc());
                ct.setSoLuong(p.getSoLuong() != null ? p.getSoLuong() : 1);
                items.add(ct);
            }
        } else {
            for (var it : source) {
                if (it.getMaMau() == null || it.getMaSize() == null || it.getSoLuong() == null) continue;
                ChiTietDonHang ct = new ChiTietDonHang();
                ct.setDonHang(dh);
                ct.setMauSac(mauSacRepository.findById(it.getMaMau())
                        .orElseThrow(() -> new RuntimeException("Màu không tồn tại: " + it.getMaMau())));
                ct.setKichThuoc(kichThuocRepository.findById(it.getMaSize())
                        .orElseThrow(() -> new RuntimeException("Size không tồn tại: " + it.getMaSize())));
                ct.setSoLuong(it.getSoLuong());
                items.add(ct);
            }
        }
        dh.setChiTietDonHangs(items);

        return donHangRepository.save(dh);
    }

    /** Cập nhật trạng thái giao hàng */
    @Transactional
    public DonHang capNhatTrangThaiGiao(String maDonHang, String trangThai) {
        if (trangThai == null || !TRANG_THAI_GIAO_HANG.contains(trangThai)) {
            throw new RuntimeException("Trạng thái giao hàng không hợp lệ: " + trangThai);
        }
        DonHang dh = donHangRepository.findById(maDonHang)
                .orElseThrow(() -> new RuntimeException("Đơn giao không tồn tại: " + maDonHang));
        dh.setTrangThaiGiaoHang(trangThai);
        return donHangRepository.save(dh);
    }

    /** Sinh mã đơn hàng tiếp theo: DH001, DH002,... */
    public String generateNextMaDonHang() {
        List<DonHang> all = donHangRepository.findAll();
        int max = 0;
        for (DonHang d : all) {
            String ma = d.getMaDonHang();
            if (ma != null && ma.startsWith("DH")) {
                try {
                    int n = Integer.parseInt(ma.substring(2));
                    if (n > max) max = n;
                } catch (NumberFormatException ignored) {}
            }
        }
        return String.format("DH%03d", max + 1);
    }
}
