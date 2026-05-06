package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.request.RequestDto;
import org.springframework.web.multipart.MultipartFile;

public interface RescueRequestService {
    RequestDto.RequestDetailResponse createRequest(RequestDto.CreateRequest request);

    List<RequestDto.RequestSummaryResponse> getMyRequests();

    RequestDto.RequestDetailResponse getRequestDetail(Long requestId);

    void cancelRequest(Long requestId, String note);

    RequestDto.RequestDetailResponse updateRequestStatus(Long requestId, CommonDto.StatusUpdateRequest request);

    List<RequestDto.StatusHistoryResponse> getStatusHistory(Long requestId);

    CommonDto.FileUploadResponse uploadRequestImage(Long requestId, MultipartFile file);
}
