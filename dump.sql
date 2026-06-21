--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(20),
    avatar_url text,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role_id bigint NOT NULL,
    date_of_birth date,
    gender character varying(20),
    default_address_id bigint,
    cccd character varying(20),
    CONSTRAINT account_status_check CHECK (((status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('INACTIVE'::character varying)::text, ('BANNED'::character varying)::text])))
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_id_seq OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id bigint NOT NULL,
    country character varying(100),
    province character varying(100),
    district character varying(100),
    ward character varying(100),
    street character varying(255),
    detail text,
    latitude numeric(10,7),
    longitude numeric(10,7)
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addresses_id_seq OWNER TO postgres;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: customer_vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_vehicles (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    fuel_type character varying(50),
    notes text,
    brand character varying(100),
    color character varying(50),
    manufacture_year integer,
    model character varying(100),
    plate_number character varying(50)
);


ALTER TABLE public.customer_vehicles OWNER TO postgres;

--
-- Name: customer_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_vehicles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_vehicles_id_seq OWNER TO postgres;

--
-- Name: customer_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_vehicles_id_seq OWNED BY public.customer_vehicles.id;


--
-- Name: daily_statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_statistics (
    id bigint NOT NULL,
    stat_date date NOT NULL,
    request_count bigint DEFAULT 0 NOT NULL,
    completed_request_count bigint DEFAULT 0 NOT NULL,
    canceled_request_count bigint DEFAULT 0 NOT NULL,
    in_progress_request_count bigint DEFAULT 0 NOT NULL,
    paid_payment_count bigint DEFAULT 0 NOT NULL,
    revenue numeric(15,2) DEFAULT 0 NOT NULL,
    review_count bigint DEFAULT 0 NOT NULL,
    average_rating numeric(3,2),
    customer_count bigint DEFAULT 0 NOT NULL,
    staff_count bigint DEFAULT 0 NOT NULL,
    company_count bigint DEFAULT 0 NOT NULL,
    approved_company_count bigint DEFAULT 0 NOT NULL,
    calculated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.daily_statistics OWNER TO postgres;

--
-- Name: daily_statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_statistics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_statistics_id_seq OWNER TO postgres;

--
-- Name: daily_statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_statistics_id_seq OWNED BY public.daily_statistics.id;


--
-- Name: incident_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incident_types (
    id bigint NOT NULL,
    incident_code character varying(50) NOT NULL,
    incident_name character varying(255) NOT NULL,
    description text
);


ALTER TABLE public.incident_types OWNER TO postgres;

--
-- Name: incident_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incident_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incident_types_id_seq OWNER TO postgres;

--
-- Name: incident_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incident_types_id_seq OWNED BY public.incident_types.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    request_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    content text NOT NULL,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    message text NOT NULL,
    is_read boolean NOT NULL,
    read_at timestamp(6) without time zone,
    title character varying(255) NOT NULL,
    type character varying(40) NOT NULL,
    recipient_id bigint NOT NULL,
    request_id bigint,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['ASSIGNMENT_PENDING'::character varying, 'ASSIGNMENT_ACCEPTED'::character varying, 'REQUEST_COMPLETED'::character varying, 'PAYMENT_PAID'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    attempt_count integer,
    otp_hash character varying(255),
    verified_at timestamp(6) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    request_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    payment_method character varying(20) NOT NULL,
    payment_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    paid_at timestamp without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT payments_payment_method_check CHECK (((payment_method)::text = ANY (ARRAY[('CASH'::character varying)::text, ('BANK_TRANSFER'::character varying)::text, ('MOMO'::character varying)::text, ('VNPAY'::character varying)::text, ('ZALOPAY'::character varying)::text]))),
    CONSTRAINT payments_payment_status_check CHECK (((payment_status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('PAID'::character varying)::text, ('FAILED'::character varying)::text, ('REFUNDED'::character varying)::text])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: pricing_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pricing_rules (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    service_type_id bigint NOT NULL,
    distance_from_km numeric(10,2) NOT NULL,
    distance_to_km numeric(10,2) NOT NULL,
    price_per_km numeric(15,2) NOT NULL,
    night_surcharge numeric(15,2) DEFAULT 0,
    holiday_surcharge numeric(15,2) DEFAULT 0
);


ALTER TABLE public.pricing_rules OWNER TO postgres;

--
-- Name: pricing_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pricing_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pricing_rules_id_seq OWNER TO postgres;

--
-- Name: pricing_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pricing_rules_id_seq OWNED BY public.pricing_rules.id;


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotes (
    id bigint NOT NULL,
    request_id bigint NOT NULL,
    company_id bigint NOT NULL,
    staff_id bigint,
    quote_code character varying(100) NOT NULL,
    estimated_amount numeric(15,2),
    final_amount numeric(15,2),
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp without time zone,
    service_name character varying(255),
    quantity integer,
    unit_price numeric(15,2),
    subtotal numeric(15,2),
    customer_note text,
    note text,
    CONSTRAINT quotes_status_check CHECK (((status)::text = ANY (ARRAY[('DRAFT'::character varying)::text, ('SENT'::character varying)::text, ('ACCEPTED'::character varying)::text, ('REJECTED'::character varying)::text, ('EXPIRED'::character varying)::text])))
);


ALTER TABLE public.quotes OWNER TO postgres;

--
-- Name: quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quotes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotes_id_seq OWNER TO postgres;

--
-- Name: quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quotes_id_seq OWNED BY public.quotes.id;


--
-- Name: request_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_assignments (
    id bigint NOT NULL,
    request_id bigint NOT NULL,
    company_id bigint NOT NULL,
    staff_id bigint,
    vehicle_id bigint,
    assigned_by_user_id bigint NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    accepted_at timestamp without time zone,
    rejected_at timestamp without time zone,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    CONSTRAINT request_assignments_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('ACCEPTED'::character varying)::text, ('REJECTED'::character varying)::text, ('COMPLETED'::character varying)::text])))
);


ALTER TABLE public.request_assignments OWNER TO postgres;

--
-- Name: request_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_assignments_id_seq OWNER TO postgres;

--
-- Name: request_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.request_assignments_id_seq OWNED BY public.request_assignments.id;


--
-- Name: request_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_status_history (
    id bigint NOT NULL,
    request_id bigint NOT NULL,
    old_status character varying(20),
    new_status character varying(20) NOT NULL,
    changed_by_user_id bigint NOT NULL,
    note text,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.request_status_history OWNER TO postgres;

--
-- Name: request_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_status_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_status_history_id_seq OWNER TO postgres;

--
-- Name: request_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.request_status_history_id_seq OWNED BY public.request_status_history.id;


--
-- Name: rescue_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rescue_companies (
    id bigint NOT NULL,
    company_name character varying(255) NOT NULL,
    tax_code character varying(50),
    license_number character varying(100),
    email character varying(255),
    phone character varying(20),
    description text,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    owner_account_id bigint,
    address_id bigint,
    latitude numeric(10,7),
    longitude numeric(10,7),
    CONSTRAINT rescue_companies_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('APPROVED'::character varying)::text, ('REJECTED'::character varying)::text, ('SUSPENDED'::character varying)::text])))
);


ALTER TABLE public.rescue_companies OWNER TO postgres;

--
-- Name: rescue_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rescue_companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_companies_id_seq OWNER TO postgres;

--
-- Name: rescue_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rescue_companies_id_seq OWNED BY public.rescue_companies.id;


--
-- Name: rescue_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rescue_requests (
    id bigint NOT NULL,
    request_code character varying(100) NOT NULL,
    customer_id bigint NOT NULL,
    vehicle_id bigint,
    incident_type_id bigint NOT NULL,
    service_type_id bigint,
    location_id bigint NOT NULL,
    description text,
    priority_level character varying(20) DEFAULT 'NORMAL'::character varying NOT NULL,
    status character varying(20) DEFAULT 'CREATED'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    image_url text,
    estimated_quotation_amount numeric(15,2),
    fee_coefficient numeric(10,4),
    service_price_snapshot numeric(15,2),
    travel_cost numeric(15,2),
    CONSTRAINT rescue_requests_priority_level_check CHECK (((priority_level)::text = ANY (ARRAY[('LOW'::character varying)::text, ('NORMAL'::character varying)::text, ('HIGH'::character varying)::text, ('EMERGENCY'::character varying)::text]))),
    CONSTRAINT rescue_requests_status_check CHECK (((status)::text = ANY (ARRAY[('CREATED'::character varying)::text, ('SEARCHING'::character varying)::text, ('MATCHED'::character varying)::text, ('ACCEPTED'::character varying)::text, ('IN_PROGRESS'::character varying)::text, ('COMPLETED'::character varying)::text, ('CANCELED'::character varying)::text])))
);


ALTER TABLE public.rescue_requests OWNER TO postgres;

--
-- Name: rescue_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rescue_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_requests_id_seq OWNER TO postgres;

--
-- Name: rescue_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rescue_requests_id_seq OWNED BY public.rescue_requests.id;


--
-- Name: rescue_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rescue_staff (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    company_id bigint NOT NULL,
    job_title character varying(255),
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    bio text,
    years_experience integer,
    rescue_vehicle_id bigint,
    CONSTRAINT rescue_staff_status_check CHECK (((status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('OFFLINE'::character varying)::text, ('BUSY'::character varying)::text])))
);


ALTER TABLE public.rescue_staff OWNER TO postgres;

--
-- Name: rescue_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rescue_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_staff_id_seq OWNER TO postgres;

--
-- Name: rescue_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rescue_staff_id_seq OWNED BY public.rescue_staff.id;


--
-- Name: rescue_vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rescue_vehicles (
    id bigint NOT NULL,
    vehicle_code character varying(100) NOT NULL,
    vehicle_type character varying(100) NOT NULL,
    plate_number character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    company_id bigint NOT NULL,
    CONSTRAINT rescue_vehicles_status_check CHECK (((status)::text = ANY (ARRAY[('AVAILABLE'::character varying)::text, ('IN_SERVICE'::character varying)::text, ('MAINTENANCE'::character varying)::text])))
);


ALTER TABLE public.rescue_vehicles OWNER TO postgres;

--
-- Name: rescue_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rescue_vehicles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_vehicles_id_seq OWNER TO postgres;

--
-- Name: rescue_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rescue_vehicles_id_seq OWNED BY public.rescue_vehicles.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    request_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    company_id bigint NOT NULL,
    staff_id bigint,
    rating_score integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT reviews_rating_score_check CHECK (((rating_score >= 1) AND (rating_score <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: service_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_types (
    id bigint NOT NULL,
    service_code character varying(50) NOT NULL,
    service_name character varying(255) NOT NULL,
    description text,
    base_price numeric(15,2) DEFAULT 0
);


ALTER TABLE public.service_types OWNER TO postgres;

--
-- Name: service_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_types_id_seq OWNER TO postgres;

--
-- Name: service_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_types_id_seq OWNED BY public.service_types.id;


--
-- Name: test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test (
    id integer NOT NULL,
    name text
);


ALTER TABLE public.test OWNER TO postgres;

--
-- Name: test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_id_seq OWNER TO postgres;

--
-- Name: test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_id_seq OWNED BY public.test.id;


--
-- Name: test_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_item (
    id bigint NOT NULL,
    name character varying(255)
);


ALTER TABLE public.test_item OWNER TO postgres;

--
-- Name: test_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.test_item ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.test_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(150) NOT NULL,
    full_name character varying(100) NOT NULL,
    phone character varying(20),
    avatar_url character varying(500),
    created_at timestamp(6) without time zone,
    role character varying(50),
    status character varying(50)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: customer_vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_vehicles ALTER COLUMN id SET DEFAULT nextval('public.customer_vehicles_id_seq'::regclass);


--
-- Name: daily_statistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_statistics ALTER COLUMN id SET DEFAULT nextval('public.daily_statistics_id_seq'::regclass);


--
-- Name: incident_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_types ALTER COLUMN id SET DEFAULT nextval('public.incident_types_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: pricing_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_rules ALTER COLUMN id SET DEFAULT nextval('public.pricing_rules_id_seq'::regclass);


--
-- Name: quotes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes ALTER COLUMN id SET DEFAULT nextval('public.quotes_id_seq'::regclass);


--
-- Name: request_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_assignments ALTER COLUMN id SET DEFAULT nextval('public.request_assignments_id_seq'::regclass);


--
-- Name: request_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_status_history ALTER COLUMN id SET DEFAULT nextval('public.request_status_history_id_seq'::regclass);


--
-- Name: rescue_companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_companies ALTER COLUMN id SET DEFAULT nextval('public.rescue_companies_id_seq'::regclass);


--
-- Name: rescue_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests ALTER COLUMN id SET DEFAULT nextval('public.rescue_requests_id_seq'::regclass);


--
-- Name: rescue_staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_staff ALTER COLUMN id SET DEFAULT nextval('public.rescue_staff_id_seq'::regclass);


--
-- Name: rescue_vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_vehicles ALTER COLUMN id SET DEFAULT nextval('public.rescue_vehicles_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: service_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_types ALTER COLUMN id SET DEFAULT nextval('public.service_types_id_seq'::regclass);


--
-- Name: test id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test ALTER COLUMN id SET DEFAULT nextval('public.test_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, email, password_hash, full_name, phone, avatar_url, status, created_at, role_id, date_of_birth, gender, default_address_id, cccd) FROM stdin;
1	hung.lv235740@sis.hust.edu.vn	$2a$10$4mT3QDCkCJlhmFUhVF4u5.JjFGDC1M99hTqqAxwgP2DhrOAwP30lG	Hung Van Luong	0347826500	\N	ACTIVE	2026-03-31 20:59:27.343642	1	\N	\N	\N	\N
2	abc@gmail.com	$2a$10$gXmvI5svrf6pFCiCs6bx7e9M8QDZ7bbv5AVv7riMvuQwN8lzKrWvq	Nguyen Van A	\N	\N	ACTIVE	2026-04-06 22:44:48.320388	1	\N	\N	\N	\N
4	hungwzzzz@gmail.com	$2a$10$WGpD5zBFAXfdCbSboFLVkOx.T/D8gN6afCtNsWa6XLxIofhVIpv7K	Luong Van Hung	0347826500	\N	ACTIVE	2026-04-09 07:08:30.730755	2	2025-02-22	Male	2	020205006133
6	luongvanhungnote@gmail.com	$2a$10$n1n4VGP3j3iJZco70VjY.OE1JXnd9ZsmJqjxN8tfiWWiSzwuRuYJ6	Luong Van Hung	0334826500		ACTIVE	2026-04-09 07:19:13.182251	4	2005-02-22	Male	4	020205006135
40	dam02@gmail.com	$2a$10$akb8tAaapPBqeoCgX/v3GeMPOIoCdxoTgtczNmcMSdEs8AOSu4GYe	Admin Dam	\N	\N	ACTIVE	2026-04-09 20:13:52.267908	2	\N	\N	\N	\N
41	dam03@gmail.com	$2a$10$NRwoFLLjuk2ZTE1K16heaexTf49iojih0bJZzm/c0riOh.VADCqL2	Company Dam	\N	\N	ACTIVE	2026-04-09 20:15:08.537506	3	\N	\N	\N	\N
42	dam04@gmail.com	$2a$10$gTwyGcpzHPsCMoXhu0n9hunmBIIztteFqhZCuTTJTCdRINmez6Y4S	Staff Dam	\N	\N	ACTIVE	2026-04-09 20:15:49.665559	4	\N	\N	\N	\N
73	admin@vbas.local	$2a$10$qanvJAbG.SetU9EJf.iCx.DmHuKNd3K./UF49zB2cnTH1j1w/Rqnq	System Admin	0900000001	\N	ACTIVE	2026-04-09 14:25:29.43875	2	\N	MALE	\N	\N
88	duyhung22102005@gmail.com	$2a$10$zLk7yh3fDblyy7pa9RqkS.sWxG0UPwaY/xIyAbg1ePPgq61AMYKAe	Trần Duy Hưng	0911905611	\N	ACTIVE	2026-04-15 18:30:54.8599	1	\N	\N	\N	\N
85	abc111@gmail.com	$2a$10$zuZho1C7s/8SLBtO3ePzmOWcQ3Xe2.WhhF5bQUPE5uLO2RbEilhmu	Nguyen Van A	\N	\N	ACTIVE	2026-04-15 17:18:33.17839	1	\N	\N	\N	\N
86	abc1112@gmail.com	$2a$10$NktNPvgHx6BKKYiCDiI5o.Hrksu0.VkM9vUdEnosQoK5isEoEG3t.	Nguyen Van A	\N	\N	ACTIVE	2026-04-15 17:26:55.981164	1	\N	\N	\N	\N
87	abc11122@gmail.com	$2a$10$3Xd0PYYj3T2C7eDMWgyfMuj4SB2AQ3qPWMR669WGB5HmQGiAT/qBW	Nguyen Van A	\N	\N	ACTIVE	2026-04-15 17:37:06.574988	1	\N	\N	\N	\N
89	thien.nq235838@sis.hust.edu.vn	$2a$10$heYTBvUo8g4HyaocgAnLOO1HEHd6y4x4UGzkjrCC1qs/hjF2cS/cy	Nguyễn Quang Thiện	0329584430		ACTIVE	2026-04-15 19:23:30.331658	2	\N		93	12458484837
90	thien123@gmail.com	$2a$10$Y2mYefCRlV5mEBe/kgtH8e9OF60lzHeC7VN5fLVGRmVZDSxerRX8a	Nguyễn Quang Thiện	0329584430		ACTIVE	2026-04-15 19:31:44.729521	3	2005-03-11		94	012345678912
39	dam01@gmail.com	$2a$10$wbwcYVaz3BZbRR0ERM3kp.BuNbnluIM7HkJfXd7nLLW/YTJJ/fH52	Hung Dam	0384875608	/uploads/avatars/95799a1d-68d0-42c6-a65a-95d61b9a5607.png	ACTIVE	2026-04-09 19:57:43.432084	1	\N	\N	\N	\N
93	thien113205@gmail.com	$2a$10$VetlWCsrNI0poUxQHXVgLOI/c0Barx6ytJA1kl39nIpzhZz0CV9UC	Nguyễn Quang Thiện	0329584430		BANNED	2026-04-15 20:44:06.563483	1	\N		96	12345678999
91	nguyenquangthien1132005@gmail.com	$2a$10$GfuQJOqohdPxyWure1VLHOay01pO4u2AaKqv1UqexHfw.qLAbable	Nguyễn Quang Thiện	0329584430	\N	BANNED	2026-04-15 20:39:59.124745	4	\N	\N	\N	\N
92	huyen29112002@gmail.com	$2a$10$IOjgmWg0qB/SCUbDS2meDu/LH8xSoPPGZtbpPD7WfJVzs6LEHGnL.	Nguyễn Quang Thiện	0329584430	\N	ACTIVE	2026-04-15 20:40:17.361165	4	\N	\N	110	\N
75	company@vbas.local	$2a$10$rjHPQwx0fREqDoBTeNTStuK54bl.jGhfHO8QV/fotDrMlK5utkLOm	RapidTow Owner	0900000003	D:\\program\\itss\\ITSS2025.2\\uploads\\avatars\\95799a1d-68d0-42c6-a65a-95d61b9a5607.png	ACTIVE	2026-04-09 14:25:29.43875	3	\N	MALE	143	
101	a@a	$2a$10$W0W8qjgfUIyTTROn9L7E8OMnIE/dCFMC0Xa9FdGSy0l9YitFAvs8.	1	0	\N	ACTIVE	2026-06-20 01:44:24.474712	1	1111-01-01	female	\N	2
5	luongvanhungnet@gmail.com	$2a$10$UfkxHFo9RsWfE3rcayuu7unvolD8TsGAIjnoksHFd7xcbQwlwQ9IW	Luong Van Hung	0333826500		ACTIVE	2026-04-09 07:12:17.230256	3	2005-02-22	Male	3	020205006134
76	staff@vbas.local	$2a$10$7Q2uIg4PZN4te9memDTjD.x3egu0ZpuTBPX0zyYnNQrp71Rnj6Lmi	RapidTow Staff 1	0900000004	\N	ACTIVE	2026-04-09 14:25:29.43875	4	\N	MALE	145	\N
74	customer@vbas.local	$2a$10$G.bQwF3fvlGgOLlhFzM31eguLkhbvON3O3CQ0B.RTovQrpj2zrC2C	Demo Customer	0900000002	\N	ACTIVE	2026-04-09 14:25:29.43875	1	\N	FEMALE	167	\N
94	staff2@vbas.local	$2a$10$V7bbTKkQYzA.pZER2fxYOekYu/CsrBoRhCh/zGkGcHK/wCeKWo4li	RapidTow Staff 2	0900000005	\N	ACTIVE	2026-06-19 23:43:32.504656	4	\N	MALE	168	\N
95	staff3@vbas.local	$2a$10$MXj0B.51IU.inW4Jo/L7IetaRNEqGaJBNTwZbW20Vm0Gy6izvC2XS	RapidTow Staff 3	0900000006	\N	ACTIVE	2026-06-19 23:43:32.654526	4	\N	MALE	169	\N
96	staff4@vbas.local	$2a$10$Z2fjuTTHEFaH/3kiaKb0neusr.WkaU43CDC4Izo7Rvwp5971k0yh.	RapidTow Staff 4	0900000007	\N	ACTIVE	2026-06-19 23:43:32.901846	4	\N	MALE	170	\N
97	staff5@vbas.local	$2a$10$2v/dBT.NDjRlViyBOzcGK.INx2jhWqLdYljtLrB2Mpzcp81mUAHwu	RapidTow Staff 5	0900000008	\N	ACTIVE	2026-06-19 23:43:33.070194	4	\N	MALE	171	\N
98	hung.lv23570@sis.hust.edu.vn	$2a$10$5IOkLXoD4pcIlqlAznhOiOKDOVTBlzGzB9C5qgW41pEL6NY8zNFFK	luong van hung	0347826500	\N	ACTIVE	2026-06-20 01:22:51.523112	1	2026-07-11	male	\N	90870707970
99	hung.lv2350@sis.hust.edu.vn	$2a$10$Ng5kBbmnCVMODwEaJB2ysedGKlQjrlvLMevmzx67g9YWYirrXK5AG	luong van hung	0347826500	\N	ACTIVE	2026-06-20 01:34:28.663907	1	2000-07-11	male	\N	8250845845840
100	i@a	$2a$10$mvZngkuq0USveOcKyevRpOmius0225.0Vp1w2FdLXq/H/M.Yhe5z2	nigga	1	\N	ACTIVE	2026-06-20 01:36:41.759096	1	1000-01-01	others	\N	1
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, country, province, district, ward, street, detail, latitude, longitude) FROM stdin;
1	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	Bách Khoa	\N	\N
2	Vietnam	Ha Noi	Hai Ba Trung	22	so 8 Tran Dai Nghia		\N	\N
3	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	Bách Khoa	\N	\N
4	Vietnam	Ha Noi	Hai Ba Trung	22	Back Khoa	Back Khoa	\N	\N
6	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	Back Khoa	20.9962684	10.5840483
7	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	so 8, Tran Dai Nghia	20.9962684	10.5840483
40	Vietnam	ha noi					\N	\N
73	Vietnam	Ho Chi Minh City	District 1	Ben Nghe	Le Loi	Main office branch	10.7731000	106.7043000
74	Vietnam	Ha Noi	Hai Ba Trung	22	Back khoa	so 8, Tran Dai Nghia	20.9962684	10.5840483
75	Vietnam	Ung Hoa					\N	\N
76	Vietnam	HCM					\N	\N
77	Vietnam	HCM					\N	\N
78	Vietnam	Hai phong					\N	\N
79	Vietnam	nam dinh					\N	\N
80	Vietnam	HCM					\N	\N
81	Vietnam	HCM					\N	\N
82	Vietnam	NY					\N	\N
83	Vietnam	BG					\N	\N
92	Vietnam	12	12	12	12	45	54.0000000	100.0000000
93	Vietnam				Hải Hậu	Hải Hậu	\N	\N
94	Vietnam				Hải Hậu	Hải Hậu	\N	\N
95	Vietnam	Hà Nội	Hoàn Kiếm	Hàng Buồm	88 Mã Mây		21.0342894	105.8533942
96	Vietnam	Nam Định	Hải Hậu	Hải Sơn	Hải Hậu	Hải Hậu	\N	\N
97	Vietnam	Hà Nội 	Hoàn Kiếm 	Hàng Buồm	62 Mã Mây		21.0345000	105.8532000
98	Vietnam	HCM					\N	\N
99	Vietnam	Ung Hoa					\N	\N
100	Vietnam	Ha Noi	Back mai	back khoa	ta quang buu		10.7305576	106.6460774
101	Vietnam	ha noi					\N	\N
102	Vietnam	Hà Nội 		Hàng Buồm	Hải Hậu		21.0345000	105.8532000
103	Vietnam	Hà Nội 	Hoàn Kiếm 	Hàng Buồm	Hải Hậu		21.0345000	105.8532000
104	Vietnam	ha noi					\N	\N
105	Vietnam	HCM					\N	\N
106	Vietnam	Hai phong					\N	\N
107	Vietnam	nam dinh					\N	\N
108	Vietnam	thanh hóa					\N	\N
109	Vietnam	Ha Noi	Hai Ba Trung	Bach Khoa	Dai Co Viet	Near HUST	21.0050000	105.8430000
110	\N	\N	\N	\N	\N	\N	21.0027980	105.8509683
143	Vietnam						\N	\N
144	Vietnam	Ha Noi	Back mai	back khoa	ta quang buu	so 8, Tran Dai Nghia	21.0298249	105.8355869
146	Vietnam	Ha Noi					21.0049793	105.8458536
147	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	so 8, Tran Dai Nghia	21.0049781	105.8458524
148	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	so 8, Tran Dai Nghia	21.0049748	105.8458563
149	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	so 8, Tran Dai Nghia	21.0049731	105.8458510
150	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	so 8, Tran Dai Nghia	21.0049731	105.8458510
151	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	so 8, Tran Dai Nghia	21.0045870	105.8465320
152	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	so 8, Tran Dai Nghia	21.0045870	105.8465320
153	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	so 8, Tran Dai Nghia	21.0049800	105.8458603
154	Vietnam	Ha Noi	Hai Ba Trung	22	Bách Khoa	so 8, Tran Dai Nghia	21.0049800	105.8458603
155	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0050021	105.8458620
156	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0050021	105.8458620
157	Vietnam	Hà Nội		Phường Cửa Nam	Phố Quang Trung	Dòng Thánh Phao lô Hà Nội	21.0240095	105.8496765
158	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049998	105.8458846
159	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049845	105.8458706
160	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049845	105.8458706
161	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049911	105.8458751
162	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049911	105.8458751
163	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049911	105.8458751
164	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049911	105.8458751
165	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049977	105.8458799
174	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049977	105.8458799
175	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0050022	105.8458622
176	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049968	105.8458638
166	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049977	105.8458799
177	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049820	105.8458612
167	Vietnam	Ha Noi	Hai Ba Trung	Bach Khoa	Dai Co Viet	Gan cong vien Thong Nhat	21.0041800	105.8432300
178	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049931	105.8458755
168	Vietnam	Ha Noi	Hai Ba Trung	Dong Tam	Giai Phong	Staff point 2	21.0008300	105.8422100
170	Vietnam	Ha Noi	Hai Ba Trung	Phuong Mai	Truong Chinh	Staff point 4	20.9986400	105.8359200
171	Vietnam	Ha Noi	Hai Ba Trung	Thanh Nhan	Kim Nguu	Staff point 5	21.0132400	105.8651900
172	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049977	105.8458799
173	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0049977	105.8458799
169	Vietnam	Ha Noi	Hai Ba Trung	Quynh Loi	Pho Hue	Staff point 3	21.0115200	105.8565400
179	Vietnam	Hà Nội		Phường Bạch Mai	Đường Giải Phóng	207	20.9997459	105.8434973
181	Vietnam	Hà Nội		Phường Tây Hồ	Phố Trích Sài	235	21.0580419	105.8139655
180	Vietnam	Hà Nội		Phường Bạch Mai	Đường Giải Phóng	207	20.9997459	105.8434973
182	Vietnam	Hà Nội		Phường Cầu Giấy	Đường Xuân Thủy	Homies C3, 144	21.0388103	105.7818897
145	Vietnam	Ha Noi	Hai Ba Trung	Bach Khoa	Tran Dai Nghia	Staff point 1	21.0074100	105.8464100
\.


--
-- Data for Name: customer_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_vehicles (id, customer_id, fuel_type, notes, brand, color, manufacture_year, model, plate_number) FROM stdin;
1	1	h	h	h	h	2026	h	h
2	39		Xe chính chủ, bảo dưỡng định kỳ tại hãng, đã dán phim cách nhiệt.	Toyota	đen	2023	Camry 2.5Q	30H - 123.45
35	74	Gasoline	Seed vehicle for demo customer	Toyota	White	2021	Vios	51A-888.88
36	39			Tesla	đỏ	2023	Vin 2.5Q	29F - 123.45
37	93	Dầu 	Xe gia đình 5 chỗ	Toyota	Đen	2019	Vios	29B-54321
38	74	a	ậdf	a	a	2000	a	a
39	100	Gasoline	mmmm	m	m	1900	m	m
\.


--
-- Data for Name: daily_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_statistics (id, stat_date, request_count, completed_request_count, canceled_request_count, in_progress_request_count, paid_payment_count, revenue, review_count, average_rating, customer_count, staff_count, company_count, approved_company_count, calculated_at) FROM stdin;
1	2026-05-06	26	5	2	6	3	1100000.00	2	5.00	9	4	3	3	2026-05-06 22:15:20.855265
2	2026-05-27	34	6	2	7	8	5300000.00	3	4.67	9	4	3	3	2026-05-27 15:41:43.327328
\.


--
-- Data for Name: incident_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incident_types (id, incident_code, incident_name, description) FROM stdin;
1	001	Het Xang	Het xang 
34	FLAT_TIRE	Flat Tire	Vehicle has a punctured or damaged tire
35	ENGINE_FAIL	Engine Failure	Vehicle cannot continue due to engine issue
36	BATTERY	Battery Problem	Battery drained or electrical startup problem
2	002	Thủng xăm 	Thủng xăm 
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, request_id, sender_id, content, sent_at) FROM stdin;
1	1	1	abc	2026-04-09 07:33:01.317249
2	1	5	xyz	2026-04-09 07:48:40.414004
3	1	1	abcd	2026-04-09 07:49:46.771002
4	1	4	1000	2026-04-09 07:54:50.600651
37	34	39	helloo	2026-04-09 19:59:07.208585
70	67	1	abc	2026-04-09 21:28:04.29349
71	67	5	xyz	2026-04-09 21:32:24.907289
72	67	6	xyz	2026-04-09 21:33:52.980027
73	67	1	da tra xong	2026-04-09 21:39:37.999424
74	67	4	abc	2026-04-09 21:52:55.085156
75	68	39	helppp	2026-04-11 22:04:49.424691
76	69	74	helllo	2026-04-12 21:45:12.090858
77	78	92	abc	2026-04-22 15:27:57.314651
78	87	75	lo	2026-05-05 20:54:31.524768
79	123	76	hello r u there?	2026-05-13 15:06:05.671548
80	123	76	xâssasfdsds	2026-05-13 23:00:43.636115
81	123	74	ajdfjdsjf]	2026-05-13 23:01:03.563188
82	123	76	hfhf	2026-05-13 23:05:03.654132
83	124	76	jladfl	2026-05-19 22:22:58.360249
84	125	74	;skfdf	2026-05-20 20:47:12.035368
85	128	74	ljl	2026-05-20 22:54:04.191754
86	133	73	hhkh	2026-06-18 23:16:08.857909
87	150	100	dmm	2026-06-20 01:38:36.04017
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, created_at, message, is_read, read_at, title, type, recipient_id, request_id) FROM stdin;
1	2026-06-04 21:54:59.975599	RapidTow Staff đã nhận chuyến REQ-20260604215358-6DB760.	t	2026-06-04 22:03:24.683886	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	133
4	2026-06-18 23:33:12.44725	RapidTow Staff đã nhận chuyến REQ-20260618232912-9F40AD.	t	2026-06-19 22:56:15.529224	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	136
3	2026-06-18 22:41:45.586436	Khách hàng đã thanh toán cho chuyến REQ-20260604215358-6DB760.	t	2026-06-19 22:57:28.674173	Khách hàng đã thanh toán	PAYMENT_PAID	76	133
5	2026-06-19 23:04:31.360642	Yêu cầu REQ-20260618232912-9F40AD đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:04:54.259751	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	136
14	2026-06-19 23:27:53.224839	Yêu cầu REQ-20260505210355-DDBC0E đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	39	89
15	2026-06-19 23:28:00.864453	Yêu cầu REQ-20260412215122-2FAF08 đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	39	70
16	2026-06-19 23:28:05.620201	Yêu cầu REQ-20260414202744-A39B98 đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	39	71
17	2026-06-19 23:28:12.291555	Yêu cầu REQ-20260414233637-7C54B0 đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	39	74
18	2026-06-19 23:28:22.692365	Yêu cầu REQ-20260415143840-14585C đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	39	76
19	2026-06-19 23:28:29.780761	Yêu cầu REQ-20260415221056-2FCDBE đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	39	79
13	2026-06-19 23:27:45.580769	Yêu cầu REQ-20260520213206-9460AA đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:29.306112	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	126
12	2026-06-19 23:27:40.856976	Yêu cầu REQ-20260520221717-9FE986 đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	127
11	2026-06-19 23:27:33.859655	Yêu cầu REQ-20260527152220-4E2270 đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	130
10	2026-06-19 23:27:21.237381	Yêu cầu REQ-20260520192621-15A391 đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	125
9	2026-06-19 23:27:08.058724	Yêu cầu REQ-20260520224734-2A9544 đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	128
8	2026-06-19 23:27:03.142894	Yêu cầu REQ-20260527145407-C3ED37 đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	129
7	2026-06-19 23:26:56.091098	Yêu cầu REQ-20260527222002-9ABC7A đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	131
6	2026-06-19 23:26:47.477933	Yêu cầu REQ-20260527222240-E769DE đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	132
2	2026-06-18 21:59:42.367929	Yêu cầu REQ-20260604215358-6DB760 đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	133
162	2026-06-19 23:54:32.665542	Ban vua duoc giao yeu cau REQ-20260604220544-4629C7. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	135
163	2026-06-19 23:54:32.66654	Ban vua duoc giao yeu cau REQ-20260604220544-4629C7. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	135
166	2026-06-19 23:55:33.583242	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	144
169	2026-06-19 23:55:33.586243	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	144
170	2026-06-19 23:56:34.311445	Ban vua duoc giao yeu cau REQ-20260604220126-118BA2. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	134
173	2026-06-19 23:56:34.313427	Ban vua duoc giao yeu cau REQ-20260604220126-118BA2. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	134
165	2026-06-19 23:54:32.732372	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:01:11.210706	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	144
175	2026-06-20 00:01:38.303805	Ban vua duoc giao yeu cau REQ-20260620000138-130B1F. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	145
174	2026-06-20 00:01:38.302211	Ban vua duoc giao yeu cau REQ-20260620000138-130B1F. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:01:45.95645	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	145
178	2026-06-20 00:02:05.000455	RapidTow Staff 1 đã nhận chuyến REQ-20260620000138-130B1F.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	145
179	2026-06-20 00:28:48.099788	Ban vua duoc giao yeu cau REQ-20260620002848-A48A9D. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	146
177	2026-06-20 00:01:38.304907	Ban vua duoc giao yeu cau REQ-20260620000138-130B1F. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	145
172	2026-06-19 23:56:34.313066	Ban vua duoc giao yeu cau REQ-20260604220126-118BA2. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	134
168	2026-06-19 23:55:33.585242	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	144
161	2026-06-19 23:54:32.662533	Ban vua duoc giao yeu cau REQ-20260604220544-4629C7. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	135
182	2026-06-20 00:29:49.023995	Ban vua duoc giao yeu cau REQ-20260620002848-A48A9D. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:30:02.471562	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	146
183	2026-06-20 00:35:37.915958	Ban vua duoc giao yeu cau REQ-20260620003537-099C4A. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	147
186	2026-06-20 00:36:07.545573	RapidTow Staff 4 đã nhận chuyến REQ-20260620003537-099C4A.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	147
187	2026-06-20 00:37:19.166963	Yêu cầu REQ-20260620003537-099C4A đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	147
184	2026-06-20 00:35:37.915958	Ban vua duoc giao yeu cau REQ-20260620003537-099C4A. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:07.30964	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	147
180	2026-06-20 00:28:48.102793	Ban vua duoc giao yeu cau REQ-20260620002848-A48A9D. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	146
176	2026-06-20 00:01:38.303805	Ban vua duoc giao yeu cau REQ-20260620000138-130B1F. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	145
171	2026-06-19 23:56:34.312445	Ban vua duoc giao yeu cau REQ-20260604220126-118BA2. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	134
167	2026-06-19 23:55:33.584242	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	144
164	2026-06-19 23:54:32.6682	Ban vua duoc giao yeu cau REQ-20260604220544-4629C7. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	135
188	2026-06-20 00:57:59.067103	Ban vua duoc giao yeu cau REQ-20260620005759-7C97B3. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	148
189	2026-06-20 00:57:59.068303	Ban vua duoc giao yeu cau REQ-20260620005759-7C97B3. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	148
191	2026-06-20 00:58:59.842636	Ban vua duoc giao yeu cau REQ-20260620005759-7C97B3. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:59:08.668795	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	148
192	2026-06-20 00:59:17.043233	RapidTow Staff 5 đã nhận chuyến REQ-20260620005759-7C97B3.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	148
193	2026-06-20 01:01:00.419836	Ban vua duoc giao yeu cau REQ-20260620010100-102A42. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	149
194	2026-06-20 01:01:00.419836	Ban vua duoc giao yeu cau REQ-20260620010100-102A42. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	149
195	2026-06-20 01:01:00.420843	Ban vua duoc giao yeu cau REQ-20260620010100-102A42. Hay chap nhan trong vong 60 giay.	t	2026-06-20 01:01:06.502437	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	149
196	2026-06-20 01:01:08.004594	RapidTow Staff 3 đã nhận chuyến REQ-20260620010100-102A42.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	149
197	2026-06-20 01:37:45.270205	Ban vua duoc giao yeu cau REQ-20260620013745-DA2466. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	150
198	2026-06-20 01:37:45.271711	Ban vua duoc giao yeu cau REQ-20260620013745-DA2466. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	150
199	2026-06-20 01:57:28.53181	Ban vua duoc giao yeu cau REQ-20260620015728-34A759. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	151
200	2026-06-20 01:57:28.532789	Ban vua duoc giao yeu cau REQ-20260620015728-34A759. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	151
201	2026-06-20 01:57:57.449246	Yêu cầu REQ-20260620010100-102A42 đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	149
203	2026-06-20 01:58:06.583652	RapidTow Staff 3 đã nhận chuyến REQ-20260620013745-DA2466.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	100	150
204	2026-06-20 01:58:39.001054	Yêu cầu REQ-20260620013745-DA2466 đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	100	150
206	2026-06-20 01:58:44.824139	RapidTow Staff 3 đã nhận chuyến REQ-20260620015728-34A759.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	151
205	2026-06-20 01:58:39.863782	Ban vua duoc giao yeu cau REQ-20260620015728-34A759. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:01.599924	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	151
202	2026-06-20 01:57:58.250969	Ban vua duoc giao yeu cau REQ-20260620013745-DA2466. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:04.388035	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	150
190	2026-06-20 00:57:59.068303	Ban vua duoc giao yeu cau REQ-20260620005759-7C97B3. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	148
185	2026-06-20 00:35:37.916976	Ban vua duoc giao yeu cau REQ-20260620003537-099C4A. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	147
181	2026-06-20 00:28:48.103794	Ban vua duoc giao yeu cau REQ-20260620002848-A48A9D. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	146
207	2026-06-20 02:15:02.101446	Yêu cầu REQ-20260620000138-130B1F đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	145
208	2026-06-20 02:16:15.005847	Ban vua duoc giao yeu cau REQ-20260620021614-582E85. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	152
210	2026-06-20 02:16:15.010921	Ban vua duoc giao yeu cau REQ-20260620021614-582E85. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	152
209	2026-06-20 02:16:15.009018	Ban vua duoc giao yeu cau REQ-20260620021614-582E85. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:16:20.591036	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	152
211	2026-06-20 02:16:22.49744	RapidTow Staff 1 đã nhận chuyến REQ-20260620021614-582E85.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	152
212	2026-06-20 02:17:33.062988	Yêu cầu REQ-20260620021614-582E85 đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	152
213	2026-06-20 02:20:26.832845	Ban vua duoc giao yeu cau REQ-20260620022026-2101F7. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	153
215	2026-06-20 02:20:26.835931	Ban vua duoc giao yeu cau REQ-20260620022026-2101F7. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	153
216	2026-06-20 02:20:43.974953	RapidTow Staff 1 đã nhận chuyến REQ-20260620022026-2101F7.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	153
214	2026-06-20 02:20:26.834843	Ban vua duoc giao yeu cau REQ-20260620022026-2101F7. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:20:32.371774	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	153
217	2026-06-20 02:23:12.881023	Yêu cầu REQ-20260620022026-2101F7 đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	153
219	2026-06-20 02:24:20.356768	Ban vua duoc giao yeu cau REQ-20260620022409-E86511. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	154
218	2026-06-20 02:24:20.355762	Ban vua duoc giao yeu cau REQ-20260620022409-E86511. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:24:34.96853	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	154
220	2026-06-20 02:24:36.563665	RapidTow Staff 1 đã nhận chuyến REQ-20260620022409-E86511.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	154
221	2026-06-20 02:28:15.200679	Yêu cầu REQ-20260620022409-E86511 đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	154
222	2026-06-20 02:40:45.036478	Ban vua duoc giao yeu cau REQ-20260620024033-D8CE8C. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	155
223	2026-06-20 02:41:45.831913	Ban vua duoc giao yeu cau REQ-20260620024033-D8CE8C. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	155
224	2026-06-20 02:41:45.831913	Ban vua duoc giao yeu cau REQ-20260620024033-D8CE8C. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:41:54.520838	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	155
225	2026-06-20 02:41:56.405517	RapidTow Staff 1 đã nhận chuyến REQ-20260620024033-D8CE8C.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	155
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used_at, attempt_count, otp_hash, verified_at) FROM stdin;
1	5	3f55e2a8-a4dd-406c-b5d7-3fecfb6eab7f	2026-04-14 20:25:10.002484	2026-04-14 20:12:09.460349	\N	\N	\N
2	5	8a80e817-5191-44f3-9911-a896095f9652	2026-04-15 18:02:48.662879	2026-04-15 17:48:38.776746	\N	\N	\N
3	5	b3332d9c-583b-4b0d-8f6a-a18f5f8dcf97	2026-04-15 18:44:46.039807	\N	\N	\N	\N
4	88	8e5a9242-e08d-49e3-b661-849125e37a0f	2026-04-15 18:46:20.534359	\N	\N	\N	\N
5	88	54cbadd6-d77a-498a-a948-0bc2d9298f1a	2026-04-15 22:28:07.765383	\N	\N	\N	\N
6	88	8b7f62bd-c413-4218-9b34-f3195f276499	2026-04-15 22:38:54.894519	2026-04-15 22:24:24.45407	\N	\N	\N
7	88	80bdff1a-4202-43c2-8c3b-11cb8d7526ed	2026-04-15 22:54:52.776821	2026-04-15 22:41:08.799883	\N	\N	\N
8	5	fd74b641-89cc-4ce0-9fb3-e45ac857370d	2026-06-19 22:31:39.023901	2026-06-19 22:17:28.981119	\N	\N	\N
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, request_id, customer_id, amount, payment_method, payment_status, paid_at, created_at) FROM stdin;
1	1	1	500000.00	CASH	PAID	2026-04-09 07:50:35.519607	2026-04-09 07:33:40.221299
34	67	1	500000.00	CASH	PAID	2026-04-09 21:39:23.693534	2026-04-09 21:36:28.311302
35	68	39	100000.00	VNPAY	PAID	2026-04-11 22:04:36.219619	2026-04-11 22:04:29.315343
36	70	39	50000.00	ZALOPAY	PENDING	\N	2026-04-12 21:51:37.643089
37	69	74	100000.00	CASH	PENDING	\N	2026-05-06 23:20:38.079493
40	125	74	100000.00	CASH	PAID	2026-05-20 21:12:50.31926	2026-05-20 21:12:29.715156
41	126	74	1000000.00	CASH	PAID	2026-05-20 21:36:53.863676	2026-05-20 21:36:49.453352
42	124	74	300000.00	CASH	PENDING	\N	2026-05-20 21:38:48.366468
43	127	74	1000000.00	VNPAY	PAID	2026-05-20 22:19:49.240641	2026-05-20 22:19:45.685208
44	129	74	2000000.00	CASH	PAID	2026-05-27 14:57:30.440603	2026-05-27 14:57:26.713357
45	130	74	100000.00	CASH	PAID	2026-05-27 15:33:51.101577	2026-05-27 15:33:49.679262
46	133	74	400000.00	CASH	PAID	2026-06-18 22:41:45.541837	2026-06-18 22:41:43.188382
47	145	74	10000000.00	CASH	PAID	2026-06-20 00:20:40.580674	2026-06-20 00:20:38.734027
48	147	74	3000000.00	CASH	PAID	2026-06-20 00:37:26.169687	2026-06-20 00:37:24.287706
49	152	74	1000000.00	CASH	PAID	2026-06-20 02:17:26.395007	2026-06-20 02:17:24.840191
\.


--
-- Data for Name: pricing_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pricing_rules (id, company_id, service_type_id, distance_from_km, distance_to_km, price_per_km, night_surcharge, holiday_surcharge) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotes (id, request_id, company_id, staff_id, quote_code, estimated_amount, final_amount, status, created_at, expires_at, service_name, quantity, unit_price, subtotal, customer_note, note) FROM stdin;
1	1	1	\N	QTE-20260409074815-DEE5CC	600000.00	600000.00	ACCEPTED	2026-04-09 07:48:15.643537	2026-10-04 14:30:00	Va xam	1	1.00	600000.00	\N	\N
34	67	1	\N	QTE-20260409213819-B7CACD	600000.00	60000.00	ACCEPTED	2026-04-09 21:38:19.387216	2026-04-09 23:00:00	Va xam	1	1.00	600000.00	\N	\N
35	71	34	34	QTE-20260414203120-B9F305	500000.00	500000.00	SENT	2026-04-14 20:31:20.617753	2026-04-14 20:31:00	Towing	1	\N	\N	\N	\N
36	72	34	\N	QTE-20260414221200-D0A1E2	10000.00	10000.00	SENT	2026-04-14 22:12:00.054445	2026-04-14 22:11:00	Do day binh	1	\N	\N	\N	\N
37	78	35	36	QTE-20260415210536-22A8E5	1000000.00	800000.00	SENT	2026-04-15 21:05:36.093127	\N	Va xam	1	\N	0.00	\N	\N
43	125	34	34	QTE-20260520211124-EB86E4	100000.00	100000.00	ACCEPTED	2026-05-20 21:11:24.242528	\N	Battery Support	1	100000.00	100000.00	\N	
44	126	34	34	QTE-20260520213512-CD97F8	1000000.00	1000000.00	ACCEPTED	2026-05-20 21:35:12.023926	\N	Battery Support	1	1000000.00	1000000.00	\N	gggg
38	124	34	34	QTE-20260519223432-A3F602	300000.00	300000.00	ACCEPTED	2026-05-19 22:34:32.76018	\N	Battery Support	1	300000.00	300000.00	\N	Smoke test deal price update
45	127	34	34	QTE-20260520221908-AE9E1B	1000000.00	1000000.00	ACCEPTED	2026-05-20 22:19:08.617378	\N	Battery Support	1	1000000.00	1000000.00	\N	alidsfdsklf
46	129	34	34	QTE-20260527145558-5A2460	2000000.00	2000000.00	ACCEPTED	2026-05-27 14:55:58.060356	\N	On-site Repair	1	2000000.00	2000000.00	\N	giá đợt 1
47	130	34	34	QTE-20260527153337-269A85	100000.00	100000.00	ACCEPTED	2026-05-27 15:33:37.569754	\N	Towing	1	100000.00	100000.00	\N	dsflkdsfl
48	133	34	34	QTE-20260604215620-C2281F	400000.00	400000.00	ACCEPTED	2026-06-04 21:56:20.357454	\N	Battery Support	1	400000.00	400000.00	\N	97879887
49	145	34	34	QTE-20260620001842-E4A3AA	1000000.00	10000000.00	ACCEPTED	2026-06-20 00:18:42.965197	\N	Towing	1	10000000.00	10000000.00	\N	
50	147	34	39	QTE-20260620003631-734FDA	3000000.00	3000000.00	ACCEPTED	2026-06-20 00:36:31.876879	\N	Battery Support	1	3000000.00	3000000.00	\N	
51	152	34	34	QTE-20260620021634-52857C	1000000.00	1000000.00	ACCEPTED	2026-06-20 02:16:34.574071	\N	Battery Support	1	1000000.00	1000000.00	\N	
\.


--
-- Data for Name: request_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_assignments (id, request_id, company_id, staff_id, vehicle_id, assigned_by_user_id, assigned_at, accepted_at, rejected_at, status) FROM stdin;
1	1	1	1	1	5	2026-04-09 07:45:10.806186	2026-04-09 07:46:28.724807	\N	COMPLETED
67	67	1	1	1	5	2026-04-09 21:30:42.871447	2026-04-09 21:32:57.02848	\N	COMPLETED
34	34	1	\N	\N	40	2026-04-09 20:23:49.644064	\N	2026-04-11 22:03:15.64939	REJECTED
68	34	34	\N	\N	39	2026-04-11 22:03:16.293916	\N	2026-04-12 21:18:02.243066	REJECTED
71	72	34	34	34	75	2026-04-14 22:10:44.180812	2026-04-14 22:11:29.754492	\N	COMPLETED
73	68	1	\N	\N	73	2026-04-14 23:14:39.267119	\N	2026-04-14 23:22:19.754283	REJECTED
74	73	34	34	34	75	2026-04-14 23:22:34.581805	2026-04-14 23:24:32.328738	2026-04-14 23:36:13.786739	REJECTED
76	75	34	\N	\N	73	2026-04-15 14:36:21.305017	\N	2026-04-15 14:46:28.84594	REJECTED
78	78	35	36	35	90	2026-04-15 20:58:33.117441	2026-04-15 21:03:55.358538	\N	COMPLETED
80	80	34	\N	\N	73	2026-04-15 22:35:35.987021	\N	2026-04-15 22:50:58.601008	REJECTED
81	82	34	\N	\N	73	2026-04-17 15:07:33.162549	\N	2026-04-17 15:14:57.610904	REJECTED
82	83	35	36	35	90	2026-04-22 15:33:20.675371	2026-04-22 15:34:37.138894	\N	ACCEPTED
83	84	35	\N	\N	89	2026-04-26 15:59:32.21515	\N	2026-04-26 20:44:46.919657	REJECTED
84	85	34	\N	\N	73	2026-05-05 18:42:14.720066	\N	2026-05-05 20:17:33.462814	REJECTED
85	85	34	\N	\N	73	2026-05-05 20:20:40.032504	\N	2026-05-05 20:25:49.858837	REJECTED
87	87	34	\N	\N	73	2026-05-05 20:53:24.092251	\N	\N	COMPLETED
86	86	34	\N	\N	73	2026-05-05 20:53:17.376824	\N	2026-05-05 21:02:56.335386	REJECTED
88	88	34	\N	\N	73	2026-05-05 21:04:48.782213	\N	2026-05-05 21:10:09.680318	REJECTED
89	89	34	\N	\N	73	2026-05-05 21:05:14.403648	\N	2026-05-05 21:11:11.273438	REJECTED
90	89	34	\N	\N	73	2026-05-05 21:26:35.311008	\N	2026-05-05 21:32:22.564247	REJECTED
91	89	34	\N	\N	73	2026-05-05 23:46:29.216981	\N	2026-05-05 23:52:04.896689	REJECTED
97	127	34	34	\N	73	2026-05-20 22:18:07.727212	2026-05-20 22:18:49.715419	\N	COMPLETED
93	123	34	34	34	75	2026-05-13 15:04:04.384868	2026-05-13 15:05:01.81665	\N	COMPLETED
96	126	34	34	\N	73	2026-05-20 21:33:22.329057	2026-05-20 21:34:07.531565	\N	COMPLETED
94	124	34	34	\N	73	2026-05-19 21:30:43.477073	2026-05-19 21:31:23.266342	\N	COMPLETED
92	89	34	34	34	75	2026-05-06 00:02:57.507105	2026-05-06 00:05:13.316466	\N	COMPLETED
69	70	34	34	34	75	2026-04-12 21:54:26.675786	2026-04-14 15:01:12.11772	\N	COMPLETED
70	71	34	34	34	75	2026-04-14 20:28:42.052761	2026-04-14 20:30:47.478502	\N	COMPLETED
75	74	34	34	34	75	2026-04-14 23:37:06.930304	2026-04-14 23:38:27.135761	\N	COMPLETED
77	76	34	34	34	75	2026-04-15 14:39:05.279701	2026-04-15 14:40:48.906191	\N	COMPLETED
79	79	34	34	34	75	2026-04-15 22:11:39.342989	2026-04-15 22:13:22.831891	\N	COMPLETED
673	135	34	38	37	74	2026-06-19 23:54:32.633617	\N	2026-06-19 23:55:33.527162	REJECTED
674	135	34	40	39	74	2026-06-19 23:54:32.651737	\N	2026-06-19 23:55:33.550041	REJECTED
675	135	34	37	36	74	2026-06-19 23:54:32.654254	\N	2026-06-19 23:55:33.55204	REJECTED
685	134	34	40	39	74	2026-06-19 23:56:34.311445	\N	2026-06-20 00:34:15.257447	REJECTED
677	144	34	34	34	74	2026-06-19 23:54:32.730247	\N	2026-06-19 23:55:33.566512	REJECTED
104	134	34	34	\N	74	2026-06-04 22:01:26.140053	\N	2026-06-08 21:17:26.542393	REJECTED
105	135	34	34	\N	74	2026-06-04 22:05:45.014379	\N	2026-06-08 21:17:26.773312	REJECTED
106	134	35	36	\N	74	2026-06-08 21:17:26.738313	\N	2026-06-08 21:22:27.084963	REJECTED
107	135	35	36	\N	74	2026-06-08 21:17:26.854781	\N	2026-06-08 21:22:27.138405	REJECTED
103	133	34	34	\N	74	2026-06-04 21:53:58.620847	2026-06-04 21:54:59.960644	\N	COMPLETED
108	136	34	34	\N	74	2026-06-18 23:29:12.556376	2026-06-18 23:33:12.431198	\N	COMPLETED
102	132	34	34	\N	73	2026-05-27 22:22:55.354578	2026-05-27 22:25:02.093371	\N	COMPLETED
101	131	34	34	\N	73	2026-05-27 22:20:17.029602	2026-05-27 22:20:32.645571	\N	COMPLETED
99	129	34	34	\N	73	2026-05-27 14:54:25.845309	2026-05-27 14:54:40.420946	\N	COMPLETED
98	128	34	34	\N	73	2026-05-20 22:48:18.749949	2026-05-20 22:48:30.524274	\N	COMPLETED
95	125	34	34	\N	73	2026-05-20 19:27:05.015347	2026-05-20 19:27:37.664005	\N	COMPLETED
100	130	34	34	\N	73	2026-05-27 15:24:30.707354	2026-05-27 15:24:42.282205	\N	COMPLETED
678	144	34	37	36	74	2026-06-19 23:55:33.575724	\N	2026-06-19 23:56:34.286837	REJECTED
679	144	34	39	38	74	2026-06-19 23:55:33.576727	\N	2026-06-19 23:56:34.28939	REJECTED
680	144	34	38	37	74	2026-06-19 23:55:33.579242	\N	2026-06-19 23:56:34.291391	REJECTED
687	145	34	37	36	74	2026-06-20 00:01:38.3001	\N	2026-06-20 00:02:04.982188	REJECTED
682	134	34	37	36	74	2026-06-19 23:56:34.30842	\N	2026-06-19 23:57:34.719593	REJECTED
683	134	34	39	38	74	2026-06-19 23:56:34.309441	\N	2026-06-19 23:57:34.721676	REJECTED
684	134	34	38	37	74	2026-06-19 23:56:34.31044	\N	2026-06-19 23:57:34.72327	REJECTED
681	144	34	40	39	74	2026-06-19 23:55:33.581248	\N	2026-06-20 00:01:22.564177	REJECTED
688	145	34	39	38	74	2026-06-20 00:01:38.301211	\N	2026-06-20 00:02:04.982188	REJECTED
689	145	34	38	37	74	2026-06-20 00:01:38.302211	\N	2026-06-20 00:02:04.982188	REJECTED
690	146	34	37	36	74	2026-06-20 00:28:48.091425	\N	2026-06-20 00:29:49.012917	REJECTED
691	146	34	39	38	74	2026-06-20 00:28:48.095992	\N	2026-06-20 00:29:49.015923	REJECTED
692	146	34	38	37	74	2026-06-20 00:28:48.096959	\N	2026-06-20 00:29:49.016937	REJECTED
72	69	1	\N	\N	73	2026-04-14 23:14:19.767543	\N	2026-06-20 00:33:06.860906	REJECTED
693	146	34	40	39	74	2026-06-20 00:29:49.022991	\N	2026-06-20 00:32:48.313774	REJECTED
676	135	34	39	38	74	2026-06-19 23:54:32.656257	\N	2026-06-20 00:34:08.335874	REJECTED
694	147	34	37	36	74	2026-06-20 00:35:37.91388	\N	2026-06-20 00:36:07.536007	REJECTED
696	147	34	38	37	74	2026-06-20 00:35:37.914979	\N	2026-06-20 00:36:07.536007	REJECTED
695	147	34	39	38	74	2026-06-20 00:35:37.91388	2026-06-20 00:36:07.534066	\N	COMPLETED
697	148	34	37	36	74	2026-06-20 00:57:59.06132	\N	2026-06-20 00:58:59.826588	REJECTED
701	149	34	37	36	74	2026-06-20 01:01:00.417246	\N	2026-06-20 01:01:07.997527	REJECTED
702	149	34	39	38	74	2026-06-20 01:01:00.41775	\N	2026-06-20 01:01:07.997527	REJECTED
698	148	34	39	38	74	2026-06-20 00:57:59.063094	\N	2026-06-20 00:58:59.832284	REJECTED
699	148	34	38	37	74	2026-06-20 00:57:59.064104	\N	2026-06-20 00:58:59.835326	REJECTED
700	148	34	40	39	74	2026-06-20 00:58:59.84104	2026-06-20 00:59:17.034672	\N	ACCEPTED
704	150	34	37	36	100	2026-06-20 01:37:45.265694	\N	2026-06-20 01:38:45.926521	REJECTED
705	150	34	39	38	100	2026-06-20 01:37:45.2672	\N	2026-06-20 01:38:45.932594	REJECTED
703	149	34	38	37	74	2026-06-20 01:01:00.418787	2026-06-20 01:01:07.993522	\N	COMPLETED
706	151	34	37	36	74	2026-06-20 01:57:28.529173	\N	2026-06-20 01:58:28.59003	REJECTED
707	151	34	39	38	74	2026-06-20 01:57:28.530199	\N	2026-06-20 01:58:28.596051	REJECTED
708	150	34	38	37	100	2026-06-20 01:57:58.248892	2026-06-20 01:58:06.572524	\N	COMPLETED
709	151	34	38	37	74	2026-06-20 01:58:39.862783	2026-06-20 01:58:44.81874	\N	ACCEPTED
686	145	34	34	34	74	2026-06-20 00:01:38.299102	2026-06-20 00:02:04.980126	\N	COMPLETED
710	152	34	37	36	74	2026-06-20 02:16:15.00284	\N	2026-06-20 02:16:22.48283	REJECTED
712	152	34	39	38	74	2026-06-20 02:16:15.004847	\N	2026-06-20 02:16:22.48283	REJECTED
711	152	34	34	34	74	2026-06-20 02:16:15.003921	2026-06-20 02:16:22.4762	\N	COMPLETED
713	153	34	37	36	74	2026-06-20 02:20:26.827227	\N	2026-06-20 02:20:43.96285	REJECTED
715	153	34	39	38	74	2026-06-20 02:20:26.829324	\N	2026-06-20 02:20:43.96285	REJECTED
714	153	34	34	34	74	2026-06-20 02:20:26.828331	2026-06-20 02:20:43.95933	\N	COMPLETED
717	154	34	39	38	74	2026-06-20 02:24:20.355762	\N	2026-06-20 02:24:36.551429	REJECTED
716	154	34	34	34	74	2026-06-20 02:24:20.353469	2026-06-20 02:24:36.54703	\N	COMPLETED
718	155	34	39	38	74	2026-06-20 02:40:45.031974	\N	2026-06-20 02:41:45.821801	REJECTED
720	155	34	34	34	74	2026-06-20 02:41:45.830907	2026-06-20 02:41:56.393723	\N	ACCEPTED
719	155	34	37	36	74	2026-06-20 02:41:45.829352	\N	2026-06-20 02:41:56.394722	REJECTED
\.


--
-- Data for Name: request_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_status_history (id, request_id, old_status, new_status, changed_by_user_id, note, changed_at) FROM stdin;
1	1	\N	CREATED	1	Request created	2026-04-09 07:32:41.565932
2	1	CREATED	MATCHED	4	Assigned from admin requests page	2026-04-09 07:45:11.000309
3	1	MATCHED	ACCEPTED	1	Customer accepted quote	2026-04-09 07:50:08.17007
4	1	ACCEPTED	COMPLETED	6		2026-04-09 07:52:32.561768
36	34	\N	CREATED	39	Request created	2026-04-09 19:58:37.940875
37	34	CREATED	MATCHED	40	Assigned from admin dashboard	2026-04-09 20:23:49.805893
70	67	\N	CREATED	1	Request created	2026-04-09 21:27:30.142506
71	67	CREATED	MATCHED	4	Assigned from admin dashboard	2026-04-09 21:30:43.026246
72	67	MATCHED	ACCEPTED	1	Customer accepted quote	2026-04-09 21:39:10.684536
73	67	ACCEPTED	COMPLETED	6		2026-04-09 21:40:32.965784
74	68	\N	CREATED	39	Request created	2026-04-11 22:04:10.477012
75	69	\N	CREATED	74	Request created	2026-04-12 21:44:36.729734
76	70	\N	CREATED	39	Request created	2026-04-12 21:51:22.70026
77	70	CREATED	MATCHED	40	Assigned from admin dashboard	2026-04-12 21:54:26.817507
78	71	\N	CREATED	39	Request created	2026-04-14 20:27:44.879139
79	71	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-14 20:28:42.20785
80	71	MATCHED	IN_PROGRESS	75		2026-04-14 20:30:05.538746
81	72	\N	CREATED	39	Request created	2026-04-14 22:10:04.644377
82	72	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-14 22:10:44.332515
83	69	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-14 23:14:19.92289
84	68	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-14 23:14:39.426855
85	72	MATCHED	COMPLETED	75		2026-04-14 23:16:20.256288
86	73	\N	CREATED	39	Request created	2026-04-14 23:21:58.242779
87	73	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-14 23:22:34.733191
88	73	MATCHED	CANCELED	39	Canceled by customer from request detail	2026-04-14 23:36:12.730296
89	74	\N	CREATED	39	Request created	2026-04-14 23:36:38.301002
90	74	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-14 23:37:07.081264
91	74	MATCHED	IN_PROGRESS	75		2026-04-14 23:38:46.848207
92	75	\N	CREATED	39	Request created	2026-04-15 14:35:40.148428
93	75	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-15 14:36:21.457843
94	76	\N	CREATED	39	Request created	2026-04-15 14:38:40.78024
95	76	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-15 14:39:05.432639
96	76	MATCHED	IN_PROGRESS	75		2026-04-15 14:40:32.495608
97	77	\N	CREATED	39	Request created	2026-04-15 17:46:09.656239
98	78	\N	CREATED	93	Request created	2026-04-15 20:52:15.315607
99	78	CREATED	MATCHED	89	Assigned from admin requests page	2026-04-15 20:58:33.265933
100	78	MATCHED	COMPLETED	90		2026-04-15 21:06:04.20202
101	79	\N	CREATED	39	Request created	2026-04-15 22:10:56.585644
102	79	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-15 22:11:39.49422
103	80	\N	CREATED	39	Request created	2026-04-15 22:35:05.693424
104	80	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-15 22:35:36.136834
105	81	\N	CREATED	1	Request created	2026-04-15 22:58:03.341137
106	82	\N	CREATED	39	Request created	2026-04-17 15:06:48.856925
107	82	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-17 15:07:33.316031
108	83	\N	CREATED	93	Request created	2026-04-22 15:31:53.929023
109	83	CREATED	MATCHED	89	Assigned from admin requests page	2026-04-22 15:33:20.834015
110	83	MATCHED	IN_PROGRESS	90		2026-04-22 15:34:50.096973
111	84	\N	CREATED	93	Request created	2026-04-26 15:58:33.325485
112	84	CREATED	MATCHED	89	Assigned from admin requests page	2026-04-26 15:59:32.505235
113	84	MATCHED	IN_PROGRESS	90		2026-04-26 16:04:59.235116
114	85	\N	CREATED	39	Request created	2026-05-05 18:40:57.641889
115	85	CREATED	MATCHED	73	Assigned from admin dashboard	2026-05-05 18:42:14.873511
116	85	MATCHED	SEARCHING	73	Assignment timed out	2026-05-05 20:17:33.854627
117	85	SEARCHING	MATCHED	73	Assigned from admin dashboard	2026-05-05 20:20:40.206349
118	85	MATCHED	IN_PROGRESS	75		2026-05-05 20:25:10.570665
119	86	\N	CREATED	39	Request created	2026-05-05 20:51:53.319121
120	87	\N	CREATED	39	Request created	2026-05-05 20:52:21.147258
121	86	CREATED	MATCHED	73	Assigned from admin dashboard	2026-05-05 20:53:17.533352
122	87	CREATED	MATCHED	73	Assigned from admin dashboard	2026-05-05 20:53:24.247547
123	87	MATCHED	COMPLETED	75		2026-05-05 20:56:56.926619
124	86	MATCHED	SEARCHING	73	Assignment timed out	2026-05-05 20:59:07.438789
125	86	SEARCHING	CANCELED	39	Canceled by customer from My Requests page	2026-05-05 21:02:55.562102
126	88	\N	CREATED	39	Request created	2026-05-05 21:03:28.754605
127	89	\N	CREATED	39	Request created	2026-05-05 21:03:55.653767
128	88	CREATED	MATCHED	73	Assigned from admin dashboard	2026-05-05 21:04:48.938868
129	89	CREATED	MATCHED	73	Assigned from admin dashboard	2026-05-05 21:05:14.556755
130	88	MATCHED	SEARCHING	73	Assignment timed out	2026-05-05 21:10:10.026012
131	89	MATCHED	SEARCHING	73	Assignment timed out	2026-05-05 21:11:11.577827
132	89	SEARCHING	MATCHED	73	Assigned from admin dashboard	2026-05-05 21:26:35.484648
133	89	MATCHED	SEARCHING	73	Assignment timed out	2026-05-05 21:32:22.876785
134	89	SEARCHING	MATCHED	73	Assigned from admin dashboard	2026-05-05 23:46:29.38806
135	89	MATCHED	SEARCHING	73	Assignment timed out	2026-05-05 23:52:05.20034
136	89	SEARCHING	MATCHED	73	Assigned from admin dashboard	2026-05-06 00:02:57.680255
137	90	\N	CREATED	39	Request created	2026-05-06 13:12:49.857088
170	123	\N	CREATED	74	Request created	2026-05-13 13:40:34.532277
171	123	CREATED	MATCHED	73	Assigned from admin requests page	2026-05-13 15:04:04.434507
172	123	MATCHED	COMPLETED	76		2026-05-13 23:00:13.682602
173	124	\N	CREATED	74	Request created	2026-05-19 21:29:23.772097
174	124	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-19 21:30:43.489121
175	124	ACCEPTED	COMPLETED	76		2026-05-20 19:25:32.525625
176	125	\N	CREATED	74	Request created	2026-05-20 19:26:21.489942
177	125	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-20 19:27:05.023921
178	124	COMPLETED	ACCEPTED	75	Deal price accepted	2026-05-20 19:37:39.666793
179	126	\N	CREATED	74	Request created	2026-05-20 21:32:06.338748
180	126	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-20 21:33:22.345626
181	126	ACCEPTED	MATCHED	74	Deal price rejected	2026-05-20 21:36:13.303484
182	126	MATCHED	ACCEPTED	74	Deal price accepted	2026-05-20 21:36:41.08392
183	127	\N	CREATED	74	Request created	2026-05-20 22:17:17.841906
184	127	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-20 22:18:07.737353
185	128	\N	CREATED	74	Request created	2026-05-20 22:47:34.750021
186	128	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-20 22:48:18.758002
187	129	\N	CREATED	74	Request created	2026-05-27 14:54:07.984071
188	129	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-27 14:54:25.848601
189	130	\N	CREATED	74	Request created	2026-05-27 15:22:20.880597
190	130	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-27 15:24:30.729059
191	130	ACCEPTED	IN_PROGRESS	76	Staff checked in at customer location	2026-05-27 15:26:12.80401
192	129	ACCEPTED	IN_PROGRESS	76	Staff checked in at customer location	2026-05-27 15:30:12.806073
193	130	IN_PROGRESS	ACCEPTED	74	Deal price accepted	2026-05-27 15:33:45.93576
194	131	\N	CREATED	74	Request created	2026-05-27 22:20:02.883401
195	131	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-27 22:20:17.040562
196	131	ACCEPTED	IN_PROGRESS	76	Staff checked in at customer location	2026-05-27 22:21:40.387543
197	132	\N	CREATED	74	Request created	2026-05-27 22:22:40.145594
198	132	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-27 22:22:55.356594
199	133	\N	CREATED	74	Request created	2026-06-04 21:53:58.472906
200	133	CREATED	MATCHED	74	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-06-04 21:53:58.636659
201	134	\N	CREATED	74	Request created	2026-06-04 22:01:26.106752
202	134	CREATED	MATCHED	74	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-06-04 22:01:26.14845
203	135	\N	CREATED	74	Request created	2026-06-04 22:05:44.992403
204	135	CREATED	MATCHED	74	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-06-04 22:05:45.022446
536	133	ACCEPTED	COMPLETED	76		2026-06-18 21:59:42.293057
530	134	MATCHED	SEARCHING	74	Assignment timed out. Đang tự động tìm kiếm nhân viên tiếp theo...	2026-06-08 21:17:26.621991
531	134	SEARCHING	MATCHED	74	Hệ thống tự động gán nhân viên gần nhất: Nguyễn Quang Thiện	2026-06-08 21:17:26.754311
532	135	MATCHED	SEARCHING	74	Assignment timed out. Đang tự động tìm kiếm nhân viên tiếp theo...	2026-06-08 21:17:26.811654
533	135	SEARCHING	MATCHED	74	Hệ thống tự động gán nhân viên gần nhất: Nguyễn Quang Thiện	2026-06-08 21:17:26.859782
534	134	MATCHED	SEARCHING	74	Assignment timed out. Đang tự động tìm kiếm nhân viên tiếp theo...	2026-06-08 21:22:27.108207
535	135	MATCHED	SEARCHING	74	Assignment timed out. Đang tự động tìm kiếm nhân viên tiếp theo...	2026-06-08 21:22:27.152405
537	136	\N	CREATED	74	Request created	2026-06-18 23:29:12.548188
538	136	CREATED	MATCHED	74	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-06-18 23:29:12.559353
539	137	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-19 22:15:57.989966
540	137	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-19 22:37:36.377827
541	138	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-19 22:37:53.535931
542	138	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-19 22:43:19.828372
543	139	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-19 22:43:45.601415
544	139	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-19 22:53:58.251156
545	140	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-19 22:54:20.51105
546	140	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-19 23:03:33.341323
547	141	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-19 23:03:58.626864
548	136	ACCEPTED	COMPLETED	76		2026-06-19 23:04:31.355656
549	141	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-19 23:26:25.10632
550	132	ACCEPTED	IN_PROGRESS	76		2026-06-19 23:26:41.487202
551	132	IN_PROGRESS	COMPLETED	76		2026-06-19 23:26:47.463759
552	131	IN_PROGRESS	COMPLETED	76		2026-06-19 23:26:56.084974
553	129	IN_PROGRESS	COMPLETED	76		2026-06-19 23:27:03.137378
554	128	ACCEPTED	COMPLETED	76		2026-06-19 23:27:08.052324
555	125	ACCEPTED	COMPLETED	76		2026-06-19 23:27:21.229675
556	130	ACCEPTED	COMPLETED	76		2026-06-19 23:27:33.856144
557	127	ACCEPTED	COMPLETED	76		2026-06-19 23:27:40.855023
558	126	ACCEPTED	COMPLETED	76		2026-06-19 23:27:45.577257
559	89	MATCHED	COMPLETED	76		2026-06-19 23:27:53.221329
560	70	MATCHED	COMPLETED	76		2026-06-19 23:28:00.857052
561	71	IN_PROGRESS	COMPLETED	76		2026-06-19 23:28:05.61722
562	74	IN_PROGRESS	COMPLETED	76		2026-06-19 23:28:12.287028
563	76	IN_PROGRESS	COMPLETED	76		2026-06-19 23:28:22.684838
564	79	MATCHED	COMPLETED	76		2026-06-19 23:28:29.777208
565	142	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-19 23:30:50.688891
566	142	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-19 23:31:14.438651
567	143	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-19 23:31:35.663918
568	143	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-19 23:36:08.940699
569	144	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-19 23:36:26.247222
570	135	SEARCHING	SEARCHING	74	System dispatched request to 4 nearby staff within 651265.5 km.	2026-06-19 23:54:32.673937
571	144	SEARCHING	SEARCHING	74	System dispatched request to 1 nearby staff within 545.0 km.	2026-06-19 23:54:32.734988
572	144	SEARCHING	SEARCHING	74	System dispatched request to 4 nearby staff within 575.5 km.	2026-06-19 23:55:33.587241
573	134	SEARCHING	SEARCHING	74	System dispatched request to 4 nearby staff within 651456.0 km.	2026-06-19 23:56:34.314467
574	144	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-20 00:01:22.546415
575	145	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 00:01:38.288424
576	145	SEARCHING	SEARCHING	74	System dispatched request to 4 nearby staff within 2.0 km.	2026-06-20 00:01:38.307404
577	145	SEARCHING	IN_PROGRESS	76	Assignment accepted by staff	2026-06-20 00:02:04.995772
578	145	IN_PROGRESS	MATCHED	74	Deal price rejected	2026-06-20 00:19:02.966018
579	145	MATCHED	ACCEPTED	74	Deal price accepted	2026-06-20 00:19:37.164908
580	145	ACCEPTED	IN_PROGRESS	76	Staff checked in at customer location	2026-06-20 00:19:51.409683
581	146	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 00:28:48.07177
582	146	SEARCHING	SEARCHING	74	System dispatched request to 3 nearby staff within 2.0 km.	2026-06-20 00:28:48.1121
583	146	SEARCHING	SEARCHING	74	System dispatched request to 1 nearby staff within 32.0 km.	2026-06-20 00:29:49.025017
584	146	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-20 00:32:48.305739
585	69	MATCHED	CANCELED	74	Canceled by customer from My Requests page	2026-06-20 00:33:06.850059
586	135	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-20 00:34:08.322677
587	134	SEARCHING	CANCELED	74	Canceled by customer from My Requests page	2026-06-20 00:34:15.242862
588	147	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 00:35:37.906584
589	147	SEARCHING	SEARCHING	74	System dispatched request to 3 nearby staff within 2.0 km.	2026-06-20 00:35:37.916976
590	147	SEARCHING	IN_PROGRESS	96	Assignment accepted by staff	2026-06-20 00:36:07.543572
591	147	IN_PROGRESS	ACCEPTED	74	Deal price accepted	2026-06-20 00:36:43.567263
592	147	ACCEPTED	IN_PROGRESS	96	Staff checked in at customer location	2026-06-20 00:36:56.357713
593	147	IN_PROGRESS	COMPLETED	96		2026-06-20 00:37:19.161459
594	148	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 00:57:59.04513
595	148	SEARCHING	SEARCHING	74	System dispatched request to 3 nearby staff within 2.0 km.	2026-06-20 00:57:59.070248
596	148	SEARCHING	SEARCHING	74	System dispatched request to 1 nearby staff within 32.0 km.	2026-06-20 00:58:59.844642
597	148	SEARCHING	IN_PROGRESS	97	Assignment accepted by staff	2026-06-20 00:59:17.039234
598	149	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 01:01:00.407187
599	149	SEARCHING	SEARCHING	74	System dispatched request to 3 nearby staff within 2.0 km.	2026-06-20 01:01:00.420843
600	149	SEARCHING	IN_PROGRESS	95	Assignment accepted by staff	2026-06-20 01:01:08.002589
601	150	\N	SEARCHING	100	Request created. Searching for nearby staff.	2026-06-20 01:37:45.243991
602	150	SEARCHING	SEARCHING	100	System dispatched request to 2 nearby staff within 2.0 km.	2026-06-20 01:37:45.275718
603	151	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 01:57:28.522622
607	150	SEARCHING	IN_PROGRESS	95	Assignment accepted by staff	2026-06-20 01:58:06.579102
604	151	SEARCHING	SEARCHING	74	System dispatched request to 2 nearby staff within 2.0 km.	2026-06-20 01:57:28.532789
605	149	IN_PROGRESS	COMPLETED	95		2026-06-20 01:57:57.439122
606	150	SEARCHING	SEARCHING	100	System dispatched request to 1 nearby staff within 608.5 km.	2026-06-20 01:57:58.251974
608	150	IN_PROGRESS	COMPLETED	95		2026-06-20 01:58:38.995447
609	151	SEARCHING	SEARCHING	74	System dispatched request to 1 nearby staff within 37.5 km.	2026-06-20 01:58:39.86478
610	151	SEARCHING	IN_PROGRESS	95	Assignment accepted by staff	2026-06-20 01:58:44.822256
611	145	IN_PROGRESS	COMPLETED	76		2026-06-20 02:15:02.084061
612	152	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 02:16:14.996214
613	152	SEARCHING	SEARCHING	74	System dispatched request to 3 nearby staff within 2.0 km.	2026-06-20 02:16:15.010921
614	152	SEARCHING	IN_PROGRESS	76	Assignment accepted by staff	2026-06-20 02:16:22.495004
615	152	IN_PROGRESS	ACCEPTED	74	Deal price accepted	2026-06-20 02:16:44.697347
616	152	ACCEPTED	IN_PROGRESS	76	Staff checked in at customer location	2026-06-20 02:17:04.521938
617	152	IN_PROGRESS	COMPLETED	76		2026-06-20 02:17:33.059977
618	153	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 02:20:26.820612
619	153	SEARCHING	SEARCHING	74	System dispatched request to 3 nearby staff within 2.0 km.	2026-06-20 02:20:26.835931
620	153	SEARCHING	IN_PROGRESS	76	Assignment accepted by staff	2026-06-20 02:20:43.972957
621	153	IN_PROGRESS	COMPLETED	76		2026-06-20 02:23:12.871654
622	154	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 02:24:09.428222
623	154	SEARCHING	SEARCHING	74	System dispatched request to 2 nearby staff within 7.0 km.	2026-06-20 02:24:20.35877
624	154	SEARCHING	IN_PROGRESS	76	Assignment accepted by staff	2026-06-20 02:24:36.559122
625	154	IN_PROGRESS	COMPLETED	76		2026-06-20 02:28:15.194067
626	155	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 02:40:33.971466
627	155	SEARCHING	SEARCHING	74	System dispatched request to 1 nearby staff within 7.5 km.	2026-06-20 02:40:45.038482
628	155	SEARCHING	SEARCHING	74	System dispatched request to 2 nearby staff within 37.5 km.	2026-06-20 02:41:45.833032
629	155	SEARCHING	MATCHED	76	Assignment accepted by staff	2026-06-20 02:41:56.401518
\.


--
-- Data for Name: rescue_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_companies (id, company_name, tax_code, license_number, email, phone, description, status, created_at, updated_at, owner_account_id, address_id, latitude, longitude) FROM stdin;
1	Hanoi university of science and technology branch	001	0001	luongvanhungnet@gmail.com	0347826501	Chi nhanh cua hang tai Back Khoa, Hai Ba Trung	APPROVED	2026-04-09 07:18:18.348735	2026-05-06 13:32:25.094678	5	6	19.9962684	10.5840483
34	RapidTow Rescue	TAX-001	LIC-001	rapidtow@vbas.local	0900000010	Demo rescue company for assignment and quote flow	APPROVED	2026-04-09 14:25:29.43875	2026-05-06 13:32:25.094678	75	73	10.7731000	106.7043000
35	Thien's Company	0109876543	01H8001234	thien123@gmail.com	0329584430		APPROVED	2026-04-15 20:37:51.608427	2026-05-06 13:32:25.094678	90	95	21.0342894	105.8533942
\.


--
-- Data for Name: rescue_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_requests (id, request_code, customer_id, vehicle_id, incident_type_id, service_type_id, location_id, description, priority_level, status, created_at, updated_at, image_url, estimated_quotation_amount, fee_coefficient, service_price_snapshot, travel_cost) FROM stdin;
1	REQ-20260409073241-7B2C98	1	1	2	2	7	abcxyz	EMERGENCY	COMPLETED	2026-04-09 07:32:41.406868	2026-04-09 07:52:32.761773	\N	\N	\N	\N	\N
34	REQ-20260409195837-852823	39	\N	2	1	40	haizzzz	NORMAL	MATCHED	2026-04-09 19:58:37.77118	2026-04-09 20:23:49.965442	\N	\N	\N	\N	\N
67	REQ-20260409212729-D51458	1	1	2	2	74	Emergence	EMERGENCY	COMPLETED	2026-04-09 21:27:29.99243	2026-04-09 21:40:33.10779	\N	\N	\N	\N	\N
85	REQ-20260505184057-8579C3	39	2	35	1	104		HIGH	IN_PROGRESS	2026-05-05 18:40:57.422031	2026-05-05 20:25:10.727373	\N	\N	\N	\N	\N
68	REQ-20260411220410-FDC13B	39	2	34	1	75	hiaazzz	HIGH	MATCHED	2026-04-11 22:04:10.329348	2026-04-14 23:14:39.583454	\N	\N	\N	\N	\N
72	REQ-20260414221004-1CE96A	39	36	1	1	79	gg	HIGH	COMPLETED	2026-04-14 22:10:04.48447	2026-04-14 23:16:20.410397	\N	\N	\N	\N	\N
73	REQ-20260414232157-F2877E	39	36	2	2	80		LOW	CANCELED	2026-04-14 23:21:58.091311	2026-04-14 23:36:12.881801	\N	\N	\N	\N	\N
75	REQ-20260415143539-65BE81	39	36	1	1	82		NORMAL	MATCHED	2026-04-15 14:35:39.998125	2026-04-15 14:36:21.608318	\N	\N	\N	\N	\N
77	REQ-20260415174609-05B0A1	39	36	36	1	92	fdf	HIGH	CREATED	2026-04-15 17:46:09.396706	2026-04-15 17:46:09.396706	\N	\N	\N	\N	\N
87	REQ-20260505205220-C6EAA1	39	2	36	2	106		HIGH	COMPLETED	2026-05-05 20:52:20.993227	2026-05-05 20:56:57.083165	\N	\N	\N	\N	\N
78	REQ-20260415205214-040A76	93	37	2	2	97	Tôi bị thủng xăm trên đường 	HIGH	COMPLETED	2026-04-15 20:52:15.150052	2026-04-15 21:06:04.368211	\N	\N	\N	\N	\N
80	REQ-20260415223505-2238AC	39	36	36	36	99		LOW	MATCHED	2026-04-15 22:35:05.5378	2026-04-15 22:35:36.284526	\N	\N	\N	\N	\N
81	REQ-20260415225803-5B2A81	1	1	36	36	100	adfsa	NORMAL	CREATED	2026-04-15 22:58:03.198159	2026-04-15 22:58:03.198159	\N	\N	\N	\N	\N
82	REQ-20260417150648-3CF106	39	36	34	2	101		HIGH	MATCHED	2026-04-17 15:06:48.696396	2026-04-17 15:07:33.465839	\N	\N	\N	\N	\N
83	REQ-20260422153153-03F68F	93	37	1	1	102	abcxyz	HIGH	IN_PROGRESS	2026-04-22 15:31:53.770877	2026-04-22 15:34:50.253957	\N	\N	\N	\N	\N
84	REQ-20260426155832-A1CFB5	93	37	2	1	103		HIGH	IN_PROGRESS	2026-04-26 15:58:33.015201	2026-04-26 16:04:59.477192	\N	\N	\N	\N	\N
86	REQ-20260505205152-880A03	39	36	2	1	105		HIGH	CANCELED	2026-05-05 20:51:53.159802	2026-05-05 21:02:55.720498	\N	\N	\N	\N	\N
88	REQ-20260505210328-1D083A	39	2	34	36	107		HIGH	SEARCHING	2026-05-05 21:03:28.597929	2026-05-05 21:10:10.194692	\N	\N	\N	\N	\N
90	REQ-20260506131249-10C809	39	\N	1	\N	109	Air conditioner not working	HIGH	CREATED	2026-05-06 13:12:49.682748	2026-05-06 13:15:11.966215	/uploads/request-images/916b83bd-ff90-454a-b65e-210f8ee494c0.png	\N	\N	\N	\N
123	REQ-20260513134034-BFE3DC	74	35	36	36	144	mau mau mau, oi oi oi	NORMAL	COMPLETED	2026-05-13 13:40:34.515475	2026-05-13 23:00:13.730477	\N	\N	\N	\N	\N
129	REQ-20260527145407-C3ED37	74	35	35	35	151	sfdffaa	NORMAL	COMPLETED	2026-05-27 14:54:07.98113	2026-06-19 23:27:03.139893	/uploads/request-images/17ef8407-83b3-4733-8d21-eb6c66e6199b.jpg	1200.00	1.2000	0.00	1000.00
89	REQ-20260505210355-DDBC0E	39	36	1	2	108		HIGH	COMPLETED	2026-05-05 21:03:55.499937	2026-06-19 23:27:53.223832	\N	\N	\N	\N	\N
132	REQ-20260527222240-E769DE	74	35	35	1	154		NORMAL	COMPLETED	2026-05-27 22:22:40.143595	2026-06-19 23:26:47.466883	\N	24000.00	1.2000	0.00	20000.00
126	REQ-20260520213206-9460AA	74	38	36	36	148	kjhjjjjj	NORMAL	COMPLETED	2026-05-20 21:32:06.322856	2026-06-19 23:27:45.578763	/uploads/request-images/0a74b856-7276-4b3b-a4ad-29f8a7bfc2da.png	\N	\N	\N	\N
124	REQ-20260519212923-4F6FF1	74	35	36	36	146	alffd	NORMAL	ACCEPTED	2026-05-19 21:29:23.760445	2026-05-20 19:37:39.684816	/uploads/request-images/e665b259-02bb-41a5-9eb4-e05a3c8b9f35.jpg	\N	\N	\N	\N
128	REQ-20260520224734-2A9544	74	38	36	36	150	àdaf	NORMAL	COMPLETED	2026-05-20 22:47:34.724943	2026-06-19 23:27:08.056485	\N	\N	\N	\N	\N
125	REQ-20260520192621-15A391	74	35	36	36	147		NORMAL	COMPLETED	2026-05-20 19:26:21.479135	2026-06-19 23:27:21.234162	\N	\N	\N	\N	\N
130	REQ-20260527152220-4E2270	74	35	34	34	152		NORMAL	COMPLETED	2026-05-27 15:22:20.843672	2026-06-19 23:27:33.857143	\N	24000.00	1.2000	0.00	20000.00
127	REQ-20260520221717-9FE986	74	38	36	36	149		NORMAL	COMPLETED	2026-05-20 22:17:17.82288	2026-06-19 23:27:40.855975	\N	\N	\N	\N	\N
134	REQ-20260604220126-118BA2	74	35	36	36	156		NORMAL	CANCELED	2026-06-04 22:01:26.104278	2026-06-20 00:34:15.24838	\N	1800000.00	1.2000	1500000.00	0.00
133	REQ-20260604215358-6DB760	74	35	36	36	155	jlsdlfjf	NORMAL	COMPLETED	2026-06-04 21:53:58.440438	2026-06-18 21:59:42.348394	/uploads/request-images/eeea4bbd-77e6-422f-a5b5-e7cde47c8248.png	0.00	1.2000	0.00	0.00
137	REQ-20260619221557-FA2477	74	\N	36	36	159		NORMAL	CANCELED	2026-06-19 22:15:57.98038	2026-06-19 22:37:36.390804	\N	1812017.00	1.2000	1500000.00	10014.00
141	REQ-20260619230358-72439B	74	\N	36	36	163		NORMAL	CANCELED	2026-06-19 23:03:58.623318	2026-06-19 23:26:25.128846	\N	1812026.00	1.2000	1500000.00	10022.00
138	REQ-20260619223753-D120CB	74	\N	36	36	160		NORMAL	CANCELED	2026-06-19 22:37:53.532539	2026-06-19 22:43:19.834587	\N	1812017.00	1.2000	1500000.00	10014.00
139	REQ-20260619224345-231028	74	\N	36	36	161		NORMAL	CANCELED	2026-06-19 22:43:45.600532	2026-06-19 22:53:58.267309	\N	1812026.00	1.2000	1500000.00	10022.00
140	REQ-20260619225420-7437EB	74	\N	36	36	162		NORMAL	CANCELED	2026-06-19 22:54:20.509533	2026-06-19 23:03:33.36179	\N	1812026.00	1.2000	1500000.00	10022.00
136	REQ-20260618232912-9F40AD	74	\N	36	36	158		NORMAL	COMPLETED	2026-06-18 23:29:12.53622	2026-06-19 23:04:31.357679	\N	1812043.00	1.2000	1500000.00	10036.00
131	REQ-20260527222002-9ABC7A	74	35	35	36	153		NORMAL	COMPLETED	2026-05-27 22:20:02.868373	2026-06-19 23:26:56.087969	\N	24000.00	1.2000	0.00	20000.00
70	REQ-20260412215122-2FAF08	39	2	36	36	77	wwhyyyy	EMERGENCY	COMPLETED	2026-04-12 21:51:22.557994	2026-06-19 23:28:00.863443	\N	\N	\N	\N	\N
71	REQ-20260414202744-A39B98	39	2	35	34	78	fuuu	EMERGENCY	COMPLETED	2026-04-14 20:27:44.722912	2026-06-19 23:28:05.618728	\N	\N	\N	\N	\N
74	REQ-20260414233637-7C54B0	39	36	36	1	81		NORMAL	COMPLETED	2026-04-14 23:36:38.148402	2026-06-19 23:28:12.289538	\N	\N	\N	\N	\N
76	REQ-20260415143840-14585C	39	2	36	2	83		HIGH	COMPLETED	2026-04-15 14:38:40.631732	2026-06-19 23:28:22.689337	\N	\N	\N	\N	\N
79	REQ-20260415221056-2FCDBE	39	36	1	36	98	rhr	HIGH	COMPLETED	2026-04-15 22:10:56.426394	2026-06-19 23:28:29.778714	\N	\N	\N	\N	\N
142	REQ-20260619233050-9A71F0	74	\N	36	36	164		NORMAL	CANCELED	2026-06-19 23:30:50.686337	2026-06-19 23:31:14.440101	\N	1812026.00	1.2000	1500000.00	10022.00
69	REQ-20260412214436-E0858E	74	35	35	34	76	helllooo	HIGH	CANCELED	2026-04-12 21:44:36.577113	2026-06-20 00:33:06.855578	\N	\N	\N	\N	\N
135	REQ-20260604220544-4629C7	74	35	36	36	157		NORMAL	CANCELED	2026-06-04 22:05:44.989955	2026-06-20 00:34:08.330386	\N	1800000.00	1.2000	1500000.00	0.00
143	REQ-20260619233135-59B033	74	\N	36	36	165		NORMAL	CANCELED	2026-06-19 23:31:35.662413	2026-06-19 23:36:08.946789	\N	1812036.00	1.2000	1500000.00	10030.00
144	REQ-20260619233626-044FE8	74	\N	35	34	166		NORMAL	CANCELED	2026-06-19 23:36:26.2318	2026-06-20 00:01:22.558654	\N	612000.00	1.2000	500000.00	10000.00
153	REQ-20260620022026-2101F7	74	\N	35	34	180		NORMAL	COMPLETED	2026-06-20 02:20:26.818608	2026-06-20 02:23:12.878018	\N	614160.00	1.2000	500000.00	11800.00
154	REQ-20260620022409-E86511	74	\N	36	36	181		NORMAL	COMPLETED	2026-06-20 02:24:09.427217	2026-06-20 02:28:15.196681	\N	1890722.00	1.2000	1500000.00	75602.00
155	REQ-20260620024033-D8CE8C	74	\N	36	36	182		NORMAL	MATCHED	2026-06-20 02:40:33.963955	2026-06-20 02:41:56.40352	\N	1898035.00	1.2000	1500000.00	81696.00
146	REQ-20260620002848-A48A9D	74	35	35	34	173		NORMAL	CANCELED	2026-06-20 00:28:48.067162	2026-06-20 00:32:48.308244	\N	615286.00	1.2000	500000.00	12738.00
147	REQ-20260620003537-099C4A	74	35	36	36	174		NORMAL	COMPLETED	2026-06-20 00:35:37.903605	2026-06-20 00:37:19.161459	\N	1815286.00	1.2000	1500000.00	12738.00
148	REQ-20260620005759-7C97B3	74	\N	36	36	175		NORMAL	IN_PROGRESS	2026-06-20 00:57:59.04013	2026-06-20 00:59:17.040293	\N	1815284.00	1.2000	1500000.00	12737.00
149	REQ-20260620010100-102A42	74	\N	36	36	176		NORMAL	COMPLETED	2026-06-20 01:01:00.405281	2026-06-20 01:57:57.442729	\N	1815292.00	1.2000	1500000.00	12743.00
150	REQ-20260620013745-DA2466	100	\N	1	34	177	a	EMERGENCY	COMPLETED	2026-06-20 01:37:45.240398	2026-06-20 01:58:38.997051	/uploads/request-images/e270fbf2-3ff6-4637-b3cf-1b6ae19bdf31.png	615311.00	1.2000	500000.00	12759.00
151	REQ-20260620015728-34A759	74	\N	36	36	178		NORMAL	IN_PROGRESS	2026-06-20 01:57:28.519102	2026-06-20 01:58:44.823289	\N	1812024.00	1.2000	1500000.00	10020.00
145	REQ-20260620000138-130B1F	74	\N	35	34	172		NORMAL	COMPLETED	2026-06-20 00:01:38.286604	2026-06-20 02:15:02.097142	/uploads/request-images/453dfbaa-06e6-4ed3-b73f-cbb21155b0a8.png	615286.00	1.2000	500000.00	12738.00
152	REQ-20260620021614-582E85	74	35	36	36	179		NORMAL	COMPLETED	2026-06-20 02:16:14.993303	2026-06-20 02:17:33.060975	\N	1814160.00	1.2000	1500000.00	11800.00
\.


--
-- Data for Name: rescue_staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_staff (id, user_id, company_id, job_title, status, bio, years_experience, rescue_vehicle_id) FROM stdin;
1	6	1	Tow operator	ACTIVE	\N	\N	\N
35	91	35	Trưởng nhóm	ACTIVE	\N	\N	\N
36	92	35	Thành viên	ACTIVE	\N	\N	\N
37	94	34	Field Technician	ACTIVE	\N	\N	36
39	96	34	Field Technician	ACTIVE	\N	\N	38
40	97	34	Field Technician	ACTIVE	\N	\N	39
38	95	34	Field Technician	ACTIVE	\N	\N	37
34	76	34	Field Technician	ACTIVE	\N	\N	34
\.


--
-- Data for Name: rescue_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_vehicles (id, vehicle_code, vehicle_type, plate_number, status, company_id) FROM stdin;
1	001	001	001	AVAILABLE	1
34	RT-TRUCK-01	Tow Truck	50C-123.45	AVAILABLE	34
35	MC001	Xe cứu hộ xe máy	29X1-12345	AVAILABLE	35
36	RT-TRUCK-02	Tow Truck	50C-123.46	AVAILABLE	34
37	RT-TRUCK-03	Tow Truck	50C-123.47	AVAILABLE	34
38	RT-TRUCK-04	Tow Truck	50C-123.48	AVAILABLE	34
39	RT-TRUCK-05	Tow Truck	50C-123.49	AVAILABLE	34
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, request_id, customer_id, company_id, staff_id, rating_score, comment, created_at) FROM stdin;
1	1	1	1	1	5	Dich vu tuyet voi	2026-04-09 07:53:21.615083
34	67	1	1	1	5	dich vu tuyet voi, nhanh chong	2026-04-09 21:41:55.625873
35	123	74	34	34	4	sgjkdsjkfdhijf	2026-05-13 23:01:14.821708
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, role_name) FROM stdin;
1	CUSTOMER
2	ADMIN
3	RESCUE_COMPANY
4	RESCUE_STAFF
\.


--
-- Data for Name: service_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_types (id, service_code, service_name, description, base_price) FROM stdin;
1	001	Do day binh	Do day binh	500000.00
2	002	Va xam	Va xam	1000000.00
34	TOWING	Towing	Tow the vehicle to a garage or safe location	500000.00
35	ON_SITE_REPAIR	On-site Repair	Provide quick rescue or fix at the incident location	500000.00
36	BATTERY_SUPPORT	Battery Support	Jump start or battery emergency handling	1500000.00
\.


--
-- Data for Name: test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test (id, name) FROM stdin;
1	Hung
2	Test
\.


--
-- Data for Name: test_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_item (id, name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, full_name, phone, avatar_url, created_at, role, status) FROM stdin;
1	hung.lv235740@sis.hust.edu.vn	luong van hung	0347826500	\N	\N	\N	\N
2	Hung.dv235736@sis.hust.edu.vn	dam vinh hung	0384875608	\N	\N	\N	\N
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.account_id_seq', 101, true);


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.addresses_id_seq', 182, true);


--
-- Name: customer_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_vehicles_id_seq', 39, true);


--
-- Name: daily_statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_statistics_id_seq', 2, true);


--
-- Name: incident_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incident_types_id_seq', 36, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 87, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 225, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 8, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 49, true);


--
-- Name: pricing_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pricing_rules_id_seq', 1, false);


--
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quotes_id_seq', 51, true);


--
-- Name: request_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_assignments_id_seq', 720, true);


--
-- Name: request_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_status_history_id_seq', 629, true);


--
-- Name: rescue_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_companies_id_seq', 35, true);


--
-- Name: rescue_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_requests_id_seq', 155, true);


--
-- Name: rescue_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_staff_id_seq', 40, true);


--
-- Name: rescue_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_vehicles_id_seq', 39, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 35, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 8, true);


--
-- Name: service_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_types_id_seq', 36, true);


--
-- Name: test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_id_seq', 2, true);


--
-- Name: test_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_item_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: account account_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_vehicles customer_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT customer_vehicles_pkey PRIMARY KEY (id);


--
-- Name: daily_statistics daily_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_statistics
    ADD CONSTRAINT daily_statistics_pkey PRIMARY KEY (id);


--
-- Name: daily_statistics daily_statistics_stat_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_statistics
    ADD CONSTRAINT daily_statistics_stat_date_key UNIQUE (stat_date);


--
-- Name: incident_types incident_types_incident_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_types
    ADD CONSTRAINT incident_types_incident_code_key UNIQUE (incident_code);


--
-- Name: incident_types incident_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_types
    ADD CONSTRAINT incident_types_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: pricing_rules pricing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT pricing_rules_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_quote_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_quote_code_key UNIQUE (quote_code);


--
-- Name: request_assignments request_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT request_assignments_pkey PRIMARY KEY (id);


--
-- Name: request_status_history request_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_status_history
    ADD CONSTRAINT request_status_history_pkey PRIMARY KEY (id);


--
-- Name: rescue_companies rescue_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_companies
    ADD CONSTRAINT rescue_companies_pkey PRIMARY KEY (id);


--
-- Name: rescue_requests rescue_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT rescue_requests_pkey PRIMARY KEY (id);


--
-- Name: rescue_requests rescue_requests_request_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT rescue_requests_request_code_key UNIQUE (request_code);


--
-- Name: rescue_staff rescue_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT rescue_staff_pkey PRIMARY KEY (id);


--
-- Name: rescue_staff rescue_staff_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT rescue_staff_user_id_key UNIQUE (user_id);


--
-- Name: rescue_vehicles rescue_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_vehicles
    ADD CONSTRAINT rescue_vehicles_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (id);


--
-- Name: service_types service_types_service_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_service_code_key UNIQUE (service_code);


--
-- Name: test_item test_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_item
    ADD CONSTRAINT test_item_pkey PRIMARY KEY (id);


--
-- Name: test test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_pkey PRIMARY KEY (id);


--
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: rescue_companies uk_88vu5jnswpiykx9r5lbtd2c7e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_companies
    ADD CONSTRAINT uk_88vu5jnswpiykx9r5lbtd2c7e UNIQUE (owner_account_id);


--
-- Name: rescue_staff uk_ax9ve9nsm41t7wu12puc4tdgv; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT uk_ax9ve9nsm41t7wu12puc4tdgv UNIQUE (rescue_vehicle_id);


--
-- Name: customer_vehicles uk_ovuveuhfabs76oeq824hjsa92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT uk_ovuveuhfabs76oeq824hjsa92 UNIQUE (plate_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: rescue_companies fk1v9mpcqxufg76nd699ydb5j41; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_companies
    ADD CONSTRAINT fk1v9mpcqxufg76nd699ydb5j41 FOREIGN KEY (owner_account_id) REFERENCES public.account(id);


--
-- Name: account fk_account_default_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT fk_account_default_address FOREIGN KEY (default_address_id) REFERENCES public.addresses(id);


--
-- Name: account fk_account_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT fk_account_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: request_assignments fk_assignment_assigned_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_assigned_by FOREIGN KEY (assigned_by_user_id) REFERENCES public.account(id);


--
-- Name: request_assignments fk_assignment_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: request_assignments fk_assignment_request; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: request_assignments fk_assignment_staff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_staff FOREIGN KEY (staff_id) REFERENCES public.rescue_staff(id);


--
-- Name: request_assignments fk_assignment_vehicle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.rescue_vehicles(id);


--
-- Name: customer_vehicles fk_customer_vehicle_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT fk_customer_vehicle_customer FOREIGN KEY (customer_id) REFERENCES public.account(id);


--
-- Name: messages fk_message_request; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_message_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: messages fk_message_sender; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES public.account(id);


--
-- Name: password_reset_tokens fk_password_reset_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES public.account(id);


--
-- Name: payments fk_payment_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payment_customer FOREIGN KEY (customer_id) REFERENCES public.account(id);


--
-- Name: payments fk_payment_request; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payment_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: pricing_rules fk_pricing_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT fk_pricing_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: pricing_rules fk_pricing_service_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT fk_pricing_service_type FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: quotes fk_quote_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT fk_quote_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: quotes fk_quote_request; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT fk_quote_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: quotes fk_quote_staff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT fk_quote_staff FOREIGN KEY (staff_id) REFERENCES public.rescue_staff(id);


--
-- Name: rescue_requests fk_request_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_customer FOREIGN KEY (customer_id) REFERENCES public.account(id);


--
-- Name: rescue_requests fk_request_incident_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_incident_type FOREIGN KEY (incident_type_id) REFERENCES public.incident_types(id);


--
-- Name: rescue_requests fk_request_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_location FOREIGN KEY (location_id) REFERENCES public.addresses(id);


--
-- Name: rescue_requests fk_request_service_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_service_type FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: rescue_requests fk_request_vehicle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.customer_vehicles(id);


--
-- Name: rescue_companies fk_rescue_company_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_companies
    ADD CONSTRAINT fk_rescue_company_address FOREIGN KEY (address_id) REFERENCES public.addresses(id);


--
-- Name: rescue_vehicles fk_rescue_vehicle_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_vehicles
    ADD CONSTRAINT fk_rescue_vehicle_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: reviews fk_review_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_review_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: reviews fk_review_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_review_customer FOREIGN KEY (customer_id) REFERENCES public.account(id);


--
-- Name: reviews fk_review_request; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_review_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: reviews fk_review_staff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_review_staff FOREIGN KEY (staff_id) REFERENCES public.rescue_staff(id);


--
-- Name: rescue_staff fk_staff_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT fk_staff_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: rescue_staff fk_staff_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES public.account(id);


--
-- Name: request_status_history fk_status_history_request; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_status_history
    ADD CONSTRAINT fk_status_history_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: request_status_history fk_status_history_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_status_history
    ADD CONSTRAINT fk_status_history_user FOREIGN KEY (changed_by_user_id) REFERENCES public.account(id);


--
-- Name: notifications fkamphdcaowukplu3bb2o7ipa9w; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fkamphdcaowukplu3bb2o7ipa9w FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: notifications fkfi3v13tgm7oogelglncpywov2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fkfi3v13tgm7oogelglncpywov2 FOREIGN KEY (recipient_id) REFERENCES public.account(id);


--
-- Name: rescue_staff fkgx7kipjhgg1sueam0i2l5i30g; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT fkgx7kipjhgg1sueam0i2l5i30g FOREIGN KEY (rescue_vehicle_id) REFERENCES public.rescue_vehicles(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

