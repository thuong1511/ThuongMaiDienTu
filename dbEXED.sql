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
    phiThamGia        DECIMAL(18,2) DEFAULT 0,
    giaGoc            DECIMAL(18,2) DEFAULT 0,
    tongSoLuongHienTai INT DEFAULT 0,
    ngayTao           DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham),
    FOREIGN KEY (maNgheSi)  REFERENCES NgheSi(maNgheSi)
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
    emailNguoiNhan    VARCHAR(100),
    diaChiGiaoHang    NVARCHAR(MAX) NOT NULL,
    soTienThanhToan   DECIMAL(18,2) NOT NULL,
    phuongThuc        NVARCHAR(30)  NOT NULL,
    trangThai         BIT DEFAULT 0,
    ngayThanhToan     DATETIME DEFAULT GETDATE(),
    ghiChu            NVARCHAR(MAX)
);

-- 18. DangKyChienDich
CREATE TABLE DangKyChienDich (
    maDangKy          INT PRIMARY KEY IDENTITY(1,1),
    maThanhToan       INT UNIQUE NOT NULL,
    maNguoiDung       CHAR(5) NOT NULL,
    maChienDich       CHAR(5) NOT NULL,
    daHuy             BIT NOT NULL DEFAULT 0,
    tongSoLuong       INT NOT NULL CHECK (tongSoLuong >= 1 AND tongSoLuong <= 2),
    trangThaiHoanTien BIT NOT NULL DEFAULT 0,
    ngayDangKy        DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (maThanhToan)  REFERENCES ThanhToan(maThanhToan),
    FOREIGN KEY (maNguoiDung)  REFERENCES NguoiDung(maNguoiDung),
    FOREIGN KEY (maChienDich)  REFERENCES ChienDich(maChienDich)
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
INSERT INTO SoDiaChi (maSo, maNguoiDung, maPhuongXa,
                      hoTen, soDienThoai, diaChiChiTiet) VALUES
('DC001', 'ND002', 'PX001', N'Nguyễn Văn A', '0901000002', N'12 Đinh Tiên Hoàng'),
('DC002', 'ND002', 'PX003', N'Trần Thị B',   '0901000003', N'45 Lê Lợi'),
('DC003', 'ND002', 'PX005', N'Lê Minh C',    '0901000004', N'88 Nguyễn Huệ'),
('DC004', 'ND003', 'PX006', N'Phạm Thị D',   '0901000005', N'23 Trần Phú');
GO
 
-- ============================================================
-- 5. NgheSi
-- ============================================================
INSERT INTO NgheSi (maNgheSi, tenNgheSi, moTa, ngheNghiep, linkMXH) VALUES
('NS001', N'Rosé', N'Thành viên nhóm nhạc BLACKPINK', N'Ca sĩ', 'https://www.instagram.com/roses_are_rosie'),
('NS002', N'Lisa', N'Thành viên nhóm nhạc BLACKPINK', N'Ca sĩ/Rapper', 'https://www.instagram.com/lalalalisa_m'),
('NS003', N'Jisoo', N'Thành viên nhóm nhạc BLACKPINK', N'Ca sĩ/Diễn viên', 'https://www.instagram.com/sooyaaa__'),
('NS004', N'Jennie', N'Thành viên nhóm nhạc BLACKPINK', N'Ca sĩ/Rapper', 'https://www.instagram.com/jennierubyjane'),
('NS005', N'Ji Chang Wook', N'Nam diễn viên nổi tiếng Hàn Quốc', N'Diễn viên', 'https://www.instagram.com/jichangwook'),
('NS006', N'Park Bo Gum', N'Nam diễn viên điện ảnh Hàn Quốc', N'Diễn viên', 'https://www.instagram.com/bogummy'),
('NS007', N'Go Youn Jung', N'Nữ diễn viên, người mẫu Hàn Quốc', N'Diễn viên', 'https://www.instagram.com/goyounjung'),
('NS008', N'Kim Ji Won', N'Nữ diễn viên nổi tiếng (Queen of Tears)', N'Diễn viên', 'https://www.instagram.com/geewonii'),
('NS009', N'Namtan', N'Nữ diễn viên, người mẫu Thái Lan', N'Diễn viên', 'https://www.instagram.com/namtan.tipnaree'),
('NS010', N'Sieun', N'Thành viên nhóm nhạc STAYC', N'Ca sĩ', 'https://www.instagram.com/stayc_highup'),
('NS011', N'Chương Nhược Nam', N'Nữ diễn viên nổi tiếng Trung Quốc', N'Diễn viên', 'https://weibo.com/zhangruonan'),
('NS012', N'Martin (Cortis)', N'Thành viên nhóm nhạc Cortis', N'Nhạc công/Ca sĩ', 'https://www.facebook.com/cortisband');
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
INSERT INTO SanPham_MauSac (maSanPham, maMau, soLuongToiDa) VALUES
('SP001', 3, 800), -- xanh navy
('SP001', 4, 400), -- đỏ
('SP002', 1, 180), -- Đen
('SP002', 2, 120) -- trắng
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
                       nguongMOQ, nguongToiDa, phiThamGia, giaGoc, tongSoLuongHienTai) VALUES
('CD001', 'SP001', 'NS001', N'ROSÉ X EXED - Puma Speedcat Edition', 
 N'Đang diễn ra', '2026-04-01 00:00:00', '2026-04-10 23:59:59', 
 100, 1200, 500000, 28850000, 924); 
GO

-- ============================================================
-- 15. BangGiaBacThang
-- ============================================================
INSERT INTO BangGiaBacThang (maChienDich, soLuongToiThieu, soLuongToiDa, donGia) VALUES
('CD001', 100, 499, 25550000),
('CD001', 500, 799, 23550000),
('CD001', 800, 999, 21550000),
('CD001', 1000, 1200, 18550000);
GO
-- ===========================================================