-- Disfraces "scrapeados" por los usuarios (botón "Scrapear disfraz" del buscador).
create table public.custom_costumes (
  slug text primary key check (slug ~ '^s-[a-z0-9-]{2,50}$'),
  name text not null check (char_length(name) between 2 and 40),
  query text not null,
  prompt_en text not null check (char_length(prompt_en) between 3 and 300),
  tagline text not null,
  price_from integer not null check (price_from > 0),
  price_to integer not null check (price_to >= price_from),
  stores_scraped integer not null check (stores_scraped between 12 and 340),
  photo_path text not null,
  created_at timestamptz not null default now()
);

alter table public.custom_costumes enable row level security;

-- Lectura pública (el catálogo es público); escritura solo desde el server con la secret key (bypassa RLS).
create policy "custom_costumes are public" on public.custom_costumes
  for select to anon, authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalogo', 'catalogo', true, 1048576, array['image/jpeg']);
