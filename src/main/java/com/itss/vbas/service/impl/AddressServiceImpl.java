package com.itss.vbas.service.impl;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.entity.Address;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.repository.AddressRepository;
import com.itss.vbas.service.AddressService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;

    public AddressServiceImpl(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @Override
    public Address createAddress(CommonDto.AddressRequest request) {
        if (request == null) {
            return null;
        }
        return addressRepository.save(map(null, request));
    }

    @Override
    public Address updateAddress(Address existingAddress, CommonDto.AddressRequest request) {
        if (request == null) {
            return existingAddress;
        }
        return addressRepository.save(map(existingAddress, request));
    }

    @Override
    @Transactional(readOnly = true)
    public Address getAddress(Long id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
    }

    private Address map(Address existingAddress, CommonDto.AddressRequest request) {
        Address address = existingAddress == null ? new Address() : existingAddress;
        address.setCountry(request.country());
        address.setProvince(request.province());
        address.setDistrict(request.district());
        address.setWard(request.ward());
        address.setStreet(request.street());
        address.setDetail(request.detail());
        address.setLatitude(request.latitude());
        address.setLongitude(request.longitude());
        return address;
    }
}
