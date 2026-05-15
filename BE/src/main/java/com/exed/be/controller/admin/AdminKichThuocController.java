package com.exed.be.controller.admin;

import com.exed.be.model.KichThuoc;
import com.exed.be.repository.KichThuocRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Quản lý kích thước (master data)
 *
 * GET    /api/admin/kichthuoc                       - Tất cả
 * GET    /api/admin/kichthuoc/loai/{loaiKichThuoc}  - Lọc theo loại (Áo / Giày)
 * POST   /api/admin/kichthuoc        body: {"tenSize":"...", "loaiKichThuoc":"..."}
 * PUT    /api/admin/kichthuoc/{maSize}
 * DELETE /api/admin/kichthuoc/{maSize}
 */
@RestController
@RequestMapping("/api/admin/kichthuoc")
@CrossOrigin(origins = "*")
public class AdminKichThuocController {

    @Autowired
    private KichThuocRepository kichThuocRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        var list = kichThuocRepository.findAll();
        response.put("success", true);
        response.put("data", list);
        response.put("total", list.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/loai/{loaiKichThuoc}")
    public ResponseEntity<Map<String, Object>> getByLoai(@PathVariable String loaiKichThuoc) {
        Map<String, Object> response = new HashMap<>();
        List<KichThuoc> list = kichThuocRepository.findByLoaiKichThuoc(loaiKichThuoc);
        response.put("success", true);
        response.put("data", list);
        response.put("total", list.size());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String tenSize = (String) body.get("tenSize");
            String loai = (String) body.get("loaiKichThuoc");
            if (tenSize == null || tenSize.isBlank()) throw new RuntimeException("Thiếu tenSize");
            KichThuoc k = new KichThuoc();
            k.setTenSize(tenSize.trim());
            k.setLoaiKichThuoc(loai);
            k = kichThuocRepository.save(k);
            response.put("success", true);
            response.put("data", k);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PutMapping("/{maSize}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Integer maSize,
                                                       @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            KichThuoc k = kichThuocRepository.findById(maSize)
                    .orElseThrow(() -> new RuntimeException("Size không tồn tại"));
            String tenSize = (String) body.get("tenSize");
            String loai = (String) body.get("loaiKichThuoc");
            if (tenSize != null) k.setTenSize(tenSize);
            if (loai != null) k.setLoaiKichThuoc(loai);
            kichThuocRepository.save(k);
            response.put("success", true);
            response.put("data", k);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @DeleteMapping("/{maSize}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Integer maSize) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!kichThuocRepository.existsById(maSize)) {
                response.put("success", false);
                response.put("message", "Size không tồn tại");
                return ResponseEntity.status(404).body(response);
            }
            kichThuocRepository.deleteById(maSize);
            response.put("success", true);
            response.put("message", "Xóa thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Không thể xóa: size đang được sử dụng");
            return ResponseEntity.status(400).body(response);
        }
    }
}
