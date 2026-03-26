// lib/supabase.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

// Admin client — bypasses RLS, use only on server
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Anon client — respects RLS
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)