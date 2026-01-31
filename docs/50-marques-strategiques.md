# 50 Marques Stratégiques - Radar de Tendances

*Document créé via BMAD-Method - Dev*

## Date : 2025-01-26

---

## 📊 Vue d'Ensemble

**Total configuré** : 49 marques (Stradivarius exclue - lien suspect)

**Répartition par catégorie** :
- **Fast Fashion** : 11 marques (Priorité 1-2)
- **Sportswear** : 8 marques (Priorité 1-2)
- **Premium** : 10 marques (Priorité 2)
- **Luxury** : 11 marques (Priorité 3)
- **Streetwear** : 3 marques (Priorité 2-3)
- **Denim** : 4 marques (Priorité 1-3)
- **Marketplace** : 2 marques (Priorité 1-3)

---

## 🎯 Mass-Market & Fast Fashion (Priorité 1-2)

### Priorité 1 - Haute
- ✅ **Zara** (ES) - `zara.com`
- ✅ **H&M** (SE) - `hm.com`
- ✅ **ASOS** (UK) - `asos.com`
- ✅ **Uniqlo** (JP) - `uniqlo.com`

### Priorité 2
- ✅ **Mango** (ES) - `mango.com`
- ✅ **Bershka** (ES) - `bershka.com`
- ✅ **Pull&Bear** (ES) - `pullandbear.com`
- ✅ **Shein** (CN) - `shein.com`
- ✅ **Boohoo** (UK) - `fr.boohoo.com`
- ✅ **Urban Outfitters** (US) - `urbanoutfitters.com`

### Priorité 3
- ✅ **Primark** (IE) - `primark.com`

**Note** : Stradivarius exclue (lien suspect dans la liste originale)

---

## 🏃 Sportswear & Streetwear (Priorité 1-3)

### Priorité 1 - Haute
- ✅ **Nike** (US) - `nike.com`
- ✅ **Adidas** (DE) - `adidas.fr`

### Priorité 2
- ✅ **Puma** (DE) - `puma.com`
- ✅ **New Balance** (US) - `newbalance.fr`
- ✅ **The North Face** (US) - `thenorthface.fr`
- ✅ **Lacoste** (FR) - `lacoste.com`
- ✅ **Carhartt WIP** (US) - `carhartt-wip.com`
- ✅ **Vans** (US) - `vans.fr`

### Priorité 3
- ✅ **Champion** (US) - `championstore.com`
- ✅ **Dickies** (US) - `dickieslife.com`
- ✅ **Decathlon** (FR) - `decathlon.fr`

---

## 👖 Denim & Heritage (Priorité 1-3)

### Priorité 1 - Haute
- ✅ **Levi's** (US) - `levi.com`

### Priorité 2
- ✅ **Diesel** (IT) - `diesel.com`
- ✅ **Calvin Klein** (US) - `calvinklein.fr`

### Priorité 3
- ✅ **Lee** (US) - `lee.com`
- ✅ **Wrangler** (US) - `wrangler.com`

---

## 💎 Premium & Accessible Luxury (Priorité 2-3)

### Priorité 2
- ✅ **Sandro** (FR) - `sandro-paris.com`
- ✅ **Maje** (FR) - `maje.com`
- ✅ **The Kooples** (FR) - `thekooples.com`
- ✅ **Zadig & Voltaire** (FR) - `zadig-et-voltaire.com`
- ✅ **A.P.C.** (FR) - `apc.fr`
- ✅ **AMI Paris** (FR) - `amiparis.com`
- ✅ **Ralph Lauren** (US) - `ralphlauren.fr`
- ✅ **Tommy Hilfiger** (US) - `fr.tommy.com`
- ✅ **Jacquemus** (FR) - `jacquemus.com`

### Priorité 3
- ✅ **Ganni** (DK) - `ganni.com`

---

## 🛍️ Retailers Mondiaux (Priorité 1-3)

### Priorité 1 - Haute
- ✅ **Zalando** (DE) - `zalando.fr`

### Priorité 3
- ✅ **Galeries Lafayette** (FR) - `galerieslafayette.com`

---

## 💰 Luxe - Tendances de Fond (Priorité 3)

- ✅ **Louis Vuitton** (FR) - `louisvuitton.com`
- ✅ **Gucci** (IT) - `gucci.com`
- ✅ **Prada** (IT) - `prada.com`
- ✅ **Balenciaga** (ES) - `balenciaga.com`
- ✅ **Stone Island** (IT) - `stoneisland.com`
- ✅ **Off-White** (US) - `off---white.com`
- ✅ **Supreme** (US) - `supreme.com`
- ✅ **Celine** (FR) - `celine.com`
- ✅ **Saint Laurent** (FR) - `ysl.com`
- ✅ **Moncler** (IT) - `moncler.com`

---

## 🔧 Configuration Technique

### URLs Spécifiques

**Note importante** : Pour certaines marques (Zara, H&M), le scraping direct de l'URL racine ne suffit pas. Les agents ciblent les sous-pages spécifiques :

#### Zara
- New In : `/fr/fr/categorie/femme/nouveautes-c358009.html`
- Best Sellers : `/fr/fr/categorie/femme/c358009.html`

#### H&M
- New In : `/fr_fr/ladies/shop-by-product/view-all.html?sort=news`
- Best Sellers : `/fr_fr/ladies/shop-by-product/view-all.html?sort=popularity`

#### ASOS
- New In : `/new-in/ctas/?nlid=nav|header|new+in`
- Best Sellers : `/best-sellers/ctas/?nlid=nav|header|best+sellers`

### Sélecteurs CSS

Les sélecteurs sont configurés par marque dans la table `ScrapableBrand` :
- `productSelector` : Sélecteur pour les conteneurs de produits
- `nameSelector` : Sélecteur pour le nom du produit
- `priceSelector` : Sélecteur pour le prix
- `imageSelector` : Sélecteur pour l'image

**Note** : Les sélecteurs peuvent nécessiter des ajustements selon les mises à jour des sites web.

---

## 📈 Priorités de Scraping

### Priorité 1 (Haute) - Scrapées en premier
- Zara, H&M, ASOS, Uniqlo
- Nike, Adidas
- Levi's
- Zalando

**Total** : 8 marques

### Priorité 2 (Moyenne) - Scrapées ensuite
- Mango, Bershka, Pull&Bear, Shein, Boohoo, Urban Outfitters
- Puma, New Balance, The North Face, Lacoste, Carhartt WIP, Vans
- Diesel, Calvin Klein
- Sandro, Maje, The Kooples, Zadig & Voltaire, A.P.C., AMI Paris, Ralph Lauren, Tommy Hilfiger, Jacquemus

**Total** : 25 marques

### Priorité 3 (Basse) - Scrapées en dernier
- Primark
- Champion, Dickies, Decathlon
- Lee, Wrangler
- Ganni
- Galeries Lafayette
- Toutes les marques de luxe (10 marques)

**Total** : 16 marques

---

## 🚀 Utilisation

### Ajouter les marques dans la base

```bash
npm run add:strategic-brands
```

### Scraper les tendances

```bash
# Via l'interface web
POST /api/trends/scan-big-brands

# Via CRON (automatique quotidien)
# Configuré dans vercel.json : "0 6 * * *"
```

### Vérifier les marques configurées

```bash
npm run db:studio
# Aller dans la table ScrapableBrand
```

---

## 📝 Notes Techniques

1. **Sélecteurs CSS** : Les sélecteurs sont des estimations basées sur les structures typiques. Ils peuvent nécessiter des ajustements après test.

2. **URLs dynamiques** : Certaines marques utilisent des URLs dynamiques avec paramètres. Les URLs configurées sont testées mais peuvent changer.

3. **Anti-scraping** : Certaines marques (luxury notamment) peuvent avoir des protections anti-scraping. À surveiller.

4. **Rate Limiting** : Le scraper inclut des délais entre les requêtes pour éviter la surcharge des serveurs.

5. **Mise à jour** : Les sélecteurs et URLs doivent être vérifiés régulièrement (mensuellement recommandé).

---

## ✅ Statut

- ✅ **49 marques configurées** dans la base de données
- ✅ **Priorités définies** selon l'importance stratégique
- ✅ **Catégories assignées** pour filtrage
- ✅ **URLs spécifiques** configurées pour New In et Best Sellers
- ✅ **Sélecteurs CSS** estimés (à valider par test)

---

**Créé via BMAD-Method** 🎯
