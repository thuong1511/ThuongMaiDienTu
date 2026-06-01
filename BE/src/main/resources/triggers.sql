-- 1. Trigger for Successful Registration (Insert)
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_DangKyChienDich_Insert')
    DROP TRIGGER trg_DangKyChienDich_Insert;
GO

CREATE TRIGGER trg_DangKyChienDich_Insert
ON DangKyChienDich
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ThongBao (maNguoiDung, tieuDe, noiDung, loaiThongBao, daDoc, ngayTao)
    SELECT 
        i.maNguoiDung,
        N'Đăng ký chiến dịch thành công',
        CONCAT(N'Chúc mừng! Bạn đã đăng ký thành công chiến dịch "', c.tenChienDich, N'" với số lượng ', i.tongSoLuong, N' sản phẩm. Cảm ơn bạn đã đồng hành cùng chúng tôi!'),
        N'Giao Dịch',
        0,
        GETDATE()
    FROM inserted i
    JOIN ChienDich c ON i.maChienDich = c.maChienDich;
END;
GO

-- 2. Trigger for Successful Cancellation (Update daHuy)
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_DangKyChienDich_Cancel')
    DROP TRIGGER trg_DangKyChienDich_Cancel;
GO

CREATE TRIGGER trg_DangKyChienDich_Cancel
ON DangKyChienDich
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(daHuy)
    BEGIN
        INSERT INTO ThongBao (maNguoiDung, tieuDe, noiDung, loaiThongBao, daDoc, ngayTao)
        SELECT 
            i.maNguoiDung,
            N'Hủy đơn đăng ký thành công',
            CONCAT(N'Bạn đã hủy đăng ký thành công chiến dịch "', c.tenChienDich, N'". Cảm ơn bạn và hy vọng sẽ gặp lại bạn ở các chiến dịch tiếp theo!'),
            N'Hệ Thống',
            0,
            GETDATE()
        FROM inserted i
        JOIN deleted d ON i.maDangKy = d.maDangKy
        JOIN ChienDich c ON i.maChienDich = c.maChienDich
        WHERE i.daHuy = 1 AND d.daHuy = 0;
    END
END;
GO

-- 3. Trigger for Successful Refund (Update daHoanTien)
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_DangKyChienDich_Refund')
    DROP TRIGGER trg_DangKyChienDich_Refund;
GO

CREATE TRIGGER trg_DangKyChienDich_Refund
ON DangKyChienDich
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(daHoanTien)
    BEGIN
        INSERT INTO ThongBao (maNguoiDung, tieuDe, noiDung, loaiThongBao, daDoc, ngayTao)
        SELECT 
            i.maNguoiDung,
            N'Hoàn tiền thành công',
            CONCAT(N'Hệ thống đã hoàn trả thành công số tiền ', FORMAT(i.soTienHoanLai, 'N0'), N' đ vào ví EXED của bạn cho chiến dịch "', c.tenChienDich, N'". Vui lòng kiểm tra ví để xác nhận số dư!'),
            N'Tài Chính',
            0,
            GETDATE()
        FROM inserted i
        JOIN deleted d ON i.maDangKy = d.maDangKy
        JOIN ChienDich c ON i.maChienDich = c.maChienDich
        WHERE i.daHoanTien = 1 AND d.daHoanTien = 0;
    END
END;
GO
-- 4. Trigger for Order Delivery Status Updates (Insert, Update trangThaiGiaoHang)
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_DonHang_UpdateStatus')
    DROP TRIGGER trg_DonHang_UpdateStatus;
GO

CREATE TRIGGER trg_DonHang_UpdateStatus
ON DonHang
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Kiểm tra nếu là INSERT (không có bản ghi trong deleted) hoặc UPDATE mà có thay đổi trangThaiGiaoHang
    IF NOT EXISTS (SELECT 1 FROM deleted) OR UPDATE(trangThaiGiaoHang)
    BEGIN
        INSERT INTO ThongBao (maNguoiDung, tieuDe, noiDung, loaiThongBao, daDoc, ngayTao)
        SELECT 
            dk.maNguoiDung,
            CASE 
                WHEN i.trangThaiGiaoHang = N'Đang chuẩn bị' THEN N'Đơn hàng đang chuẩn bị'
                WHEN i.trangThaiGiaoHang = N'Đang giao' THEN N'Đơn hàng đang được giao'
                WHEN i.trangThaiGiaoHang = N'Đã giao' THEN N'Đơn hàng đã giao thành công'
                ELSE N'Cập nhật trạng thái đơn hàng'
            END,
            CASE 
                WHEN i.trangThaiGiaoHang = N'Đang chuẩn bị' THEN 
                    CONCAT(N'Đơn hàng ', i.maDonHang, N' của chiến dịch "', cd.tenChienDich, N'" đang được chuẩn bị. Chúng tôi sẽ thông báo cho bạn khi bắt đầu giao!')
                WHEN i.trangThaiGiaoHang = N'Đang giao' THEN 
                    CONCAT(N'Đơn hàng ', i.maDonHang, N' của chiến dịch "', cd.tenChienDich, N'" đang trên đường giao tới bạn. Vui lòng chú ý điện thoại để nhận hàng!')
                WHEN i.trangThaiGiaoHang = N'Đã giao' THEN 
                    CONCAT(N'Đơn hàng ', i.maDonHang, N' đã được giao thành công đến bạn. Hãy click vào đây để đánh giá sản phẩm và chia sẻ cảm nhận nhé! Link: [Đánh giá ngay](/GiaodienWeb/pages/review.html?orderId=', i.maDonHang, N')')
                ELSE 
                    CONCAT(N'Đơn hàng ', i.maDonHang, N' đã thay đổi trạng thái giao hàng thành: ', i.trangThaiGiaoHang)
            END,
            N'Hệ Thống',
            0,
            GETDATE()
        FROM inserted i
        INNER JOIN DangKyChienDich dk ON i.maDangKy = dk.maDangKy
        INNER JOIN ChienDich cd ON dk.maChienDich = cd.maChienDich
        -- Đối với UPDATE, chỉ chèn khi trạng thái thay đổi. Đối với INSERT, chèn vô điều kiện.
        WHERE NOT EXISTS (
            SELECT 1 FROM deleted d 
            WHERE d.maDonHang = i.maDonHang AND d.trangThaiGiaoHang = i.trangThaiGiaoHang
        );
    END
END;
GO
