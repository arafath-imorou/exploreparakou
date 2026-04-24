-- Script de correction du schéma et restoration des données
-- Exécutez ce fichier dans le SQL Editor de ITACORE2

-- 1. Corriger la table talents : ajouter la colonne 'detailed_description'
ALTER TABLE explore_parakou.talents 
    ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- 2. Corriger la table tourisme : remplacer 'page_link' par 'link_details' et 'link_map'
ALTER TABLE explore_parakou.tourisme 
    ADD COLUMN IF NOT EXISTS link_details TEXT,
    ADD COLUMN IF NOT EXISTS link_map TEXT;

-- 3. Supprimer les colonnes qui n'existent pas dans la source
-- (page_link dans tourisme n'est pas dans les données source)

-- ================================================================
-- RESTAURATION DES DONNÉES
-- ================================================================

-- Table: talents (1 ligne)
INSERT INTO explore_parakou.talents (id, name, role, description, detailed_description, image_url, page_link, created_at) VALUES
('b5f37762-4e26-4e7c-ab58-270b1b49b773', 'S.E.M. Djangoun', 'Président & Innovateur', 'Djangoun Zinli Roberto, créateur de mode atypique et entrepreneur, connu pour ses créations vestimentaires à partir de matériaux recyclés.', NULL, 'assets/images/PRESIDENT DJANGOUN.png', 'talent-djangoun.html', '2026-02-28T07:11:50.799973+00:00')
ON CONFLICT (id) DO NOTHING;

-- Table: agenda (5 lignes)
INSERT INTO explore_parakou.agenda (id, title, category, date_number, date_month, time, location, description, image_url, created_at) VALUES
('f6a88232-43ed-4b6c-aef0-a0976d33cfc6', 'Festival des Arts Kobourou', 'Festival International', '15', 'Fév', '16:00 - 02:00', 'Place Tabéra', 'La plus grande célébration des arts vivants de l''année. Théâtre, danse, musique et gastronomie au cœur de la cité impériale.', 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2670&auto=format&fit=crop', '2026-02-28T07:30:19.760379+00:00'),
('ba32e385-d614-424a-8cbc-0bfc792523ec', 'Salon de l''Agro-Business', 'Business • Conférence', '28', 'Fév', '09:00', 'Salle CCI Parakou', '', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2670&auto=format&fit=crop', '2026-02-28T07:30:19.760379+00:00'),
('2edb096d-ea37-452f-b108-cbcb9ccd6a1e', 'Nuit de l''Indépendance', 'Concert Live', '10', 'Mar', '20:30', 'Stade Municipal', '', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop', '2026-02-28T07:30:19.760379+00:00'),
('34392be2-4c8a-4632-9e70-adca670ae567', 'Urban Vibes Parakou', 'Musique & Danse', '21', 'Mar', '21:00', 'Centre Culturel', '', 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2670&auto=format&fit=crop', '2026-02-28T07:30:19.760379+00:00'),
('abc2cca4-514c-4937-bbd6-6662e618a1f1', 'Buffles FC vs Cotonou', 'Sport • Football', '22', 'Mar', '16:00', 'Stade Omnisports', '', 'https://images.unsplash.com/photo-1551632436-cbf8dd354ca8?q=80&w=2669&auto=format&fit=crop', '2026-02-28T07:30:19.760379+00:00')
ON CONFLICT (id) DO NOTHING;

-- Table: culture (2 lignes)
INSERT INTO explore_parakou.culture (id, title, description, image_url, created_at) VALUES
('e91fe6c5-a230-4331-baa9-556f50be416b', 'Festivals & Traditions', 'La Gaani, le Festival Eclosions...', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2670&auto=format&fit=crop', '2026-02-28T07:25:51.871694+00:00'),
('a9ca384d-9285-4edf-abdc-9af5329853b4', 'Art & Artisanat', 'Tissage, poterie, bronze.', 'https://images.unsplash.com/photo-1627637819842-8c173c3cb229?q=80&w=2670&auto=format&fit=crop', '2026-02-28T07:25:51.871694+00:00')
ON CONFLICT (id) DO NOTHING;

-- Table: tourisme (6 lignes)
INSERT INTO explore_parakou.tourisme (id, title, category, description, image_url, link_details, link_map, created_at) VALUES
('1bf093bf-f4e3-42f7-9d25-bc86e9083d6c', 'Musée Ethnographique', 'Musée • Culture', 'Une riche collection de l''histoire et de l''architecture traditionnelle.', 'assets/images/Musée plein air.jpg', 'tourisme-musee.html', NULL, '2026-02-28T07:25:51.871694+00:00'),
('ca94778c-603c-4c7e-9469-a213a2eb8486', 'Marché Arzeke', 'Commerce • Découverte', 'Le deuxième plus grand marché à ciel ouvert du Bénin.', 'assets/images/market.png', 'tourisme-arzeke.html', NULL, '2026-02-28T07:25:51.871694+00:00'),
('1db324b1-d9e8-442a-8efe-5a669c568f06', 'Hôtel Kobourou City', 'Hôtel • Premium', 'Le confort moderne au cœur de Parakou.', 'assets/images/cat-hotels.png', '#', NULL, '2026-02-28T07:25:51.871694+00:00'),
('5f95d764-f115-470c-b363-5c12c0b51ec0', 'Place Hubert Maga', 'Site Historique', 'Monument érigé à la gloire du premier président du Bénin indépendant.', 'assets/images/STATUT HUBERT MAGA.jpg', 'tourisme-maga.html', '', '2026-02-28T10:56:33.828218+00:00'),
('be0eccd6-2de5-4699-89c0-e640d381fbd6', 'Place Bio Guerra', 'Site Historique', 'Le symbole de la résistance. Un monument incontournable situé dans le quartier Ladji Farani.', 'assets/images/PLACE BIO GUERRA.jpg', 'tourisme-bioguerra.html', '', '2026-02-28T10:56:34.650868+00:00'),
('ae37268c-3a7a-416b-8b0f-b6a98f3b5ef4', 'Saveurs du Borgou', 'Restaurant • Local', 'Découvrez la vraie igname pilée et le fromage peuhl dans un cadre authentique.', 'assets/images/cat-food.png', '', '', '2026-02-28T10:56:35.809106+00:00')
ON CONFLICT (id) DO NOTHING;

-- Table: histoire_timeline (4 lignes)
INSERT INTO explore_parakou.histoire_timeline (id, period, title, description, created_at) VALUES
('bc80467a-80a7-4d9d-bb10-8e7649b418d7', 'XVIe Siècle', 'Fondation de Parakou', 'La ville est fondée par des commerçants Wassangari. Le royaume de Parakou (KƆRƆKU TEM) s''organise autour du Sinaguruu et du Kpebie.', '2026-02-28T07:34:15.463961+00:00'),
('5fab56f6-caf3-42c1-b4d3-78cefcb2335b', '1898', 'Présence Coloniale', 'L''administration française s''installe dans la région. C''est le temps de la résistance avec des figures héroïques comme Bio Guerra.', '2026-02-28T07:34:15.463961+00:00'),
('a41b5749-b1c7-4d93-98a5-4404f9c96684', '1960', 'L''Indépendance', 'L''Aube d''une nouvelle nation. Hubert Maga, originaire de la région, devient le premier président de la République du Dahomey.', '2026-02-28T07:34:15.463961+00:00'),
('64ff134d-afde-4437-9745-014750fabb4f', 'Années 2000', 'Hub Commercial et Métropole', 'La ville connaît un boom démographique et économique. Le Marché Arzeke devient le poumon financier du Nord, transformant Parakou en véritable carrefour.', '2026-02-28T07:34:15.463961+00:00')
ON CONFLICT (id) DO NOTHING;

-- Vérification rapide
SELECT 'talents' as table_name, count(*) as total FROM explore_parakou.talents
UNION ALL SELECT 'agenda', count(*) FROM explore_parakou.agenda
UNION ALL SELECT 'culture', count(*) FROM explore_parakou.culture
UNION ALL SELECT 'tourisme', count(*) FROM explore_parakou.tourisme
UNION ALL SELECT 'histoire_timeline', count(*) FROM explore_parakou.histoire_timeline;
