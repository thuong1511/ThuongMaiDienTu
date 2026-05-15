package com.exed.be.controller.admin;

import com.exed.be.dto.admin.ThongBaoRequest;
import com.exed.be.model.ThongBao;
import com.exed.be.service.admin.AdminThongBaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Thông báo
 *
 * GET    /api/admin/thongbao                                  - Tất cả thông báo
 * GET    /api/admin/thongbao/cua-toi?maNguoiDung=ND001        - Thông báo của user (cho icon chuông)
 * GET    /api/admin/thongbao/cua-toi/count?maNguoiDung=ND001  - Đếm chưa đọc (badge số)
 * POST   /api/admin/thongbao                                  - Gửi thông báo (1/nhiều/theo vai trò)
 * PATCH  /api/admin/thongbao/{id}/read                        - Mark read 1 cái
 * PATCH  /api/admin/thongbao/cua-toi/read-all?maNguoiDung=... - Mark all read cho user
 * DELETE /api/admin/thongbao/{id}                             - Xóa
 */
@RestController
@RequestMapping("/api/admin/thongbao")
@CrossOrigin(origins = "*")
public class AdminThongBaoController {

    @Autowired
    private AdminThongBaoService adminThongBaoService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminThongBaoService.getAll();
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @GetMapping("/cua-toi")
    public ResponseEntity<Map<String, Object>> getMine(@RequestParam String maNguoiDung) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<ThongBao> list = adminThongBaoService.getByNguoiDung(maNguoiDung);
            long unread = adminThongBaoService.countUnread(maNguoiDung);
            response.put("success", true);
            response.put("data", list);
            response.put("total", list.size());
            response.put("unread", unread);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @GetMapping("/cua-toi/count")
    public ResponseEntity<Map<String, Object>> countUnread(@RequestParam String maNguoiDung) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", adminThongBaoService.countUnread(maNguoiDung));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> gui(@RequestBody ThongBaoRequest req) {
        Map<String, Object> response = new HashMap<>();
        try {
            var list = adminThongBaoService.guiThongBao(req);
            response.put("success", true);
            response.put("message", "Đã gửi cho " + list.size() + " người dùng");
            response.put("data", list);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markRead(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            var tb = adminThongBaoService.markRead(id);
            response.put("success", true);
            response.put("data", tb);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 400);
        }
    }

    @PatchMapping("/cua-toi/read-all")
    public ResponseEntity<Map<String, Object>> markAllRead(@RequestParam String maNguoiDung) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = adminThongBaoService.markAllRead(maNguoiDung);
            response.put("success", true);
            response.put("message", "Đã đánh dấu " + count + " thông báo");
            response.put("data", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return err(response, e, 500);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean ok = adminThongBaoService.delete(id);
            if (!ok) {
                response.put("success", false);
                response.put("message", "Không tìm thấy thông báo");
                return ResponseEntity.status(404).body(response);
            }
            response.put("success", true);
            response.put("message", "Xóa thành công");
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
