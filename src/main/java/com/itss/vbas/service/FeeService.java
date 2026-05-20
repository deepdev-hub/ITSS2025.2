package com.itss.vbas.service;

import java.math.BigDecimal;

import com.itss.vbas.dto.request.FeeDto;

public interface FeeService {
    /**
     * Predict fee using formula: fee = coefficient * (serviceBasePrice + transportCost)
     *
     * @param serviceTypeId ID of the service type
     * @param transportCost transport/travel cost in VND
     * @return PredictFeeResponse containing breakdown and estimated fee
     */
    FeeDto.PredictFeeResponse predictFee(Long serviceTypeId, BigDecimal transportCost);
}
