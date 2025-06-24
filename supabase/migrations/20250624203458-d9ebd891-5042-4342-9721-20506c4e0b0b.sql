
-- Add a function to handle premium user creation
CREATE OR REPLACE FUNCTION public.handle_premium_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has premium metadata
  IF NEW.raw_user_meta_data ->> 'is_premium' = 'true' THEN
    -- Insert into profiles with premium plan
    INSERT INTO public.profiles (id, name, email, plan)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
      NEW.email,
      'premium'
    );
    
    -- Insert into subscribers table with premium subscription
    INSERT INTO public.subscribers (
      email,
      user_id,
      subscribed,
      subscription_tier,
      subscription_end,
      stripe_customer_id
    ) VALUES (
      NEW.email,
      NEW.id,
      true,
      'Premium',
      NOW() + INTERVAL '1 year',
      NULL
    );
  ELSE
    -- Regular user creation (existing logic)
    INSERT INTO public.profiles (id, name, email, plan)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
      NEW.email,
      'free'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the existing trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_premium_user();
