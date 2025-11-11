# Guide de déploiement sur Netlify

## Paramètres de build dans Netlify

Dans les paramètres de build de votre site Netlify, configurez :

### Build settings

- **Branch to deploy**: `master` (ou la branche que vous utilisez)
- **Base directory**: (laissez vide - le projet est à la racine)
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Functions directory**: `netlify/functions`

## Configuration automatique

Le fichier `netlify.toml` est déjà configuré pour :
- Rediriger les requêtes `/api/*` vers les Netlify Functions
- Utiliser le dossier `build` comme répertoire de publication
- Utiliser `netlify/functions` pour les fonctions serverless

## Fonctionnalités

- ✅ Le frontend React sera déployé automatiquement
- ✅ Les Netlify Functions remplacent le serveur Express
- ✅ L'application détecte automatiquement qu'elle est sur Netlify
- ✅ Les données sont stockées en mémoire (non persistantes entre les redémarrages)

## Limitations actuelles

⚠️ **Important**: Les Netlify Functions utilisent un stockage en mémoire, ce qui signifie que les données ne persistent pas entre les redémarrages des fonctions. Pour un stockage persistant, vous devriez utiliser :
- Une base de données (MongoDB, PostgreSQL, etc.)
- Un service de stockage (FaunaDB, Supabase, etc.)
- Ou continuer à utiliser localStorage côté client

## Déploiement

1. Connectez votre dépôt GitHub à Netlify
2. Les paramètres de build seront détectés automatiquement depuis `netlify.toml`
3. Netlify construira et déploiera automatiquement votre application

## Variables d'environnement (optionnel)

Si vous voulez forcer une URL API spécifique, vous pouvez ajouter dans Netlify :
- **Variable**: `REACT_APP_API_URL`
- **Valeur**: L'URL de votre API (ex: `https://votre-api.com`)

Laissez cette variable vide pour utiliser la détection automatique.

