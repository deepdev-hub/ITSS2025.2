package com.itss.vbas.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByRequestId(Long requestId);

    List<Review> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    long countByCompanyId(Long companyId);

    @Query("select avg(r.ratingScore) from Review r")
    Double findAverageRating();

    @Query("select avg(r.ratingScore) from Review r where r.staff.id = :staffId")
    Double findAverageRatingByStaffId(@Param("staffId") Long staffId);

    @Query("""
            select avg(r.ratingScore)
            from Review r
            where r.company.id = :companyId
              and r.createdAt >= :startAt
              and r.createdAt < :endAt
            """)
    Double findAverageRatingByCompanyId(
            @Param("companyId") Long companyId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    @Query("""
            select count(r)
            from Review r
            where r.company.id = :companyId
              and r.createdAt >= :startAt
              and r.createdAt < :endAt
            """)
    long countReviewsByCompanyId(
            @Param("companyId") Long companyId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );
}
