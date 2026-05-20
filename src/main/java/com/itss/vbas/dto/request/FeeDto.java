package com.itss.vbas.dto.request;

import java.math.BigDecimal;

public final class FeeDto {

    private FeeDto() {}

    public record PredictFeeResponse(
            Long serviceTypeId,
            String serviceName,
            BigDecimal basePrice,
            BigDecimal transportCost,
            BigDecimal coefficient,
            BigDecimal estimatedFee
    ) {}
}
