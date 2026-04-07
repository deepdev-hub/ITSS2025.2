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
    notes text
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
-- Name: incident_types; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.incident_types (
    id bigint NOT NULL,
    incident_code character varying(50) NOT NULL,
    incident_name character varying(255) NOT NULL
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
-- Name: rescue_company_branches; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.rescue_company_branches (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    branch_name character varying(255) NOT NULL,
    phone character varying(20),
    address_id bigint NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    is_main_branch boolean DEFAULT false NOT NULL
);


ALTER TABLE public.rescue_company_branches OWNER TO avnadmin;

--
-- Name: rescue_company_branches_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.rescue_company_branches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_company_branches_id_seq OWNER TO avnadmin;

--
-- Name: rescue_company_branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.rescue_company_branches_id_seq OWNED BY public.rescue_company_branches.id;


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
    branch_id bigint,
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
    branch_id bigint NOT NULL,
    vehicle_code character varying(100) NOT NULL,
    vehicle_type character varying(100) NOT NULL,
    plate_number character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
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
    service_name character varying(255) NOT NULL
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
-- Name: rescue_company_branches id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_company_branches ALTER COLUMN id SET DEFAULT nextval('public.rescue_company_branches_id_seq'::regclass);


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
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.account (id, email, password_hash, full_name, phone, avatar_url, status, created_at, role_id, date_of_birth, gender, default_address_id, cccd) FROM stdin;
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.addresses (id, country, province, district, ward, street, detail, latitude, longitude) FROM stdin;
\.


--
-- Data for Name: customer_vehicles; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.customer_vehicles (id, customer_id, fuel_type, notes) FROM stdin;
\.


--
-- Data for Name: incident_types; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.incident_types (id, incident_code, incident_name) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.messages (id, request_id, sender_id, content, sent_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.payments (id, request_id, customer_id, amount, payment_method, payment_status, paid_at) FROM stdin;
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
\.


--
-- Data for Name: request_assignments; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.request_assignments (id, request_id, company_id, staff_id, vehicle_id, assigned_by_user_id, assigned_at, accepted_at, rejected_at, status) FROM stdin;
\.


--
-- Data for Name: request_status_history; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.request_status_history (id, request_id, old_status, new_status, changed_by_user_id, note, changed_at) FROM stdin;
\.


--
-- Data for Name: rescue_companies; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.rescue_companies (id, company_name, tax_code, license_number, email, phone, description, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rescue_company_branches; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.rescue_company_branches (id, company_id, branch_name, phone, address_id, latitude, longitude, is_main_branch) FROM stdin;
\.


--
-- Data for Name: rescue_requests; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.rescue_requests (id, request_code, customer_id, vehicle_id, incident_type_id, service_type_id, location_id, description, priority_level, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rescue_staff; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.rescue_staff (id, user_id, company_id, branch_id, job_title, status) FROM stdin;
\.


--
-- Data for Name: rescue_vehicles; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.rescue_vehicles (id, branch_id, vehicle_code, vehicle_type, plate_number, status) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.reviews (id, request_id, customer_id, company_id, staff_id, rating_score, comment, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.roles (id, role_name) FROM stdin;
\.


--
-- Data for Name: service_types; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.service_types (id, service_code, service_name) FROM stdin;
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.account_id_seq', 1, false);


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.addresses_id_seq', 1, false);


--
-- Name: customer_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.customer_vehicles_id_seq', 1, false);


--
-- Name: incident_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.incident_types_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: pricing_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.pricing_rules_id_seq', 1, false);


--
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.quotes_id_seq', 1, false);


--
-- Name: request_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.request_assignments_id_seq', 1, false);


--
-- Name: request_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.request_status_history_id_seq', 1, false);


--
-- Name: rescue_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.rescue_companies_id_seq', 1, false);


--
-- Name: rescue_company_branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.rescue_company_branches_id_seq', 1, false);


--
-- Name: rescue_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.rescue_requests_id_seq', 1, false);


--
-- Name: rescue_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.rescue_staff_id_seq', 1, false);


--
-- Name: rescue_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.rescue_vehicles_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: service_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.service_types_id_seq', 1, false);


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
-- Name: rescue_company_branches rescue_company_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_company_branches
    ADD CONSTRAINT rescue_company_branches_pkey PRIMARY KEY (id);


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
-- Name: rescue_company_branches fk_branch_address; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_company_branches
    ADD CONSTRAINT fk_branch_address FOREIGN KEY (address_id) REFERENCES public.addresses(id);


--
-- Name: rescue_company_branches fk_branch_company; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_company_branches
    ADD CONSTRAINT fk_branch_company FOREIGN KEY (company_id) REFERENCES public.rescue_companies(id);


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
-- Name: rescue_vehicles fk_rescue_vehicle_branch; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_vehicles
    ADD CONSTRAINT fk_rescue_vehicle_branch FOREIGN KEY (branch_id) REFERENCES public.rescue_company_branches(id);


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
-- Name: rescue_staff fk_staff_branch; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.rescue_staff
    ADD CONSTRAINT fk_staff_branch FOREIGN KEY (branch_id) REFERENCES public.rescue_company_branches(id);


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

