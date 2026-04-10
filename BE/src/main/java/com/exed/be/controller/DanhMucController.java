package com.exed.be.controller;

import com.exed.be.model.DanhMuc;
import com.exed.be.repository.DanhMucRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/danhmuc")
@CrossOrigin(origins = "*")
public class DanhMucController {

    @Autowired
    private DanhMucRepository danhMucRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllDanhMuc() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DanhMuc> danhMucs = danhMucRepository.findAll();
            response.put("success", true);
            response.put("data", danhMucs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách danh mục: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
