--
-- PostgreSQL database dump
--

-- Dumped from database version 14.20 (Debian 14.20-1.pgdg13+1)
-- Dumped by pg_dump version 14.20 (Debian 14.20-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: anomalous_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.anomalous_transactions (
    id uuid NOT NULL,
    cash_operation_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    risk_level character varying(50) NOT NULL,
    reason text,
    amount numeric(19,2) NOT NULL,
    detected_at timestamp with time zone NOT NULL,
    status character varying(50) NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    reviewer_notes text
);


--
-- Name: cash_operations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_operations (
    id uuid NOT NULL,
    cash_desk_id uuid NOT NULL,
    amount numeric(19,2) NOT NULL,
    type character varying(50) NOT NULL,
    currency character varying(10) NOT NULL,
    operated_at timestamp with time zone NOT NULL
);


--
-- Name: cash_register_reconciliations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_register_reconciliations (
    id uuid NOT NULL,
    cash_desk_id uuid NOT NULL,
    shift_start timestamp with time zone NOT NULL,
    shift_end timestamp with time zone NOT NULL,
    expected_balance numeric(19,2) NOT NULL,
    actual_balance numeric(19,2) NOT NULL,
    discrepancy numeric(19,2) NOT NULL,
    status character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    notes text
);


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaints (
    id uuid NOT NULL,
    category character varying(50) NOT NULL,
    description text NOT NULL,
    reported_at timestamp with time zone NOT NULL,
    source character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    reporter_name character varying(255),
    related_incident_id uuid
);


--
-- Name: contact_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_events (
    id uuid NOT NULL,
    person_id1 character varying(255) NOT NULL,
    person_id2 character varying(255) NOT NULL,
    contact_start_time timestamp with time zone NOT NULL,
    contact_end_time timestamp with time zone,
    duration_seconds bigint,
    location character varying(500),
    status character varying(50) NOT NULL,
    suspicious boolean DEFAULT false,
    suspicious_activity_id uuid
);

--
-- Name: disciplinary_violation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disciplinary_violation (
    id uuid NOT NULL,
    employee_id uuid,
    type character varying(50),
    description text,
    occurred_at timestamp with time zone,
    status character varying(50)
);


--
-- Name: disciplinary_violation_attachment_urls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disciplinary_violation_attachment_urls (
    disciplinary_violation_id uuid NOT NULL,
    attachment_urls character varying(500)
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    middle_name character varying(255),
    "position" character varying(255),
    department character varying(255),
    status character varying(50) NOT NULL,
    hire_date timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    contact_info text
);


--
-- Name: financial_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_reports (
    id uuid NOT NULL,
    period_start date,
    period_end date,
    csv_url character varying(500),
    status character varying(50) NOT NULL
);


--
-- Name: fraud_check_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fraud_check_results (
    id uuid NOT NULL,
    fraud_record_id uuid NOT NULL,
    checked_person_id character varying(255) NOT NULL,
    checked_at timestamp with time zone NOT NULL,
    confidence character varying(50) NOT NULL,
    similarity_score double precision,
    match_details text,
    triggered_by_activity_id uuid,
    status character varying(50) NOT NULL
);


--
-- Name: fraud_database; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fraud_database (
    id uuid NOT NULL,
    person_id character varying(255) NOT NULL,
    full_name character varying(500) NOT NULL,
    description text,
    photo_url text,
    fraud_type character varying(50) NOT NULL,
    added_at timestamp with time zone NOT NULL,
    added_by uuid,
    last_checked_at timestamp with time zone,
    match_count integer DEFAULT 0,
    status character varying(50) NOT NULL
);


--
-- Name: game_session_analyses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_session_analyses (
    id uuid NOT NULL,
    game_table_id character varying(255),
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    total_sessions bigint,
    total_bets numeric(19,2),
    total_wins numeric(19,2),
    rtp numeric(19,4),
    expected_rtp numeric(19,4),
    rtp_deviation numeric(19,4),
    large_wins_count integer,
    largest_win_amount numeric(19,2),
    status character varying(50) NOT NULL,
    analyzed_at timestamp with time zone NOT NULL,
    notes text
);


--
-- Name: hall_monitoring_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hall_monitoring_sessions (
    id uuid NOT NULL,
    security_officer_id uuid NOT NULL,
    started_at timestamp with time zone NOT NULL,
    ended_at timestamp with time zone,
    status character varying(50) NOT NULL,
    active_visitors integer,
    active_staff integer,
    anomalies_detected integer,
    notes text
);


--
-- Name: incident_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_attachments (
    incident_id uuid NOT NULL,
    attachment_url character varying(500)
);


--
-- Name: incident_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_participants (
    incident_id uuid NOT NULL,
    participant character varying(255)
);


--
-- Name: incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidents (
    id uuid NOT NULL,
    type character varying(50) NOT NULL,
    location character varying(255),
    occurred_at timestamp with time zone NOT NULL,
    description text,
    status character varying(50) NOT NULL,
    reported_by uuid
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    message text NOT NULL,
    priority character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    read_at timestamp with time zone,
    related_entity_type character varying(255),
    related_entity_id uuid,
    metadata text
);


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id uuid NOT NULL,
    type character varying(50) NOT NULL,
    generated_at timestamp with time zone NOT NULL,
    period_start timestamp with time zone,
    period_end timestamp with time zone,
    report_data text,
    status character varying(50) NOT NULL,
    generated_by uuid
);


--
-- Name: shift_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_schedules (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    shift_date date NOT NULL,
    planned_start_time timestamp with time zone NOT NULL,
    planned_end_time timestamp with time zone NOT NULL,
    status character varying(50) NOT NULL,
    shift_type character varying(50) NOT NULL,
    location character varying(500),
    created_by uuid,
    created_at timestamp with time zone NOT NULL,
    published_at timestamp with time zone,
    confirmed_by uuid,
    confirmed_at timestamp with time zone,
    notes text
);


--
-- Name: suspicious_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suspicious_activity (
    id uuid NOT NULL,
    short_description character varying(500),
    occurred_at timestamp with time zone NOT NULL,
    location character varying(500),
    risk character varying(50),
    status character varying(50) NOT NULL
);


--
-- Name: suspicious_activity_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suspicious_activity_participants (
    suspicious_activity_id uuid NOT NULL,
    participants character varying(255) NOT NULL
);


--
-- Name: work_time_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_time_records (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    clock_in_time timestamp with time zone NOT NULL,
    clock_out_time timestamp with time zone,
    device_id character varying(255),
    status character varying(50) NOT NULL,
    worked_minutes bigint,
    is_late boolean DEFAULT false,
    has_overtime boolean DEFAULT false,
    notes text
);


--
-- Name: anomalous_transactions anomalous_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anomalous_transactions
    ADD CONSTRAINT anomalous_transactions_pkey PRIMARY KEY (id);


--
-- Name: cash_operations cash_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_operations
    ADD CONSTRAINT cash_operations_pkey PRIMARY KEY (id);


--
-- Name: cash_register_reconciliations cash_register_reconciliations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_register_reconciliations
    ADD CONSTRAINT cash_register_reconciliations_pkey PRIMARY KEY (id);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- Name: contact_events contact_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_events
    ADD CONSTRAINT contact_events_pkey PRIMARY KEY (id);


--
-- Name: disciplinary_violation disciplinary_violation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disciplinary_violation
    ADD CONSTRAINT disciplinary_violation_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: financial_reports financial_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT financial_reports_pkey PRIMARY KEY (id);


--
-- Name: fraud_check_results fraud_check_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fraud_check_results
    ADD CONSTRAINT fraud_check_results_pkey PRIMARY KEY (id);


--
-- Name: fraud_database fraud_database_person_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fraud_database
    ADD CONSTRAINT fraud_database_person_id_key UNIQUE (person_id);


--
-- Name: fraud_database fraud_database_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fraud_database
    ADD CONSTRAINT fraud_database_pkey PRIMARY KEY (id);


--
-- Name: game_session_analyses game_session_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_session_analyses
    ADD CONSTRAINT game_session_analyses_pkey PRIMARY KEY (id);


--
-- Name: hall_monitoring_sessions hall_monitoring_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_monitoring_sessions
    ADD CONSTRAINT hall_monitoring_sessions_pkey PRIMARY KEY (id);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: suspicious_activity_participants pk_suspicious_activity_participants; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suspicious_activity_participants
    ADD CONSTRAINT pk_suspicious_activity_participants PRIMARY KEY (suspicious_activity_id, participants);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: shift_schedules shift_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_schedules
    ADD CONSTRAINT shift_schedules_pkey PRIMARY KEY (id);


--
-- Name: suspicious_activity suspicious_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suspicious_activity
    ADD CONSTRAINT suspicious_activity_pkey PRIMARY KEY (id);


--
-- Name: work_time_records work_time_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_time_records
    ADD CONSTRAINT work_time_records_pkey PRIMARY KEY (id);


--
-- Name: idx_anomaly_operation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_anomaly_operation ON public.anomalous_transactions USING btree (cash_operation_id);


--
-- Name: idx_anomaly_risk_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_anomaly_risk_level ON public.anomalous_transactions USING btree (risk_level);


--
-- Name: idx_anomaly_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_anomaly_status ON public.anomalous_transactions USING btree (status);


--
-- Name: idx_cash_operations_cash_desk_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_operations_cash_desk_id ON public.cash_operations USING btree (cash_desk_id);


--
-- Name: idx_cash_operations_operated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_operations_operated_at ON public.cash_operations USING btree (operated_at);


--
-- Name: idx_check_result_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_check_result_activity ON public.fraud_check_results USING btree (triggered_by_activity_id);


--
-- Name: idx_check_result_person; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_check_result_person ON public.fraud_check_results USING btree (checked_person_id);


--
-- Name: idx_complaints_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_category ON public.complaints USING btree (category);


--
-- Name: idx_complaints_reported_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_reported_at ON public.complaints USING btree (reported_at);


--
-- Name: idx_complaints_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_source ON public.complaints USING btree (source);


--
-- Name: idx_contact_person1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_person1 ON public.contact_events USING btree (person_id1);


--
-- Name: idx_contact_person2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_person2 ON public.contact_events USING btree (person_id2);


--
-- Name: idx_contact_suspicious; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_suspicious ON public.contact_events USING btree (suspicious);


--
-- Name: idx_employee_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_department ON public.employees USING btree (department);


--
-- Name: idx_employee_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_status ON public.employees USING btree (status);


--
-- Name: idx_fraud_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fraud_person_id ON public.fraud_database USING btree (person_id);


--
-- Name: idx_fraud_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fraud_status ON public.fraud_database USING btree (status);


--
-- Name: idx_game_analysis_table; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_game_analysis_table ON public.game_session_analyses USING btree (game_table_id);


--
-- Name: idx_hall_monitoring_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hall_monitoring_officer ON public.hall_monitoring_sessions USING btree (security_officer_id);


--
-- Name: idx_incidents_occurred_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_occurred_at ON public.incidents USING btree (occurred_at);


--
-- Name: idx_incidents_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_type ON public.incidents USING btree (type);


--
-- Name: idx_notification_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_recipient ON public.notifications USING btree (recipient_id);


--
-- Name: idx_notification_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_status ON public.notifications USING btree (status);


--
-- Name: idx_notification_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_type ON public.notifications USING btree (type);


--
-- Name: idx_reconciliation_cash_desk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reconciliation_cash_desk ON public.cash_register_reconciliations USING btree (cash_desk_id);


--
-- Name: idx_reconciliation_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reconciliation_status ON public.cash_register_reconciliations USING btree (status);


--
-- Name: idx_reports_generated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_generated_at ON public.reports USING btree (generated_at);


--
-- Name: idx_reports_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_type ON public.reports USING btree (type);


--
-- Name: idx_shift_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_date ON public.shift_schedules USING btree (shift_date);


--
-- Name: idx_shift_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_employee ON public.shift_schedules USING btree (employee_id);


--
-- Name: idx_shift_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_status ON public.shift_schedules USING btree (status);


--
-- Name: idx_violations_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_violations_employee_id ON public.disciplinary_violation USING btree (employee_id);


--
-- Name: idx_violations_occurred_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_violations_occurred_at ON public.disciplinary_violation USING btree (occurred_at);


--
-- Name: idx_work_time_clock_in; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_time_clock_in ON public.work_time_records USING btree (clock_in_time);


--
-- Name: idx_work_time_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_time_employee ON public.work_time_records USING btree (employee_id);


--
-- Name: idx_work_time_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_time_status ON public.work_time_records USING btree (status);


--
-- Name: disciplinary_violation_attachment_urls fk_dv_attachment_urls_dv; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disciplinary_violation_attachment_urls
    ADD CONSTRAINT fk_dv_attachment_urls_dv FOREIGN KEY (disciplinary_violation_id) REFERENCES public.disciplinary_violation(id);


--
-- Name: incident_attachments fk_incident_attachments_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_attachments
    ADD CONSTRAINT fk_incident_attachments_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: incident_participants fk_incident_participants_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_participants
    ADD CONSTRAINT fk_incident_participants_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: shift_schedules fk_shift_employee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_schedules
    ADD CONSTRAINT fk_shift_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: suspicious_activity_participants fk_suspicious_activity_participants; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suspicious_activity_participants
    ADD CONSTRAINT fk_suspicious_activity_participants FOREIGN KEY (suspicious_activity_id) REFERENCES public.suspicious_activity(id);


--
-- Name: work_time_records fk_work_time_employee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_time_records
    ADD CONSTRAINT fk_work_time_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- PostgreSQL database dump complete
--
