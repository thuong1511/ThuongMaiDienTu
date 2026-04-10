package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.dto.DangKyChienDichRequest;
import com.exed.be.model.DangKyChienDich;
import com.exed.be.service.DangKyChienDichService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dangkychiendich")
@CrossOrigin(origins = "*")
public class DangKyChienDichController {
    
    @Autowired
    private DangKyChienDichService dangKyChienDichService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<DangKyChienDich>>> getAllDangKy() {
        List<DangKyChienDich> list = dangKyChienDichService.getAllDangKy();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đăng ký thành công", list));
    }
    
    @GetMapping("/{maDangKy}")
    public ResponseEntity<ApiResponse<DangKyChienDich>> getDangKyById(@PathVariable Integer maDangKy) {
        Optional<DangKyChienDich> dangKy = dangKyChienDichService.getDangKyById(maDangKy);
        if (dangKy.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin đăng ký thành công", dangKy.get()));
        }
        return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy đăng ký", null));
    }
    
    @GetMapping("/nguoidung/{maNguoiDung}")
    public ResponseEntity<ApiResponse<List<DangKyChienDich>>> getDangKyByNguoiDung(@PathVariable String maNguoiDung) {
        List<DangKyChienDich> list = dangKyChienDichService.getDangKyByNguoiDung(maNguoiDung);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đăng ký của người dùng thành công", list));
    }
    
    @GetMapping("/chiendich/{maChienDich}")
    public ResponseEntity<ApiResponse<List<DangKyChienDich>>> getDangKyByChienDich(@PathVariable String maChienDich) {
        List<DangKyChienDich> list = dangKyChienDichService.getDangKyByChienDich(maChienDich);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đăng ký của chiến dịch thành công", list));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<DangKyChienDich>> createDangKy(@RequestBody DangKyChienDichRequest request) {
        try {
            DangKyChienDich dangKy = dangKyChienDichService.createDangKy(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đăng ký chiến dịch thành công", dangKy));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/{maDangKy}/huy")
    public ResponseEntity<ApiResponse<DangKyChienDich>> huyDangKy(@PathVariable Integer maDangKy) {
        try {
            DangKyChienDich dangKy = dangKyChienDichService.huyDangKy(maDangKy);
            if (dangKy != null) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Hủy đăng ký thành công", dangKy));
            }
            return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy đăng ký", null));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi: " + e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/{maDangKy}")
    public ResponseEntity<ApiResponse<Void>> deleteDangKy(@PathVariable Integer maDangKy) {
        boolean deleted = dangKyChienDichService.deleteDangKy(maDangKy);
        if (deleted) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa đăng ký thành công", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy đăng ký", null));
    }
}
