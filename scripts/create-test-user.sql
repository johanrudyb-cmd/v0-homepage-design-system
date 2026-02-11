-- Script pour créer un utilisateur de test
-- Email: test@mediabiangory.com
-- Mot de passe: Test123!

-- Supprimer l'utilisateur s'il existe déjà
DELETE FROM "User" WHERE email = 'test@mediabiangory.com';

-- Créer le nouvel utilisateur
INSERT INTO "User" (
  id,
  email,
  name,
  password,
  plan,
  "createdAt",
  "updatedAt"
) VALUES (
  'test_user_' || substr(md5(random()::text), 1, 20),
  'test@mediabiangory.com',
  'Test User',
  '$2b$10$EvEVDnyOF0C/9Q8tjW/XL.ISAy2f/KrUjXZ86iUUQpPXw6BFS5PrW',
  'free',
  NOW(),
  NOW()
);

-- Vérifier la création
SELECT id, email, name, plan, "createdAt" FROM "User" WHERE email = 'test@mediabiangory.com';
