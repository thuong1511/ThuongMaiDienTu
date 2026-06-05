package com.exed.be.controller;

import com.exed.be.dto.ApiResponse;
import com.exed.be.dto.DanhGiaRequest;
import com.exed.be.model.DanhGia;
import com.exed.be.service.DanhGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danhgia")
@CrossOrigin(origins = "*")
public class DanhGiaController {

    @Autowired
    private DanhGiaService danhGiaService;

    /**
     * Create a new review
     * POST /api/danhgia
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DanhGia>> createDanhGia(@RequestBody DanhGiaRequest request) {
        try {
            // Validate input
            if (request.getMaDonHang() == null || request.getMaDonHang().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Mã đơn hàng không được để trống", null));
            }

            if (request.getDiemDanhGia() == null || request.getDiemDanhGia() < 1 || request.getDiemDanhGia() > 5) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Điểm đánh giá phải từ 1 đến 5", null));
            }

            if (request.getBinhLuan() == null || request.getBinhLuan().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Nội dung đánh giá không được để trống", null));
            }

            DanhGia danhGia = danhGiaService.createDanhGia(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đánh giá thành công", danhGia));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Có lỗi xảy ra: " + e.getMessage(), null));
        }
    }

    /**
     * Get all reviews
     * GET /api/danhgia
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> getAllDanhGia() {
        try {
            List<java.util.Map<String, Object>> danhGias = danhGiaService.getAllDanhGiaDTO();
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đánh giá thành công", danhGias));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Có lỗi xảy ra: " + e.getMessage(), null));
        }
    }

    /**
     * Get review by order ID
     * GET /api/danhgia/donhang/{maDonHang}
     */
    @GetMapping("/donhang/{maDonHang}")
    public ResponseEntity<ApiResponse<DanhGia>> getDanhGiaByMaDonHang(@PathVariable String maDonHang) {
        try {
            DanhGia danhGia = danhGiaService.getDanhGiaByMaDonHang(maDonHang);
            if (danhGia == null) {
                return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy đánh giá", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy đánh giá thành công", danhGia));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Có lỗi xảy ra: " + e.getMessage(), null));
        }
    }

    /**
     * Check if order has been reviewed
     * GET /api/danhgia/check/{maDonHang}
     */
    @GetMapping("/check/{maDonHang}")
    public ResponseEntity<ApiResponse<Boolean>> checkReviewed(@PathVariable String maDonHang) {
        try {
            boolean hasReviewed = danhGiaService.hasReviewed(maDonHang);
            return ResponseEntity.ok(new ApiResponse<>(true, "Kiểm tra thành công", hasReviewed));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Có lỗi xảy ra: " + e.getMessage(), null));
        }
    }

    /**
     * Get reviews by campaign ID
     * GET /api/danhgia/chiendich/{maChienDich}
     */
    @GetMapping("/chiendich/{maChienDich}")
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> getDanhGiaByMaChienDich(@PathVariable String maChienDich) {
        try {
            List<java.util.Map<String, Object>> dto = danhGiaService.getDanhGiaByMaChienDichDTO(maChienDich);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đánh giá của chiến dịch thành công", dto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Có lỗi xảy ra: " + e.getMessage(), null));
        }
    }
}
