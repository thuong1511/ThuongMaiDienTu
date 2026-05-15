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
 * GET    /api/admin/nghesi                      - Tất cả nghệ sĩ
 * GET    /api/admin/nghesi/{id}                 - Chi tiết nghệ sĩ
 * GET    /api/admin/nghesi/next-id              - Sinh mã tiếp theo
 * GET    /api/admin/nghesi/{id}/thongke         - Thống kê (tổng CD, đơn, doanh thu)
 * GET    /api/admin/nghesi/{id}/chiendich       - Chiến dịch của NS
 * POST   /api/admin/nghesi                      - Thêm nghệ sĩ
 * PUT    /api/admin/nghesi/{id}                 - Cập nhật nghệ sĩ
 * DELETE /api/admin/nghesi/{id}                 - Xóa nghệ sĩ
 *
 * GET    /api/admin/nghesi/{id}/hinhanh                       - Danh sách ảnh
 * POST   /api/admin/nghesi/{id}/hinhanh                       - Thêm ảnh
 * PUT    /api/admin/nghesi/{id}/hinhanh/{maHinhAnh}           - Đổi thứ tự
 * DELETE /api/admin/nghesi/{id}/hinhanh/{maHinhAnh}           - Xóa ảnh
 * PUT    /api/admin/nghesi/{id}/anh-dai-dien                  - Thay ảnh đại diện (duy nhất)
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
            return err(response, e, 500);
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
            return err(response, e, 500);
        }
    }

    @GetMapping("/next-id")
    public ResponseEntity<Map<String, Object>> getNextId() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", adminNgheSiService.generateNextMaNgheSi());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @GetMapping("/{id}/thongke")
    public ResponseEntity<Map<String, Object>> getThongKe(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", adminNgheSiService.getThongKe(id));
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
            var list = adminNgheSiService.getChienDichByNgheSi(id);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
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
            return err(response, e, 400);
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
            return err(response, e, 400);
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
            return err(response, e, 500);
        }
    }

    // ── Ảnh nghệ sĩ ───────────────────────────────────────────
    @GetMapping("/{id}/hinhanh")
    public ResponseEntity<Map<String, Object>> getHinhAnh(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminNgheSiService.getHinhAnh(id);
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
            var anh = adminNgheSiService.themHinhAnh(id, duongDan, thuTu);
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
            var anh = adminNgheSiService.capNhatThuTu(id, maHinhAnh, thuTu);
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
            boolean ok = adminNgheSiService.xoaHinhAnh(id, maHinhAnh);
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

    @PutMapping("/{id}/anh-dai-dien")
    public ResponseEntity<Map<String, Object>> capNhatAnhDaiDien(@PathVariable String id,
                                                                   @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String duongDan = (String) body.get("duongDan");
            if (duongDan == null || duongDan.isBlank()) {
                response.put("success", false);
                response.put("message", "Thiếu duongDan");
                return ResponseEntity.status(400).body(response);
            }
            var anh = adminNgheSiService.capNhatAnhDaiDien(id, duongDan);
            response.put("success", true);
            response.put("message", "Cập nhật ảnh đại diện thành công");
            response.put("data", anh);
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
