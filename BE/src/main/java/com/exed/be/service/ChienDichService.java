package com.exed.be.service;

import com.exed.be.model.ChienDich;
import com.exed.be.repository.ChienDichRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ChienDichService {
    
    @Autowired
    private ChienDichRepository chienDichRepository;
    
    public List<ChienDich> getAllChienDich() {
        List<ChienDich> chienDichList = chienDichRepository.findAll(Sort.by(Sort.Direction.DESC, "ngayTao"));
        // Force initialize lazy collections
        chienDichList.forEach(cd -> {
            if (cd.getNgheSi() != null && cd.getNgheSi().getHinhAnhNgheSis() != null) {
                cd.getNgheSi().getHinhAnhNgheSis().size();
            }
            if (cd.getSanPham() != null && cd.getSanPham().getHinhAnhSanPhams() != null) {
                cd.getSanPham().getHinhAnhSanPhams().size();
            }
        });
        return chienDichList;
    }
    
    public Optional<ChienDich> getChienDichById(String id) {
        return chienDichRepository.findById(id);
    }
    
    public List<ChienDich> getActiveChienDich() {
        List<ChienDich> activeList = chienDichRepository.findByThoiDiem("Đang diễn ra");
        // Force initialize lazy collections
        activeList.forEach(cd -> {
            if (cd.getNgheSi() != null && cd.getNgheSi().getHinhAnhNgheSis() != null) {
                cd.getNgheSi().getHinhAnhNgheSis().size();
            }
            if (cd.getSanPham() != null && cd.getSanPham().getHinhAnhSanPhams() != null) {
                cd.getSanPham().getHinhAnhSanPhams().size();
            }
        });
        return activeList;
    }
}
