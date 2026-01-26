/**
 * Script de diagnostic pour vérifier l'état du serveur dev
 */

const http = require('http');

const checkServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      console.log(`✅ Serveur répond : ${res.statusCode}`);
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('❌ Serveur non démarré ou port 3000 occupé');
      } else {
        console.log(`❌ Erreur : ${err.message}`);
      }
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

checkServer()
  .then(() => {
    console.log('\n✅ Le serveur fonctionne correctement');
    process.exit(0);
  })
  .catch((err) => {
    console.log('\n❌ Problème détecté :', err.message);
    console.log('\n💡 Solutions :');
    console.log('   1. Vérifiez que le serveur est démarré : npm run dev');
    console.log('   2. Vérifiez le port 3000 : netstat -ano | findstr :3000');
    console.log('   3. Vérifiez les erreurs dans le terminal du serveur');
    process.exit(1);
  });
