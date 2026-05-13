package com.exed.be.controller.admin;

import com.exed.be.dto.admin.AdminDashboardDTO;
import com.exed.be.service.admin.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin Dashboard & Báo cáo thống kê
 * GET /api/admin/dashboard
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> response = new HashMap<>();
        try {
            AdminDashboardDTO dto = adminDashboardService.getDashboard();
            response.put("success", true);
            response.put("data", dto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy dữ liệu dashboard: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
