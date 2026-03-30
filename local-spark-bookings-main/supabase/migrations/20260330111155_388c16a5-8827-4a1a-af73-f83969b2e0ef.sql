
-- Add blocked_times table
CREATE TABLE public.blocked_times (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for blocked_times
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blocked times" ON public.blocked_times
  FOR SELECT USING (true);

CREATE POLICY "Business owners can manage blocked times" ON public.blocked_times
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE POLICY "Business owners can delete blocked times" ON public.blocked_times
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );
