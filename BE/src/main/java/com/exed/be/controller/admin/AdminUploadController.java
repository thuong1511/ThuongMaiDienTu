package com.exed.be.controller.admin;

import com.exed.be.service.admin.AdminUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Upload file dùng chung
 *
 * POST /api/admin/upload?folder=chiendich     - upload 1 file
 * POST /api/admin/upload/multi?folder=sanpham - upload nhiều file
 *
 * Request: multipart/form-data, key = "file" (hoặc "files" cho multi)
 * Response: { success, data: { duongDan, url } }
 */
@RestController
@RequestMapping("/api/admin/upload")
@CrossOrigin(origins = "*")
public class AdminUploadController {

    @Autowired
    private AdminUploadService adminUploadService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "misc") String folder) {
        Map<String, Object> response = new HashMap<>();
        try {
            String duongDan = adminUploadService.saveImage(file, folder);
            Map<String, Object> data = new HashMap<>();
            data.put("duongDan", duongDan);
            data.put("url", "/" + duongDan);
            response.put("success", true);
            response.put("message", "Tải lên thành công");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi tải lên: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/multi")
    public ResponseEntity<Map<String, Object>> uploadMulti(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folder", required = false, defaultValue = "misc") String folder) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> results = new ArrayList<>();
        try {
            for (MultipartFile f : files) {
                String duongDan = adminUploadService.saveImage(f, folder);
                Map<String, Object> item = new HashMap<>();
                item.put("duongDan", duongDan);
                item.put("url", "/" + duongDan);
                results.add(item);
            }
            response.put("success", true);
            response.put("message", "Tải lên thành công");
            response.put("data", results);
            response.put("total", results.size());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", results);
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi tải lên: " + e.getMessage());
            response.put("data", results);
            return ResponseEntity.status(500).body(response);
        }
    }
}
