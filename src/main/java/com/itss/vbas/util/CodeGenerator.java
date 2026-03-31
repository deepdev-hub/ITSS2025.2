package com.itss.vbas.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public final class CodeGenerator {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private CodeGenerator() {
    }

    public static String requestCode() {
        return "REQ-" + LocalDateTime.now().format(FORMATTER) + "-" + randomSuffix();
    }

    public static String quoteCode() {
        return "QTE-" + LocalDateTime.now().format(FORMATTER) + "-" + randomSuffix();
    }

    private static String randomSuffix() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
