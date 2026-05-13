package com.exed.be.controller.admin;

import com.exed.be.dto.admin.KhachHangUpdateRequest;
import com.exed.be.model.DangKyChienDich;
import com.exed.be.model.NguoiDung;
import com.exed.be.service.admin.AdminKhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Admin Quản lý khách hàng
 *
 * GET    /api/admin/khachhang              - Tất cả người dùng
 * GET    /api/admin/khachhang/vaitro/{v}   - Lọc theo vai trò
 * GET    /api/admin/khachhang/{id}         - Chi tiết khách hàng
 * GET    /api/admin/khachhang/{id}/lichsu  - Lịch sử đăng ký chiến dịch
 * PUT    /api/admin/khachhang/{id}         - Cập nhật thông tin
 * PATCH  /api/admin/khachhang/{id}/toggle  - Khóa / mở khóa tài khoản
 */
@RestController
@RequestMapping("/api/admin/khachhang")
@CrossOrigin(origins = "*")
public class AdminKhachHangController {

    @Autowired
    private AdminKhachHangService adminKhachHangService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NguoiDung> list = adminKhachHangService.getAllKhachHang();
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

    @GetMapping("/vaitro/{vaiTro}")
    public ResponseEntity<Map<String, Object>> getByVaiTro(@PathVariable String vaiTro) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NguoiDung> list = adminKhachHangService.getKhachHangByVaiTro(vaiTro);
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
            Optional<NguoiDung> nd = adminKhachHangService.getKhachHangById(id);
            if (nd.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy người dùng: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("data", nd.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}/lichsu")
    public ResponseEntity<Map<String, Object>> getLichSu(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DangKyChienDich> list = adminKhachHangService.getLichSuDangKy(id);
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

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id,
                                                       @RequestBody KhachHangUpdateRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            NguoiDung nd = adminKhachHangService.updateKhachHang(id, request);
            response.put("success", true);
            response.put("message", "Cập nhật thành công");
            response.put("data", nd);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleTrangThai(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            NguoiDung nd = adminKhachHangService.toggleTrangThai(id);
            response.put("success", true);
            response.put("message", "Trạng thái tài khoản: " + nd.getTrangThai());
            response.put("data", nd);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }
}
