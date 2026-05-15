package com.exed.be.service.admin;

import com.exed.be.dto.admin.DoiMatKhauRequest;
import com.exed.be.model.Banner;
import com.exed.be.model.CauHinh;
import com.exed.be.model.NguoiDung;
import com.exed.be.repository.BannerRepository;
import com.exed.be.repository.CauHinhRepository;
import com.exed.be.repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminCauHinhService {

    @Autowired private CauHinhRepository cauHinhRepository;
    @Autowired private BannerRepository bannerRepository;
    @Autowired private NguoiDungRepository nguoiDungRepository;
    @Autowired private AdminUploadService adminUploadService;

    // ── CẤU HÌNH ────────────────────────────────────────────────
    public List<CauHinh> getAll() {
        return cauHinhRepository.findAll();
    }

    public List<CauHinh> getByNhom(String nhom) {
        return cauHinhRepository.findByNhom(nhom);
    }

    /** Trả map { nhom: { khoa: giaTri, ... }, ... } */
    public Map<String, Map<String, String>> getGrouped() {
        Map<String, Map<String, String>> result = new LinkedHashMap<>();
        for (CauHinh c : cauHinhRepository.findAll()) {
            result.computeIfAbsent(c.getNhom(), k -> new LinkedHashMap<>())
                  .put(c.getKhoa(), c.getGiaTri());
        }
        return result;
    }

    /**
     * Bulk upsert nhiều cấu hình cùng lúc.
     * Body: { "key1": "value1", "key2": "value2", ... }
     * Chỉ cập nhật các key đã có sẵn trong DB (không tạo key mới để tránh ghi rác).
     */
    @Transactional
    public Map<String, String> capNhatNhieu(Map<String, Object> body) {
        Map<String, String> applied = new HashMap<>();
        if (body == null || body.isEmpty()) return applied;

        for (var entry : body.entrySet()) {
            String khoa = entry.getKey();
            Object v = entry.getValue();
            String value = v == null ? null : String.valueOf(v);

            var opt = cauHinhRepository.findById(khoa);
            if (opt.isEmpty()) continue;       // bỏ qua key lạ
            CauHinh c = opt.get();
            c.setGiaTri(value);
            cauHinhRepository.save(c);
            applied.put(khoa, value);
        }
        return applied;
    }

    @Transactional
    public CauHinh capNhat(String khoa, String giaTri) {
        CauHinh c = cauHinhRepository.findById(khoa)
                .orElseThrow(() -> new RuntimeException("Khóa cấu hình không tồn tại: " + khoa));
        c.setGiaTri(giaTri);
        return cauHinhRepository.save(c);
    }

    // ── ĐỔI MẬT KHẨU ADMIN ──────────────────────────────────────
    @Transactional
    public NguoiDung doiMatKhau(DoiMatKhauRequest req) {
        if (req.getMaNguoiDung() == null || req.getMaNguoiDung().isBlank()) {
            throw new RuntimeException("Thiếu mã người dùng");
        }
        if (req.getMatKhauCu() == null || req.getMatKhauMoi() == null) {
            throw new RuntimeException("Thiếu mật khẩu cũ hoặc mới");
        }
        if (req.getMatKhauMoi().length() < 3) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 3 ký tự");
        }
        if (!req.getMatKhauMoi().equals(req.getXacNhanMatKhauMoi())) {
            throw new RuntimeException("Xác nhận mật khẩu không khớp");
        }

        NguoiDung nd = nguoiDungRepository.findById(req.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (!"Admin".equals(nd.getVaiTro())) {
            throw new RuntimeException("Chỉ admin mới được phép dùng chức năng này");
        }

        if (!nd.getMatKhau().equals(req.getMatKhauCu())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        nd.setMatKhau(req.getMatKhauMoi());
        return nguoiDungRepository.save(nd);
    }

    // ── BANNER ──────────────────────────────────────────────────
    public List<Banner> getAllBanner() {
        return bannerRepository.findAllByOrderByThuTuAsc();
    }

    @Transactional
    public Banner themBanner(String duongDan, String tieuDe, Integer thuTu, Boolean dangHienThi) {
        if (duongDan == null || duongDan.isBlank()) {
            throw new RuntimeException("Thiếu duongDan");
        }
        Banner b = new Banner();
        b.setDuongDan(duongDan);
        b.setTieuDe(tieuDe);
        b.setThuTu(thuTu != null ? thuTu : (bannerRepository.count() < Integer.MAX_VALUE
                ? (int) bannerRepository.count() + 1 : 1));
        b.setDangHienThi(Boolean.TRUE.equals(dangHienThi));
        return bannerRepository.save(b);
    }

    @Transactional
    public Banner capNhatBanner(Integer maBanner, String tieuDe, Integer thuTu, Boolean dangHienThi) {
        Banner b = bannerRepository.findById(maBanner)
                .orElseThrow(() -> new RuntimeException("Banner không tồn tại"));
        if (tieuDe != null) b.setTieuDe(tieuDe);
        if (thuTu != null) b.setThuTu(thuTu);
        if (dangHienThi != null) b.setDangHienThi(dangHienThi);
        return bannerRepository.save(b);
    }

    @Transactional
    public boolean xoaBanner(Integer maBanner) {
        var opt = bannerRepository.findById(maBanner);
        if (opt.isEmpty()) return false;
        adminUploadService.deleteFile(opt.get().getDuongDan());
        bannerRepository.deleteById(maBanner);
        return true;
    }
}
