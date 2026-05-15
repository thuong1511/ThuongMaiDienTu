package com.exed.be.service.admin;

import com.exed.be.dto.admin.NgheSiRequest;
import com.exed.be.dto.admin.NgheSiThongKeDTO;
import com.exed.be.model.ChienDich;
import com.exed.be.model.DangKyChienDich;
import com.exed.be.model.HinhAnhNgheSi;
import com.exed.be.model.NgheSi;
import com.exed.be.repository.ChienDichRepository;
import com.exed.be.repository.DangKyChienDichRepository;
import com.exed.be.repository.HinhAnhNgheSiRepository;
import com.exed.be.repository.NgheSiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class AdminNgheSiService {

    @Autowired private NgheSiRepository ngheSiRepository;
    @Autowired private HinhAnhNgheSiRepository hinhAnhNgheSiRepository;
    @Autowired private ChienDichRepository chienDichRepository;
    @Autowired private DangKyChienDichRepository dangKyChienDichRepository;
    @Autowired private AdminUploadService adminUploadService;

    // ── CRUD ──────────────────────────────────────────────────
    public List<NgheSi> getAllNgheSi() {
        return ngheSiRepository.findAll();
    }

    public Optional<NgheSi> getNgheSiById(String maNgheSi) {
        return ngheSiRepository.findById(maNgheSi);
    }

    /** Sinh mã nghệ sĩ tiếp theo NS001/NS002... */
    public String generateNextMaNgheSi() {
        int max = 0;
        for (NgheSi ns : ngheSiRepository.findAll()) {
            String ma = ns.getMaNgheSi();
            if (ma != null && ma.startsWith("NS")) {
                try {
                    int n = Integer.parseInt(ma.substring(2));
                    if (n > max) max = n;
                } catch (NumberFormatException ignored) {}
            }
        }
        return String.format("NS%03d", max + 1);
    }

    @Transactional
    public NgheSi createNgheSi(NgheSiRequest request) {
        if (request.getMaNgheSi() == null || request.getMaNgheSi().isBlank()) {
            throw new RuntimeException("Thiếu mã nghệ sĩ");
        }
        if (ngheSiRepository.existsById(request.getMaNgheSi())) {
            throw new RuntimeException("Mã nghệ sĩ đã tồn tại: " + request.getMaNgheSi());
        }
        NgheSi ns = new NgheSi();
        ns.setMaNgheSi(request.getMaNgheSi().trim().toUpperCase());
        ns.setTenNgheSi(request.getTenNgheSi());
        ns.setMoTa(request.getMoTa());
        ns.setNgheNghiep(request.getNgheNghiep());
        ns.setLinkMXH(request.getLinkMXH());
        return ngheSiRepository.save(ns);
    }

    @Transactional
    public NgheSi updateNgheSi(String maNgheSi, NgheSiRequest request) {
        NgheSi ns = ngheSiRepository.findById(maNgheSi)
                .orElseThrow(() -> new RuntimeException("Nghệ sĩ không tồn tại: " + maNgheSi));
        if (request.getTenNgheSi() != null) ns.setTenNgheSi(request.getTenNgheSi());
        if (request.getMoTa() != null) ns.setMoTa(request.getMoTa());
        if (request.getNgheNghiep() != null) ns.setNgheNghiep(request.getNgheNghiep());
        if (request.getLinkMXH() != null) ns.setLinkMXH(request.getLinkMXH());
        return ngheSiRepository.save(ns);
    }

    @Transactional
    public boolean deleteNgheSi(String maNgheSi) {
        if (!ngheSiRepository.existsById(maNgheSi)) return false;
        // Xóa file ảnh
        for (var anh : hinhAnhNgheSiRepository.findByMaNgheSiOrderByThuTuAsc(maNgheSi)) {
            adminUploadService.deleteFile(anh.getDuongDan());
        }
        hinhAnhNgheSiRepository.deleteByMaNgheSi(maNgheSi);
        ngheSiRepository.deleteById(maNgheSi);
        return true;
    }

    // ── Ảnh nghệ sĩ ───────────────────────────────────────────
    public List<HinhAnhNgheSi> getHinhAnh(String maNgheSi) {
        return hinhAnhNgheSiRepository.findByMaNgheSiOrderByThuTuAsc(maNgheSi);
    }

    @Transactional
    public HinhAnhNgheSi themHinhAnh(String maNgheSi, String duongDan, Integer thuTu) {
        if (!ngheSiRepository.existsById(maNgheSi)) {
            throw new RuntimeException("Nghệ sĩ không tồn tại: " + maNgheSi);
        }
        HinhAnhNgheSi anh = new HinhAnhNgheSi();
        anh.setMaNgheSi(maNgheSi);
        anh.setDuongDan(duongDan);
        anh.setThuTu(thuTu != null ? thuTu : 1);
        return hinhAnhNgheSiRepository.save(anh);
    }

    @Transactional
    public boolean xoaHinhAnh(String maNgheSi, Integer maHinhAnh) {
        var opt = hinhAnhNgheSiRepository.findById(maHinhAnh);
        if (opt.isEmpty()) return false;
        var anh = opt.get();
        if (!anh.getMaNgheSi().equals(maNgheSi)) {
            throw new RuntimeException("Ảnh không thuộc nghệ sĩ: " + maNgheSi);
        }
        adminUploadService.deleteFile(anh.getDuongDan());
        hinhAnhNgheSiRepository.deleteById(maHinhAnh);
        return true;
    }

    @Transactional
    public HinhAnhNgheSi capNhatThuTu(String maNgheSi, Integer maHinhAnh, Integer thuTu) {
        var anh = hinhAnhNgheSiRepository.findById(maHinhAnh)
                .orElseThrow(() -> new RuntimeException("Ảnh không tồn tại"));
        if (!anh.getMaNgheSi().equals(maNgheSi)) {
            throw new RuntimeException("Ảnh không thuộc nghệ sĩ: " + maNgheSi);
        }
        anh.setThuTu(thuTu);
        return hinhAnhNgheSiRepository.save(anh);
    }

    /** Thay ảnh đại diện duy nhất: xóa ảnh cũ và tạo ảnh mới ở thứ tự 1 */
    @Transactional
    public HinhAnhNgheSi capNhatAnhDaiDien(String maNgheSi, String duongDan) {
        if (!ngheSiRepository.existsById(maNgheSi)) {
            throw new RuntimeException("Nghệ sĩ không tồn tại: " + maNgheSi);
        }
        for (var anh : hinhAnhNgheSiRepository.findByMaNgheSiOrderByThuTuAsc(maNgheSi)) {
            adminUploadService.deleteFile(anh.getDuongDan());
        }
        hinhAnhNgheSiRepository.deleteByMaNgheSi(maNgheSi);
        return themHinhAnh(maNgheSi, duongDan, 1);
    }

    // ── Thống kê + Chiến dịch ─────────────────────────────────
    public List<ChienDich> getChienDichByNgheSi(String maNgheSi) {
        return chienDichRepository.findAll().stream()
                .filter(cd -> maNgheSi.equals(cd.getMaNgheSi()))
                .toList();
    }

    public NgheSiThongKeDTO getThongKe(String maNgheSi) {
        if (!ngheSiRepository.existsById(maNgheSi)) {
            throw new RuntimeException("Nghệ sĩ không tồn tại: " + maNgheSi);
        }
        var dto = new NgheSiThongKeDTO();
        var listCD = getChienDichByNgheSi(maNgheSi);

        dto.setTongChienDich(listCD.size());
        int thanhCong = (int) listCD.stream()
                .filter(cd -> "Đã kết thúc".equals(cd.getThoiDiem())
                        || "Thành công".equals(cd.getTrangThai()))
                .count();
        dto.setChienDichThanhCong(thanhCong);

        int tongDon = 0;
        BigDecimal doanhThu = BigDecimal.ZERO;
        for (ChienDich cd : listCD) {
            List<DangKyChienDich> dangKys = dangKyChienDichRepository
                    .findByChienDich_MaChienDich(cd.getMaChienDich());
            for (DangKyChienDich dk : dangKys) {
                if (Boolean.TRUE.equals(dk.getDaHuy())) continue;
                tongDon++;
                if (dk.getThanhToan() != null && dk.getThanhToan().getSoTienThanhToan() != null) {
                    doanhThu = doanhThu.add(dk.getThanhToan().getSoTienThanhToan());
                }
            }
        }
        dto.setTongDon(tongDon);
        dto.setDoanhThu(doanhThu);
        return dto;
    }
}
