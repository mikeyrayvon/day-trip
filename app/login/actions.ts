'use server';

import { createClient } from '@/utils/supabase/server';
import { AuthOtpResponse } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const supabase = createClient();

export const login = async (formData: FormData): Promise<AuthOtpResponse> => {
  const data = {
    email: formData.get('email') as string,
    options: {
      shouldCreateUser: false,
    },
  };

  const res = await supabase.auth.signInWithOtp(data);

  return JSON.parse(JSON.stringify(res));
};

export const signup = async (formData: FormData): Promise<any> => {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('invite') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error };
  }

  revalidatePath('/', 'layout');
  redirect('/');
};
