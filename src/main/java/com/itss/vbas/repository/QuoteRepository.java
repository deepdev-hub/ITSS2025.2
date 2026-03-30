package com.itss.vbas.repository;

import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.Quote;
import com.itss.vbas.enums.QuoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
    List<Quote> findByRequestIdOrderByCreatedAtDesc(Long requestId);

    Optional<Quote> findFirstByRequestIdOrderByCreatedAtDesc(Long requestId);

    Optional<Quote> findByIdAndCompanyId(Long id, Long companyId);

    Optional<Quote> findByIdAndRequestId(Long id, Long requestId);

    long countByCompanyId(Long companyId);

    long countByCompanyIdAndStatus(Long companyId, QuoteStatus status);
}
