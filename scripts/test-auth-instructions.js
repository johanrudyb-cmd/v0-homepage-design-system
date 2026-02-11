// Script pour tester la création et connexion d'un utilisateur
const testEmail = 'test@mediabiangory.com';
const testPassword = 'Test123!';
const testName = 'Test User';

console.log('🧪 Test de création et connexion utilisateur\n');
console.log('📧 Email:', testEmail);
console.log('🔑 Mot de passe:', testPassword);
console.log('\n' + '='.repeat(50));

// Instructions pour l'utilisateur
console.log('\n📝 INSTRUCTIONS POUR TESTER:');
console.log('\n1️⃣  Démarrez le serveur de développement:');
console.log('   npm run dev');

console.log('\n2️⃣  Créez le compte via l\'interface web:');
console.log('   - Allez sur: http://localhost:3000/auth/signup');
console.log('   - Nom:', testName);
console.log('   - Email:', testEmail);
console.log('   - Mot de passe:', testPassword);

console.log('\n3️⃣  Connectez-vous:');
console.log('   - Allez sur: http://localhost:3000/auth/signin');
console.log('   - Email:', testEmail);
console.log('   - Mot de passe:', testPassword);

console.log('\n' + '='.repeat(50));
console.log('\n💡 Si la connexion échoue, vérifiez les logs du serveur');
console.log('   pour voir les messages [Auth] que nous avons ajoutés.\n');
