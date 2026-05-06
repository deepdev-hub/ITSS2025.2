package com.itss.vbas.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeAvatar(MultipartFile file);
    
    String storeRequestImage(MultipartFile file);
}