package com.exed.be.controller.admin;

import com.exed.be.dto.admin.AdminDashboardDTO;
import com.exed.be.dto.admin.DoanhThuThangDTO;
import com.exed.be.dto.admin.DonHangGanDayDTO;
import com.exed.be.dto.admin.TopChienDichDTO;
import com.exed.be.service.admin.AdminDashboardService;
import com.exed.be.service.admin.AdminExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Dashboard & Báo cáo thống kê
 *
 * GET /api/admin/dashboard                        - Chỉ số tổng quan
 * GET /api/admin/dashboard/doanhthu?soThang=12    - Doanh thu theo tháng (cho biểu đồ)
 * GET /api/admin/dashboard/topchiendich?limit=5   - Top chiến dịch doanh thu cao nhất
 * GET /api/admin/dashboard/donhanggandayl?limit=10 - Đơn hàng gần đây
 * GET /api/admin/dashboard/export/excel           - Xuất CSV (Excel mở được)
 * GET /api/admin/dashboard/export/pdf             - Trả HTML, FE in để lưu PDF
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Autowired
    private AdminExportService adminExportService;

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

    @GetMapping("/doanhthu")
    public ResponseEntity<Map<String, Object>> getDoanhThu(
            @RequestParam(required = false, defaultValue = "12") Integer soThang) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DoanhThuThangDTO> data = adminDashboardService.getDoanhThuTheoThang(soThang);
            response.put("success", true);
            response.put("data", data);
            response.put("total", data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/topchiendich")
    public ResponseEntity<Map<String, Object>> getTopChienDich(
            @RequestParam(required = false, defaultValue = "5") Integer limit) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<TopChienDichDTO> data = adminDashboardService.getTopChienDich(limit);
            response.put("success", true);
            response.put("data", data);
            response.put("total", data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/donhanggandayl")
    public ResponseEntity<Map<String, Object>> getDonHangGanDay(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DonHangGanDayDTO> data = adminDashboardService.getDonHangGanDay(limit);
            response.put("success", true);
            response.put("data", data);
            response.put("total", data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] data = adminExportService.exportDashboardCsv();
        String fileName = "dashboard-exed-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".csv";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", fileName);
        headers.setContentLength(data.length);
        return new ResponseEntity<>(data, headers, 200);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<String> exportPdf() {
        String html = adminExportService.exportDashboardHtml();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/html; charset=UTF-8"));
        return new ResponseEntity<>(new String(html.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8), headers, 200);
    }
}
