package com.exed.be.controller;

import com.exed.be.model.NgheSi;
import com.exed.be.service.NgheSiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/nghesi")
@CrossOrigin(origins = "*")
public class NgheSiController {
    
    @Autowired
    private NgheSiService ngheSiService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllNgheSi() {
        try {
            List<NgheSi> ngheSiList = ngheSiService.getAllNgheSi();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", ngheSiList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách nghệ sĩ");
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getNgheSiById(@PathVariable String id) {
        try {
            Optional<NgheSi> ngheSi = ngheSiService.getNgheSiById(id);
            
            if (ngheSi.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Không tìm thấy nghệ sĩ");
                
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", ngheSi.get());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy thông tin nghệ sĩ");
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
