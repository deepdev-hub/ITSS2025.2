package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.request.RequestDto;

public interface QuoteService {
    List<RequestDto.QuoteResponse> getQuotesByRequest(Long requestId);

    RequestDto.QuoteResponse createOrUpdateQuote(Long requestId, CompanyDto.QuoteRequest request);

    RequestDto.QuoteResponse sendQuote(Long quoteId);

    RequestDto.QuoteResponse acceptQuote(Long quoteId);

    RequestDto.QuoteResponse rejectQuote(Long quoteId);
}
