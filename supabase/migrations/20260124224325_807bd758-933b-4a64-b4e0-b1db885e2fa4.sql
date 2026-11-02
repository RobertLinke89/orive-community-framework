-- Enable realtime for profiles table so network orbiters update live
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;