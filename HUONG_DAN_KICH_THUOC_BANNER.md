# 📐 HƯỚNG DẪN KÍCH THƯỚC BANNER - EXED WEBSITE

> Tài liệu hướng dẫn kích thước ảnh banner hero section cho website EXED

---

## 🎯 PHÂN TÍCH HIỆN TẠI

### Thông số CSS hiện tại:
```css
.hero {
    min-height: 500px;
    background-size: contain;
    background-position: center;
}
```

### Vấn đề nhận ra:
- ⚠️ `background-size: contain` → Ảnh bị co lại, không phủ kín toàn bộ banner
- ⚠️ Tỷ lệ ảnh hiện tại: **Landscape (ngang)** nhưng không phù hợp với `contain`

---

## ✅ KÍCH THƯỚC ẢNH ĐỀ XUẤT

### 📏 Kích thước tối ưu:

#### **Phương án 1: Full HD (ƯU TIÊN)**
```
Kích thước: 1920 × 600 pixels
Tỷ lệ: 16:5
Format: JPG hoặc WebP
Dung lượng: < 300KB (tối ưu hóa)
DPI: 72 (web)
```

**✅ Ưu điểm:**
- Phù hợp với màn hình desktop phổ biến (1920px)
- Chiều cao 600px đủ để hiển thị banner đầy đủ
- Kích thước file nhẹ, load nhanh

#### **Phương án 2: 2K (CHO MÀNG HÌNH LỚN)**
```
Kích thước: 2560 × 800 pixels
Tỷ lệ: 16:5
Format: JPG hoặc WebP
Dung lượng: < 500KB
DPI: 72
```

**✅ Ưu điểm:**
- Sắc nét trên màn hình 2K/4K
- Không bị mờ khi zoom
- Chuyên nghiệp

#### **Phương án 3: Responsive (ĐA THIẾT BỊ)**

**Desktop:**
```
1920 × 600 pixels (tỷ lệ 16:5)
```

**Tablet:**
```
1200 × 500 pixels (tỷ lệ 12:5)
```

**Mobile:**
```
750 × 800 pixels (tỷ lệ 15:16) - Vertical
```

---

## 🎨 THÔNG SỐ THIẾT KẾ

### Vùng an toàn (Safe Zone):

```
┌─────────────────────────────────────────────┐
│ ← 200px →           BANNER           ← 200px →│
│                                               │
│     ↑          [ROSÉ X EXED]         ↑       │
│   100px        [Tham gia ngay]      100px    │
│     ↓     [Chỉ với 500.000 đ]       ↓       │
│                                               │
│ ← ─ ─ ─ ─  Vùng an toàn nội dung ─ ─ ─ ─ → │
└─────────────────────────────────────────────┘
```

**Quy tắc:**
- ✅ Nội dung quan trọng: Cách mép trái/phải **200px**, trên/dưới **100px**
- ✅ Chủ thể chính (người mẫu): Đặt ở **1/3 bên phải** hoặc **giữa**
- ✅ Text/CTA: Đặt ở **1/3 bên trái** để không bị che

---

## 🖼️ TỶ LỆ KHUNG HÌNH PHỔ BIẾN

### So sánh các tỷ lệ:

| Tỷ lệ | Kích thước (px) | Phù hợp | Đánh giá |
|-------|----------------|---------|----------|
| **16:9** | 1920 × 1080 | ❌ Không | Quá cao cho banner |
| **16:5** | 1920 × 600 | ✅ **TỐT NHẤT** | Chuẩn cho hero banner |
| **21:9** | 1920 × 823 | ⚠️ Tạm được | Hơi cao |
| **3:1** | 1920 × 640 | ✅ Tốt | Gần giống 16:5 |
| **2:1** | 1920 × 960 | ❌ Không | Quá cao |

### ⭐ Lý do chọn 16:5:
1. Tỷ lệ chuẩn cho banner website
2. Đủ không gian cho text và hình ảnh
3. Không bị cao quá (không chiếm hết màn hình)
4. Phù hợp với `min-height: 500px` trong CSS

---

## 🔧 CÁCH SỬA CSS ĐỂ ẢNH VỪA ĐẸP

### Hiện tại (LỖI):
```css
.hero {
    background-size: contain;  /* ← ẢNH BỊ CO LẠI */
}
```

### Sửa thành (ĐÚNG):
```css
.hero {
    background-size: cover;    /* ← ẢNH PHỦ KÍN TOÀN BỘ */
    background-position: center center;
    min-height: 600px;         /* Tăng từ 500px → 600px */
    background-repeat: no-repeat;
}
```

### Hoặc tốt hơn (RESPONSIVE):
```css
.hero {
    background-size: cover;
    background-position: center center;
    height: 600px;             /* Chiều cao cố định */
    background-repeat: no-repeat;
}

/* Tablet */
@media (max-width: 1024px) {
    .hero {
        height: 500px;
    }
}

/* Mobile */
@media (max-width: 768px) {
    .hero {
        height: 400px;
        background-position: 70% center; /* Dịch sang phải để thấy người mẫu */
    }
}
```

---

## 📸 HƯỚNG DẪN CHỤP/THIẾT KẾ ẢNH

### 1. Composition (Bố cục):

```
┌─────────────────────────────────────────┐
│                                         │
│  TEXT CONTENT        │      MODEL      │
│   (Bên trái)         │    (Bên phải)   │
│                      │                 │
│  [Logo/Title]        │    [Hình ảnh    │
│  [Button]            │     nghệ sĩ     │
│  [Price]             │     + giày]     │
│                      │                 │
└─────────────────────────────────────────┘
     40% width              60% width
```

### 2. Điểm nhấn (Focal Points):

**Cấu trúc "Rule of Thirds":**
```
┌───────┬───────┬───────┐
│       │       │   X   │ ← Đặt mắt người mẫu ở đây
├───────┼───────┼───────┤
│   O   │       │   X   │ ← O = Text, X = Model
├───────┼───────┼───────┤
│       │       │       │
└───────┴───────┴───────┘
```

### 3. Yếu tố cần có:

✅ **Phải có:**
- Người mẫu/nghệ sĩ rõ nét
- Sản phẩm (giày) nổi bật
- Background đẹp, có độ sâu
- Ánh sáng tốt

✅ **Nên có:**
- Gradient overlay (để text dễ đọc)
- Logo/watermark nhỏ ở góc
- Màu sắc nhất quán với brand

❌ **Không nên:**
- Ảnh mờ, blur
- Quá tối hoặc quá sáng
- Text bị che khuất
- Nội dung quan trọng bị cắt

---

## 🎨 TỐI ƯU HÓA MÀU SẮC

### Gradient Overlay (để text dễ đọc):

```css
.hero {
    background: 
        linear-gradient(
            to right, 
            rgba(95, 7, 4, 0.7) 0%,     /* Tối bên trái */
            rgba(95, 7, 4, 0.3) 50%,    /* Nhạt giữa */
            rgba(0, 0, 0, 0.1) 100%     /* Gần trong suốt bên phải */
        ), 
        url('../images/banner.jpg');
}
```

### Độ tương phản:

| Vùng | Độ tối overlay | Lý do |
|------|----------------|-------|
| **Trái** (Text) | 60-70% | Tối để text trắng dễ đọc |
| **Giữa** | 30-40% | Chuyển tiếp tự nhiên |
| **Phải** (Model) | 0-20% | Trong suốt để thấy người mẫu |

---

## 📦 FORMAT & NÉN ẢNH

### Định dạng đề xuất:

| Format | Ưu điểm | Nhược điểm | Đề xuất |
|--------|---------|------------|---------|
| **WebP** | Nhẹ nhất (30-50% nhỏ hơn JPG) | Không hỗ trợ IE | ✅ **Dùng chính** |
| **JPG** | Phổ biến, hỗ trợ tốt | Kém chất lượng khi nén | ✅ Fallback |
| **PNG** | Trong suốt, chất lượng cao | Nặng (2-3x JPG) | ❌ Không nên |

### Cách nén:

1. **Online tools:**
   - TinyPNG: https://tinypng.com/
   - Squoosh: https://squoosh.app/
   - CompressJPEG: https://compressjpeg.com/

2. **Mục tiêu:**
   ```
   Kích thước gốc: 1920×600
   Dung lượng:     < 300KB (JPG)
                   < 200KB (WebP)
   Chất lượng:     80-85%
   ```

3. **Responsive images (HTML):**
```html
<picture>
    <source srcset="banner-desktop.webp" media="(min-width: 1200px)" type="image/webp">
    <source srcset="banner-tablet.webp" media="(min-width: 768px)" type="image/webp">
    <source srcset="banner-mobile.webp" media="(max-width: 767px)" type="image/webp">
    <img src="banner-desktop.jpg" alt="ROSÉ X EXED">
</picture>
```

---

## 🛠️ CÔNG CỤ THIẾT KẾ

### 1. Photoshop:
```
File > New
Width:  1920 px
Height: 600 px
Resolution: 72 DPI
Color Mode: RGB
```

### 2. Figma/Canva:
- Tạo frame: **1920 × 600**
- Xuất: JPG 85% hoặc PNG
- Sau đó nén bằng TinyPNG

### 3. Online:
- **Canva Pro**: Template banner 1920×600
- **Remove.bg**: Xóa background người mẫu
- **Photopea**: Edit online miễn phí

---

## ✅ CHECKLIST TRƯỚC KHI UPLOAD

### Kiểm tra kỹ thuật:
- [ ] Kích thước: **1920 × 600 px** (hoặc 2560×800)
- [ ] Format: **WebP + JPG** (fallback)
- [ ] Dung lượng: **< 300KB**
- [ ] DPI: **72**
- [ ] Color mode: **RGB**

### Kiểm tra nội dung:
- [ ] Người mẫu/sản phẩm rõ nét
- [ ] Text không bị che
- [ ] Màu sắc nhất quán với brand
- [ ] Có gradient overlay (nếu cần)

### Kiểm tra hiển thị:
- [ ] Desktop (1920px): ✅ Đẹp
- [ ] Laptop (1366px): ✅ Không bị cắt
- [ ] Tablet (768px): ✅ Text đọc được
- [ ] Mobile (375px): ✅ Chủ thể nổi bật

---

## 🎯 KẾT LUẬN & ĐỀ XUẤT

### 🏆 GIẢI PHÁP TỐI ƯU NHẤT:

```
📐 Kích thước:     1920 × 600 pixels (16:5)
📦 Format:         WebP (chính) + JPG (backup)
💾 Dung lượng:     < 300KB
🎨 Chất lượng:     85%
📍 Vùng an toàn:   200px trái/phải, 100px trên/dưới
```

### 🔧 CSS cần sửa:

**File:** `d:\SPKT_Files\TMDT\WEB\GiaodienWeb\css\styles.css`

**Đổi từ:**
```css
background-size: contain;
min-height: 500px;
```

**Thành:**
```css
background-size: cover;
height: 600px;
```

### 📋 Action items:

1. ✅ Chuẩn bị ảnh **1920×600px**
2. ✅ Nén ảnh < 300KB
3. ✅ Sửa CSS `contain` → `cover`
4. ✅ Test trên nhiều thiết bị
5. ✅ Tối ưu hóa thêm cho mobile

---

## 📞 HỖ TRỢ

Nếu cần hỗ trợ thêm về thiết kế banner:
- 📧 Email: design@exed.com
- 💬 Slack: #design-team

---

**📅 Cập nhật:** 05/06/2026  
**👨‍💻 Tác giả:** EXED Design Team  
**🔄 Version:** 1.0.0
