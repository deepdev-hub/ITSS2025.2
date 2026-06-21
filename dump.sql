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
-- Name: store; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA store;


ALTER SCHEMA store OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Customer" (
    "CustomerID" character(6) NOT NULL,
    "LastName" character varying(20),
    "FirstName" character varying(10),
    "Address" character varying(50),
    "City" character varying(20),
    "Zip" character(5),
    "Phone" character varying(15)
);


ALTER TABLE public."Customer" OWNER TO postgres;

--
-- Name: cars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cars (
    brand character varying(255),
    model character varying(255),
    year integer
);


ALTER TABLE public.cars OWNER TO postgres;

--
-- Name: clazz; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clazz (
    clazz_id character(8) NOT NULL,
    name character(30),
    lecture_id character(8),
    monitor_id character(8)
);


ALTER TABLE public.clazz OWNER TO postgres;

--
-- Name: lecture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lecture (
    lecture_id character(5) NOT NULL,
    first_name character(30),
    last_name character(30),
    email character(30)
);


ALTER TABLE public.lecture OWNER TO postgres;

--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    student_id character(8) NOT NULL,
    first_name character varying(30),
    last_name character varying(30),
    dob date,
    gender character(1),
    clazz_id character(8),
    CONSTRAINT chk_gender CHECK (((gender = 'F'::bpchar) OR (gender = 'M'::bpchar)))
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: Customer; Type: TABLE; Schema: store; Owner: postgres
--

CREATE TABLE store."Customer" (
    "CustomerID" character(6) NOT NULL,
    "LastName" character varying(20),
    "FirstName" character varying(10),
    "Address" character varying(50),
    "City" character varying(20),
    "Zip" character(5),
    "Phone" character varying(15)
);


ALTER TABLE store."Customer" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: store; Owner: postgres
--

CREATE TABLE store."Order" (
    "ProductID" character(6) NOT NULL,
    "OrderID" character(6) NOT NULL,
    "CustomerID" character(6) NOT NULL,
    "PurchaseDate" date,
    "Quantity" integer,
    "TotalCost" money
);


ALTER TABLE store."Order" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: store; Owner: postgres
--

CREATE TABLE store."Product" (
    "ProductID" character(6) NOT NULL,
    "ProductName" character varying(40),
    "Model" character varying(10),
    "Manufacturer" character varying(40),
    "UnitPrice" money,
    "Inventory" integer
);


ALTER TABLE store."Product" OWNER TO postgres;

--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Customer" ("CustomerID", "LastName", "FirstName", "Address", "City", "Zip", "Phone") FROM stdin;
\.


--
-- Data for Name: cars; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cars (brand, model, year) FROM stdin;
\.


--
-- Data for Name: clazz; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clazz (clazz_id, name, lecture_id, monitor_id) FROM stdin;
45      	\N	\N	\N
12      	\N	\N	\N
78      	\N	\N	\N
33      	\N	\N	\N
02      	VN 04 K68                     	\N	20235740
01      	VN 03 K68                     	\N	20231234
03      	VN 02                         	L02     	20231234
04      	VN 03                         	L03     	20239876
05      	VN 04                         	L04     	20234567
06      	VN 05                         	L05     	20235678
07      	VN 06                         	L06     	20236789
08      	VN 07                         	L07     	20237890
09      	VN 08                         	L08     	20238901
10      	VN 09                         	L09     	20239012
11      	VN 10                         	L10     	20230123
13      	VN 12                         	L12     	20232345
\.


--
-- Data for Name: lecture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lecture (lecture_id, first_name, last_name, email) FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (student_id, first_name, last_name, dob, gender, clazz_id) FROM stdin;
20235740	Luong	Hung	2005-06-23	M	01      
20235740	Luong	Hung	2005-06-23	M	01      
20239876	Tran	Bao	2002-11-30	F	12345   
20234567	Le	Cuong	2001-05-22	M	98765   
20234567	Le	Cuong	2001-05-22	M	98765   
20235678	Pham	Dung	2004-09-10	F	54321   
20236789	Hoang	Giang	2003-12-05	M	11223   
20237890	Huynh	Hieu	2002-08-18	F	33445   
20238901	Phan	Khanh	2005-03-25	M	55667   
20239012	Vu	Linh	2000-11-12	F	77889   
20230123	Vo	Minh	2001-07-30	M	99001   
20233456	Tran	Quang	2002-04-08	F	66778   
20234567	Le	Cuong	2001-05-22	M	98765   
20235678	Pham	Dung	2004-09-10	F	54321   
20236789	Hoang	Giang	2003-12-05	M	11223   
20237890	Huynh	Hieu	2002-08-18	F	33445   
20238901	Phan	Khanh	2005-03-25	M	55667   
20239012	Vu	Linh	2000-11-12	F	77889   
20230123	Vo	Minh	2001-07-30	M	99001   
20233456	Tran	Quang	2002-04-08	F	66778   
20231234	Nguyen	Anh	2003-07-15	M	01      
20231234	Dang	Nhung	2004-02-14	F	01      
20231234	Dang	Nhung	2004-02-14	F	01      
20232345	Nguyen	Phuong	2003-06-19	M	01      
20232345	Nguyen	Phuong	2003-06-19	M	01      
20230001	Nguyen	Anh	2003-07-15	M	01      
20230002	Tran	Bao	2002-11-30	F	02      
20230003	Le	Cuong	2001-05-22	M	03      
20230004	Pham	Dung	2004-09-10	F	04      
20230005	Hoang	Giang	2003-12-05	M	05      
20230006	Huynh	Hieu	2002-08-18	F	06      
20230007	Phan	Khanh	2005-03-25	M	07      
20230008	Vu	Linh	2000-11-12	F	08      
20230009	Vo	Minh	2001-07-30	M	09      
20230010	Dang	Nhung	2004-02-14	F	10      
20230011	Nguyen	Anh	2003-07-15	M	        
20230012	Tran	Bao	2002-11-30	F	        
20230013	Le	Cuong	2001-05-22	M	        
20230014	Pham	Dung	2004-09-10	F	        
20230015	Hoang	Giang	2003-12-05	M	        
20230016	Huynh	Hieu	2002-08-18	F	        
20230017	Phan	Khanh	2005-03-25	M	        
20230018	Vu	Linh	2000-11-12	F	        
20230019	Vo	Minh	2001-07-30	M	        
20230020	Dang	Nhung	2004-02-14	F	        
1111    	giang a	phao	2005-05-23	M	02      
1111    	giang a	phao	2005-05-23	M	02      
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: store; Owner: postgres
--

COPY store."Customer" ("CustomerID", "LastName", "FirstName", "Address", "City", "Zip", "Phone") FROM stdin;
 BLU02	Blum	Barbara	879 Oak	Gary	6100 	555-4321
 BLU03	Blum	Katie	342 Pine	Hammond	6200 	555-9242
 BLU04	Blum	Jessica	229 State	Whiting	6300 	555-0921
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: store; Owner: postgres
--

COPY store."Order" ("ProductID", "OrderID", "CustomerID", "PurchaseDate", "Quantity", "TotalCost") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: store; Owner: postgres
--

COPY store."Product" ("ProductID", "ProductName", "Model", "Manufacturer", "UnitPrice", "Inventory") FROM stdin;
\.


--
-- Name: clazz clazz_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clazz
    ADD CONSTRAINT clazz_pkey PRIMARY KEY (clazz_id);


--
-- Name: lecture lecture_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecture
    ADD CONSTRAINT lecture_pkey PRIMARY KEY (lecture_id);


--
-- Name: Customer pk_customer; Type: CONSTRAINT; Schema: store; Owner: postgres
--

ALTER TABLE ONLY store."Customer"
    ADD CONSTRAINT pk_customer PRIMARY KEY ("CustomerID");


--
-- Name: Order pk_order; Type: CONSTRAINT; Schema: store; Owner: postgres
--

ALTER TABLE ONLY store."Order"
    ADD CONSTRAINT pk_order PRIMARY KEY ("OrderID");


--
-- Name: Product pk_product; Type: CONSTRAINT; Schema: store; Owner: postgres
--

ALTER TABLE ONLY store."Product"
    ADD CONSTRAINT pk_product PRIMARY KEY ("ProductID");


--
-- Name: Order fk_order_product; Type: FK CONSTRAINT; Schema: store; Owner: postgres
--

ALTER TABLE ONLY store."Order"
    ADD CONSTRAINT fk_order_product FOREIGN KEY ("ProductID") REFERENCES store."Product"("ProductID");


--
-- PostgreSQL database dump complete
--

