package com.exed.be.service.admin;

import com.exed.be.dto.admin.ThongBaoRequest;
import com.exed.be.model.NguoiDung;
import com.exed.be.model.ThongBao;
import com.exed.be.repository.NguoiDungRepository;
import com.exed.be.repository.ThongBaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminThongBaoService {

    @Autowired private ThongBaoRepository thongBaoRepository;
    @Autowired private NguoiDungRepository nguoiDungRepository;

    public List<ThongBao> getByNguoiDung(String maNguoiDung) {
        return thongBaoRepository.findByMaNguoiDungOrderByNgayTaoDesc(maNguoiDung);
    }

    public long countUnread(String maNguoiDung) {
        return thongBaoRepository.countByMaNguoiDungAndDaDocFalse(maNguoiDung);
    }

    public List<ThongBao> getAll() {
        return thongBaoRepository.findAll();
    }

    @Transactional
    public ThongBao markRead(Integer maThongBao) {
        ThongBao tb = thongBaoRepository.findById(maThongBao)
                .orElseThrow(() -> new RuntimeException("Thông báo không tồn tại"));
        tb.setDaDoc(true);
        return thongBaoRepository.save(tb);
    }

    @Transactional
    public int markAllRead(String maNguoiDung) {
        return thongBaoRepository.markAllAsRead(maNguoiDung);
    }

    @Transactional
    public boolean delete(Integer maThongBao) {
        if (!thongBaoRepository.existsById(maThongBao)) return false;
        thongBaoRepository.deleteById(maThongBao);
        return true;
    }

    /**
     * Gửi thông báo đến nhiều user một lúc.
     * @return số bản ghi đã tạo
     */
    @Transactional
    public List<ThongBao> guiThongBao(ThongBaoRequest req) {
        if (req.getTieuDe() == null || req.getTieuDe().isBlank())
            throw new RuntimeException("Thiếu tiêu đề");
        if (req.getNoiDung() == null || req.getNoiDung().isBlank())
            throw new RuntimeException("Thiếu nội dung");

        List<String> targetIds = new ArrayList<>();

        if (req.getMaNguoiDungs() != null && !req.getMaNguoiDungs().isEmpty()) {
            for (String id : req.getMaNguoiDungs()) {
                if (id != null && !id.isBlank() && nguoiDungRepository.existsById(id)) {
                    targetIds.add(id);
                }
            }
        } else if (req.getVaiTro() != null && !req.getVaiTro().isBlank()) {
            for (NguoiDung nd : nguoiDungRepository.findByVaiTro(req.getVaiTro())) {
                targetIds.add(nd.getMaNguoiDung());
            }
        } else {
            throw new RuntimeException("Phải chỉ định maNguoiDungs hoặc vaiTro");
        }

        if (targetIds.isEmpty()) {
            throw new RuntimeException("Không có người dùng phù hợp để gửi");
        }

        String loai = (req.getLoaiThongBao() != null && !req.getLoaiThongBao().isBlank())
                ? req.getLoaiThongBao() : "Hệ Thống";

        List<ThongBao> result = new ArrayList<>();
        for (String id : targetIds) {
            ThongBao tb = new ThongBao();
            tb.setMaNguoiDung(id);
            tb.setTieuDe(req.getTieuDe());
            tb.setNoiDung(req.getNoiDung());
            tb.setLoaiThongBao(loai);
            tb.setDaDoc(false);
            result.add(thongBaoRepository.save(tb));
        }
        return result;
    }
}
