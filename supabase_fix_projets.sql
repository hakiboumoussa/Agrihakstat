-- Script complet et rejouable pour la table "projets" (création + colonnes + sécurité)

-- Fonction utilitaire (recréée par précaution, sans risque si elle existe déjà)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create table if not exists public.projets (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  user_email text,
  titre text,
  thematiques text[] default '{}',
  communes text[] default '{}',
  statut text default 'soumis',
  created_at timestamptz default now()
);

alter table public.projets add column if not exists periode_debut date;
alter table public.projets add column if not exists periode_fin date;
alter table public.projets add column if not exists unite_analyse text;
alter table public.projets add column if not exists indicateurs jsonb default '[]';

alter table public.projets enable row level security;

drop policy if exists "Soumettre son propre projet" on public.projets;
create policy "Soumettre son propre projet" on public.projets
  for insert with check (auth.uid() = user_id);

drop policy if exists "Lire ses propres projets" on public.projets;
create policy "Lire ses propres projets" on public.projets
  for select using (auth.uid() = user_id);

drop policy if exists "Les administrateurs lisent tous les projets" on public.projets;
create policy "Les administrateurs lisent tous les projets" on public.projets
  for select using (public.is_admin());
