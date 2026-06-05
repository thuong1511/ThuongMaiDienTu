package com.exed.be.controller;

import com.exed.be.model.Banner;
import com.exed.be.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banner")
@CrossOrigin(origins = "*")
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getActiveBanners() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Banner> banners = bannerRepository.findByDangHienThiTrueOrderByThuTuAsc();
            response.put("success", true);
            response.put("data", banners);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách banner: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
