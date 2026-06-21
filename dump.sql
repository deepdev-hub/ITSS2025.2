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
4	hungwzzzz@gmail.com	$2a$10$WGpD5zBFAXfdCbSboFLVkOx.T/D8gN6afCtNsWa6XLxIofhVIpv7K	Luong Van Hung	0347826500	\N	ACTIVE	2026-04-09 07:08:30.730755	2	2025-02-22	Male	2	020205006133
6	luongvanhungnote@gmail.com	$2a$10$n1n4VGP3j3iJZco70VjY.OE1JXnd9ZsmJqjxN8tfiWWiSzwuRuYJ6	Luong Van Hung	0334826500		ACTIVE	2026-04-09 07:19:13.182251	4	2005-02-22	Male	4	020205006135
40	dam02@gmail.com	$2a$10$akb8tAaapPBqeoCgX/v3GeMPOIoCdxoTgtczNmcMSdEs8AOSu4GYe	Admin Dam	\N	\N	ACTIVE	2026-04-09 20:13:52.267908	2	\N	\N	\N	\N
41	dam03@gmail.com	$2a$10$NRwoFLLjuk2ZTE1K16heaexTf49iojih0bJZzm/c0riOh.VADCqL2	Company Dam	\N	\N	ACTIVE	2026-04-09 20:15:08.537506	3	\N	\N	\N	\N
42	dam04@gmail.com	$2a$10$gTwyGcpzHPsCMoXhu0n9hunmBIIztteFqhZCuTTJTCdRINmez6Y4S	Staff Dam	\N	\N	ACTIVE	2026-04-09 20:15:49.665559	4	\N	\N	\N	\N
73	admin@vbas.local	$2a$10$qanvJAbG.SetU9EJf.iCx.DmHuKNd3K./UF49zB2cnTH1j1w/Rqnq	System Admin	0900000001	\N	ACTIVE	2026-04-09 14:25:29.43875	2	\N	MALE	\N	\N
88	duyhung22102005@gmail.com	$2a$10$zLk7yh3fDblyy7pa9RqkS.sWxG0UPwaY/xIyAbg1ePPgq61AMYKAe	Trần Duy Hưng	0911905611	\N	ACTIVE	2026-04-15 18:30:54.8599	1	\N	\N	\N	\N
89	thien.nq235838@sis.hust.edu.vn	$2a$10$heYTBvUo8g4HyaocgAnLOO1HEHd6y4x4UGzkjrCC1qs/hjF2cS/cy	Nguyễn Quang Thiện	0329584430		ACTIVE	2026-04-15 19:23:30.331658	2	\N		93	12458484837
90	thien123@gmail.com	$2a$10$Y2mYefCRlV5mEBe/kgtH8e9OF60lzHeC7VN5fLVGRmVZDSxerRX8a	Nguyễn Quang Thiện	0329584430		ACTIVE	2026-04-15 19:31:44.729521	3	2005-03-11		94	012345678912
39	dam01@gmail.com	$2a$10$wbwcYVaz3BZbRR0ERM3kp.BuNbnluIM7HkJfXd7nLLW/YTJJ/fH52	Hung Dam	0384875608	/uploads/avatars/95799a1d-68d0-42c6-a65a-95d61b9a5607.png	ACTIVE	2026-04-09 19:57:43.432084	1	\N	\N	\N	\N
93	thien113205@gmail.com	$2a$10$VetlWCsrNI0poUxQHXVgLOI/c0Barx6ytJA1kl39nIpzhZz0CV9UC	Nguyễn Quang Thiện	0329584430		BANNED	2026-04-15 20:44:06.563483	1	\N		96	12345678999
91	nguyenquangthien1132005@gmail.com	$2a$10$GfuQJOqohdPxyWure1VLHOay01pO4u2AaKqv1UqexHfw.qLAbable	Nguyễn Quang Thiện	0329584430	\N	BANNED	2026-04-15 20:39:59.124745	4	\N	\N	\N	\N
92	huyen29112002@gmail.com	$2a$10$IOjgmWg0qB/SCUbDS2meDu/LH8xSoPPGZtbpPD7WfJVzs6LEHGnL.	Nguyễn Quang Thiện	0329584430	\N	ACTIVE	2026-04-15 20:40:17.361165	4	\N	\N	110	\N
75	company@vbas.local	$2a$10$rjHPQwx0fREqDoBTeNTStuK54bl.jGhfHO8QV/fotDrMlK5utkLOm	RapidTow Owner	0900000003	D:\\program\\itss\\ITSS2025.2\\uploads\\avatars\\95799a1d-68d0-42c6-a65a-95d61b9a5607.png	ACTIVE	2026-04-09 14:25:29.43875	3	\N	MALE	143	
5	luongvanhungnet@gmail.com	$2a$10$UfkxHFo9RsWfE3rcayuu7unvolD8TsGAIjnoksHFd7xcbQwlwQ9IW	Luong Van Hung	0333826500		ACTIVE	2026-04-09 07:12:17.230256	3	2005-02-22	Male	3	020205006134
76	staff@vbas.local	$2a$10$7Q2uIg4PZN4te9memDTjD.x3egu0ZpuTBPX0zyYnNQrp71Rnj6Lmi	RapidTow Staff 1	0900000004	\N	ACTIVE	2026-04-09 14:25:29.43875	4	\N	MALE	145	\N
74	customer@vbas.local	$2a$10$G.bQwF3fvlGgOLlhFzM31eguLkhbvON3O3CQ0B.RTovQrpj2zrC2C	Demo Customer	0900000002	\N	ACTIVE	2026-04-09 14:25:29.43875	1	\N	FEMALE	167	\N
94	staff2@vbas.local	$2a$10$V7bbTKkQYzA.pZER2fxYOekYu/CsrBoRhCh/zGkGcHK/wCeKWo4li	RapidTow Staff 2	0900000005	\N	ACTIVE	2026-06-19 23:43:32.504656	4	\N	MALE	168	\N
95	staff3@vbas.local	$2a$10$MXj0B.51IU.inW4Jo/L7IetaRNEqGaJBNTwZbW20Vm0Gy6izvC2XS	RapidTow Staff 3	0900000006	\N	ACTIVE	2026-06-19 23:43:32.654526	4	\N	MALE	169	\N
96	staff4@vbas.local	$2a$10$Z2fjuTTHEFaH/3kiaKb0neusr.WkaU43CDC4Izo7Rvwp5971k0yh.	RapidTow Staff 4	0900000007	\N	ACTIVE	2026-06-19 23:43:32.901846	4	\N	MALE	170	\N
97	staff5@vbas.local	$2a$10$2v/dBT.NDjRlViyBOzcGK.INx2jhWqLdYljtLrB2Mpzcp81mUAHwu	RapidTow Staff 5	0900000008	\N	ACTIVE	2026-06-19 23:43:33.070194	4	\N	MALE	171	\N
98	hung.lv23570@sis.hust.edu.vn	$2a$10$5IOkLXoD4pcIlqlAznhOiOKDOVTBlzGzB9C5qgW41pEL6NY8zNFFK	luong van hung	0347826500	\N	ACTIVE	2026-06-20 01:22:51.523112	1	2026-07-11	male	\N	90870707970
99	hung.lv2350@sis.hust.edu.vn	$2a$10$Ng5kBbmnCVMODwEaJB2ysedGKlQjrlvLMevmzx67g9YWYirrXK5AG	luong van hung	0347826500	\N	ACTIVE	2026-06-20 01:34:28.663907	1	2000-07-11	male	\N	8250845845840
9001	clean.admin@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Clean System Admin	0909000001	\N	ACTIVE	2026-06-21 08:00:00	2	1995-01-01	MALE	9001	001900000001
9011	clean.customer01@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Nguyen Minh Anh	0919000001	\N	ACTIVE	2026-06-21 08:00:00	1	1999-01-02	FEMALE	9001	001900010001
9012	clean.customer02@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Tran Hoang Nam	0919000002	\N	ACTIVE	2026-06-21 08:00:00	1	2000-02-03	MALE	9002	001900010002
9013	clean.customer03@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Le Thu Ha	0919000003	\N	ACTIVE	2026-06-21 08:00:00	1	2001-03-04	FEMALE	9003	001900010003
9014	clean.customer04@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Pham Quang Huy	0919000004	\N	ACTIVE	2026-06-21 08:00:00	1	2002-04-05	MALE	9004	001900010004
9015	clean.customer05@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Do Bao Chau	0919000005	\N	ACTIVE	2026-06-21 08:00:00	1	2003-05-06	FEMALE	9005	001900010005
9016	clean.customer06@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Vu Gia Bao	0919000006	\N	ACTIVE	2026-06-21 08:00:00	1	2004-06-07	MALE	9006	001900010006
9017	clean.customer07@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Hoang Thanh Tung	0919000007	\N	ACTIVE	2026-06-21 08:00:00	1	2005-07-08	MALE	9007	001900010007
9018	clean.customer08@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Bui Ngoc Linh	0919000008	\N	ACTIVE	2026-06-21 08:00:00	1	1998-08-09	FEMALE	9008	001900010008
9019	clean.customer09@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Dang Tuan Kiet	0919000009	\N	ACTIVE	2026-06-21 08:00:00	1	1999-09-10	MALE	9009	001900010009
9020	clean.customer10@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ngo Phuong Mai	0919000010	\N	ACTIVE	2026-06-21 08:00:00	1	2000-10-11	FEMALE	9010	001900010010
9021	clean.staff01@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Pham Van Son	0929000001	\N	ACTIVE	2026-06-21 08:00:00	4	1991-01-03	MALE	\N	001900020001
9022	clean.staff02@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Nguyen Duc Tai	0929000002	\N	ACTIVE	2026-06-21 08:00:00	4	1992-02-04	MALE	\N	001900020002
9023	clean.staff03@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Tran Manh Cuong	0929000003	\N	ACTIVE	2026-06-21 08:00:00	4	1993-03-05	MALE	\N	001900020003
9024	clean.staff04@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Le Quoc Viet	0929000004	\N	ACTIVE	2026-06-21 08:00:00	4	1994-04-06	MALE	\N	001900020004
9025	clean.staff05@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Do Minh Tuan	0929000005	\N	ACTIVE	2026-06-21 08:00:00	4	1995-05-07	MALE	\N	001900020005
9026	clean.staff06@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Hoang Anh Duc	0929000006	\N	ACTIVE	2026-06-21 08:00:00	4	1996-06-08	MALE	\N	001900020006
9027	clean.staff07@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Bui Hai Nam	0929000007	\N	ACTIVE	2026-06-21 08:00:00	4	1997-07-09	MALE	\N	001900020007
9028	clean.staff08@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Vu Thanh Lam	0929000008	\N	ACTIVE	2026-06-21 08:00:00	4	1998-08-10	MALE	\N	001900020008
9029	clean.staff09@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Dang Quoc Bao	0929000009	\N	ACTIVE	2026-06-21 08:00:00	4	1999-09-11	MALE	\N	001900020009
9030	clean.staff10@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ngo Tien Dat	0929000010	\N	ACTIVE	2026-06-21 08:00:00	4	1990-10-12	MALE	\N	001900020010
9031	clean.owner01@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 01	0939000001	\N	ACTIVE	2026-06-21 08:00:00	3	1986-01-04	MALE	\N	001900030001
9032	clean.owner02@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 02	0939000002	\N	ACTIVE	2026-06-21 08:00:00	3	1987-02-05	MALE	\N	001900030002
9033	clean.owner03@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 03	0939000003	\N	ACTIVE	2026-06-21 08:00:00	3	1988-03-06	MALE	\N	001900030003
9034	clean.owner04@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 04	0939000004	\N	ACTIVE	2026-06-21 08:00:00	3	1989-04-07	MALE	\N	001900030004
9035	clean.owner05@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 05	0939000005	\N	ACTIVE	2026-06-21 08:00:00	3	1990-05-08	MALE	\N	001900030005
9036	clean.owner06@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 06	0939000006	\N	ACTIVE	2026-06-21 08:00:00	3	1991-06-09	MALE	\N	001900030006
9037	clean.owner07@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 07	0939000007	\N	ACTIVE	2026-06-21 08:00:00	3	1992-07-10	MALE	\N	001900030007
9038	clean.owner08@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 08	0939000008	\N	ACTIVE	2026-06-21 08:00:00	3	1993-08-11	MALE	\N	001900030008
9039	clean.owner09@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 09	0939000009	\N	ACTIVE	2026-06-21 08:00:00	3	1994-09-12	MALE	\N	001900030009
9040	clean.owner10@vbas.local	$2a$10$l5x6tg4F8X/cNrvbhwRw9urabSXYj3x8FZmwxHVMKzS.isD6Dnn7K	Ha Noi Rescue Owner 10	0939000010	\N	ACTIVE	2026-06-21 08:00:00	3	1985-10-13	MALE	\N	001900030010
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
183	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0050784	105.8458632
145	Vietnam	Ha Noi	Hai Ba Trung	Bach Khoa	Tran Dai Nghia	Staff point 1	21.0074100	105.8464100
184	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0050542	105.8458707
185	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0050542	105.8458707
186	Vietnam	Hà Nội		Phường Bạch Mai	Đường Đại Cồ Việt	VietinBank, 1	21.0050718	105.8458708
9001	Vietnam	Ha Noi	Hoan Kiem	Hang Trong	Pho Trang Tien	Gan Nha hat Lon Ha Noi	21.0245000	105.8572000
9002	Vietnam	Ha Noi	Hai Ba Trung	Bach Khoa	Dai Co Viet	Cong truong Dai hoc Bach Khoa Ha Noi	21.0051000	105.8437000
9003	Vietnam	Ha Noi	Dong Da	Lang Thuong	Chua Lang	Khu vuc gan truong Ngoai Thuong	21.0233000	105.8029000
9004	Vietnam	Ha Noi	Cau Giay	Dich Vong Hau	Xuan Thuy	Gan cong vien Cau Giay	21.0369000	105.7825000
9005	Vietnam	Ha Noi	Tay Ho	Nhat Tan	Au Co	Gan cau Nhat Tan	21.0682000	105.8159000
9006	Vietnam	Ha Noi	Thanh Xuan	Nhan Chinh	Nguyen Trai	Gan Royal City	21.0029000	105.8155000
9007	Vietnam	Ha Noi	Nam Tu Liem	My Dinh 1	Le Duc Tho	Gan ben xe My Dinh	21.0298000	105.7789000
9008	Vietnam	Ha Noi	Long Bien	Ngoc Lam	Nguyen Van Cu	Gan cau Chuong Duong	21.0417000	105.8746000
9009	Vietnam	Ha Noi	Ha Dong	Mo Lao	To Huu	Gan khu do thi Mo Lao	20.9803000	105.7878000
9010	Vietnam	Ha Noi	Hoang Mai	Giap Bat	Giai Phong	Gan ben xe Giap Bat	20.9809000	105.8416000
\.


--
-- Data for Name: customer_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_vehicles (id, customer_id, fuel_type, notes, brand, color, manufacture_year, model, plate_number) FROM stdin;
2	39		Xe chính chủ, bảo dưỡng định kỳ tại hãng, đã dán phim cách nhiệt.	Toyota	đen	2023	Camry 2.5Q	30H - 123.45
35	74	Gasoline	Seed vehicle for demo customer	Toyota	White	2021	Vios	51A-888.88
36	39			Tesla	đỏ	2023	Vin 2.5Q	29F - 123.45
37	93	Dầu 	Xe gia đình 5 chỗ	Toyota	Đen	2019	Vios	29B-54321
9001	9011	Gasoline	Xe demo cua khach hang 1, bao duong dinh ky	Toyota	Trang	2016	Vios	30A-CLEAN-01
9002	9012	Gasoline	Xe demo cua khach hang 2, bao duong dinh ky	Honda	Den	2017	City	30A-CLEAN-02
9003	9013	Electric	Xe demo cua khach hang 3, bao duong dinh ky	VinFast	Xanh	2018	VF e34	30A-CLEAN-03
9004	9014	Gasoline	Xe demo cua khach hang 4, bao duong dinh ky	Mazda	Do	2019	CX-5	30A-CLEAN-04
9005	9015	Gasoline	Xe demo cua khach hang 5, bao duong dinh ky	Kia	Bac	2020	Seltos	30A-CLEAN-05
9006	9016	Gasoline	Xe demo cua khach hang 6, bao duong dinh ky	Hyundai	Ghi	2021	Accent	30A-CLEAN-06
9007	9017	Gasoline	Xe demo cua khach hang 7, bao duong dinh ky	Ford	Nau	2022	Ranger	30A-CLEAN-07
9008	9018	Gasoline	Xe demo cua khach hang 8, bao duong dinh ky	Mitsubishi	Vang	2023	Xpander	30A-CLEAN-08
9009	9019	Gasoline	Xe demo cua khach hang 9, bao duong dinh ky	Nissan	Xam	2024	Almera	30A-CLEAN-09
9010	9020	Gasoline	Xe demo cua khach hang 10, bao duong dinh ky	Suzuki	Xanh dam	2025	Ertiga	30A-CLEAN-10
\.


--
-- Data for Name: daily_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_statistics (id, stat_date, request_count, completed_request_count, canceled_request_count, in_progress_request_count, paid_payment_count, revenue, review_count, average_rating, customer_count, staff_count, company_count, approved_company_count, calculated_at) FROM stdin;
1	2026-05-06	26	5	2	6	3	1100000.00	2	5.00	9	4	3	3	2026-05-06 22:15:20.855265
2	2026-05-27	34	6	2	7	8	5300000.00	3	4.67	9	4	3	3	2026-05-27 15:41:43.327328
9001	2026-06-01	9	6	1	2	5	1250000.00	4	4.35	21	11	6	5	2026-06-01 23:50:00
9002	2026-06-02	10	7	2	1	6	1500000.00	5	4.50	22	12	7	6	2026-06-02 23:50:00
9003	2026-06-03	11	8	0	2	7	1750000.00	6	4.65	23	13	5	4	2026-06-03 23:50:00
9004	2026-06-04	12	5	1	1	8	2000000.00	7	4.20	24	14	6	5	2026-06-04 23:50:00
9005	2026-06-05	13	6	2	2	4	2250000.00	8	4.35	25	15	7	6	2026-06-05 23:50:00
9006	2026-06-06	14	7	0	1	5	2500000.00	3	4.50	26	16	5	4	2026-06-06 23:50:00
9007	2026-06-07	15	8	1	2	6	2750000.00	4	4.65	27	17	6	5	2026-06-07 23:50:00
9008	2026-06-08	16	5	2	1	7	3000000.00	5	4.20	28	18	7	6	2026-06-08 23:50:00
9009	2026-06-09	17	6	0	2	8	3250000.00	6	4.35	29	19	5	4	2026-06-09 23:50:00
9010	2026-06-10	18	7	1	1	4	3500000.00	7	4.50	30	20	6	5	2026-06-10 23:50:00
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
9001	CLEAN_INC_01	Het ac quy	Xe khong khoi dong duoc do het ac quy
9002	CLEAN_INC_02	Thung lop	Lop xe bi thung hoac bi xep hoi
9003	CLEAN_INC_03	Het xang	Xe het nhien lieu khi dang di chuyen
9004	CLEAN_INC_04	Hong dong co	Dong co bao loi hoac khong the tiep tuc van hanh
9005	CLEAN_INC_05	Khoa xe	Khach bi khoa cua, mat chia khoa hoac ket khoa
9006	CLEAN_INC_06	Tai nan nhe	Va cham nhe can ho tro an toan
9007	CLEAN_INC_07	Can keo xe	Xe can duoc keo ve gara hoac dia diem an toan
9008	CLEAN_INC_08	Loi dien	He thong dien tren xe gap su co
9009	CLEAN_INC_09	Qua nhiet	Xe bi nong may hoac can bo sung nuoc lam mat
9010	CLEAN_INC_10	Ho tro khan cap	Tinh huong khan cap can uu tien xu ly
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, request_id, sender_id, content, sent_at) FROM stdin;
88	156	76	hello	2026-06-21 10:41:17.676023
9001	9001	9011	Chao anh, xe cua toi khong khoi dong duoc, nho anh ho tro som.	2026-06-11 09:26:00
9002	9002	9022	Toi da nhan vi tri, se den trong khoang 10 phut.	2026-06-12 09:27:00
9003	9003	9013	Lop xe bi xep hoi, xe dang dung sat le duong.	2026-06-13 09:28:00
9004	9004	9024	Anh vui long bat den canh bao va dung yen tai vi tri an toan.	2026-06-14 09:29:00
9005	9005	9015	Xe bao loi dong co, toi khong dam di tiep.	2026-06-15 09:30:00
9006	9006	9026	Toi se kiem tra nhanh va bao gia truoc khi xu ly.	2026-06-16 09:31:00
9007	9007	9017	Xe can keo ve gara gan nhat, cam on anh.	2026-06-17 09:32:00
9008	9008	9028	Toi da cap nhat bao gia tren he thong, anh vui long xac nhan.	2026-06-18 09:33:00
9009	9009	9019	Khach da thanh toan, bat dau thuc hien cuu ho.	2026-06-19 09:34:00
9010	9010	9030	Yeu cau da hoan thanh, cam on quy khach da su dung dich vu.	2026-06-20 09:35:00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, created_at, message, is_read, read_at, title, type, recipient_id, request_id) FROM stdin;
4	2026-06-18 23:33:12.44725	RapidTow Staff đã nhận chuyến REQ-20260618232912-9F40AD.	t	2026-06-19 22:56:15.529224	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	136
5	2026-06-19 23:04:31.360642	Yêu cầu REQ-20260618232912-9F40AD đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:04:54.259751	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	136
14	2026-06-19 23:27:53.224839	Yêu cầu REQ-20260505210355-DDBC0E đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	39	89
17	2026-06-19 23:28:12.291555	Yêu cầu REQ-20260414233637-7C54B0 đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	39	74
18	2026-06-19 23:28:22.692365	Yêu cầu REQ-20260415143840-14585C đã được thợ cập nhật hoàn thành.	f	\N	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	39	76
11	2026-06-19 23:27:33.859655	Yêu cầu REQ-20260527152220-4E2270 đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	130
10	2026-06-19 23:27:21.237381	Yêu cầu REQ-20260520192621-15A391 đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	125
7	2026-06-19 23:26:56.091098	Yêu cầu REQ-20260527222002-9ABC7A đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	131
6	2026-06-19 23:26:47.477933	Yêu cầu REQ-20260527222240-E769DE đã được thợ cập nhật hoàn thành.	t	2026-06-19 23:30:32.43652	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	132
162	2026-06-19 23:54:32.665542	Ban vua duoc giao yeu cau REQ-20260604220544-4629C7. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	135
163	2026-06-19 23:54:32.66654	Ban vua duoc giao yeu cau REQ-20260604220544-4629C7. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	135
166	2026-06-19 23:55:33.583242	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	144
169	2026-06-19 23:55:33.586243	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	144
170	2026-06-19 23:56:34.311445	Ban vua duoc giao yeu cau REQ-20260604220126-118BA2. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	134
173	2026-06-19 23:56:34.313427	Ban vua duoc giao yeu cau REQ-20260604220126-118BA2. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	134
165	2026-06-19 23:54:32.732372	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:01:11.210706	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	144
175	2026-06-20 00:01:38.303805	Ban vua duoc giao yeu cau REQ-20260620000138-130B1F. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	145
174	2026-06-20 00:01:38.302211	Ban vua duoc giao yeu cau REQ-20260620000138-130B1F. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:01:45.95645	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	145
179	2026-06-20 00:28:48.099788	Ban vua duoc giao yeu cau REQ-20260620002848-A48A9D. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	146
177	2026-06-20 00:01:38.304907	Ban vua duoc giao yeu cau REQ-20260620000138-130B1F. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	145
172	2026-06-19 23:56:34.313066	Ban vua duoc giao yeu cau REQ-20260604220126-118BA2. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	134
168	2026-06-19 23:55:33.585242	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	144
161	2026-06-19 23:54:32.662533	Ban vua duoc giao yeu cau REQ-20260604220544-4629C7. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	135
178	2026-06-20 00:02:05.000455	RapidTow Staff 1 đã nhận chuyến REQ-20260620000138-130B1F.	t	2026-06-21 11:00:15.938588	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	145
182	2026-06-20 00:29:49.023995	Ban vua duoc giao yeu cau REQ-20260620002848-A48A9D. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:30:02.471562	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	146
183	2026-06-20 00:35:37.915958	Ban vua duoc giao yeu cau REQ-20260620003537-099C4A. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	147
184	2026-06-20 00:35:37.915958	Ban vua duoc giao yeu cau REQ-20260620003537-099C4A. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:07.30964	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	147
180	2026-06-20 00:28:48.102793	Ban vua duoc giao yeu cau REQ-20260620002848-A48A9D. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	146
176	2026-06-20 00:01:38.303805	Ban vua duoc giao yeu cau REQ-20260620000138-130B1F. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	145
171	2026-06-19 23:56:34.312445	Ban vua duoc giao yeu cau REQ-20260604220126-118BA2. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	134
167	2026-06-19 23:55:33.584242	Ban vua duoc giao yeu cau REQ-20260619233626-044FE8. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	144
164	2026-06-19 23:54:32.6682	Ban vua duoc giao yeu cau REQ-20260604220544-4629C7. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:56:12.423472	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	135
188	2026-06-20 00:57:59.067103	Ban vua duoc giao yeu cau REQ-20260620005759-7C97B3. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	148
189	2026-06-20 00:57:59.068303	Ban vua duoc giao yeu cau REQ-20260620005759-7C97B3. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	148
191	2026-06-20 00:58:59.842636	Ban vua duoc giao yeu cau REQ-20260620005759-7C97B3. Hay chap nhan trong vong 60 giay.	t	2026-06-20 00:59:08.668795	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	97	148
193	2026-06-20 01:01:00.419836	Ban vua duoc giao yeu cau REQ-20260620010100-102A42. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	149
194	2026-06-20 01:01:00.419836	Ban vua duoc giao yeu cau REQ-20260620010100-102A42. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	149
195	2026-06-20 01:01:00.420843	Ban vua duoc giao yeu cau REQ-20260620010100-102A42. Hay chap nhan trong vong 60 giay.	t	2026-06-20 01:01:06.502437	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	149
199	2026-06-20 01:57:28.53181	Ban vua duoc giao yeu cau REQ-20260620015728-34A759. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	151
200	2026-06-20 01:57:28.532789	Ban vua duoc giao yeu cau REQ-20260620015728-34A759. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	151
205	2026-06-20 01:58:39.863782	Ban vua duoc giao yeu cau REQ-20260620015728-34A759. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:01.599924	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	151
190	2026-06-20 00:57:59.068303	Ban vua duoc giao yeu cau REQ-20260620005759-7C97B3. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	148
185	2026-06-20 00:35:37.916976	Ban vua duoc giao yeu cau REQ-20260620003537-099C4A. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	147
181	2026-06-20 00:28:48.103794	Ban vua duoc giao yeu cau REQ-20260620002848-A48A9D. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:03:09.488136	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	95	146
208	2026-06-20 02:16:15.005847	Ban vua duoc giao yeu cau REQ-20260620021614-582E85. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	152
210	2026-06-20 02:16:15.010921	Ban vua duoc giao yeu cau REQ-20260620021614-582E85. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	152
209	2026-06-20 02:16:15.009018	Ban vua duoc giao yeu cau REQ-20260620021614-582E85. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:16:20.591036	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	152
213	2026-06-20 02:20:26.832845	Ban vua duoc giao yeu cau REQ-20260620022026-2101F7. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	153
215	2026-06-20 02:20:26.835931	Ban vua duoc giao yeu cau REQ-20260620022026-2101F7. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	153
214	2026-06-20 02:20:26.834843	Ban vua duoc giao yeu cau REQ-20260620022026-2101F7. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:20:32.371774	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	153
219	2026-06-20 02:24:20.356768	Ban vua duoc giao yeu cau REQ-20260620022409-E86511. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	154
218	2026-06-20 02:24:20.355762	Ban vua duoc giao yeu cau REQ-20260620022409-E86511. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:24:34.96853	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	154
222	2026-06-20 02:40:45.036478	Ban vua duoc giao yeu cau REQ-20260620024033-D8CE8C. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	155
223	2026-06-20 02:41:45.831913	Ban vua duoc giao yeu cau REQ-20260620024033-D8CE8C. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	155
224	2026-06-20 02:41:45.831913	Ban vua duoc giao yeu cau REQ-20260620024033-D8CE8C. Hay chap nhan trong vong 60 giay.	t	2026-06-20 02:41:54.520838	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	155
227	2026-06-21 10:25:08.562824	Ban vua duoc giao yeu cau REQ-20260621102508-4A83B2. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	156
228	2026-06-21 10:25:08.562824	Ban vua duoc giao yeu cau REQ-20260621102508-4A83B2. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	156
226	2026-06-21 10:25:08.547419	Ban vua duoc giao yeu cau REQ-20260621102508-4A83B2. Hay chap nhan trong vong 60 giay.	t	2026-06-21 10:25:26.865041	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	156
230	2026-06-21 10:55:36.546135	Ban vua duoc giao yeu cau REQ-20260621105536-A1580C. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	157
231	2026-06-21 10:55:36.546135	Ban vua duoc giao yeu cau REQ-20260621105536-A1580C. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	157
229	2026-06-21 10:25:28.983635	RapidTow Staff 1 has accepted request REQ-20260621102508-4A83B2.	t	2026-06-21 11:00:15.938588	Staff accepted the request	ASSIGNMENT_ACCEPTED	74	156
225	2026-06-20 02:41:56.405517	RapidTow Staff 1 đã nhận chuyến REQ-20260620024033-D8CE8C.	t	2026-06-21 11:00:15.938588	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	155
221	2026-06-20 02:28:15.200679	Yêu cầu REQ-20260620022409-E86511 đã được thợ cập nhật hoàn thành.	t	2026-06-21 11:00:15.938588	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	154
220	2026-06-20 02:24:36.563665	RapidTow Staff 1 đã nhận chuyến REQ-20260620022409-E86511.	t	2026-06-21 11:00:15.938588	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	154
217	2026-06-20 02:23:12.881023	Yêu cầu REQ-20260620022026-2101F7 đã được thợ cập nhật hoàn thành.	t	2026-06-21 11:00:15.938588	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	153
216	2026-06-20 02:20:43.974953	RapidTow Staff 1 đã nhận chuyến REQ-20260620022026-2101F7.	t	2026-06-21 11:00:15.938588	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	153
212	2026-06-20 02:17:33.062988	Yêu cầu REQ-20260620021614-582E85 đã được thợ cập nhật hoàn thành.	t	2026-06-21 11:00:15.938588	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	152
211	2026-06-20 02:16:22.49744	RapidTow Staff 1 đã nhận chuyến REQ-20260620021614-582E85.	t	2026-06-21 11:00:15.938588	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	152
207	2026-06-20 02:15:02.101446	Yêu cầu REQ-20260620000138-130B1F đã được thợ cập nhật hoàn thành.	t	2026-06-21 11:00:15.938588	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	145
206	2026-06-20 01:58:44.824139	RapidTow Staff 3 đã nhận chuyến REQ-20260620015728-34A759.	t	2026-06-21 11:00:15.938588	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	151
201	2026-06-20 01:57:57.449246	Yêu cầu REQ-20260620010100-102A42 đã được thợ cập nhật hoàn thành.	t	2026-06-21 11:00:15.938588	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	149
196	2026-06-20 01:01:08.004594	RapidTow Staff 3 đã nhận chuyến REQ-20260620010100-102A42.	t	2026-06-21 11:00:15.938588	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	149
192	2026-06-20 00:59:17.043233	RapidTow Staff 5 đã nhận chuyến REQ-20260620005759-7C97B3.	t	2026-06-21 11:00:15.938588	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	148
187	2026-06-20 00:37:19.166963	Yêu cầu REQ-20260620003537-099C4A đã được thợ cập nhật hoàn thành.	t	2026-06-21 11:00:15.938588	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	74	147
186	2026-06-20 00:36:07.545573	RapidTow Staff 4 đã nhận chuyến REQ-20260620003537-099C4A.	t	2026-06-21 11:00:15.938588	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	74	147
232	2026-06-21 10:58:49.049282	Ban vua duoc giao yeu cau REQ-20260621105536-A1580C. Hay chap nhan trong vong 60 giay.	t	2026-06-21 11:00:22.208342	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	157
234	2026-06-21 11:00:49.9543	Ban vua duoc giao yeu cau REQ-20260621110049-394CC2. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	94	158
235	2026-06-21 11:00:49.9543	Ban vua duoc giao yeu cau REQ-20260621110049-394CC2. Hay chap nhan trong vong 60 giay.	f	\N	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	96	158
233	2026-06-21 11:00:49.9543	Ban vua duoc giao yeu cau REQ-20260621110049-394CC2. Hay chap nhan trong vong 60 giay.	t	2026-06-21 11:00:54.627526	Yeu cau moi can xac nhan	ASSIGNMENT_PENDING	76	158
236	2026-06-21 11:00:56.241075	RapidTow Staff 1 has accepted request REQ-20260621110049-394CC2.	f	\N	Staff accepted the request	ASSIGNMENT_ACCEPTED	74	158
237	2026-06-21 11:02:58.005253	Request REQ-20260621110049-394CC2 has been marked as completed by staff.	f	\N	Rescue request completed	REQUEST_COMPLETED	74	158
239	2026-06-21 11:11:28.273036	You have been assigned request REQ-20260621111128-9F6FC1. Please accept it within 60 seconds.	f	\N	New request awaiting confirmation	ASSIGNMENT_PENDING	94	159
240	2026-06-21 11:11:28.273036	You have been assigned request REQ-20260621111128-9F6FC1. Please accept it within 60 seconds.	f	\N	New request awaiting confirmation	ASSIGNMENT_PENDING	96	159
241	2026-06-21 11:11:39.271475	RapidTow Staff 1 has accepted request REQ-20260621111128-9F6FC1.	f	\N	Staff accepted the request	ASSIGNMENT_ACCEPTED	74	159
242	2026-06-21 11:11:47.067352	Request REQ-20260621111128-9F6FC1 has been marked as completed by staff.	f	\N	Rescue request completed	REQUEST_COMPLETED	74	159
238	2026-06-21 11:11:28.273036	You have been assigned request REQ-20260621111128-9F6FC1. Please accept it within 60 seconds.	t	2026-06-21 11:12:18.428313	New request awaiting confirmation	ASSIGNMENT_PENDING	76	159
9001	2026-06-11 10:31:00	Nhân viên đã được gán yêu cầu cứu hộ demo 01.	f	\N	Yêu cầu mới cần xác nhận	ASSIGNMENT_PENDING	9021	9001
9002	2026-06-12 10:32:00	Kỹ thuật viên đã nhận yêu cầu cứu hộ demo 02.	t	2026-06-12 10:37:00	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	9012	9002
9003	2026-06-13 10:33:00	Khách hàng đã thanh toán cho yêu cầu demo 03.	t	2026-06-13 10:38:00	Khách hàng đã thanh toán	PAYMENT_PAID	9013	9003
9004	2026-06-14 10:34:00	Yêu cầu demo 04 đã hoàn thành.	t	2026-06-14 10:39:00	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	9014	9004
9005	2026-06-15 10:35:00	Kỹ thuật viên đã nhận yêu cầu cứu hộ demo 05.	f	\N	Thợ đã nhận chuyến	ASSIGNMENT_ACCEPTED	9015	9005
9006	2026-06-16 10:36:00	Khách hàng đã thanh toán cho yêu cầu demo 06.	t	2026-06-16 10:41:00	Khách hàng đã thanh toán	PAYMENT_PAID	9016	9006
9007	2026-06-17 10:37:00	Yêu cầu demo 07 đã hoàn thành.	t	2026-06-17 10:42:00	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	9017	9007
9008	2026-06-18 10:38:00	Nhân viên đã được gán yêu cầu cứu hộ demo 08.	f	\N	Yêu cầu mới cần xác nhận	ASSIGNMENT_PENDING	9028	9008
9009	2026-06-19 10:39:00	Khách hàng đã thanh toán cho yêu cầu demo 09.	t	2026-06-19 10:44:00	Khách hàng đã thanh toán	PAYMENT_PAID	9019	9009
9010	2026-06-20 10:40:00	Yêu cầu demo 10 đã hoàn thành.	t	2026-06-20 10:45:00	Chuyến cứu hộ đã hoàn thành	REQUEST_COMPLETED	9020	9010
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
9001	9011	clean-reset-token-01	2026-06-11 12:00:00	2026-06-11 11:45:00	1	clean-otp-hash-01	2026-06-11 11:40:00
9002	9012	clean-reset-token-02	2026-06-12 12:00:00	2026-06-12 11:45:00	1	clean-otp-hash-02	2026-06-12 11:40:00
9003	9013	clean-reset-token-03	2026-06-13 12:00:00	2026-06-13 11:45:00	1	clean-otp-hash-03	2026-06-13 11:40:00
9004	9014	clean-reset-token-04	2026-06-14 12:00:00	2026-06-14 11:45:00	1	clean-otp-hash-04	2026-06-14 11:40:00
9005	9015	clean-reset-token-05	2026-06-15 12:00:00	2026-06-15 11:45:00	1	clean-otp-hash-05	2026-06-15 11:40:00
9006	9016	clean-reset-token-06	2026-06-16 12:00:00	2026-06-16 11:45:00	1	clean-otp-hash-06	2026-06-16 11:40:00
9007	9017	clean-reset-token-07	2026-06-17 12:00:00	2026-06-17 11:45:00	1	clean-otp-hash-07	2026-06-17 11:40:00
9008	9018	clean-reset-token-08	2026-06-18 12:00:00	2026-06-18 11:45:00	1	clean-otp-hash-08	2026-06-18 11:40:00
9009	9019	clean-reset-token-09	2026-06-19 12:00:00	2026-06-19 11:45:00	1	clean-otp-hash-09	2026-06-19 11:40:00
9010	9020	clean-reset-token-10	2026-06-20 12:00:00	2026-06-20 11:45:00	1	clean-otp-hash-10	2026-06-20 11:40:00
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, request_id, customer_id, amount, payment_method, payment_status, paid_at, created_at) FROM stdin;
40	125	74	100000.00	CASH	PAID	2026-05-20 21:12:50.31926	2026-05-20 21:12:29.715156
45	130	74	100000.00	CASH	PAID	2026-05-27 15:33:51.101577	2026-05-27 15:33:49.679262
47	145	74	10000000.00	CASH	PAID	2026-06-20 00:20:40.580674	2026-06-20 00:20:38.734027
48	147	74	3000000.00	CASH	PAID	2026-06-20 00:37:26.169687	2026-06-20 00:37:24.287706
49	152	74	1000000.00	CASH	PAID	2026-06-20 02:17:26.395007	2026-06-20 02:17:24.840191
50	156	74	1000000.00	CASH	PAID	2026-06-21 10:32:59.673316	2026-06-21 10:32:58.37445
9001	9001	9011	312000.00	CASH	PAID	2026-06-11 10:21:00	2026-06-11 10:16:00
9002	9002	9012	254000.00	BANK_TRANSFER	PAID	2026-06-12 10:22:00	2026-06-12 10:17:00
9003	9003	9013	306000.00	MOMO	PAID	2026-06-13 10:23:00	2026-06-13 10:18:00
9004	9004	9014	448000.00	VNPAY	PAID	2026-06-14 10:24:00	2026-06-14 10:19:00
9005	9005	9015	410000.00	ZALOPAY	PAID	2026-06-15 10:25:00	2026-06-15 10:20:00
9006	9006	9016	622000.00	CASH	PAID	2026-06-16 10:26:00	2026-06-16 10:21:00
9007	9007	9017	1034000.00	BANK_TRANSFER	PAID	2026-06-17 10:27:00	2026-06-17 10:22:00
9008	9008	9018	846000.00	MOMO	PAID	2026-06-18 10:28:00	2026-06-18 10:23:00
9009	9009	9019	558000.00	VNPAY	PAID	2026-06-19 10:29:00	2026-06-19 10:24:00
9010	9010	9020	1370000.00	ZALOPAY	PAID	2026-06-20 10:30:00	2026-06-20 10:25:00
\.


--
-- Data for Name: pricing_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pricing_rules (id, company_id, service_type_id, distance_from_km, distance_to_km, price_per_km, night_surcharge, holiday_surcharge) FROM stdin;
9001	9001	9001	0.00	11.00	28000.00	30000.00	40000.00
9002	9002	9002	0.00	12.00	31000.00	30000.00	40000.00
9003	9003	9003	0.00	13.00	34000.00	50000.00	40000.00
9004	9004	9004	0.00	14.00	37000.00	30000.00	70000.00
9005	9005	9005	0.00	15.00	40000.00	30000.00	40000.00
9006	9006	9006	0.00	16.00	43000.00	50000.00	40000.00
9007	9007	9007	0.00	17.00	46000.00	30000.00	40000.00
9008	9008	9008	0.00	18.00	49000.00	30000.00	70000.00
9009	9009	9009	0.00	19.00	52000.00	50000.00	40000.00
9010	9010	9010	0.00	20.00	55000.00	30000.00	40000.00
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotes (id, request_id, company_id, staff_id, quote_code, estimated_amount, final_amount, status, created_at, expires_at, service_name, quantity, unit_price, subtotal, customer_note, note) FROM stdin;
37	78	35	36	QTE-20260415210536-22A8E5	1000000.00	800000.00	SENT	2026-04-15 21:05:36.093127	\N	Va xam	1	\N	0.00	\N	\N
52	156	34	34	QTE-20260621102625-B5D7F0	1000000.00	1000000.00	ACCEPTED	2026-06-21 10:26:25.836717	\N	Towing	1	1000000.00	1000000.00	\N	
53	158	34	34	QTE-20260621110133-986499	1000000.00	1000000.00	ACCEPTED	2026-06-21 11:01:33.244258	\N	Towing	1	1000000.00	1000000.00	\N	
9001	9001	9001	9001	CLEAN-QUOTE-0001	312000.00	312000.00	ACCEPTED	2026-06-11 09:13:00	2026-06-11 11:13:00	Cuu ho ac quy	1	250000.00	250000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 1
9002	9002	9002	9002	CLEAN-QUOTE-0002	254000.00	254000.00	ACCEPTED	2026-06-12 09:14:00	2026-06-12 11:14:00	Vay lop luu dong	1	180000.00	180000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 2
9003	9003	9003	9003	CLEAN-QUOTE-0003	306000.00	306000.00	ACCEPTED	2026-06-13 09:15:00	2026-06-13 11:15:00	Tiep nhien lieu	1	220000.00	220000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 3
9004	9004	9004	9004	CLEAN-QUOTE-0004	448000.00	448000.00	ACCEPTED	2026-06-14 09:16:00	2026-06-14 11:16:00	Sua nhanh tai cho	1	350000.00	350000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 4
9005	9005	9005	9005	CLEAN-QUOTE-0005	410000.00	410000.00	ACCEPTED	2026-06-15 09:17:00	2026-06-15 11:17:00	Mo khoa xe	1	300000.00	300000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 5
9006	9006	9006	9006	CLEAN-QUOTE-0006	622000.00	622000.00	ACCEPTED	2026-06-16 09:18:00	2026-06-16 11:18:00	Keo xe noi thanh	1	500000.00	500000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 6
9007	9007	9007	9007	CLEAN-QUOTE-0007	1034000.00	1034000.00	ACCEPTED	2026-06-17 09:19:00	2026-06-17 11:19:00	Keo xe lien quan	1	900000.00	900000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 7
43	125	34	34	QTE-20260520211124-EB86E4	100000.00	100000.00	ACCEPTED	2026-05-20 21:11:24.242528	\N	Battery Support	1	100000.00	100000.00	\N	
9008	9008	9008	9008	CLEAN-QUOTE-0008	846000.00	846000.00	ACCEPTED	2026-06-18 09:20:00	2026-06-18 11:20:00	Ho tro tai nan	1	700000.00	700000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 8
9009	9009	9009	9009	CLEAN-QUOTE-0009	558000.00	558000.00	ACCEPTED	2026-06-19 09:21:00	2026-06-19 11:21:00	Kiem tra dien xe	1	400000.00	400000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 9
47	130	34	34	QTE-20260527153337-269A85	100000.00	100000.00	ACCEPTED	2026-05-27 15:33:37.569754	\N	Towing	1	100000.00	100000.00	\N	dsflkdsfl
9010	9010	9010	9010	CLEAN-QUOTE-0010	1370000.00	1370000.00	ACCEPTED	2026-06-20 09:22:00	2026-06-20 11:22:00	Goi cuu ho uu tien	1	1200000.00	1200000.00	Khach dong y bao gia demo	Bao gia sach cho yeu cau demo 10
49	145	34	34	QTE-20260620001842-E4A3AA	1000000.00	10000000.00	ACCEPTED	2026-06-20 00:18:42.965197	\N	Towing	1	10000000.00	10000000.00	\N	
50	147	34	39	QTE-20260620003631-734FDA	3000000.00	3000000.00	ACCEPTED	2026-06-20 00:36:31.876879	\N	Battery Support	1	3000000.00	3000000.00	\N	
51	152	34	34	QTE-20260620021634-52857C	1000000.00	1000000.00	ACCEPTED	2026-06-20 02:16:34.574071	\N	Battery Support	1	1000000.00	1000000.00	\N	
\.


--
-- Data for Name: request_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_assignments (id, request_id, company_id, staff_id, vehicle_id, assigned_by_user_id, assigned_at, accepted_at, rejected_at, status) FROM stdin;
74	73	34	34	34	75	2026-04-14 23:22:34.581805	2026-04-14 23:24:32.328738	2026-04-14 23:36:13.786739	REJECTED
76	75	34	\N	\N	73	2026-04-15 14:36:21.305017	\N	2026-04-15 14:46:28.84594	REJECTED
78	78	35	36	35	90	2026-04-15 20:58:33.117441	2026-04-15 21:03:55.358538	\N	COMPLETED
80	80	34	\N	\N	73	2026-04-15 22:35:35.987021	\N	2026-04-15 22:50:58.601008	REJECTED
81	82	34	\N	\N	73	2026-04-17 15:07:33.162549	\N	2026-04-17 15:14:57.610904	REJECTED
83	84	35	\N	\N	89	2026-04-26 15:59:32.21515	\N	2026-04-26 20:44:46.919657	REJECTED
84	85	34	\N	\N	73	2026-05-05 18:42:14.720066	\N	2026-05-05 20:17:33.462814	REJECTED
85	85	34	\N	\N	73	2026-05-05 20:20:40.032504	\N	2026-05-05 20:25:49.858837	REJECTED
87	87	34	\N	\N	73	2026-05-05 20:53:24.092251	\N	\N	COMPLETED
86	86	34	\N	\N	73	2026-05-05 20:53:17.376824	\N	2026-05-05 21:02:56.335386	REJECTED
88	88	34	\N	\N	73	2026-05-05 21:04:48.782213	\N	2026-05-05 21:10:09.680318	REJECTED
89	89	34	\N	\N	73	2026-05-05 21:05:14.403648	\N	2026-05-05 21:11:11.273438	REJECTED
90	89	34	\N	\N	73	2026-05-05 21:26:35.311008	\N	2026-05-05 21:32:22.564247	REJECTED
91	89	34	\N	\N	73	2026-05-05 23:46:29.216981	\N	2026-05-05 23:52:04.896689	REJECTED
92	89	34	34	34	75	2026-05-06 00:02:57.507105	2026-05-06 00:05:13.316466	\N	COMPLETED
75	74	34	34	34	75	2026-04-14 23:37:06.930304	2026-04-14 23:38:27.135761	\N	COMPLETED
77	76	34	34	34	75	2026-04-15 14:39:05.279701	2026-04-15 14:40:48.906191	\N	COMPLETED
673	135	34	38	37	74	2026-06-19 23:54:32.633617	\N	2026-06-19 23:55:33.527162	REJECTED
674	135	34	40	39	74	2026-06-19 23:54:32.651737	\N	2026-06-19 23:55:33.550041	REJECTED
675	135	34	37	36	74	2026-06-19 23:54:32.654254	\N	2026-06-19 23:55:33.55204	REJECTED
685	134	34	40	39	74	2026-06-19 23:56:34.311445	\N	2026-06-20 00:34:15.257447	REJECTED
677	144	34	34	34	74	2026-06-19 23:54:32.730247	\N	2026-06-19 23:55:33.566512	REJECTED
104	134	34	34	\N	74	2026-06-04 22:01:26.140053	\N	2026-06-08 21:17:26.542393	REJECTED
105	135	34	34	\N	74	2026-06-04 22:05:45.014379	\N	2026-06-08 21:17:26.773312	REJECTED
106	134	35	36	\N	74	2026-06-08 21:17:26.738313	\N	2026-06-08 21:22:27.084963	REJECTED
107	135	35	36	\N	74	2026-06-08 21:17:26.854781	\N	2026-06-08 21:22:27.138405	REJECTED
108	136	34	34	\N	74	2026-06-18 23:29:12.556376	2026-06-18 23:33:12.431198	\N	COMPLETED
102	132	34	34	\N	73	2026-05-27 22:22:55.354578	2026-05-27 22:25:02.093371	\N	COMPLETED
101	131	34	34	\N	73	2026-05-27 22:20:17.029602	2026-05-27 22:20:32.645571	\N	COMPLETED
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
703	149	34	38	37	74	2026-06-20 01:01:00.418787	2026-06-20 01:01:07.993522	\N	COMPLETED
706	151	34	37	36	74	2026-06-20 01:57:28.529173	\N	2026-06-20 01:58:28.59003	REJECTED
707	151	34	39	38	74	2026-06-20 01:57:28.530199	\N	2026-06-20 01:58:28.596051	REJECTED
709	151	34	38	37	74	2026-06-20 01:58:39.862783	2026-06-20 01:58:44.81874	\N	ACCEPTED
686	145	34	34	34	74	2026-06-20 00:01:38.299102	2026-06-20 00:02:04.980126	\N	COMPLETED
731	159	34	37	36	74	2026-06-21 11:11:28.269273	\N	2026-06-21 11:11:39.241695	REJECTED
710	152	34	37	36	74	2026-06-20 02:16:15.00284	\N	2026-06-20 02:16:22.48283	REJECTED
712	152	34	39	38	74	2026-06-20 02:16:15.004847	\N	2026-06-20 02:16:22.48283	REJECTED
711	152	34	34	34	74	2026-06-20 02:16:15.003921	2026-06-20 02:16:22.4762	\N	COMPLETED
732	159	34	39	38	74	2026-06-21 11:11:28.269273	\N	2026-06-21 11:11:39.241695	REJECTED
713	153	34	37	36	74	2026-06-20 02:20:26.827227	\N	2026-06-20 02:20:43.96285	REJECTED
715	153	34	39	38	74	2026-06-20 02:20:26.829324	\N	2026-06-20 02:20:43.96285	REJECTED
714	153	34	34	34	74	2026-06-20 02:20:26.828331	2026-06-20 02:20:43.95933	\N	COMPLETED
730	159	34	34	34	74	2026-06-21 11:11:28.257329	2026-06-21 11:11:39.241695	\N	COMPLETED
717	154	34	39	38	74	2026-06-20 02:24:20.355762	\N	2026-06-20 02:24:36.551429	REJECTED
716	154	34	34	34	74	2026-06-20 02:24:20.353469	2026-06-20 02:24:36.54703	\N	COMPLETED
718	155	34	39	38	74	2026-06-20 02:40:45.031974	\N	2026-06-20 02:41:45.821801	REJECTED
9001	9001	9001	9001	9001	9001	2026-06-11 09:06:00	2026-06-11 09:11:00	\N	COMPLETED
719	155	34	37	36	74	2026-06-20 02:41:45.829352	\N	2026-06-20 02:41:56.394722	REJECTED
720	155	34	34	34	74	2026-06-20 02:41:45.830907	2026-06-20 02:41:56.393723	2026-06-21 10:24:47.312506	REJECTED
9002	9002	9002	9002	9002	9001	2026-06-12 09:07:00	2026-06-12 09:12:00	\N	COMPLETED
722	156	34	37	36	74	2026-06-21 10:25:08.547419	\N	2026-06-21 10:25:28.971242	REJECTED
723	156	34	39	38	74	2026-06-21 10:25:08.547419	\N	2026-06-21 10:25:28.971242	REJECTED
724	157	34	37	36	74	2026-06-21 10:55:36.546135	\N	2026-06-21 10:56:37.189917	REJECTED
725	157	34	39	38	74	2026-06-21 10:55:36.546135	\N	2026-06-21 10:56:37.189917	REJECTED
721	156	34	34	34	74	2026-06-21 10:25:08.538111	2026-06-21 10:25:28.967466	\N	COMPLETED
726	157	34	34	34	74	2026-06-21 10:58:49.047275	\N	2026-06-21 10:59:49.947167	REJECTED
9003	9003	9003	9003	9003	9001	2026-06-13 09:08:00	2026-06-13 09:13:00	\N	COMPLETED
728	158	34	37	36	74	2026-06-21 11:00:49.944759	\N	2026-06-21 11:00:56.225353	REJECTED
729	158	34	39	38	74	2026-06-21 11:00:49.9543	\N	2026-06-21 11:00:56.225353	REJECTED
727	158	34	34	34	74	2026-06-21 11:00:49.944759	2026-06-21 11:00:56.225353	\N	COMPLETED
9004	9004	9004	9004	9004	9001	2026-06-14 09:09:00	2026-06-14 09:14:00	\N	COMPLETED
9005	9005	9005	9005	9005	9001	2026-06-15 09:10:00	2026-06-15 09:15:00	\N	COMPLETED
9006	9006	9006	9006	9006	9001	2026-06-16 09:11:00	2026-06-16 09:16:00	\N	COMPLETED
9007	9007	9007	9007	9007	9001	2026-06-17 09:12:00	2026-06-17 09:17:00	\N	COMPLETED
9008	9008	9008	9008	9008	9001	2026-06-18 09:13:00	2026-06-18 09:18:00	\N	COMPLETED
9009	9009	9009	9009	9009	9001	2026-06-19 09:14:00	2026-06-19 09:19:00	\N	COMPLETED
9010	9010	9010	9010	9010	9001	2026-06-20 09:15:00	2026-06-20 09:20:00	\N	COMPLETED
\.


--
-- Data for Name: request_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_status_history (id, request_id, old_status, new_status, changed_by_user_id, note, changed_at) FROM stdin;
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
98	78	\N	CREATED	93	Request created	2026-04-15 20:52:15.315607
99	78	CREATED	MATCHED	89	Assigned from admin requests page	2026-04-15 20:58:33.265933
100	78	MATCHED	COMPLETED	90		2026-04-15 21:06:04.20202
103	80	\N	CREATED	39	Request created	2026-04-15 22:35:05.693424
104	80	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-15 22:35:36.136834
106	82	\N	CREATED	39	Request created	2026-04-17 15:06:48.856925
107	82	CREATED	MATCHED	73	Assigned from admin dashboard	2026-04-17 15:07:33.316031
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
176	125	\N	CREATED	74	Request created	2026-05-20 19:26:21.489942
177	125	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-20 19:27:05.023921
189	130	\N	CREATED	74	Request created	2026-05-27 15:22:20.880597
190	130	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-27 15:24:30.729059
191	130	ACCEPTED	IN_PROGRESS	76	Staff checked in at customer location	2026-05-27 15:26:12.80401
193	130	IN_PROGRESS	ACCEPTED	74	Deal price accepted	2026-05-27 15:33:45.93576
194	131	\N	CREATED	74	Request created	2026-05-27 22:20:02.883401
195	131	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-27 22:20:17.040562
196	131	ACCEPTED	IN_PROGRESS	76	Staff checked in at customer location	2026-05-27 22:21:40.387543
197	132	\N	CREATED	74	Request created	2026-05-27 22:22:40.145594
198	132	CREATED	MATCHED	73	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-05-27 22:22:55.356594
201	134	\N	CREATED	74	Request created	2026-06-04 22:01:26.106752
202	134	CREATED	MATCHED	74	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-06-04 22:01:26.14845
203	135	\N	CREATED	74	Request created	2026-06-04 22:05:44.992403
204	135	CREATED	MATCHED	74	Hệ thống tự động gán nhân viên gần nhất: RapidTow Staff	2026-06-04 22:05:45.022446
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
555	125	ACCEPTED	COMPLETED	76		2026-06-19 23:27:21.229675
556	130	ACCEPTED	COMPLETED	76		2026-06-19 23:27:33.856144
559	89	MATCHED	COMPLETED	76		2026-06-19 23:27:53.221329
562	74	IN_PROGRESS	COMPLETED	76		2026-06-19 23:28:12.287028
563	76	IN_PROGRESS	COMPLETED	76		2026-06-19 23:28:22.684838
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
603	151	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-20 01:57:28.522622
604	151	SEARCHING	SEARCHING	74	System dispatched request to 2 nearby staff within 2.0 km.	2026-06-20 01:57:28.532789
605	149	IN_PROGRESS	COMPLETED	95		2026-06-20 01:57:57.439122
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
630	155	MATCHED	CANCELED	74	Canceled by customer from My Requests page	2026-06-21 10:24:47.255464
631	156	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-21 10:25:08.519414
632	156	SEARCHING	SEARCHING	74	System dispatched request to 3 nearby staff within 2.0 km.	2026-06-21 10:25:08.562824
633	156	SEARCHING	MATCHED	76	Assignment accepted by staff	2026-06-21 10:25:28.983635
634	156	MATCHED	IN_PROGRESS	76	Staff checked in at customer location	2026-06-21 10:26:13.463055
635	156	IN_PROGRESS	ACCEPTED	74	Deal price accepted	2026-06-21 10:26:36.395719
636	156	ACCEPTED	IN_PROGRESS	76	Staff checked in at customer location	2026-06-21 10:27:05.747833
637	156	IN_PROGRESS	COMPLETED	74	Request automatically completed upon successful payment	2026-06-21 10:32:59.673316
638	157	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-21 10:55:36.520908
639	157	SEARCHING	SEARCHING	74	System dispatched request to 2 nearby staff within 2.0 km.	2026-06-21 10:55:36.546135
640	157	SEARCHING	SEARCHING	74	System dispatched request to 1 nearby staff within 98.0 km.	2026-06-21 10:58:49.052925
641	157	SEARCHING	CANCELED	74	Canceled by customer from request detail	2026-06-21 10:59:56.267042
642	158	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-21 11:00:49.929447
643	158	SEARCHING	SEARCHING	74	System dispatched request to 3 nearby staff within 2.0 km.	2026-06-21 11:00:49.9543
644	158	SEARCHING	MATCHED	76	Assignment accepted by staff	2026-06-21 11:00:56.241075
645	158	MATCHED	ACCEPTED	74	Deal price accepted	2026-06-21 11:01:49.138014
646	158	ACCEPTED	IN_PROGRESS	76	Staff checked in at customer location	2026-06-21 11:02:33.043799
647	158	IN_PROGRESS	COMPLETED	76	Completed by staff from request detail	2026-06-21 11:02:57.99191
648	159	\N	SEARCHING	74	Request created. Searching for nearby staff.	2026-06-21 11:11:28.24121
649	159	SEARCHING	SEARCHING	74	System dispatched request to 3 nearby staff within 2.0 km.	2026-06-21 11:11:28.273036
650	159	SEARCHING	MATCHED	76	Assignment accepted by staff	2026-06-21 11:11:39.271475
651	159	MATCHED	COMPLETED	76	Completed by staff from request detail	2026-06-21 11:11:47.055208
9001	9001	IN_PROGRESS	COMPLETED	9021	Hoan thanh yeu cau demo 1	2026-06-11 10:41:00
9002	9002	IN_PROGRESS	COMPLETED	9022	Hoan thanh yeu cau demo 2	2026-06-12 10:42:00
9003	9003	IN_PROGRESS	COMPLETED	9023	Hoan thanh yeu cau demo 3	2026-06-13 10:43:00
9004	9004	IN_PROGRESS	COMPLETED	9024	Hoan thanh yeu cau demo 4	2026-06-14 10:44:00
9005	9005	IN_PROGRESS	COMPLETED	9025	Hoan thanh yeu cau demo 5	2026-06-15 10:45:00
9006	9006	IN_PROGRESS	COMPLETED	9026	Hoan thanh yeu cau demo 6	2026-06-16 10:46:00
9007	9007	IN_PROGRESS	COMPLETED	9027	Hoan thanh yeu cau demo 7	2026-06-17 10:47:00
9008	9008	IN_PROGRESS	COMPLETED	9028	Hoan thanh yeu cau demo 8	2026-06-18 10:48:00
9009	9009	IN_PROGRESS	COMPLETED	9029	Hoan thanh yeu cau demo 9	2026-06-19 10:49:00
9010	9010	IN_PROGRESS	COMPLETED	9030	Hoan thanh yeu cau demo 10	2026-06-20 10:50:00
\.


--
-- Data for Name: rescue_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_companies (id, company_name, tax_code, license_number, email, phone, description, status, created_at, updated_at, owner_account_id, address_id, latitude, longitude) FROM stdin;
1	Hanoi university of science and technology branch	001	0001	luongvanhungnet@gmail.com	0347826501	Chi nhanh cua hang tai Back Khoa, Hai Ba Trung	APPROVED	2026-04-09 07:18:18.348735	2026-05-06 13:32:25.094678	5	6	19.9962684	10.5840483
34	RapidTow Rescue	TAX-001	LIC-001	rapidtow@vbas.local	0900000010	Demo rescue company for assignment and quote flow	APPROVED	2026-04-09 14:25:29.43875	2026-05-06 13:32:25.094678	75	73	10.7731000	106.7043000
35	Thien's Company	0109876543	01H8001234	thien123@gmail.com	0329584430		APPROVED	2026-04-15 20:37:51.608427	2026-05-06 13:32:25.094678	90	95	21.0342894	105.8533942
9001	Cứu hộ sạch 01	CLEAN-TAX-001	CLEAN-LIC-001	clean.company01@vbas.local	0249000001	Don vi cuu ho demo so 1 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9031	9001	21.0245000	105.8572000
9002	Cứu hộ sạch 02	CLEAN-TAX-002	CLEAN-LIC-002	clean.company02@vbas.local	0249000002	Don vi cuu ho demo so 2 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9032	9002	21.0051000	105.8437000
9003	Cứu hộ sạch 03	CLEAN-TAX-003	CLEAN-LIC-003	clean.company03@vbas.local	0249000003	Don vi cuu ho demo so 3 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9033	9003	21.0233000	105.8029000
9004	Cứu hộ sạch 04	CLEAN-TAX-004	CLEAN-LIC-004	clean.company04@vbas.local	0249000004	Don vi cuu ho demo so 4 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9034	9004	21.0369000	105.7825000
9005	Cứu hộ sạch 05	CLEAN-TAX-005	CLEAN-LIC-005	clean.company05@vbas.local	0249000005	Don vi cuu ho demo so 5 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9035	9005	21.0682000	105.8159000
9006	Cứu hộ sạch 06	CLEAN-TAX-006	CLEAN-LIC-006	clean.company06@vbas.local	0249000006	Don vi cuu ho demo so 6 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9036	9006	21.0029000	105.8155000
9007	Cứu hộ sạch 07	CLEAN-TAX-007	CLEAN-LIC-007	clean.company07@vbas.local	0249000007	Don vi cuu ho demo so 7 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9037	9007	21.0298000	105.7789000
9008	Cứu hộ sạch 08	CLEAN-TAX-008	CLEAN-LIC-008	clean.company08@vbas.local	0249000008	Don vi cuu ho demo so 8 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9038	9008	21.0417000	105.8746000
9009	Cứu hộ sạch 09	CLEAN-TAX-009	CLEAN-LIC-009	clean.company09@vbas.local	0249000009	Don vi cuu ho demo so 9 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9039	9009	20.9803000	105.7878000
9010	Cứu hộ sạch 10	CLEAN-TAX-010	CLEAN-LIC-010	clean.company10@vbas.local	0249000010	Don vi cuu ho demo so 10 tai Ha Noi	APPROVED	2026-06-21 08:00:00	2026-06-21 08:00:00	9040	9010	20.9809000	105.8416000
\.


--
-- Data for Name: rescue_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_requests (id, request_code, customer_id, vehicle_id, incident_type_id, service_type_id, location_id, description, priority_level, status, created_at, updated_at, image_url, estimated_quotation_amount, fee_coefficient, service_price_snapshot, travel_cost) FROM stdin;
85	REQ-20260505184057-8579C3	39	2	35	1	104		HIGH	IN_PROGRESS	2026-05-05 18:40:57.422031	2026-05-05 20:25:10.727373	\N	\N	\N	\N	\N
73	REQ-20260414232157-F2877E	39	36	2	2	80		LOW	CANCELED	2026-04-14 23:21:58.091311	2026-04-14 23:36:12.881801	\N	\N	\N	\N	\N
75	REQ-20260415143539-65BE81	39	36	1	1	82		NORMAL	MATCHED	2026-04-15 14:35:39.998125	2026-04-15 14:36:21.608318	\N	\N	\N	\N	\N
87	REQ-20260505205220-C6EAA1	39	2	36	2	106		HIGH	COMPLETED	2026-05-05 20:52:20.993227	2026-05-05 20:56:57.083165	\N	\N	\N	\N	\N
78	REQ-20260415205214-040A76	93	37	2	2	97	Tôi bị thủng xăm trên đường 	HIGH	COMPLETED	2026-04-15 20:52:15.150052	2026-04-15 21:06:04.368211	\N	\N	\N	\N	\N
80	REQ-20260415223505-2238AC	39	36	36	36	99		LOW	MATCHED	2026-04-15 22:35:05.5378	2026-04-15 22:35:36.284526	\N	\N	\N	\N	\N
82	REQ-20260417150648-3CF106	39	36	34	2	101		HIGH	MATCHED	2026-04-17 15:06:48.696396	2026-04-17 15:07:33.465839	\N	\N	\N	\N	\N
84	REQ-20260426155832-A1CFB5	93	37	2	1	103		HIGH	IN_PROGRESS	2026-04-26 15:58:33.015201	2026-04-26 16:04:59.477192	\N	\N	\N	\N	\N
86	REQ-20260505205152-880A03	39	36	2	1	105		HIGH	CANCELED	2026-05-05 20:51:53.159802	2026-05-05 21:02:55.720498	\N	\N	\N	\N	\N
88	REQ-20260505210328-1D083A	39	2	34	36	107		HIGH	SEARCHING	2026-05-05 21:03:28.597929	2026-05-05 21:10:10.194692	\N	\N	\N	\N	\N
90	REQ-20260506131249-10C809	39	\N	1	\N	109	Air conditioner not working	HIGH	CREATED	2026-05-06 13:12:49.682748	2026-05-06 13:15:11.966215	/uploads/request-images/916b83bd-ff90-454a-b65e-210f8ee494c0.png	\N	\N	\N	\N
89	REQ-20260505210355-DDBC0E	39	36	1	2	108		HIGH	COMPLETED	2026-05-05 21:03:55.499937	2026-06-19 23:27:53.223832	\N	\N	\N	\N	\N
132	REQ-20260527222240-E769DE	74	35	35	1	154		NORMAL	COMPLETED	2026-05-27 22:22:40.143595	2026-06-19 23:26:47.466883	\N	24000.00	1.2000	0.00	20000.00
125	REQ-20260520192621-15A391	74	35	36	36	147		NORMAL	COMPLETED	2026-05-20 19:26:21.479135	2026-06-19 23:27:21.234162	\N	\N	\N	\N	\N
130	REQ-20260527152220-4E2270	74	35	34	34	152		NORMAL	COMPLETED	2026-05-27 15:22:20.843672	2026-06-19 23:27:33.857143	\N	24000.00	1.2000	0.00	20000.00
134	REQ-20260604220126-118BA2	74	35	36	36	156		NORMAL	CANCELED	2026-06-04 22:01:26.104278	2026-06-20 00:34:15.24838	\N	1800000.00	1.2000	1500000.00	0.00
137	REQ-20260619221557-FA2477	74	\N	36	36	159		NORMAL	CANCELED	2026-06-19 22:15:57.98038	2026-06-19 22:37:36.390804	\N	1812017.00	1.2000	1500000.00	10014.00
141	REQ-20260619230358-72439B	74	\N	36	36	163		NORMAL	CANCELED	2026-06-19 23:03:58.623318	2026-06-19 23:26:25.128846	\N	1812026.00	1.2000	1500000.00	10022.00
138	REQ-20260619223753-D120CB	74	\N	36	36	160		NORMAL	CANCELED	2026-06-19 22:37:53.532539	2026-06-19 22:43:19.834587	\N	1812017.00	1.2000	1500000.00	10014.00
139	REQ-20260619224345-231028	74	\N	36	36	161		NORMAL	CANCELED	2026-06-19 22:43:45.600532	2026-06-19 22:53:58.267309	\N	1812026.00	1.2000	1500000.00	10022.00
140	REQ-20260619225420-7437EB	74	\N	36	36	162		NORMAL	CANCELED	2026-06-19 22:54:20.509533	2026-06-19 23:03:33.36179	\N	1812026.00	1.2000	1500000.00	10022.00
136	REQ-20260618232912-9F40AD	74	\N	36	36	158		NORMAL	COMPLETED	2026-06-18 23:29:12.53622	2026-06-19 23:04:31.357679	\N	1812043.00	1.2000	1500000.00	10036.00
131	REQ-20260527222002-9ABC7A	74	35	35	36	153		NORMAL	COMPLETED	2026-05-27 22:20:02.868373	2026-06-19 23:26:56.087969	\N	24000.00	1.2000	0.00	20000.00
74	REQ-20260414233637-7C54B0	39	36	36	1	81		NORMAL	COMPLETED	2026-04-14 23:36:38.148402	2026-06-19 23:28:12.289538	\N	\N	\N	\N	\N
76	REQ-20260415143840-14585C	39	2	36	2	83		HIGH	COMPLETED	2026-04-15 14:38:40.631732	2026-06-19 23:28:22.689337	\N	\N	\N	\N	\N
142	REQ-20260619233050-9A71F0	74	\N	36	36	164		NORMAL	CANCELED	2026-06-19 23:30:50.686337	2026-06-19 23:31:14.440101	\N	1812026.00	1.2000	1500000.00	10022.00
135	REQ-20260604220544-4629C7	74	35	36	36	157		NORMAL	CANCELED	2026-06-04 22:05:44.989955	2026-06-20 00:34:08.330386	\N	1800000.00	1.2000	1500000.00	0.00
143	REQ-20260619233135-59B033	74	\N	36	36	165		NORMAL	CANCELED	2026-06-19 23:31:35.662413	2026-06-19 23:36:08.946789	\N	1812036.00	1.2000	1500000.00	10030.00
144	REQ-20260619233626-044FE8	74	\N	35	34	166		NORMAL	CANCELED	2026-06-19 23:36:26.2318	2026-06-20 00:01:22.558654	\N	612000.00	1.2000	500000.00	10000.00
153	REQ-20260620022026-2101F7	74	\N	35	34	180		NORMAL	COMPLETED	2026-06-20 02:20:26.818608	2026-06-20 02:23:12.878018	\N	614160.00	1.2000	500000.00	11800.00
154	REQ-20260620022409-E86511	74	\N	36	36	181		NORMAL	COMPLETED	2026-06-20 02:24:09.427217	2026-06-20 02:28:15.196681	\N	1890722.00	1.2000	1500000.00	75602.00
146	REQ-20260620002848-A48A9D	74	35	35	34	173		NORMAL	CANCELED	2026-06-20 00:28:48.067162	2026-06-20 00:32:48.308244	\N	615286.00	1.2000	500000.00	12738.00
155	REQ-20260620024033-D8CE8C	74	\N	36	36	182		NORMAL	CANCELED	2026-06-20 02:40:33.963955	2026-06-21 10:24:47.295839	\N	1898035.00	1.2000	1500000.00	81696.00
147	REQ-20260620003537-099C4A	74	35	36	36	174		NORMAL	COMPLETED	2026-06-20 00:35:37.903605	2026-06-20 00:37:19.161459	\N	1815286.00	1.2000	1500000.00	12738.00
148	REQ-20260620005759-7C97B3	74	\N	36	36	175		NORMAL	IN_PROGRESS	2026-06-20 00:57:59.04013	2026-06-20 00:59:17.040293	\N	1815284.00	1.2000	1500000.00	12737.00
149	REQ-20260620010100-102A42	74	\N	36	36	176		NORMAL	COMPLETED	2026-06-20 01:01:00.405281	2026-06-20 01:57:57.442729	\N	1815292.00	1.2000	1500000.00	12743.00
156	REQ-20260621102508-4A83B2	74	\N	35	34	183		NORMAL	COMPLETED	2026-06-21 10:25:08.503604	2026-06-21 10:32:59.689231	\N	615185.00	1.2000	500000.00	12654.00
151	REQ-20260620015728-34A759	74	\N	36	36	178		NORMAL	IN_PROGRESS	2026-06-20 01:57:28.519102	2026-06-20 01:58:44.823289	\N	1812024.00	1.2000	1500000.00	10020.00
145	REQ-20260620000138-130B1F	74	\N	35	34	172		NORMAL	COMPLETED	2026-06-20 00:01:38.286604	2026-06-20 02:15:02.097142	/uploads/request-images/453dfbaa-06e6-4ed3-b73f-cbb21155b0a8.png	615286.00	1.2000	500000.00	12738.00
157	REQ-20260621105536-A1580C	74	\N	35	34	184		NORMAL	CANCELED	2026-06-21 10:55:36.520908	2026-06-21 10:59:56.273249	\N	615215.00	1.2000	500000.00	12679.00
152	REQ-20260620021614-582E85	74	35	36	36	179		NORMAL	COMPLETED	2026-06-20 02:16:14.993303	2026-06-20 02:17:33.060975	\N	1814160.00	1.2000	1500000.00	11800.00
158	REQ-20260621110049-394CC2	74	\N	35	34	185		NORMAL	COMPLETED	2026-06-21 11:00:49.929447	2026-06-21 11:02:57.99191	\N	615215.00	1.2000	500000.00	12679.00
159	REQ-20260621111128-9F6FC1	74	\N	36	36	186		NORMAL	COMPLETED	2026-06-21 11:11:28.225279	2026-06-21 11:11:47.055208	\N	1815191.00	1.2000	1500000.00	12659.00
9001	CLEAN-REQ-20260611-0001	9011	9001	9001	9001	9001	Xe khong khoi dong duoc tai khu vuc Hoan Kiem, nghi do het ac quy.	HIGH	COMPLETED	2026-06-11 09:01:00	2026-06-11 10:01:00	\N	312000.00	1.1000	250000.00	62000.00
9002	CLEAN-REQ-20260612-0002	9012	9002	9002	9002	9002	Lop truoc bi xep hoi, can ho tro va lop tai hien truong.	NORMAL	COMPLETED	2026-06-12 09:02:00	2026-06-12 10:02:00	\N	254000.00	1.0000	180000.00	74000.00
9003	CLEAN-REQ-20260613-0003	9013	9003	9003	9003	9003	Xe het xang tren duong Dai Co Viet, can tiep nhien lieu.	NORMAL	COMPLETED	2026-06-13 09:03:00	2026-06-13 10:03:00	\N	306000.00	1.0000	220000.00	86000.00
9004	CLEAN-REQ-20260614-0004	9014	9004	9004	9004	9004	Dong co bao loi va rung manh khi dang di chuyen.	HIGH	COMPLETED	2026-06-14 09:04:00	2026-06-14 10:04:00	\N	448000.00	1.0000	350000.00	98000.00
9005	CLEAN-REQ-20260615-0005	9015	9005	9005	9005	9005	Khach bi khoa cua xe, can ho tro mo khoa an toan.	NORMAL	COMPLETED	2026-06-15 09:05:00	2026-06-15 10:05:00	\N	410000.00	1.0000	300000.00	110000.00
9006	CLEAN-REQ-20260616-0006	9016	9006	9006	9006	9006	Xe va cham nhe, can dua ve gara gan nhat.	NORMAL	COMPLETED	2026-06-16 09:06:00	2026-06-16 10:06:00	\N	622000.00	1.0000	500000.00	122000.00
9007	CLEAN-REQ-20260617-0007	9017	9007	9007	9007	9007	Xe chet may tren cau, can keo xe ve diem an toan.	NORMAL	COMPLETED	2026-06-17 09:07:00	2026-06-17 10:07:00	\N	1034000.00	1.0000	900000.00	134000.00
9008	CLEAN-REQ-20260618-0008	9018	9008	9008	9008	9008	He thong dien bao loi, den canh bao sang lien tuc.	NORMAL	COMPLETED	2026-06-18 09:08:00	2026-06-18 10:08:00	\N	846000.00	1.0000	700000.00	146000.00
9009	CLEAN-REQ-20260619-0009	9019	9009	9009	9009	9009	Xe bi qua nhiet, can kiem tra nuoc lam mat va dong co.	NORMAL	COMPLETED	2026-06-19 09:09:00	2026-06-19 10:09:00	\N	558000.00	1.0000	400000.00	158000.00
9010	CLEAN-REQ-20260620-0010	9020	9010	9010	9010	9010	Khach can goi cuu ho uu tien do dang dung o vi tri nguy hiem.	HIGH	COMPLETED	2026-06-20 09:10:00	2026-06-20 10:10:00	\N	1370000.00	1.1000	1200000.00	170000.00
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
9001	9021	9001	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 1	3	9001
9002	9022	9002	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 2	4	9002
9003	9023	9003	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 3	5	9003
9004	9024	9004	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 4	6	9004
9005	9025	9005	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 5	7	9005
9006	9026	9006	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 6	8	9006
9007	9027	9007	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 7	9	9007
9008	9028	9008	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 8	10	9008
9009	9029	9009	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 9	11	9009
9010	9030	9010	Kỹ thuật viên cứu hộ	ACTIVE	Nhan vien demo co kinh nghiem xu ly su co xe so 10	12	9010
\.


--
-- Data for Name: rescue_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_vehicles (id, vehicle_code, vehicle_type, plate_number, status, company_id) FROM stdin;
34	RT-TRUCK-01	Tow Truck	50C-123.45	AVAILABLE	34
35	MC001	Xe cứu hộ xe máy	29X1-12345	AVAILABLE	35
36	RT-TRUCK-02	Tow Truck	50C-123.46	AVAILABLE	34
37	RT-TRUCK-03	Tow Truck	50C-123.47	AVAILABLE	34
38	RT-TRUCK-04	Tow Truck	50C-123.48	AVAILABLE	34
39	RT-TRUCK-05	Tow Truck	50C-123.49	AVAILABLE	34
9001	CLEAN-RV-01	Tow Truck	29C-CLEAN-01	AVAILABLE	9001
9002	CLEAN-RV-02	Mobile Battery Van	29C-CLEAN-02	AVAILABLE	9002
9003	CLEAN-RV-03	Motorbike Rescue	29C-CLEAN-03	AVAILABLE	9003
9004	CLEAN-RV-04	Flatbed Truck	29C-CLEAN-04	IN_SERVICE	9004
9005	CLEAN-RV-05	Quick Repair Van	29C-CLEAN-05	AVAILABLE	9005
9006	CLEAN-RV-06	Fuel Support Bike	29C-CLEAN-06	AVAILABLE	9006
9007	CLEAN-RV-07	Tire Service Van	29C-CLEAN-07	AVAILABLE	9007
9008	CLEAN-RV-08	Emergency Tow Truck	29C-CLEAN-08	IN_SERVICE	9008
9009	CLEAN-RV-09	Electric Diagnostic Van	29C-CLEAN-09	AVAILABLE	9009
9010	CLEAN-RV-10	Heavy Tow Truck	29C-CLEAN-10	AVAILABLE	9010
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, request_id, customer_id, company_id, staff_id, rating_score, comment, created_at) FROM stdin;
36	156	74	34	34	5		2026-06-21 10:33:02.933299
9001	9001	9011	9001	9001	5	Nhan vien den nhanh va xu ly rat chuyen nghiep.	2026-06-11 11:01:00
9002	9002	9012	9002	9002	4	Dich vu ro rang, bao gia minh bach.	2026-06-12 11:02:00
9003	9003	9013	9003	9003	4	Ho tro dung thoi gian, thai do tot.	2026-06-13 11:03:00
9004	9004	9014	9004	9004	5	Xe duoc xu ly nhanh, toi rat hai long.	2026-06-14 11:04:00
9005	9005	9015	9005	9005	4	Nhan vien tu van de hieu va nhiet tinh.	2026-06-15 11:05:00
9006	9006	9016	9006	9006	4	Gia hop ly, quy trinh thanh toan thuan tien.	2026-06-16 11:06:00
9007	9007	9017	9007	9007	4	Xe cuu ho sach se, trang thiet bi day du.	2026-06-17 11:07:00
9008	9008	9018	9008	9008	4	Ho tro an toan o vi tri dong xe.	2026-06-18 11:08:00
9009	9009	9019	9009	9009	4	Trao doi qua chat ro rang, khong bi cham tre.	2026-06-19 11:09:00
9010	9010	9020	9010	9010	5	Se tiep tuc su dung neu gap su co tuong tu.	2026-06-20 11:10:00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, role_name) FROM stdin;
1	CUSTOMER
2	ADMIN
3	RESCUE_COMPANY
4	RESCUE_STAFF
9	DISPATCHER
10	SUPPORT
11	FINANCE
12	MANAGER
13	OPERATOR
14	AUDITOR
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
9001	CLEAN_SVC_01	Cuu ho ac quy	Kich binh, thay ac quy tam thoi hoac ho tro khoi dong xe	250000.00
9002	CLEAN_SVC_02	Vay lop luu dong	Va lop, bom lop va thay lop du phong tai hien truong	180000.00
9003	CLEAN_SVC_03	Tiep nhien lieu	Mang nhien lieu den vi tri khach gap su co	220000.00
9004	CLEAN_SVC_04	Sua nhanh tai cho	Kiem tra va sua loi nhe tai hien truong	350000.00
9005	CLEAN_SVC_05	Mo khoa xe	Ho tro mo khoa xe an toan	300000.00
9006	CLEAN_SVC_06	Keo xe noi thanh	Keo xe ve gara trong khu vuc noi thanh	500000.00
9007	CLEAN_SVC_07	Keo xe lien quan	Keo xe quang duong dai hoac ra ngoai noi thanh	900000.00
9008	CLEAN_SVC_08	Ho tro tai nan	Ho tro dua xe den noi an toan sau va cham	700000.00
9009	CLEAN_SVC_09	Kiem tra dien xe	Kiem tra he thong dien va loi khoi dong	400000.00
9010	CLEAN_SVC_10	Goi cuu ho uu tien	Dich vu uu tien cho tinh huong khan cap	1200000.00
\.


--
-- Data for Name: test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test (id, name) FROM stdin;
1	Hung
9001	Clean test row 01
9002	Clean test row 02
9003	Clean test row 03
9004	Clean test row 04
9005	Clean test row 05
9006	Clean test row 06
9007	Clean test row 07
9008	Clean test row 08
9009	Clean test row 09
9010	Clean test row 10
\.


--
-- Data for Name: test_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_item (id, name) FROM stdin;
9001	Clean test item 01
9002	Clean test item 02
9003	Clean test item 03
9004	Clean test item 04
9005	Clean test item 05
9006	Clean test item 06
9007	Clean test item 07
9008	Clean test item 08
9009	Clean test item 09
9010	Clean test item 10
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, full_name, phone, avatar_url, created_at, role, status) FROM stdin;
1	hung.lv235740@sis.hust.edu.vn	luong van hung	0347826500	\N	\N	\N	\N
2	Hung.dv235736@sis.hust.edu.vn	dam vinh hung	0384875608	\N	\N	\N	\N
9001	clean.legacy01@vbas.local	Clean Legacy User 01	0989000001	\N	2026-06-11 08:30:00	CUSTOMER	ACTIVE
9002	clean.legacy02@vbas.local	Clean Legacy User 02	0989000002	\N	2026-06-12 08:30:00	CUSTOMER	ACTIVE
9003	clean.legacy03@vbas.local	Clean Legacy User 03	0989000003	\N	2026-06-13 08:30:00	CUSTOMER	ACTIVE
9004	clean.legacy04@vbas.local	Clean Legacy User 04	0989000004	\N	2026-06-14 08:30:00	CUSTOMER	ACTIVE
9005	clean.legacy05@vbas.local	Clean Legacy User 05	0989000005	\N	2026-06-15 08:30:00	CUSTOMER	ACTIVE
9006	clean.legacy06@vbas.local	Clean Legacy User 06	0989000006	\N	2026-06-16 08:30:00	CUSTOMER	ACTIVE
9007	clean.legacy07@vbas.local	Clean Legacy User 07	0989000007	\N	2026-06-17 08:30:00	STAFF	ACTIVE
9008	clean.legacy08@vbas.local	Clean Legacy User 08	0989000008	\N	2026-06-18 08:30:00	STAFF	ACTIVE
9009	clean.legacy09@vbas.local	Clean Legacy User 09	0989000009	\N	2026-06-19 08:30:00	STAFF	ACTIVE
9010	clean.legacy10@vbas.local	Clean Legacy User 10	0989000010	\N	2026-06-20 08:30:00	STAFF	ACTIVE
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.account_id_seq', 9040, true);


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.addresses_id_seq', 9010, true);


--
-- Name: customer_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_vehicles_id_seq', 9010, true);


--
-- Name: daily_statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_statistics_id_seq', 9010, true);


--
-- Name: incident_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incident_types_id_seq', 9010, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 9010, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 9010, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 9010, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 9010, true);


--
-- Name: pricing_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pricing_rules_id_seq', 9010, true);


--
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quotes_id_seq', 9010, true);


--
-- Name: request_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_assignments_id_seq', 9010, true);


--
-- Name: request_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_status_history_id_seq', 9010, true);


--
-- Name: rescue_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_companies_id_seq', 9010, true);


--
-- Name: rescue_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_requests_id_seq', 9010, true);


--
-- Name: rescue_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_staff_id_seq', 9010, true);


--
-- Name: rescue_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_vehicles_id_seq', 9010, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 9010, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 14, true);


--
-- Name: service_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_types_id_seq', 9010, true);


--
-- Name: test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_id_seq', 9010, true);


--
-- Name: test_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_item_id_seq', 9010, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9010, true);


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

