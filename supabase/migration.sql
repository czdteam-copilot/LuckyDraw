-- ====================================================
-- Lucky Money (Lì Xì) - Supabase Database Setup
-- Run this SQL in the Supabase SQL Editor
-- ====================================================

-- 1. Tạo bảng Danh sách giải thưởng (Pool)
CREATE TABLE public.prizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,              -- Tên giải (Ví dụ: Lì xì 50k)
    amount INTEGER NOT NULL,         -- Giá trị tiền (50000)
    quantity INTEGER NOT NULL DEFAULT 0, -- Số lượng còn lại
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tạo bảng Người trúng giải (Winners)
CREATE TABLE public.winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prize_id UUID REFERENCES public.prizes(id), -- Link tới giải đã trúng
    amount_won INTEGER NOT NULL,     -- Lưu cứng số tiền trúng
    user_name TEXT,                  -- Tên người chơi (nhập khi mở lì xì)
    bank_name TEXT,                  -- Tên ngân hàng
    bank_number TEXT,                -- Số tài khoản
    owner_name TEXT,                 -- Tên chủ tài khoản
    is_transferred BOOLEAN DEFAULT FALSE, -- Đã chuyển khoản chưa (dùng cho admin)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row-Level Security (RLS)
ALTER TABLE public.prizes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read prizes (needed for the draw check)
CREATE POLICY "Allow public read on prizes"
  ON prizes FOR SELECT
  USING (true);

-- Allow service_role to update prizes (used by the API)
CREATE POLICY "Allow service update on prizes"
  ON prizes FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow service_role to insert winners
CREATE POLICY "Allow service insert on winners"
  ON winners FOR INSERT
  WITH CHECK (true);

-- Allow service_role to read winners (admin dashboard)
CREATE POLICY "Allow service read on winners"
  ON winners FOR SELECT
  USING (true);

-- 4. Seed the prize pool
INSERT INTO public.prizes (name, amount, quantity)
VALUES
    ('Giải Vui Vẻ', 30000, 2),   
    ('Giải May Mắn', 50000, 10),   
    ('Giải Lộc Phát', 100000, 5),
    ('Giải Thịnh Vượng', 200000, 3),
    ('Giải Đặc Biệt', 500000, 1);

-- 5. Atomic draw function — prevents race conditions
--    Uses FOR UPDATE SKIP LOCKED for row-level locking
CREATE OR REPLACE FUNCTION draw_prize(p_user_name TEXT DEFAULT NULL)
RETURNS TABLE (
  won_prize_id     UUID,
  won_prize_name  TEXT,
  won_prize_amount INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_id     UUID;
  v_name  TEXT;
  v_amount INTEGER;
BEGIN
  -- Pick one random available prize and lock that row
  SELECT p.id, p.name, p.amount
    INTO v_id, v_name, v_amount
    FROM prizes p
  WHERE p.quantity > 0
  ORDER BY random()
  LIMIT 1
    FOR UPDATE SKIP LOCKED;

  -- If nothing found, the pool is empty
  IF v_id IS NULL THEN
    won_prize_id     := NULL;
    won_prize_name  := NULL;
    won_prize_amount := NULL;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Decrement quantity
  UPDATE prizes SET quantity = quantity - 1 WHERE prizes.id = v_id;

  -- Insert into winners with user_name (bank details added later)
  INSERT INTO winners (prize_id, amount_won, user_name)
    VALUES (v_id, v_amount, p_user_name);

  won_prize_id     := v_id;
  won_prize_name  := v_name;
  won_prize_amount := v_amount;
  RETURN NEXT;
END;
$$;
