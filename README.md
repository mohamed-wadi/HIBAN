# Ask Hiban

Une application React pour poser des questions à Hiban avec un système de stockage persistant.

## Installation

1. Installer les dépendances :
```bash
npm install
```

## Utilisation

### Développement

Vous devez démarrer le serveur backend et le frontend dans deux terminaux séparés :

**Terminal 1 - Backend (port 3001) :**
```bash
npm run server
```

**Terminal 2 - Frontend (port 3000) :**
```bash
npm start
```

### Production

1. Construire l'application :
```bash
npm run build
```

2. Démarrer le serveur :
```bash
npm run server
```

Le serveur backend stocke les questions dans `data/questions.json` et les synchronise entre tous les appareils et navigateurs qui accèdent à l'application.

## Configuration

Par défaut, le backend écoute sur le port 3001. Pour changer le port, définissez la variable d'environnement `PORT` :
```bash
PORT=3002 npm run server
```

Pour le frontend, vous pouvez définir `REACT_APP_API_URL` pour pointer vers un serveur différent :
```bash
REACT_APP_API_URL=http://votre-serveur:3001 npm start
```

## Fonctionnalités

- Ajout de questions
- Stockage persistant sur serveur (synchronisé entre tous les appareils)
- Stockage local en cache pour performance
- Mode "Face to Face" avec PIN
- Révélation progressive des questions
- Suppression sécurisée avec mot de passe
