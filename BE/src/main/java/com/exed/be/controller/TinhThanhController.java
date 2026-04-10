package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.model.TinhThanh;
import com.exed.be.repository.TinhThanhRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tinhthanh")
@CrossOrigin(origins = "*")
public class TinhThanhController {
    
    @Autowired
    private TinhThanhRepository tinhThanhRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<TinhThanh>>> getAllTinhThanh() {
        try {
            List<TinhThanh> tinhThanhs = tinhThanhRepository.findAll();
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách tỉnh/thành thành công", tinhThanhs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/{maTinhThanh}")
    public ResponseEntity<ApiResponse<TinhThanh>> getTinhThanhById(@PathVariable String maTinhThanh) {
        try {
            TinhThanh tinhThanh = tinhThanhRepository.findById(maTinhThanh)
                    .orElseThrow(() -> new RuntimeException("Tỉnh/Thành không tồn tại"));
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin tỉnh/thành thành công", tinhThanh));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
}
