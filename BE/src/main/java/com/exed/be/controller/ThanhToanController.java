package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.dto.ThanhToanRequest;
import com.exed.be.model.ThanhToan;
import com.exed.be.service.ThanhToanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/thanhtoan")
@CrossOrigin(origins = "*")
public class ThanhToanController {
    
    @Autowired
    private ThanhToanService thanhToanService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ThanhToan>>> getAllThanhToan() {
        List<ThanhToan> list = thanhToanService.getAllThanhToan();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thanh toán thành công", list));
    }
    
    @GetMapping("/{maThanhToan}")
    public ResponseEntity<ApiResponse<ThanhToan>> getThanhToanById(@PathVariable Integer maThanhToan) {
        Optional<ThanhToan> thanhToan = thanhToanService.getThanhToanById(maThanhToan);
        if (thanhToan.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin thanh toán thành công", thanhToan.get()));
        }
        return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thanh toán", null));
    }
    
    @GetMapping("/phuongthuc/{phuongThuc}")
    public ResponseEntity<ApiResponse<List<ThanhToan>>> getThanhToanByPhuongThuc(@PathVariable String phuongThuc) {
        List<ThanhToan> list = thanhToanService.getThanhToanByPhuongThuc(phuongThuc);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thanh toán theo phương thức thành công", list));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<ThanhToan>> createThanhToan(@RequestBody ThanhToanRequest request) {
        try {
            ThanhToan thanhToan;
            
            // Check if payment method is "Ví EXED"
            if ("Ví EXED".equals(request.getPhuongThuc())) {
                if (request.getMaNguoiDung() == null || request.getMaNguoiDung().isEmpty()) {
                    return ResponseEntity.ok(new ApiResponse<>(false, "Thiếu thông tin người dùng", null));
                }
                // Use wallet payment method
                thanhToan = thanhToanService.createThanhToanWithWallet(request, request.getMaNguoiDung());
            } else {
                // Use regular payment method
                thanhToan = thanhToanService.createThanhToan(request);
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo thanh toán thành công", thanhToan));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/{maThanhToan}")
    public ResponseEntity<ApiResponse<ThanhToan>> updateThanhToan(
            @PathVariable Integer maThanhToan,
            @RequestBody ThanhToanRequest request) {
        try {
            ThanhToan thanhToan = thanhToanService.updateThanhToan(maThanhToan, request);
            if (thanhToan != null) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thanh toán thành công", thanhToan));
            }
            return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thanh toán", null));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/{maThanhToan}")
    public ResponseEntity<ApiResponse<Void>> deleteThanhToan(@PathVariable Integer maThanhToan) {
        boolean deleted = thanhToanService.deleteThanhToan(maThanhToan);
        if (deleted) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa thanh toán thành công", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thanh toán", null));
    }
}
