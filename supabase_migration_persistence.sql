-- Migration complémentaire à supabase_setup.sql (à exécuter une seule fois, après lui) :
-- Supabase → Project → SQL Editor → New query → coller → Run.
--
-- Objet : persister l'état de travail en cours (base importée, file d'analyses bivariées et
-- univariées, contexte d'étude et rapport généré par Claude — celui-ci est inclus dans `context`,
-- cf. ResultsReport.jsx qui l'y range déjà) au-delà du seul localStorage du navigateur. Jusqu'ici,
-- fermer l'onglet, changer d'appareil ou vider les données du site faisait perdre tout le travail
-- en cours pour un utilisateur connecté — seules les métadonnées du projet (`public.projets`,
-- soumis une fois en fin de parcours) survivaient.
--
-- Choix de conception : une seule ligne par utilisateur (clé primaire user_id), mise à jour par
-- upsert au fil du travail, plutôt qu'un schéma normalisé à plusieurs tables liées par clé
-- étrangère (datasets / analyses_queue / rapports séparés). Ce choix reflète fidèlement
-- l'architecture actuelle de l'application, qui ne gère qu'un seul jeu de données et une seule file
-- d'analyses « en cours » à la fois (pas de notion de plusieurs projets ouverts en parallèle) : une
-- normalisation en plusieurs tables aurait ajouté de la complexité (jointures, gestion des
-- suppressions en cascade) sans bénéfice fonctionnel tant que l'application elle-même ne permet pas
-- de nommer/retrouver plusieurs jeux de travail distincts. Si cette capacité est ajoutée plus tard
-- (« mes enquêtes » avec plusieurs bases en parallèle), cette table pourra être scindée en gardant
-- la même forme de colonnes JSONB, simplement rattachées à un id de projet plutôt qu'à l'utilisateur.
--
-- Volumétrie : les colonnes JSONB stockent des enregistrements d'enquête agricole (quelques
-- centaines à quelques milliers de lignes typiquement) — largement dans les limites usuelles de
-- Postgres/Supabase pour une colonne JSONB. Un import exceptionnellement volumineux resterait
-- fonctionnel mais avec des upserts plus coûteux ; hors périmètre de cette migration.

create table if not exists public.work_sessions (
  user_id uuid references auth.users on delete cascade primary key,
  dataset jsonb,              -- { fileName, columns, rows } — cf. ImportWizard.jsx / buildColumnsMeta
  analysis_queue jsonb default '[]',    -- file des analyses bivariées configurées (AnalysisConfig.jsx)
  univariate_queue jsonb default '[]',  -- variables univariées validées pour le rapport
  context jsonb,               -- contexte d'étude (objectif, communes, filières, indicateurs...) ;
                                -- inclut aiReport, le rapport généré par Claude (cf. ResultsReport.jsx)
  updated_at timestamptz default now()
);

alter table public.work_sessions enable row level security;

drop policy if exists "Lire sa propre session de travail" on public.work_sessions;
create policy "Lire sa propre session de travail" on public.work_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "Créer sa propre session de travail" on public.work_sessions;
create policy "Créer sa propre session de travail" on public.work_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Mettre à jour sa propre session de travail" on public.work_sessions;
create policy "Mettre à jour sa propre session de travail" on public.work_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Supprimer sa propre session de travail" on public.work_sessions;
create policy "Supprimer sa propre session de travail" on public.work_sessions
  for delete using (auth.uid() = user_id);

-- Aucun accès administrateur en lecture n'est ajouté ici volontairement : contrairement aux
-- métadonnées de `public.projets` (soumises explicitement par l'utilisateur pour être partagées),
-- l'état de travail en cours peut contenir des données brutes d'enquête que l'utilisateur n'a pas
-- encore choisi de soumettre — il reste strictement privé à son propriétaire.
