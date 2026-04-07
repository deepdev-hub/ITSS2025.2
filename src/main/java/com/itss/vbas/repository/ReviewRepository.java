package com.itss.vbas.repository;

import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByRequestId(Long requestId);

    List<Review> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    long countByCompanyId(Long companyId);
}
