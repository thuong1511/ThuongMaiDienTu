package com.exed.be.service.admin;

import com.exed.be.dto.admin.SanPhamRequest;
import com.exed.be.dto.admin.SanPhamThongKeDTO;
import com.exed.be.model.*;
import com.exed.be.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminSanPhamService {

    @Autowired private SanPhamRepository sanPhamRepository;
    @Autowired private DanhMucRepository danhMucRepository;
    @Autowired private MauSacRepository mauSacRepository;
    @Autowired private KichThuocRepository kichThuocRepository;
    @Autowired private SanPhamMauSacRepository sanPhamMauSacRepository;
    @Autowired private SanPhamKichThuocRepository sanPhamKichThuocRepository;
    @Autowired private HinhAnhSanPhamRepository hinhAnhSanPhamRepository;
    @Autowired private ChienDichRepository chienDichRepository;
    @Autowired private AdminUploadService adminUploadService;

    // ── CRUD cơ bản ────────────────────────────────────────────
    public List<SanPham> getAllSanPham() {
        return sanPhamRepository.findAll();
    }

    public Optional<SanPham> getSanPhamById(String maSanPham) {
        return sanPhamRepository.findById(maSanPham);
    }

    public List<SanPham> getSanPhamByDanhMuc(String maDanhMuc) {
        return sanPhamRepository.findByDanhMuc_MaDanhMuc(maDanhMuc);
    }

    /** Sinh mã sản phẩm tiếp theo SP001, SP002, ... */
    public String generateNextMaSanPham() {
        int max = 0;
        for (SanPham sp : sanPhamRepository.findAll()) {
            String ma = sp.getMaSanPham();
            if (ma != null && ma.startsWith("SP")) {
                try {
                    int n = Integer.parseInt(ma.substring(2));
                    if (n > max) max = n;
                } catch (NumberFormatException ignored) {}
            }
        }
        return String.format("SP%03d", max + 1);
    }

    @Transactional
    public SanPham createSanPham(SanPhamRequest req) {
        if (req.getMaSanPham() == null || req.getMaSanPham().isBlank()) {
            throw new RuntimeException("Thiếu mã sản phẩm");
        }
        if (sanPhamRepository.existsById(req.getMaSanPham())) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + req.getMaSanPham());
        }
        if (req.getMaDanhMuc() == null || req.getMaDanhMuc().isBlank()) {
            throw new RuntimeException("Thiếu mã danh mục");
        }
        
        // Lấy DanhMuc object từ database
        DanhMuc danhMuc = danhMucRepository.findById(req.getMaDanhMuc())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại: " + req.getMaDanhMuc()));

        SanPham sp = new SanPham();
        sp.setMaSanPham(req.getMaSanPham().trim().toUpperCase());
        sp.setDanhMuc(danhMuc);  // Set object DanhMuc thay vì string
        sp.setTenSanPham(req.getTenSanPham());
        sp.setMoTa(req.getMoTa());
        sanPhamRepository.save(sp);

        applyVariants(sp.getMaSanPham(), req);
        return sanPhamRepository.findById(sp.getMaSanPham()).orElse(sp);
    }

    @Transactional
    public SanPham updateSanPham(String maSanPham, SanPhamRequest req) {
        SanPham sp = sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + maSanPham));

        if (req.getTenSanPham() != null) sp.setTenSanPham(req.getTenSanPham());
        if (req.getMoTa() != null) sp.setMoTa(req.getMoTa());
        if (req.getMaDanhMuc() != null) {
            DanhMuc danhMuc = danhMucRepository.findById(req.getMaDanhMuc())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại: " + req.getMaDanhMuc()));
            sp.setDanhMuc(danhMuc);  // Set object DanhMuc
        }
        sanPhamRepository.save(sp);

        applyVariants(maSanPham, req);
        return sanPhamRepository.findById(maSanPham).orElse(sp);
    }

    /**
     * Áp dụng biến thể (mauSacs / kichThuocs / hinhAnhs) cho sản phẩm.
     * Quy ước:
     *  - null → bỏ qua, không thay đổi
     *  - [] (rỗng) → xóa hết
     *  - có dữ liệu → replace toàn bộ
     */
    private void applyVariants(String maSanPham, SanPhamRequest req) {
        if (req.getMauSacs() != null) {
            sanPhamMauSacRepository.deleteByMaSanPham(maSanPham);
            for (var m : req.getMauSacs()) {
                Integer maMau = m.getMaMau();
                if (maMau == null && m.getTenMau() != null && !m.getTenMau().isBlank()) {
                    MauSac newMau = new MauSac();
                    newMau.setTenMau(m.getTenMau());
                    maMau = mauSacRepository.save(newMau).getMaMau();
                }
                if (maMau == null) continue;
                if (!mauSacRepository.existsById(maMau)) continue;

                SanPhamMauSac spm = new SanPhamMauSac();
                spm.setMaSanPham(maSanPham);
                spm.setMaMau(maMau);
                spm.setSoLuongToiDa(m.getSoLuongToiDa() != null ? m.getSoLuongToiDa() : 0);
                spm.setSoLuongDaDat(0);
                sanPhamMauSacRepository.save(spm);
            }
        }

        if (req.getKichThuocs() != null) {
            sanPhamKichThuocRepository.deleteByMaSanPham(maSanPham);
            for (var maSize : req.getKichThuocs()) {
                if (maSize == null) continue;
                if (!kichThuocRepository.existsById(maSize)) continue;
                SanPhamKichThuoc spk = new SanPhamKichThuoc();
                spk.setMaSanPham(maSanPham);
                spk.setMaSize(maSize);
                sanPhamKichThuocRepository.save(spk);
            }
        }

        if (req.getHinhAnhs() != null) {
            // xóa file vật lý các ảnh cũ
            for (var anh : hinhAnhSanPhamRepository.findByMaSanPhamOrderByThuTuAsc(maSanPham)) {
                adminUploadService.deleteFile(anh.getDuongDan());
            }
            hinhAnhSanPhamRepository.deleteByMaSanPham(maSanPham);

            int idx = 1;
            for (var h : req.getHinhAnhs()) {
                if (h.getDuongDan() == null || h.getDuongDan().isBlank()) continue;
                HinhAnhSanPham anh = new HinhAnhSanPham();
                anh.setMaSanPham(maSanPham);
                anh.setDuongDan(h.getDuongDan());
                anh.setThuTu(h.getThuTu() != null ? h.getThuTu() : idx++);
                hinhAnhSanPhamRepository.save(anh);
            }
        }
    }

    @Transactional
    public boolean deleteSanPham(String maSanPham) {
        if (!sanPhamRepository.existsById(maSanPham)) return false;
        // Xóa file ảnh
        for (var anh : hinhAnhSanPhamRepository.findByMaSanPhamOrderByThuTuAsc(maSanPham)) {
            adminUploadService.deleteFile(anh.getDuongDan());
        }
        hinhAnhSanPhamRepository.deleteByMaSanPham(maSanPham);
        sanPhamMauSacRepository.deleteByMaSanPham(maSanPham);
        sanPhamKichThuocRepository.deleteByMaSanPham(maSanPham);
        sanPhamRepository.deleteById(maSanPham);
        return true;
    }

    // ── ẢNH SẢN PHẨM ───────────────────────────────────────────
    public List<HinhAnhSanPham> getHinhAnh(String maSanPham) {
        return hinhAnhSanPhamRepository.findByMaSanPhamOrderByThuTuAsc(maSanPham);
    }

    @Transactional
    public HinhAnhSanPham themHinhAnh(String maSanPham, String duongDan, Integer thuTu) {
        if (!sanPhamRepository.existsById(maSanPham)) {
            throw new RuntimeException("Sản phẩm không tồn tại: " + maSanPham);
        }
        HinhAnhSanPham anh = new HinhAnhSanPham();
        anh.setMaSanPham(maSanPham);
        anh.setDuongDan(duongDan);
        anh.setThuTu(thuTu != null ? thuTu : 1);
        return hinhAnhSanPhamRepository.save(anh);
    }

    @Transactional
    public boolean xoaHinhAnh(String maSanPham, Integer maHinhAnh) {
        var opt = hinhAnhSanPhamRepository.findById(maHinhAnh);
        if (opt.isEmpty()) return false;
        var anh = opt.get();
        if (!anh.getMaSanPham().equals(maSanPham)) {
            throw new RuntimeException("Ảnh không thuộc sản phẩm: " + maSanPham);
        }
        adminUploadService.deleteFile(anh.getDuongDan());
        hinhAnhSanPhamRepository.deleteById(maHinhAnh);
        return true;
    }

    @Transactional
    public HinhAnhSanPham capNhatThuTuHinhAnh(String maSanPham, Integer maHinhAnh, Integer thuTu) {
        var anh = hinhAnhSanPhamRepository.findById(maHinhAnh)
                .orElseThrow(() -> new RuntimeException("Ảnh không tồn tại"));
        if (!anh.getMaSanPham().equals(maSanPham)) {
            throw new RuntimeException("Ảnh không thuộc sản phẩm: " + maSanPham);
        }
        anh.setThuTu(thuTu);
        return hinhAnhSanPhamRepository.save(anh);
    }

    // ── BIẾN THỂ MÀU ──────────────────────────────────────────
    public List<SanPhamMauSac> getMauSacs(String maSanPham) {
        return sanPhamMauSacRepository.findByMaSanPham(maSanPham);
    }

    @Transactional
    public SanPhamMauSac themMauSac(String maSanPham, Integer maMau, Integer soLuongToiDa) {
        if (!sanPhamRepository.existsById(maSanPham))
            throw new RuntimeException("Sản phẩm không tồn tại: " + maSanPham);
        if (!mauSacRepository.existsById(maMau))
            throw new RuntimeException("Màu không tồn tại: " + maMau);
        if (sanPhamMauSacRepository.findByMaSanPhamAndMaMau(maSanPham, maMau).isPresent())
            throw new RuntimeException("Màu đã được gắn cho sản phẩm");

        SanPhamMauSac spm = new SanPhamMauSac();
        spm.setMaSanPham(maSanPham);
        spm.setMaMau(maMau);
        spm.setSoLuongToiDa(soLuongToiDa != null ? soLuongToiDa : 0);
        spm.setSoLuongDaDat(0);
        return sanPhamMauSacRepository.save(spm);
    }

    @Transactional
    public SanPhamMauSac capNhatMauSac(String maSanPham, Integer maMau, Integer soLuongToiDa) {
        var spm = sanPhamMauSacRepository.findByMaSanPhamAndMaMau(maSanPham, maMau)
                .orElseThrow(() -> new RuntimeException("Sản phẩm chưa có màu này"));
        if (soLuongToiDa != null) spm.setSoLuongToiDa(soLuongToiDa);
        return sanPhamMauSacRepository.save(spm);
    }

    @Transactional
    public boolean xoaMauSac(String maSanPham, Integer maMau) {
        var opt = sanPhamMauSacRepository.findByMaSanPhamAndMaMau(maSanPham, maMau);
        if (opt.isEmpty()) return false;
        sanPhamMauSacRepository.delete(opt.get());
        return true;
    }

    // ── BIẾN THỂ SIZE ──────────────────────────────────────────
    public List<SanPhamKichThuoc> getKichThuocs(String maSanPham) {
        return sanPhamKichThuocRepository.findByMaSanPham(maSanPham);
    }

    @Transactional
    public SanPhamKichThuoc themKichThuoc(String maSanPham, Integer maSize) {
        if (!sanPhamRepository.existsById(maSanPham))
            throw new RuntimeException("Sản phẩm không tồn tại: " + maSanPham);
        if (!kichThuocRepository.existsById(maSize))
            throw new RuntimeException("Size không tồn tại: " + maSize);
        if (sanPhamKichThuocRepository.findByMaSanPhamAndMaSize(maSanPham, maSize).isPresent())
            throw new RuntimeException("Size đã được gắn cho sản phẩm");

        SanPhamKichThuoc spk = new SanPhamKichThuoc();
        spk.setMaSanPham(maSanPham);
        spk.setMaSize(maSize);
        return sanPhamKichThuocRepository.save(spk);
    }

    @Transactional
    public boolean xoaKichThuoc(String maSanPham, Integer maSize) {
        var opt = sanPhamKichThuocRepository.findByMaSanPhamAndMaSize(maSanPham, maSize);
        if (opt.isEmpty()) return false;
        sanPhamKichThuocRepository.delete(opt.get());
        return true;
    }

    // ── THỐNG KÊ + CHIẾN DỊCH DÙNG SP ──────────────────────────
    public List<ChienDich> getChienDichDungSP(String maSanPham) {
        return chienDichRepository.findAll().stream()
                .filter(cd -> maSanPham.equals(cd.getMaSanPham()))
                .toList();
    }

    public SanPhamThongKeDTO getThongKe(String maSanPham) {
        if (!sanPhamRepository.existsById(maSanPham)) {
            throw new RuntimeException("Sản phẩm không tồn tại: " + maSanPham);
        }
        var dto = new SanPhamThongKeDTO();
        var mauList = sanPhamMauSacRepository.findByMaSanPham(maSanPham);
        List<SanPhamThongKeDTO.MauItem> items = new ArrayList<>();
        for (var spm : mauList) {
            int max = spm.getSoLuongToiDa() != null ? spm.getSoLuongToiDa() : 0;
            int dat = spm.getSoLuongDaDat() != null ? spm.getSoLuongDaDat() : 0;
            items.add(new SanPhamThongKeDTO.MauItem(
                    spm.getMaMau(),
                    spm.getMauSac() != null ? spm.getMauSac().getTenMau() : null,
                    max, dat, Math.max(0, max - dat)
            ));
        }
        dto.setMauSacs(items);
        dto.setTongChienDich(getChienDichDungSP(maSanPham).size());
        return dto;
    }
}
