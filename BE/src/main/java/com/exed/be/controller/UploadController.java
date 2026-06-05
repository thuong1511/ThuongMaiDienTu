package com.exed.be.controller;

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
 * Public Upload Controller for user uploads (e.g., review images)
 * 
 * POST /api/upload/danhgia      - Upload single review image
 * POST /api/upload/danhgia/multi - Upload multiple review images
 */
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    @Autowired
    private AdminUploadService adminUploadService;

    /**
     * Upload single review image
     * @param file The image file to upload
     * @return Response with uploaded file path
     */
    @PostMapping("/danhgia")
    public ResponseEntity<Map<String, Object>> uploadReviewImage(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Use "danhgia" folder for review images
            String duongDan = adminUploadService.saveImage(file, "danhgia");
            Map<String, Object> data = new HashMap<>();
            data.put("duongDan", duongDan);
            data.put("url", "/" + duongDan);
            response.put("success", true);
            response.put("message", "Tải lên ảnh đánh giá thành công");
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

    /**
     * Upload multiple review images
     * @param files Array of image files to upload
     * @return Response with array of uploaded file paths
     */
    @PostMapping("/danhgia/multi")
    public ResponseEntity<Map<String, Object>> uploadReviewImagesMulti(
            @RequestParam("files") MultipartFile[] files) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> results = new ArrayList<>();
        
        try {
            // Validate number of files (max 5 for reviews)
            if (files.length > 5) {
                response.put("success", false);
                response.put("message", "Chỉ được tải lên tối đa 5 ảnh");
                return ResponseEntity.status(400).body(response);
            }

            for (MultipartFile file : files) {
                String duongDan = adminUploadService.saveImage(file, "danhgia");
                Map<String, Object> item = new HashMap<>();
                item.put("duongDan", duongDan);
                item.put("url", "/" + duongDan);
                results.add(item);
            }
            
            response.put("success", true);
            response.put("message", "Tải lên " + results.size() + " ảnh thành công");
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
