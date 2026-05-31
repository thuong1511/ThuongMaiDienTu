package com.exed.be.service;

import com.exed.be.dto.DangKyChienDichRequest;
import com.exed.be.model.*;
import com.exed.be.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class DangKyChienDichService {
    
    @Autowired
    private DangKyChienDichRepository dangKyChienDichRepository;
    
    @Autowired
    private ThanhToanRepository thanhToanRepository;
    
    @Autowired
    private BangGiaBacThangRepository bangGiaBacThangRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @Autowired
    private ChienDichRepository chienDichRepository;
    
    @Autowired
    private PhieuChiTietDangKyRepository phieuChiTietDangKyRepository;
    
    @Autowired
    private SanPhamMauSacRepository sanPhamMauSacRepository;
    
    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private WalletTransactionRepository walletTransactionRepository;
    
    @Autowired
    private ThongBaoRepository thongBaoRepository;
    
    public List<DangKyChienDich> getAllDangKy() {
        return dangKyChienDichRepository.findAll();
    }
    
    public Optional<DangKyChienDich> getDangKyById(Integer maDangKy) {
        return dangKyChienDichRepository.findById(maDangKy);
    }
    
    public List<DangKyChienDich> getDangKyByNguoiDung(String maNguoiDung) {
        return dangKyChienDichRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
    }
    
    public List<DangKyChienDich> getDangKyByChienDich(String maChienDich) {
        return dangKyChienDichRepository.findByChienDich_MaChienDich(maChienDich);
    }
    
    @org.springframework.transaction.annotation.Transactional
    public DangKyChienDich createDangKy(DangKyChienDichRequest request) {
        // Validate thanh toán
        Optional<ThanhToan> thanhToan = thanhToanRepository.findById(request.getMaThanhToan());
        if (!thanhToan.isPresent()) {
            throw new RuntimeException("Thanh toán không tồn tại");
        }
        
        // Validate bảng giá
        Optional<BangGiaBacThang> bangGia = bangGiaBacThangRepository.findById(request.getMaMucGia());
        if (!bangGia.isPresent()) {
            throw new RuntimeException("Mức giá không tồn tại");
        }
        
        // Validate người dùng
        Optional<NguoiDung> nguoiDung = nguoiDungRepository.findById(request.getMaNguoiDung());
        if (!nguoiDung.isPresent()) {
            throw new RuntimeException("Người dùng không tồn tại");
        }
        
        // Validate chiến dịch
        Optional<ChienDich> chienDichOpt = chienDichRepository.findById(request.getMaChienDich());
        if (!chienDichOpt.isPresent()) {
            throw new RuntimeException("Chiến dịch không tồn tại");
        }
        ChienDich chienDich = chienDichOpt.get();
        
        // Validate số lượng (1-2)
        if (request.getTongSoLuong() < 1 ) {
            throw new RuntimeException("Số lượng phải từ 1 sản phẩm trở lên");
        }
        
        // --- XỬ LÝ KHÔNG GIỚI HẠN / HOÀN TIỀN DƯ CHIẾN DỊCH ---
        int currentQty = chienDich.getTongSoLuongHienTai() != null ? chienDich.getTongSoLuongHienTai() : 0;
        int maxQty = chienDich.getNguongToiDa() != null ? chienDich.getNguongToiDa() : 999999;
        int remaining = Math.max(0, maxQty - currentQty);
        
        int requestedQty = request.getTongSoLuong();
        int approvedQty = requestedQty;
        int excessQty = 0;
        
        if (requestedQty > remaining) {
            if (remaining <= 0) {
                // Hoàn lại 100% tiền đã thanh toán vào ví và báo lỗi
                BigDecimal fullRefund = thanhToan.get().getSoTienThanhToan();
                refundToWallet(request.getMaNguoiDung(), fullRefund, "Hoàn tiền 100% - Chiến dịch '" + chienDich.getTenChienDich() + "' đã đạt giới hạn tối đa");
                
                // Gửi thông báo
                guiThongBaoHeThong(request.getMaNguoiDung(), 
                    "Đăng ký thất bại - Chiến dịch đã đầy", 
                    "Rất tiếc! Chiến dịch '" + chienDich.getTenChienDich() + "' đã đạt giới hạn tối đa số lượng sản phẩm đăng ký (" + maxQty + "). Số tiền " + fullRefund.longValue() + " đ đã được hoàn trả toàn bộ vào ví EXED của bạn.");
                
                throw new RuntimeException("Chiến dịch đã đạt giới hạn tối đa số lượng sản phẩm. Số tiền của bạn đã được hoàn trả vào ví EXED.");
            } else {
                approvedQty = remaining;
                excessQty = requestedQty - remaining;
                
                // Tính số tiền hoàn lại cho số sản phẩm dư
                BigDecimal unitPrice = chienDich.getGiaGoc() != null ? chienDich.getGiaGoc() : BigDecimal.ZERO;
                BigDecimal excessRefund = unitPrice.multiply(new BigDecimal(excessQty));
                
                // Hoàn tiền dư vào ví
                refundToWallet(request.getMaNguoiDung(), excessRefund, "Hoàn tiền số lượng sản phẩm dư (" + excessQty + " sp) - Chiến dịch '" + chienDich.getTenChienDich() + "'");
                
                // Cập nhật số tiền thực nhận trong ThanhToan
                ThanhToan tt = thanhToan.get();
                BigDecimal originalAmount = tt.getSoTienThanhToan();
                tt.setSoTienThanhToan(originalAmount.subtract(excessRefund));
                tt.setGhiChu((tt.getGhiChu() != null ? tt.getGhiChu() : "") + " (Đã hoàn lại " + excessRefund.longValue() + " đ cho " + excessQty + " sản phẩm vượt giới hạn)");
                thanhToanRepository.save(tt);
                
                // Gửi thông báo
                guiThongBaoHeThong(request.getMaNguoiDung(), 
                    "Đăng ký thành công - Điều chỉnh số lượng sản phẩm", 
                    "Chúc mừng! Bạn đã đăng ký thành công chiến dịch '" + chienDich.getTenChienDich() + "'. Do chiến dịch đã đạt ngưỡng tối đa, đơn hàng của bạn được duyệt mua thực tế là " + approvedQty + " sản phẩm. Số tiền chênh lệch " + excessRefund.longValue() + " đ của " + excessQty + " sản phẩm dư đã được hoàn lại vào ví EXED của bạn.");
            }
        }
        
        DangKyChienDich dangKy = new DangKyChienDich();
        dangKy.setThanhToan(thanhToan.get());
        dangKy.setBangGiaBacThang(bangGia.get());
        dangKy.setNguoiDung(nguoiDung.get());
        dangKy.setChienDich(chienDich);
        dangKy.setTongSoLuong(approvedQty);
        
        DangKyChienDich saved = dangKyChienDichRepository.save(dangKy);
        
        // Sau khi lưu, trigger DB sẽ cập nhật tongSoLuongHienTai trong ChienDich.
        // Đọc lại ChienDich từ DB để lấy giá trị mới nhất.
        ChienDich chienDichUpdated = chienDichRepository.findById(request.getMaChienDich())
                .orElse(chienDich);
        
        int updatedQty = chienDichUpdated.getTongSoLuongHienTai() != null 
                ? chienDichUpdated.getTongSoLuongHienTai() : 0;
        int maxQtyCheck = chienDichUpdated.getNguongToiDa() != null 
                ? chienDichUpdated.getNguongToiDa() : 999999;
        
        // Nếu đã đạt ngưỡng tối đa hoặc hết hạn => cập nhật trạng thái chiến dịch
        boolean daDay = updatedQty >= maxQtyCheck;
        boolean daHetHan = chienDichUpdated.getNgayKetThuc() != null 
                && chienDichUpdated.getNgayKetThuc().isBefore(java.time.LocalDateTime.now());
        
        if ((daDay || daHetHan) && !"Đã kết thúc".equals(chienDichUpdated.getThoiDiem())) {
            chienDichUpdated.setThoiDiem("Đã kết thúc");
            int moq = chienDichUpdated.getNguongMOQ() != null ? chienDichUpdated.getNguongMOQ() : 0;
            if (updatedQty >= moq) {
                chienDichUpdated.setTrangThai("Thành công");
            } else {
                chienDichUpdated.setTrangThai("Thất bại");
            }
            chienDichRepository.save(chienDichUpdated);
        }
        
        return saved;
    }
    
    public DangKyChienDich huyDangKy(Integer maDangKy) {
        Optional<DangKyChienDich> existing = dangKyChienDichRepository.findById(maDangKy);
        if (existing.isPresent()) {
            DangKyChienDich dangKy = existing.get();
            
            // Get all PhieuChiTietDangKy for this registration
            List<PhieuChiTietDangKy> chiTiets = phieuChiTietDangKyRepository.findByDangKyChienDich_MaDangKy(maDangKy);
            
            // Decrease soLuongDaDat for each color
            for (PhieuChiTietDangKy chiTiet : chiTiets) {
                // Find SanPham_MauSac by product and color
                Optional<SanPhamMauSac> sanPhamMauSacOpt = sanPhamMauSacRepository
                    .findByMaSanPhamAndMaMau(
                        chiTiet.getSanPham().getMaSanPham(),
                        chiTiet.getMauSac().getMaMau()
                    );
                
                if (sanPhamMauSacOpt.isPresent()) {
                    SanPhamMauSac sanPhamMauSac = sanPhamMauSacOpt.get();
                    // Decrease soLuongDaDat by the quantity in this detail
                    int currentDaDat = sanPhamMauSac.getSoLuongDaDat() != null ? sanPhamMauSac.getSoLuongDaDat() : 0;
                    int newDaDat = Math.max(0, currentDaDat - chiTiet.getSoLuong());
                    sanPhamMauSac.setSoLuongDaDat(newDaDat);
                    sanPhamMauSacRepository.save(sanPhamMauSac);
                }
            }
            
            // Refund will be handled automatically by database trigger trg_HoanTienKhiHuyDangKy
            // No need to manually create wallet transaction here
            
            // Mark registration as cancelled (trigger will handle refund)
            dangKy.setDaHuy(true);
            return dangKyChienDichRepository.save(dangKy);
        }
        return null;
    }
    
    public boolean deleteDangKy(Integer maDangKy) {
        if (dangKyChienDichRepository.existsById(maDangKy)) {
            dangKyChienDichRepository.deleteById(maDangKy);
            return true;
        }
        return false;
    }
    
    private void refundToWallet(String maNguoiDung, BigDecimal amount, String moTa) {
        Optional<Wallet> walletOpt = walletRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
        Wallet wallet;
        if (walletOpt.isPresent()) {
            wallet = walletOpt.get();
            BigDecimal currentBalance = wallet.getSoDu() != null ? wallet.getSoDu() : BigDecimal.ZERO;
            wallet.setSoDu(currentBalance.add(amount));
            wallet = walletRepository.save(wallet);
        } else {
            Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findById(maNguoiDung);
            if (nguoiDungOpt.isPresent()) {
                wallet = new Wallet();
                wallet.setNguoiDung(nguoiDungOpt.get());
                wallet.setSoDu(amount);
                wallet = walletRepository.save(wallet);
            } else {
                return;
            }
        }
        
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setLoaiGiaoDich("Hoàn tiền");
        transaction.setSoTien(amount);
        transaction.setMoTa(moTa);
        walletTransactionRepository.save(transaction);
    }
    
    private void guiThongBaoHeThong(String maNguoiDung, String tieuDe, String noiDung) {
        ThongBao tb = new ThongBao();
        tb.setMaNguoiDung(maNguoiDung);
        tb.setTieuDe(tieuDe);
        tb.setNoiDung(noiDung);
        tb.setLoaiThongBao("Hệ Thống");
        tb.setDaDoc(false);
        thongBaoRepository.save(tb);
    }
}
