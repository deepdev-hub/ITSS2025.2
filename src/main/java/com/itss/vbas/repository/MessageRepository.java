package com.itss.vbas.repository;

import java.util.List;

import com.itss.vbas.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRequestIdOrderBySentAtAsc(Long requestId);
}
