--
-- PostgreSQL database dump
--

-- Dumped from database version 16.13
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
-- Name: public; Type: SCHEMA; Schema: -; Owner: avnadmin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO avnadmin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: avnadmin
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: avnadmin
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
    CONSTRAINT account_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'BANNED'::character varying])::text[])))
);


ALTER TABLE public.account OWNER TO avnadmin;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_id_seq OWNER TO avnadmin;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: avnadmin
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


ALTER TABLE public.addresses OWNER TO avnadmin;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addresses_id_seq OWNER TO avnadmin;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: customer_vehicles; Type: TABLE; Schema: public; Owner: avnadmin
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


ALTER TABLE public.customer_vehicles OWNER TO avnadmin;

--
-- Name: customer_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.customer_vehicles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_vehicles_id_seq OWNER TO avnadmin;

--
-- Name: customer_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.customer_vehicles_id_seq OWNED BY public.customer_vehicles.id;


--
-- Name: daily_statistics; Type: TABLE; Schema: public; Owner: avnadmin
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


ALTER TABLE public.daily_statistics OWNER TO avnadmin;

--
-- Name: daily_statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.daily_statistics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_statistics_id_seq OWNER TO avnadmin;

--
-- Name: daily_statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.daily_statistics_id_seq OWNED BY public.daily_statistics.id;


--
-- Name: incident_types; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.incident_types (
    id bigint NOT NULL,
    incident_code character varying(50) NOT NULL,
    incident_name character varying(255) NOT NULL,
    description text
);


ALTER TABLE public.incident_types OWNER TO avnadmin;

--
-- Name: incident_types_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.incident_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incident_types_id_seq OWNER TO avnadmin;

--
-- Name: incident_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.incident_types_id_seq OWNED BY public.incident_types.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    request_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    content text NOT NULL,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.messages OWNER TO avnadmin;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO avnadmin;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.password_reset_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO avnadmin;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO avnadmin;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: avnadmin
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
    CONSTRAINT payments_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['CASH'::character varying, 'BANK_TRANSFER'::character varying, 'MOMO'::character varying, 'VNPAY'::character varying, 'ZALOPAY'::character varying])::text[]))),
    CONSTRAINT payments_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO avnadmin;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO avnadmin;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: pricing_rules; Type: TABLE; Schema: public; Owner: avnadmin
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


ALTER TABLE public.pricing_rules OWNER TO avnadmin;

--
-- Name: pricing_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.pricing_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pricing_rules_id_seq OWNER TO avnadmin;

--
-- Name: pricing_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.pricing_rules_id_seq OWNED BY public.pricing_rules.id;


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: avnadmin
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
    note text,
    customer_note text,
    CONSTRAINT quotes_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SENT'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying, 'EXPIRED'::character varying])::text[])))
);


ALTER TABLE public.quotes OWNER TO avnadmin;

--
-- Name: quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.quotes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotes_id_seq OWNER TO avnadmin;

--
-- Name: quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.quotes_id_seq OWNED BY public.quotes.id;


--
-- Name: request_assignments; Type: TABLE; Schema: public; Owner: avnadmin
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
    CONSTRAINT request_assignments_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying, 'COMPLETED'::character varying])::text[])))
);


ALTER TABLE public.request_assignments OWNER TO avnadmin;

--
-- Name: request_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.request_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_assignments_id_seq OWNER TO avnadmin;

--
-- Name: request_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.request_assignments_id_seq OWNED BY public.request_assignments.id;


--
-- Name: request_status_history; Type: TABLE; Schema: public; Owner: avnadmin
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


ALTER TABLE public.request_status_history OWNER TO avnadmin;

--
-- Name: request_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.request_status_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_status_history_id_seq OWNER TO avnadmin;

--
-- Name: request_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.request_status_history_id_seq OWNED BY public.request_status_history.id;


--
-- Name: rescue_companies; Type: TABLE; Schema: public; Owner: avnadmin
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
    CONSTRAINT rescue_companies_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'SUSPENDED'::character varying])::text[])))
);


ALTER TABLE public.rescue_companies OWNER TO avnadmin;

--
-- Name: rescue_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.rescue_companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_companies_id_seq OWNER TO avnadmin;

--
-- Name: rescue_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.rescue_companies_id_seq OWNED BY public.rescue_companies.id;


--
-- Name: rescue_requests; Type: TABLE; Schema: public; Owner: avnadmin
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
    CONSTRAINT rescue_requests_priority_level_check CHECK (((priority_level)::text = ANY ((ARRAY['LOW'::character varying, 'NORMAL'::character varying, 'HIGH'::character varying, 'EMERGENCY'::character varying])::text[]))),
    CONSTRAINT rescue_requests_status_check CHECK (((status)::text = ANY ((ARRAY['CREATED'::character varying, 'SEARCHING'::character varying, 'MATCHED'::character varying, 'ACCEPTED'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'CANCELED'::character varying])::text[])))
);


ALTER TABLE public.rescue_requests OWNER TO avnadmin;

--
-- Name: rescue_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.rescue_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_requests_id_seq OWNER TO avnadmin;

--
-- Name: rescue_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.rescue_requests_id_seq OWNED BY public.rescue_requests.id;


--
-- Name: rescue_staff; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.rescue_staff (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    company_id bigint NOT NULL,
    job_title character varying(255),
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    CONSTRAINT rescue_staff_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'OFFLINE'::character varying, 'BUSY'::character varying])::text[])))
);


ALTER TABLE public.rescue_staff OWNER TO avnadmin;

--
-- Name: rescue_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.rescue_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_staff_id_seq OWNER TO avnadmin;

--
-- Name: rescue_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.rescue_staff_id_seq OWNED BY public.rescue_staff.id;


--
-- Name: rescue_vehicles; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.rescue_vehicles (
    id bigint NOT NULL,
    vehicle_code character varying(100) NOT NULL,
    vehicle_type character varying(100) NOT NULL,
    plate_number character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    company_id bigint NOT NULL,
    CONSTRAINT rescue_vehicles_status_check CHECK (((status)::text = ANY ((ARRAY['AVAILABLE'::character varying, 'IN_SERVICE'::character varying, 'MAINTENANCE'::character varying])::text[])))
);


ALTER TABLE public.rescue_vehicles OWNER TO avnadmin;

--
-- Name: rescue_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.rescue_vehicles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_vehicles_id_seq OWNER TO avnadmin;

--
-- Name: rescue_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.rescue_vehicles_id_seq OWNED BY public.rescue_vehicles.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: avnadmin
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


ALTER TABLE public.reviews OWNER TO avnadmin;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO avnadmin;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO avnadmin;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO avnadmin;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: service_types; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.service_types (
    id bigint NOT NULL,
    service_code character varying(50) NOT NULL,
    service_name character varying(255) NOT NULL,
    description text
);


ALTER TABLE public.service_types OWNER TO avnadmin;

--
-- Name: service_types_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.service_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_types_id_seq OWNER TO avnadmin;

--
-- Name: service_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.service_types_id_seq OWNED BY public.service_types.id;


--
-- Name: test; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.test (
    id integer NOT NULL,
    name text
);


ALTER TABLE public.test OWNER TO avnadmin;

--
-- Name: test_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_id_seq OWNER TO avnadmin;

--
-- Name: test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.test_id_seq OWNED BY public.test.id;


--
-- Name: test_item; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.test_item (
    id bigint NOT NULL,
    name character varying(255)
);


ALTER TABLE public.test_item OWNER TO avnadmin;

--
-- Name: test_item_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
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
-- Name: users; Type: TABLE; Schema: public; Owner: avnadmin
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


ALTER TABLE public.users OWNER TO avnadmin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
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
-- Name: account id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: customer_vehicles id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.customer_vehicles ALTER COLUMN id SET DEFAULT nextval('public.customer_vehicles_id_seq'::regclass);


--
-- Name: daily_statistics id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.daily_statistics ALTER COLUMN id SET DEFAULT nextval('public.daily_statistics_id_seq'::regclass);


--
-- Name: incident_types id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.incident_types ALTER COLUMN id SET DEFAULT nextval('public.incident_types_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: pricing_rules id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.pricing_rules ALTER COLUMN id SET DEFAULT nextval('public.pricing_rules_id_seq'::regclass);


--
-- Name: quotes id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.quotes ALTER COLUMN id SET DEFAULT nextval('public.quotes_id_seq'::regclass);


--
-- Name: request_assignments id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_assignments ALTER COLUMN id SET DEFAULT nextval('public.request_assignments_id_seq'::regclass);


--
-- Name: request_status_history id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_status_history ALTER COLUMN id SET DEFAULT nextval('public.request_status_history_id_seq'::regclass);


--
-- Name: rescue_companies id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_companies ALTER COLUMN id SET DEFAULT nextval('public.rescue_companies_id_seq'::regclass);


--
-- Name: rescue_requests id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_requests ALTER COLUMN id SET DEFAULT nextval('public.rescue_requests_id_seq'::regclass);


--
-- Name: rescue_staff id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_staff ALTER COLUMN id SET DEFAULT nextval('public.rescue_staff_id_seq'::regclass);


--
-- Name: rescue_vehicles id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_vehicles ALTER COLUMN id SET DEFAULT nextval('public.rescue_vehicles_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: service_types id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.service_types ALTER COLUMN id SET DEFAULT nextval('public.service_types_id_seq'::regclass);


--
-- Name: test id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.test ALTER COLUMN id SET DEFAULT nextval('public.test_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: avnadmin
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
74	customer@vbas.local	$2a$10$G.bQwF3fvlGgOLlhFzM31eguLkhbvON3O3CQ0B.RTovQrpj2zrC2C	Demo Customer	0900000002	\N	ACTIVE	2026-04-09 14:25:29.43875	1	\N	FEMALE	\N	\N
75	company@vbas.local	$2a$10$rjHPQwx0fREqDoBTeNTStuK54bl.jGhfHO8QV/fotDrMlK5utkLOm	RapidTow Owner	0900000003	\N	ACTIVE	2026-04-09 14:25:29.43875	3	\N	MALE	\N	\N
76	staff@vbas.local	$2a$10$7Q2uIg4PZN4te9memDTjD.x3egu0ZpuTBPX0zyYnNQrp71Rnj6Lmi	RapidTow Staff	0900000004	\N	ACTIVE	2026-04-09 14:25:29.43875	4	\N	MALE	\N	\N
88	duyhung22102005@gmail.com	$2a$10$zLk7yh3fDblyy7pa9RqkS.sWxG0UPwaY/xIyAbg1ePPgq61AMYKAe	Trần Duy Hưng	0911905611	\N	ACTIVE	2026-04-15 18:30:54.8599	1	\N	\N	\N	\N
85	abc111@gmail.com	$2a$10$zuZho1C7s/8SLBtO3ePzmOWcQ3Xe2.WhhF5bQUPE5uLO2RbEilhmu	Nguyen Van A	\N	\N	ACTIVE	2026-04-15 17:18:33.17839	1	\N	\N	\N	\N
86	abc1112@gmail.com	$2a$10$NktNPvgHx6BKKYiCDiI5o.Hrksu0.VkM9vUdEnosQoK5isEoEG3t.	Nguyen Van A	\N	\N	ACTIVE	2026-04-15 17:26:55.981164	1	\N	\N	\N	\N
87	abc11122@gmail.com	$2a$10$3Xd0PYYj3T2C7eDMWgyfMuj4SB2AQ3qPWMR669WGB5HmQGiAT/qBW	Nguyen Van A	\N	\N	ACTIVE	2026-04-15 17:37:06.574988	1	\N	\N	\N	\N
5	luongvanhungnet@gmail.com	$2a$10$ai4a6VbtCScpzrboFjjkEObdgvwNKt/X5qL.yzvUK.KMKhZhOW2uC	Luong Van Hung	0333826500		ACTIVE	2026-04-09 07:12:17.230256	3	2005-02-22	Male	3	020205006134
89	thien.nq235838@sis.hust.edu.vn	$2a$10$heYTBvUo8g4HyaocgAnLOO1HEHd6y4x4UGzkjrCC1qs/hjF2cS/cy	Nguyễn Quang Thiện	0329584430		ACTIVE	2026-04-15 19:23:30.331658	2	\N		93	12458484837
90	thien123@gmail.com	$2a$10$Y2mYefCRlV5mEBe/kgtH8e9OF60lzHeC7VN5fLVGRmVZDSxerRX8a	Nguyễn Quang Thiện	0329584430		ACTIVE	2026-04-15 19:31:44.729521	3	2005-03-11		94	012345678912
39	dam01@gmail.com	$2a$10$wbwcYVaz3BZbRR0ERM3kp.BuNbnluIM7HkJfXd7nLLW/YTJJ/fH52	Hung Dam	0384875608	/uploads/avatars/95799a1d-68d0-42c6-a65a-95d61b9a5607.png	ACTIVE	2026-04-09 19:57:43.432084	1	\N	\N	\N	\N
93	thien113205@gmail.com	$2a$10$VetlWCsrNI0poUxQHXVgLOI/c0Barx6ytJA1kl39nIpzhZz0CV9UC	Nguyễn Quang Thiện	0329584430		BANNED	2026-04-15 20:44:06.563483	1	\N		96	12345678999
91	nguyenquangthien1132005@gmail.com	$2a$10$GfuQJOqohdPxyWure1VLHOay01pO4u2AaKqv1UqexHfw.qLAbable	Nguyễn Quang Thiện	0329584430	\N	BANNED	2026-04-15 20:39:59.124745	4	\N	\N	\N	\N
92	huyen29112002@gmail.com	$2a$10$IOjgmWg0qB/SCUbDS2meDu/LH8xSoPPGZtbpPD7WfJVzs6LEHGnL.	Nguyễn Quang Thiện	0329584430	\N	ACTIVE	2026-04-15 20:40:17.361165	4	\N	\N	110	\N
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: avnadmin
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
\.


--
-- Data for Name: customer_vehicles; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.customer_vehicles (id, customer_id, fuel_type, notes, brand, color, manufacture_year, model, plate_number) FROM stdin;
1	1	h	h	h	h	2026	h	h
2	39		Xe chính chủ, bảo dưỡng định kỳ tại hãng, đã dán phim cách nhiệt.	Toyota	đen	2023	Camry 2.5Q	30H - 123.45
35	74	Gasoline	Seed vehicle for demo customer	Toyota	White	2021	Vios	51A-888.88
36	39			Tesla	đỏ	2023	Vin 2.5Q	29F - 123.45
37	93	Dầu 	Xe gia đình 5 chỗ	Toyota	Đen	2019	Vios	29B-54321
\.


--
-- Data for Name: daily_statistics; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.daily_statistics (id, stat_date, request_count, completed_request_count, canceled_request_count, in_progress_request_count, paid_payment_count, revenue, review_count, average_rating, customer_count, staff_count, company_count, approved_company_count, calculated_at) FROM stdin;
1	2026-05-06	26	5	2	6	3	1100000.00	2	5.00	9	4	3	3	2026-05-06 20:24:12.368794
\.


--
-- Data for Name: incident_types; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.incident_types (id, incident_code, incident_name, description) FROM stdin;
1	001	Het Xang	Het xang 
34	FLAT_TIRE	Flat Tire	Vehicle has a punctured or damaged tire
35	ENGINE_FAIL	Engine Failure	Vehicle cannot continue due to engine issue
36	BATTERY	Battery Problem	Battery drained or electrical startup problem
2	002	Thủng xăm 	Thủng xăm 
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: avnadmin
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
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used_at) FROM stdin;
1	5	3f55e2a8-a4dd-406c-b5d7-3fecfb6eab7f	2026-04-14 20:25:10.002484	2026-04-14 20:12:09.460349
2	5	8a80e817-5191-44f3-9911-a896095f9652	2026-04-15 18:02:48.662879	2026-04-15 17:48:38.776746
3	5	b3332d9c-583b-4b0d-8f6a-a18f5f8dcf97	2026-04-15 18:44:46.039807	\N
4	88	8e5a9242-e08d-49e3-b661-849125e37a0f	2026-04-15 18:46:20.534359	\N
5	88	54cbadd6-d77a-498a-a948-0bc2d9298f1a	2026-04-15 22:28:07.765383	\N
6	88	8b7f62bd-c413-4218-9b34-f3195f276499	2026-04-15 22:38:54.894519	2026-04-15 22:24:24.45407
7	88	80bdff1a-4202-43c2-8c3b-11cb8d7526ed	2026-04-15 22:54:52.776821	2026-04-15 22:41:08.799883
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.payments (id, request_id, customer_id, amount, payment_method, payment_status, paid_at, created_at) FROM stdin;
1	1	1	500000.00	CASH	PAID	2026-04-09 07:50:35.519607	2026-04-09 07:33:40.221299
34	67	1	500000.00	CASH	PAID	2026-04-09 21:39:23.693534	2026-04-09 21:36:28.311302
35	68	39	100000.00	VNPAY	PAID	2026-04-11 22:04:36.219619	2026-04-11 22:04:29.315343
36	70	39	50000.00	ZALOPAY	PENDING	\N	2026-04-12 21:51:37.643089
\.


--
-- Data for Name: pricing_rules; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.pricing_rules (id, company_id, service_type_id, distance_from_km, distance_to_km, price_per_km, night_surcharge, holiday_surcharge) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.quotes (id, request_id, company_id, staff_id, quote_code, estimated_amount, final_amount, status, created_at, expires_at, service_name, quantity, unit_price, subtotal) FROM stdin;
1	1	1	\N	QTE-20260409074815-DEE5CC	600000.00	600000.00	ACCEPTED	2026-04-09 07:48:15.643537	2026-10-04 14:30:00	Va xam	1	1.00	600000.00
34	67	1	\N	QTE-20260409213819-B7CACD	600000.00	60000.00	ACCEPTED	2026-04-09 21:38:19.387216	2026-04-09 23:00:00	Va xam	1	1.00	600000.00
35	71	34	34	QTE-20260414203120-B9F305	500000.00	500000.00	SENT	2026-04-14 20:31:20.617753	2026-04-14 20:31:00	Towing	1	\N	\N
36	72	34	\N	QTE-20260414221200-D0A1E2	10000.00	10000.00	SENT	2026-04-14 22:12:00.054445	2026-04-14 22:11:00	Do day binh	1	\N	\N
37	78	35	36	QTE-20260415210536-22A8E5	1000000.00	800000.00	SENT	2026-04-15 21:05:36.093127	\N	Va xam	1	\N	0.00
\.


--
-- Data for Name: request_assignments; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.request_assignments (id, request_id, company_id, staff_id, vehicle_id, assigned_by_user_id, assigned_at, accepted_at, rejected_at, status) FROM stdin;
1	1	1	1	1	5	2026-04-09 07:45:10.806186	2026-04-09 07:46:28.724807	\N	COMPLETED
67	67	1	1	1	5	2026-04-09 21:30:42.871447	2026-04-09 21:32:57.02848	\N	COMPLETED
34	34	1	\N	\N	40	2026-04-09 20:23:49.644064	\N	2026-04-11 22:03:15.64939	REJECTED
68	34	34	\N	\N	39	2026-04-11 22:03:16.293916	\N	2026-04-12 21:18:02.243066	REJECTED
69	70	34	34	34	75	2026-04-12 21:54:26.675786	2026-04-14 15:01:12.11772	\N	ACCEPTED
70	71	34	34	34	75	2026-04-14 20:28:42.052761	2026-04-14 20:30:47.478502	\N	ACCEPTED
71	72	34	34	34	75	2026-04-14 22:10:44.180812	2026-04-14 22:11:29.754492	\N	COMPLETED
72	69	1	\N	\N	73	2026-04-14 23:14:19.767543	\N	2026-04-14 23:22:18.944779	REJECTED
73	68	1	\N	\N	73	2026-04-14 23:14:39.267119	\N	2026-04-14 23:22:19.754283	REJECTED
74	73	34	34	34	75	2026-04-14 23:22:34.581805	2026-04-14 23:24:32.328738	2026-04-14 23:36:13.786739	REJECTED
75	74	34	34	34	75	2026-04-14 23:37:06.930304	2026-04-14 23:38:27.135761	\N	ACCEPTED
77	76	34	34	34	75	2026-04-15 14:39:05.279701	2026-04-15 14:40:48.906191	\N	ACCEPTED
76	75	34	\N	\N	73	2026-04-15 14:36:21.305017	\N	2026-04-15 14:46:28.84594	REJECTED
78	78	35	36	35	90	2026-04-15 20:58:33.117441	2026-04-15 21:03:55.358538	\N	COMPLETED
79	79	34	34	34	75	2026-04-15 22:11:39.342989	2026-04-15 22:13:22.831891	\N	ACCEPTED
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
92	89	34	34	34	75	2026-05-06 00:02:57.507105	2026-05-06 00:05:13.316466	\N	ACCEPTED
\.


--
-- Data for Name: request_status_history; Type: TABLE DATA; Schema: public; Owner: avnadmin
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
\.


--
-- Data for Name: rescue_companies; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.rescue_companies (id, company_name, tax_code, license_number, email, phone, description, status, created_at, updated_at, owner_account_id, address_id, latitude, longitude) FROM stdin;
1	Hanoi university of science and technology branch	001	0001	luongvanhungnet@gmail.com	0347826501	Chi nhanh cua hang tai Back Khoa, Hai Ba Trung	APPROVED	2026-04-09 07:18:18.348735	2026-05-06 13:32:25.094678	5	6	19.9962684	10.5840483
34	RapidTow Rescue	TAX-001	LIC-001	rapidtow@vbas.local	0900000010	Demo rescue company for assignment and quote flow	APPROVED	2026-04-09 14:25:29.43875	2026-05-06 13:32:25.094678	75	73	10.7731000	106.7043000
35	Thien's Company	0109876543	01H8001234	thien123@gmail.com	0329584430		APPROVED	2026-04-15 20:37:51.608427	2026-05-06 13:32:25.094678	90	95	21.0342894	105.8533942
\.


--
-- Data for Name: rescue_requests; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.rescue_requests (id, request_code, customer_id, vehicle_id, incident_type_id, service_type_id, location_id, description, priority_level, status, created_at, updated_at, image_url) FROM stdin;
1	REQ-20260409073241-7B2C98	1	1	2	2	7	abcxyz	EMERGENCY	COMPLETED	2026-04-09 07:32:41.406868	2026-04-09 07:52:32.761773	\N
34	REQ-20260409195837-852823	39	\N	2	1	40	haizzzz	NORMAL	MATCHED	2026-04-09 19:58:37.77118	2026-04-09 20:23:49.965442	\N
67	REQ-20260409212729-D51458	1	1	2	2	74	Emergence	EMERGENCY	COMPLETED	2026-04-09 21:27:29.99243	2026-04-09 21:40:33.10779	\N
70	REQ-20260412215122-2FAF08	39	2	36	36	77	wwhyyyy	EMERGENCY	MATCHED	2026-04-12 21:51:22.557994	2026-04-12 21:54:26.965095	\N
85	REQ-20260505184057-8579C3	39	2	35	1	104		HIGH	IN_PROGRESS	2026-05-05 18:40:57.422031	2026-05-05 20:25:10.727373	\N
71	REQ-20260414202744-A39B98	39	2	35	34	78	fuuu	EMERGENCY	IN_PROGRESS	2026-04-14 20:27:44.722912	2026-04-14 20:30:05.693073	\N
69	REQ-20260412214436-E0858E	74	35	35	34	76	helllooo	HIGH	MATCHED	2026-04-12 21:44:36.577113	2026-04-14 23:14:20.069736	\N
68	REQ-20260411220410-FDC13B	39	2	34	1	75	hiaazzz	HIGH	MATCHED	2026-04-11 22:04:10.329348	2026-04-14 23:14:39.583454	\N
72	REQ-20260414221004-1CE96A	39	36	1	1	79	gg	HIGH	COMPLETED	2026-04-14 22:10:04.48447	2026-04-14 23:16:20.410397	\N
73	REQ-20260414232157-F2877E	39	36	2	2	80		LOW	CANCELED	2026-04-14 23:21:58.091311	2026-04-14 23:36:12.881801	\N
74	REQ-20260414233637-7C54B0	39	36	36	1	81		NORMAL	IN_PROGRESS	2026-04-14 23:36:38.148402	2026-04-14 23:38:46.997942	\N
75	REQ-20260415143539-65BE81	39	36	1	1	82		NORMAL	MATCHED	2026-04-15 14:35:39.998125	2026-04-15 14:36:21.608318	\N
76	REQ-20260415143840-14585C	39	2	36	2	83		HIGH	IN_PROGRESS	2026-04-15 14:38:40.631732	2026-04-15 14:40:32.649071	\N
77	REQ-20260415174609-05B0A1	39	36	36	1	92	fdf	HIGH	CREATED	2026-04-15 17:46:09.396706	2026-04-15 17:46:09.396706	\N
87	REQ-20260505205220-C6EAA1	39	2	36	2	106		HIGH	COMPLETED	2026-05-05 20:52:20.993227	2026-05-05 20:56:57.083165	\N
78	REQ-20260415205214-040A76	93	37	2	2	97	Tôi bị thủng xăm trên đường 	HIGH	COMPLETED	2026-04-15 20:52:15.150052	2026-04-15 21:06:04.368211	\N
79	REQ-20260415221056-2FCDBE	39	36	1	36	98	rhr	HIGH	MATCHED	2026-04-15 22:10:56.426394	2026-04-15 22:11:39.647377	\N
80	REQ-20260415223505-2238AC	39	36	36	36	99		LOW	MATCHED	2026-04-15 22:35:05.5378	2026-04-15 22:35:36.284526	\N
81	REQ-20260415225803-5B2A81	1	1	36	36	100	adfsa	NORMAL	CREATED	2026-04-15 22:58:03.198159	2026-04-15 22:58:03.198159	\N
82	REQ-20260417150648-3CF106	39	36	34	2	101		HIGH	MATCHED	2026-04-17 15:06:48.696396	2026-04-17 15:07:33.465839	\N
83	REQ-20260422153153-03F68F	93	37	1	1	102	abcxyz	HIGH	IN_PROGRESS	2026-04-22 15:31:53.770877	2026-04-22 15:34:50.253957	\N
84	REQ-20260426155832-A1CFB5	93	37	2	1	103		HIGH	IN_PROGRESS	2026-04-26 15:58:33.015201	2026-04-26 16:04:59.477192	\N
86	REQ-20260505205152-880A03	39	36	2	1	105		HIGH	CANCELED	2026-05-05 20:51:53.159802	2026-05-05 21:02:55.720498	\N
88	REQ-20260505210328-1D083A	39	2	34	36	107		HIGH	SEARCHING	2026-05-05 21:03:28.597929	2026-05-05 21:10:10.194692	\N
89	REQ-20260505210355-DDBC0E	39	36	1	2	108		HIGH	MATCHED	2026-05-05 21:03:55.499937	2026-05-06 00:02:57.844706	\N
90	REQ-20260506131249-10C809	39	\N	1	\N	109	Air conditioner not working	HIGH	CREATED	2026-05-06 13:12:49.682748	2026-05-06 13:15:11.966215	/uploads/request-images/916b83bd-ff90-454a-b65e-210f8ee494c0.png
\.


--
-- Data for Name: rescue_staff; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.rescue_staff (id, user_id, company_id, job_title, status) FROM stdin;
1	6	1	Tow operator	ACTIVE
34	76	34	Field Technician	ACTIVE
35	91	35	Trưởng nhóm	ACTIVE
36	92	35	Thành viên	ACTIVE
\.


--
-- Data for Name: rescue_vehicles; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.rescue_vehicles (id, vehicle_code, vehicle_type, plate_number, status, company_id) FROM stdin;
1	001	001	001	AVAILABLE	1
34	RT-TRUCK-01	Tow Truck	50C-123.45	AVAILABLE	34
35	MC001	Xe cứu hộ xe máy	29X1-12345	AVAILABLE	35
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.reviews (id, request_id, customer_id, company_id, staff_id, rating_score, comment, created_at) FROM stdin;
1	1	1	1	1	5	Dich vu tuyet voi	2026-04-09 07:53:21.615083
34	67	1	1	1	5	dich vu tuyet voi, nhanh chong	2026-04-09 21:41:55.625873
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.roles (id, role_name) FROM stdin;
1	CUSTOMER
2	ADMIN
3	RESCUE_COMPANY
4	RESCUE_STAFF
\.


--
-- Data for Name: service_types; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.service_types (id, service_code, service_name, description) FROM stdin;
1	001	Do day binh	Do day binh
2	002	Va xam	Va xam
34	TOWING	Towing	Tow the vehicle to a garage or safe location
35	ON_SITE_REPAIR	On-site Repair	Provide quick rescue or fix at the incident location
36	BATTERY_SUPPORT	Battery Support	Jump start or battery emergency handling
\.


--
-- Data for Name: test; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.test (id, name) FROM stdin;
1	Hung
2	Test
\.


--
-- Data for Name: test_item; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.test_item (id, name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.users (id, email, full_name, phone, avatar_url, created_at, role, status) FROM stdin;
1	hung.lv235740@sis.hust.edu.vn	luong van hung	0347826500	\N	\N	\N	\N
2	Hung.dv235736@sis.hust.edu.vn	dam vinh hung	0384875608	\N	\N	\N	\N
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.account_id_seq', 93, true);


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.addresses_id_seq', 142, true);


--
-- Name: customer_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.customer_vehicles_id_seq', 37, true);


--
-- Name: daily_statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.daily_statistics_id_seq', 1, true);


--
-- Name: incident_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.incident_types_id_seq', 36, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.messages_id_seq', 78, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 7, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.payments_id_seq', 36, true);


--
-- Name: pricing_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.pricing_rules_id_seq', 1, false);


--
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.quotes_id_seq', 37, true);


--
-- Name: request_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.request_assignments_id_seq', 92, true);


--
-- Name: request_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.request_status_history_id_seq', 169, true);


--
-- Name: rescue_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.rescue_companies_id_seq', 35, true);


--
-- Name: rescue_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.rescue_requests_id_seq', 122, true);


--
-- Name: rescue_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.rescue_staff_id_seq', 36, true);


--
-- Name: rescue_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.rescue_vehicles_id_seq', 35, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.reviews_id_seq', 34, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.roles_id_seq', 8, true);


--
-- Name: service_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.service_types_id_seq', 36, true);


--
-- Name: test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.test_id_seq', 2, true);


--
-- Name: test_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.test_item_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: account account_email_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_vehicles customer_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT customer_vehicles_pkey PRIMARY KEY (id);


--
-- Name: daily_statistics daily_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.daily_statistics
    ADD CONSTRAINT daily_statistics_pkey PRIMARY KEY (id);


--
-- Name: daily_statistics daily_statistics_stat_date_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.daily_statistics
    ADD CONSTRAINT daily_statistics_stat_date_key UNIQUE (stat_date);


--
-- Name: incident_types incident_types_incident_code_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.incident_types
    ADD CONSTRAINT incident_types_incident_code_key UNIQUE (incident_code);


--
-- Name: incident_types incident_types_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.incident_types
    ADD CONSTRAINT incident_types_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: pricing_rules pricing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT pricing_rules_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_quote_code_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_quote_code_key UNIQUE (quote_code);


--
-- Name: request_assignments request_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT request_assignments_pkey PRIMARY KEY (id);


--
-- Name: request_status_history request_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_status_history
    ADD CONSTRAINT request_status_history_pkey PRIMARY KEY (id);


--
-- Name: rescue_companies rescue_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_companies
    ADD CONSTRAINT rescue_companies_pkey PRIMARY KEY (id);


--
-- Name: rescue_requests rescue_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT rescue_requests_pkey PRIMARY KEY (id);


--
-- Name: rescue_requests rescue_requests_request_code_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT rescue_requests_request_code_key UNIQUE (request_code);


--
-- Name: rescue_staff rescue_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT rescue_staff_pkey PRIMARY KEY (id);


--
-- Name: rescue_staff rescue_staff_user_id_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT rescue_staff_user_id_key UNIQUE (user_id);


--
-- Name: rescue_vehicles rescue_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_vehicles
    ADD CONSTRAINT rescue_vehicles_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (id);


--
-- Name: service_types service_types_service_code_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_service_code_key UNIQUE (service_code);


--
-- Name: test_item test_item_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.test_item
    ADD CONSTRAINT test_item_pkey PRIMARY KEY (id);


--
-- Name: test test_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_pkey PRIMARY KEY (id);


--
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: rescue_companies uk_88vu5jnswpiykx9r5lbtd2c7e; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_companies
    ADD CONSTRAINT uk_88vu5jnswpiykx9r5lbtd2c7e UNIQUE (owner_account_id);


--
-- Name: customer_vehicles uk_ovuveuhfabs76oeq824hjsa92; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT uk_ovuveuhfabs76oeq824hjsa92 UNIQUE (plate_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: rescue_companies fk1v9mpcqxufg76nd699ydb5j41; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_companies
    ADD CONSTRAINT fk1v9mpcqxufg76nd699ydb5j41 FOREIGN KEY (owner_account_id) REFERENCES public.account(id);


--
-- Name: account fk_account_default_address; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT fk_account_default_address FOREIGN KEY (default_address_id) REFERENCES public.addresses(id);


--
-- Name: account fk_account_role; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT fk_account_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: request_assignments fk_assignment_assigned_by; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_assigned_by FOREIGN KEY (assigned_by_user_id) REFERENCES public.account(id);


--
-- Name: request_assignments fk_assignment_company; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: request_assignments fk_assignment_request; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: request_assignments fk_assignment_staff; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_staff FOREIGN KEY (staff_id) REFERENCES public.rescue_staff(id);


--
-- Name: request_assignments fk_assignment_vehicle; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_assignments
    ADD CONSTRAINT fk_assignment_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.rescue_vehicles(id);


--
-- Name: customer_vehicles fk_customer_vehicle_customer; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT fk_customer_vehicle_customer FOREIGN KEY (customer_id) REFERENCES public.account(id);


--
-- Name: messages fk_message_request; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_message_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: messages fk_message_sender; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES public.account(id);


--
-- Name: password_reset_tokens fk_password_reset_user; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES public.account(id);


--
-- Name: payments fk_payment_customer; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payment_customer FOREIGN KEY (customer_id) REFERENCES public.account(id);


--
-- Name: payments fk_payment_request; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payment_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: pricing_rules fk_pricing_company; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT fk_pricing_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: pricing_rules fk_pricing_service_type; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT fk_pricing_service_type FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: quotes fk_quote_company; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT fk_quote_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: quotes fk_quote_request; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT fk_quote_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: quotes fk_quote_staff; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT fk_quote_staff FOREIGN KEY (staff_id) REFERENCES public.rescue_staff(id);


--
-- Name: rescue_requests fk_request_customer; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_customer FOREIGN KEY (customer_id) REFERENCES public.account(id);


--
-- Name: rescue_requests fk_request_incident_type; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_incident_type FOREIGN KEY (incident_type_id) REFERENCES public.incident_types(id);


--
-- Name: rescue_requests fk_request_location; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_location FOREIGN KEY (location_id) REFERENCES public.addresses(id);


--
-- Name: rescue_requests fk_request_service_type; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_service_type FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: rescue_requests fk_request_vehicle; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT fk_request_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.customer_vehicles(id);


--
-- Name: rescue_companies fk_rescue_company_address; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_companies
    ADD CONSTRAINT fk_rescue_company_address FOREIGN KEY (address_id) REFERENCES public.addresses(id);


--
-- Name: rescue_vehicles fk_rescue_vehicle_company; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_vehicles
    ADD CONSTRAINT fk_rescue_vehicle_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: reviews fk_review_company; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_review_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: reviews fk_review_customer; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_review_customer FOREIGN KEY (customer_id) REFERENCES public.account(id);


--
-- Name: reviews fk_review_request; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_review_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: reviews fk_review_staff; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_review_staff FOREIGN KEY (staff_id) REFERENCES public.rescue_staff(id);


--
-- Name: rescue_staff fk_staff_company; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT fk_staff_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


--
-- Name: rescue_staff fk_staff_user; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES public.account(id);


--
-- Name: request_status_history fk_status_history_request; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_status_history
    ADD CONSTRAINT fk_status_history_request FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- Name: request_status_history fk_status_history_user; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.request_status_history
    ADD CONSTRAINT fk_status_history_user FOREIGN KEY (changed_by_user_id) REFERENCES public.account(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: avnadmin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--
