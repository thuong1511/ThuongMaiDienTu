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
}
