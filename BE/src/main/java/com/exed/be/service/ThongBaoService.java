package com.exed.be.service;

import com.exed.be.model.ThongBao;
import com.exed.be.repository.ThongBaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service xử lý thông báo cho người dùng cuối
 */
@Service
@Transactional(readOnly = true)
public class ThongBaoService {

    @Autowired
    private ThongBaoRepository thongBaoRepository;

    /**
     * Lấy danh sách thông báo của người dùng (sắp xếp mới nhất trước)
     */
    public List<ThongBao> getByNguoiDung(String maNguoiDung) {
        return thongBaoRepository.findByMaNguoiDungOrderByNgayTaoDesc(maNguoiDung);
    }

    /**
     * Đếm số lượng thông báo chưa đọc của người dùng
     */
    public long countUnread(String maNguoiDung) {
        return thongBaoRepository.countByMaNguoiDungAndDaDocFalse(maNguoiDung);
    }

    /**
     * Đánh dấu một thông báo là đã đọc
     */
    @Transactional
    public ThongBao markRead(Integer maThongBao) {
        Optional<ThongBao> opt = thongBaoRepository.findById(maThongBao);
        if (opt.isPresent()) {
            ThongBao tb = opt.get();
            tb.setDaDoc(true);
            return thongBaoRepository.save(tb);
        }
        throw new RuntimeException("Thông báo không tồn tại");
    }

    /**
     * Đánh dấu toàn bộ thông báo của người dùng là đã đọc
     */
    @Transactional
    public int markAllRead(String maNguoiDung) {
        return thongBaoRepository.markAllAsRead(maNguoiDung);
    }

    /**
     * Xóa một thông báo
     */
    @Transactional
    public boolean delete(Integer maThongBao) {
        if (thongBaoRepository.existsById(maThongBao)) {
            thongBaoRepository.deleteById(maThongBao);
            return true;
        }
        return false;
    }
}
