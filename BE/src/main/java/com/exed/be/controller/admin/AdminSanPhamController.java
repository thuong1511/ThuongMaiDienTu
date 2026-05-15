package com.exed.be.controller.admin;

import com.exed.be.dto.admin.SanPhamRequest;
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
 * GET    /api/admin/sanpham                       - Tất cả sản phẩm
 * GET    /api/admin/sanpham/{id}                  - Chi tiết
 * GET    /api/admin/sanpham/danhmuc/{maDanhMuc}   - Lọc theo danh mục
 * GET    /api/admin/sanpham/next-id               - Sinh mã tiếp theo
 * GET    /api/admin/sanpham/{id}/thongke          - Thống kê (đã đặt / còn lại / số CD)
 * GET    /api/admin/sanpham/{id}/chiendich        - Chiến dịch đang dùng SP
 * POST   /api/admin/sanpham                       - Thêm SP (kèm mauSacs / kichThuocs / hinhAnhs)
 * PUT    /api/admin/sanpham/{id}                  - Cập nhật SP (replace biến thể)
 * DELETE /api/admin/sanpham/{id}                  - Xóa SP
 *
 * GET    /api/admin/sanpham/{id}/hinhanh                     - Danh sách ảnh
 * POST   /api/admin/sanpham/{id}/hinhanh                     - Thêm ảnh (truyền sẵn duongDan)
 * PUT    /api/admin/sanpham/{id}/hinhanh/{maHinhAnh}         - Đổi thứ tự
 * DELETE /api/admin/sanpham/{id}/hinhanh/{maHinhAnh}         - Xóa ảnh
 *
 * GET    /api/admin/sanpham/{id}/mausac                      - Danh sách màu của SP
 * POST   /api/admin/sanpham/{id}/mausac                      - Thêm màu
 * PUT    /api/admin/sanpham/{id}/mausac/{maMau}              - Đổi số lượng tối đa
 * DELETE /api/admin/sanpham/{id}/mausac/{maMau}              - Xóa màu
 *
 * GET    /api/admin/sanpham/{id}/kichthuoc                   - Danh sách size của SP
 * POST   /api/admin/sanpham/{id}/kichthuoc                   - Gắn size
 * DELETE /api/admin/sanpham/{id}/kichthuoc/{maSize}          - Bỏ size
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
            return err(response, e, 500);
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
            return err(response, e, 500);
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
            return err(response, e, 500);
        }
    }

    @GetMapping("/next-id")
    public ResponseEntity<Map<String, Object>> getNextId() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", adminSanPhamService.generateNextMaSanPham());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody SanPhamRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            SanPham sp = adminSanPhamService.createSanPham(request);
            response.put("success", true);
            response.put("message", "Thêm sản phẩm thành công");
            response.put("data", sp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id,
                                                       @RequestBody SanPhamRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            SanPham sp = adminSanPhamService.updateSanPham(id, request);
            response.put("success", true);
            response.put("message", "Cập nhật sản phẩm thành công");
            response.put("data", sp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
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
            return err(response, e, 500);
        }
    }

    // ── Thống kê + chiến dịch dùng SP ──────────────────────────
    @GetMapping("/{id}/thongke")
    public ResponseEntity<Map<String, Object>> getThongKe(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", adminSanPhamService.getThongKe(id));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return err(response, e, 404);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @GetMapping("/{id}/chiendich")
    public ResponseEntity<Map<String, Object>> getChienDich(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminSanPhamService.getChienDichDungSP(id);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    // ── Hình ảnh ───────────────────────────────────────────────
    @GetMapping("/{id}/hinhanh")
    public ResponseEntity<Map<String, Object>> getHinhAnh(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminSanPhamService.getHinhAnh(id);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
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
            var anh = adminSanPhamService.themHinhAnh(id, duongDan, thuTu);
            response.put("success", true);
            response.put("message", "Thêm ảnh thành công");
            response.put("data", anh);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @PutMapping("/{id}/hinhanh/{maHinhAnh}")
    public ResponseEntity<Map<String, Object>> capNhatThuTu(@PathVariable String id,
                                                              @PathVariable Integer maHinhAnh,
                                                              @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer thuTu = body.get("thuTu") != null ? ((Number) body.get("thuTu")).intValue() : 1;
            var anh = adminSanPhamService.capNhatThuTuHinhAnh(id, maHinhAnh, thuTu);
            response.put("success", true);
            response.put("message", "Cập nhật thứ tự thành công");
            response.put("data", anh);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @DeleteMapping("/{id}/hinhanh/{maHinhAnh}")
    public ResponseEntity<Map<String, Object>> xoaHinhAnh(@PathVariable String id,
                                                            @PathVariable Integer maHinhAnh) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean ok = adminSanPhamService.xoaHinhAnh(id, maHinhAnh);
            if (!ok) {
                response.put("success", false);
                response.put("message", "Không tìm thấy ảnh: " + maHinhAnh);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("message", "Xóa ảnh thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    // ── Màu sắc ────────────────────────────────────────────────
    @GetMapping("/{id}/mausac")
    public ResponseEntity<Map<String, Object>> getMauSacs(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminSanPhamService.getMauSacs(id);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @PostMapping("/{id}/mausac")
    public ResponseEntity<Map<String, Object>> themMauSac(@PathVariable String id,
                                                            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer maMau = body.get("maMau") != null ? ((Number) body.get("maMau")).intValue() : null;
            Integer slMax = body.get("soLuongToiDa") != null ? ((Number) body.get("soLuongToiDa")).intValue() : 0;
            if (maMau == null) {
                response.put("success", false);
                response.put("message", "Thiếu maMau");
                return ResponseEntity.status(400).body(response);
            }
            var spm = adminSanPhamService.themMauSac(id, maMau, slMax);
            response.put("success", true);
            response.put("message", "Thêm màu thành công");
            response.put("data", spm);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @PutMapping("/{id}/mausac/{maMau}")
    public ResponseEntity<Map<String, Object>> capNhatMauSac(@PathVariable String id,
                                                               @PathVariable Integer maMau,
                                                               @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer slMax = body.get("soLuongToiDa") != null ? ((Number) body.get("soLuongToiDa")).intValue() : null;
            var spm = adminSanPhamService.capNhatMauSac(id, maMau, slMax);
            response.put("success", true);
            response.put("message", "Cập nhật màu thành công");
            response.put("data", spm);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @DeleteMapping("/{id}/mausac/{maMau}")
    public ResponseEntity<Map<String, Object>> xoaMauSac(@PathVariable String id,
                                                           @PathVariable Integer maMau) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean ok = adminSanPhamService.xoaMauSac(id, maMau);
            if (!ok) {
                response.put("success", false);
                response.put("message", "Sản phẩm chưa có màu này");
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("message", "Xóa màu thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    // ── Kích thước ────────────────────────────────────────────
    @GetMapping("/{id}/kichthuoc")
    public ResponseEntity<Map<String, Object>> getKichThuocs(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminSanPhamService.getKichThuocs(id);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @PostMapping("/{id}/kichthuoc")
    public ResponseEntity<Map<String, Object>> themKichThuoc(@PathVariable String id,
                                                               @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer maSize = body.get("maSize") != null ? ((Number) body.get("maSize")).intValue() : null;
            if (maSize == null) {
                response.put("success", false);
                response.put("message", "Thiếu maSize");
                return ResponseEntity.status(400).body(response);
            }
            var spk = adminSanPhamService.themKichThuoc(id, maSize);
            response.put("success", true);
            response.put("message", "Thêm size thành công");
            response.put("data", spk);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @DeleteMapping("/{id}/kichthuoc/{maSize}")
    public ResponseEntity<Map<String, Object>> xoaKichThuoc(@PathVariable String id,
                                                              @PathVariable Integer maSize) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean ok = adminSanPhamService.xoaKichThuoc(id, maSize);
            if (!ok) {
                response.put("success", false);
                response.put("message", "Sản phẩm chưa có size này");
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("message", "Xóa size thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    // ── helpers ────────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> err(Map<String, Object> response, Exception e, int status) {
        response.put("success", false);
        response.put("message", e.getMessage() != null ? e.getMessage() : "Lỗi");
        return ResponseEntity.status(status).body(response);
    }
}
