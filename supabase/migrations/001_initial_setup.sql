-- ==============================================================
-- FLORAFIND COMPLETE SUPABASE SETUP SCRIPT
-- ==============================================================
-- This script sets up:
-- 1. Required extensions
-- 2. garden_plants table with all columns
-- 3. Row Level Security (RLS) policies for garden_plants
-- 4. plant_images storage bucket and RLS policies for storage
-- ==============================================================

-- --------------------------------------------------------------
-- Step 1: Enable required extensions
-- --------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------
-- Step 2: Create garden_plants table
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.garden_plants (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    scientific_name text NOT NULL,
    common_name text NOT NULL,
    hindi_name text,
    description text,
    uses text,
    benefits text,
    native_region text,
    growing_conditions text,
    is_poisonous boolean DEFAULT false,
    toxicity_details text,
    image_url text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_plants_pkey PRIMARY KEY (id)
);

-- --------------------------------------------------------------
-- Step 3: Enable Row Level Security (RLS) for garden_plants
-- --------------------------------------------------------------
ALTER TABLE public.garden_plants ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------
-- Step 4: Create RLS policies for garden_plants
-- --------------------------------------------------------------
-- Users can view only their own plants
CREATE POLICY "Users can view their own plants"
    ON public.garden_plants
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert only their own plants
CREATE POLICY "Users can insert their own plants"
    ON public.garden_plants
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update only their own plants
CREATE POLICY "Users can update their own plants"
    ON public.garden_plants
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own plants
CREATE POLICY "Users can delete their own plants"
    ON public.garden_plants
    FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------
-- Step 5: Grant permissions on garden_plants
-- --------------------------------------------------------------
GRANT ALL ON public.garden_plants TO authenticated;
GRANT ALL ON public.garden_plants TO service_role;

-- ==============================================================
-- STORAGE SETUP
-- ==============================================================
-- Step 6: Create plant_images storage bucket
-- Note: You can also create this bucket via the Supabase Dashboard:
--       1. Go to Storage > New Bucket
--       2. Name: plant_images
--       3. Set as Public bucket
--       4. Add file size limit: 5MB (5242880 bytes)
--       5. Allowed mime types: image/jpeg, image/png, image/webp, image/gif
-- ==============================================================

-- Insert bucket into storage.buckets table (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'plant_images',
    'plant_images',
    true, -- Make bucket public so images are accessible via public URLs
    5242880, -- 5MB file size limit (5 * 1024 * 1024)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------
-- Step 7: RLS policies for storage.objects (plant_images bucket)
-- --------------------------------------------------------------
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload images to their own folder
CREATE POLICY "Users can upload to their own folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'plant_images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can view all images in plant_images bucket (since it's public)
CREATE POLICY "Public can view plant images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'plant_images');

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own images"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'plant_images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'plant_images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- --------------------------------------------------------------
-- Step 8: Grant permissions on storage
-- --------------------------------------------------------------
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO service_role;
GRANT ALL ON storage.objects TO service_role;

-- ==============================================================
-- SETUP COMPLETE
-- ==============================================================
