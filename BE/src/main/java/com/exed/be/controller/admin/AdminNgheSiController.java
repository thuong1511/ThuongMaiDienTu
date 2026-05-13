package com.exed.be.controller.admin;

import com.exed.be.dto.admin.NgheSiRequest;
import com.exed.be.model.NgheSi;
import com.exed.be.service.admin.AdminNgheSiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Admin Quản lý Nghệ sĩ Collab
 *
 * GET    /api/admin/nghesi        - Tất cả nghệ sĩ
 * GET    /api/admin/nghesi/{id}   - Chi tiết nghệ sĩ
 * POST   /api/admin/nghesi        - Thêm nghệ sĩ mới
 * PUT    /api/admin/nghesi/{id}   - Cập nhật nghệ sĩ
 * DELETE /api/admin/nghesi/{id}   - Xóa nghệ sĩ
 */
@RestController
@RequestMapping("/api/admin/nghesi")
@CrossOrigin(origins = "*")
public class AdminNgheSiController {

    @Autowired
    private AdminNgheSiService adminNgheSiService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NgheSi> list = adminNgheSiService.getAllNgheSi();
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
            Optional<NgheSi> ns = adminNgheSiService.getNgheSiById(id);
            if (ns.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy nghệ sĩ: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("data", ns.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody NgheSiRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            NgheSi ns = adminNgheSiService.createNgheSi(request);
            response.put("success", true);
            response.put("message", "Thêm nghệ sĩ thành công");
            response.put("data", ns);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id,
                                                       @RequestBody NgheSiRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            NgheSi ns = adminNgheSiService.updateNgheSi(id, request);
            response.put("success", true);
            response.put("message", "Cập nhật nghệ sĩ thành công");
            response.put("data", ns);
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
            boolean deleted = adminNgheSiService.deleteNgheSi(id);
            if (!deleted) {
                response.put("success", false);
                response.put("message", "Không tìm thấy nghệ sĩ: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("message", "Xóa nghệ sĩ thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
