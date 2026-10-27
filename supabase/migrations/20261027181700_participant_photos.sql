-- Fotos de participantes y las imágenes generadas (aceptado en /terminos). Privado: solo service role.
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  photo_hash text not null check (photo_hash ~ '^[a-f0-9]{64}$'),
  original_path text not null,
  image_path text not null,
  costume_slug text not null,
  scene_id text not null,
  style_id text not null,
  seed bigint not null,
  created_at timestamptz not null default now()
);
create index generations_photo_hash_idx on public.generations (photo_hash);
create index generations_created_at_idx on public.generations (created_at desc);

-- RLS activo y sin políticas a propósito: anon/authenticated no leen ni escriben; el server usa la secret key.
alter table public.generations enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('participantes', 'participantes', false, 2097152, array['image/jpeg']);
