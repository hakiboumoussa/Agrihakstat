-- À exécuter une seule fois dans Supabase : Project → SQL Editor → New query → coller → Run

-- 1. Table des profils (un rôle par utilisateur, lié au compte d'authentification)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- 2. Création automatique d'un profil à chaque inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Table de fréquentation (quel écran, par qui, quand)
create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  screen text not null,
  created_at timestamptz default now()
);

-- 4. Sécurité au niveau des lignes (RLS)
alter table public.profiles enable row level security;
alter table public.activity_log enable row level security;

-- Chacun peut lire son propre profil ; les administrateurs lisent tous les profils
drop policy if exists "Lecture de son propre profil" on public.profiles;
create policy "Lecture de son propre profil" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Les administrateurs lisent tous les profils" on public.profiles;
create policy "Les administrateurs lisent tous les profils" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Chacun peut enregistrer ses propres visites d'écran
drop policy if exists "Enregistrer sa propre activité" on public.activity_log;
create policy "Enregistrer sa propre activité" on public.activity_log
  for insert with check (auth.uid() = user_id);

-- Les administrateurs lisent l'ensemble du journal d'activité
drop policy if exists "Les administrateurs lisent toute l'activité" on public.activity_log;
create policy "Les administrateurs lisent toute l'activité" on public.activity_log
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 5. Pour vous désigner vous-même comme administrateur, exécutez ensuite
--    (après votre première inscription depuis le site) :
-- update public.profiles set role = 'admin' where email = 'votre-email@exemple.com';

-- 6. Table des projets/enquêtes soumis par les utilisateurs, classés par thématique
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

-- 7. Colonnes complémentaires du contexte d'étude (ajoutées après mise à jour de l'assistant d'import)
alter table public.projets add column if not exists periode_debut date;
alter table public.projets add column if not exists periode_fin date;
alter table public.projets add column if not exists unite_analyse text;
alter table public.projets add column if not exists indicateurs jsonb default '[]';
