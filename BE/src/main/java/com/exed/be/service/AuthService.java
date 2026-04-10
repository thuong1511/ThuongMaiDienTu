package com.exed.be.service;

import com.exed.be.dto.AuthResponse;
import com.exed.be.dto.LoginRequest;
import com.exed.be.dto.RegisterRequest;
import com.exed.be.model.NguoiDung;
import com.exed.be.repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    public AuthResponse login(LoginRequest request) {
        Optional<NguoiDung> userOpt = nguoiDungRepository.findByTenDangNhap(request.getTenDangNhap());
        
        // Nếu không tìm thấy bằng username, thử tìm bằng email
        if (userOpt.isEmpty()) {
            userOpt = nguoiDungRepository.findByEmail(request.getTenDangNhap());
        }
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Tên đăng nhập hoặc email không tồn tại");
        }
        
        NguoiDung user = userOpt.get();
        
        // Kiểm tra trạng thái tài khoản
        if (!"Hoạt động".equals(user.getTrangThai())) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }
        
        // Kiểm tra mật khẩu (trong thực tế nên dùng BCrypt)
        if (!user.getMatKhau().equals(request.getMatKhau())) {
            throw new RuntimeException("Mật khẩu không đúng");
        }
        
        return new AuthResponse(
            user.getMaNguoiDung(),
            user.getTenDangNhap(),
            user.getEmail(),
            user.getSoDienThoai(),
            user.getGioiTinh(),
            user.getVaiTro(),
            user.getTrangThai()
        );
    }
    
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra tên đăng nhập đã tồn tại
        if (nguoiDungRepository.existsByTenDangNhap(request.getTenDangNhap())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        
        // Kiểm tra email đã tồn tại
        if (nguoiDungRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }
        
        // Kiểm tra số điện thoại đã tồn tại
        if (nguoiDungRepository.existsBySoDienThoai(request.getSoDienThoai())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }
        
        // Tạo mã người dùng tự động
        String maNguoiDung = generateMaNguoiDung();
        
        // Tạo người dùng mới
        NguoiDung newUser = new NguoiDung();
        newUser.setMaNguoiDung(maNguoiDung);
        newUser.setTenDangNhap(request.getTenDangNhap());
        newUser.setMatKhau(request.getMatKhau()); // Trong thực tế nên mã hóa
        newUser.setEmail(request.getEmail());
        newUser.setSoDienThoai(request.getSoDienThoai());
        newUser.setGioiTinh(request.getGioiTinh() != null ? request.getGioiTinh() : "Nữ");
        newUser.setVaiTro("Khách hàng");
        newUser.setTrangThai("Hoạt động");
        newUser.setNgayTao(LocalDateTime.now());
        
        nguoiDungRepository.save(newUser);
        
        return new AuthResponse(
            newUser.getMaNguoiDung(),
            newUser.getTenDangNhap(),
            newUser.getEmail(),
            newUser.getSoDienThoai(),
            newUser.getGioiTinh(),
            newUser.getVaiTro(),
            newUser.getTrangThai()
        );
    }
    
    private String generateMaNguoiDung() {
        // Lấy số lượng người dùng hiện tại
        long count = nguoiDungRepository.count();
        return String.format("ND%03d", count + 1);
    }
}
