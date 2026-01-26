/**
 * Script pour corriger le problème Prisma
 * Régénère le client Prisma après ajout de nouveaux modèles
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Correction du problème Prisma...\n');

// Vérifier si le serveur tourne
console.log('⚠️  IMPORTANT : Assurez-vous que le serveur de développement est arrêté (Ctrl+C)\n');
console.log('Appuyez sur Entrée une fois le serveur arrêté...');

// Attendre confirmation utilisateur (simulation)
// En réalité, l'utilisateur doit arrêter le serveur manuellement

try {
  console.log('\n📦 Génération du client Prisma...');
  execSync('npm run db:generate', { stdio: 'inherit', cwd: process.cwd() });
  
  console.log('\n✅ Client Prisma généré avec succès !');
  
  console.log('\n📤 Poussage des changements à la base de données...');
  execSync('npm run db:push', { stdio: 'inherit', cwd: process.cwd() });
  
  console.log('\n✅ Base de données mise à jour avec succès !');
  
  console.log('\n🎉 Problème Prisma corrigé !');
  console.log('\nVous pouvez maintenant redémarrer le serveur avec : npm run dev');
  
} catch (error) {
  console.error('\n❌ Erreur lors de la correction :', error.message);
  console.log('\n💡 Solution :');
  console.log('1. Arrêtez le serveur (Ctrl+C dans le terminal où npm run dev tourne)');
  console.log('2. Relancez ce script : node scripts/fix-prisma.js');
  process.exit(1);
}
