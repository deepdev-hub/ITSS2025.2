package com.itss.vbas.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import com.itss.vbas.enums.NotificationType;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class NotificationSchemaValidator {

    private static final String CONSTRAINT_NAME = "notifications_type_check";

    @Bean
    ApplicationRunner validateNotificationSchema(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                DatabaseMetaData metaData = connection.getMetaData();
                String productName = metaData.getDatabaseProductName();
                if (productName == null || !productName.toLowerCase(Locale.ROOT).contains("postgres")) {
                    return;
                }
            }

            String definition = jdbcTemplate.query(
                    """
                    select pg_get_constraintdef(oid)
                    from pg_constraint
                    where conrelid = 'notifications'::regclass
                      and conname = ?
                    """,
                    rs -> rs.next() ? rs.getString(1) : null,
                    CONSTRAINT_NAME
            );

            if (definition == null || definition.isBlank()) {
                throw new IllegalStateException("Missing PostgreSQL constraint notifications_type_check on table notifications.");
            }

            Set<String> expectedTypes = Arrays.stream(NotificationType.values())
                    .map(NotificationType::name)
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            Set<String> missingTypes = expectedTypes.stream()
                    .filter(type -> !definition.contains("'" + type + "'"))
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            if (!missingTypes.isEmpty()) {
                throw new IllegalStateException(
                        "Constraint notifications_type_check is outdated. Missing notification type(s): "
                                + String.join(", ", missingTypes)
                                + ". Run scripts/fix_notifications_type_check.sql against the PostgreSQL database."
                );
            }
        };
    }
}
