-- ============== Vitrion Supabase Initialization ==============
-- 此腳本為建立 Vitrion 所需的基礎資料庫結構與安全性防設
-- 請貼到 Supabase 的 SQL Editor 執行

-- 1. 建立 Profile 表格 (紀錄使用者的挑戰與營養品設定)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  primary_goal text,
  challenge_name text,
  current_supplements text[],
  has_completed_onboarding boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 建立 每日打卡 表格 (紀錄每日感受)
create table public.daily_checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  sleep_quality smallint not null,
  energy_level smallint not null,
  focus_level smallint not null,
  stress_level smallint not null,
  body_feeling smallint not null,
  mood smallint not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date) -- 每人每天只能有一筆打卡
);

-- 3. 開啟 Row Level Security (RLS) 保護資料
alter table public.profiles enable row level security;
alter table public.daily_checkins enable row level security;

-- 4. RLS 政策：使用者只能讀寫自己的資料 (限制資料讀寫權限)
create policy "Users can view own profile." on profiles for select using (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile." on profiles for insert with check (auth.uid() = id);

create policy "Users can view own checkins." on daily_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins." on daily_checkins for insert with check (auth.uid() = user_id);
create policy "Users can update own checkins." on daily_checkins for update using (auth.uid() = user_id);
