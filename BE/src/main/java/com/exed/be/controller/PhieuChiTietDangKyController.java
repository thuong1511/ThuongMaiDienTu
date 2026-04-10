package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.dto.PhieuChiTietDangKyRequest;
import com.exed.be.model.PhieuChiTietDangKy;
import com.exed.be.service.PhieuChiTietDangKyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/phieuchitietdangky")
@CrossOrigin(origins = "*")
public class PhieuChiTietDangKyController {
    
    @Autowired
    private PhieuChiTietDangKyService phieuChiTietDangKyService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<PhieuChiTietDangKy>>> getAllChiTiet() {
        List<PhieuChiTietDangKy> list = phieuChiTietDangKyService.getAllChiTiet();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách chi tiết đăng ký thành công", list));
    }
    
    @GetMapping("/{maChiTietDangKy}")
    public ResponseEntity<ApiResponse<PhieuChiTietDangKy>> getChiTietById(@PathVariable Integer maChiTietDangKy) {
        Optional<PhieuChiTietDangKy> chiTiet = phieuChiTietDangKyService.getChiTietById(maChiTietDangKy);
        if (chiTiet.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin chi tiết đăng ký thành công", chiTiet.get()));
        }
        return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy chi tiết đăng ký", null));
    }
    
    @GetMapping("/dangky/{maDangKy}")
    public ResponseEntity<ApiResponse<List<PhieuChiTietDangKy>>> getChiTietByDangKy(@PathVariable Integer maDangKy) {
        List<PhieuChiTietDangKy> list = phieuChiTietDangKyService.getChiTietByDangKy(maDangKy);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách chi tiết của đăng ký thành công", list));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<PhieuChiTietDangKy>> createChiTiet(@RequestBody PhieuChiTietDangKyRequest request) {
        try {
            PhieuChiTietDangKy chiTiet = phieuChiTietDangKyService.createChiTiet(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo chi tiết đăng ký thành công", chiTiet));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/{maChiTietDangKy}")
    public ResponseEntity<ApiResponse<PhieuChiTietDangKy>> updateChiTiet(
            @PathVariable Integer maChiTietDangKy,
            @RequestBody PhieuChiTietDangKyRequest request) {
        try {
            PhieuChiTietDangKy chiTiet = phieuChiTietDangKyService.updateChiTiet(maChiTietDangKy, request);
            if (chiTiet != null) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật chi tiết đăng ký thành công", chiTiet));
            }
            return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy chi tiết đăng ký", null));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/{maChiTietDangKy}")
    public ResponseEntity<ApiResponse<Void>> deleteChiTiet(@PathVariable Integer maChiTietDangKy) {
        boolean deleted = phieuChiTietDangKyService.deleteChiTiet(maChiTietDangKy);
        if (deleted) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa chi tiết đăng ký thành công", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy chi tiết đăng ký", null));
    }
}
