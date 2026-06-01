"test" 
-- 1. Create the garden_plants table
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

-- 2. Enable Row Level Security
ALTER TABLE public.garden_plants ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies — users can only access their own plants
CREATE POLICY "Users can view their own plants"
    ON public.garden_plants
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
    ON public.garden_plants
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
    ON public.garden_plants
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
    ON public.garden_plants
    FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Grant access to authenticated users
GRANT ALL ON public.garden_plants TO authenticated;
GRANT ALL ON public.garden_plants TO service_role;
