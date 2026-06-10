package com.itss.vbas.service;

import java.math.BigDecimal;

import com.itss.vbas.dto.request.FeeDto;

public interface FeeService {
    /**
     * Predict fee using formula: fee = coefficient * (serviceBasePrice + automaticTravelCost)
     *
     * @param serviceTypeId ID of the service type
     * @param latitude request latitude
     * @param longitude request longitude
     * @return PredictFeeResponse containing breakdown and estimated fee
     */
    FeeDto.PredictFeeResponse predictFee(Long serviceTypeId, BigDecimal latitude, BigDecimal longitude);
}
