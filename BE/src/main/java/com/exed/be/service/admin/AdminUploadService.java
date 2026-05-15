package com.exed.be.service.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Lưu file upload vào thư mục cục bộ.
 * File được serve qua "/uploads/**" (xem WebConfig).
 *
 * Đường dẫn lưu trong DB: "uploads/<folder>/<yyyy>/<MM>/<uuid>.<ext>"
 */
@Service
public class AdminUploadService {

    private static final Set<String> ALLOWED_EXTS = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_SIZE = 10L * 1024 * 1024; // 10MB

    @Value("${app.upload.dir:uploads}")
    private String uploadRoot;

    /**
     * Lưu 1 file ảnh vào thư mục con `folder` (ví dụ: "chiendich", "sanpham", "nghesi", "banner").
     * @return đường dẫn tương đối lưu vào DB (vd: "uploads/chiendich/2026/05/abc.jpg")
     */
    public String saveImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File trống");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File vượt quá 10MB");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) ext = original.substring(dot + 1).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTS.contains(ext)) {
            throw new IllegalArgumentException("Định dạng không hỗ trợ: " + ext);
        }

        String safeFolder = (folder == null || folder.isBlank()) ? "misc" : folder.replaceAll("[^a-zA-Z0-9_-]", "");
        String yearMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));

        Path dir = Paths.get(uploadRoot, safeFolder, yearMonth);
        Files.createDirectories(dir);

        String fileName = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        Path target = dir.resolve(fileName);

        try (var in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        // Trả về đường dẫn tương đối, dùng dấu "/" cho cả Windows lẫn Linux
        return (uploadRoot + "/" + safeFolder + "/" + yearMonth + "/" + fileName).replace("\\", "/");
    }

    /**
     * Xóa file vật lý theo đường dẫn tương đối (đã lưu trong DB).
     * Trả về true nếu xóa được, false nếu file không tồn tại.
     */
    public boolean deleteFile(String duongDan) {
        if (duongDan == null || duongDan.isBlank()) return false;
        // Chỉ xóa file thuộc thư mục upload, tránh xóa nhầm /images/
        if (!duongDan.startsWith(uploadRoot + "/") && !duongDan.startsWith(uploadRoot + "\\")) {
            return false;
        }
        try {
            Path p = Paths.get(duongDan);
            return Files.deleteIfExists(p);
        } catch (IOException e) {
            return false;
        }
    }
}
