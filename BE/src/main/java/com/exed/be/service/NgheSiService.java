package com.exed.be.service;

import com.exed.be.model.NgheSi;
import com.exed.be.repository.NgheSiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class NgheSiService {
    
    @Autowired
    private NgheSiRepository ngheSiRepository;
    
    public List<NgheSi> getAllNgheSi() {
        List<NgheSi> ngheSiList = ngheSiRepository.findAll();
        // Force initialize lazy collections
        ngheSiList.forEach(ns -> {
            if (ns.getHinhAnhNgheSis() != null) {
                ns.getHinhAnhNgheSis().size();
            }
        });
        return ngheSiList;
    }
    
    public Optional<NgheSi> getNgheSiById(String id) {
        return ngheSiRepository.findById(id);
    }
}
