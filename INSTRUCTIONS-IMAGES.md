# Instructions pour ajouter les images de mode

## Méthode 1 : Copie manuelle (Recommandée)

1. **Ouvrez l'Explorateur de fichiers Windows**

2. **Trouvez vos 5 images de mode** (celles que vous avez fournies)

3. **Créez le dossier** (s'il n'existe pas déjà) :
   ```
   C:\Users\Admin\Desktop\MEDIA BIANGORY - CURSOR V1\public\fashion
   ```

4. **Copiez vos 5 images** dans ce dossier et **renommez-les** :
   - `fashion-1.png` (Mode urbaine contemporaine)
   - `fashion-2.png` (Style professionnel élégant)
   - `fashion-3.png` (Vêtement de mode)
   - `fashion-4.png` (Mode streetwear)
   - `fashion-5.png` (Style mode urbain)

5. **Rafraîchissez votre navigateur** - les images devraient s'afficher automatiquement !

## Méthode 2 : Utiliser le script PowerShell

1. **Ouvrez PowerShell** dans le dossier du projet

2. **Exécutez le script** :
   ```powershell
   .\scripts\copy-fashion-images.ps1
   ```

   Le script cherchera automatiquement les images et les copiera dans `public/fashion/`

## Méthode 3 : Glisser-Déposer dans VS Code/Cursor

1. **Ouvrez le dossier** `public/fashion` dans l'explorateur de fichiers de VS Code/Cursor

2. **Glissez-déposez** vos 5 images directement dans ce dossier

3. **Renommez-les** en `fashion-1.png`, `fashion-2.png`, etc.

## Vérification

Une fois les images copiées, vous devriez voir :
- ✅ Les images s'affichent dans la galerie sur la page d'accueil
- ✅ Les animations au survol fonctionnent
- ✅ Les placeholders (emojis) disparaissent

## Emplacement des fichiers

Le dossier `public/fashion/` doit contenir :
```
public/
  fashion/
    ├── fashion-1.png
    ├── fashion-2.png
    ├── fashion-3.png
    ├── fashion-4.png
    └── fashion-5.png
```

## Note importante

Les images doivent être au format PNG et avoir des noms exacts : `fashion-1.png` à `fashion-5.png` (en minuscules).
