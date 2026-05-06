package com.itss.vbas.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final String AVATAR_UPLOAD_DIR = "uploads/avatars";
    private static final String REQUEST_IMAGE_UPLOAD_DIR = "uploads/request-images";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public FileStorageServiceImpl() {
        try {
            Files.createDirectories(Paths.get(AVATAR_UPLOAD_DIR));
            Files.createDirectories(Paths.get(REQUEST_IMAGE_UPLOAD_DIR));
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directories", ex);
        }
    }

    @Override
    public String storeAvatar(MultipartFile file) {
        return storeFile(file, AVATAR_UPLOAD_DIR);
    }

    @Override
    public String storeRequestImage(MultipartFile file) {
        return storeFile(file, REQUEST_IMAGE_UPLOAD_DIR);
    }

    private String storeFile(MultipartFile file, String uploadDir) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = UUID.randomUUID().toString() + fileExtension;
        
        try {
            Path targetLocation = Paths.get(uploadDir).resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/" + uploadDir + "/" + filename;
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store file: " + ex.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum limit of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File must be an image");
        }
    }
}