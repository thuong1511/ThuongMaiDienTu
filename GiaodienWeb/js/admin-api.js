/**
 * Admin API - Kết nối tất cả các trang admin với BE
 * Base: http://localhost:8080/api/admin/
 */

const ADMIN_API_BASE = 'http://localhost:8080/api/admin';
const IMG_BASE = 'http://localhost:8080';  // BE serve ảnh qua /images/**

const ADMIN_CAMPAIGN_COVER_MAP = {
    CD001: '../images/coverCampaignRose.png',
    CD002: '../images/coverCampaignJen.png',
    CD003: '../images/coverCampaignLisa.png',
    CD004: '../images/coverCampaignJisoo.png',
    CD005: '../images/coverCampaignJiChangWook.png',
    CD006: '../images/coverCampaignParkBoGum.png',
    CD007: '../images/coverCampaignGoYounJung.png',
    CD008: '../images/coverCampaignKimJiWon.png',
    CD009: '../images/coverCampaignChuongNhuocNam.png',
    CD010: '../images/coverCampaignNamtan.png',
    CD011: '../images/coverCampaignMartin.png'
};

/** Trả về URL ảnh đầy đủ từ đường dẫn trong DB (vd: "images/avt_rose.jpg") */
function imgUrl(duongDan, fallback = '../images/banner.jpg') {
    if (!duongDan) return fallback;
    // Nếu đã là URL đầy đủ thì giữ nguyên
    if (duongDan.startsWith('http')) return duongDan;
    return `${IMG_BASE}/${duongDan}`;
}

/** Avatar nghệ sĩ — fallback theo tên nếu không có ảnh trong DB */
function avatarNgheSi(ns) {
    if (ns?.hinhAnhNgheSis?.[0]?.duongDan) {
        return imgUrl(ns.hinhAnhNgheSis[0].duongDan);
    }
    // Fallback map theo maNgheSi
    const map = {
        'NS001': '../images/avt_rose.jpg',
        'NS002': '../images/avt_lisa.jpg',
        'NS003': '../images/avt_jisoo.jpg',
        'NS004': '../images/avt_jen.jpg',
        'NS005': '../images/avt_jichangwook.jpg',
        'NS006': '../images/avt_parkbogum.jpg',
        'NS007': '../images/avt_goyounjung.jpg',
        'NS008': '../images/avt_kimjiwon.jpg',
        'NS009': '../images/avt_namtan.jpg',
        'NS010': '../images/avt_sieun.jpg',
        'NS011': '../images/avt_chuongnhuocnam.jpg',
        'NS012': '../images/avt_martin_cortis.jpg',
    };
    return map[ns?.maNgheSi] || '../images/rose.jpg';
}

/** Ảnh đầu tiên của chiến dịch */
function imgChienDich(cd) {
    if (ADMIN_CAMPAIGN_COVER_MAP[cd?.maChienDich]) {
        return ADMIN_CAMPAIGN_COVER_MAP[cd.maChienDich];
    }
    if (cd?.hinhAnhChienDichs?.[0]?.duongDan) {
        return imgUrl(cd.hinhAnhChienDichs[0].duongDan);
    }
    return '../images/banner.jpg';
}

/** Ảnh đầu tiên của sản phẩm */
function imgSanPham(sp) {
    if (sp?.hinhAnhSanPhams?.[0]?.duongDan) {
        return imgUrl(sp.hinhAnhSanPhams[0].duongDan);
    }
    return '../images/SPCDRose1.jpg';
}

const adminApi = {
    async _fetch(url, options = {}) {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        return res.json();
    },

    /** Upload file đơn (multipart). Trả {success, data:{duongDan, url}} */
    async uploadFile(file, folder = 'misc') {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${ADMIN_API_BASE}/upload?folder=${encodeURIComponent(folder)}`, {
            method: 'POST',
            body: fd
        });
        return res.json();
    },

    /** Upload nhiều file. Trả {success, data:[{duongDan,url}, ...]} */
    async uploadFiles(files, folder = 'misc') {
        const fd = new FormData();
        for (const f of files) fd.append('files', f);
        const res = await fetch(`${ADMIN_API_BASE}/upload/multi?folder=${encodeURIComponent(folder)}`, {
            method: 'POST',
            body: fd
        });
        return res.json();
    },

    // ── DASHBOARD ──────────────────────────────────────────────
    getDashboard() {
        return this._fetch(`${ADMIN_API_BASE}/dashboard`);
    },
    getDoanhThuTheoThang(soThang = 12) {
        return this._fetch(`${ADMIN_API_BASE}/dashboard/doanhthu?soThang=${soThang}`);
    },
    getTopChienDich(limit = 5) {
        return this._fetch(`${ADMIN_API_BASE}/dashboard/topchiendich?limit=${limit}`);
    },
    getDonHangGanDay(limit = 10) {
        return this._fetch(`${ADMIN_API_BASE}/dashboard/donhanggandayl?limit=${limit}`);
    },
    exportDashboardExcelUrl() {
        return `${ADMIN_API_BASE}/dashboard/export/excel`;
    },
    exportDashboardPdfUrl() {
        return `${ADMIN_API_BASE}/dashboard/export/pdf`;
    },

    // ── CHIẾN DỊCH ─────────────────────────────────────────────
    getAllChienDich() {
        return this._fetch(`${ADMIN_API_BASE}/chiendich`);
    },
    getChienDichById(id) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}`);
    },
    getChienDichByThoiDiem(thoiDiem) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/thoiDiem/${encodeURIComponent(thoiDiem)}`);
    },
    getDangKyByChienDich(id) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}/dangky`);
    },
    getThongKeChienDich(id) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}/thongke`);
    },
    createChienDich(data) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich`, { method: 'POST', body: JSON.stringify(data) });
    },
    updateChienDich(id, data) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    updateTrangThaiChienDich(id, thoiDiem, trangThai) {
        const params = new URLSearchParams();
        if (thoiDiem) params.append('thoiDiem', thoiDiem);
        if (trangThai) params.append('trangThai', trangThai);
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}/trangthai?${params}`, { method: 'PATCH' });
    },
    deleteChienDich(id) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}`, { method: 'DELETE' });
    },
    getNextMaChienDich() {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/next-id`);
    },
    getHinhAnhChienDich(id) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}/hinhanh`);
    },
    themHinhAnhChienDich(id, duongDan, thuTu = 1) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}/hinhanh`, {
            method: 'POST',
            body: JSON.stringify({ duongDan, thuTu })
        });
    },
    capNhatThuTuHinhAnhChienDich(id, maHinhAnh, thuTu) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}/hinhanh/${maHinhAnh}`, {
            method: 'PUT',
            body: JSON.stringify({ thuTu })
        });
    },
    xoaHinhAnhChienDich(id, maHinhAnh) {
        return this._fetch(`${ADMIN_API_BASE}/chiendich/${id}/hinhanh/${maHinhAnh}`, { method: 'DELETE' });
    },

    // ── KHÁCH HÀNG ─────────────────────────────────────────────
    getAllKhachHang() {
        return this._fetch(`${ADMIN_API_BASE}/khachhang`);
    },
    getKhachHangByVaiTro(vaiTro) {
        return this._fetch(`${ADMIN_API_BASE}/khachhang/vaitro/${encodeURIComponent(vaiTro)}`);
    },
    getKhachHangById(id) {
        return this._fetch(`${ADMIN_API_BASE}/khachhang/${id}`);
    },
    getLichSuDangKy(id) {
        return this._fetch(`${ADMIN_API_BASE}/khachhang/${id}/lichsu`);
    },
    getThongKeKhachHang(id) {
        return this._fetch(`${ADMIN_API_BASE}/khachhang/${id}/thongke`);
    },
    getDiaChiKhachHang(id) {
        return this._fetch(`${ADMIN_API_BASE}/khachhang/${id}/diachi`);
    },
    updateKhachHang(id, data) {
        return this._fetch(`${ADMIN_API_BASE}/khachhang/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    toggleTrangThaiKhachHang(id) {
        return this._fetch(`${ADMIN_API_BASE}/khachhang/${id}/toggle`, { method: 'PATCH' });
    },

    // ── ĐƠN HÀNG ───────────────────────────────────────────────
    getAllDonHang() {
        return this._fetch(`${ADMIN_API_BASE}/donhang`);
    },
    getDonHangById(id) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/${id}`);
    },
    getChiTietDonHang(id) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/${id}/chitiet`);
    },
    getDonHangByKhachHang(maNguoiDung) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/khachhang/${maNguoiDung}`);
    },
    getDonHangByChienDich(maChienDich) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/chiendich/${maChienDich}`);
    },
    thongKeDonHangChienDich(maChienDich) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/chiendich/${maChienDich}/thongke`);
    },
    huyDonHang(id) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/${id}/huy`, { method: 'PATCH' });
    },
    xacNhanHoanTien(id) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/${id}/hoantien`, { method: 'PATCH' });
    },
    // Giao hàng
    getGiaoHangByDangKy(id) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/${id}/giaohang`);
    },
    getGiaoHangById(maDonHang) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/giaohang/${maDonHang}`);
    },
    getAllGiaoHang() {
        return this._fetch(`${ADMIN_API_BASE}/donhang/giaohang`);
    },
    taoPhieuGiao(maDangKy, body = {}) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/${maDangKy}/giaohang`, {
            method: 'POST',
            body: JSON.stringify(body || {})
        });
    },
    capNhatTrangThaiGiao(maDonHang, trangThai) {
        return this._fetch(`${ADMIN_API_BASE}/donhang/giaohang/${maDonHang}/trangthai`, {
            method: 'PATCH',
            body: JSON.stringify({ trangThai })
        });
    },
    exportDonHangExcelUrl() {
        return `${ADMIN_API_BASE}/donhang/export/excel`;
    },

    // ── NGHỆ SĨ ────────────────────────────────────────────────
    getAllNgheSi() {
        return this._fetch(`${ADMIN_API_BASE}/nghesi`);
    },
    getNgheSiById(id) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/${id}`);
    },
    createNgheSi(data) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi`, { method: 'POST', body: JSON.stringify(data) });
    },
    updateNgheSi(id, data) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deleteNgheSi(id) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/${id}`, { method: 'DELETE' });
    },
    getNextMaNgheSi() {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/next-id`);
    },
    getThongKeNgheSi(id) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/${id}/thongke`);
    },
    getChienDichByNgheSi(id) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/${id}/chiendich`);
    },
    getHinhAnhNgheSi(id) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/${id}/hinhanh`);
    },
    themHinhAnhNgheSi(id, duongDan, thuTu = 1) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/${id}/hinhanh`, {
            method: 'POST', body: JSON.stringify({ duongDan, thuTu })
        });
    },
    xoaHinhAnhNgheSi(id, maHinhAnh) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/${id}/hinhanh/${maHinhAnh}`, { method: 'DELETE' });
    },
    capNhatAnhDaiDienNgheSi(id, duongDan) {
        return this._fetch(`${ADMIN_API_BASE}/nghesi/${id}/anh-dai-dien`, {
            method: 'PUT', body: JSON.stringify({ duongDan })
        });
    },

    // ── SẢN PHẨM ───────────────────────────────────────────────
    getAllSanPham() {
        return this._fetch(`${ADMIN_API_BASE}/sanpham`);
    },
    getSanPhamById(id) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}`);
    },
    getSanPhamByDanhMuc(maDanhMuc) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/danhmuc/${maDanhMuc}`);
    },
    deleteSanPham(id) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}`, { method: 'DELETE' });
    },
    createSanPham(data) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham`, { method: 'POST', body: JSON.stringify(data) });
    },
    updateSanPham(id, data) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    getNextMaSanPham() {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/next-id`);
    },
    getThongKeSanPham(id) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/thongke`);
    },
    getChienDichDungSP(id) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/chiendich`);
    },
    // Ảnh sản phẩm
    getHinhAnhSanPham(id) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/hinhanh`);
    },
    themHinhAnhSanPham(id, duongDan, thuTu = 1) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/hinhanh`, {
            method: 'POST', body: JSON.stringify({ duongDan, thuTu })
        });
    },
    capNhatThuTuHinhAnhSanPham(id, maHinhAnh, thuTu) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/hinhanh/${maHinhAnh}`, {
            method: 'PUT', body: JSON.stringify({ thuTu })
        });
    },
    xoaHinhAnhSanPham(id, maHinhAnh) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/hinhanh/${maHinhAnh}`, { method: 'DELETE' });
    },
    // Màu của SP
    getMauSacSanPham(id) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/mausac`);
    },
    themMauSacSanPham(id, maMau, soLuongToiDa) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/mausac`, {
            method: 'POST', body: JSON.stringify({ maMau, soLuongToiDa })
        });
    },
    capNhatMauSacSanPham(id, maMau, soLuongToiDa) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/mausac/${maMau}`, {
            method: 'PUT', body: JSON.stringify({ soLuongToiDa })
        });
    },
    xoaMauSacSanPham(id, maMau) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/mausac/${maMau}`, { method: 'DELETE' });
    },
    // Size của SP
    getKichThuocSanPham(id) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/kichthuoc`);
    },
    themKichThuocSanPham(id, maSize) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/kichthuoc`, {
            method: 'POST', body: JSON.stringify({ maSize })
        });
    },
    xoaKichThuocSanPham(id, maSize) {
        return this._fetch(`${ADMIN_API_BASE}/sanpham/${id}/kichthuoc/${maSize}`, { method: 'DELETE' });
    },

    // ── MASTER DATA: MÀU & SIZE ────────────────────────────────
    getAllMauSac() {
        return this._fetch(`${ADMIN_API_BASE}/mausac`);
    },
    createMauSac(tenMau, maHexa = '#000000') {
        return this._fetch(`${ADMIN_API_BASE}/mausac`, {
            method: 'POST', body: JSON.stringify({ tenMau, maHexa })
        });
    },
    updateMauSac(maMau, tenMau, maHexa) {
        const body = { tenMau };
        if (maHexa) body.maHexa = maHexa;
        return this._fetch(`${ADMIN_API_BASE}/mausac/${maMau}`, {
            method: 'PUT', body: JSON.stringify(body)
        });
    },
    deleteMauSac(maMau) {
        return this._fetch(`${ADMIN_API_BASE}/mausac/${maMau}`, { method: 'DELETE' });
    },
    getAllKichThuoc() {
        return this._fetch(`${ADMIN_API_BASE}/kichthuoc`);
    },
    getKichThuocByLoai(loai) {
        return this._fetch(`${ADMIN_API_BASE}/kichthuoc/loai/${encodeURIComponent(loai)}`);
    },
    createKichThuoc(tenSize, loaiKichThuoc) {
        return this._fetch(`${ADMIN_API_BASE}/kichthuoc`, {
            method: 'POST', body: JSON.stringify({ tenSize, loaiKichThuoc })
        });
    },
    deleteKichThuoc(maSize) {
        return this._fetch(`${ADMIN_API_BASE}/kichthuoc/${maSize}`, { method: 'DELETE' });
    },

    // ── DANH MỤC (public API) ───────────────────────────────────
    getAllDanhMuc() {
        return this._fetch(`http://localhost:8080/api/danhmuc`);
    },

    // ── CẤU HÌNH HỆ THỐNG ───────────────────────────────────────
    getCauHinh() {
        return this._fetch(`${ADMIN_API_BASE}/cauhinh`);
    },
    getCauHinhAll() {
        return this._fetch(`${ADMIN_API_BASE}/cauhinh/all`);
    },
    getCauHinhByNhom(nhom) {
        return this._fetch(`${ADMIN_API_BASE}/cauhinh/nhom/${encodeURIComponent(nhom)}`);
    },
    capNhatCauHinh(body) {
        return this._fetch(`${ADMIN_API_BASE}/cauhinh`, {
            method: 'PUT', body: JSON.stringify(body)
        });
    },
    doiMatKhauAdmin(maNguoiDung, matKhauCu, matKhauMoi, xacNhanMatKhauMoi) {
        return this._fetch(`${ADMIN_API_BASE}/cauhinh/password`, {
            method: 'PATCH',
            body: JSON.stringify({ maNguoiDung, matKhauCu, matKhauMoi, xacNhanMatKhauMoi })
        });
    },
    getAllBanner() {
        return this._fetch(`${ADMIN_API_BASE}/cauhinh/banner`);
    },
    themBanner(body) {
        return this._fetch(`${ADMIN_API_BASE}/cauhinh/banner`, {
            method: 'POST', body: JSON.stringify(body)
        });
    },
    capNhatBanner(id, body) {
        return this._fetch(`${ADMIN_API_BASE}/cauhinh/banner/${id}`, {
            method: 'PUT', body: JSON.stringify(body)
        });
    },
    xoaBanner(id) {
        return this._fetch(`${ADMIN_API_BASE}/cauhinh/banner/${id}`, { method: 'DELETE' });
    },

    // ── THÔNG BÁO ──────────────────────────────────────────────
    getAllThongBao() {
        return this._fetch(`${ADMIN_API_BASE}/thongbao`);
    },
    getThongBaoCuaToi(maNguoiDung) {
        return this._fetch(`${ADMIN_API_BASE}/thongbao/cua-toi?maNguoiDung=${encodeURIComponent(maNguoiDung)}`);
    },
    countThongBaoChuaDoc(maNguoiDung) {
        return this._fetch(`${ADMIN_API_BASE}/thongbao/cua-toi/count?maNguoiDung=${encodeURIComponent(maNguoiDung)}`);
    },
    guiThongBao(body) {
        return this._fetch(`${ADMIN_API_BASE}/thongbao`, {
            method: 'POST', body: JSON.stringify(body)
        });
    },
    markReadThongBao(id) {
        return this._fetch(`${ADMIN_API_BASE}/thongbao/${id}/read`, { method: 'PATCH' });
    },
    markAllReadThongBao(maNguoiDung) {
        return this._fetch(`${ADMIN_API_BASE}/thongbao/cua-toi/read-all?maNguoiDung=${encodeURIComponent(maNguoiDung)}`, { method: 'PATCH' });
    },
    xoaThongBao(id) {
        return this._fetch(`${ADMIN_API_BASE}/thongbao/${id}`, { method: 'DELETE' });
    }
};

// ── HELPERS ────────────────────────────────────────────────────
function fmtMoney(n) {
    if (!n && n !== 0) return '—';
    return Number(n).toLocaleString('vi-VN') + ' đ';
}

function fmtDate(str) {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleDateString('vi-VN');
}

function fmtDateTime(str) {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleString('vi-VN');
}

function thoiDiemBadge(thoiDiem) {
    const map = {
        'Đang diễn ra': 'ongoing',
        'Sắp bắt đầu': 'pending',
        'Đã kết thúc': 'success',
        'Thất bại': 'failed'
    };
    return `<span class="status-badge ${map[thoiDiem] || 'pending'}">${thoiDiem || '—'}</span>`;
}

function trangThaiBadge(trangThai) {
    if (!trangThai) return '<span class="status-badge pending">—</span>';
    const cls = trangThai === 'Hoạt động' ? 'success' : 'failed';
    return `<span class="status-badge ${cls}">${trangThai}</span>`;
}

function showToast(msg, type = 'success') {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.style.cssText = `
            position:fixed;bottom:24px;right:24px;z-index:9999;
            padding:12px 20px;border-radius:8px;font-weight:600;
            font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,.15);
            transition:opacity .3s;
        `;
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.color = '#fff';
    toast.style.opacity = '1';
    toast.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

window.adminApi = adminApi;
window.fmtMoney = fmtMoney;
window.fmtDate = fmtDate;
window.fmtDateTime = fmtDateTime;
window.thoiDiemBadge = thoiDiemBadge;
window.trangThaiBadge = trangThaiBadge;
window.showToast = showToast;

// ────────────────────────────────────────────────────────────
// HEADER ADMIN: Icon chuông + dropdown thông báo + auto-bind tên admin
// Chỉ cần gọi initAdminHeader() trong DOMContentLoaded của mọi trang admin
// ────────────────────────────────────────────────────────────
async function initAdminHeader() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Cập nhật tên admin
    const profileSpan = document.querySelector('.admin-profile span');
    if (profileSpan && user.tenDangNhap) profileSpan.textContent = user.tenDangNhap;

    // Toggle profile dropdown
    const adminProfile = document.querySelector('.admin-profile');
    if (adminProfile) {
        adminProfile.addEventListener('click', e => { e.stopPropagation(); adminProfile.classList.toggle('active'); });
    }

    // Bind icon chuông
    const bell = document.querySelector('.notification-btn');
    if (!bell) return;
    if (!user.maNguoiDung) {
        // Chưa đăng nhập → ẩn badge, click không làm gì
        const badge = bell.querySelector('.badge');
        if (badge) badge.style.display = 'none';
        return;
    }

    // Tạo panel dropdown nếu chưa có
    let panel = document.getElementById('admin-bell-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'admin-bell-panel';
        panel.style.cssText = `
            position:absolute;top:60px;right:80px;width:380px;max-height:480px;overflow:auto;
            background:#fff;border:1px solid #e5e5e5;border-radius:10px;
            box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:9998;display:none;
        `;
        document.body.appendChild(panel);
    }

    // Click chuông → toggle
    bell.style.position = 'relative';
    bell.addEventListener('click', async e => {
        e.stopPropagation();
        if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
        await renderBellPanel(user.maNguoiDung);
        panel.style.display = 'block';
    });

    // Click outside → ẩn
    document.addEventListener('click', e => {
        if (!panel.contains(e.target) && !bell.contains(e.target)) {
            panel.style.display = 'none';
        }
        if (adminProfile && !adminProfile.contains(e.target)) {
            adminProfile.classList.remove('active');
        }
    });

    // Lần đầu cập nhật badge số
    updateBellBadge(user.maNguoiDung);
    // Cập nhật mỗi 60s
    setInterval(() => updateBellBadge(user.maNguoiDung), 60000);
}

async function updateBellBadge(maNguoiDung) {
    try {
        const r = await adminApi.countThongBaoChuaDoc(maNguoiDung);
        if (!r.success) return;
        const badge = document.querySelector('.notification-btn .badge');
        const n = Number(r.data) || 0;
        if (badge) {
            if (n > 0) {
                badge.textContent = n > 99 ? '99+' : n;
                badge.style.display = '';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (_) {}
}

async function renderBellPanel(maNguoiDung) {
    const panel = document.getElementById('admin-bell-panel');
    panel.innerHTML = `
        <div style="padding:14px 16px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
            <strong>Thông báo</strong>
            <button id="bell-mark-all" style="background:none;border:none;color:#c8a96a;cursor:pointer;font-size:13px;">Đánh dấu đã đọc tất cả</button>
        </div>
        <div id="bell-list" style="padding:8px;">
            <p style="text-align:center;padding:20px;color:#888;">Đang tải...</p>
        </div>
    `;
    try {
        const r = await adminApi.getThongBaoCuaToi(maNguoiDung);
        const list = (r.success && r.data) || [];
        const wrap = document.getElementById('bell-list');
        if (!list.length) {
            wrap.innerHTML = '<p style="text-align:center;padding:30px;color:#888;">Chưa có thông báo</p>';
        } else {
            wrap.innerHTML = list.map(tb => {
                const bg = tb.daDoc ? '#fff' : 'rgba(200,169,106,0.08)';
                return `<div data-id="${tb.maThongBao}" style="padding:10px 12px;border-radius:8px;background:${bg};margin-bottom:6px;cursor:pointer;">
                    <div style="display:flex;justify-content:space-between;gap:8px;">
                        <strong style="font-size:13px;">${escapeHtml(tb.tieuDe || '')}</strong>
                        <span style="font-size:11px;color:#888;">${fmtDateTime(tb.ngayTao)}</span>
                    </div>
                    <p style="margin:4px 0 0;font-size:12px;color:#555;">${escapeHtml(tb.noiDung || '')}</p>
                </div>`;
            }).join('');
            // Click 1 thông báo → mark read
            wrap.querySelectorAll('[data-id]').forEach(el => {
                el.addEventListener('click', async () => {
                    const id = el.dataset.id;
                    await adminApi.markReadThongBao(id);
                    el.style.background = '#fff';
                    updateBellBadge(maNguoiDung);
                });
            });
        }
    } catch (e) {
        document.getElementById('bell-list').innerHTML =
            `<p style="text-align:center;padding:20px;color:red;">Lỗi: ${e.message}</p>`;
    }

    document.getElementById('bell-mark-all').addEventListener('click', async () => {
        const r = await adminApi.markAllReadThongBao(maNguoiDung);
        if (r.success) { showToast('Đã đánh dấu đã đọc'); await renderBellPanel(maNguoiDung); updateBellBadge(maNguoiDung); }
    });
}

function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

window.initAdminHeader = initAdminHeader;

