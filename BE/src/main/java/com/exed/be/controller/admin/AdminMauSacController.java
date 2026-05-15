package com.exed.be.controller.admin;

import com.exed.be.model.MauSac;
import com.exed.be.repository.MauSacRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin Quản lý màu sắc (master data)
 *
 * GET    /api/admin/mausac
 * POST   /api/admin/mausac           body: {"tenMau": "..."}
 * PUT    /api/admin/mausac/{maMau}
 * DELETE /api/admin/mausac/{maMau}
 */
@RestController
@RequestMapping("/api/admin/mausac")
@CrossOrigin(origins = "*")
public class AdminMauSacController {

    @Autowired
    private MauSacRepository mauSacRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        var list = mauSacRepository.findAll();
        response.put("success", true);
        response.put("data", list);
        response.put("total", list.size());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String tenMau = (String) body.get("tenMau");
            if (tenMau == null || tenMau.isBlank()) throw new RuntimeException("Thiếu tenMau");
            MauSac m = new MauSac();
            m.setTenMau(tenMau.trim());
            m = mauSacRepository.save(m);
            response.put("success", true);
            response.put("message", "Thêm màu thành công");
            response.put("data", m);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PutMapping("/{maMau}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Integer maMau,
                                                       @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            MauSac m = mauSacRepository.findById(maMau)
                    .orElseThrow(() -> new RuntimeException("Màu không tồn tại"));
            String tenMau = (String) body.get("tenMau");
            if (tenMau != null && !tenMau.isBlank()) m.setTenMau(tenMau.trim());
            mauSacRepository.save(m);
            response.put("success", true);
            response.put("data", m);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @DeleteMapping("/{maMau}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Integer maMau) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!mauSacRepository.existsById(maMau)) {
                response.put("success", false);
                response.put("message", "Màu không tồn tại");
                return ResponseEntity.status(404).body(response);
            }
            mauSacRepository.deleteById(maMau);
            response.put("success", true);
            response.put("message", "Xóa thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Không thể xóa: màu đang được sử dụng");
            return ResponseEntity.status(400).body(response);
        }
    }
}
