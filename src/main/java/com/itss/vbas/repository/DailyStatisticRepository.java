package com.itss.vbas.repository;

import java.time.LocalDate;
import java.util.Optional;

import com.itss.vbas.entity.DailyStatistic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyStatisticRepository extends JpaRepository<DailyStatistic, Long> {
    Optional<DailyStatistic> findByStatDate(LocalDate statDate);

    Optional<DailyStatistic> findTopByOrderByStatDateDesc();
}
