package com.exed.be.controller.admin;

import com.exed.be.model.DangKyChienDich;
import com.exed.be.model.PhieuChiTietDangKy;
import com.exed.be.service.admin.AdminDonHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Admin Quản lý đơn hàng
 *
 * GET    /api/admin/donhang                        - Tất cả đơn hàng
 * GET    /api/admin/donhang/{id}                   - Chi tiết đơn hàng
 * GET    /api/admin/donhang/{id}/chitiet           - Phiếu chi tiết đăng ký
 * GET    /api/admin/donhang/khachhang/{maNguoiDung} - Đơn theo khách hàng
 * GET    /api/admin/donhang/chiendich/{maChienDich} - Đơn theo chiến dịch
 * GET    /api/admin/donhang/chiendich/{id}/thongke  - Thống kê đơn của chiến dịch
 * PATCH  /api/admin/donhang/{id}/huy               - Hủy đơn hàng
 * PATCH  /api/admin/donhang/{id}/hoantien          - Xác nhận hoàn tiền
 */
@RestController
@RequestMapping("/api/admin/donhang")
@CrossOrigin(origins = "*")
public class AdminDonHangController {

    @Autowired
    private AdminDonHangService adminDonHangService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DangKyChienDich> list = adminDonHangService.getAllDonHang();
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
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<DangKyChienDich> dk = adminDonHangService.getDonHangById(id);
            if (dk.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy đơn hàng: " + id);
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("data", dk.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}/chitiet")
    public ResponseEntity<Map<String, Object>> getChiTiet(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<PhieuChiTietDangKy> list = adminDonHangService.getChiTietDonHang(id);
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

    @GetMapping("/khachhang/{maNguoiDung}")
    public ResponseEntity<Map<String, Object>> getByKhachHang(@PathVariable String maNguoiDung) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DangKyChienDich> list = adminDonHangService.getDonHangByKhachHang(maNguoiDung);
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

    @GetMapping("/chiendich/{maChienDich}")
    public ResponseEntity<Map<String, Object>> getByChienDich(@PathVariable String maChienDich) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DangKyChienDich> list = adminDonHangService.getDonHangByChienDich(maChienDich);
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

    @GetMapping("/chiendich/{maChienDich}/thongke")
    public ResponseEntity<Map<String, Object>> thongKe(@PathVariable String maChienDich) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> stats = adminDonHangService.thongKeDonHangChienDich(maChienDich);
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PatchMapping("/{id}/huy")
    public ResponseEntity<Map<String, Object>> huyDonHang(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            DangKyChienDich dk = adminDonHangService.huyDonHang(id);
            response.put("success", true);
            response.put("message", "Hủy đơn hàng thành công");
            response.put("data", dk);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PatchMapping("/{id}/hoantien")
    public ResponseEntity<Map<String, Object>> xacNhanHoanTien(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            DangKyChienDich dk = adminDonHangService.xacNhanHoanTien(id);
            response.put("success", true);
            response.put("message", "Xác nhận hoàn tiền thành công");
            response.put("data", dk);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }
}
