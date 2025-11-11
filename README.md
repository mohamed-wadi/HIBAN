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

## Dépannage

### Erreur "Cannot sync with server. Changes saved locally only."

Si vous voyez ce message, cela signifie que le frontend ne peut pas se connecter au serveur backend. Voici les étapes pour résoudre le problème :

1. **Vérifier que le serveur backend est démarré** :
   - Ouvrez un terminal et exécutez `npm run server`
   - Vous devriez voir : `Server running on http://localhost:3001`

2. **Vérifier que le frontend utilise la bonne URL** :
   - Par défaut, le frontend essaie de se connecter à `http://localhost:3001`
   - Si vous accédez depuis un autre appareil (téléphone, autre ordinateur), vous devez utiliser l'adresse IP de votre machine au lieu de `localhost`
   - Exemple : `REACT_APP_API_URL=http://192.168.1.100:3001 npm start`

3. **Pour accéder depuis un autre appareil sur le même réseau** :
   - Trouvez l'adresse IP de votre machine :
     - Windows : `ipconfig` (cherchez "IPv4 Address")
     - Mac/Linux : `ifconfig` ou `ip addr`
   - Sur l'autre appareil, utilisez cette adresse IP dans l'URL du frontend
   - Ou configurez le frontend avec : `REACT_APP_API_URL=http://[votre-ip]:3001 npm start`

4. **Vérifier le firewall** :
   - Assurez-vous que le port 3001 n'est pas bloqué par le firewall
   - Sur Windows, vous devrez peut-être autoriser Node.js dans le pare-feu

5. **Vérifier la console du navigateur** :
   - Ouvrez les outils de développement (F12)
   - Regardez l'onglet "Console" pour voir les erreurs détaillées
   - Regardez l'onglet "Network" pour voir si les requêtes échouent
