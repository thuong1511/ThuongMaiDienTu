package com.exed.be.controller.admin;

import com.exed.be.dto.admin.ChienDichRequest;
import com.exed.be.model.ChienDich;
import com.exed.be.model.DangKyChienDich;
import com.exed.be.service.admin.AdminChienDichService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Admin Quản lý chiến dịch
 *
 * GET    /api/admin/chiendich              - Lấy tất cả chiến dịch
 * GET    /api/admin/chiendich/{id}         - Lấy chi tiết chiến dịch
 * GET    /api/admin/chiendich/thoiDiem/{t} - Lọc theo thời điểm
 * GET    /api/admin/chiendich/{id}/dangky  - Danh sách đăng ký của chiến dịch
 * POST   /api/admin/chiendich              - Tạo chiến dịch mới
 * PUT    /api/admin/chiendich/{id}         - Cập nhật chiến dịch
 * PATCH  /api/admin/chiendich/{id}/trangthai - Cập nhật trạng thái
 * DELETE /api/admin/chiendich/{id}         - Xóa chiến dịch
 *
 * GET    /api/admin/chiendich/{id}/hinhanh             - Danh sách ảnh
 * POST   /api/admin/chiendich/{id}/hinhanh             - Thêm ảnh (truyền sẵn duongDan)
 * PUT    /api/admin/chiendich/{id}/hinhanh/{maHinhAnh} - Đổi thứ tự
 * DELETE /api/admin/chiendich/{id}/hinhanh/{maHinhAnh} - Xóa ảnh
 *
 * GET    /api/admin/chiendich/{id}/thongke             - Thống kê chi tiết (admin-campaign-detail)
 */
@RestController
@RequestMapping("/api/admin/chiendich")
@CrossOrigin(origins = "*")
public class AdminChienDichController {

    @Autowired
    private AdminChienDichService adminChienDichService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<ChienDich> list = adminChienDichService.getAllChienDich();
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

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<ChienDich> cd = adminChienDichService.getChienDichById(id);
            if (cd.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy chiến dịch: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("data", cd.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/thoiDiem/{thoiDiem}")
    public ResponseEntity<Map<String, Object>> getByThoiDiem(@PathVariable String thoiDiem) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<ChienDich> list = adminChienDichService.getChienDichByThoiDiem(thoiDiem);
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

    @GetMapping("/next-id")
    public ResponseEntity<Map<String, Object>> getNextId() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", adminChienDichService.generateNextMaChienDich());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}/dangky")
    public ResponseEntity<Map<String, Object>> getDangKy(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DangKyChienDich> list = adminChienDichService.getDangKyByChienDich(id);
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

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody ChienDichRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            ChienDich cd = adminChienDichService.createChienDich(request);
            response.put("success", true);
            response.put("message", "Tạo chiến dịch thành công");
            response.put("data", cd);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id,
                                                       @RequestBody ChienDichRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            ChienDich cd = adminChienDichService.updateChienDich(id, request);
            response.put("success", true);
            response.put("message", "Cập nhật chiến dịch thành công");
            response.put("data", cd);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PatchMapping("/{id}/trangthai")
    public ResponseEntity<Map<String, Object>> updateTrangThai(
            @PathVariable String id,
            @RequestParam(required = false) String thoiDiem,
            @RequestParam(required = false) String trangThai) {
        Map<String, Object> response = new HashMap<>();
        try {
            ChienDich cd = adminChienDichService.updateTrangThai(id, thoiDiem, trangThai);
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái thành công");
            response.put("data", cd);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean deleted = adminChienDichService.deleteChienDich(id);
            if (!deleted) {
                response.put("success", false);
                response.put("message", "Không tìm thấy chiến dịch: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("message", "Xóa chiến dịch thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ── HÌNH ẢNH CHIẾN DỊCH ────────────────────────────────────
    @GetMapping("/{id}/hinhanh")
    public ResponseEntity<Map<String, Object>> getHinhAnh(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminChienDichService.getHinhAnh(id);
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

    // ── THỐNG KÊ CHI TIẾT ──────────────────────────────────────
    @GetMapping("/{id}/thongke")
    public ResponseEntity<Map<String, Object>> getThongKe(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            var data = adminChienDichService.getThongKe(id);
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/{id}/hinhanh")
    public ResponseEntity<Map<String, Object>> themHinhAnh(@PathVariable String id,
                                                             @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String duongDan = (String) body.get("duongDan");
            Integer thuTu = body.get("thuTu") != null ? ((Number) body.get("thuTu")).intValue() : 1;
            if (duongDan == null || duongDan.isBlank()) {
                response.put("success", false);
                response.put("message", "Thiếu duongDan");
                return ResponseEntity.status(400).body(response);
            }
            var anh = adminChienDichService.themHinhAnh(id, duongDan, thuTu);
            response.put("success", true);
            response.put("message", "Thêm ảnh thành công");
            response.put("data", anh);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PutMapping("/{id}/hinhanh/{maHinhAnh}")
    public ResponseEntity<Map<String, Object>> capNhatThuTu(@PathVariable String id,
                                                              @PathVariable Integer maHinhAnh,
                                                              @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer thuTu = body.get("thuTu") != null ? ((Number) body.get("thuTu")).intValue() : 1;
            var anh = adminChienDichService.capNhatThuTu(id, maHinhAnh, thuTu);
            response.put("success", true);
            response.put("message", "Cập nhật thứ tự thành công");
            response.put("data", anh);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @DeleteMapping("/{id}/hinhanh/{maHinhAnh}")
    public ResponseEntity<Map<String, Object>> xoaHinhAnh(@PathVariable String id,
                                                            @PathVariable Integer maHinhAnh) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean ok = adminChienDichService.xoaHinhAnh(id, maHinhAnh);
            if (!ok) {
                response.put("success", false);
                response.put("message", "Không tìm thấy ảnh: " + maHinhAnh);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("message", "Xóa ảnh thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }
}
