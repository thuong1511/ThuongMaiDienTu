package com.exed.be.controller;

import com.exed.be.model.NguoiDung;
import com.exed.be.repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nguoidung")
@CrossOrigin(origins = "*")
public class NguoiDungController {
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllNguoiDung() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<NguoiDung> nguoiDungs = nguoiDungRepository.findAll();
            
            // Remove password from response
            nguoiDungs.forEach(nd -> nd.setMatKhau(null));
            
            response.put("success", true);
            response.put("message", "Lấy danh sách người dùng thành công");
            response.put("data", nguoiDungs);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getAllCustomers() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<NguoiDung> customers = nguoiDungRepository.findAll()
                .stream()
                .filter(nd -> "Khách hàng".equals(nd.getVaiTro()))
                .collect(Collectors.toList());
            
            // Remove password from response
            customers.forEach(nd -> nd.setMatKhau(null));
            
            response.put("success", true);
            response.put("message", "Lấy danh sách khách hàng thành công");
            response.put("data", customers);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getNguoiDungById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            // Remove password from response
            nguoiDung.setMatKhau(null);
            
            response.put("success", true);
            response.put("message", "Lấy thông tin người dùng thành công");
            response.put("data", nguoiDung);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
