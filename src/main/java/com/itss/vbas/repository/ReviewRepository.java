package com.itss.vbas.repository;

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
}
