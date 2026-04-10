package com.exed.be.repository;

import com.exed.be.model.NgheSi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NgheSiRepository extends JpaRepository<NgheSi, String> {
}
