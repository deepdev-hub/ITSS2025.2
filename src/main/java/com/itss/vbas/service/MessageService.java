package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.request.RequestDto;

public interface MessageService {
    List<RequestDto.MessageResponse> getMessagesByRequest(Long requestId);

    RequestDto.MessageResponse sendMessage(Long requestId, RequestDto.MessageCreateRequest request);
}
