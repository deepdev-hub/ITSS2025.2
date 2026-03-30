package com.itss.vbas.service.impl;

import java.util.List;

import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.Review;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ForbiddenException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.ReviewRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.RequestSupportService;
import com.itss.vbas.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RequestSupportService requestSupportService;
    private final AuthContext authContext;
    private final AppMapper appMapper;

    public ReviewServiceImpl(
            ReviewRepository reviewRepository,
            RescueRequestRepository rescueRequestRepository,
            RequestSupportService requestSupportService,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.reviewRepository = reviewRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.requestSupportService = requestSupportService;
        this.authContext = authContext;
        this.appMapper = appMapper;
    }

    @Override
    public RequestDto.ReviewResponse createReview(Long requestId, RequestDto.ReviewCreateRequest request) {
        Account customer = authContext.getCurrentAccount();
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));
        if (!rescueRequest.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only review your own request");
        }
        if (rescueRequest.getStatus() != RescueRequestStatus.COMPLETED) {
            throw new BadRequestException("Only completed requests can be reviewed");
        }
        if (reviewRepository.findByRequestId(requestId).isPresent()) {
            throw new BadRequestException("This request has already been reviewed");
        }

        RescueCompany company = requestSupportService.getAssignedCompany(rescueRequest);
        if (company == null) {
            throw new BadRequestException("Cannot create review because no rescue company was assigned");
        }
        RequestAssignment assignment = requestSupportService.getLatestAssignment(rescueRequest);

        Review review = Review.builder()
                .request(rescueRequest)
                .customer(customer)
                .company(company)
                .staff(assignment == null ? null : assignment.getStaff())
                .ratingScore(request.ratingScore())
                .comment(request.comment())
                .build();
        return appMapper.toReviewResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.ReviewResponse> getCurrentCompanyReviews() {
        Account account = authContext.getCurrentAccount();
        RescueCompany company = requestSupportService.getCurrentCompany(account);
        return reviewRepository.findByCompanyIdOrderByCreatedAtDesc(company.getId())
                .stream()
                .map(appMapper::toReviewResponse)
                .toList();
    }
}
