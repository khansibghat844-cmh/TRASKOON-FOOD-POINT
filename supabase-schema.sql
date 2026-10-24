-- TRASKOON FOOD POINT: initial Supabase database schema
-- Run this in Supabase SQL Editor only when you are ready to configure the backend.
-- Review it first. Do not put service_role/secret keys in frontend code.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  category text not null default 'Burgers',
  price_pkr integer,
  image_url text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_nonnegative check (price_pkr is null or price_pkr >= 0)
);

alter table public.products enable row level security;

-- Public visitors can read products. Only authenticated users can write,
-- and a later admin allow-list policy should restrict writes to your admin account.
create policy "Public can read available products"
on public.products for select
to anon, authenticated
using (is_available = true);

-- IMPORTANT:
-- Do not add a general authenticated write policy.
-- Before enabling admin editing, create an explicit admin allow-list / role policy
-- for the intended admin identity and verify it with tests.

insert into public.products (slug, name, description, category, price_pkr, is_available, sort_order)
values
('chicken-burger','Chicken Burger','A classic chicken burger, freshly prepared.','Burgers',170,true,10),
('anda-shami-burger','Anda Shami Burger','Shami burger with egg.','Burgers',120,true,20),
('special-anda-burger','Special Anda Burger','Special egg burger.','Burgers',100,true,30),
('shawarma','Shawarma','Freshly prepared shawarma.','Shawarma',170,true,40),
('zinger-burger','Zinger Burger','Crunchy zinger-style chicken burger.','Burgers',250,true,50),
('simple-single-afghani-burger','Simple Single Afghani Burger','Simple single Afghani burger.','Burgers',130,true,60),
('single-chicken-afghani-burger','Single Chicken Afghani Burger','Single chicken Afghani burger.','Burgers',180,true,70),
('double-chicken-afghani-burger','Double Chicken Afghani Burger','Double chicken Afghani burger.','Burgers',250,true,80),
('special-zinger-pieces','Special Zinger Pieces','Serving quantity to be confirmed when ordering.','Sides',80,true,90),
('boiled-egg','Boiled Egg','Price per egg.','Sides',50,true,100),
('french-fries-50','French Fries — Rs. 50','French fries price option.','Sides',50,true,110),
('french-fries-100','French Fries — Rs. 100','French fries price option.','Sides',100,true,120),
('french-fries-200','French Fries — Rs. 200','French fries price option.','Sides',200,true,130),
('french-fries-300','French Fries — Rs. 300','French fries price option.','Sides',300,true,140),
('french-fries-500','French Fries — Rs. 500','French fries price option.','Sides',500,true,150),
('french-fries-700','French Fries — Rs. 700','French fries price option.','Sides',700,true,160),
('french-fries-1000','French Fries — Rs. 1,000','French fries price option.','Sides',1000,true,170)
on conflict (slug) do nothing;

-- Plain Shami Burger was in the requested menu, but its original price was not
-- reliably present in the supplied price data. Add it only after entering the
-- exact original price; no price is guessed here.
