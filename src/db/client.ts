import { createClient } from '@supabase/supabase-js';

// 使用固定的配置信息
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('SUPABASE_URL 或 SUPABASE_KEY 未设置');
}

// 导出 supabase 客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
