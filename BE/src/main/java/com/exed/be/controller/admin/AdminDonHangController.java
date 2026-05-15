package com.exed.be.controller.admin;

import com.exed.be.model.DangKyChienDich;
import com.exed.be.model.PhieuChiTietDangKy;
import com.exed.be.service.admin.AdminDonHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Admin Quản lý đơn hàng
 *
 * GET    /api/admin/donhang                        - Tất cả đơn hàng
 * GET    /api/admin/donhang/export/excel           - Xuất CSV danh sách đơn
 * GET    /api/admin/donhang/{id}                   - Chi tiết đơn hàng
 * GET    /api/admin/donhang/{id}/chitiet           - Phiếu chi tiết đăng ký
 * GET    /api/admin/donhang/khachhang/{maNguoiDung} - Đơn theo khách hàng
 * GET    /api/admin/donhang/chiendich/{maChienDich} - Đơn theo chiến dịch
 * GET    /api/admin/donhang/chiendich/{id}/thongke  - Thống kê đơn của chiến dịch
 * PATCH  /api/admin/donhang/{id}/huy               - Hủy đơn hàng
 * PATCH  /api/admin/donhang/{id}/hoantien          - Xác nhận hoàn tiền
 *
 * GIAO HÀNG (DonHang)
 * GET    /api/admin/donhang/{id}/giaohang                          - Phiếu giao hàng của đăng ký
 * POST   /api/admin/donhang/{id}/giaohang                          - Tạo phiếu giao hàng
 * GET    /api/admin/donhang/giaohang                               - Tất cả phiếu giao
 * GET    /api/admin/donhang/giaohang/{maDonHang}                   - Chi tiết phiếu giao
 * PATCH  /api/admin/donhang/giaohang/{maDonHang}/trangthai         - Cập nhật trạng thái giao
 */
@RestController
@RequestMapping("/api/admin/donhang")
@CrossOrigin(origins = "*")
public class AdminDonHangController {

    @Autowired
    private AdminDonHangService adminDonHangService;

    @Autowired
    private com.exed.be.service.admin.AdminExportService adminExportService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DangKyChienDich> list = adminDonHangService.getAllDonHang();
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] data = adminExportService.exportDonHangCsv();
        String fileName = "donhang-exed-" + java.time.LocalDate.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")) + ".csv";
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", fileName);
        headers.setContentLength(data.length);
        return new ResponseEntity<>(data, headers, 200);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<DangKyChienDich> dk = adminDonHangService.getDonHangById(id);
            if (dk.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy đơn hàng: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("data", dk.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}/chitiet")
    public ResponseEntity<Map<String, Object>> getChiTiet(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<PhieuChiTietDangKy> list = adminDonHangService.getChiTietDonHang(id);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/khachhang/{maNguoiDung}")
    public ResponseEntity<Map<String, Object>> getByKhachHang(@PathVariable String maNguoiDung) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DangKyChienDich> list = adminDonHangService.getDonHangByKhachHang(maNguoiDung);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/chiendich/{maChienDich}")
    public ResponseEntity<Map<String, Object>> getByChienDich(@PathVariable String maChienDich) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DangKyChienDich> list = adminDonHangService.getDonHangByChienDich(maChienDich);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/chiendich/{maChienDich}/thongke")
    public ResponseEntity<Map<String, Object>> thongKe(@PathVariable String maChienDich) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> stats = adminDonHangService.thongKeDonHangChienDich(maChienDich);
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PatchMapping("/{id}/huy")
    public ResponseEntity<Map<String, Object>> huyDonHang(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            DangKyChienDich dk = adminDonHangService.huyDonHang(id);
            response.put("success", true);
            response.put("message", "Hủy đơn hàng thành công");
            response.put("data", dk);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PatchMapping("/{id}/hoantien")
    public ResponseEntity<Map<String, Object>> xacNhanHoanTien(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            DangKyChienDich dk = adminDonHangService.xacNhanHoanTien(id);
            response.put("success", true);
            response.put("message", "Xác nhận hoàn tiền thành công");
            response.put("data", dk);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    // ── GIAO HÀNG ──────────────────────────────────────────────

    @GetMapping("/giaohang")
    public ResponseEntity<Map<String, Object>> getAllGiaoHang() {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminDonHangService.getAllGiaoHang();
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/giaohang/{maDonHang}")
    public ResponseEntity<Map<String, Object>> getGiaoHangById(@PathVariable String maDonHang) {
        Map<String, Object> response = new HashMap<>();
        try {
            var opt = adminDonHangService.getGiaoHangById(maDonHang);
            if (opt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy phiếu giao: " + maDonHang);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("data", opt.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}/giaohang")
    public ResponseEntity<Map<String, Object>> getGiaoHangByDangKy(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            var opt = adminDonHangService.getGiaoHangByDangKy(id);
            if (opt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Đăng ký chưa có phiếu giao hàng");
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("data", opt.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/{id}/giaohang")
    public ResponseEntity<Map<String, Object>> taoPhieuGiao(
            @PathVariable Integer id,
            @RequestBody(required = false) com.exed.be.dto.admin.DonHangRequest body) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (body == null) body = new com.exed.be.dto.admin.DonHangRequest();
            body.setMaDangKy(id);
            var dh = adminDonHangService.taoPhieuGiao(body);
            response.put("success", true);
            response.put("message", "Tạo phiếu giao hàng thành công");
            response.put("data", dh);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PatchMapping("/giaohang/{maDonHang}/trangthai")
    public ResponseEntity<Map<String, Object>> capNhatTrangThaiGiao(
            @PathVariable String maDonHang,
            @RequestParam(required = false) String trangThai,
            @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String tt = trangThai;
            if ((tt == null || tt.isBlank()) && body != null && body.get("trangThai") != null) {
                tt = body.get("trangThai").toString();
            }
            var dh = adminDonHangService.capNhatTrangThaiGiao(maDonHang, tt);
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái giao hàng thành công");
            response.put("data", dh);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }
}
