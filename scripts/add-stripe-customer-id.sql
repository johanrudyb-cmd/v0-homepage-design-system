-- Script SQL pour ajouter la colonne stripeCustomerId si elle n'existe pas

-- Ajouter la colonne stripeCustomerId à la table User
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;

-- Créer un index unique sur stripeCustomerId (en ignorant les NULL)
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" 
ON "User"("stripeCustomerId") 
WHERE "stripeCustomerId" IS NOT NULL;

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'User' AND column_name = 'stripeCustomerId';
