-- ============================================================
-- DATABASE: dbEXED
-- Cập nhật: Chuẩn hoá PK về CHAR(5), trigger tự sinh mã,
--           và dữ liệu mẫu
-- ============================================================

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'dbEXED')
BEGIN
    USE master
    ALTER DATABASE dbEXED SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE dbEXED
END;
GO

CREATE DATABASE [dbEXED]
GO
USE [dbEXED]
GO

-- ============================================================
-- PHẦN 1: TẠO CÁC BẢNG
-- ============================================================

-- 1. TinhThanh
CREATE TABLE TinhThanh (
    maTinhThanh CHAR(5) PRIMARY KEY,
    tenTinhThanh NVARCHAR(100) NOT NULL
);

-- 2. PhuongXa
CREATE TABLE PhuongXa (
    maPhuongXa CHAR(5) PRIMARY KEY,
    tenPhuongXa NVARCHAR(100) NOT NULL,
    maTinhThanh CHAR(5) FOREIGN KEY REFERENCES TinhThanh(maTinhThanh)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- 3. NguoiDung
CREATE TABLE NguoiDung (
    maNguoiDung CHAR(5) PRIMARY KEY,
    tenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    matKhau     VARCHAR(255) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    soDienThoai VARCHAR(15)  UNIQUE NOT NULL,
    gioiTinh    NVARCHAR(10) CHECK (gioiTinh IN (N'Nam', N'Nữ', N'Khác')) DEFAULT N'Nữ',
    vaiTro      NVARCHAR(20) NOT NULL DEFAULT N'Khách hàng'
                    CHECK (vaiTro IN (N'Khách hàng', N'Admin')),
    trangThai   NVARCHAR(20) NOT NULL DEFAULT N'Hoạt động'
                    CHECK (trangThai IN (N'Hoạt động', N'Đã khoá', N'Ngừng')),
    ngayTao     DATETIME DEFAULT GETDATE()
);

-- 4. SoDiaChi
CREATE TABLE SoDiaChi (
    maSo           CHAR(5) PRIMARY KEY,
    maNguoiDung    CHAR(5),
    maPhuongXa     CHAR(5),
    hoTen          NVARCHAR(100) NOT NULL,
    soDienThoai    VARCHAR(15)   NOT NULL,
    diaChiChiTiet  NVARCHAR(100) NOT NULL,
	macDinh		   BIT DEFAULT 0,
    FOREIGN KEY (maNguoiDung) REFERENCES NguoiDung(maNguoiDung),
    FOREIGN KEY (maPhuongXa)  REFERENCES PhuongXa(maPhuongXa)
);

-- 5. OTP
CREATE TABLE OTP (
    maOTP        INT PRIMARY KEY IDENTITY(1,1),
    maNguoiDung  CHAR(5),
    maXacThuc    VARCHAR(6)   NOT NULL,
    loaiOTP      NVARCHAR(30) NOT NULL,
    thoiGianTao  DATETIME DEFAULT GETDATE(),
    thoiGianHetHan DATETIME NOT NULL,
    daSuDung     BIT DEFAULT 0,
    FOREIGN KEY (maNguoiDung) REFERENCES NguoiDung(maNguoiDung)
);

-- 6. NgheSi
CREATE TABLE NgheSi (
    maNgheSi   CHAR(5) PRIMARY KEY,
    tenNgheSi  NVARCHAR(200),
    moTa       NVARCHAR(MAX),
    ngheNghiep NVARCHAR(50),
    linkMXH    VARCHAR(255)
);

-- 7. HinhAnhNgheSi
CREATE TABLE HinhAnhNgheSi (
    maHinhAnh INT PRIMARY KEY IDENTITY(1,1),
    maNgheSi  CHAR(5) NOT NULL,
    duongDan  VARCHAR(255) NOT NULL,
    thuTu     INT DEFAULT 1,
    FOREIGN KEY (maNgheSi) REFERENCES NgheSi(maNgheSi) ON DELETE CASCADE
);

-- 8. DanhMuc
CREATE TABLE DanhMuc (
    maDanhMuc    CHAR(5) PRIMARY KEY,
    tenDanhMuc   NVARCHAR(50),
    loaiKichThuoc VARCHAR(20) CHECK (loaiKichThuoc IN ('AO', 'GIAY'))
);

-- 9. MauSac
CREATE TABLE MauSac (
    maMau   INT PRIMARY KEY IDENTITY(1,1),
    tenMau  NVARCHAR(50) NOT NULL
);

-- 10. KichThuoc
CREATE TABLE KichThuoc (
    maSize        INT PRIMARY KEY IDENTITY(1,1),
    tenSize       VARCHAR(20) NOT NULL,
    loaiKichThuoc VARCHAR(20) CHECK (loaiKichThuoc IN ('AO', 'GIAY'))
);

-- 11. SanPham
CREATE TABLE SanPham (
    maSanPham CHAR(5) PRIMARY KEY,
    maDanhMuc CHAR(5) NOT NULL,
    tenSanPham NVARCHAR(200),
    moTa       NVARCHAR(MAX),
    FOREIGN KEY (maDanhMuc) REFERENCES DanhMuc(maDanhMuc)
);

-- 12. HinhAnhSanPham
CREATE TABLE HinhAnhSanPham (
    maHinhAnh INT PRIMARY KEY IDENTITY(1,1),
    maSanPham CHAR(5) NOT NULL,
    duongDan  VARCHAR(255) NOT NULL,
    thuTu     INT DEFAULT 1,
    FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham) ON DELETE CASCADE
);

-- 13. SanPham_MauSac
CREATE TABLE SanPham_MauSac (
    maSanPham     CHAR(5) NOT NULL,
    maMau         INT NOT NULL,
    soLuongToiDa  INT NOT NULL,
    soLuongDaDat  INT DEFAULT 0,
    PRIMARY KEY (maSanPham, maMau),
    FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham) ON DELETE CASCADE,
    FOREIGN KEY (maMau)     REFERENCES MauSac(maMau)
);

-- 14. SanPham_KichThuoc
CREATE TABLE SanPham_KichThuoc (
    maSanPham CHAR(5) NOT NULL,
    maSize    INT NOT NULL,
    PRIMARY KEY (maSanPham, maSize),
    FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham) ON DELETE CASCADE,
    FOREIGN KEY (maSize)    REFERENCES KichThuoc(maSize)
);

-- 15. ChienDich
CREATE TABLE ChienDich (
    maChienDich       CHAR(5) PRIMARY KEY,
    maSanPham         CHAR(5) NOT NULL,
    maNgheSi          CHAR(5) NOT NULL,
    tenChienDich      NVARCHAR(200) NOT NULL,
    thoiDiem          NVARCHAR(50) NOT NULL DEFAULT N'Sắp bắt đầu'
                          CHECK (thoiDiem IN (N'Sắp bắt đầu', N'Đang diễn ra', N'Đã kết thúc')),
    trangThai         NVARCHAR(50) CHECK (trangThai IN (N'Thành công', N'Thất bại')),
    ngayBatDau        DATETIME NOT NULL,
    ngayKetThuc       DATETIME NOT NULL,
    nguongMOQ         INT NOT NULL,
    nguongToiDa       INT NOT NULL,
	nguoiThamGia      INT NOT NULL,
    phiThamGia        DECIMAL(18,2) DEFAULT 0,
    giaGoc            DECIMAL(18,2) DEFAULT 0,
    tongSoLuongHienTai INT DEFAULT 0,
    ngayTao           DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham),
    FOREIGN KEY (maNgheSi)  REFERENCES NgheSi(maNgheSi)
);
-- 12. HinhAnhChienDich
CREATE TABLE HinhAnhChienDich (
    maHinhAnh INT PRIMARY KEY IDENTITY(1,1),
    maChienDich CHAR(5) NOT NULL,
    duongDan  VARCHAR(255) NOT NULL,
    thuTu     INT DEFAULT 1,
    FOREIGN KEY (maChienDich) REFERENCES ChienDich(maChienDich) ON DELETE CASCADE
);
-- 16. BangGiaBacThang
CREATE TABLE BangGiaBacThang (
    maMucGia       INT PRIMARY KEY IDENTITY(1,1),
    maChienDich    CHAR(5) NOT NULL,
    soLuongToiThieu INT NOT NULL,
    soLuongToiDa   INT NOT NULL,
    donGia         DECIMAL(18,2) NOT NULL,
    CONSTRAINT CHK_KhoangSoLuong CHECK (soLuongToiDa >= soLuongToiThieu),
    CONSTRAINT CHK_SoLuongMin    CHECK (soLuongToiThieu >= 0),
    CONSTRAINT CHK_DonGiaBacThang CHECK (donGia >= 0),
    FOREIGN KEY (maChienDich) REFERENCES ChienDich(maChienDich) ON DELETE CASCADE
);

-- 17. ThanhToan
CREATE TABLE ThanhToan (
    maThanhToan       INT PRIMARY KEY IDENTITY(1,1),
    hoTenNguoiNhan    NVARCHAR(100) NOT NULL,
    soDienThoaiNhan   VARCHAR(15)   NOT NULL,
    diaChiGiaoHang    NVARCHAR(MAX) NOT NULL,
    soTienThanhToan   DECIMAL(18,2) NOT NULL,
    phuongThuc        NVARCHAR(30)  NOT NULL,
    ngayThanhToan     DATETIME DEFAULT GETDATE(),
    ghiChu            NVARCHAR(MAX)
);

-- 18. DangKyChienDich
CREATE TABLE DangKyChienDich (
    maDangKy          INT PRIMARY KEY IDENTITY(1,1),
    maThanhToan       INT UNIQUE NOT NULL,
	maMucGia           INT NOT NULL,
    maNguoiDung       CHAR(5) NOT NULL,
    maChienDich       CHAR(5) NOT NULL,
    daHuy             BIT NOT NULL DEFAULT 0,
    tongSoLuong       INT NOT NULL CHECK (tongSoLuong >= 1 AND tongSoLuong <= 2),
    trangThaiHoanTien BIT NOT NULL DEFAULT 0,
    ngayDangKy        DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (maThanhToan)  REFERENCES ThanhToan(maThanhToan),
    FOREIGN KEY (maNguoiDung)  REFERENCES NguoiDung(maNguoiDung),
    FOREIGN KEY (maChienDich)  REFERENCES ChienDich(maChienDich),
	FOREIGN KEY (maMucGia)     REFERENCES BangGiaBacThang(maMucGia)
);

-- 19. PhieuChiTietDangKy
CREATE TABLE PhieuChiTietDangKy (
    maChiTietDangKy INT PRIMARY KEY IDENTITY(1,1),
    maDangKy        INT NOT NULL,
    maSanPham       CHAR(5) NOT NULL,
    maMau           INT NOT NULL,
    maSize          INT NOT NULL,
    soLuong         INT DEFAULT 1 CHECK (soLuong >= 1),
    CONSTRAINT FK_CTDangKy_DangKy FOREIGN KEY (maDangKy)
        REFERENCES DangKyChienDich(maDangKy) ON DELETE CASCADE,
    CONSTRAINT FK_CTDangKy_Mau  FOREIGN KEY (maSanPham, maMau)
        REFERENCES SanPham_MauSac(maSanPham, maMau),
    CONSTRAINT FK_CTDangKy_Size FOREIGN KEY (maSanPham, maSize)
        REFERENCES SanPham_KichThuoc(maSanPham, maSize)
);

-- 20. DonHang
CREATE TABLE DonHang (
    maDonHang         CHAR(5) PRIMARY KEY,
    maDangKy          INT UNIQUE NOT NULL,
    giaChotCuoiCung   DECIMAL(18,2) NOT NULL,
    soTienHoanLai     DECIMAL(18,2) DEFAULT 0,
    trangThaiGiaoHang NVARCHAR(50) DEFAULT N'Đang chuẩn bị'
        CHECK (trangThaiGiaoHang IN (N'Đang chuẩn bị', N'Đang giao', N'Đã giao')),
    ngayTaoDon        DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (maDangKy) REFERENCES DangKyChienDich(maDangKy)
);

-- 21. ChiTietDonHang
CREATE TABLE ChiTietDonHang (
    maChiTietDonHang INT PRIMARY KEY IDENTITY(1,1),
    maDonHang        CHAR(5) NOT NULL,
    maMau            INT NOT NULL,
    maSize           INT NOT NULL,
    soLuong          INT NOT NULL CHECK (soLuong > 0),
    CONSTRAINT FK_CTDonHang_DonHang FOREIGN KEY (maDonHang)
        REFERENCES DonHang(maDonHang) ON DELETE CASCADE,
    CONSTRAINT FK_CTDonHang_Mau  FOREIGN KEY (maMau)  REFERENCES MauSac(maMau),
    CONSTRAINT FK_CTDonHang_Size FOREIGN KEY (maSize) REFERENCES KichThuoc(maSize)
);

-- 22. ThongBao
CREATE TABLE ThongBao (
    maThongBao   INT PRIMARY KEY IDENTITY(1,1),
    maNguoiDung  CHAR(5) NOT NULL,
    tieuDe       NVARCHAR(100) NOT NULL,
    noiDung      NVARCHAR(MAX) NOT NULL,
    loaiThongBao NVARCHAR(30) DEFAULT N'Hệ Thống',
    daDoc        BIT DEFAULT 0,
    ngayTao      DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (maNguoiDung) REFERENCES NguoiDung(maNguoiDung)
);

-- 23. DanhGia
CREATE TABLE DanhGia (
    maDanhGia   INT PRIMARY KEY IDENTITY(1,1),
    maDonHang   CHAR(5) NOT NULL,
    diemDanhGia INT CHECK (diemDanhGia BETWEEN 1 AND 5),
    binhLuan    NVARCHAR(MAX),
    ngayDanhGia DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (maDonHang) REFERENCES DonHang(maDonHang)
);

-- 24. HinhAnhDanhGia
CREATE TABLE HinhAnhDanhGia (
    maHinhAnh INT PRIMARY KEY IDENTITY(1,1),
    maDanhGia INT NOT NULL,
    duongDan  VARCHAR(225) NOT NULL,
    thuTu     INT DEFAULT 1,
    FOREIGN KEY (maDanhGia) REFERENCES DanhGia(maDanhGia) ON DELETE CASCADE
);

GO
CREATE TRIGGER trg_CapNhatTrangThaiChienDich
ON ChienDich
AFTER UPDATE, INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE ChienDich
    SET 
        thoiDiem = N'Đã kết thúc',
        trangThai = CASE 
                        WHEN tongSoLuongHienTai >= nguongMOQ THEN N'Thành công'
                        ELSE N'Thất bại'
                    END
    WHERE maChienDich IN (SELECT maChienDich FROM inserted)
      AND ngayKetThuc < GETDATE()
      AND thoiDiem != N'Đã kết thúc';
END;
GO
CREATE TRIGGER trg_CapNhatTongSoLuongChienDich
ON DangKyChienDich
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Khi thêm đăng ký mới (daHuy = 0): cộng tongSoLuong vào chiến dịch
    UPDATE ChienDich
    SET tongSoLuongHienTai = tongSoLuongHienTai + i.tongSoLuong
    FROM ChienDich cd
    INNER JOIN inserted i ON cd.maChienDich = i.maChienDich
    WHERE i.daHuy = 0
      AND NOT EXISTS (
          SELECT 1 FROM deleted d 
          WHERE d.maDangKy = i.maDangKy
      );

    -- Khi cập nhật daHuy từ 0 → 1: trừ tongSoLuong khỏi chiến dịch
    UPDATE ChienDich
    SET tongSoLuongHienTai = tongSoLuongHienTai - i.tongSoLuong
    FROM ChienDich cd
    INNER JOIN inserted i ON cd.maChienDich = i.maChienDich
    INNER JOIN deleted  d ON d.maDangKy     = i.maDangKy
    WHERE i.daHuy = 1
      AND d.daHuy = 0;

END;
GO

-- ============================================================
-- 1. TinhThanh
-- ============================================================
INSERT INTO TinhThanh (maTinhThanh, tenTinhThanh) VALUES
('TT001', N'Hà Nội'),
('TT002', N'Hồ Chí Minh'),
('TT003', N'Đà Nẵng'),
('TT004', N'Huế'),
('TT005', N'Cần Thơ');
GO
 
-- ============================================================
-- 2. PhuongXa
-- ============================================================
INSERT INTO PhuongXa (maPhuongXa, tenPhuongXa, maTinhThanh) VALUES
('PX001', N'Phường Hoàn Kiếm',  'TT001'),
('PX002', N'Phường Ba Đình',    'TT001'),
('PX003', N'Phường Bến Nghé',   'TT002'),
('PX004', N'Phường Phú Nhuận',  'TT002'),
('PX005', N'Phường Hải Châu',   'TT003'),
('PX006', N'Phường Thuận Hòa',  'TT004'),
('PX007', N'Phường Ninh Kiều',  'TT005');
GO
 
-- ============================================================
-- 3. NguoiDung
-- ============================================================
INSERT INTO NguoiDung (maNguoiDung, tenDangNhap, matKhau, email,
                       soDienThoai, gioiTinh, vaiTro, trangThai) VALUES
('ND001', 'admin01',    '123', 'admin@gmail.com',   '0901000001', N'Nam', N'Admin',N'Hoạt động'),
('ND002', 'beorom', '123', 'nguyenthu2018dn@gmail.com',  '0901000002', N'Nữ', N'Khách hàng', N'Hoạt động'),
('ND003', 'trieutien',   '123', 'trieutien@gmail.com',  '0901000003', N'Nữ',  N'Khách hàng', N'Hoạt động')
GO
 
-- ============================================================
-- 4. SoDiaChi
-- ============================================================
-- Không insert dữ liệu mẫu - để người dùng tự tạo qua API
GO
 
-- ============================================================
-- 5. NgheSi
-- ============================================================
INSERT INTO NgheSi (maNgheSi, tenNgheSi, moTa, ngheNghiep, linkMXH) VALUES
('NS001', N'Rosé', N'Rosé (Park Chae-young) là ca sĩ, rapper và dancer tài năng của nhóm nhạc BLACKPINK. Cô nổi tiếng với giọng hát ngọt ngào, mạnh mẽ và khả năng sáng tác xuất sắc. Rosé là một trong những nghệ sĩ solo thành công nhất K-pop với bản hit "On The Ground" và "Gone".', N'Ca sĩ', 'https://www.instagram.com/roses_are_rosie'),

('NS002', N'Lisa', N'Lisa (Lalisa Manobal) là rapper chính, dancer và visual của BLACKPINK. Cô là nghệ sĩ nữ K-pop có sức ảnh hưởng toàn cầu lớn nhất hiện nay, nổi tiếng với vũ đạo đỉnh cao và cá tính mạnh mẽ. Lisa còn là Global Ambassador của nhiều thương hiệu xa xỉ lớn.', N'Ca sĩ/Rapper', 'https://www.instagram.com/lalalalisa_m'),

('NS003', N'Jisoo', N'Jisoo (Kim Ji-soo) là vocalist và visual của BLACKPINK. Ngoài âm nhạc, cô còn gây ấn tượng mạnh mẽ với vai diễn trong bộ phim "Snowdrop" và nhiều dự án phim truyền hình khác. Jisoo được yêu mến nhờ vẻ đẹp thanh lịch và tính cách dễ thương.', N'Ca sĩ/Diễn viên', 'https://www.instagram.com/sooyaaa__'),

('NS004', N'Jennie', N'Jennie (Kim Jennie) là rapper và vocalist của BLACKPINK. Cô là biểu tượng thời trang hàng đầu châu Á, đồng thời là founder của công ty thời trang ODD ATELIER. Jennie nổi bật với phong cách cá tính, sang chảnh và khả năng rap cực đỉnh.', N'Ca sĩ/Rapper', 'https://www.instagram.com/jennierubyjane'),

('NS005', N'Ji Chang Wook', N'Ji Chang Wook là nam diễn viên Hàn Quốc nổi tiếng với ngoại hình điển trai và diễn xuất đa dạng. Anh được khán giả Việt Nam yêu thích qua các bộ phim "The K2", "Healer", "Lovestruck in the City" và "Queen of Tears".', N'Diễn viên', 'https://www.instagram.com/jichangwook'),

('NS006', N'Park Bo Gum', N'Park Bo Gum là nam diễn viên được mệnh danh là "quốc bảo quốc dân" Hàn Quốc. Anh nổi tiếng với nụ cười ấm áp và diễn xuất nội tâm sâu sắc qua các phim "Reply 1988", "Guardian: The Lonely and Great God" và "When Life Gives You Tangerines".', N'Diễn viên', 'https://www.instagram.com/bogummy'),

('NS007', N'Go Youn Jung', N'Go Youn Jung là nữ diễn viên và người mẫu Hàn Quốc đang lên rất mạnh. Cô gây ấn tượng với nhan sắc tươi trẻ và diễn xuất tự nhiên qua các phim "Alchemy of Souls", "Moving" và "Queen of Tears".', N'Diễn viên', 'https://www.instagram.com/goyounjung'),

('NS008', N'Kim Ji Won', N'Kim Ji Won là nữ diễn viên tài năng được khán giả yêu mến qua vai "Queen of Tears". Với vẻ đẹp thanh lịch cùng khả năng diễn xuất xuất sắc, cô đã khẳng định vị trí vững chắc trong làng phim Hàn Quốc.', N'Diễn viên', 'https://www.instagram.com/geewonii'),

('NS009', N'Namtan', N'Namtan Tipnaree là nữ diễn viên kiêm người mẫu Thái Lan xinh đẹp và được yêu thích. Cô nổi tiếng qua nhiều bộ phim Thái chất lượng cao và đang ngày càng được khán giả quốc tế chú ý.', N'Diễn viên', 'https://www.instagram.com/namtan.tipnaree'),

('NS010', N'Sieun', N'Sieun (Park Sieun) là thành viên của nhóm nhạc STAYC. Cô nổi bật với giọng hát ngọt ngào, visual dễ thương và khả năng biểu diễn ấn tượng, góp phần đưa STAYC trở thành một trong những nhóm nhạc nữ nổi bật của thế hệ mới.', N'Ca sĩ', 'https://www.instagram.com/stayc_highup'),

('NS011', N'Chương Nhược Nam', N'Chương Nhược Nam là nữ diễn viên Trung Quốc sở hữu nhan sắc thanh tú và diễn xuất tinh tế. Cô được khán giả biết đến qua các bộ phim cổ trang và hiện đại nổi tiếng như "The Story of Minglan" và nhiều dự án gần đây.', N'Diễn viên', 'https://weibo.com/zhangruonan'),

('NS012', N'Martin (Cortis)', N'Martin là thành viên của nhóm nhạc Cortis - ban nhạc rock nổi tiếng tại Việt Nam. Anh là nhạc công tài năng, ca sĩ và sáng tác viên với phong cách âm nhạc mạnh mẽ và cá tính riêng.', N'Nhạc công/Ca sĩ', 'https://www.facebook.com/cortisband');
GO
 
-- ============================================================
-- 6. HinhAnhNgheSi
-- ============================================================
INSERT INTO HinhAnhNgheSi (maNgheSi, duongDan, thuTu) VALUES
('NS001', 'images/avt_rose.jpg', 1),
('NS002', 'images/avt_lisa.jpg', 1),
('NS003', 'images/avt_jisoo.jpg', 1),
('NS004', 'images/avt_jen.jpg', 1),
('NS005', 'images/avt_jichangwook.jpg', 1),
('NS006', 'images/avt_parkbogum.jpg', 1),
('NS007', 'images/avt_goyounjung.jpg', 1),
('NS008', 'images/avt_kimjiwon.jpg', 1),
('NS009', 'images/avt_namtan.jpg', 1),
('NS010', 'images/avt_sieun.jpg', 1),
('NS011', 'images/avt_chuongnhuocnam.jpg', 1),
('NS012', 'images/avt_martin_cortis.jpg', 1); 
GO
 
-- ============================================================
-- 7. DanhMuc
-- ============================================================
INSERT INTO DanhMuc (maDanhMuc, tenDanhMuc, loaiKichThuoc) VALUES
('DM001', N'Áo Thun','AO'),
('DM002', N'Giày Sneaker','GIAY')
GO
 
-- ============================================================
-- 8. MauSac
-- ============================================================
INSERT INTO MauSac (tenMau) VALUES
(N'Đen'),       -- maMau = 1
(N'Trắng'),     -- maMau = 2
(N'Xanh Navy'), -- maMau = 3
(N'Đỏ'),        -- maMau = 4
(N'Xám');       -- maMau = 5
GO
 
-- ============================================================
-- 9. KichThuoc
-- ============================================================
INSERT INTO KichThuoc (tenSize, loaiKichThuoc) VALUES
('S',  'AO'),   -- maSize = 1
('M',  'AO'),   -- maSize = 2
('L',  'AO'),   -- maSize = 3
('XL', 'AO'),   -- maSize = 4
('38', 'GIAY'), -- maSize = 5
('39', 'GIAY'), -- maSize = 6
('40', 'GIAY'), -- maSize = 7
('41', 'GIAY'), -- maSize = 8
('42', 'GIAY'); -- maSize = 9
GO
 
-- ============================================================
-- 10. SanPham
-- ============================================================
INSERT INTO SanPham (maSanPham, maDanhMuc, tenSanPham, moTa) VALUES
('SP001', 'DM002', N'Giày Puma Speedcat Red', N'Giày thể thao màu đỏ hoặc xanh phối trắng, phong cách racing cổ điển với logo Puma nổi bật.'),
('SP002', 'DM002', N'Giày Adidas Superstar Black White', N'Dòng giày mũi vỏ sò huyền thoại màu đen với 3 sọc trắng, phù hợp cho mọi phong cách thời trang.');
GO
-- ============================================================
-- 11. HinhAnhSanPham
-- ============================================================
INSERT INTO HinhAnhSanPham (maSanPham, duongDan, thuTu) VALUES
('SP001', 'images/SPCDRose1.jpg',    1),
('SP001', 'images/SPCDRose2.jpg',  2),
('SP002', 'images/SPCDJen1.jpg',    1),
('SP002', 'images/SPCDJen2.jpg',   2)
GO
 
-- ============================================================
-- 12. SanPham_MauSac
-- ============================================================
INSERT INTO SanPham_MauSac (maSanPham, maMau, soLuongToiDa, soLuongDaDat) VALUES
('SP001', 3, 800, 514), -- xanh navy
('SP001', 4, 400, 400), -- đỏ
('SP002', 1, 500, 490 ), -- Đen
('SP002', 2, 500, 380) -- trắng
GO
 
-- ============================================================
-- 13. SanPham_KichThuoc
-- ============================================================
INSERT INTO SanPham_KichThuoc (maSanPham, maSize) VALUES
('SP001', 5), ('SP001', 6), ('SP001', 7), ('SP001', 8), -- 38 39 40 41
('SP002', 5), ('SP002', 6), ('SP002', 7), ('SP002', 8) -- 38 39 40 41

GO
 
-- ============================================================
-- ============================================================
-- 14. ChienDich
-- ============================================================
INSERT INTO ChienDich (maChienDich, maSanPham, maNgheSi, tenChienDich,
                       thoiDiem, ngayBatDau, ngayKetThuc,
                       nguongMOQ, nguongToiDa, phiThamGia, giaGoc, tongSoLuongHienTai, nguoiThamGia) VALUES
('CD001', 'SP001', 'NS001', N'ROSÉ X EXED', 
 N'Đang diễn ra', '2026-04-09 00:00:00', '2026-04-25 23:59:59', 
 100, 1200, 500000, 28850000, 914,911),
 ('CD002', 'SP002', 'NS004', N'JENNIE X EXED', 
 N'Đang diễn ra', '2026-04-08 09:00:00', '2026-04-25 23:59:59', 
 50, 1000, 500000, 15500000, 870,800); 
GO

-- ============================================================
-- 15. BangGiaBacThang
-- ============================================================
INSERT INTO BangGiaBacThang (maChienDich, soLuongToiThieu, soLuongToiDa, donGia) VALUES
-- Các bậc giá cho Rosé (CD001)
('CD001', 100, 499, 25550000),
('CD001', 500, 799, 23550000),
('CD001', 800, 999, 21550000),
('CD001', 1000, 1200, 18550000),

-- Các bậc giá cho Jennie (CD002) - Chia 4 bậc dựa trên ngưỡng 1000
('CD002', 50, 299, 14500000),   -- Bậc 1: Giảm nhẹ từ giá gốc 15.5tr
('CD002', 300, 599, 13500000),  -- Bậc 2
('CD002', 600, 849, 12500000),  -- Bậc 3
('CD002', 850, 1000, 11000000); -- Bậc kịch sàn (giá ưu đãi nhất)
GO
INSERT INTO HinhAnhChienDich (maChienDich, duongDan, thuTu) VALUES
('CD001', 'images/chiendichRose1.jpg',    1),
('CD001', 'images/chiendichRose2.jpg',  2),
('CD002', 'images/chiendichJen1.jpg',    1),
('CD002', 'images/chiendichJen2.jpg',   2)
GO
-- ============================================================
-- SẢN PHẨM MỚI (SP003 → SP012)
-- Căn cứ vào hợp tác thực tế của nghệ sĩ với nhãn hàng
-- NS002 Lisa    → Adidas (giày)
-- NS003 Jisoo   → Dior (giày)
-- NS005 Ji Chang Wook → New Balance (giày)
-- NS006 Park Bo Gum   → Fila (giày)
-- NS007 Go Youn Jung  → Nike (giày)
-- NS008 Kim Ji Won    → Converse (giày)
-- NS009 Namtan        → Vans (giày)
-- NS010 Sieun         → New Balance (áo)
-- NS011 Chương Nhược Nam → Li-Ning (áo)
-- NS012 Martin Cortis    → Dickies (áo)
-- ============================================================

-- ============================================================
-- PHẦN 1: DANH MỤC SẢN PHẨM (SP003–SP012)
-- ============================================================
INSERT INTO SanPham (maSanPham, maDanhMuc, tenSanPham, moTa) VALUES
('SP003', 'DM002', N'Giày Adidas Samba White Gum',
    N'Adidas Samba phiên bản trắng đế gum - dòng giày cổ điển huyền thoại, được Lisa Manobal lăng xê mạnh mẽ trong vai trò Adidas Global Ambassador.'),
('SP004', 'DM002', N'Giày Dior B23 Low Top',
    N'Dior B23 Low Top phối họa tiết Oblique huyền thoại, sang trọng và tinh tế - lấy cảm hứng từ sự hợp tác của Jisoo với nhà mốt Dior.'),
('SP005', 'DM002', N'Giày New Balance 574 Grey',
    N'New Balance 574 màu xám classic, êm ái và bền bỉ - được Ji Chang Wook sử dụng trong chiến dịch quảng bá của New Balance Hàn Quốc.'),
('SP006', 'DM002', N'Giày Fila Disruptor II White',
    N'Fila Disruptor II đế chunky màu trắng - biểu tượng thời trang streetwear được Park Bo Gum quảng bá trong chiến dịch Fila Korea.'),
('SP007', 'DM002', N'Giày Nike Air Force 1 Shadow',
    N'Nike Air Force 1 Shadow phiên bản đặc biệt, thiết kế layer độc đáo - được Go Youn Jung mặc trong chiến dịch Nike Women mùa hè.'),
('SP008', 'DM002', N'Giày Converse Chuck 70 Black',
    N'Converse Chuck 70 màu đen cổ điển với chất liệu canvas cao cấp - phiên bản được Kim Ji Won lựa chọn trong chiến dịch Converse Korea.'),
('SP009', 'DM002', N'Giày Vans Old Skool Navy White',
    N'Vans Old Skool phối xanh navy và trắng - dòng giày skate cổ điển được Namtan Tipnaree giới thiệu trong chiến dịch Vans Thailand.'),
('SP010', 'DM001', N'Áo Thun New Balance Athletics Tee',
    N'Áo thun thể thao New Balance dòng Athletics, chất liệu cotton thoáng mát - được Sieun của STAYC quảng bá trong chiến dịch New Balance Korea.'),
('SP011', 'DM001', N'Áo Thun Li-Ning Wade Series',
    N'Áo thun Li-Ning dòng Wade Series thiết kế hiện đại, in logo nổi bật - được Chương Nhược Nam làm đại diện thương hiệu trong chiến dịch Li-Ning China.'),
('SP012', 'DM001', N'Áo Thun Dickies Heavyweight Black',
    N'Áo thun Dickies dòng Heavyweight màu đen, chất cotton dày dặn phong cách workwear - được Martin của Cortis mặc trong chiến dịch hợp tác giữa Dickies và cộng đồng rock Việt Nam.');
GO

-- ============================================================
-- PHẦN 2: HÌNH ẢNH SẢN PHẨM
-- ============================================================
INSERT INTO HinhAnhSanPham (maSanPham, duongDan, thuTu) VALUES
('SP003', 'images/SPCDLisa1.jpg',       1),
('SP003', 'images/SPCDLisa2.jpg',       2),
('SP004', 'images/SPCDJisoo1.jpg',      1),
('SP004', 'images/SPCDJisoo2.jpg',      2),
('SP005', 'images/SPCDJiChangWook1.jpg',1),
('SP005', 'images/SPCDJiChangWook2.jpg',2),
('SP006', 'images/SPCDParkBoGum1.jpg',  1),
('SP006', 'images/SPCDParkBoGum2.jpg',  2),
('SP007', 'images/SPCDGoYounJung1.jpg', 1),
('SP007', 'images/SPCDGoYounJung2.jpg', 2),
('SP008', 'images/SPCDKimJiWon1.jpg',   1),
('SP008', 'images/SPCDKimJiWon2.jpg',   2),
('SP009', 'images/SPCDNamtan1.jpg',     1),
('SP009', 'images/SPCDNamtan2.jpg',     2),
('SP010', 'images/SPCDSieun1.jpg',      1),
('SP010', 'images/SPCDSieun2.jpg',      2),
('SP011', 'images/SPCDChuongNhuocNam1.jpg', 1),
('SP011', 'images/SPCDChuongNhuocNam2.jpg', 2),
('SP012', 'images/SPCDMartin1.jpg',     1),
('SP012', 'images/SPCDMartin2.jpg',     2);
GO

-- ============================================================
-- PHẦN 3: MÀU SẮC TỪNG SẢN PHẨM (SanPham_MauSac)
-- ============================================================
INSERT INTO SanPham_MauSac (maSanPham, maMau, soLuongToiDa, soLuongDaDat) VALUES
-- SP003 Adidas Samba (Trắng, Xám)
('SP003', 2, 600, 600),  -- Trắng - hết (chiến dịch thất bại vì < MOQ nhưng đã đặt hết màu này)
('SP003', 5, 300, 180),  -- Xám

-- SP004 Dior B23 (Trắng, Đen)
('SP004', 2, 200, 200),  -- Trắng
('SP004', 1, 200, 195),  -- Đen

-- SP005 New Balance 574 (Xám, Trắng)
('SP005', 5, 500, 420),  -- Xám
('SP005', 2, 300, 210),  -- Trắng

-- SP006 Fila Disruptor (Trắng, Đen)
('SP006', 2, 400, 25),   -- Trắng - chiến dịch sắp bắt đầu
('SP006', 1, 400, 0),    -- Đen   - chưa có đơn

-- SP007 Nike Air Force 1 Shadow (Trắng, Đỏ)
('SP007', 2, 700, 650),  -- Trắng
('SP007', 4, 300, 280),  -- Đỏ

-- SP008 Converse Chuck 70 (Đen, Trắng)
('SP008', 1, 500, 500),  -- Đen
('SP008', 2, 500, 430),  -- Trắng

-- SP009 Vans Old Skool (Xanh Navy, Đen)
('SP009', 3, 450, 0),   -- Xanh Navy - sắp bắt đầu
('SP009', 1, 350, 0),    -- Đen       - chưa có đơn

-- SP010 New Balance Athletics Tee (Đen, Trắng, Xám)
('SP010', 1, 800, 5),    -- Đen   - sắp bắt đầu
('SP010', 2, 600, 0),    -- Trắng
('SP010', 5, 400, 0),    -- Xám

-- SP011 Li-Ning Wade (Đen, Đỏ)
('SP011', 1, 700, 680),  -- Đen
('SP011', 4, 500, 350),  -- Đỏ

-- SP012 Dickies Heavyweight (Đen, Xám)
('SP012', 1, 300, 0),  -- Đen
('SP012', 5, 200, 0);   -- Xám
GO

-- ============================================================
-- PHẦN 4: KÍCH THƯỚC TỪNG SẢN PHẨM (SanPham_KichThuoc)
-- ============================================================
INSERT INTO SanPham_KichThuoc (maSanPham, maSize) VALUES
-- Giày (maSize 5–9: 38–42)
('SP003', 5), ('SP003', 6), ('SP003', 7), ('SP003', 8), ('SP003', 9),
('SP004', 5), ('SP004', 6), ('SP004', 7), ('SP004', 8),
('SP005', 5), ('SP005', 6), ('SP005', 7), ('SP005', 8), ('SP005', 9),
('SP006', 5), ('SP006', 6), ('SP006', 7), ('SP006', 8), ('SP006', 9),
('SP007', 5), ('SP007', 6), ('SP007', 7), ('SP007', 8), ('SP007', 9),
('SP008', 5), ('SP008', 6), ('SP008', 7), ('SP008', 8),
('SP009', 5), ('SP009', 6), ('SP009', 7), ('SP009', 8), ('SP009', 9),
-- Áo (maSize 1–4: S, M, L, XL)
('SP010', 1), ('SP010', 2), ('SP010', 3), ('SP010', 4),
('SP011', 1), ('SP011', 2), ('SP011', 3), ('SP011', 4),
('SP012', 1), ('SP012', 2), ('SP012', 3), ('SP012', 4);
GO

-- ============================================================
-- PHẦN 5: CHIẾN DỊCH (CD003–CD011)
-- Mốc thời gian: hôm nay = 10/04/2026
--
-- ĐÃ KẾT THÚC (3):
--   CD003 Lisa    - Thất bại  (kết thúc 31/03, tổng < MOQ)
--   CD004 Jisoo   - Thành công (kết thúc 05/04, tổng >= MOQ)
--   CD005 Ji Chang Wook - Thành công (kết thúc 08/04, tổng >= MOQ)
--
-- ĐANG DIỄN RA (4):
--   CD006 Park Bo Gum  (01/04 – 20/04)
--   CD007 Go Youn Jung (05/04 – 25/04)
--   CD008 Kim Ji Won   (08/04 – 30/04)
--   CD009 Chương Nhược Nam (10/04 – 05/05)
--
-- SẮP BẮT ĐẦU (3):
--   CD010 Namtan   (15/04 – 05/05)
--   CD011 Sieun    (20/04 – 10/05)
--   CD011 Martin   (25/04 – 15/05)
-- ============================================================

INSERT INTO ChienDich (
    maChienDich, maSanPham, maNgheSi, tenChienDich,
    thoiDiem, trangThai,
    ngayBatDau, ngayKetThuc,
    nguongMOQ, nguongToiDa,
    phiThamGia, giaGoc,
    tongSoLuongHienTai, nguoiThamGia
) VALUES

-- ── ĐÃ KẾT THÚC ──────────────────────────────────────────────

-- CD003: Lisa x Adidas Samba — THẤT BẠI (tongSoLuong=780 < MOQ=1000)
('CD003','SP003','NS002', N'LISA X EXED',
 N'Đã kết thúc', N'Thất bại',
 '2026-03-01 00:00:00', '2026-03-31 23:59:59',
 1000, 2000, 600000, 3200000,
 780, 750),

-- CD004: Jisoo x Dior B23 — THÀNH CÔNG (tongSoLuong=380 >= MOQ=200)
('CD004','SP004','NS003', N'JISOO X EXED',
 N'Đã kết thúc', N'Thành công',
 '2026-03-10 00:00:00', '2026-04-05 23:59:59',
 200, 400, 1000000, 45000000,
 380, 370),

-- CD005: Ji Chang Wook x New Balance 574 — THÀNH CÔNG (tongSoLuong=630 >= MOQ=300)
('CD005','SP005','NS005', N'JI CHANG WOOK X EXED',
 N'Đã kết thúc', N'Thành công',
 '2026-03-15 00:00:00', '2026-04-08 23:59:59',
 300, 800, 500000, 2200000,
 630, 610),

-- ── ĐANG DIỄN RA ──────────────────────────────────────────────

-- CD006: Park Bo Gum x Fila Disruptor
('CD006','SP006','NS006', N'PARK BO GUM X EXED',
 N'Đang diễn ra', NULL,
 '2026-04-01 00:00:00', '2026-04-20 23:59:59',
 200, 800, 400000, 1950000,
 25, 20),

-- CD007: Go Youn Jung x Nike AF1 Shadow
('CD007','SP007','NS007', N'GO YOUN JUNG X EXED',
 N'Đang diễn ra', NULL,
 '2026-04-05 00:00:00', '2026-04-25 23:59:59',
 500, 1000, 500000, 2800000,
 930, 900),

-- CD008: Kim Ji Won x Converse Chuck 70
('CD008','SP008','NS008', N'KIM JI WON X EXED',
 N'Đang diễn ra', NULL,
 '2026-04-08 00:00:00', '2026-04-30 23:59:59',
 400, 1000, 450000, 1750000,
 930, 880),

-- CD009: Chương Nhược Nam x Li-Ning Wade
('CD009','SP011','NS011', N'CHƯƠNG NHƯỢC NAM X EXED',
 N'Đang diễn ra', NULL,
 '2026-04-05 00:00:00', '2026-04-20 23:59:59',
 300, 1200, 350000, 650000,
 1030, 990),

-- ── SẮP BẮT ĐẦU ──────────────────────────────────────────────

-- CD010: Namtan x Vans Old Skool
('CD010','SP009','NS009', N'NAMTAN X EXED',
 N'Sắp bắt đầu', NULL,
 '2026-04-15 00:00:00', '2026-05-05 23:59:59',
 200, 800, 400000, 2100000,
 0, 0),
-- CD011: Martin x Dickies Heavyweight
('CD011','SP012','NS012', N'MARTIN X EXED',
 N'Sắp bắt đầu', NULL,
 '2026-04-25 00:00:00', '2026-05-15 23:59:59',
 150, 500, 250000, 550000,
 0, 0);
GO

-- ============================================================
-- PHẦN 6: BẢNG GIÁ BẬC THANG (mỗi chiến dịch 4 bậc)
-- ============================================================
INSERT INTO BangGiaBacThang (maChienDich, soLuongToiThieu, soLuongToiDa, donGia) VALUES

-- CD003 Lisa x Adidas Samba (giaGoc 3.200.000)
('CD003',  200,  599, 3000000),
('CD003',  600,  999, 2800000),
('CD003', 1000, 1499, 2600000),
('CD003', 1500, 2000, 2400000),

-- CD004 Jisoo x Dior B23 (giaGoc 45.000.000)
('CD004',  200,  249, 42000000),
('CD004',  250,  299, 39000000),
('CD004',  300,  349, 36000000),
('CD004',  350,  400, 32000000),

-- CD005 Ji Chang Wook x New Balance 574 (giaGoc 2.200.000)
('CD005',  300,  449, 2000000),
('CD005',  450,  599, 1850000),
('CD005',  600,  699, 1700000),
('CD005',  700,  800, 1550000),

-- CD006 Park Bo Gum x Fila Disruptor (giaGoc 1.950.000)
('CD006',  200,  349, 1800000),
('CD006',  350,  499, 1650000),
('CD006',  500,  649, 1500000),
('CD006',  650,  800, 1350000),

-- CD007 Go Youn Jung x Nike AF1 Shadow (giaGoc 2.800.000)
('CD007',  500,  649, 2600000),
('CD007',  650,  799, 2400000),
('CD007',  800,  899, 2200000),
('CD007',  900, 1000, 2000000),

-- CD008 Kim Ji Won x Converse Chuck 70 (giaGoc 1.750.000)
('CD008',  400,  549, 1600000),
('CD008',  550,  699, 1500000),
('CD008',  700,  849, 1380000),
('CD008',  850, 1000, 1250000),

-- CD009 Chương Nhược Nam x Li-Ning (giaGoc 650.000)
('CD009',  300,  499, 600000),
('CD009',  500,  799, 550000),
('CD009',  800,  999, 500000),
('CD009', 1000, 1200, 450000),

-- CD010 Namtan x Vans Old Skool (giaGoc 2.100.000)
('CD010',  200,  349, 1950000),
('CD010',  350,  499, 1800000),
('CD010',  500,  649, 1650000),
('CD010',  650,  800, 1500000),


-- CD011 Martin x Dickies Heavyweight (giaGoc 550.000)
('CD011',  150,  249, 500000),
('CD011',  250,  349, 460000),
('CD011',  350,  449, 420000),
('CD011',  450,  500, 380000);
GO

-- ============================================================
-- PHẦN 7: HÌNH ẢNH CHIẾN DỊCH (2 ảnh mỗi chiến dịch)
-- ============================================================
INSERT INTO HinhAnhChienDich (maChienDich, duongDan, thuTu) VALUES
('CD003', 'images/chiendichLisa1.jpg',           1),
('CD003', 'images/chiendichLisa2.jpg',           2),
('CD004', 'images/chiendichJisoo1.jpg',          1),
('CD004', 'images/chiendichJisoo2.jpg',          2),
('CD005', 'images/chiendichJiChangWook1.jpg',    1),
('CD005', 'images/chiendichJiChangWook2.jpg',    2),
('CD006', 'images/chiendichParkBoGum1.jpg',      1),
('CD006', 'images/chiendichParkBoGum2.jpg',      2),
('CD007', 'images/chiendichGoYounJung1.jpg',     1),
('CD007', 'images/chiendichGoYounJung2.jpg',     2),
('CD008', 'images/chiendichKimJiWon1.jpg',       1),
('CD008', 'images/chiendichKimJiWon2.jpg',       2),
('CD009', 'images/chiendichChuongNhuocNam1.jpg', 1),
('CD009', 'images/chiendichChuongNhuocNam2.jpg', 2),
('CD010', 'images/chiendichNamtan1.jpg',         1),
('CD010', 'images/chiendichNamtan2.jpg',         2),
('CD011', 'images/chiendichMartin1.jpg',         1),
('CD011', 'images/chiendichMartin2.jpg',         2);
GO
select * from ThanhToan
select * from HinhAnhChienDich
select * from HinhAnhSanPham
select * from ChienDich
select * from SoDiaChi
select * from ThanhToan
select * from DangKyChienDich
select * from PhieuChiTietDangKy