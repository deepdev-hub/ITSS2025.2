ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (
        type IN (
            'ASSIGNMENT_PENDING',
            'ASSIGNMENT_ACCEPTED',
            'REQUEST_COMPLETED',
            'PAYMENT_PAID'
        )
    );
