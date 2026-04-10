package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.dto.SoDiaChiRequest;
import com.exed.be.model.SoDiaChi;
import com.exed.be.service.SoDiaChiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sodiachi")
@CrossOrigin(origins = "*")
public class SoDiaChiController {
    
    @Autowired
    private SoDiaChiService soDiaChiService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<SoDiaChi>>> getAllSoDiaChi() {
        try {
            List<SoDiaChi> soDiaChis = soDiaChiService.getAllSoDiaChi();
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách địa chỉ thành công", soDiaChis));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/{maSo}")
    public ResponseEntity<ApiResponse<SoDiaChi>> getSoDiaChiById(@PathVariable String maSo) {
        try {
            SoDiaChi soDiaChi = soDiaChiService.getSoDiaChiById(maSo)
                    .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin địa chỉ thành công", soDiaChi));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/nguoidung/{maNguoiDung}")
    public ResponseEntity<ApiResponse<List<SoDiaChi>>> getSoDiaChiByMaNguoiDung(@PathVariable String maNguoiDung) {
        try {
            List<SoDiaChi> soDiaChis = soDiaChiService.getSoDiaChiByMaNguoiDung(maNguoiDung);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách địa chỉ thành công", soDiaChis));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<SoDiaChi>> createSoDiaChi(@RequestBody SoDiaChiRequest request) {
        try {
            SoDiaChi soDiaChi = soDiaChiService.createSoDiaChi(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Thêm địa chỉ thành công", soDiaChi));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/{maSo}")
    public ResponseEntity<ApiResponse<SoDiaChi>> updateSoDiaChi(
            @PathVariable String maSo,
            @RequestBody SoDiaChiRequest request) {
        try {
            SoDiaChi soDiaChi = soDiaChiService.updateSoDiaChi(maSo, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật địa chỉ thành công", soDiaChi));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/{maSo}")
    public ResponseEntity<ApiResponse<Void>> deleteSoDiaChi(@PathVariable String maSo) {
        try {
            soDiaChiService.deleteSoDiaChi(maSo);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa địa chỉ thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/{maSo}/set-default")
    public ResponseEntity<ApiResponse<SoDiaChi>> setDefaultAddress(@PathVariable String maSo) {
        try {
            SoDiaChi soDiaChi = soDiaChiService.setDefaultAddress(maSo);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đặt địa chỉ mặc định thành công", soDiaChi));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
}
