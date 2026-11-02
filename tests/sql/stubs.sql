-- Minimal Supabase stand-ins for a local Postgres 17 smoke test (NOT part of the migrations).
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (id UUID PRIMARY KEY);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.uid', true), '')::uuid $$;
CREATE TABLE public.profiles (id UUID PRIMARY KEY);
CREATE TABLE public.offerings (id UUID PRIMARY KEY, facilitator_id UUID, title TEXT, price TEXT, duration INT, status TEXT);
CREATE OR REPLACE FUNCTION public.has_role(UUID, TEXT) RETURNS BOOLEAN LANGUAGE sql AS $$ SELECT false $$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
