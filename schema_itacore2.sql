-- Initialisation du schéma pour Explore Parakou sur ITACORE2

-- 1. Création du schéma
CREATE SCHEMA IF NOT EXISTS explore_parakou;

-- 2. Table Talents (Gens de Parakou)
CREATE TABLE IF NOT EXISTS explore_parakou.talents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT,
    page_link TEXT,
    image_url TEXT
);

-- 3. Table Agenda (Événements)
CREATE TABLE IF NOT EXISTS explore_parakou.agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    category TEXT,
    date_number TEXT,
    date_month TEXT,
    time TEXT,
    location TEXT,
    description TEXT,
    image_url TEXT
);

-- 4. Table Culture
CREATE TABLE IF NOT EXISTS explore_parakou.culture (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT
);

-- 5. Table Tourisme (Sites à visiter)
CREATE TABLE IF NOT EXISTS explore_parakou.tourisme (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    category TEXT,
    image_url TEXT,
    description TEXT,
    page_link TEXT
);

-- 6. Table Histoire (Timeline)
CREATE TABLE IF NOT EXISTS explore_parakou.histoire_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    period TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT
);

-- 7. Table Messages (Inbox)
CREATE TABLE IF NOT EXISTS explore_parakou.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN DEFAULT false,
    type TEXT,
    contact_email TEXT,
    payload JSONB
);

-- 8. Permissions d'accès pour le rôle public (anon)
GRANT USAGE ON SCHEMA explore_parakou TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA explore_parakou TO anon;
GRANT INSERT ON explore_parakou.messages TO anon;
GRANT USAGE ON SCHEMA explore_parakou TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA explore_parakou TO authenticated;
