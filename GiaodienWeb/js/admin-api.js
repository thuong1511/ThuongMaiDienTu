/**
 * Admin API - Kết nối tất cả các trang admin với BE
 * Base: http://localhost:8080/api/admin/
 */

const ADMIN_API_BASE = 'http://localhost:8080/api/admin';
const IMG_BASE = 'http://localhost:8080';  // BE serve ảnh qua /images/**

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

    // ── DASHBOARD ──────────────────────────────────────────────
    getDashboard() {
        return this._fetch(`${ADMIN_API_BASE}/dashboard`);
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
