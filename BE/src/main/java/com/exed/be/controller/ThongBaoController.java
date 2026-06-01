package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.model.ThongBao;
import com.exed.be.service.ThongBaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý thông báo của người dùng cuối
 */
@RestController
@RequestMapping("/api/thongbao")
@CrossOrigin(origins = "*")
public class ThongBaoController {

    @Autowired
    private ThongBaoService thongBaoService;

    /**
     * Lấy danh sách thông báo của một người dùng
     */
    @GetMapping("/nguoidung/{maNguoiDung}")
    public ResponseEntity<ApiResponse<List<ThongBao>>> getNotificationsByNguoiDung(@PathVariable String maNguoiDung) {
        try {
            List<ThongBao> list = thongBaoService.getByNguoiDung(maNguoiDung);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thông báo thành công", list));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }

    /**
     * Đếm số thông báo chưa đọc của một người dùng
     */
    @GetMapping("/nguoidung/{maNguoiDung}/unread-count")
    public ResponseEntity<ApiResponse<Long>> countUnreadNotifications(@PathVariable String maNguoiDung) {
        try {
            long count = thongBaoService.countUnread(maNguoiDung);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đếm số lượng thông báo chưa đọc thành công", count));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }

    /**
     * Đánh dấu một thông báo là đã đọc
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<ThongBao>> markNotificationRead(@PathVariable Integer id) {
        try {
            ThongBao tb = thongBaoService.markRead(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đánh dấu đã đọc thành công", tb));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }

    /**
     * Đánh dấu tất cả thông báo của một người dùng là đã đọc
     */
    @PatchMapping("/nguoidung/{maNguoiDung}/read-all")
    public ResponseEntity<ApiResponse<Integer>> markAllNotificationsRead(@PathVariable String maNguoiDung) {
        try {
            int count = thongBaoService.markAllRead(maNguoiDung);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đánh dấu tất cả đã đọc thành công", count));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }

    /**
     * Xóa một thông báo
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Boolean>> deleteNotification(@PathVariable Integer id) {
        try {
            boolean success = thongBaoService.delete(id);
            if (success) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Xóa thông báo thành công", true));
            } else {
                return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thông báo để xóa", false));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
}
