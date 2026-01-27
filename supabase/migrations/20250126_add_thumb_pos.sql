-- Migration: Add thumb_pos_x and thumb_pos_y columns to photos table
-- Created: 2025-01-26

alter table if exists public.photos
  add column if not exists thumb_pos_x numeric(5, 2) null default 50.0,
  add column if not exists thumb_pos_y numeric(5, 2) null default 50.0;
