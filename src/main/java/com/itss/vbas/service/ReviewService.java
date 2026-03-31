package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.request.RequestDto;

public interface ReviewService {
    RequestDto.ReviewResponse createReview(Long requestId, RequestDto.ReviewCreateRequest request);

    List<RequestDto.ReviewResponse> getCurrentCompanyReviews();
}
