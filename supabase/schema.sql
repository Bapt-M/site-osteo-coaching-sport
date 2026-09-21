-- ============================================================================
--  Ostéo et Coaching du Sport — contenus éditables depuis /admin
--  À exécuter une fois dans Supabase → SQL Editor.
-- ============================================================================

-- ── 1. Liste blanche des administrateurs ────────────────────────────────────
-- Seules les adresses présentes ici peuvent modifier les textes. Sans cette
-- table, n'importe quel compte créé sur le projet pourrait écrire.

create table if not exists public.admins (
  email text primary key
);

alter table public.admins enable row level security;

-- Personne ne lit ni n'écrit cette table via l'API : elle se gère depuis le
-- tableau de bord Supabase. Les politiques ci-dessous la consultent malgré
-- tout, car une fonction `security definer` contourne le RLS.

-- Schéma privé : PostgREST ne publie que `public`, la fonction reste donc
-- hors de l'API REST.
create schema if not exists prive;

create or replace function prive.est_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admins
    where email = (auth.jwt() ->> 'email')
  );
$$;

revoke all on function prive.est_admin() from public, anon;
grant execute on function prive.est_admin() to authenticated;

-- ── 2. Les textes du site ───────────────────────────────────────────────────

create table if not exists public.site_content (
  cle         text primary key,
  valeur      text not null,
  modifie_le  timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Lecture publique : le site affiche les textes sans authentification.
drop policy if exists "lecture publique" on public.site_content;
create policy "lecture publique"
  on public.site_content for select
  to anon, authenticated
  using (true);

-- Écriture réservée aux adresses inscrites dans public.admins.
drop policy if exists "ecriture authentifiee" on public.site_content;
drop policy if exists "ecriture admin" on public.site_content;
create policy "ecriture admin"
  on public.site_content for all
  to authenticated
  using (prive.est_admin())
  with check (prive.est_admin());

-- `est_admin()` n'est utile qu'aux politiques ci-dessus, évaluées sous le rôle
-- `authenticated`. Le visiteur anonyme ne doit pas pouvoir l'appeler
-- directement via /rest/v1/rpc/est_admin.
revoke execute on function public.est_admin() from anon, public;
grant execute on function public.est_admin() to authenticated;

-- ── 3. Horodatage automatique ───────────────────────────────────────────────

create or replace function public.touch_site_content()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.modifie_le = now();
  return new;
end $$;

drop trigger if exists trg_touch_site_content on public.site_content;
create trigger trg_touch_site_content
  before update on public.site_content
  for each row execute function public.touch_site_content();

-- ── 4. À FAIRE : déclarer l'administrateur ──────────────────────────────────
-- Remplacez l'adresse ci-dessous par celle du compte créé dans
-- Authentication → Users, puis exécutez cette ligne.

-- insert into public.admins (email) values ('adresse@a-remplacer.fr')
--   on conflict (email) do nothing;
