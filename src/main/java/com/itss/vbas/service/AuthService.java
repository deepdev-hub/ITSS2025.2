package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.auth.AuthDto;
import com.itss.vbas.dto.common.CommonDto;

public interface AuthService {
    AuthDto.AuthResponse registerCustomer(AuthDto.RegisterRequest request);

    AuthDto.AuthResponse login(AuthDto.LoginRequest request);

    AuthDto.ProfileResponse getCurrentProfile();

    AuthDto.ProfileResponse updateProfile(AuthDto.UpdateProfileRequest request);

    void changePassword(AuthDto.ChangePasswordRequest request);

    List<CommonDto.LookupResponse> getIncidentLookups();

    List<CommonDto.LookupResponse> getServiceLookups();

    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}
