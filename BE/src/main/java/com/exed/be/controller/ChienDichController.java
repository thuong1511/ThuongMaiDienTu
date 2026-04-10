package com.exed.be.controller;

import com.exed.be.model.ChienDich;
import com.exed.be.service.ChienDichService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chiendich")
@CrossOrigin(origins = "*")
public class ChienDichController {
    
    @Autowired
    private ChienDichService chienDichService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllChienDich() {
        try {
            List<ChienDich> chienDichList = chienDichService.getAllChienDich();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", chienDichList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách chiến dịch");
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveChienDich() {
        try {
            List<ChienDich> activeChienDich = chienDichService.getActiveChienDich();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", activeChienDich);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy chiến dịch đang diễn ra");
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getChienDichById(@PathVariable String id) {
        try {
            Optional<ChienDich> chienDich = chienDichService.getChienDichById(id);
            
            if (chienDich.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Không tìm thấy chiến dịch");
                
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", chienDich.get());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy thông tin chiến dịch");
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
