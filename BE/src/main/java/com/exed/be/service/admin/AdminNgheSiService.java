package com.exed.be.service.admin;

import com.exed.be.dto.admin.NgheSiRequest;
import com.exed.be.model.NgheSi;
import com.exed.be.repository.NgheSiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminNgheSiService {

    @Autowired
    private NgheSiRepository ngheSiRepository;

    public List<NgheSi> getAllNgheSi() {
        return ngheSiRepository.findAll();
    }

    public Optional<NgheSi> getNgheSiById(String maNgheSi) {
        return ngheSiRepository.findById(maNgheSi);
    }

    @Transactional
    public NgheSi createNgheSi(NgheSiRequest request) {
        if (ngheSiRepository.existsById(request.getMaNgheSi())) {
            throw new RuntimeException("Mã nghệ sĩ đã tồn tại: " + request.getMaNgheSi());
        }
        NgheSi ns = new NgheSi();
        ns.setMaNgheSi(request.getMaNgheSi());
        ns.setTenNgheSi(request.getTenNgheSi());
        ns.setMoTa(request.getMoTa());
        ns.setNgheNghiep(request.getNgheNghiep());
        ns.setLinkMXH(request.getLinkMXH());
        return ngheSiRepository.save(ns);
    }

    @Transactional
    public NgheSi updateNgheSi(String maNgheSi, NgheSiRequest request) {
        NgheSi ns = ngheSiRepository.findById(maNgheSi)
                .orElseThrow(() -> new RuntimeException("Nghệ sĩ không tồn tại: " + maNgheSi));
        if (request.getTenNgheSi() != null) ns.setTenNgheSi(request.getTenNgheSi());
        if (request.getMoTa() != null) ns.setMoTa(request.getMoTa());
        if (request.getNgheNghiep() != null) ns.setNgheNghiep(request.getNgheNghiep());
        if (request.getLinkMXH() != null) ns.setLinkMXH(request.getLinkMXH());
        return ngheSiRepository.save(ns);
    }

    @Transactional
    public boolean deleteNgheSi(String maNgheSi) {
        if (!ngheSiRepository.existsById(maNgheSi)) return false;
        ngheSiRepository.deleteById(maNgheSi);
        return true;
    }
}
