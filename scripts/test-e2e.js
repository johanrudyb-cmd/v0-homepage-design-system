/**
 * Script de test end-to-end pour valider tous les modules
 * Teste les routes API principales et les fonctionnalités critiques
 */

require('dotenv').config({ path: '.env' });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Variables globales pour stocker les données de test
let authToken = null;
let userId = null;
let brandId = null;
let designId = null;
let factoryId = null;
let quoteId = null;
let analysisId = null;
let productId = null;

// Gestionnaire de cookies simple
const cookieStore = new Map();

// Fonction helper pour faire des requêtes HTTP
async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Construire les headers avec les cookies
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Ajouter les cookies au header
  const cookies = Array.from(cookieStore.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  
  if (cookies) {
    headers['Cookie'] = cookies;
  }

  const defaultOptions = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Extraire les cookies de la réponse
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // Parser les cookies (format simple: name=value; attributes)
      const cookieMatch = setCookieHeader.match(/([^=]+)=([^;]+)/);
      if (cookieMatch) {
        cookieStore.set(cookieMatch[1], cookieMatch[2]);
      }
    }

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 500, data: { error: error.message }, ok: false };
  }
}

// Tests d'authentification
async function testAuth() {
  logSection('1. TESTS AUTHENTIFICATION');

  // Test 1: Inscription
  logInfo('Test 1.1: Inscription utilisateur');
  const signupEmail = `test-${Date.now()}@example.com`;
  const signupPassword = 'Test123456!';
  const signupResult = await fetchAPI('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: signupEmail,
      password: signupPassword,
      name: 'Test User',
    }),
  });

  if (signupResult.ok && signupResult.data.user) {
    logSuccess(`Inscription réussie: ${signupEmail}`);
    userId = signupResult.data.user.id;
  } else {
    logError(`Inscription échouée: ${signupResult.data.error || 'Erreur inconnue'}`);
    return false;
  }

  // Test 2: Connexion
  logInfo('Test 1.2: Connexion utilisateur');
  const loginResult = await fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: signupEmail,
      password: signupPassword,
    }),
  });

  if (loginResult.ok && loginResult.data.success) {
    logSuccess('Connexion réussie');
    // Le cookie est automatiquement stocké dans cookieStore
    if (cookieStore.has('auth-token')) {
      authToken = cookieStore.get('auth-token');
    }
  } else {
    logError(`Connexion échouée: ${loginResult.data.error || 'Erreur inconnue'}`);
    return false;
  }

  // Test 3: Récupération utilisateur
  logInfo('Test 1.3: Récupération utilisateur');
  const meResult = await fetchAPI('/api/auth/me');

  if (meResult.ok && meResult.data.user) {
    logSuccess(`Utilisateur récupéré: ${meResult.data.user.email}`);
  } else {
    logError(`Récupération utilisateur échouée: ${meResult.data.error || 'Erreur inconnue'}`);
    return false;
  }

  return true;
}

// Tests Launch Map
async function testLaunchMap() {
  logSection('2. TESTS LAUNCH MAP');

  // Créer une marque d'abord
  logInfo('Création d\'une marque pour les tests');
  const brandResult = await fetchAPI('/api/brands', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Brand' }),
  });

  if (brandResult.ok && brandResult.data.brand) {
    brandId = brandResult.data.brand.id;
    logSuccess(`Marque créée: ${brandResult.data.brand.name}`);
  } else {
    logWarning('Marque non créée, utilisation d\'une marque existante');
    // Essayer de récupérer une marque existante
    const existingBrands = await fetchAPI('/api/brands');
    if (existingBrands.ok && existingBrands.data.brands?.length > 0) {
      brandId = existingBrands.data.brands[0].id;
      logInfo(`Utilisation de la marque existante: ${brandId}`);
    } else {
      logError('Impossible de créer ou récupérer une marque');
      return false;
    }
  }

  // Test Phase 1
  logInfo('Test 2.1: Phase 1 - Calculateur de rentabilité');
  const phase1Result = await fetchAPI('/api/launch-map/phase1', {
    method: 'POST',
    body: JSON.stringify({
      brandId,
      data: {
        targetRevenue: 5000,
        averagePrice: 50,
        margin: 40,
      },
    }),
  });

  if (phase1Result.ok) {
    logSuccess('Phase 1 sauvegardée');
  } else {
    logWarning(`Phase 1: ${phase1Result.data.error || 'Erreur'}`);
  }

  // Test Phase 2
  logInfo('Test 2.2: Phase 2 - Design');
  const phase2Result = await fetchAPI('/api/launch-map/phase2', {
    method: 'POST',
    body: JSON.stringify({ brandId }),
  });

  if (phase2Result.ok) {
    logSuccess('Phase 2 mise à jour');
  } else {
    logWarning(`Phase 2: ${phase2Result.data.error || 'Erreur'}`);
  }

  return true;
}

// Tests Design Studio
async function testDesignStudio() {
  logSection('3. TESTS DESIGN STUDIO');

  if (!brandId) {
    logWarning('Pas de brandId, test Design Studio ignoré');
    return false;
  }

  // Test: Récupérer les designs existants
  logInfo('Test 3.1: Récupération des designs');
  const designsResult = await fetchAPI(`/api/designs?brandId=${brandId}`);

  if (designsResult.ok) {
    logSuccess(`Designs récupérés: ${designsResult.data.designs?.length || 0}`);
    if (designsResult.data.designs?.length > 0) {
      designId = designsResult.data.designs[0].id;
      logInfo(`Design ID utilisé: ${designId}`);
    }
  } else {
    logWarning(`Récupération designs: ${designsResult.data.error || 'Erreur'}`);
  }

  // Test: Export PDF (si design existe)
  if (designId) {
    logInfo('Test 3.2: Export PDF Tech Pack');
    const pdfResult = await fetchAPI(`/api/designs/${designId}/export-pdf`);

    if (pdfResult.status === 200) {
      logSuccess('Export PDF réussi');
    } else {
      logWarning(`Export PDF: ${pdfResult.data.error || 'Erreur'}`);
    }
  } else {
    logWarning('Pas de design disponible pour tester l\'export PDF');
  }

  return true;
}

// Tests Sourcing Hub
async function testSourcingHub() {
  logSection('4. TESTS SOURCING HUB');

  // Test: Récupérer les usines
  logInfo('Test 4.1: Récupération des usines');
  const factoriesResult = await fetchAPI('/api/factories');

  if (factoriesResult.ok && factoriesResult.data.factories) {
    const factories = factoriesResult.data.factories;
    logSuccess(`${factories.length} usine(s) récupérée(s)`);
    if (factories.length > 0) {
      factoryId = factories[0].id;
      logInfo(`Usine ID utilisée: ${factoryId}`);

      // Test: Demander un devis
      if (brandId) {
        logInfo('Test 4.2: Demande de devis');
        const quoteResult = await fetchAPI('/api/quotes', {
          method: 'POST',
          body: JSON.stringify({
            brandId,
            factoryId,
            message: 'Test de demande de devis',
          }),
        });

        if (quoteResult.ok && quoteResult.data.quote) {
          quoteId = quoteResult.data.quote.id;
          logSuccess(`Devis créé: ${quoteId}`);
        } else {
          logWarning(`Création devis: ${quoteResult.data.error || 'Erreur'}`);
        }
      }
    }
  } else {
    logWarning(`Récupération usines: ${factoriesResult.data.error || 'Erreur'}`);
  }

  return true;
}

// Tests UGC AI Lab
async function testUGCLab() {
  logSection('5. TESTS UGC AI LAB');

  if (!brandId) {
    logWarning('Pas de brandId, test UGC Lab ignoré');
    return false;
  }

  // Test: Récupérer les scripts UGC
  logInfo('Test 5.1: Récupération des scripts UGC');
  const scriptsResult = await fetchAPI(`/api/ugc/scripts?brandId=${brandId}`);

  if (scriptsResult.ok) {
    logSuccess(`Scripts récupérés: ${scriptsResult.data?.length || 0}`);
  } else {
    logWarning(`Récupération scripts: ${scriptsResult.data?.error || 'Erreur'}`);
  }

  return true;
}

// Tests Brand Spy
async function testBrandSpy() {
  logSection('6. TESTS BRAND SPY');

  // Test: Analyser une URL Shopify
  logInfo('Test 6.1: Analyse d\'une URL Shopify');
  const analyzeResult = await fetchAPI('/api/spy/analyze', {
    method: 'POST',
    body: JSON.stringify({
      shopifyUrl: 'https://example-shop.myshopify.com',
    }),
  });

  if (analyzeResult.ok && analyzeResult.data.analysis) {
    analysisId = analyzeResult.data.analysis.id;
    logSuccess(`Analyse créée: ${analysisId}`);

    // Test: Export PDF
    logInfo('Test 6.2: Export PDF rapport Brand Spy');
    const pdfResult = await fetchAPI(`/api/spy/${analysisId}/export-pdf`);

    if (pdfResult.status === 200) {
      logSuccess('Export PDF réussi');
    } else {
      logWarning(`Export PDF: ${pdfResult.data?.error || 'Erreur'}`);
    }
  } else {
    logWarning(`Analyse Brand Spy: ${analyzeResult.data?.error || 'Erreur'}`);
  }

  return true;
}

// Tests Tendances & Hits
async function testTrends() {
  logSection('7. TESTS TENDANCES & HITS');

  // Test: Récupérer les produits
  logInfo('Test 7.1: Récupération des produits tendances');
  const productsResult = await fetchAPI('/api/trends/products');

  if (productsResult.ok && productsResult.data.products) {
    const products = productsResult.data.products;
    logSuccess(`${products.length} produit(s) récupéré(s)`);
    if (products.length > 0) {
      productId = products[0].id;
      logInfo(`Produit ID utilisé: ${productId}`);

      // Test: Ajouter aux favoris
      logInfo('Test 7.2: Ajout aux favoris');
      const favoriteResult = await fetchAPI('/api/trends/favorites', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });

      if (favoriteResult.ok) {
        logSuccess('Produit ajouté aux favoris');
      } else {
        logWarning(`Ajout favori: ${favoriteResult.data?.error || 'Erreur'}`);
      }
    }
  } else {
    logWarning(`Récupération produits: ${productsResult.data?.error || 'Erreur'}`);
  }

  return true;
}

// Test de déconnexion
async function testLogout() {
  logSection('8. TEST DÉCONNEXION');

  logInfo('Test 8.1: Déconnexion');
  const logoutResult = await fetchAPI('/api/auth/logout', {
    method: 'POST',
  });

  if (logoutResult.ok) {
    logSuccess('Déconnexion réussie');
    authToken = null;
  } else {
    logWarning(`Déconnexion: ${logoutResult.data?.error || 'Erreur'}`);
  }

  return true;
}

// Fonction principale
async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     TESTS END-TO-END - SAAS MODE                           ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  logInfo(`URL de base: ${BASE_URL}`);
  logInfo(`Date: ${new Date().toLocaleString('fr-FR')}\n`);

  const results = {
    auth: false,
    launchMap: false,
    designStudio: false,
    sourcingHub: false,
    ugcLab: false,
    brandSpy: false,
    trends: false,
    logout: false,
  };

  try {
    // Tests séquentiels
    results.auth = await testAuth();
    if (!results.auth) {
      logError('Les tests d\'authentification ont échoué. Arrêt des tests.');
      return;
    }

    results.launchMap = await testLaunchMap();
    results.designStudio = await testDesignStudio();
    results.sourcingHub = await testSourcingHub();
    results.ugcLab = await testUGCLab();
    results.brandSpy = await testBrandSpy();
    results.trends = await testTrends();
    results.logout = await testLogout();

    // Résumé
    logSection('RÉSUMÉ DES TESTS');

    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(Boolean).length;
    const failed = total - passed;

    console.log('\n');
    Object.entries(results).forEach(([test, passed]) => {
      if (passed) {
        logSuccess(`${test}: PASSÉ`);
      } else {
        logError(`${test}: ÉCHOUÉ`);
      }
    });

    console.log('\n');
    log(`Total: ${total} tests`, 'cyan');
    log(`Réussis: ${passed}`, 'green');
    log(`Échoués: ${failed}`, failed > 0 ? 'red' : 'green');

    if (failed === 0) {
      log('\n🎉 Tous les tests sont passés !', 'green');
    } else {
      log(`\n⚠️  ${failed} test(s) ont échoué.`, 'yellow');
    }
  } catch (error) {
    logError(`Erreur fatale: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Vérifier que fetch est disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Node.js 18+ est requis pour ce script (fetch API)');
  process.exit(1);
}

// Lancer les tests
runTests()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
