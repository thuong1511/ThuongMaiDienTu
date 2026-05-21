-- Script tạo dữ liệu mẫu cho DonHang (Đơn hàng giao)
-- Chạy script này sau khi đã có DangKyChienDich trong database

USE dbEXED;
GO

-- Kiểm tra xem có đăng ký nào chưa
SELECT TOP 5 
    dk.maDangKy,
    dk.maNguoiDung,
    cd.tenChienDich,
    dk.tongSoLuong,
    tt.soTienThanhToan,
    dk.daHuy
FROM DangKyChienDich dk
INNER JOIN ChienDich cd ON dk.maChienDich = cd.maChienDich
LEFT JOIN ThanhToan tt ON dk.maThanhToan = tt.maThanhToan
WHERE dk.daHuy = 0
ORDER BY dk.ngayDangKy DESC;

-- Tạo đơn hàng mẫu từ các đăng ký thành công
-- Lưu ý: Thay maDangKy bằng ID thực tế từ query trên

-- Ví dụ: Tạo đơn hàng cho đăng ký đầu tiên
DECLARE @maDangKy INT = (SELECT TOP 1 maDangKy FROM DangKyChienDich WHERE daHuy = 0 ORDER BY ngayDangKy DESC);
DECLARE @soTienThanhToan DECIMAL(18,2) = (SELECT tt.soTienThanhToan FROM DangKyChienDich dk INNER JOIN ThanhToan tt ON dk.maThanhToan = tt.maThanhToan WHERE dk.maDangKy = @maDangKy);

IF @maDangKy IS NOT NULL AND NOT EXISTS (SELECT 1 FROM DonHang WHERE maDangKy = @maDangKy)
BEGIN
    -- Tính giá chốt cuối cùng (giả sử giảm 10% từ giá thanh toán ban đầu)
    DECLARE @giaChotCuoiCung DECIMAL(18,2) = @soTienThanhToan * 0.9;
    DECLARE @soTienHoanLai DECIMAL(18,2) = @soTienThanhToan - @giaChotCuoiCung;
    
    INSERT INTO DonHang (maDonHang, maDangKy, giaChotCuoiCung, soTienHoanLai, trangThaiGiaoHang, ngayTaoDon)
    VALUES (
        'DH001',
        @maDangKy,
        @giaChotCuoiCung,
        @soTienHoanLai,
        N'Đang chuẩn bị',
        GETDATE()
    );
    
    PRINT N'✓ Đã tạo đơn hàng DH001';
END
ELSE
BEGIN
    PRINT N'⚠ Không có đăng ký hợp lệ hoặc đơn hàng đã tồn tại';
END

-- Kiểm tra kết quả
SELECT 
    dh.maDonHang,
    dh.maDangKy,
    dk.maNguoiDung,
    cd.tenChienDich,
    dh.giaChotCuoiCung,
    dh.soTienHoanLai,
    dh.trangThaiGiaoHang,
    dh.ngayTaoDon
FROM DonHang dh
INNER JOIN DangKyChienDich dk ON dh.maDangKy = dk.maDangKy
INNER JOIN ChienDich cd ON dk.maChienDich = cd.maChienDich
ORDER BY dh.ngayTaoDon DESC;

GO
