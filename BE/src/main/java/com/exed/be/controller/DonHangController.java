package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.model.DonHang;
import com.exed.be.service.DonHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * User-facing Đơn hàng Controller
 * 
 * GET /api/donhang/nguoidung/{maNguoiDung}  - Lấy tất cả đơn hàng của user
 * GET /api/donhang/{maDonHang}               - Chi tiết đơn hàng
 */
@RestController
@RequestMapping("/api/donhang")
@CrossOrigin(origins = "*")
public class DonHangController {
    
    @Autowired
    private DonHangService donHangService;
    
    /**
     * Lấy tất cả đơn hàng của một người dùng
     */
    @GetMapping("/nguoidung/{maNguoiDung}")
    public ResponseEntity<ApiResponse<List<DonHang>>> getDonHangByNguoiDung(@PathVariable String maNguoiDung) {
        try {
            List<DonHang> list = donHangService.getDonHangByNguoiDung(maNguoiDung);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn hàng thành công", list));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    /**
     * Lấy chi tiết một đơn hàng
     */
    @GetMapping("/{maDonHang}")
    public ResponseEntity<ApiResponse<DonHang>> getDonHangById(@PathVariable String maDonHang) {
        try {
            Optional<DonHang> donHang = donHangService.getDonHangById(maDonHang);
            if (donHang.isPresent()) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin đơn hàng thành công", donHang.get()));
            }
            return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy đơn hàng", null));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
}
