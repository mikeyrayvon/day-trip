import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const POST = async (req: NextRequest) => {
  const { code, email } = await req.json();

  const { data, error } = await supabase
    .from('invite')
    .update({
      used: true,
      used_at: new Date().toISOString(),
      email,
    })
    .eq('code', code)
    .eq('used', false)
    .single();

  return Response.json({ data, error });
};
