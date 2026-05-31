package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.model.DonHang;
import com.exed.be.repository.DonHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/donhang")
@CrossOrigin(origins = "*")
public class DonHangController {
    
    @Autowired
    private DonHangRepository donHangRepository;
    
    // Lấy tất cả đơn hàng của người dùng
    @GetMapping("/nguoidung/{maNguoiDung}")
    public ResponseEntity<ApiResponse<List<DonHang>>> getDonHangByNguoiDung(@PathVariable String maNguoiDung) {
        try {
            List<DonHang> donHangs = donHangRepository.findByNguoiDung(maNguoiDung);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn hàng thành công", donHangs));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    // Lấy chi tiết đơn hàng theo mã
    @GetMapping("/{maDonHang}")
    public ResponseEntity<ApiResponse<DonHang>> getDonHangById(@PathVariable String maDonHang) {
        try {
            Optional<DonHang> donHang = donHangRepository.findById(maDonHang);
            if (donHang.isPresent()) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết đơn hàng thành công", donHang.get()));
            } else {
                return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy đơn hàng", null));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
}
