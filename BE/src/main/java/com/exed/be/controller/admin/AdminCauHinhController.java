package com.exed.be.controller.admin;

import com.exed.be.dto.admin.DoiMatKhauRequest;
import com.exed.be.service.admin.AdminCauHinhService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin Cấu hình hệ thống & Banner
 *
 * GET   /api/admin/cauhinh                   - Lấy tất cả (gom theo nhóm)
 * GET   /api/admin/cauhinh/all               - Lấy danh sách phẳng (kèm metadata)
 * GET   /api/admin/cauhinh/nhom/{nhom}       - Lấy theo nhóm
 * PUT   /api/admin/cauhinh                   - Bulk update {khoa: giaTri, ...}
 * PATCH /api/admin/cauhinh/password          - Đổi mật khẩu admin
 *
 * GET    /api/admin/cauhinh/banner           - Tất cả banner
 * POST   /api/admin/cauhinh/banner           - Thêm banner (truyền sẵn duongDan)
 * PUT    /api/admin/cauhinh/banner/{id}      - Cập nhật
 * DELETE /api/admin/cauhinh/banner/{id}      - Xóa
 */
@RestController
@RequestMapping("/api/admin/cauhinh")
@CrossOrigin(origins = "*")
public class AdminCauHinhController {

    @Autowired
    private AdminCauHinhService adminCauHinhService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getGrouped() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", adminCauHinhService.getGrouped());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminCauHinhService.getAll();
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @GetMapping("/nhom/{nhom}")
    public ResponseEntity<Map<String, Object>> getByNhom(@PathVariable String nhom) {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminCauHinhService.getByNhom(nhom);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> capNhatNhieu(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            var applied = adminCauHinhService.capNhatNhieu(body);
            response.put("success", true);
            response.put("message", "Đã cập nhật " + applied.size() + " mục");
            response.put("data", applied);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @PatchMapping("/password")
    public ResponseEntity<Map<String, Object>> doiMatKhau(@RequestBody DoiMatKhauRequest req) {
        Map<String, Object> response = new HashMap<>();
        try {
            adminCauHinhService.doiMatKhau(req);
            response.put("success", true);
            response.put("message", "Đổi mật khẩu thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    // ── BANNER ────────────────────────────────────────────────
    @GetMapping("/banner")
    public ResponseEntity<Map<String, Object>> getAllBanner() {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminCauHinhService.getAllBanner();
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @PostMapping("/banner")
    public ResponseEntity<Map<String, Object>> themBanner(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String duongDan = (String) body.get("duongDan");
            String tieuDe = (String) body.get("tieuDe");
            Integer thuTu = body.get("thuTu") != null ? ((Number) body.get("thuTu")).intValue() : null;
            Boolean dangHienThi = body.get("dangHienThi") instanceof Boolean
                    ? (Boolean) body.get("dangHienThi") : null;
            var b = adminCauHinhService.themBanner(duongDan, tieuDe, thuTu, dangHienThi);
            response.put("success", true);
            response.put("message", "Thêm banner thành công");
            response.put("data", b);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @PutMapping("/banner/{id}")
    public ResponseEntity<Map<String, Object>> capNhatBanner(@PathVariable Integer id,
                                                               @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String tieuDe = (String) body.get("tieuDe");
            Integer thuTu = body.get("thuTu") != null ? ((Number) body.get("thuTu")).intValue() : null;
            Boolean dangHienThi = body.get("dangHienThi") instanceof Boolean
                    ? (Boolean) body.get("dangHienThi") : null;
            var b = adminCauHinhService.capNhatBanner(id, tieuDe, thuTu, dangHienThi);
            response.put("success", true);
            response.put("message", "Cập nhật banner thành công");
            response.put("data", b);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @DeleteMapping("/banner/{id}")
    public ResponseEntity<Map<String, Object>> xoaBanner(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean ok = adminCauHinhService.xoaBanner(id);
            if (!ok) {
                response.put("success", false);
                response.put("message", "Không tìm thấy banner: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("message", "Xóa banner thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    private ResponseEntity<Map<String, Object>> err(Map<String, Object> response, Exception e, int status) {
        response.put("success", false);
        response.put("message", e.getMessage() != null ? e.getMessage() : "Lỗi");
        return ResponseEntity.status(status).body(response);
    }
}
