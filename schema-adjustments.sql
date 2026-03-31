-- Minimal schema adjustments to support the fullstack application cleanly.
-- Apply after importing the base PostgreSQL dump if these columns/indexes do not exist yet.

ALTER TABLE public.rescue_companies
    ADD COLUMN IF NOT EXISTS owner_account_id bigint;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_rescue_company_owner_account'
    ) THEN
        ALTER TABLE public.rescue_companies
            ADD CONSTRAINT fk_rescue_company_owner_account
            FOREIGN KEY (owner_account_id) REFERENCES public.account(id);
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_rescue_companies_owner_account_id
    ON public.rescue_companies(owner_account_id)
    WHERE owner_account_id IS NOT NULL;

ALTER TABLE public.customer_vehicles
    ADD COLUMN IF NOT EXISTS brand character varying(100),
    ADD COLUMN IF NOT EXISTS model character varying(100),
    ADD COLUMN IF NOT EXISTS plate_number character varying(50),
    ADD COLUMN IF NOT EXISTS manufacture_year integer,
    ADD COLUMN IF NOT EXISTS color character varying(50);

CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_vehicles_plate_number
    ON public.customer_vehicles(plate_number)
    WHERE plate_number IS NOT NULL;

ALTER TABLE public.incident_types
    ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.service_types
    ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_reviews_request_id
    ON public.reviews(request_id);

CREATE INDEX IF NOT EXISTS idx_rescue_requests_customer_created_at
    ON public.rescue_requests(customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_request_assignments_request_assigned_at
    ON public.request_assignments(request_id, assigned_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotes_request_created_at
    ON public.quotes(request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_request_sent_at
    ON public.messages(request_id, sent_at ASC);

CREATE INDEX IF NOT EXISTS idx_payments_request_created_at
    ON public.payments(request_id, created_at DESC);
