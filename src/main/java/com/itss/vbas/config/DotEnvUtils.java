package com.itss.vbas.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public final class DotEnvUtils {

    private DotEnvUtils() {
    }

    public static Map<String, String> loadDotEnv() {
        Path dotenvPath = Path.of(".env");
        if (!Files.isRegularFile(dotenvPath)) {
            return Map.of();
        }

        Map<String, String> values = new HashMap<>();
        try {
            for (String line : Files.readAllLines(dotenvPath)) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int separator = trimmed.indexOf('=');
                if (separator <= 0) {
                    continue;
                }
                String key = trimmed.substring(0, separator).trim();
                String value = trimmed.substring(separator + 1).trim();
                values.put(key, stripWrappingQuotes(value));
            }
        } catch (IOException ignored) {
            return Map.of();
        }
        return values;
    }

    public static String firstText(String... values) {
        for (String value : values) {
            if (hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }

    public static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static String stripWrappingQuotes(String value) {
        if (value.length() >= 2
                && ((value.startsWith("\"") && value.endsWith("\""))
                || (value.startsWith("'") && value.endsWith("'")))) {
            return value.substring(1, value.length() - 1);
        }
        return value;
    }
}
