# HƯỚNG DẪN TEST TAB "ĐƠN HÀNG CỦA TÔI"

## ✅ ĐÃ HOÀN THÀNH

### Backend:
1. ✅ Tạo `DonHangController.java` - User-facing controller
   - `GET /api/donhang/nguoidung/{maNguoiDung}` - Lấy đơn hàng của user
   - `GET /api/donhang/{maDonHang}` - Chi tiết đơn hàng

2. ✅ Tạo `DonHangService.java` - Service layer

3. ✅ Cập nhật `DonHangRepository.java` - Thêm query method `findByNguoiDung()`

4. ✅ Build thành công

### Frontend:
1. ✅ Cập nhật `api.js` - Thêm functions:
   - `getDonHangByUserId(userId)`
   - `getDonHangById(maDonHang)`

2. ✅ Cập nhật `order-history.js` - Thêm functions:
   - `loadOrders()` - Load đơn hàng từ API
   - `createOrderCard(donHang)` - Render card động
   - `viewOrderDetail(maDonHang)` - Xem chi tiết

3. ✅ Cập nhật `order-history.html` - Xóa mock data, giữ container trống

---

## 🧪 CÁCH TEST

### Bước 1: Tạo dữ liệu mẫu trong SQL Server

**Option A: Dùng script tự động**
```sql
-- Chạy file test-donhang-data.sql trong SQL Server Management Studio
-- File này sẽ tự động tạo đơn hàng từ đăng ký có sẵn
```

**Option B: Tạo thủ công**
```sql
USE dbEXED;

-- 1. Kiểm tra có đăng ký nào không
SELECT TOP 5 
    dk.maDangKy,
    dk.maNguoiDung,
    cd.tenChienDich,
    dk.tongSoLuong,
    tt.soTienThanhToan
FROM DangKyChienDich dk
INNER JOIN ChienDich cd ON dk.maChienDich = cd.maChienDich
LEFT JOIN ThanhToan tt ON dk.maThanhToan = tt.maThanhToan
WHERE dk.daHuy = 0;

-- 2. Tạo đơn hàng (thay maDangKy = 1 bằng ID thực tế)
INSERT INTO DonHang (maDonHang, maDangKy, giaChotCuoiCung, soTienHoanLai, trangThaiGiaoHang, ngayTaoDon)
VALUES (
    'DH001',
    1,  -- Thay bằng maDangKy thực tế
    23500000,
    2000000,
    N'Đang chuẩn bị',
    GETDATE()
);

-- 3. Tạo thêm đơn hàng với trạng thái khác
INSERT INTO DonHang (maDonHang, maDangKy, giaChotCuoiCung, soTienHoanLai, trangThaiGiaoHang, ngayTaoDon)
VALUES (
    'DH002',
    2,  -- Thay bằng maDangKy khác
    37600000,
    20600000,
    N'Đang giao',
    GETDATE()
);

INSERT INTO DonHang (maDonHang, maDangKy, giaChotCuoiCung, soTienHoanLai, trangThaiGiaoHang, ngayTaoDon)
VALUES (
    'DH003',
    3,  -- Thay bằng maDangKy khác
    23800000,
    5550000,
    N'Đã giao',
    GETDATE()
);
```

### Bước 2: Khởi động Backend
```bash
cd BE
.\gradlew.bat bootRun
```

### Bước 3: Test API bằng Browser hoặc Postman

**Test endpoint:**
```
GET http://localhost:8080/api/donhang/nguoidung/ND001
```

**Response mong đợi:**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": [
    {
      "maDonHang": "DH001",
      "dangKyChienDich": {
        "maDangKy": 1,
        "nguoiDung": {...},
        "chienDich": {...},
        "bangGiaBacThang": {...},
        "thanhToan": {...}
      },
      "giaChotCuoiCung": 23500000,
      "soTienHoanLai": 2000000,
      "trangThaiGiaoHang": "Đang chuẩn bị",
      "ngayTaoDon": "2026-05-16T..."
    }
  ]
}
```

### Bước 4: Test Frontend

1. Mở trình duyệt: `http://localhost:8080/pages/order-history.html`
2. Đăng nhập với user có đơn hàng (ví dụ: ND001)
3. Click tab **"Đơn hàng của tôi"**
4. Kiểm tra:
   - ✅ Hiển thị danh sách đơn hàng từ API
   - ✅ Hiển thị đúng thông tin: mã đơn, tên chiến dịch, ảnh, số tiền
   - ✅ Hiển thị đúng trạng thái giao hàng (Đang chuẩn bị / Đang giao / Đã giao)
   - ✅ Progress bar giao hàng hoạt động đúng
   - ✅ Filter theo trạng thái hoạt động
   - ✅ Nếu không có đơn hàng → hiển thị empty state

---

## 🔍 KIỂM TRA LỖI

### Nếu không hiển thị đơn hàng:

1. **Kiểm tra Console (F12)**
   ```javascript
   // Xem có lỗi API không
   // Xem response từ API
   ```

2. **Kiểm tra Network tab**
   - Request: `GET /api/donhang/nguoidung/ND001`
   - Status: 200 OK
   - Response: `{success: true, data: [...]}`

3. **Kiểm tra Database**
   ```sql
   -- Xem có đơn hàng không
   SELECT * FROM DonHang;
   
   -- Xem đơn hàng của user cụ thể
   SELECT dh.*, dk.maNguoiDung
   FROM DonHang dh
   INNER JOIN DangKyChienDich dk ON dh.maDangKy = dk.maDangKy
   WHERE dk.maNguoiDung = 'ND001';
   ```

4. **Kiểm tra localStorage**
   ```javascript
   // Trong Console
   console.log(localStorage.getItem('currentUser'));
   // Phải có maNguoiDung
   ```

---

## 📊 CẤU TRÚC DỮ LIỆU

### DonHang (Đơn hàng giao)
- Được tạo **SAU KHI** chiến dịch thành công
- Liên kết 1-1 với `DangKyChienDich`
- Có trạng thái giao hàng: "Đang chuẩn bị" → "Đang giao" → "Đã giao"

### Quan hệ:
```
DonHang (1) ←→ (1) DangKyChienDich (1) ←→ (1) ChienDich
                         ↓
                    (1) NguoiDung
                         ↓
                    (1) ThanhToan
                         ↓
                    (1) BangGiaBacThang
```

---

## 🎯 TÍNH NĂNG ĐÃ HOÀN THÀNH

✅ Load đơn hàng từ API theo user
✅ Hiển thị thông tin đầy đủ: chiến dịch, sản phẩm, giá, trạng thái
✅ Progress bar giao hàng 3 bước
✅ Filter theo trạng thái (Tất cả / Thành công / Thất bại)
✅ Sub-filter cho đơn thành công (Đang chuẩn bị / Đang giao / Đã giao)
✅ Empty state khi không có đơn hàng
✅ Lazy loading (chỉ load khi click vào tab)
✅ Hiển thị ảnh chiến dịch từ backend
✅ Tính toán đúng: Đã thanh toán - Hoàn lại = Thực trả

---

## 🚀 NEXT STEPS (Tùy chọn)

- [ ] Trang chi tiết đơn hàng (`order-detail.html`)
- [ ] Tính năng đánh giá sản phẩm
- [ ] Tracking giao hàng real-time
- [ ] Export đơn hàng PDF
- [ ] Thông báo khi đơn hàng thay đổi trạng thái

---

## 📝 LƯU Ý

1. **DonHang chỉ tồn tại khi chiến dịch thành công**
   - Nếu chiến dịch thất bại → không có DonHang
   - Nếu user hủy đăng ký → không có DonHang

2. **Trạng thái giao hàng**
   - "Đang chuẩn bị" - Mới tạo đơn
   - "Đang giao" - Đang vận chuyển
   - "Đã giao" - Hoàn thành

3. **Tính toán giá**
   - `giaChotCuoiCung`: Giá cuối cùng sau khi chiến dịch kết thúc
   - `soTienHoanLai`: Số tiền hoàn lại (nếu giá giảm)
   - `Thực trả = soTienThanhToan - soTienHoanLai`

---

**Chúc test thành công! 🎉**
