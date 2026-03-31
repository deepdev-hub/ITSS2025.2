package com.itss.vbas.repository;

import java.util.List;

import com.itss.vbas.entity.RequestStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestStatusHistoryRepository extends JpaRepository<RequestStatusHistory, Long> {
    List<RequestStatusHistory> findByRequestIdOrderByChangedAtAsc(Long requestId);
}
