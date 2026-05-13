package com.exed.be.controller.admin;

import com.exed.be.model.SanPham;
import com.exed.be.service.admin.AdminSanPhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Admin Quản lý sản phẩm
 *
 * GET    /api/admin/sanpham                    - Tất cả sản phẩm
 * GET    /api/admin/sanpham/{id}               - Chi tiết sản phẩm
 * GET    /api/admin/sanpham/danhmuc/{maDanhMuc} - Lọc theo danh mục
 * POST   /api/admin/sanpham                    - Thêm sản phẩm mới
 * PUT    /api/admin/sanpham/{id}               - Cập nhật sản phẩm
 * DELETE /api/admin/sanpham/{id}               - Xóa sản phẩm
 */
@RestController
@RequestMapping("/api/admin/sanpham")
@CrossOrigin(origins = "*")
public class AdminSanPhamController {

    @Autowired
    private AdminSanPhamService adminSanPhamService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<SanPham> list = adminSanPhamService.getAllSanPham();
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
            Optional<SanPham> sp = adminSanPhamService.getSanPhamById(id);
            if (sp.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy sản phẩm: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("data", sp.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/danhmuc/{maDanhMuc}")
    public ResponseEntity<Map<String, Object>> getByDanhMuc(@PathVariable String maDanhMuc) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<SanPham> list = adminSanPhamService.getSanPhamByDanhMuc(maDanhMuc);
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
    public ResponseEntity<Map<String, Object>> create(@RequestBody SanPham sanPham) {
        Map<String, Object> response = new HashMap<>();
        try {
            SanPham sp = adminSanPhamService.createSanPham(sanPham);
            response.put("success", true);
            response.put("message", "Thêm sản phẩm thành công");
            response.put("data", sp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id,
                                                       @RequestBody SanPham request) {
        Map<String, Object> response = new HashMap<>();
        try {
            SanPham sp = adminSanPhamService.updateSanPham(id, request);
            response.put("success", true);
            response.put("message", "Cập nhật sản phẩm thành công");
            response.put("data", sp);
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
            boolean deleted = adminSanPhamService.deleteSanPham(id);
            if (!deleted) {
                response.put("success", false);
                response.put("message", "Không tìm thấy sản phẩm: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("message", "Xóa sản phẩm thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
