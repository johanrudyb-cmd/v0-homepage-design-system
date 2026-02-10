# PRD Légal - OUTFITY
## Product Requirements Document - Conformité Juridique & Réglementaire

**Version**: 1.0  
**Date**: 2026-02-10  
**Auteur**: Legal & Compliance Team  
**Statut**: Draft

---

## 1. Executive Summary

### 1.1 Objectif
Ce PRD définit les exigences légales et réglementaires pour la plateforme OUTFITY, garantissant la conformité totale avec les lois françaises, européennes et internationales applicables au SaaS, e-commerce et traitement de données.

### 1.2 Scope
- RGPD/GDPR (protection des données)
- CGU/CGV (conditions générales)
- Mentions légales
- Propriété intellectuelle
- Conformité e-commerce
- Droit du travail (si employés)
- Fiscalité et TVA
- Cookies et tracking
- Responsabilité juridique

---

## 2. RGPD/GDPR - Protection des Données

### 2.1 Conformité RGPD
**Priorité**: P0 (Critique - Obligatoire)

**Exigences**:
- Désignation d'un DPO (Data Protection Officer) si > 250 employés ou traitement à grande échelle
- Registre des traitements de données personnelles
- Analyse d'impact (DPIA) pour traitements à risque
- Politique de confidentialité complète et accessible
- Consentement explicite pour collecte de données
- Droit d'accès, rectification, suppression (DSAR)
- Droit à la portabilité des données
- Droit à l'oubli (suppression complète)
- Notification CNIL en cas de breach (< 72h)

**Données collectées**:
- **Données d'identification**: Nom, prénom, email, mot de passe (hashé)
- **Données de paiement**: Via Stripe (pas de stockage direct)
- **Données d'utilisation**: Logs, analytics, AI usage
- **Données créées**: Marques, designs, tech packs
- **Cookies**: Analytics, préférences utilisateur

**Critères d'acceptation**:
- ✅ Politique de confidentialité accessible (footer + signup)
- ✅ Consentement cookies (banner RGPD)
- ✅ Export données utilisateur en < 30 jours
- ✅ Suppression complète en < 30 jours
- ✅ Encryption données sensibles (at rest + in transit)
- ✅ Registre des traitements à jour

### 2.2 Cookies & Tracking
**Priorité**: P0 (Critique)

**Exigences**:
- Banner de consentement cookies (conforme CNIL)
- Catégorisation cookies (essentiels, analytics, marketing)
- Refus possible sans impact fonctionnel
- Gestion des préférences cookies
- Durée de conservation limitée (13 mois max)
- Liste exhaustive des cookies utilisés
- Intégration avec solutions conformes (Axeptio, Tarteaucitron, etc.)

**Types de cookies**:
- **Essentiels**: Session, authentification, panier
- **Analytics**: Vercel Analytics, Google Analytics (avec consentement)
- **Marketing**: Tracking conversions (avec consentement)

**Critères d'acceptation**:
- ✅ Banner conforme CNIL
- ✅ Refus = pas de cookies non-essentiels
- ✅ Gestion préférences accessible
- ✅ Documentation complète des cookies

---

## 3. CGU/CGV - Conditions Générales

### 3.1 Conditions Générales d'Utilisation (CGU)
**Priorité**: P0 (Critique)

**Sections obligatoires**:
1. **Objet**: Description du service OUTFITY
2. **Acceptation**: Conditions d'acceptation des CGU
3. **Inscription**: Conditions de création de compte
4. **Services**: Description détaillée des fonctionnalités
5. **Propriété intellectuelle**: Droits sur contenus générés
6. **Responsabilités**: Limitations de responsabilité
7. **Données personnelles**: Renvoi vers politique de confidentialité
8. **Durée et résiliation**: Conditions de résiliation
9. **Droit applicable**: Loi française
10. **Litiges**: Juridiction compétente

**Points critiques**:
- Propriété des designs générés par IA (utilisateur propriétaire)
- Licence d'utilisation des contenus uploadés
- Limitations de responsabilité (scraping, APIs tierces)
- Interdiction d'usage illégal ou contraire aux bonnes mœurs
- Suspension/résiliation de compte (motifs)

**Critères d'acceptation**:
- ✅ CGU accessibles (footer + signup)
- ✅ Acceptation obligatoire à l'inscription
- ✅ Version datée et archivée
- ✅ Notification changements (30 jours avant)

### 3.2 Conditions Générales de Vente (CGV)
**Priorité**: P0 (Critique)

**Sections obligatoires**:
1. **Offres**: Description des plans (Free, Pro, Enterprise)
2. **Prix**: Tarifs TTC (TVA 20% France)
3. **Commande**: Processus de souscription
4. **Paiement**: Moyens de paiement (Stripe)
5. **Facturation**: Émission factures conformes
6. **Rétractation**: Droit de rétractation 14 jours (consommateurs)
7. **Résiliation**: Conditions de résiliation abonnement
8. **Remboursement**: Politique de remboursement
9. **Garanties**: Garantie légale de conformité
10. **Réclamations**: Service client et médiation

**Points critiques**:
- Droit de rétractation 14 jours (directive européenne)
- Renouvellement automatique avec notification
- Résiliation possible à tout moment (loi Chatel)
- Remboursement au prorata si résiliation anticipée
- Factures conformes (mentions obligatoires)

**Critères d'acceptation**:
- ✅ CGV accessibles (footer + checkout)
- ✅ Prix TTC affichés
- ✅ Droit de rétractation mentionné
- ✅ Factures automatiques (Stripe)

---

## 4. Mentions Légales

### 4.1 Mentions Obligatoires
**Priorité**: P0 (Critique - Article L.111-1 Code de la consommation)

**Informations requises**:
- **Éditeur**: Nom société, forme juridique, capital social
- **Siège social**: Adresse complète
- **Contact**: Email, téléphone
- **RCS**: Numéro d'immatriculation
- **SIRET/SIREN**: Numéros d'identification
- **TVA intracommunautaire**: Numéro de TVA
- **Directeur de publication**: Nom et qualité
- **Hébergeur**: Nom, adresse, téléphone (Vercel Inc.)
- **Propriété intellectuelle**: Droits réservés
- **Crédits**: Technologies utilisées (optionnel)

**Critères d'acceptation**:
- ✅ Page "Mentions légales" accessible (footer)
- ✅ Toutes informations obligatoires présentes
- ✅ Mise à jour si changement société

---

## 5. Propriété Intellectuelle

### 5.1 Droits sur les Contenus Générés
**Priorité**: P0 (Critique)

**Principes**:
- **Contenus utilisateur**: Propriété de l'utilisateur
- **Designs IA**: Propriété de l'utilisateur (licence commerciale)
- **Tech packs**: Propriété de l'utilisateur
- **Marques créées**: Propriété de l'utilisateur
- **Code source OUTFITY**: Propriété de l'éditeur
- **Base de données**: Droit sui generis de l'éditeur

**Licence accordée à OUTFITY**:
- Licence mondiale, non-exclusive, gratuite
- Pour hébergement, affichage, traitement
- Durée: pendant utilisation du service
- Résiliation: suppression compte = fin de licence

**Critères d'acceptation**:
- ✅ Clause claire dans CGU
- ✅ Utilisateur propriétaire des créations
- ✅ Licence limitée pour OUTFITY
- ✅ Export/suppression possible à tout moment

### 5.2 Marques et Noms Commerciaux
**Priorité**: P1 (Important)

**Exigences**:
- Dépôt marque "OUTFITY" à l'INPI (France)
- Extension européenne (EUIPO) recommandée
- Classes INPI pertinentes:
  - Classe 9: Logiciels
  - Classe 35: Services de vente
  - Classe 42: SaaS, services informatiques
- Surveillance des marques similaires
- Politique anti-contrefaçon

**Critères d'acceptation**:
- ✅ Marque déposée INPI
- ✅ Logo protégé
- ✅ Surveillance active

---

## 6. Conformité E-Commerce

### 6.1 Directive E-Commerce (2000/31/CE)
**Priorité**: P0 (Critique)

**Exigences**:
- Informations précontractuelles claires
- Confirmation de commande par email
- Récapitulatif avant paiement
- Archivage des transactions (10 ans)
- Médiation consommateur (plateforme RLL)
- Lien vers plateforme européenne ODR

**Critères d'acceptation**:
- ✅ Email confirmation commande
- ✅ Récapitulatif avant paiement
- ✅ Lien médiation consommateur (footer)
- ✅ Archivage transactions

### 6.2 TVA et Facturation
**Priorité**: P0 (Critique)

**Exigences**:
- TVA 20% (France) sur abonnements
- TVA selon pays client (UE)
- Autoliquidation B2B (UE hors France)
- Factures conformes (mentions obligatoires)
- Numérotation séquentielle
- Conservation factures 10 ans
- Intégration Stripe Tax (recommandé)

**Mentions obligatoires facture**:
- Numéro facture unique
- Date d'émission
- Identité vendeur (SIRET, TVA)
- Identité acheteur
- Description services
- Prix HT, TVA, TTC
- Conditions de paiement
- Pénalités de retard (B2B)

**Critères d'acceptation**:
- ✅ Factures automatiques (Stripe)
- ✅ TVA correcte selon pays
- ✅ Mentions obligatoires complètes
- ✅ Archivage 10 ans

---

## 7. Responsabilité Juridique

### 7.1 Limitations de Responsabilité
**Priorité**: P0 (Critique)

**Clauses de limitation**:
- Service fourni "en l'état"
- Pas de garantie de résultat commercial
- Responsabilité limitée aux dommages directs
- Plafond: montant abonnement annuel
- Exclusion dommages indirects (perte de CA, etc.)
- Force majeure (APIs tierces indisponibles)

**Responsabilités de l'utilisateur**:
- Respect des droits tiers (marques, designs)
- Usage conforme à la loi
- Sécurité de son compte
- Véracité des informations fournies

**Critères d'acceptation**:
- ✅ Clauses claires dans CGU
- ✅ Limitations raisonnables
- ✅ Conformité droit français

### 7.2 Modération et Contenus Illicites
**Priorité**: P1 (Important)

**Exigences**:
- Système de signalement contenus
- Modération réactive (< 24h)
- Suppression contenus illicites
- Suspension comptes contrevenants
- Coopération avec autorités
- Logs conservés (1 an minimum)

**Critères d'acceptation**:
- ✅ Bouton "Signaler" sur contenus
- ✅ Processus modération documenté
- ✅ Réponse < 24h

---

## 8. Conformité Internationale

### 8.1 Utilisateurs Hors UE
**Priorité**: P2 (Nice to have)

**Considérations**:
- **USA**: Conformité CCPA (Californie) si applicable
- **UK**: UK GDPR post-Brexit
- **Canada**: PIPEDA
- **Autres**: Adaptation selon expansion

**Critères d'acceptation**:
- ✅ Géo-blocking si nécessaire
- ✅ Adaptation CGU/CGV par région
- ✅ Conformité locale si expansion

---

## 9. Documents Légaux Requis

### 9.1 Liste des Documents
**Priorité**: P0 (Critique)

**Documents obligatoires**:
1. ✅ **Mentions légales** (/legal/mentions)
2. ✅ **CGU** (/legal/cgu)
3. ✅ **CGV** (/legal/cgv)
4. ✅ **Politique de confidentialité** (/legal/privacy)
5. ✅ **Politique cookies** (/legal/cookies)
6. ⏳ **Charte de modération** (si UGC)
7. ⏳ **Politique de remboursement** (/legal/refund)

**Documents internes**:
1. ⏳ Registre des traitements RGPD
2. ⏳ Procédure DSAR (demandes utilisateurs)
3. ⏳ Procédure breach notification
4. ⏳ Contrats fournisseurs (DPA avec Stripe, Supabase, etc.)

**Critères d'acceptation**:
- ✅ Tous documents accessibles (footer)
- ✅ Versions datées et archivées
- ✅ Mises à jour notifiées utilisateurs

---

## 10. Checklist de Conformité

### 10.1 Avant Lancement
- [ ] Mentions légales complètes
- [ ] CGU/CGV rédigées et validées (avocat recommandé)
- [ ] Politique de confidentialité RGPD
- [ ] Banner cookies conforme CNIL
- [ ] Dépôt marque INPI
- [ ] Immatriculation société (SIRET, RCS)
- [ ] Numéro TVA intracommunautaire
- [ ] Contrat hébergeur (Vercel)
- [ ] DPA avec sous-traitants (Stripe, Supabase)
- [ ] Assurance RC professionnelle

### 10.2 Post-Lancement
- [ ] Registre des traitements RGPD à jour
- [ ] Procédure DSAR opérationnelle
- [ ] Modération contenus active
- [ ] Archivage transactions (10 ans)
- [ ] Veille juridique (changements lois)
- [ ] Audit conformité annuel
- [ ] Formation équipe RGPD

---

## 11. Risques Juridiques & Mitigation

### 11.1 Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Non-conformité RGPD | Critique (4% CA) | Moyen | Audit RGPD, DPO, procédures |
| Litige client | Élevé | Moyen | CGU/CGV claires, médiation |
| Contrefaçon marque | Élevé | Faible | Dépôt INPI, surveillance |
| Contenus illicites | Moyen | Moyen | Modération, signalement |
| Breach données | Critique | Faible | Encryption, monitoring, procédure |

### 11.2 Plan de Mitigation
- **Avocat conseil**: Validation documents légaux
- **Assurance**: RC professionnelle + cyber-risques
- **Audit**: Conformité RGPD annuel
- **Formation**: Équipe sensibilisée RGPD
- **Veille**: Juridique et réglementaire

---

## 12. Roadmap Légale

### Phase 1 - Pré-Lancement (Actuel)
- ✅ Rédaction CGU/CGV/Privacy
- ✅ Mentions légales
- ⏳ Dépôt marque INPI
- ⏳ Validation avocat

### Phase 2 - Lancement (Q2 2026)
- ⏳ Banner cookies CNIL
- ⏳ Procédure DSAR
- ⏳ DPA sous-traitants
- ⏳ Assurance RC Pro

### Phase 3 - Consolidation (Q3 2026)
- ⏳ Audit RGPD complet
- ⏳ Extension marque UE
- ⏳ Conformité internationale

---

## 13. Contacts & Ressources

### 13.1 Organismes de Référence
- **CNIL**: https://www.cnil.fr (RGPD)
- **INPI**: https://www.inpi.fr (Marques)
- **DGCCRF**: https://www.economie.gouv.fr/dgccrf (E-commerce)
- **Médiateur consommation**: https://www.economie.gouv.fr/mediation-conso

### 13.2 Ressources Utiles
- Générateur CGU/CGV: https://www.legalstart.fr
- Modèles RGPD: https://www.cnil.fr/fr/modeles
- Avocat spécialisé: Recommandé pour validation

---

**Document créé par**: Legal & Compliance Team  
**Dernière mise à jour**: 2026-02-10  
**Prochaine revue**: 2026-05-10 (trimestrielle)

**⚠️ DISCLAIMER**: Ce document est fourni à titre informatif. Il est fortement recommandé de consulter un avocat spécialisé en droit du numérique pour validation avant lancement.
