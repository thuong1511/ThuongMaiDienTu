package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.model.PhuongXa;
import com.exed.be.repository.PhuongXaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phuongxa")
@CrossOrigin(origins = "*")
public class PhuongXaController {
    
    @Autowired
    private PhuongXaRepository phuongXaRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<PhuongXa>>> getAllPhuongXa() {
        try {
            List<PhuongXa> phuongXas = phuongXaRepository.findAll();
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phường/xã thành công", phuongXas));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/{maPhuongXa}")
    public ResponseEntity<ApiResponse<PhuongXa>> getPhuongXaById(@PathVariable String maPhuongXa) {
        try {
            PhuongXa phuongXa = phuongXaRepository.findById(maPhuongXa)
                    .orElseThrow(() -> new RuntimeException("Phường/Xã không tồn tại"));
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin phường/xã thành công", phuongXa));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/tinhthanh/{maTinhThanh}")
    public ResponseEntity<ApiResponse<List<PhuongXa>>> getPhuongXaByTinhThanh(@PathVariable String maTinhThanh) {
        try {
            List<PhuongXa> phuongXas = phuongXaRepository.findByMaTinhThanh(maTinhThanh);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phường/xã thành công", phuongXas));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
}
