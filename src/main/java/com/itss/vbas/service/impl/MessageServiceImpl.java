package com.itss.vbas.service.impl;

import java.util.List;

import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Message;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.MessageRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.MessageService;
import com.itss.vbas.service.RequestSupportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RequestSupportService requestSupportService;
    private final AuthContext authContext;
    private final AppMapper appMapper;

    public MessageServiceImpl(
            MessageRepository messageRepository,
            RescueRequestRepository rescueRequestRepository,
            RequestSupportService requestSupportService,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.messageRepository = messageRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.requestSupportService = requestSupportService;
        this.authContext = authContext;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.MessageResponse> getMessagesByRequest(Long requestId) {
        Account account = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        requestSupportService.assertRequestParticipant(account, rescueRequest);
        return messageRepository.findByRequestIdOrderBySentAtAsc(requestId)
                .stream()
                .map(appMapper::toMessageResponse)
                .toList();
    }

    @Override
    public RequestDto.MessageResponse sendMessage(Long requestId, RequestDto.MessageCreateRequest request) {
        Account account = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        requestSupportService.assertRequestParticipant(account, rescueRequest);
        Message message = Message.builder()
                .request(rescueRequest)
                .sender(account)
                .content(request.content())
                .build();
        return appMapper.toMessageResponse(messageRepository.save(message));
    }

    private RescueRequest findRequest(Long requestId) {
        return rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));
    }
}
