package com.itss.vbas.service;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.entity.Address;

public interface AddressService {
    Address createAddress(CommonDto.AddressRequest request);

    Address updateAddress(Address existingAddress, CommonDto.AddressRequest request);

    Address getAddress(Long id);
}
