import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';

export const getUser = async (context: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(context);
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }
  
  return session.user;
};